/**
 * API client for the BFF proxy.
 * All requests go through /api/proxy/[...path] which injects auth and validates CSRF.
 */

import {
  clearAuthTokens,
  getAccessToken,
  refreshSessionTokens,
} from "@/lib/auth-tokens";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface ApiOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options?: ApiOptions,
): Promise<T> {
  const url = new URL(`/api/proxy/${path.replace(/^\//, "")}`, window.location.origin);

  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  const accessToken = getAccessToken();
  if (accessToken && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // Add CSRF token for state-changing requests
  if (method !== "GET") {
    const csrf = getCsrfToken();
    if (csrf) {
      headers["X-CSRF-Token"] = csrf;
    }
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  // Handle 401 — try refresh once
  if (res.status === 401) {
    const refreshed = await refreshSessionTokens();

    if (refreshed?.access_token) {
      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${refreshed.access_token}`,
      };
      // Retry original request
      const retryRes = await fetch(url.toString(), {
        method,
        headers: retryHeaders,
        body: body ? JSON.stringify(body) : undefined,
        credentials: "include",
      });

      if (!retryRes.ok) {
        const rawText = await retryRes.text().catch(() => "");
        let detail = "";
        try {
          const parsed = JSON.parse(rawText);
          detail = typeof parsed?.detail === "string" ? parsed.detail : "";
        } catch {
          detail = rawText.trim();
        }
        throw new ApiError(retryRes.status, detail || `HTTP error: ${retryRes.status}`);
      }
      if (retryRes.status === 204) return undefined as T;
      return retryRes.json();
    }

    clearAuthTokens();
    // Refresh also failed — redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(401, "Session expired");
  }

  if (!res.ok) {
    const rawText = await res.text().catch(() => "");
    let detail = "";
    try {
      const parsed = JSON.parse(rawText);
      detail = typeof parsed?.detail === "string" ? parsed.detail : "";
    } catch {
      detail = rawText.trim();
    }
    throw new ApiError(res.status, detail || `HTTP error: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const api = {
  get: <T>(path: string, options?: ApiOptions) => request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: ApiOptions) =>
    request<T>("POST", path, body, options),
  put: <T>(path: string, body?: unknown, options?: ApiOptions) =>
    request<T>("PUT", path, body, options),
  patch: <T>(path: string, body?: unknown, options?: ApiOptions) =>
    request<T>("PATCH", path, body, options),
  delete: <T>(path: string, options?: ApiOptions) =>
    request<T>("DELETE", path, undefined, options),
};
