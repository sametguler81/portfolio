import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isId = /^\d+$/.test(id);

    const post = await db.post.findFirst({
      where: isId ? { id: parseInt(id) } : { slug: id },
    });

    if (!post) {
      return NextResponse.json({ success: false, error: "Yazı bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id);
    const body = await request.json();
    const { title, slug, summary, content, lang, coverImage, published } = body;

    if (!title || !slug || !content || !lang) {
      return NextResponse.json({ success: false, error: "Lütfen tüm zorunlu alanları doldurun." }, { status: 400 });
    }

    const existing = await db.post.findFirst({
      where: {
        slug,
        NOT: { id: numericId },
      },
    });
    if (existing) {
      return NextResponse.json({ success: false, error: "Bu URL (Slug) başka bir yazı tarafından kullanılıyor." }, { status: 400 });
    }

    const post = await db.post.update({
      where: { id: numericId },
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id);

    await db.post.delete({
      where: { id: numericId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
