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
    <div className="relative flex w-full items-center justify-center gap-2 px-4 transition-transform duration-500 group-hover:-translate-y-1">
      {/* Essentiel card */}
      <div className="flex w-[72px] flex-col rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
        <div className="mb-2 h-1.5 w-8 rounded-full bg-slate-200" />
        <div className="mb-3 h-4 w-10 rounded bg-indigo-100" />
        <div className="space-y-1">
          <div className="h-1 w-full rounded-full bg-slate-100" />
          <div className="h-1 w-4/5 rounded-full bg-slate-100" />
        </div>
        <div className="mt-3 h-4 w-full rounded-md bg-slate-100" />
      </div>
      {/* Écran+ card — highlighted */}
      <div className="relative flex w-[80px] flex-col rounded-xl border-2 border-yellow-400 bg-indigo-950 p-2.5 shadow-md">
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400 px-1.5 py-0.5">
          <span className="text-[7px] font-bold text-indigo-950">POPULAIRE</span>
        </div>
        <div className="mb-2 h-1.5 w-8 rounded-full bg-indigo-700" />
        <div className="mb-3 h-4 w-10 rounded bg-yellow-400/20" />
        <div className="space-y-1">
          <div className="h-1 w-full rounded-full bg-indigo-800" />
          <div className="h-1 w-4/5 rounded-full bg-indigo-800" />
        </div>
        <div className="mt-3 h-4 w-full rounded-md bg-yellow-400/80" />
      </div>
      {/* Plus card */}
      <div className="flex w-[72px] flex-col rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
        <div className="mb-2 h-1.5 w-8 rounded-full bg-slate-200" />
        <div className="mb-3 h-4 w-10 rounded bg-indigo-100" />
        <div className="space-y-1">
          <div className="h-1 w-full rounded-full bg-slate-100" />
          <div className="h-1 w-4/5 rounded-full bg-slate-100" />
        </div>
        <div className="mt-3 h-4 w-full rounded-md bg-slate-100" />
      </div>
    </div>
  );
}

function Step2Illustration() {
  return (
    <div className="relative flex items-center gap-3 transition-transform duration-500 group-hover:-translate-y-1">
      {/* Phone outline */}
      <div className="relative flex h-28 w-14 shrink-0 flex-col items-center overflow-hidden rounded-2xl border-[3px] border-slate-700 bg-slate-50 shadow-sm">
        <div className="mt-1.5 h-1 w-5 rounded-full bg-slate-700" />
        <div className="mt-3 flex h-12 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-inner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400" aria-hidden="true">
            <rect width="14" height="20" x="5" y="2" rx="2" />
            <path d="M12 18h.01" />
          </svg>
        </div>
        <div className="mt-2 h-1 w-4 rounded-full bg-slate-300" />
      </div>
      {/* IMEI input panel */}
      <div className="flex flex-col gap-1.5 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
        <div className="h-1.5 w-14 rounded-full bg-slate-200" />
        <div className="flex items-center gap-1 rounded-lg border border-indigo-300 bg-indigo-50 px-2 py-1.5">
          <div className="flex gap-0.5">
            {([9, 6, 12, 8, 11] as const).map((w) => (
              <div key={w} className="h-1.5 rounded-full bg-indigo-400" style={{ width: `${w}px` }} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-100">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-600" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div className="h-1.5 w-12 rounded-full bg-green-200" />
        </div>
      </div>
    </div>
  );
}

function Step3Illustration() {
  return (
    <div className="relative flex w-full flex-col items-center gap-2 px-4 transition-transform duration-500 group-hover:-translate-y-1">
      {/* Payment confirmation card */}
      <div className="w-full max-w-[160px] rounded-xl border border-slate-200 bg-white p-3 shadow-md">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-md bg-blue-500" />
            <div className="h-2 w-10 rounded-full bg-slate-200" />
          </div>
          <div className="flex items-center gap-1 rounded-full bg-green-100 px-1.5 py-0.5">
            <span className="h-1 w-1 rounded-full bg-green-500" />
            <span className="text-[7px] font-medium text-green-700">OK</span>
          </div>
        </div>
        <div className="mb-1 h-1.5 w-16 rounded-full bg-slate-100" />
        <div className="mb-3 flex items-baseline gap-1">
          <div className="h-4 w-14 rounded bg-indigo-950" />
          <div className="h-2.5 w-8 rounded bg-slate-200" />
        </div>
        <div className="h-6 w-full rounded-lg bg-yellow-400" />
      </div>
      {/* Two payment method pills */}
      <div className="flex gap-2">
        <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm">
          <div className="h-3 w-3 rounded-sm bg-blue-500" />
          <div className="h-1.5 w-6 rounded-full bg-slate-200" />
        </div>
        <div className="flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-1 shadow-sm">
          <div className="h-3 w-3 rounded-sm bg-orange-500" />
          <div className="h-1.5 w-8 rounded-full bg-orange-200" />
        </div>
      </div>
    </div>
  );
}

function Step4Illustration() {
  return (
    <div className="relative flex w-full flex-col gap-2 px-3 transition-transform duration-500 group-hover:-translate-y-1">
      {/* Claim submitted */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="mb-1 h-1.5 w-16 rounded-full bg-slate-200" />
          <div className="h-1 w-10 rounded-full bg-slate-100" />
        </div>
        <div className="rounded-full bg-yellow-100 px-1.5 py-0.5">
          <span className="text-[7px] font-semibold text-yellow-700">En attente</span>
        </div>
      </div>
      {/* Arrow */}
      <div className="flex justify-center">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300" aria-hidden="true">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
      {/* MobiTech repair confirmed */}
      <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-2.5 shadow-sm">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green-500 text-white">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="mb-1 h-1.5 w-14 rounded-full bg-green-300" />
          <div className="h-1 w-10 rounded-full bg-green-200" />
        </div>
        <div className="rounded-full bg-green-200 px-1.5 py-0.5">
          <span className="text-[7px] font-semibold text-green-800">MobiTech 48h</span>
        </div>
      </div>
    </div>
  );
}
