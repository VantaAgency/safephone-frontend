"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession, authClient } from "./client";
import { setAuthTokenGetter } from "@/lib/api/client";
import type { UserRole } from "@/lib/api/types";
import { getPrimaryRole, normalizeUserRole, normalizeUserRoles } from "@/lib/auth/roles";

interface AuthContextValue {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: UserRole;
    roles: UserRole[];
  } | null;
  isPending: boolean;
  isAuthenticated: boolean;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSession();
  const queryClient = useQueryClient();
  const tokenCacheRef = useRef<{ token: string | null; expiresAt: number }>({
    token: null,
    expiresAt: 0,
  });
  const tokenPromiseRef = useRef<Promise<string | null> | null>(null);
  const [tokenRoleState, setTokenRoleState] = useState<{
    userId: string;
    roles: UserRole[];
  } | null>(null);
  const currentUser = session.data?.user ?? null;
  const currentUserId = currentUser?.id ?? null;

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

  useEffect(() => {
    if (!currentUser || !currentUserId) return;
    if (tokenRoleState?.userId === currentUserId) return;

    let cancelled = false;
    const sessionUser = currentUser as Record<string, unknown>;
    const fallbackRole = normalizeUserRole(sessionUser.role);
    const userId = currentUserId;

    getToken()
      .then((token) => {
        if (cancelled) return;
        const payload = token ? decodeTokenPayload(token) : null;
        setTokenRoleState({
          userId,
          roles: normalizeUserRoles(payload?.roles, fallbackRole),
        });
      })
      .catch(() => {
        if (!cancelled) {
          setTokenRoleState({
            userId,
            roles: normalizeUserRoles(undefined, fallbackRole),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser, currentUserId, getToken, tokenRoleState?.userId]);

  const user = useMemo(() => {
    if (!currentUser || !currentUserId) return null;
    const u = currentUser as Record<string, unknown>;
    const fallbackRole = normalizeUserRole(u.role);
    const roles =
      tokenRoleState?.userId === currentUserId
        ? tokenRoleState.roles
        : normalizeUserRoles(u.roles, fallbackRole);
    return {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      phone: u.phone as string | undefined,
      role: getPrimaryRole(roles),
      roles,
    };
  }, [currentUser, currentUserId, tokenRoleState]);

  const handleSignOut = useCallback(async () => {
    tokenCacheRef.current = { token: null, expiresAt: 0 };
    tokenPromiseRef.current = null;
    setTokenRoleState(null);
    await authClient.signOut();
    // Drop every cached query so the next user on this browser can't see the
    // previous session's data (query keys aren't user-scoped). Better Auth
    // already cleared the cookie + our token cache above.
    queryClient.clear();
  }, [queryClient]);

  // Wire up API client token injection
  useEffect(() => {
    setAuthTokenGetter(getToken);
  }, [getToken]);

  const authIsPending =
    session.isPending ||
    (!!currentUserId && tokenRoleState?.userId !== currentUserId);
  const isAuthenticated = !!currentUserId;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isPending: authIsPending,
      isAuthenticated,
      getToken,
      signOut: handleSignOut,
    }),
    [user, authIsPending, isAuthenticated, getToken, handleSignOut]
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

function decodeTokenPayload(token: string) {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    return JSON.parse(atob(payload)) as { roles?: unknown };
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
