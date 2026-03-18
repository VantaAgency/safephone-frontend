"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { AuthModal, type AuthView } from "./auth-modal";

interface AuthModalContextValue {
  openAuthModal: (view?: AuthView) => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<AuthView>("sign-in");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Auto-open from URL param (?auth=sign-in or ?auth=sign-up)
  useEffect(() => {
    const authParam = searchParams.get("auth");
    if (authParam === "sign-in" || authParam === "sign-up") {
      setView(authParam);
      setIsOpen(true);
    }
  }, [searchParams]);

  const openAuthModal = useCallback((v: AuthView = "sign-in") => {
    setView(v);
    setIsOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
    // Remove ?auth and ?redirect params from URL if present
    const authParam = searchParams.get("auth");
    if (authParam) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("auth");
      params.delete("redirect");
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    }
  }, [searchParams, router, pathname]);

  const redirectTo = searchParams.get("redirect") || undefined;

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal }}>
      {children}
      {isOpen && (
        <AuthModal view={view} onClose={closeAuthModal} redirectTo={redirectTo} />
      )}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return ctx;
}
