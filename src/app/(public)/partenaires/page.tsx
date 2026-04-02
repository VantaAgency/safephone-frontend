"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { FormField, Input, PasswordInput, Select } from "@/components/ui/form-field";
import { ShieldCheckIcon, CheckCircleIcon } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { useSubmitPartnerApplication, useMyPartnerApplication } from "@/lib/api/hooks";
import { authClient } from "@/lib/auth/client";
import { users } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import { registerSchema } from "@/lib/validation/schemas";

type AccountData = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type BusinessData = {
  storeName: string;
  city: string;
  businessLocation: string;
  phone: string;
};

const CITIES = ["Dakar", "Thiès", "Saint-Louis", "Kaolack", "Ziguinchor", "Touba", "Rufisque", "Mbour"];

export default function PartenairesPage() {
  const { lang, t } = useLanguage();
  const { user, isPending: authPending } = useAuth();
  const isAuthenticated = !!user;

  const { data: myApplication, isLoading: appLoading } = useMyPartnerApplication(isAuthenticated);
  const submitPartnerApplication = useSubmitPartnerApplication();

  const [step, setStep] = useState(1);
  const [visible, setVisible] = useState(true);

  const [accountData, setAccountData] = useState<AccountData>({
    name: "", email: "", phone: "", password: "", confirmPassword: "",
  });
  const [businessData, setBusinessData] = useState<BusinessData>({
    storeName: "", city: "", businessLocation: "", phone: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const tr = (fr: string, en: string) => lang === "fr" ? fr : en;

  const clearFieldError = (key: string) =>
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));

  const transitionTo = (nextStep: number) => {
    setVisible(false);
    setTimeout(() => {
      setStep(nextStep);
      setFieldErrors({});
      setFormError("");
      setVisible(true);
    }, 150);
  };

  const validateAccount = (): boolean => {
    const parsed = registerSchema.safeParse({
      fullName: accountData.name,
      email: accountData.email,
      phone: accountData.phone,
      password: accountData.password,
      confirmPassword: accountData.confirmPassword,
    });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key !== "string" || errors[key]) continue;
        const normalizedKey = key === "fullName" ? "name" : key;
        errors[normalizedKey] = issue.message.split(" / ")[lang === "fr" ? 0 : 1] ?? issue.message;
      }
      setFieldErrors(errors);
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const validateBusiness = (): boolean => {
    const errors: Record<string, string> = {};
    if (!businessData.storeName.trim())
      errors.storeName = tr("Nom de boutique requis", "Store name required");
    if (!businessData.city)
      errors.city = tr("Ville requise", "City required");
    if (!businessData.businessLocation.trim())
      errors.businessLocation = tr("Zone commerciale requise", "Business location required");
    if (isAuthenticated && !user?.phone && !businessData.phone.trim())
      errors.phone = tr("Numéro de téléphone requis", "Phone number required");
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAccountNext = () => {
    if (!validateAccount()) return;
    transitionTo(2);
  };

  const handleSubmit = async () => {
    if (!validateBusiness()) return;
    setFormError("");
    setLoading(true);

    try {
      if (!isAuthenticated) {
        const result = await authClient.signUp.email({
          name: accountData.name,
          email: accountData.email,
          password: accountData.password,
        });
        if (result.error) {
          const code = result.error.code;
          if (code === "USER_ALREADY_EXISTS" || code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
            setFormError(tr(
              "Un compte existe déjà avec cet email. Connectez-vous d'abord.",
              "An account already exists with this email. Sign in first."
            ));
          } else {
            setFormError(tr(
              "Impossible de créer le compte. Vérifiez vos informations.",
              "Could not create account. Please check your information."
            ));
          }
          return;
        }
        try {
          await users.updateProfile({ phone: accountData.phone.trim() });
        } catch {
          // Non-blocking — continue with application
        }
      }

      const fullName = isAuthenticated ? (user?.name ?? "") : accountData.name;
      const phone = isAuthenticated ? (user?.phone || businessData.phone.trim()) : accountData.phone;

      await submitPartnerApplication.mutateAsync({
        store_name: businessData.storeName.trim(),
        full_name: fullName,
        phone: phone.trim(),
        city: businessData.city,
        business_location: businessData.businessLocation.trim(),
      });
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError(tr(
          "Impossible de contacter le serveur. Vérifiez votre connexion.",
          "Could not reach the server. Check your connection."
        ));
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: t.partners.benefit1, desc: t.partners.b1d },
    { title: t.partners.benefit2, desc: t.partners.b2d },
    { title: t.partners.benefit3, desc: t.partners.b3d },
    { title: t.partners.benefit4, desc: t.partners.b4d },
  ];

  // ── Right column renderers ────────────────────────────────────────────────

  const renderStepIndicator = () => (
    <div className="flex items-center gap-0 px-8 pt-7 pb-5 border-b border-slate-100">
      {/* Step 1 */}
      <div className="flex flex-col items-center gap-1.5 min-w-0">
        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-colors duration-200 ${
          step >= 1
            ? "bg-[#0C1E3C] border-[#0C1E3C] text-white"
            : "bg-white border-slate-300 text-slate-400"
        }`}>
          {step > 1 ? (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : "1"}
        </div>
        <span className={`text-[11px] font-semibold tracking-wide whitespace-nowrap ${step >= 1 ? "text-[#0C1E3C]" : "text-slate-400"}`}>
          {tr("Mon compte", "My account")}
        </span>
      </div>

      {/* Connector */}
      <div className="flex-1 mx-3 mb-5">
        <div className={`h-px transition-colors duration-300 ${step >= 2 ? "bg-[#0C1E3C]" : "bg-slate-200"}`} />
      </div>

      {/* Step 2 */}
      <div className="flex flex-col items-center gap-1.5 min-w-0">
        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-colors duration-200 ${
          step >= 2
            ? "bg-[#0C1E3C] border-[#0C1E3C] text-white"
            : "bg-white border-slate-300 text-slate-400"
        }`}>
          2
        </div>
        <span className={`text-[11px] font-semibold tracking-wide whitespace-nowrap ${step >= 2 ? "text-[#0C1E3C]" : "text-slate-400"}`}>
          {tr("Ma boutique", "My store")}
        </span>
      </div>
    </div>
  );

  const renderAccountStep = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-base font-semibold text-[#0C1E3C]">
          {tr("Créez votre compte", "Create your account")}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {tr("Vous pourrez gérer vos commissions depuis votre espace partenaire.", "You'll manage your commissions from your partner dashboard.")}
        </p>
      </div>

      <div className="space-y-4">
        <FormField label={tr("Nom complet", "Full name")} error={fieldErrors.name}>
          <Input
            value={accountData.name}
            onChange={(e) => { setAccountData({ ...accountData, name: e.target.value }); clearFieldError("name"); }}
            placeholder="Ousmane Diallo"
            error={!!fieldErrors.name}
            autoComplete="name"
          />
        </FormField>
        <FormField label={tr("Adresse email", "Email address")} error={fieldErrors.email}>
          <Input
            type="email"
            value={accountData.email}
            onChange={(e) => { setAccountData({ ...accountData, email: e.target.value }); clearFieldError("email"); }}
            placeholder="ousmane@email.com"
            error={!!fieldErrors.email}
            autoComplete="email"
          />
        </FormField>
        <FormField
          label={tr("Numéro de téléphone", "Phone number")}
          hint={tr("Exemple : +221 77 000 00 00", "Example: +221 77 000 00 00")}
          error={fieldErrors.phone}
        >
          <Input
            type="tel"
            value={accountData.phone}
            onChange={(e) => { setAccountData({ ...accountData, phone: e.target.value }); clearFieldError("phone"); }}
            placeholder="+221 77 000 00 00"
            error={!!fieldErrors.phone}
            autoComplete="tel"
          />
        </FormField>
        <FormField label={tr("Mot de passe", "Password")} error={fieldErrors.password}>
          <PasswordInput
            value={accountData.password}
            onChange={(e) => { setAccountData({ ...accountData, password: e.target.value }); clearFieldError("password"); }}
            placeholder="••••••••"
            error={!!fieldErrors.password}
            autoComplete="new-password"
            toggleLabel={tr("Afficher le mot de passe", "Show password")}
            hideLabel={tr("Masquer le mot de passe", "Hide password")}
          />
        </FormField>
        <FormField label={tr("Confirmer le mot de passe", "Confirm password")} error={fieldErrors.confirmPassword}>
          <PasswordInput
            value={accountData.confirmPassword}
            onChange={(e) => { setAccountData({ ...accountData, confirmPassword: e.target.value }); clearFieldError("confirmPassword"); }}
            placeholder="••••••••"
            error={!!fieldErrors.confirmPassword}
            autoComplete="new-password"
            toggleLabel={tr("Afficher le mot de passe", "Show password")}
            hideLabel={tr("Masquer le mot de passe", "Hide password")}
          />
        </FormField>

        {formError && (
          <div className="rounded-xl border border-red-200/60 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {formError}
          </div>
        )}

        <Button variant="primary" size="lg" fullWidth onClick={handleAccountNext}>
          {tr("Continuer", "Continue")}
          <svg className="ml-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Button>

        <p className="text-center text-sm text-slate-500">
          {tr("Déjà un compte ?", "Already have an account?")}{" "}
          <Link href="/connexion?redirect=/partenaires" className="font-semibold text-[#1A56DB] hover:underline">
            {tr("Se connecter", "Sign in")}
          </Link>
        </p>
      </div>
    </div>
  );

  const renderBusinessStep = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-base font-semibold text-[#0C1E3C]">
          {tr("Votre boutique", "Your store")}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {tr(
            "Quelques infos sur votre point de vente pour finaliser votre candidature.",
            "A few details about your store to complete your application."
          )}
        </p>
      </div>

      {isAuthenticated && user?.name && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0C1E3C]/10 text-xs font-bold text-[#0C1E3C]">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#0C1E3C]">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {isAuthenticated && !user?.phone && (
          <FormField
            label={tr("Numéro de téléphone", "Phone number")}
            hint={tr("Exemple : +221 77 000 00 00", "Example: +221 77 000 00 00")}
            error={fieldErrors.phone}
          >
            <Input
              type="tel"
              value={businessData.phone}
              onChange={(e) => { setBusinessData({ ...businessData, phone: e.target.value }); clearFieldError("phone"); }}
              placeholder="+221 77 000 00 00"
              error={!!fieldErrors.phone}
              autoComplete="tel"
            />
          </FormField>
        )}
        <FormField label={t.partners.name} error={fieldErrors.storeName}>
          <Input
            value={businessData.storeName}
            onChange={(e) => { setBusinessData({ ...businessData, storeName: e.target.value }); clearFieldError("storeName"); }}
            placeholder="Boutique Diallo Mobile"
            error={!!fieldErrors.storeName}
          />
        </FormField>
        <FormField label={t.partners.city} error={fieldErrors.city}>
          <Select
            value={businessData.city}
            onChange={(e) => { setBusinessData({ ...businessData, city: (e.target as HTMLSelectElement).value }); clearFieldError("city"); }}
            error={!!fieldErrors.city}
          >
            <option value="">{tr("Sélectionnez votre ville", "Select your city")}</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </FormField>
        <FormField label={t.partners.businessLocation} error={fieldErrors.businessLocation}>
          <Input
            value={businessData.businessLocation}
            onChange={(e) => { setBusinessData({ ...businessData, businessLocation: e.target.value }); clearFieldError("businessLocation"); }}
            placeholder={tr("Marché Ouest Foire, Liberté 6…", "Marché Ouest Foire, Liberté 6…")}
            error={!!fieldErrors.businessLocation}
          />
        </FormField>

        {formError && (
          <div className="rounded-xl border border-red-200/60 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {formError}
          </div>
        )}

        <div className={!isAuthenticated ? "flex gap-3" : ""}>
          {!isAuthenticated && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => transitionTo(1)}
              className="flex-none"
            >
              <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {tr("Retour", "Back")}
            </Button>
          )}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleSubmit}
            loading={loading || submitPartnerApplication.isPending}
          >
            {t.partners.submit}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderOnboardingForm = (showRejectedBanner?: boolean) => {
    const isOnStep1 = !isAuthenticated && step === 1;

    return (
      <div>
        {showRejectedBanner && myApplication?.status === "rejected" && (
          <div className="mb-4 rounded-2xl border border-red-200/60 bg-red-50 p-5">
            <h3 className="text-sm font-semibold text-red-800">
              {tr("Candidature précédente refusée", "Previous application rejected")}
            </h3>
            {myApplication.rejection_reason && (
              <p className="mt-1 text-sm text-red-600">
                {tr("Raison : ", "Reason: ")}{myApplication.rejection_reason}
              </p>
            )}
            <p className="mt-1 text-sm text-slate-500">
              {tr(
                "Vous pouvez soumettre une nouvelle candidature ci-dessous.",
                "You can submit a new application below."
              )}
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {!isAuthenticated && renderStepIndicator()}

          <div
            className={`px-6 py-6 md:px-8 md:py-7 transition-opacity duration-150 ${visible ? "opacity-100" : "opacity-0"}`}
          >
            {isOnStep1 ? renderAccountStep() : renderBusinessStep()}
          </div>
        </div>
      </div>
    );
  };

  const renderRightColumn = () => {
    if (authPending || appLoading) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#1A56DB]" />
        </div>
      );
    }

    if (myApplication) {
      if (myApplication.status === "pending") {
        return (
          <div className="rounded-2xl border border-yellow-200/60 bg-yellow-50 p-8 text-center md:p-10">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <ShieldCheckIcon size={24} className="text-yellow-600" />
            </div>
            <h3 className="text-base font-semibold text-[#0C1E3C]">
              {tr("Candidature en cours d'examen", "Application under review")}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {tr(
                "Votre candidature a été soumise et est en cours d'examen par notre équipe. Nous vous contacterons bientôt.",
                "Your application has been submitted and is being reviewed by our team. We will contact you soon."
              )}
            </p>
            <div className="mt-4">
              <StatusBadge status="pending" label={tr("En attente", "Pending")} />
            </div>
            <div className="mt-4 text-xs text-slate-400">
              {tr("Soumise le", "Submitted on")}{" "}
              {new Date(myApplication.created_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US")}
            </div>
          </div>
        );
      }

      if (myApplication.status === "approved") {
        return (
          <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50 p-8 text-center md:p-10">
            <CheckCircleIcon size={48} className="mx-auto mb-4 text-emerald-500" />
            <h3 className="text-base font-semibold text-[#0C1E3C]">
              {tr("Vous êtes partenaire SafePhone !", "You are a SafePhone partner!")}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {tr(
                "Votre candidature a été approuvée. Accédez à votre espace partenaire pour gérer vos clients et vos commissions.",
                "Your application has been approved. Access your partner dashboard to manage your clients and commissions."
              )}
            </p>
            <div className="mt-6">
              <Link href="/espace-partenaire">
                <Button variant="primary" size="lg">
                  {tr("Espace partenaire", "Partner dashboard")}
                </Button>
              </Link>
            </div>
          </div>
        );
      }

      if (myApplication.status === "rejected") {
        return renderOnboardingForm(true);
      }
    }

    if (success) {
      return (
        <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50 p-8 text-center md:p-10">
          <CheckCircleIcon size={48} className="mx-auto mb-4 text-emerald-500" />
          <h3 className="text-base font-semibold text-[#0C1E3C]">{t.partners.success}</h3>
          <p className="mt-2 text-sm text-slate-500">
            {tr(
              "Notre équipe examinera votre dossier et vous contactera sous 48h ouvrées.",
              "Our team will review your application and contact you within 48 business hours."
            )}
          </p>
        </div>
      );
    }

    return renderOnboardingForm();
  };

  return (
    <div className="bg-slate-50 py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.25fr] lg:gap-14">

          {/* Left: page heading + compact vertical steps */}
          <div className="lg:sticky lg:top-24">
            <div className="mb-4 inline-flex items-center rounded-full border border-[#0C1E3C]/15 bg-[#0C1E3C]/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0C1E3C]/55">
              {tr("Programme partenaire", "Partner program")}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#0C1E3C] md:text-3xl">
              {t.partners.title}
            </h1>
            <p className="mt-3 text-sm text-slate-500">
              {t.partners.sub}
            </p>

            {/* Compact vertical steps */}
            <div className="mt-8">
              <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {tr("Comment ça marche", "How it works")}
              </p>
              <div>
                {steps.map((s, i) => {
                  const isLast = i === steps.length - 1;
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                          isLast ? "bg-[#D4A012] text-[#0C1E3C]" : "bg-[#0C1E3C] text-white"
                        }`}>
                          {i + 1}
                        </div>
                        {!isLast && <div className="my-1 min-h-[16px] w-px flex-1 bg-slate-200" />}
                      </div>
                      <div className={`${isLast ? "pb-0" : "pb-4"} pt-0.5`}>
                        <p className={`text-sm font-semibold leading-tight ${isLast ? "text-[#B8860A]" : "text-[#0C1E3C]"}`}>
                          {s.title}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{s.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trust note */}
            <div className="mt-7 rounded-xl border border-[#D4A012]/30 bg-[#D4A012]/8 px-4 py-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheckIcon size={15} className="mt-0.5 flex-shrink-0 text-[#B8860A]" />
                <p className="text-xs text-[#0C1E3C]/65">
                  {tr(
                    "Chaque candidature est examinée par notre équipe. Réponse sous 48h ouvrées.",
                    "Each application is reviewed by our team. Response within 48 business hours."
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Right: onboarding form */}
          <div id="candidature">
            {renderRightColumn()}
          </div>
        </div>
      </div>
    </div>
  );
}
