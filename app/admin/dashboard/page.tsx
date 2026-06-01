"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Globe, LogOut, FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface Post {
  id: number;
  title: string;
  slug: string;
  lang: string;
  published: boolean;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts?all=true");
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      } else {
        setError("Yazılar yüklenirken bir hata oluştu.");
      }
    } catch (err) {
      setError("Veriler alınamadı. İnternet bağlantınızı kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (response.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      alert("Çıkış yapılırken bir hata oluştu.");
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`"${title}" başlıklı yazıyı silmek istediğinize emin misiniz?`)) return;

    try {
      const response = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (response.ok) {
        setPosts(posts.filter((p) => p.id !== id));
      } else {
        alert("Yazı silinemedi.");
      }
    } catch (err) {
      alert("İşlem başarısız.");
    }
  };

  const handlePublishToggle = async (post: Post) => {
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...post,
          published: !post.published,
        }),
      });

      if (response.ok) {
        setPosts(
          posts.map((p) => (p.id === post.id ? { ...p, published: !p.published } : p))
        );
      }
    } catch (err) {
      alert("Yayın durumu güncellenemedi.");
    }
  };

  return (
    <div className="min-h-screen bg-[#080a12] text-[#edeff8] relative py-12 px-4 md:px-8">
      {/* Glow */}
      <div 
        className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(139, 147, 255, 0.05), transparent 60%)",
          filter: "blur(50px)"
        }}
      />

      <div className="max-w-5xl w-full mx-auto z-10 relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12 border-b border-[#edeff8]/5 pb-6">
          <div>
            <span className="eyebrow text-xs text-[#8b93ff] font-mono tracking-widest uppercase">
              YÖNETİM PANELİ
            </span>
            <h1 className="serif text-3xl font-bold text-white mt-1">Blog Yazıları</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/admin/posts" className="btn-request inline-flex items-center gap-2" style={{ padding: "8px 16px" }}>
              <Plus size={16} />
              <span>Yeni Yazı</span>
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#969bb0] hover:text-red-400 transition-colors px-3 py-2 border border-[#edeff8]/10 rounded-lg hover:border-red-400/20 bg-[#141826]/30"
            >
              <LogOut size={14} />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3 text-red-400">
            <AlertCircle size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Post List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-[#969bb0]">
            <svg className="animate-spin h-8 w-8 text-[#8b93ff]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-mono text-xs uppercase tracking-widest">Yazılar Yükleniyor...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="request-card text-center py-16 flex flex-col items-center">
            <FileText size={48} className="text-[#565b72] mb-4" />
            <h3 className="serif text-xl font-bold text-white mb-2">Henüz yazı bulunmuyor</h3>
            <p className="text-sm text-[#969bb0] max-w-sm mb-6">
              İlk blog yazınızı ekleyerek portföyünüzü zenginleştirin.
            </p>
            <Link href="/admin/posts" className="btn-request inline-flex items-center gap-2" style={{ padding: "8px 16px" }}>
              <Plus size={16} />
              <span>İlk Yazıyı Oluştur</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="request-card flex flex-col md:flex-row md:items-center justify-between gap-4"
                style={{ padding: "20px 24px" }}
              >
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      post.lang === "tr" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    }`}>
                      <Globe size={10} />
                      {post.lang === "tr" ? "TR" : "EN"}
                    </span>
                    
                    <button
                      onClick={() => handlePublishToggle(post)}
                      className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full uppercase tracking-wider transition-colors ${
                        post.published 
                          ? "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20" 
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                      }`}
                    >
                      <CheckCircle2 size={10} />
                      {post.published ? "YAYINDA" : "TASLAK"}
                    </button>

                    <span className="text-[11px] font-mono text-[#565b72]">
                      {new Date(post.createdAt).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <h3 className="serif text-lg font-bold text-white truncate pr-4">
                    {post.title}
                  </h3>
                  <p className="text-xs text-[#969bb0] font-mono truncate max-w-xl mt-1">
                    /{post.lang}/blog/{post.slug}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                  <Link
                    href={`/admin/posts?id=${post.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#969bb0] hover:text-[#8b93ff] transition-colors px-3 py-1.5 border border-[#edeff8]/10 rounded-lg hover:border-[#8b93ff]/20 bg-[#141826]/30"
                  >
                    <Edit2 size={12} />
                    <span>Düzenle</span>
                  </Link>

                  <button
                    onClick={() => handleDelete(post.id, post.title)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#969bb0] hover:text-red-400 transition-colors px-3 py-1.5 border border-[#edeff8]/10 rounded-lg hover:border-red-500/20 bg-[#141826]/30"
                  >
                    <Trash2 size={12} />
                    <span>Sil</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#969bb0] hover:text-[#8b93ff] transition-colors group">
            Portföye Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
