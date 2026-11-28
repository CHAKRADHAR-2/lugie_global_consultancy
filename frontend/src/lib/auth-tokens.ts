const ACCESS_TOKEN_KEY = "lugie_access_token";
const REFRESH_TOKEN_KEY = "lugie_refresh_token";

export interface StoredTokens {
  access_token?: string | null;
  refresh_token?: string | null;
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthTokens(tokens: StoredTokens): void {
  if (typeof window === "undefined") return;
  try {
    if (tokens.access_token) {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    }
    if (tokens.refresh_token) {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
    }
  } catch {
    // Storage unavailable (private mode or quota)
  }
}

export function clearAuthTokens(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Ignore
  }
}

export async function refreshSessionTokens(): Promise<StoredTokens | null> {
  const refreshToken = getRefreshToken();
  const headers: Record<string, string> = {};
  if (refreshToken) {
    headers["Authorization"] = `Bearer ${refreshToken}`;
  }

  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json().catch(() => null);
  if (data?.access_token) {
    setAuthTokens({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
    return data;
  }
  return null;
}

export async function openAuthenticatedUrl(url: string, fallbackFilename?: string): Promise<void> {
  if (typeof window === "undefined") return;

  // External signed URLs (e.g., S3 presigned URLs) can open directly
  if (!url.startsWith("/")) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  const fetchWithAuth = async (token: string | null) => {
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return fetch(url, {
      headers,
      credentials: "include",
    });
  };

  let res = await fetchWithAuth(getAccessToken());
  if (res.status === 401) {
    const refreshed = await refreshSessionTokens();
    if (refreshed?.access_token) {
      res = await fetchWithAuth(refreshed.access_token);
    }
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
    throw new Error(detail || `HTTP error: ${res.status}`);
  }

  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const opened = window.open(blobUrl, "_blank", "noopener,noreferrer");
  if (!opened) {
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fallbackFilename || "document";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
}
