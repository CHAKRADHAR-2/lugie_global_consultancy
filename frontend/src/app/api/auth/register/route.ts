import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Register with backend
  const registerRes = await fetch(`${INTERNAL_API_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!registerRes.ok) {
    const error = await registerRes.json().catch(() => ({ detail: "Registration failed" }));
    return NextResponse.json(error, { status: registerRes.status });
  }

  // Auto-login after successful registration
  const loginRes = await fetch(`${INTERNAL_API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: body.email, password: body.password }),
  });

  if (!loginRes.ok) {
    // Registration succeeded but auto-login failed — still success
    const userData = await registerRes.json();
    return NextResponse.json({ user: userData }, { status: 201 });
  }

  const data = await loginRes.json();
  const cookieStore = await cookies();

  cookieStore.set("access_token", data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });

  cookieStore.set("refresh_token", data.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/refresh",
    maxAge: 7 * 24 * 60 * 60,
  });

  cookieStore.set("csrf_token", data.csrf_token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });

  return NextResponse.json({ user: data.user }, { status: 201 });
}
