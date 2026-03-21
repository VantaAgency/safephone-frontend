"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useSession, authClient } from "./client";
import { setAuthTokenGetter } from "@/lib/api/client";

interface AuthContextValue {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
  } | null;
  isPending: boolean;
  isAuthenticated: boolean;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSession();
  const tokenCacheRef = useRef<{ token: string | null; expiresAt: number }>({
    token: null,
    expiresAt: 0,
  });
  const tokenPromiseRef = useRef<Promise<string | null> | null>(null);

  const user = useMemo(() => {
    if (!session.data?.user) return null;
    const u = session.data.user as Record<string, unknown>;
    return {
      id: session.data.user.id,
      name: session.data.user.name,
      email: session.data.user.email,
      phone: u.phone as string | undefined,
      role: u.role as string | undefined,
    };
  }, [session.data]);

  const getToken = useCallback(async (): Promise<string | null> => {
    const cached = tokenCacheRef.current;
    if (cached.token && Date.now() < cached.expiresAt) {
      return cached.token;
    }

    if (tokenPromiseRef.current) {
      return tokenPromiseRef.current;
    }

    try {
      tokenPromiseRef.current = authClient
        .token()
        .then((res) => {
          const token = res.data?.token ?? null;
          if (!token) {
            tokenCacheRef.current = { token: null, expiresAt: 0 };
            return null;
          }

          const expiresAt = getTokenExpiry(token);
          tokenCacheRef.current = {
            token,
            expiresAt: expiresAt ?? Date.now() + 60 * 1000,
          };
          return token;
        })
        .finally(() => {
          tokenPromiseRef.current = null;
        });

      return await tokenPromiseRef.current;
    } catch {
      tokenCacheRef.current = { token: null, expiresAt: 0 };
      return null;
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    tokenCacheRef.current = { token: null, expiresAt: 0 };
    tokenPromiseRef.current = null;
    await authClient.signOut();
  }, []);

  // Wire up API client token injection
  useEffect(() => {
    setAuthTokenGetter(getToken);
  }, [getToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isPending: session.isPending,
      isAuthenticated: !!session.data?.user,
      getToken,
      signOut: handleSignOut,
    }),
    [user, session.isPending, session.data?.user, getToken, handleSignOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function getTokenExpiry(token: string) {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload)) as { exp?: number };
    if (!decoded.exp) return null;
    return decoded.exp * 1000 - 5 * 1000;
  } catch {
    return null;
  }
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
