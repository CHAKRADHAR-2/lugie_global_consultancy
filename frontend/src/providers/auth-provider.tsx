"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser, LoginRequest, RegisterRequest } from "@/types/auth";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  refreshSessionTokens,
  setAuthTokens,
} from "@/lib/auth-tokens";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<AuthUser>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user session cleanly on mount (returns 200 even when logged out)
  useEffect(() => {
    async function fetchUser() {
      try {
        const token = getAccessToken();
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch("/api/auth/session", {
          headers,
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.authenticated && data.user) {
            setUser(data.user);
            return;
          }
        }

        // Fall back to refresh token if access token was absent or expired
        if (getRefreshToken()) {
          const refreshed = await refreshSessionTokens();
          if (refreshed && (refreshed as { user?: AuthUser }).user) {
            setUser((refreshed as { user: AuthUser }).user);
            return;
          }
        }

        clearAuthTokens();
      } catch {
        // Network issue or unauthenticated
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const login = useCallback(async (data: LoginRequest): Promise<AuthUser> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(error.detail || "Login failed");
    }

    const result = await res.json();
    setAuthTokens({
      access_token: result.access_token,
      refresh_token: result.refresh_token,
    });
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Registration failed" }));
      throw new Error(error.detail || "Registration failed");
    }

    const result = await res.json();
    setAuthTokens({
      access_token: result.access_token,
      refresh_token: result.refresh_token,
    });
    setUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    await fetch("/api/auth/logout", {
      method: "POST",
      headers,
      credentials: "include",
    }).catch(() => undefined);
    clearAuthTokens();
    setUser(null);
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
