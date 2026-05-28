"use client";

import Link from "next/link";

import { routesFor } from "@/lib/markets/routes";

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export interface LegalPageProps {
  badge: string;
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
  footnote?: string;
}

/**
 * Shared shell for SafePhone's US long-form legal pages (Terms, Privacy,
 * Membership Agreement). Pages stay 1:1 visually consistent — only the
 * content array changes per page.
 */
export default function USLegalPage({
  badge,
  title,
  lastUpdated,
  intro,
  sections,
  footnote,
}: LegalPageProps) {
  const routes = routesFor("US");

  return (
    <div className="relative isolate overflow-hidden bg-[#FAFAF8]">
      <section className="relative py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -top-28 right-0 h-[420px] w-[420px] rounded-full bg-indigo-100/30 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-5 md:px-10">
          <div className="mb-10 text-center md:mb-14">
            <div className="mb-4 inline-flex items-center rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
              {badge}
            </div>
            <h1 className="text-3xl font-medium tracking-tight text-indigo-950 md:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-sm text-slate-400">
              Last updated: {lastUpdated}
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-sm md:p-12">
            <p className="mb-10 text-base leading-relaxed text-slate-600">
              {intro}
            </p>

            <div className="space-y-10">
              {sections.map((section, idx) => (
                <div key={section.heading}>
                  <h2 className="mb-4 text-lg font-medium tracking-tight text-indigo-950">
                    {idx + 1}. {section.heading}
                  </h2>
                  <div className="space-y-4">
                    {section.paragraphs.map((p, i) => (
                      <p
                        key={i}
                        className="text-sm leading-relaxed text-slate-600"
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {footnote && (
              <div className="mt-12 rounded-2xl border border-slate-100 bg-[#FAFAF8] p-5">
                <p className="text-xs leading-relaxed text-slate-500">
                  {footnote}
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500">
            <Link href={routes.terms} className="transition hover:text-indigo-700">
              Terms
            </Link>
            <span className="text-slate-300">·</span>
            <Link href={routes.privacy} className="transition hover:text-indigo-700">
              Privacy
            </Link>
            <span className="text-slate-300">·</span>
            <Link
              href={routes.repairProtectionTerms}
              className="transition hover:text-indigo-700"
            >
              Membership agreement
            </Link>
            <span className="text-slate-300">·</span>
            <Link href={routes.contact} className="transition hover:text-indigo-700">
              Contact
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
