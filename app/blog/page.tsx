import type { Metadata } from "next";
import BlogIndex from "@/components/blog-index";
import { db } from "@/lib/db";

// ISR: page HTML is cached and regenerated at most once per 60s,
// so visitors never wait on a live DB query.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog — Samet Güler | Bilgisayar Mühendisi",
  description:
    "Yazılım mühendisliği, kurumsal ERP entegrasyonu, web ve mobil teknolojileri, IoT ve veritabanı sistemleri üzerine teknik yazılar, kılavuzlar ve notlar.",
  keywords: [
    "Blog",
    "Yazılım Mühendisliği Blog",
    "Samet Güler Blog",
    "Bilgisayar Mühendisliği Makaleleri",
    "ERP Makaleleri",
    "Flutter Mobil Geliştirme",
    "IoT Otomasyon Kılavuzu",
  ],
  openGraph: {
    title: "Blog — Samet Güler",
    description:
      "Yazılım mühendisliği, kurumsal ERP entegrasyonu, web ve mobil teknolojileri, IoT ve veritabanı sistemleri üzerine teknik yazılar ve kılavuzlar.",
    type: "website",
  },
};

export default async function BlogPage() {
  const rows = await db.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  const posts = rows.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    summary: p.summary,
    content: p.content,
    lang: p.lang,
    coverImage: p.coverImage,
    createdAt: p.createdAt.toISOString(),
  }));

  return <BlogIndex posts={posts} />;
}
