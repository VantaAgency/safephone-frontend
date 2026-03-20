"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select } from "@/components/ui/form-field";
import { UsersIcon, CreditCardIcon, ShieldCheckIcon, WhatsAppIcon, CheckCircleIcon } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { partnerApplicationSchema } from "@/lib/validation/schemas";
import { useSubmitPartnerApplication, useMyPartnerApplication } from "@/lib/api/hooks";
import { ApiError } from "@/lib/api/client";

export default function PartenairesPage() {
  const { lang, t } = useLanguage();
  const { user, isPending: authPending } = useAuth();
  const isAuthenticated = !!user;

  const { data: myApplication, isLoading: appLoading } = useMyPartnerApplication(isAuthenticated);

  const [form, setForm] = useState({ store: "", name: "", phone: "", city: "", businessLocation: "" });
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const submitPartnerApplication = useSubmitPartnerApplication();

  const handleSubmit = async () => {
    const result = partnerApplicationSchema.safeParse({
      storeName: form.store,
      fullName: form.name,
      phone: form.phone,
      city: form.city,
      businessLocation: form.businessLocation,
    });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        const fieldMap: Record<string, string> = { storeName: "store", fullName: "name" };
        errors[fieldMap[key] || key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setFormError("");
    try {
      await submitPartnerApplication.mutateAsync({
        store_name: form.store,
        full_name: form.name,
        phone: form.phone,
        city: form.city,
        business_location: form.businessLocation,
      });
      setSuccess(true);
      setForm({ store: "", name: "", phone: "", city: "", businessLocation: "" });
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError(
          lang === "fr"
            ? "Impossible de contacter le serveur. Vérifiez votre connexion et réessayez."
            : "Could not reach the server. Check your connection and try again."
        );
      }
    }
  };

  const steps = [
    { icon: UsersIcon, title: t.partners.benefit1, desc: t.partners.b1d },
    { icon: WhatsAppIcon, title: t.partners.benefit2, desc: t.partners.b2d },
    { icon: ShieldCheckIcon, title: t.partners.benefit3, desc: t.partners.b3d },
    { icon: CreditCardIcon, title: t.partners.benefit4, desc: t.partners.b4d },
  ];

  const renderFormSection = () => {
    if (authPending || appLoading) {
      return (
        <div className="rounded-[2rem] border border-slate-200/80 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
        </div>
      );
    }

    // Not authenticated: prompt to sign in
    if (!isAuthenticated) {
      return (
        <div className="rounded-[2rem] border border-slate-200/80 bg-white p-8 text-center shadow-sm md:p-10">
          <ShieldCheckIcon size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-medium text-indigo-950">
            {lang === "fr" ? "Connexion requise" : "Sign in required"}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            {lang === "fr"
              ? "Vous devez créer un compte ou vous connecter pour soumettre une candidature partenaire."
              : "You need to create an account or sign in to submit a partner application."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/connexion">
              <Button variant="primary" size="lg">
                {lang === "fr" ? "Se connecter" : "Sign in"}
              </Button>
            </Link>
            <Link href="/inscription-compte">
              <Button variant="outline" size="lg">
                {lang === "fr" ? "Créer un compte" : "Sign up"}
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    // Has existing application
    if (myApplication) {
      if (myApplication.status === "pending") {
        return (
          <div className="rounded-[2rem] border border-yellow-200/60 bg-yellow-50 p-8 text-center md:p-10">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <ShieldCheckIcon size={24} className="text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium text-indigo-950">
              {lang === "fr" ? "Candidature en cours d'examen" : "Application under review"}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {lang === "fr"
                ? "Votre candidature a été soumise et est en cours d'examen par notre équipe. Nous vous contacterons bientôt."
                : "Your application has been submitted and is being reviewed by our team. We will contact you soon."}
            </p>
            <div className="mt-4">
              <StatusBadge status="pending" label={lang === "fr" ? "En attente" : "Pending"} />
            </div>
            <div className="mt-4 text-xs text-slate-400">
              {lang === "fr" ? "Soumise le" : "Submitted on"}{" "}
              {new Date(myApplication.created_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US")}
            </div>
          </div>
        );
      }

      if (myApplication.status === "approved") {
        return (
          <div className="rounded-[2rem] border border-emerald-200/60 bg-emerald-50 p-8 text-center md:p-10">
            <CheckCircleIcon size={48} className="mx-auto mb-4 text-emerald-500" />
            <h3 className="text-lg font-medium text-indigo-950">
              {lang === "fr" ? "Vous êtes partenaire SafePhone !" : "You are a SafePhone partner!"}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {lang === "fr"
                ? "Votre candidature a été approuvée. Accédez à votre espace partenaire pour gérer vos clients et vos commissions d'acquisition uniques."
                : "Your application has been approved. Access your partner dashboard to manage your clients and your one-time acquisition commissions."}
            </p>
            <div className="mt-6">
              <Link href="/espace-partenaire">
                <Button variant="primary" size="lg">
                  {lang === "fr" ? "Espace partenaire" : "Partner dashboard"}
                </Button>
              </Link>
            </div>
          </div>
        );
      }

      if (myApplication.status === "rejected") {
        return (
          <div>
            <div className="mb-6 rounded-[2rem] border border-red-200/60 bg-red-50 p-6">
              <h3 className="font-medium text-red-800">
                {lang === "fr" ? "Candidature précédente refusée" : "Previous application rejected"}
              </h3>
              {myApplication.rejection_reason && (
                <p className="mt-2 text-sm text-red-600">
                  {lang === "fr" ? "Raison : " : "Reason: "}{myApplication.rejection_reason}
                </p>
              )}
              <p className="mt-2 text-sm text-slate-500">
                {lang === "fr"
                  ? "Vous pouvez soumettre une nouvelle candidature ci-dessous."
                  : "You can submit a new application below."}
              </p>
            </div>
            {renderForm()}
          </div>
        );
      }
    }

    // No application or success state
    if (success) {
      return (
        <div className="rounded-[2rem] border border-emerald-200/60 bg-emerald-50 p-8 text-center md:p-10">
          <CheckCircleIcon size={48} className="mx-auto mb-4 text-emerald-500" />
          <h3 className="text-lg font-medium text-indigo-950">{t.partners.success}</h3>
        </div>
      );
    }

    return renderForm();
  };

  const renderForm = () => (
    <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6">
        <div className="mb-3 inline-flex items-center rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-slate-500">
          {lang === "fr" ? "Candidature partenaire" : "Partner application"}
        </div>
        <p className="text-sm text-slate-500">
          {lang === "fr"
            ? "Renseignez votre boutique pour rejoindre le réseau revendeur SafePhone et recevoir une commission unique sur le premier paiement réussi de chaque nouveau client."
            : "Tell us about your shop to join the SafePhone reseller network and earn a one-time commission on each new client's first successful payment."}
        </p>
      </div>
      <div className="space-y-5">
        <FormField label={t.partners.name} error={fieldErrors.store}>
          <Input
            value={form.store}
            onChange={(e) => setForm({ ...form, store: e.target.value })}
            placeholder="Boutique Diallo Mobile"
            error={!!fieldErrors.store}
          />
        </FormField>
        <FormField label={t.partners.fname} error={fieldErrors.name}>
          <Input
            value={form.name || user?.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ousmane Diallo"
            error={!!fieldErrors.name}
          />
        </FormField>
        <FormField label={t.partners.phone} error={fieldErrors.phone}>
          <Input
            value={form.phone || user?.phone || ""}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+221 77 000 00 00"
            error={!!fieldErrors.phone}
          />
        </FormField>
        <FormField label={t.partners.city} error={fieldErrors.city}>
          <Select
            value={form.city}
            onChange={(e) => setForm({ ...form, city: (e.target as HTMLSelectElement).value })}
            error={!!fieldErrors.city}
          >
            <option value="">{lang === "fr" ? "Sélectionnez votre ville" : "Select your city"}</option>
            {["Dakar", "Thiès", "Saint-Louis", "Kaolack", "Ziguinchor", "Touba", "Rufisque", "Mbour"].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </FormField>
        <FormField label={t.partners.businessLocation} error={fieldErrors.businessLocation}>
          <Input
            value={form.businessLocation}
            onChange={(e) => setForm({ ...form, businessLocation: e.target.value })}
            placeholder={lang === "fr" ? "Marché Ouest Foire, Liberté 6..." : "Marché Ouest Foire, Liberté 6..."}
            error={!!fieldErrors.businessLocation}
          />
        </FormField>
        {(formError || submitPartnerApplication.isError) && (
          <div className="rounded-xl border border-red-200/60 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {formError || (lang === "fr" ? "Une erreur est survenue. Réessayez." : "An error occurred. Please try again.")}
          </div>
        )}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSubmit}
          loading={submitPartnerApplication.isPending}
          disabled={!form.store || !(form.name || user?.name) || !(form.phone || user?.phone) || !form.city || !form.businessLocation}
        >
          {t.partners.submit}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <section className="mx-auto mb-14 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
            {lang === "fr" ? "Programme partenaire" : "Partner program"}
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-indigo-950 md:text-4xl lg:text-5xl">
            {t.partners.title}
          </h1>
          <p className="mt-4 text-lg text-slate-500">
            {t.partners.sub}
          </p>
          <div className="mt-10">
            <h2 className="text-xl font-medium tracking-tight text-indigo-950 md:text-2xl">
              {lang === "fr" ? "4 étapes pour gagner des commissions" : "4 steps to earn commissions"}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-500 md:text-base">
              {lang === "fr"
                ? "Un parcours simple, pensé pour les boutiques qui veulent proposer SafePhone sans alourdir la vente."
                : "A simple flow for shops that want to offer SafePhone without slowing down the sale."}
            </p>
          </div>
        </section>

        <section className="mb-14">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-300">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100">
                      <Icon size={22} className="text-yellow-500" />
                    </div>
                  </div>
                  <h3 className="mb-1.5 font-medium text-indigo-950">{s.title}</h3>
                  <p className="text-sm text-slate-500">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-medium tracking-tight text-indigo-950 md:text-3xl">{t.partners.apply}</h2>
          </div>
          {renderFormSection()}
        </section>
      </div>
    </div>
  );
}
