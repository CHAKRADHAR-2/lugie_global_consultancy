import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  // Try to call backend logout to revoke refresh tokens
  if (accessToken) {
    await fetch(`${INTERNAL_API_URL}/api/v1/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    }).catch(() => {
      // Best-effort — even if backend call fails, we clear cookies
    });
  }

  // Clear all auth cookies
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  cookieStore.delete("csrf_token");

  return NextResponse.json({ message: "Logged out successfully" });
}
