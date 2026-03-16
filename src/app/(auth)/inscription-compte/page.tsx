"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/form-field";
import { authClient } from "@/lib/auth/client";

export default function RegisterPage() {
  const { lang, t } = useLanguage();
  const router = useRouter();
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
      router.push("/tableau-de-bord");
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
        <Link
          href="/connexion"
          className="font-semibold text-indigo-600 hover:underline"
        >
          {t.nav.login}
        </Link>
      </p>
    </div>
  );
}
