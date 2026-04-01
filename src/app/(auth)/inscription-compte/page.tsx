"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { FormErrorAlert, FormField, Input, PasswordInput } from "@/components/ui/form-field";
import { authClient } from "@/lib/auth/client";
import { users } from "@/lib/api/endpoints";
import { getPostAuthRedirect } from "@/lib/auth/home-route";
import { registerSchema } from "@/lib/validation/schemas";
import type { UserRole } from "@/lib/api/types";

export default function RegisterPage() {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const redirect = searchParams.get("redirect");

  const validate = () => {
    const parsed = registerSchema.safeParse({
      fullName: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      confirmPassword: form.confirmPassword,
    });

    const errors: Record<string, string> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key !== "string" || errors[key]) continue;
        const normalizedKey = key === "fullName" ? "name" : key;
        errors[normalizedKey] = issue.message.split(" / ")[lang === "fr" ? 0 : 1] ?? issue.message;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validate()) {
      setError(
        lang === "fr"
          ? "Corrigez les champs en rouge avant de continuer."
          : "Please correct the highlighted fields before continuing."
      );
      return;
    }
    setLoading(true);

    try {
      const result = await authClient.signUp.email({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      if (result.error) {
        const code = result.error.code;
        if (code === "USER_ALREADY_EXISTS" || code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
          setError(
            lang === "fr"
              ? "Un compte existe déjà avec cette adresse email. Essayez de vous connecter."
              : "An account already exists with this email. Try signing in.",
          );
        } else {
          setError(
            lang === "fr"
              ? "Impossible de créer le compte. Vérifiez vos informations."
              : "Could not create account. Please check your information.",
          );
        }
        return;
      }
      try {
        await users.updateProfile({ phone: form.phone.trim() });
      } catch {
        setError(
          lang === "fr"
            ? "Compte cree, mais impossible d'enregistrer votre numero pour le moment. Reessayez."
            : "Account created, but we could not save your phone number yet. Please try again."
        );
        return;
      }
      const session = await authClient.getSession();
      const role = (session.data?.user as { role?: UserRole } | undefined)?.role;
      router.push(getPostAuthRedirect(redirect, role));
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
          {lang === "fr" ? "Créer un compte" : "Create an account"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {lang === "fr"
            ? "Inscrivez-vous pour protéger votre téléphone."
            : "Sign up to protect your phone."}
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <FormErrorAlert message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label={lang === "fr" ? "Nom complet" : "Full name"}
          error={fieldErrors.name}
        >
          <Input
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              if (fieldErrors.name) {
                setFieldErrors((current) => ({ ...current, name: "" }));
              }
            }}
            placeholder="Aminata Diallo"
            error={!!fieldErrors.name}
            autoComplete="name"
            required
          />
        </FormField>

        <FormField
          label={lang === "fr" ? "Adresse email" : "Email address"}
          error={fieldErrors.email}
        >
          <Input
            type="email"
            value={form.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              if (fieldErrors.email) {
                setFieldErrors((current) => ({ ...current, email: "" }));
              }
            }}
            placeholder="aminata@email.com"
            error={!!fieldErrors.email}
            autoComplete="email"
            required
          />
        </FormField>

        <FormField
          label={lang === "fr" ? "Telephone" : "Phone number"}
          hint={lang === "fr" ? "Exemple: +221 77 000 00 00" : "Example: +221 77 000 00 00"}
          error={fieldErrors.phone}
        >
          <Input
            type="tel"
            value={form.phone}
            onChange={(e) => {
              setForm({ ...form, phone: e.target.value });
              if (fieldErrors.phone) {
                setFieldErrors((current) => ({ ...current, phone: "" }));
              }
            }}
            placeholder="+221 77 000 00 00"
            autoComplete="tel"
            error={!!fieldErrors.phone}
            required
          />
        </FormField>

        <FormField
          label={lang === "fr" ? "Mot de passe" : "Password"}
          error={fieldErrors.password}
        >
          <PasswordInput
            value={form.password}
            onChange={(e) => {
              setForm({ ...form, password: e.target.value });
              if (fieldErrors.password) {
                setFieldErrors((current) => ({ ...current, password: "" }));
              }
            }}
            placeholder="••••••••"
            error={!!fieldErrors.password}
            autoComplete="new-password"
            required
            toggleLabel={lang === "fr" ? "Afficher le mot de passe" : "Show password"}
            hideLabel={lang === "fr" ? "Masquer le mot de passe" : "Hide password"}
          />
        </FormField>

        <FormField
          label={
            lang === "fr" ? "Confirmer le mot de passe" : "Confirm password"
          }
          error={fieldErrors.confirmPassword}
        >
          <PasswordInput
            value={form.confirmPassword}
            onChange={(e) =>
              {
                setForm({ ...form, confirmPassword: e.target.value });
                if (fieldErrors.confirmPassword) {
                  setFieldErrors((current) => ({ ...current, confirmPassword: "" }));
                }
              }
            }
            placeholder="••••••••"
            error={!!fieldErrors.confirmPassword}
            autoComplete="new-password"
            required
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
          {lang === "fr" ? "Créer mon compte" : "Create my account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        {lang === "fr" ? "Déjà un compte ?" : "Already have an account?"}{" "}
        <Link
          href={{
            pathname: "/connexion",
            query: redirect ? { redirect } : undefined,
          }}
          className="font-semibold text-indigo-600 hover:underline"
        >
          {t.nav.login}
        </Link>
      </p>
    </div>
  );
}
