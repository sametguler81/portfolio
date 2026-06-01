import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const sessionCookie = request.cookies.get("admin_session");

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const payload = await verifyJWT(sessionCookie.value);
    if (!payload) {
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.set({
        name: "admin_session",
        value: "",
        httpOnly: true,
        expires: new Date(0),
        path: "/",
      });
      return response;
    }
  }

  // Protect backend write routes (posts write methods + image upload)
  const isPostWrite = pathname.startsWith("/api/posts") && request.method !== "GET";
  const isUpload = pathname.startsWith("/api/upload");
  if (isPostWrite || isUpload) {
    const sessionCookie = request.cookies.get("admin_session");
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const payload = await verifyJWT(sessionCookie.value);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/posts/:path*", "/api/upload/:path*"],
};
