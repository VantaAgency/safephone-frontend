"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
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
    try {
      const res = await authClient.token();
      if (res.data) return res.data.token;
      return null;
    } catch {
      return null;
    }
  }, []);

  const handleSignOut = useCallback(async () => {
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
