"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select } from "@/components/ui/form-field";
import { CheckCircleIcon, UsersIcon, CreditCardIcon, PhoneIcon } from "@/components/ui/icons";
import { partnerApplicationSchema } from "@/lib/validation/schemas";

export default function PartenairesPage() {
  const { lang, t } = useLanguage();
  const [form, setForm] = useState({ store: "", name: "", phone: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const result = partnerApplicationSchema.safeParse({
      storeName: form.store,
      fullName: form.name,
      phone: form.phone,
      city: form.city,
    });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        // Map schema keys to form keys
        const fieldMap: Record<string, string> = { storeName: "store", fullName: "name" };
        errors[fieldMap[key] || key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    // No backend endpoint — simulate
    setTimeout(() => { setLoading(false); setSuccess(true); }, 1500);
  };

  const benefits = [
    { icon: CreditCardIcon, title: t.partners.benefit1, desc: t.partners.b1d },
    { icon: PhoneIcon, title: t.partners.benefit2, desc: t.partners.b2d },
    { icon: UsersIcon, title: t.partners.benefit3, desc: t.partners.b3d },
    { icon: CheckCircleIcon, title: t.partners.benefit4, desc: t.partners.b4d },
  ];

  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-indigo-950 py-24 md:py-32">
        {/* Decorative blur circles */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-slate-300 backdrop-blur-sm">
              {lang === "fr" ? "Programme partenaire" : "Partner program"}
            </div>
            <h1 className="text-3xl font-medium tracking-tight text-white md:text-4xl lg:text-5xl">
              {t.partners.title}
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base text-slate-400 md:text-lg">
              {t.partners.sub}
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={i} className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100">
                    <Icon size={22} className="text-yellow-500" />
                  </div>
                  <h3 className="mb-1.5 font-medium text-indigo-950">{b.title}</h3>
                  <p className="text-sm text-slate-500">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="bg-slate-100/50 py-24 md:py-32">
        <div className="mx-auto max-w-xl px-5 md:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-medium tracking-tight text-indigo-950">{t.partners.apply}</h2>
          </div>

          {success ? (
            <div className="rounded-[2rem] border border-emerald-200/60 bg-emerald-50 p-8 text-center">
              <CheckCircleIcon size={48} className="mx-auto mb-4 text-emerald-500" />
              <h3 className="text-lg font-medium text-indigo-950">{t.partners.success}</h3>
            </div>
          ) : (
            <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
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
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ousmane Diallo"
                    error={!!fieldErrors.name}
                  />
                </FormField>
                <FormField label={t.partners.phone} error={fieldErrors.phone}>
                  <Input
                    value={form.phone}
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
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={!form.store || !form.name || !form.phone || !form.city}
                >
                  {t.partners.submit}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
