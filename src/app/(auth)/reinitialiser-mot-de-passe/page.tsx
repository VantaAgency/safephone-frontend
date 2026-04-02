"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import {
  FormErrorAlert,
  FormField,
  PasswordInput,
} from "@/components/ui/form-field";
import { resetPassword as resetPasswordAction } from "@/lib/auth/client";
import {
  buildForgotPasswordHref,
  buildLoginHref,
} from "@/lib/auth/password-reset";
import { resetPasswordSchema } from "@/lib/validation/schemas";

export default function ResetPasswordPage() {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const redirect = searchParams.get("redirect");
  const queryError = searchParams.get("error");
  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [tokenInvalid, setTokenInvalid] = useState(false);

  const forgotPasswordHref = buildForgotPasswordHref(redirect);
  const loginHref = buildLoginHref({ redirect });
  const showInvalidState =
    queryError === "INVALID_TOKEN" || !token || tokenInvalid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!token) {
      setTokenInvalid(true);
      return;
    }

    const parsed = resetPasswordSchema.safeParse(form);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !nextErrors[key]) {
          nextErrors[key] =
            issue.message.split(" / ")[lang === "fr" ? 0 : 1] ?? issue.message;
        }
      }
      setFieldErrors(nextErrors);
      setError(
        lang === "fr"
          ? "Corrigez les champs en rouge avant de continuer."
          : "Please correct the highlighted fields before continuing.",
      );
      return;
    }

    setLoading(true);

    try {
      const result = await resetPasswordAction({
        token,
        newPassword: form.newPassword,
      });

      if (result.error) {
        if (result.error.code === "INVALID_TOKEN") {
          setTokenInvalid(true);
          return;
        }

        setError(t.auth.resetPasswordError);
        return;
      }

      router.push(buildLoginHref({ redirect, reset: "success" }));
    } catch {
      setError(t.auth.resetPasswordError);
    } finally {
      setLoading(false);
    }
  };

  if (showInvalidState) {
    return (
      <div className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-xl md:p-10">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-medium tracking-tight text-indigo-950">
            {t.auth.resetPasswordInvalidTitle}
          </h1>
          <p className="text-sm text-slate-500">
            {t.auth.resetPasswordInvalidMessage}
          </p>
        </div>

        <div className="mt-8 space-y-3 text-center">
          <Link
            href={forgotPasswordHref}
            className="block rounded-full bg-indigo-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-900"
          >
            {t.auth.resetPasswordRequestAnother}
          </Link>
          <Link
            href={loginHref}
            className="block text-sm font-semibold text-indigo-600 hover:underline"
          >
            {t.auth.backToLogin}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-xl md:p-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-medium tracking-tight text-indigo-950">
          {t.auth.resetPasswordTitle}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{t.auth.resetPasswordSub}</p>
      </div>

      {error && (
        <div className="mb-4">
          <FormErrorAlert title={t.auth.formErrorTitle} message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField
          label={t.auth.newPasswordLabel}
          error={fieldErrors.newPassword}
        >
          <PasswordInput
            value={form.newPassword}
            onChange={(e) => {
              setForm((current) => ({
                ...current,
                newPassword: e.target.value,
              }));
              if (fieldErrors.newPassword) {
                setFieldErrors((current) => ({
                  ...current,
                  newPassword: "",
                }));
              }
            }}
            placeholder="••••••••"
            required
            autoComplete="new-password"
            error={!!fieldErrors.newPassword}
            toggleLabel={lang === "fr" ? "Afficher le mot de passe" : "Show password"}
            hideLabel={lang === "fr" ? "Masquer le mot de passe" : "Hide password"}
          />
        </FormField>

        <FormField
          label={t.auth.confirmNewPasswordLabel}
          error={fieldErrors.confirmPassword}
        >
          <PasswordInput
            value={form.confirmPassword}
            onChange={(e) => {
              setForm((current) => ({
                ...current,
                confirmPassword: e.target.value,
              }));
              if (fieldErrors.confirmPassword) {
                setFieldErrors((current) => ({
                  ...current,
                  confirmPassword: "",
                }));
              }
            }}
            placeholder="••••••••"
            required
            autoComplete="new-password"
            error={!!fieldErrors.confirmPassword}
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
          {t.auth.resetPasswordSubmit}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href={loginHref} className="font-semibold text-indigo-600 hover:underline">
          {t.auth.backToLogin}
        </Link>
      </p>
    </div>
  );
}
