import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const res = await fetch(`${INTERNAL_API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Login failed" }));
    return NextResponse.json(error, { status: res.status });
  }

  const data = await res.json();
  const cookieStore = await cookies();

  // Set httpOnly cookies — tokens never sent to browser JS
  cookieStore.set("access_token", data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 minutes
  });

  cookieStore.set("refresh_token", data.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/refresh", // Only sent to refresh endpoint
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  // CSRF token — readable by JS (not httpOnly), but SameSite protects against CSRF
  cookieStore.set("csrf_token", data.csrf_token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });

  // Return user data only — no tokens in response body
  return NextResponse.json({ user: data.user });
}
