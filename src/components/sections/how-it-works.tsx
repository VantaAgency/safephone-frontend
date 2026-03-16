"use client";

import { useLanguage } from "@/lib/language-context";

export function HowItWorks() {
  const { t } = useLanguage();

  const steps = [
    {
      num: "01",
      title: t.home.step1t,
      desc: t.home.step1,
      hoverBg: "group-hover:bg-indigo-50/40",
      blurBg: "bg-indigo-100/50 group-hover:bg-indigo-200/50",
      illustration: <Step1Illustration />,
    },
    {
      num: "02",
      title: t.home.step2t,
      desc: t.home.step2,
      hoverBg: "group-hover:bg-green-50/40",
      blurBg: "bg-green-100/50 group-hover:bg-green-200/50",
      illustration: <Step2Illustration />,
    },
    {
      num: "03",
      title: t.home.step3t,
      desc: t.home.step3,
      hoverBg: "group-hover:bg-orange-50/40",
      blurBg: "bg-orange-100/50 group-hover:bg-orange-200/50",
      illustration: <Step3Illustration />,
    },
    {
      num: "04",
      title: t.home.step4t,
      desc: t.home.step4,
      hoverBg: "group-hover:bg-indigo-50/40",
      blurBg: "bg-indigo-200/30 group-hover:bg-indigo-300/40",
      illustration: <Step4Illustration />,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-white py-24 md:py-32">
      {/* Background decor */}
      <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
        <div className="absolute top-[-10%] h-150 w-250 rounded-full bg-slate-50/80 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center md:mb-24">
          <div className="mb-6 inline-flex items-center rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1.5 shadow-sm backdrop-blur-sm">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {t.home.howBadge}
            </span>
          </div>
          <h2 className="mb-6 text-3xl font-medium tracking-tight text-indigo-950 md:text-5xl">
            {t.home.how}
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-500">
            {t.home.howSub}
          </p>
        </div>

        {/* 4-step grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {steps.map((step) => (
            <div
              key={step.num}
              className="group relative flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card transition-all duration-300 hover:border-slate-300 hover:shadow-lg"
            >
              {/* Step label */}
              <div className="mb-5 flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-slate-400">
                <span className="h-px w-4 bg-slate-200" />
                {`Étape ${step.num}`}
              </div>

              {/* Illustration */}
              <div className={`relative mb-6 flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 transition-colors duration-500 ${step.hoverBg}`}>
                <div className={`absolute h-32 w-32 rounded-full blur-2xl transition-colors duration-500 ${step.blurBg}`} />
                {step.illustration}
              </div>

              {/* Content */}
              <h3 className="mb-3 text-lg font-medium tracking-tight text-indigo-950">
                {step.title}
              </h3>
              <p className="mt-auto text-sm leading-relaxed text-slate-500">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Step1Illustration() {
  return (
    <div className="relative w-36 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-transform duration-500 group-hover:-translate-y-1 flex flex-col gap-2">
      <div className="mb-1 flex items-center justify-between">
        <div className="h-2 w-10 rounded-full bg-indigo-100" />
        <div className="h-2 w-2 rounded-full bg-yellow-400" />
      </div>
      <div className="mb-1 h-3 w-16 rounded-full bg-indigo-950" />
      <div className="mt-1 flex items-center gap-2">
        <svg className="h-3 w-3 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <div className="h-1.5 w-12 rounded-full bg-slate-100" />
      </div>
      <div className="flex items-center gap-2">
        <svg className="h-3 w-3 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <div className="h-1.5 w-8 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

function Step2Illustration() {
  return (
    <div className="relative flex h-28 w-16 items-center justify-center overflow-hidden rounded-2xl border-[3px] border-slate-800 bg-white shadow-sm transition-transform duration-500 group-hover:-translate-y-1">
      <div className="absolute top-1.5 h-1 w-5 rounded-full bg-slate-800" />
      <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-500">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <div className="absolute left-0 top-0 h-1/2 w-full border-b border-green-300/50 bg-linear-to-b from-transparent to-green-100/50 opacity-0 transition-all duration-700 group-hover:translate-y-4 group-hover:opacity-100" />
    </div>
  );
}

function Step3Illustration() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {/* Orange Money card */}
      <div className="absolute flex h-12 w-28 translate-x-3 translate-y-4 items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2 opacity-70 shadow-sm transition-transform duration-500 group-hover:translate-x-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
            <path d="M12 18V6" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="mb-1 h-2 w-10 rounded-full bg-slate-200" />
          <div className="h-1.5 w-6 rounded-full bg-slate-100" />
        </div>
      </div>
      {/* Wave card */}
      <div className="absolute z-10 flex h-12 w-28 -translate-x-3 -translate-y-2 items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2 shadow-md transition-transform duration-500 group-hover:-translate-x-4 group-hover:-translate-y-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500 text-white">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 6c.6 0 1.2-.2 1.6-.6C4 5 4.6 4.8 5.2 4.8c.6 0 1.2.2 1.6.6.4.4 1 .6 1.6.6.6 0 1.2-.2 1.6-.6.4-.4 1-.6 1.6-.6.6 0 1.2-.2 1.6-.6.4-.4 1-.6 1.6-.6" />
            <path d="M2 12c.6 0 1.2-.2 1.6-.6.4-.4 1-.6 1.6-.6.6 0 1.2.2 1.6.6.4-.4 1-.6 1.6-.6.6 0 1.2.2 1.6.6.4-.4 1-.6 1.6-.6.6 0 1.2-.2 1.6-.6.4-.4 1-.6 1.6-.6" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="mb-1 h-2 w-10 rounded-full bg-slate-200" />
          <div className="h-1.5 w-6 rounded-full bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

function Step4Illustration() {
  return (
    <div className="relative w-40 rounded-xl border border-indigo-800 bg-indigo-950 p-3.5 shadow-lg transition-transform duration-500 group-hover:-translate-y-1">
      <div className="mb-3.5 flex w-max items-center gap-1.5 rounded-full border border-white/5 bg-white/10 px-2 py-1">
        <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
        <span className="text-[8px] font-medium uppercase tracking-wider text-white">Réclamation Approuvée</span>
      </div>
      <div className="mb-3.5 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-700 bg-indigo-800 text-yellow-400 shadow-inner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
        <div>
          <div className="mb-1.5 h-2 w-14 rounded-full bg-indigo-100" />
          <div className="h-1.5 w-8 rounded-full bg-indigo-400/50" />
        </div>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-indigo-800/50 bg-indigo-900/50 p-2.5">
        <div className="h-1.5 w-12 rounded-full bg-indigo-300/50" />
        <div className="text-[10px] font-medium text-white">48h chez MobiTech</div>
      </div>
    </div>
  );
}
