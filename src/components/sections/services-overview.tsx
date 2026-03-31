"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ClaimAccessModal, CLAIM_DASHBOARD_HREF } from "@/components/claims/claim-access-modal";
import { useAuth } from "@/lib/auth/auth-provider";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

type ServiceCard = {
  href: string;
  image: string;
  imageAlt: string;
  title: string;
  desc: string;
};

export function ServicesOverview() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { lang, t } = useLanguage();
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const cards: (ServiceCard & { requiresClaimFlow?: boolean })[] = [
    {
      href: CLAIM_DASHBOARD_HREF,
      image: "/home-services/signal.png",
      imageAlt:
        lang === "fr"
          ? "Suivi d'une demande sur smartphone"
          : "Tracking a request on a smartphone",
      title: t.home.servicesCard2Title,
      desc: t.home.servicesCard2Desc,
      requiresClaimFlow: true,
    },
    {
      href: "/inscription",
      image: "/home-services/protect-phone.jpg",
      imageAlt:
        lang === "fr"
          ? "Smartphone présenté en main"
          : "Smartphone held in hand",
      title: t.home.servicesCard1Title,
      desc: t.home.servicesCard1Desc,
    },
    {
      href: "/reparations",
      image: "/home-services/repair-phone.jpg",
      imageAlt:
        lang === "fr"
          ? "Technicien réparant un téléphone"
          : "Technician repairing a phone",
      title: t.home.servicesCard3Title,
      desc: t.home.servicesCard3Desc,
    },
    {
      href: "/forfaits",
      image: "/home-services/cover-tech.png",
      imageAlt:
        lang === "fr"
          ? "Plusieurs appareils posés ensemble"
          : "Multiple devices grouped together",
      title: t.home.servicesCard5Title,
      desc: t.home.servicesCard5Desc,
    },
  ];

  const handleCardClick = (card: (typeof cards)[number]) => {
    if (!card.requiresClaimFlow) {
      router.push(card.href);
      return;
    }

    if (!isAuthenticated) {
      setIsClaimModalOpen(true);
      return;
    }

    router.push(CLAIM_DASHBOARD_HREF);
  };

  useEffect(() => {
    const node = carouselRef.current;
    if (!node) return;

    const handleScroll = () => {
      const slideWidth = node.clientWidth * 0.86;
      if (!slideWidth) return;
      const nextIndex = Math.round(node.scrollLeft / slideWidth);
      setActiveIndex(Math.max(0, Math.min(cards.length - 1, nextIndex)));
    };

    node.addEventListener("scroll", handleScroll, { passive: true });
    return () => node.removeEventListener("scroll", handleScroll);
  }, [cards.length]);

  const scrollToCard = (index: number) => {
    const node = carouselRef.current;
    if (!node) return;
    node.scrollTo({
      left: node.clientWidth * 0.86 * index,
      behavior: "smooth",
    });
    setActiveIndex(index);
  };

  return (
    <section className="bg-white pt-4 pb-16 md:pt-6 md:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <h2 className="text-3xl font-semibold tracking-tight text-indigo-950 md:text-4xl">
            {t.home.servicesTitle}
          </h2>
        </div>

        <div
          ref={carouselRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] sm:hidden [&::-webkit-scrollbar]:hidden"
        >
          {cards.map((card) => (
            <button
              type="button"
              key={card.title}
              onClick={() => handleCardClick(card)}
              className="group min-w-[86%] snap-center overflow-hidden rounded-[1.55rem] border border-slate-200 bg-white text-left transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
            >
              <div className="relative aspect-[5/3] overflow-hidden bg-slate-100">
                <Image
                  src={card.image}
                  alt={card.imageAlt}
                  fill
                  sizes="(min-width: 1280px) 22vw, (min-width: 640px) 46vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>

              <div className="px-5 py-5">
                <h3 className="text-[1.05rem] font-semibold tracking-tight text-indigo-950">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {card.desc}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between sm:hidden">
          <div className="flex items-center gap-2">
            {cards.map((card, index) => (
              <button
                key={card.title}
                type="button"
                aria-label={`${t.home.servicesTitle} ${index + 1}`}
                onClick={() => scrollToCard(index)}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  activeIndex === index ? "w-7 bg-indigo-950" : "w-2.5 bg-slate-300"
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous card"
              onClick={() => scrollToCard(Math.max(0, activeIndex - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-indigo-950 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={activeIndex === 0}
            >
              <span className="text-lg leading-none">←</span>
            </button>
            <button
              type="button"
              aria-label="Next card"
              onClick={() => scrollToCard(Math.min(cards.length - 1, activeIndex + 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-indigo-950 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={activeIndex === cards.length - 1}
            >
              <span className="text-lg leading-none">→</span>
            </button>
          </div>
        </div>

        <div className="hidden grid-cols-1 gap-4 sm:grid sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <button
              type="button"
              key={card.title}
              onClick={() => handleCardClick(card)}
              className="group overflow-hidden rounded-[1.55rem] border border-slate-200 bg-white text-left transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
            >
              <div className="relative aspect-[5/3] overflow-hidden bg-slate-100">
                <Image
                  src={card.image}
                  alt={card.imageAlt}
                  fill
                  sizes="(min-width: 1280px) 22vw, (min-width: 640px) 46vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>

              <div className="px-5 py-5">
                <h3 className="text-[1.05rem] font-semibold tracking-tight text-indigo-950">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {card.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <ClaimAccessModal
        open={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
      />
    </section>
  );
}
