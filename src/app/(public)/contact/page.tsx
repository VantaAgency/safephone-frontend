"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { FormField, Input, Textarea } from "@/components/ui/form-field";
import { WhatsAppIcon, MapPinIcon, ClockIcon, CheckCircleIcon } from "@/components/ui/icons";
import { contactFormSchema } from "@/lib/validation/schemas";

export default function ContactPage() {
  const { lang, t } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const result = contactFormSchema.safeParse(form);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    // No backend endpoint — simulate
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    }, 1500);
  };

  return (
    <div className="bg-slate-50 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="mb-4 inline-flex items-center rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
            {lang === "fr" ? "Contact" : "Contact"}
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-indigo-950 md:text-4xl">
            {t.contact.title}
          </h1>
          <p className="mt-3 text-lg text-slate-500">{t.contact.sub}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left: Info Cards */}
          <div className="space-y-4 lg:col-span-2">
            <a
              href="https://wa.me/221770000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl border border-[#25D366]/20 bg-[#25D366]/5 p-5 transition-colors hover:bg-[#25D366]/10"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white">
                <WhatsAppIcon size={22} />
              </div>
              <div>
                <div className="font-medium text-indigo-950">{t.contact.whatsapp}</div>
                <div className="text-sm text-slate-500">{t.contact.whatsappSub}</div>
                <div className="mt-1 text-sm font-semibold text-[#25D366]">+221 77 000 00 00</div>
              </div>
            </a>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-50">
                  <MapPinIcon size={18} className="text-slate-500" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t.contact.address}</div>
                  <div className="mt-1 text-sm text-indigo-950 whitespace-pre-line">{t.contact.addressValue}</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-50">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email</div>
                  <div className="mt-1 text-sm font-medium text-indigo-950">support@safephone.sn</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-50">
                  <ClockIcon size={18} className="text-slate-500" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t.contact.hours}</div>
                  <div className="mt-1 text-sm text-indigo-950 whitespace-pre-line">{t.contact.hoursValue}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-3">
            {success && (
              <div className="mb-6 rounded-[2rem] border border-emerald-200/60 bg-emerald-50 p-5">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon size={22} className="text-emerald-500" />
                  <span className="font-medium text-indigo-950">{t.contact.success}</span>
                </div>
              </div>
            )}

            <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label={t.contact.name} error={fieldErrors.name}>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Aminata Diallo"
                      error={!!fieldErrors.name}
                    />
                  </FormField>
                  <FormField label={t.contact.email} error={fieldErrors.email}>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="aminata@email.com"
                      error={!!fieldErrors.email}
                    />
                  </FormField>
                </div>
                <FormField label={t.contact.subject}>
                  <Input
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder={lang === "fr" ? "Comment pouvons-nous vous aider ?" : "How can we help?"}
                  />
                </FormField>
                <FormField label={t.contact.message} error={fieldErrors.message}>
                  <Textarea
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder={lang === "fr" ? "Décrivez votre demande..." : "Describe your request..."}
                    error={!!fieldErrors.message}
                  />
                </FormField>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={!form.name || !form.message}
                >
                  {t.contact.send}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
