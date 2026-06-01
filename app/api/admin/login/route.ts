import { NextResponse } from "next/server";
import { signJWT } from "@/lib/auth";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";

function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Turnstile not configured → skip (graceful)
  if (!token) return false;

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // 1) Rate limit: max 5 attempts per IP per minute
    const limit = rateLimit(`login:${ip}`, 5, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: `Çok fazla deneme. ${limit.retryAfter} saniye sonra tekrar deneyin.` },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const { username, password, turnstileToken } = await request.json();

    // 2) Bot verification (Cloudflare Turnstile) — skipped if not configured
    const human = await verifyTurnstile(turnstileToken, ip);
    if (!human) {
      return NextResponse.json(
        { success: false, error: "Doğrulama başarısız. Lütfen tekrar deneyin." },
        { status: 400 }
      );
    }

    const envUsername = process.env.ADMIN_USERNAME || "admin";
    const envPassword = process.env.ADMIN_PASSWORD;

    if (!envPassword) {
      return NextResponse.json(
        { success: false, error: "Server error: Admin password is not set in environment." },
        { status: 500 }
      );
    }

    if (username === envUsername && password === envPassword) {
      resetRateLimit(`login:${ip}`); // clear attempts on success
      const token = await signJWT({ username });

      const response = NextResponse.json({ success: true });
      
      // Session cookie: no maxAge/expires → cleared when the browser closes.
      // Combined with the short-lived JWT, the admin must re-authenticate
      // after closing the browser or after the token expires.
      response.cookies.set({
        name: "admin_session",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: "Invalid credentials" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
