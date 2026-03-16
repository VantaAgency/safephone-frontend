"use client";

import { useLanguage } from "@/lib/language-context";

export function FAQSection() {
  const { t } = useLanguage();

  const faqs = [
    { q: t.home.faq1q, a: t.home.faq1a },
    { q: t.home.faq2q, a: t.home.faq2a },
    { q: t.home.faq3q, a: t.home.faq3a },
    { q: t.home.faq4q, a: t.home.faq4a },
  ];

  return (
    <section className="relative bg-white py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header — no badge, straight to h2 */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-normal tracking-tight text-indigo-950 md:text-4xl">
            {t.home.faqTitle}
          </h2>
          <p className="text-base text-slate-500">
            {t.home.faqSub}
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border border-slate-200 bg-slate-50 transition-all duration-300 open:bg-white open:shadow-sm"
            >
              <summary className="flex cursor-pointer items-center justify-between p-6 font-medium text-indigo-950 transition-colors hover:text-indigo-600 [&::-webkit-details-marker]:hidden">
                {faq.q}
                <svg
                  className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-2 border-t border-slate-100 px-6 pb-6 pt-4 text-sm leading-relaxed text-slate-500">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
