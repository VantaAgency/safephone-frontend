"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

const TESTIMONIALS = [
  {
    name: "Aminata D.",
    context: "Formule Ecran+",
    quote: "J'ai declare mon ecran casse en ligne et tout est alle tres vite.",
    quoteEn: "I reported my broken screen online and everything moved very quickly.",
    avatar: "/avatars/customer-a.svg",
    rating: 5,
  },
  {
    name: "Moussa F.",
    context: "Paiement mensuel via Wave",
    quote: "3 500 FCFA par mois, et zero surprise le jour ou mon telephone est tombe.",
    quoteEn: "3,500 FCFA per month, and no surprise the day my phone fell.",
    avatar: "/avatars/customer-b.svg",
    rating: 5,
  },
  {
    name: "Ousmane S.",
    context: "Suivi de dossier en ligne",
    quote: "Le suivi etait clair. Je savais exactement ou en etait ma reparation.",
    quoteEn: "The tracking was clear. I always knew where my repair stood.",
    avatar: "/avatars/customer-c.svg",
    rating: 5,
  },
  {
    name: "Fatou N.",
    context: "Protection de smartphone",
    quote: "L'abonnement est simple, et la prise en charge s'est faite sans frais en plus.",
    quoteEn: "The subscription is simple, and the service was handled with no extra fees.",
    avatar: "/avatars/customer-a.svg",
    rating: 5,
  },
  {
    name: "Cheikh T.",
    context: "Souscription rapide",
    quote: "J'ai souscrit depuis mon telephone en quelques minutes seulement.",
    quoteEn: "I subscribed from my phone in just a few minutes.",
    avatar: "/avatars/customer-b.svg",
    rating: 4,
  },
  {
    name: "Marième S.",
    context: "Assistance SafePhone",
    quote: "Quand j'ai eu un probleme, j'ai ete orientee vite vers la bonne solution.",
    quoteEn: "When I had an issue, I was quickly guided to the right solution.",
    avatar: "/avatars/customer-c.svg",
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

function getCardsPerPage(width: number) {
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
}

export function Testimonials() {
  const { lang, t } = useLanguage();
  const [cardsPerPage, setCardsPerPage] = useState(3);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const syncLayout = () => {
      setCardsPerPage(getCardsPerPage(window.innerWidth));
    };

    syncLayout();
    window.addEventListener("resize", syncLayout);
    return () => window.removeEventListener("resize", syncLayout);
  }, []);

  const pages = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < TESTIMONIALS.length; i += cardsPerPage) {
      chunks.push(TESTIMONIALS.slice(i, i + cardsPerPage));
    }
    return chunks;
  }, [cardsPerPage]);

  const currentPage = Math.min(page, Math.max(0, pages.length - 1));

  return (
    <section className="relative overflow-hidden bg-slate-50 py-24 md:py-32">
      <div className="pointer-events-none absolute top-0 left-1/2 h-full w-full max-w-7xl -translate-x-1/2">
        <div className="absolute top-1/2 left-1/4 h-125 w-125 -translate-y-1/2 rounded-full bg-yellow-100/30 blur-[100px]" />
        <div className="absolute top-1/2 right-1/4 h-125 w-125 -translate-y-1/2 rounded-full bg-indigo-100/30 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <div className="mb-6 inline-flex items-center rounded-full border border-slate-200/80 bg-white px-3 py-1.5 shadow-sm backdrop-blur-sm">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {t.home.testimonialsBadge}
            </span>
          </div>
          <h2 className="mb-5 text-3xl font-semibold tracking-tight text-indigo-950 md:text-4xl lg:text-5xl">
            {t.home.testimonialsTitle}
          </h2>
          <p className="text-base leading-relaxed text-slate-500">
            {t.home.testimonialsSub}
          </p>
        </div>

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentPage * 100}%)` }}
          >
            {pages.map((group, groupIndex) => (
              <div
                key={groupIndex}
                className="grid min-w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
              >
                {group.map((item) => (
                  <article
                    key={`${groupIndex}-${item.name}`}
                    className="group relative flex h-full flex-col rounded-[2rem] border border-slate-200/80 bg-white p-7 shadow-card transition-all duration-300 hover:border-slate-300 hover:shadow-lg md:p-8"
                  >
                    <div className="pointer-events-none absolute top-0 right-0 p-8 opacity-[0.03] transition-opacity duration-500 group-hover:opacity-10">
                      <QuoteMark />
                    </div>

                    <div className="relative z-10 mb-5 flex items-center gap-4">
                      <div className="relative h-14 w-14 overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-sm">
                        <Image
                          src={item.avatar}
                          alt={item.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold tracking-tight text-indigo-950">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-slate-400">
                          {item.context}
                        </p>
                      </div>
                    </div>

                    <div className="relative z-10 mb-4 flex gap-1">
                      {([1, 2, 3, 4, 5] as const).map((n) =>
                        n <= item.rating ? <StarFilled key={n} /> : <StarEmpty key={n} />
                      )}
                    </div>

                    <p className="relative z-10 grow text-sm leading-7 text-slate-600 md:text-base">
                      &ldquo;{lang === "fr" ? item.quote : item.quoteEn}&rdquo;
                    </p>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {pages.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`${t.home.testimonialsTitle} ${index + 1}`}
                onClick={() => setPage(index)}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  currentPage === index ? "w-7 bg-indigo-950" : "w-2.5 bg-slate-300"
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous testimonials"
              onClick={() => setPage(Math.max(0, currentPage - 1))}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-indigo-950 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage === 0}
            >
              <span className="text-lg leading-none">←</span>
            </button>
            <button
              type="button"
              aria-label="Next testimonials"
              onClick={() => setPage(Math.min(pages.length - 1, currentPage + 1))}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-indigo-950 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage === pages.length - 1}
            >
              <span className="text-lg leading-none">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
