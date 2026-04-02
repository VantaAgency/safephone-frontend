"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import {
  FormErrorAlert,
  FormField,
  FormSuccessAlert,
  Input,
} from "@/components/ui/form-field";
import { requestPasswordReset as requestPasswordResetAction } from "@/lib/auth/client";
import {
  buildLoginHref,
  buildResetPasswordRedirectTo,
} from "@/lib/auth/password-reset";
import { forgotPasswordSchema } from "@/lib/validation/schemas";

export default function ForgotPasswordPage() {
  const { lang, t } = useLanguage();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const redirect = searchParams.get("redirect");
  const loginHref = buildLoginHref({ redirect });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const parsed = forgotPasswordSchema.safeParse({ email });
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
      const result = await requestPasswordResetAction({
        email,
        redirectTo: buildResetPasswordRedirectTo(redirect),
      });

      if (result.error) {
        setError(t.auth.forgotPasswordRequestError);
        return;
      }

      setSubmitted(true);
    } catch {
      setError(t.auth.forgotPasswordRequestError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-xl md:p-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-medium tracking-tight text-indigo-950">
          {t.auth.forgotPasswordTitle}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{t.auth.forgotPasswordSub}</p>
      </div>

      {submitted ? (
        <div className="space-y-6">
          <FormSuccessAlert
            title={t.auth.forgotPasswordSuccessTitle}
            message={t.auth.forgotPasswordSuccessMessage}
          />
          <Link
            href={loginHref}
            className="block text-center text-sm font-semibold text-indigo-600 hover:underline"
          >
            {t.auth.backToLogin}
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4">
              <FormErrorAlert title={t.auth.formErrorTitle} message={error} />
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              {t.auth.forgotPasswordSubmit}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link href={loginHref} className="font-semibold text-indigo-600 hover:underline">
              {t.auth.backToLogin}
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
