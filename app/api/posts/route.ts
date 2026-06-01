import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyJWT } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang");
    const all = searchParams.get("all") === "true";

    let showDrafts = false;
    if (all) {
      // Extract cookie manually since this is a server request header check
      const cookieHeader = request.headers.get("cookie") || "";
      const match = cookieHeader.match(/admin_session=([^;]+)/);
      const sessionToken = match ? match[1] : null;

      if (sessionToken) {
        const payload = await verifyJWT(sessionToken);
        if (payload) {
          showDrafts = true;
        }
      }
    }

    const whereClause: any = {};
    if (lang) {
      whereClause.lang = lang;
    }
    if (!showDrafts) {
      whereClause.published = true;
    }

    const posts = await db.post.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, summary, content, lang, coverImage, published } = body;

    if (!title || !slug || !content || !lang) {
      return NextResponse.json({ success: false, error: "Lütfen tüm zorunlu alanları doldurun." }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await db.post.findUnique({
      where: { slug },
    });
    if (existing) {
      return NextResponse.json({ success: false, error: "Bu URL (Slug) zaten kullanılıyor." }, { status: 400 });
    }

    const post = await db.post.create({
      data: {
        title,
        slug,
        summary: summary || "",
        content,
        lang,
        coverImage: coverImage || null,
        published: published || false,
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
