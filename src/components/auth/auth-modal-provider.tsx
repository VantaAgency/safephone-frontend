"use client";

import {
  createContext,
  useContext,
  useState,
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
  const [manualState, setManualState] = useState<{
    isOpen: boolean;
    view: AuthView;
  }>({
    isOpen: false,
    view: "sign-in",
  });
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const authParam = searchParams.get("auth");
  const urlView: AuthView | null =
    authParam === "sign-in" || authParam === "sign-up" ? authParam : null;
  const isOpen = manualState.isOpen || Boolean(urlView);
  const view = urlView ?? manualState.view;

  const openAuthModal = (v: AuthView = "sign-in") => {
    setManualState({ isOpen: true, view: v });
  };

  const closeAuthModal = () => {
    setManualState((current) => ({ ...current, isOpen: false }));
    // Remove ?auth and ?redirect params from URL if present
    if (authParam) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("auth");
      params.delete("redirect");
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    }
  };

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
