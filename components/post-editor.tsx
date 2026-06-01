"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Edit3, AlertCircle, ImagePlus, X, Loader2 } from "lucide-react";
import { marked } from "marked";
import { motion } from "framer-motion";

function slugify(text: string) {
  const trMap: Record<string, string> = {
    ç: "c", Ç: "c",
    ğ: "g", Ğ: "g",
    ı: "i", I: "i", İ: "i",
    ö: "o", Ö: "o",
    ş: "s", Ş: "s",
    ü: "u", Ü: "u",
  };
  
  let str = text.toString();
  for (const key in trMap) {
    str = str.replace(new RegExp(key, "g"), trMap[key]);
  }
  
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export default function PostEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get("id");

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [lang, setLang] = useState("tr");
  const [coverImage, setCoverImage] = useState("");
  const [published, setPublished] = useState(false);

  // UI states
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [slugModified, setSlugModified] = useState(false);

  // Fetch post details if in edit mode
  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      setFetching(true);
      try {
        const response = await fetch(`/api/posts/${postId}`);
        if (response.ok) {
          const data = await response.json();
          const { post } = data;
          setTitle(post.title);
          setSlug(post.slug);
          setSummary(post.summary);
          setContent(post.content);
          setLang(post.lang);
          setCoverImage(post.coverImage || "");
          setPublished(post.published);
          setSlugModified(true); // Don't auto-regenerate slug for existing posts
        } else {
          setError("Yazı detayları yüklenemedi.");
        }
      } catch (err) {
        setError("Veri alınırken bir bağlantı hatası oluştu.");
      } finally {
        setFetching(false);
      }
    };

    fetchPost();
  }, [postId]);

  // Auto slugify title if slug wasn't manually edited
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!slugModified) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setSlugModified(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.success) {
        setCoverImage(data.url);
      } else {
        setError(data.error || "Görsel yüklenemedi.");
      }
    } catch {
      setError("Görsel yüklenirken bağlantı hatası oluştu.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!title.trim() || !slug.trim() || !content.trim()) {
      setError("Başlık, URL (Slug) ve İçerik alanları zorunludur.");
      setLoading(false);
      return;
    }

    try {
      const url = postId ? `/api/posts/${postId}` : "/api/posts";
      const method = postId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          summary,
          content,
          lang,
          coverImage: coverImage || null,
          published,
        }),
      });

      if (response.ok) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || "Yazı kaydedilirken bir hata oluştu.");
      }
    } catch (err) {
      setError("Bağlantı hatası oluştu. Tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // Convert markdown content to HTML safely
  const renderMarkdown = () => {
    try {
      return { __html: marked.parse(content || "*İçerik henüz boş...*") };
    } catch (e) {
      return { __html: "Önizleme oluşturulurken hata oluştu." };
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#080a12] text-[#edeff8] flex flex-col items-center justify-center gap-4">
        <svg className="animate-spin h-8 w-8 text-[#8b93ff]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="font-mono text-xs uppercase tracking-widest text-[#969bb0]">Yazı Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080a12] text-[#edeff8] relative py-12 px-4 md:px-8">
      {/* Background radial glow */}
      <div 
        className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(139, 147, 255, 0.05), transparent 60%)",
          filter: "blur(50px)"
        }}
      />

      <div className="max-w-6xl w-full mx-auto z-10 relative">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#969bb0] hover:text-[#8b93ff] transition-colors group">
            <ArrowLeft size={14} className="transform group-hover:-translate-x-1 transition-transform" />
            Panele Geri Dön
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <span className="eyebrow text-xs text-[#8b93ff] font-mono tracking-widest uppercase">
            {postId ? "YAZI DÜZENLE" : "YENİ YAZI EKLE"}
          </span>
          <h1 className="serif text-3xl font-bold text-white mt-1">
            {postId ? "Blog Yazısını Güncelle" : "Yeni Blog Yazısı Oluştur"}
          </h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3 text-red-400">
            <AlertCircle size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-sans font-medium text-[#edeff8]/80 mb-2">
                Yazı Başlığı <span className="text-[#8b93ff]">*</span>
              </label>
              <input
                type="text"
                id="title"
                required
                value={title}
                onChange={handleTitleChange}
                className="form-input w-full bg-[#141826]/40 border border-[#edeff8]/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8b93ff] transition-colors"
                placeholder="Örn. Web Uygulamalarında Performans Optimizasyonu"
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-sans font-medium text-[#edeff8]/80 mb-2">
                URL Adresi (Slug) <span className="text-[#8b93ff]">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-[#565b72] text-sm font-mono">
                  /blog/
                </span>
                <input
                  type="text"
                  id="slug"
                  required
                  value={slug}
                  onChange={handleSlugChange}
                  className="form-input w-full bg-[#141826]/40 border border-[#edeff8]/10 rounded-xl pl-16 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#8b93ff] transition-colors font-mono"
                  placeholder="performans-optimizasyonu"
                />
              </div>
            </div>

            {/* Summary */}
            <div>
              <label htmlFor="summary" className="block text-sm font-sans font-medium text-[#edeff8]/80 mb-2">
                Özet / Alt Başlık
              </label>
              <input
                type="text"
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="form-input w-full bg-[#141826]/40 border border-[#edeff8]/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8b93ff] transition-colors"
                placeholder="Örn. Next.js ile sayfa yükleme sürelerini optimize etme teknikleri."
              />
            </div>

            {/* Editor & Preview Tabs (Mobile/Tablet helper, or simple layout toggle) */}
            <div>
              {/* Liquid-glass segmented toggle */}
              <div className="mb-4">
                <div className="liquid-tabs">
                  {([
                    { key: "edit" as const, label: "Editör", Icon: Edit3 },
                    { key: "preview" as const, label: "Önizleme", Icon: Eye },
                  ]).map(({ key, label, Icon }) => {
                    const active = activeTab === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setActiveTab(key)}
                        className={`liquid-tab ${active ? "is-active" : ""}`}
                        aria-pressed={active}
                      >
                        {active && (
                          <motion.span
                            layoutId="editorTabPill"
                            className="liquid-tab-pill"
                            transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.7 }}
                          />
                        )}
                        <span className="liquid-tab-content">
                          <Icon size={13} />
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeTab === "edit" ? (
                <div>
                  <textarea
                    id="content"
                    rows={16}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="form-input w-full bg-[#141826]/40 border border-[#edeff8]/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8b93ff] transition-colors font-mono resize-y"
                    placeholder="İçeriğinizi Markdown formatında yazın...
Örn:
# Başlık 1
Bu bir paragraftır. **Kalın yazı**, *italik yazı*.

- Madde 1
- Madde 2"
                  />
                </div>
              ) : (
                <div 
                  className="request-card w-full overflow-y-auto max-h-[500px] prose prose-invert font-sans text-sm text-[#edeff8]/80 leading-relaxed"
                  style={{ minHeight: "356px" }}
                >
                  <div 
                    className="markdown-preview"
                    dangerouslySetInnerHTML={renderMarkdown()} 
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            {/* Cover Image */}
            <div className="request-card space-y-4">
              <h3 className="serif text-lg font-bold text-white pb-2 border-b border-[#edeff8]/5">
                Kapak Görseli <span className="text-xs font-sans font-normal text-[#969bb0]">(opsiyonel)</span>
              </h3>

              {coverImage ? (
                <div className="relative group rounded-xl overflow-hidden border border-[#edeff8]/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverImage} alt="Kapak önizleme" className="w-full aspect-video object-cover" />
                  <button
                    type="button"
                    onClick={() => setCoverImage("")}
                    className="absolute top-2 right-2 bg-black/70 backdrop-blur text-white rounded-full p-1.5 hover:bg-red-500/80 transition-colors"
                    aria-label="Görseli kaldır"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label
                  className={`flex flex-col items-center justify-center gap-2 aspect-video rounded-xl border border-dashed border-[#edeff8]/15 bg-[#141826]/40 cursor-pointer hover:border-[#8b93ff]/50 transition-colors text-[#969bb0] ${uploading ? "pointer-events-none opacity-60" : ""}`}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={22} className="animate-spin text-[#8b93ff]" />
                      <span className="text-xs font-mono uppercase tracking-wider">Yükleniyor...</span>
                    </>
                  ) : (
                    <>
                      <ImagePlus size={22} className="text-[#8b93ff]" />
                      <span className="text-xs font-mono uppercase tracking-wider">Görsel Yükle</span>
                      <span className="text-[10px] text-[#565b72]">JPG / PNG / WebP · max 4MB</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploading} />
                </label>
              )}
              <p className="text-[11px] text-[#565b72] leading-relaxed">
                Görsel eklemezsen otomatik şık bir kapak oluşturulur.
              </p>
            </div>

            <div className="request-card space-y-6">
              <h3 className="serif text-lg font-bold text-white mb-2 pb-2 border-b border-[#edeff8]/5">
                Yayın Ayarları
              </h3>

              {/* Language */}
              <div>
                <label htmlFor="lang" className="block text-sm font-sans font-medium text-[#edeff8]/80 mb-2">
                  Dil (Language)
                </label>
                <div className="relative">
                  <select
                    id="lang"
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    className="form-select w-full bg-[#141826]/40 border border-[#edeff8]/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8b93ff] appearance-none cursor-pointer"
                  >
                    <option value="tr" className="bg-[#0d1019] text-[#edeff8]">Türkçe (TR)</option>
                    <option value="en" className="bg-[#0d1019] text-[#edeff8]">English (EN)</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#969bb0]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="block text-sm font-sans font-medium text-[#edeff8]">
                    Hemen Yayınla
                  </span>
                  <span className="block text-xs text-[#969bb0] font-sans mt-0.5">
                    İşaretlenmezse yazı taslak olarak kalır.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#141826] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#969bb0] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8b93ff] peer-checked:after:bg-neutral-900 border border-[#edeff8]/10"></div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="space-y-3 pt-4 border-t border-[#edeff8]/5">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-request inline-flex items-center justify-center gap-2"
                  style={{ minHeight: "46px" }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-neutral-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} className="fill-current" />
                      <span>Değişiklikleri Kaydet</span>
                    </>
                  )}
                </button>

                <Link
                  href="/admin/dashboard"
                  className="w-full inline-flex items-center justify-center text-xs font-mono uppercase tracking-wider text-[#969bb0] hover:text-[#edeff8] transition-colors py-3 border border-[#edeff8]/10 rounded-xl bg-[#141826]/30 text-center"
                >
                  İptal Et
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
