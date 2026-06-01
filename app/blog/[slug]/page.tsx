import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { marked } from "marked";

// ISR: each post page is cached and regenerated at most once per 60s.
export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.post.findUnique({
    where: { slug },
  });

  if (!post || !post.published) {
    return {
      title: "Yazı Bulunamadı",
    };
  }

  return {
    title: `${post.title} — Samet Güler`,
    description: post.summary || `${post.title} makalesi, teknik notlar ve rehber.`,
    openGraph: {
      title: post.title,
      description: post.summary || undefined,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      locale: post.lang === "tr" ? "tr_TR" : "en_US",
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await db.post.findUnique({
    where: { slug },
  });

  // If post doesn't exist or is not published, trigger Next.js notFound()
  if (!post || !post.published) {
    notFound();
  }

  // Parse markdown content synchronously
  const htmlContent = marked.parse(post.content);

  // Calculate read time
  const wordsPerMinute = 200;
  const wordCount = post.content.split(/\s+/).length;
  const readTimeMinutes = Math.ceil(wordCount / wordsPerMinute);
  const readTimeLabel = post.lang === "tr" ? `${readTimeMinutes} dk okuma` : `${readTimeMinutes} min read`;
  const backLabel = post.lang === "tr" ? "Blog Listesine Dön" : "Back to Blog";

  // Deterministic on-brand gradient when no cover image
  const covers = [
    "linear-gradient(135deg, #10132a 0%, #2a2150 100%)",
    "linear-gradient(135deg, #0d1430 0%, #1d2c60 100%)",
    "linear-gradient(135deg, #181230 0%, #3a2358 100%)",
    "linear-gradient(135deg, #0c1626 0%, #243a6b 100%)",
    "linear-gradient(135deg, #14122e 0%, #322a64 100%)",
  ];
  let hash = 0;
  for (let i = 0; i < post.slug.length; i++) hash = (hash * 31 + post.slug.charCodeAt(i)) >>> 0;
  const coverGradient = covers[hash % covers.length];

  return (
    <div className="min-h-screen bg-[#080a12] text-[#edeff8] relative py-16 px-4 md:px-8 flex flex-col justify-between overflow-x-hidden">
      {/* Background radial glow */}
      <div 
        className="absolute top-[-10%] right-[-10%] w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(139, 147, 255, 0.06), transparent 60%)",
          filter: "blur(50px)"
        }}
      />
      <div 
        className="absolute bottom-[-10%] left-[-10%] w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(139, 147, 255, 0.04), transparent 60%)",
          filter: "blur(50px)"
        }}
      />

      <div className="max-w-2xl w-full mx-auto z-10 flex-grow flex flex-col justify-center">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#969bb0] hover:text-[#8b93ff] transition-colors group">
            <ArrowLeft size={14} className="transform group-hover:-translate-x-1 transition-transform" />
            {backLabel}
          </Link>
        </div>

        {/* Cover */}
        <div className="mb-10 rounded-2xl overflow-hidden border border-[#edeff8]/10 aspect-[16/9] relative">
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: coverGradient }}>
              <span className="serif text-8xl font-bold text-white/10 select-none">
                {post.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080a12]/60 to-transparent" />
        </div>

        {/* Article Header */}
        <header className="mb-10 pb-8 border-b border-[#edeff8]/5">
          <div className="flex items-center gap-4 text-xs font-mono text-[#969bb0] mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              {new Date(post.createdAt).toLocaleDateString(post.lang === "tr" ? "tr-TR" : "en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="text-[#565b72]">•</span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} />
              {readTimeLabel}
            </span>
          </div>

          <h1 className="serif text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
            {post.title}
          </h1>

          {post.summary && (
            <p className="text-base text-[#969bb0] font-sans leading-relaxed italic">
              {post.summary}
            </p>
          )}
        </header>

        {/* Article Body */}
        <article className="prose prose-invert max-w-none">
          <div 
            className="blog-content font-sans text-base text-[#edeff8]/90 leading-relaxed space-y-6"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </article>
      </div>

      {/* Footer */}
      <footer className="footer z-10 mt-16 pt-8 text-center text-xs text-[#565b72] font-mono border-t border-[#edeff8]/5">
        {post.lang === "tr" 
          ? "© 2026 Samet Güler — Tüm hakları saklıdır" 
          : "© 2026 Samet Güler — All rights reserved"}
      </footer>
    </div>
  );
}
