import { NextResponse } from "next/server";

const BUCKET = "blog-images";
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Görsel yükleme yapılandırılmamış. .env içine NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY ekleyin ve 'blog-images' adında public bir bucket oluşturun.",
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: "Dosya bulunamadı." }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Yalnızca JPG, PNG, WebP, AVIF veya GIF yükleyebilirsiniz." },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { success: false, error: "Görsel 4 MB'tan küçük olmalı." },
        { status: 400 }
      );
    }

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();

    const uploadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": file.type,
          "x-upsert": "true",
          "cache-control": "31536000",
        },
        body: arrayBuffer,
      }
    );

    if (!uploadRes.ok) {
      const detail = await uploadRes.text();
      return NextResponse.json(
        { success: false, error: `Yükleme başarısız (${uploadRes.status}). 'blog-images' bucket'ı public mi? Detay: ${detail.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
