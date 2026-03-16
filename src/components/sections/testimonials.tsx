"use client";

import { useLanguage } from "@/lib/language-context";

const TESTIMONIALS = [
  {
    name: "Aminata D.",
    location: "Dakar, Plateau",
    quote: "Mon écran s'est cassé la semaine dernière. J'ai fait ma réclamation sur le site SafePhone, validée en 1h. J'ai déposé le téléphone chez MobiTech Plateau et je l'ai récupéré comme neuf le lendemain. Je n'ai sorti aucun FCFA supplémentaire.",
    quoteEn: "My screen cracked last week. I filed my claim on SafePhone, validated in 1h. I dropped the phone at MobiTech Plateau and picked it up like new the next day. I didn't spend a single extra FCFA.",
    initials: "AD",
    avatarClass: "border-indigo-100 bg-indigo-50 text-indigo-600",
    rating: 5,
  },
  {
    name: "Moussa F.",
    location: "Thiès",
    quote: "Payer 4000F par mois via Wave c'est invisible, mais le jour où mon téléphone est tombé, j'étais tellement soulagé de ne pas avoir à chercher 60 000F pour remplacer l'écran. C'est indispensable au Sénégal.",
    quoteEn: "Paying 4000F per month via Wave is invisible, but the day my phone fell, I was so relieved not to have to find 60,000F to replace the screen. It's essential in Senegal.",
    initials: "MF",
    avatarClass: "border-yellow-100 bg-yellow-50 text-yellow-600",
    rating: 4,
  },
  {
    name: "Ousmane S.",
    location: "Dakar, Almadies",
    quote: "Un service client au top. Mon téléphone avait un problème après réparation, ils l'ont repris sans discuter avec la garantie MobiTech incluse. C'est rare d'avoir ce niveau de professionnalisme au Sénégal.",
    quoteEn: "Top-notch customer service. My phone had an issue after repair and they took it back without discussion with the included MobiTech warranty. This level of professionalism is rare in Senegal.",
    initials: "OS",
    avatarClass: "border-green-100 bg-green-50 text-green-600",
    rating: 5,
  },
];

function StarFilled() {
  return (
    <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function StarEmpty() {
  return (
    <svg className="h-4 w-4 text-slate-200" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

const QuoteMark = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor" className="text-indigo-900" aria-hidden="true">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.999v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
  </svg>
);

export function Testimonials() {
  const { lang, t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-slate-50 py-24 md:py-32">
      {/* Background blurs */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-full w-full max-w-7xl -translate-x-1/2">
        <div className="absolute top-1/2 left-1/4 h-125 w-125 -translate-y-1/2 rounded-full bg-yellow-100/30 blur-[100px]" />
        <div className="absolute top-1/2 right-1/4 h-125 w-125 -translate-y-1/2 rounded-full bg-indigo-100/30 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center md:mb-20">
          <div className="mb-6 inline-flex items-center rounded-full border border-slate-200/80 bg-white px-3 py-1.5 shadow-sm backdrop-blur-sm">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {t.home.testimonialsBadge}
            </span>
          </div>
          <h2 className="mb-5 text-3xl font-normal tracking-tight text-indigo-950 md:text-4xl lg:text-5xl">
            {t.home.testimonialsTitle}
          </h2>
          <p className="text-base leading-relaxed text-slate-500">
            {t.home.testimonialsSub}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {TESTIMONIALS.map((item) => (
            <div
              key={item.initials}
              className="group relative flex h-full flex-col rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-card transition-all duration-300 hover:border-slate-300 hover:shadow-lg"
            >
              {/* Decorative quote mark */}
              <div className="pointer-events-none absolute top-0 right-0 p-8 opacity-[0.03] transition-opacity duration-500 group-hover:opacity-10">
                <QuoteMark />
              </div>

              {/* Stars */}
              <div className="relative z-10 mb-6 flex gap-1">
                {([1, 2, 3, 4, 5] as const).map((n) =>
                  n <= item.rating ? <StarFilled key={n} /> : <StarEmpty key={n} />
                )}
              </div>

              {/* Quote */}
              <p className="relative z-10 mb-8 grow text-sm leading-relaxed text-slate-600 md:text-base">
                &ldquo;{lang === "fr" ? item.quote : item.quoteEn}&rdquo;
              </p>

              {/* Author */}
              <div className="relative z-10 mt-auto flex items-center gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-medium shadow-sm ${item.avatarClass}`}>
                  {item.initials}
                </div>
                <div>
                  <p className="text-sm font-medium tracking-tight text-indigo-950">{item.name}</p>
                  <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    {item.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
