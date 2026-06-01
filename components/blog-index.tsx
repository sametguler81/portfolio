"use client";

import Link from "next/link";
import { useT } from "@/components/i18n";
import { ArrowLeft, Calendar, Clock, BookOpen, ArrowUpRight } from "lucide-react";

interface Post {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  lang: string;
  coverImage?: string | null;
  createdAt: string;
}

// Deterministic on-brand gradient for posts without a cover image
const COVERS = [
  "linear-gradient(135deg, #10132a 0%, #2a2150 100%)",
  "linear-gradient(135deg, #0d1430 0%, #1d2c60 100%)",
  "linear-gradient(135deg, #181230 0%, #3a2358 100%)",
  "linear-gradient(135deg, #0c1626 0%, #243a6b 100%)",
  "linear-gradient(135deg, #14122e 0%, #322a64 100%)",
];

function gradientFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return COVERS[h % COVERS.length];
}

export default function BlogIndex({ posts: allPosts }: { posts: Post[] }) {
  const { c, lang } = useT();
  // Posts are fetched server-side (ISR-cached) and filtered by active language here.
  const posts = allPosts.filter((p) => p.lang === lang);

  const getReadTime = (content: string) => {
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    return `${minutes} ${c.blog.readTime}`;
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="min-h-screen bg-[#080a12] text-[#edeff8] relative py-16 px-4 md:px-8 overflow-x-hidden">
      {/* Background glows */}
      <div
        className="absolute top-[-10%] right-[-10%] w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, rgba(139,147,255,0.08), transparent 60%)", filter: "blur(50px)" }}
      />

      <div className="max-w-5xl w-full mx-auto z-10 relative">
        {/* Back */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#969bb0] hover:text-[#8b93ff] transition-colors group">
            <ArrowLeft size={14} className="transform group-hover:-translate-x-1 transition-transform" />
            {c.blog.back}
          </Link>
        </div>

        {/* Title */}
        <div className="mb-12 max-w-2xl">
          <span className="eyebrow text-xs text-[#8b93ff] font-mono tracking-widest uppercase">BLOG</span>
          <h1 className="serif text-4xl md:text-5xl font-bold mt-3 mb-4 text-white tracking-tight">{c.blog.title}</h1>
          <p className="text-base text-[#969bb0] font-sans">{c.blog.subtitle}</p>
        </div>

        {/* Content */}
        {posts.length === 0 ? (
          <div className="request-card text-center py-16 flex flex-col items-center">
            <BookOpen size={48} className="text-[#565b72] mb-4" />
            <h3 className="serif text-xl font-bold text-white mb-2">
              {lang === "tr" ? "Henüz Yazı Yok" : "No Posts Yet"}
            </h3>
            <p className="text-sm text-[#969bb0] max-w-sm">{c.blog.noPosts}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {posts.map((post, i) => (
              <article
                key={post.id}
                className="blog-card-in"
                style={{ animationDelay: `${Math.min(i * 0.06, 0.4)}s` }}
              >
                <Link href={`/blog/${post.slug}`} className="group block h-full">
                  <div className="h-full flex flex-col rounded-2xl border border-[#edeff8]/10 bg-[#0d1019]/60 overflow-hidden transition-all duration-300 group-hover:border-[#8b93ff]/40 group-hover:-translate-y-1 group-hover:shadow-[0_18px_50px_rgba(139,147,255,0.10)]">
                    {/* Cover */}
                    <div className="relative aspect-[16/9] overflow-hidden">
                      {post.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
                          style={{ background: gradientFor(post.slug) }}
                        >
                          <span className="serif text-6xl font-bold text-white/10 select-none">
                            {post.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d1019]/80 via-transparent to-transparent" />
                      <span className="absolute top-3 left-3 text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-md bg-black/40 backdrop-blur border border-white/10 text-white/80">
                        {post.lang}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col flex-grow p-6">
                      <div className="flex items-center gap-3 text-[11px] font-mono text-[#969bb0] mb-3">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={11} /> {formatDate(post.createdAt)}
                        </span>
                        <span className="text-[#565b72]">•</span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={11} /> {getReadTime(post.content)}
                        </span>
                      </div>

                      <h2 className="serif text-xl font-bold text-white group-hover:text-[#8b93ff] transition-colors leading-snug mb-2">
                        {post.title}
                      </h2>

                      {post.summary && (
                        <p className="text-sm text-[#969bb0] font-sans leading-relaxed line-clamp-2">
                          {post.summary}
                        </p>
                      )}

                      <span className="mt-4 pt-4 border-t border-[#edeff8]/5 inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#8b93ff] opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                        {lang === "tr" ? "Oku" : "Read"} <ArrowUpRight size={13} />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer z-10 mt-16 pt-8 text-center text-xs text-[#565b72] font-mono border-t border-[#edeff8]/5 max-w-5xl mx-auto">
        {c.footer.left}
      </footer>
    </div>
  );
}
