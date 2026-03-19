"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/form-field";
import { authClient } from "@/lib/auth/client";

export default function LoginPage() {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const redirect = searchParams.get("redirect") || "/tableau-de-bord";

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
