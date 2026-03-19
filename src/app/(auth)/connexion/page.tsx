"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { FormErrorAlert, FormField, Input, PasswordInput } from "@/components/ui/form-field";
import { authClient } from "@/lib/auth/client";
import { loginSchema } from "@/lib/validation/schemas";

export default function LoginPage() {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const redirect = searchParams.get("redirect") || "/tableau-de-bord";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !nextErrors[key]) {
          nextErrors[key] = issue.message.split(" / ")[lang === "fr" ? 0 : 1] ?? issue.message;
        }
      }
      setFieldErrors(nextErrors);
      setError(
        lang === "fr"
          ? "Corrigez les champs en rouge avant de continuer."
          : "Please correct the highlighted fields before continuing."
      );
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(
          lang === "fr"
            ? "Email ou mot de passe incorrect."
            : "Invalid email or password.",
        );
        return;
      }
      router.push(redirect);
    } catch {
      setError(
        lang === "fr"
          ? "Une erreur est survenue. Réessayez."
          : "An error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-xl md:p-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-medium tracking-tight text-indigo-950">
          {t.nav.login}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {lang === "fr"
            ? "Connectez-vous à votre espace SafePhone."
            : "Sign in to your SafePhone account."}
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <FormErrorAlert message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField
          label={lang === "fr" ? "Adresse email" : "Email address"}
          error={fieldErrors.email}
        >
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((current) => ({ ...current, email: "" }));
              }
            }}
            placeholder="aminata@email.com"
            required
            autoComplete="email"
            error={!!fieldErrors.email}
          />
        </FormField>

        <FormField
          label={lang === "fr" ? "Mot de passe" : "Password"}
          error={fieldErrors.password}
        >
          <PasswordInput
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) {
                setFieldErrors((current) => ({ ...current, password: "" }));
              }
            }}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            error={!!fieldErrors.password}
            toggleLabel={lang === "fr" ? "Afficher le mot de passe" : "Show password"}
            hideLabel={lang === "fr" ? "Masquer le mot de passe" : "Hide password"}
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
        <Link
          href={{
            pathname: "/inscription-compte",
            query: redirect ? { redirect } : undefined,
          }}
          className="font-semibold text-indigo-600 hover:underline"
        >
          {lang === "fr" ? "Créer un compte" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}
