"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Script from "next/script";
import { Lock, User, AlertCircle } from "lucide-react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// Minimal Cloudflare Turnstile widget (no extra dependency).
function Turnstile({ onToken, resetKey }: { onToken: (t: string) => void; resetKey: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!SITE_KEY) return;
    let tries = 0;
    const iv = setInterval(() => {
      const ts = (window as unknown as { turnstile?: any }).turnstile;
      if (!ts || !ref.current) {
        if (++tries > 150) clearInterval(iv);
        return;
      }
      clearInterval(iv);
      // Remove a previous instance (e.g. after a failed login → resetKey++)
      if (widgetId.current) {
        try {
          ts.remove(widgetId.current);
        } catch {}
        widgetId.current = null;
      }
      ref.current.innerHTML = "";
      widgetId.current = ts.render(ref.current, {
        sitekey: SITE_KEY,
        theme: "dark",
        callback: (t: string) => onToken(t),
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      });
    }, 100);

    return () => clearInterval(iv);
  }, [onToken, resetKey]);

  if (!SITE_KEY) return null;
  return <div ref={ref} className="flex justify-center min-h-[70px]" />;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [resetKey, setResetKey] = useState(0);

  const onToken = useCallback((t: string) => setToken(t), []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (SITE_KEY && !token) {
      setError("Lütfen güvenlik doğrulamasını tamamlayın.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, turnstileToken: token }),
      });

      if (response.ok) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || "Giriş başarısız. Bilgilerinizi kontrol edin.");
        setToken("");
        setResetKey((k) => k + 1); // single-use token → refresh widget
      }
    } catch (err) {
      setError("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
      setToken("");
      setResetKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080a12] text-[#edeff8] relative flex items-center justify-center p-4 overflow-hidden">
      {SITE_KEY && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
      )}
      {/* Background radial glow */}
      <div 
        className="absolute w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(139, 147, 255, 0.08), transparent 60%)",
          filter: "blur(50px)"
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="request-card max-w-md w-full z-10"
      >
        <div className="text-center mb-8">
          <span className="eyebrow text-xs text-[#8b93ff] font-mono tracking-widest uppercase">
            YÖNETİCİ GİRİŞİ
          </span>
          <h1 className="serif text-3xl font-bold mt-3 mb-2 text-white tracking-tight">
            Admin Panel
          </h1>
          <p className="text-sm text-[#969bb0] font-sans">
            Portföy içeriklerini yönetmek için giriş yapın.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6 flex items-center gap-3 text-red-400 text-sm font-sans">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-sans font-medium text-[#edeff8]/80 mb-2">
              Kullanıcı Adı
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-[#969bb0]">
                <User size={16} />
              </span>
              <input
                type="text"
                id="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input w-full bg-[#141826]/40 border border-[#edeff8]/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#8b93ff] transition-colors"
                placeholder="Kullanıcı adınızı girin"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-sans font-medium text-[#edeff8]/80 mb-2">
              Şifre
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-[#969bb0]">
                <Lock size={16} />
              </span>
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input w-full bg-[#141826]/40 border border-[#edeff8]/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#8b93ff] transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Cloudflare Turnstile (renders only when site key is configured) */}
          <Turnstile onToken={onToken} resetKey={resetKey} />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-request relative overflow-hidden"
            style={{ display: "flex", gap: 8, minHeight: "46px", justifyContent: "center", alignItems: "center" }}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-neutral-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Giriş Yapılıyor...</span>
              </>
            ) : (
              <>
                <Lock size={16} className="fill-current" />
                <span>Giriş Yap</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
