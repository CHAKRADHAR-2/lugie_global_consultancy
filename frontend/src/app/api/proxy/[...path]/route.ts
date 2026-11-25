import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://127.0.0.1:8000";

/**
 * Generic BFF proxy that forwards all /api/proxy/* requests to the backend.
 * - Reads access_token from httpOnly cookie and adds Bearer header
 * - Validates CSRF token for state-changing methods
 * - Handles 401 by attempting token refresh
 */
async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const backendPath = `/api/v1/${path.join("/")}`;
  const url = new URL(backendPath, INTERNAL_API_URL);

  // Copy query params
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  // CSRF check for state-changing requests (exempt public endpoints like leads/public and auth endpoints)
  const isPublicRoute = backendPath === "/api/v1/leads/public" || backendPath.startsWith("/api/v1/auth/");
  if (!isPublicRoute && ["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    const csrfCookie = cookieStore.get("csrf_token")?.value;
    const csrfHeader = request.headers.get("X-CSRF-Token");

    if (accessToken && (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader)) {
      return NextResponse.json({ detail: "CSRF token mismatch" }, { status: 403 });
    }
  }

  // Prepare headers
  const headers: Record<string, string> = {
    "Content-Type": request.headers.get("Content-Type") || "application/json",
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // Read body
  let body: string | undefined;
  if (["POST", "PUT", "PATCH"].includes(request.method)) {
    body = await request.text();
  }

  // Forward to backend
  const res = await fetch(url.toString(), {
    method: request.method,
    headers,
    body,
  });

  // Handle 401 — try refresh and retry once
  if (res.status === 401) {
    const refreshToken = cookieStore.get("refresh_token")?.value;
    if (refreshToken) {
      const refreshRes = await fetch(`${INTERNAL_API_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { Authorization: `Bearer ${refreshToken}` },
      });

      if (refreshRes.ok) {
        const newTokens = await refreshRes.json();

        // Update cookies
        cookieStore.set("access_token", newTokens.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 15 * 60,
        });

        cookieStore.set("refresh_token", newTokens.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/api/auth/refresh",
          maxAge: 7 * 24 * 60 * 60,
        });

        cookieStore.set("csrf_token", newTokens.csrf_token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 15 * 60,
        });

        // Retry with new access token
        headers["Authorization"] = `Bearer ${newTokens.access_token}`;
        const retryRes = await fetch(url.toString(), {
          method: request.method,
          headers,
          body,
        });

        const retryData = await retryRes.arrayBuffer();
        const retryHeaders = new Headers();
        const retryType = retryRes.headers.get("Content-Type") || "application/json";
        retryHeaders.set("Content-Type", retryType);
        const retryDisposition = retryRes.headers.get("Content-Disposition");
        if (retryDisposition) {
          retryHeaders.set("Content-Disposition", retryDisposition);
        }
        return new NextResponse(retryData, {
          status: retryRes.status,
          headers: retryHeaders,
        });
      }
    }
  }

  // Forward response as arrayBuffer so binary files (PDFs, images) are never corrupted
  const responseData = await res.arrayBuffer();
  const resHeaders = new Headers();
  const contentType = res.headers.get("Content-Type") || "application/json";
  resHeaders.set("Content-Type", contentType);
  const contentDisposition = res.headers.get("Content-Disposition");
  if (contentDisposition) {
    resHeaders.set("Content-Disposition", contentDisposition);
  }

  return new NextResponse(responseData, {
    status: res.status,
    headers: resHeaders,
  });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
