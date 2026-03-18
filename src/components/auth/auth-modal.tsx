"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth/auth-provider";
import { authClient } from "@/lib/auth/client";
import { users } from "@/lib/api/endpoints";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/form-field";
import { XIcon } from "@/components/ui/icons";

export type AuthView = "sign-in" | "sign-up";

interface AuthModalProps {
  view: AuthView;
  onClose: () => void;
  redirectTo?: string;
}

export function AuthModal({ view: initialView, onClose, redirectTo }: AuthModalProps) {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState<AuthView>(initialView);
  const [visible, setVisible] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Animate in on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Close if user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) handleClose();
  };

  const onAuthSuccess = () => {
    if (redirectTo) {
      router.push(redirectTo);
    } else {
      router.refresh();
    }
    handleClose();
  };

  const modal = (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? "bg-black/50 backdrop-blur-sm" : "bg-black/0"
      }`}
    >
      <div
        className={`relative w-full max-w-md transition-all duration-200 ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-slate-50 cursor-pointer"
          aria-label={t.common.close}
        >
          <XIcon size={16} className="text-slate-500" />
        </button>

        {view === "sign-in" ? (
          <SignInForm
            lang={lang}
            t={t}
            onSuccess={onAuthSuccess}
            onSwitchToSignUp={() => setView("sign-up")}
          />
        ) : (
          <SignUpForm
            lang={lang}
            t={t}
            onSuccess={onAuthSuccess}
            onSwitchToSignIn={() => setView("sign-in")}
          />
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

// --- Sign In Form ---

function SignInForm({
  lang,
  t,
  onSuccess,
  onSwitchToSignUp,
}: {
  lang: string;
  t: { nav: { login: string }; common: { close: string } };
  onSuccess: () => void;
  onSwitchToSignUp: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(
          lang === "fr"
            ? "Email ou mot de passe incorrect."
            : "Invalid email or password."
        );
        return;
      }
      onSuccess();
    } catch {
      setError(
        lang === "fr"
          ? "Une erreur est survenue. Réessayez."
          : "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-xl md:p-10">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-medium tracking-tight text-indigo-950">
          {t.nav.login}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {lang === "fr"
            ? "Connectez-vous à votre espace SafePhone."
            : "Sign in to your SafePhone account."}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200/60 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label={lang === "fr" ? "Adresse email" : "Email address"}>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="aminata@email.com"
            required
            autoComplete="email"
          />
        </FormField>

        <FormField label={lang === "fr" ? "Mot de passe" : "Password"}>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </FormField>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
        >
          {t.nav.login}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        {lang === "fr" ? "Pas encore de compte ?" : "Don't have an account?"}{" "}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="font-semibold text-indigo-600 hover:underline cursor-pointer"
        >
          {lang === "fr" ? "Créer un compte" : "Create an account"}
        </button>
      </p>
    </div>
  );
}

// --- Sign Up Form ---

function SignUpForm({
  lang,
  t,
  onSuccess,
  onSwitchToSignIn,
}: {
  lang: string;
  t: { nav: { login: string }; common: { close: string } };
  onSuccess: () => void;
  onSwitchToSignIn: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) {
      errors.name = lang === "fr" ? "Nom requis" : "Name required";
    }
    if (!form.email.includes("@")) {
      errors.email = lang === "fr" ? "Email invalide" : "Invalid email";
    }
    if (form.password.length < 8) {
      errors.password =
        lang === "fr" ? "8 caractères minimum" : "Minimum 8 characters";
    }
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword =
        lang === "fr"
          ? "Les mots de passe ne correspondent pas"
          : "Passwords do not match";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setError("");
    setLoading(true);

    try {
      const result = await authClient.signUp.email({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      if (result.error) {
        setError(
          lang === "fr"
            ? "Impossible de créer le compte. Vérifiez vos informations."
            : "Could not create account. Please check your information."
        );
        return;
      }
      if (form.phone.trim()) {
        try {
          await users.updateProfile({ phone: form.phone.trim() });
        } catch {
          // Non-blocking
        }
      }
      onSuccess();
    } catch {
      setError(
        lang === "fr"
          ? "Une erreur est survenue. Réessayez."
          : "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-h-[90vh] overflow-y-auto rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-xl md:p-10">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-medium tracking-tight text-indigo-950">
          {lang === "fr" ? "Créer un compte" : "Create an account"}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {lang === "fr"
            ? "Inscrivez-vous pour protéger votre téléphone."
            : "Sign up to protect your phone."}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200/60 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label={lang === "fr" ? "Nom complet" : "Full name"}
          error={fieldErrors.name}
        >
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Aminata Diallo"
            error={!!fieldErrors.name}
            autoComplete="name"
          />
        </FormField>

        <FormField
          label={lang === "fr" ? "Adresse email" : "Email address"}
          error={fieldErrors.email}
        >
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="aminata@email.com"
            error={!!fieldErrors.email}
            autoComplete="email"
          />
        </FormField>

        <FormField
          label={lang === "fr" ? "Téléphone (optionnel)" : "Phone (optional)"}
        >
          <Input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+221 77 000 00 00"
            autoComplete="tel"
          />
        </FormField>

        <FormField
          label={lang === "fr" ? "Mot de passe" : "Password"}
          error={fieldErrors.password}
        >
          <Input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            error={!!fieldErrors.password}
            autoComplete="new-password"
          />
        </FormField>

        <FormField
          label={lang === "fr" ? "Confirmer le mot de passe" : "Confirm password"}
          error={fieldErrors.confirmPassword}
        >
          <Input
            type="password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            placeholder="••••••••"
            error={!!fieldErrors.confirmPassword}
            autoComplete="new-password"
          />
        </FormField>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
        >
          {lang === "fr" ? "Créer mon compte" : "Create my account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        {lang === "fr" ? "Déjà un compte ?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="font-semibold text-indigo-600 hover:underline cursor-pointer"
        >
          {t.nav.login}
        </button>
      </p>
    </div>
  );
}
