/**
 * Next.js auth gating middleware/proxy.
 * Provides route-level auth gating as a UX convenience.
 */

import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/student", "/counsellor", "/admin"];
const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];

const ROLE_PREFIX_MAP: Record<string, string[]> = {
  "/admin": ["super_admin", "admin"],
  "/counsellor": ["counsellor", "super_admin", "admin"],
  "/student": ["student"],
};

const ROLE_DASHBOARD_MAP: Record<string, string> = {
  super_admin: "/admin/dashboard",
  admin: "/admin/dashboard",
  counsellor: "/counsellor/dashboard",
  student: "/student/dashboard",
};

const DEV_SECRET = "change-me";

async function verifyAccessToken(token: string): Promise<{ sub: string; role: string } | null> {
  try {
    const rawSecret = process.env.JWT_SECRET || process.env.SECRET_KEY || DEV_SECRET;
    const secret = new TextEncoder().encode(rawSecret);
    const { payload } = await jwtVerify(token, secret);
    if (payload.type !== "access") return null;
    return { sub: payload.sub as string, role: payload.role as string };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and API routes
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token")?.value;

  // Check if route is protected
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

  if (isProtected && !accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For protected routes with a token, verify validity and role
  if (isProtected && accessToken) {
    const verified = await verifyAccessToken(accessToken);
    if (!verified) {
      // Invalid or expired token
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("access_token");
      res.cookies.delete("csrf_token");
      return res;
    }

    const matchingPrefix = PROTECTED_PREFIXES.find((p) => pathname.startsWith(p));
    if (matchingPrefix && ROLE_PREFIX_MAP[matchingPrefix]) {
      const allowedRoles = ROLE_PREFIX_MAP[matchingPrefix];
      if (!allowedRoles.includes(verified.role)) {
        // Role mismatch: redirect to appropriate dashboard
        const target = ROLE_DASHBOARD_MAP[verified.role] || "/student/dashboard";
        return NextResponse.redirect(new URL(target, request.url));
      }
    }

    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && accessToken) {
    const verified = await verifyAccessToken(accessToken);
    if (verified) {
      const target = ROLE_DASHBOARD_MAP[verified.role] || "/student/dashboard";
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  return NextResponse.next();
}

export const middleware = proxy;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
