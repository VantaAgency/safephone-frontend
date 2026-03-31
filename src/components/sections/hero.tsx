"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ClaimAccessModal, CLAIM_DASHBOARD_HREF } from "@/components/claims/claim-access-modal";
import { LaptopIcon, PhoneIcon, PlugIcon, TabletIcon, TvIcon } from "@/components/ui/icons";
import type { DeviceType } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-provider";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

// ─── Icons ────────────────────────────────────────────────────────────────────

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}

function ExclamationTriangleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  );
}

function WrenchScrewdriverIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
    </svg>
  );
}

function InformationCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ActivePanel = null | "step1" | "step2";

type DeviceOption = {
  id: DeviceType;
  label: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string; size?: number }>;
  recommendedPlanSlug: string;
};

const STEP2_HREFS: Record<string, string> = {
  opt1: "/inscription",
  opt2: CLAIM_DASHBOARD_HREF,
  opt3: "/reparations",
  opt4: "#comment-ca-marche",
};

// ─── Device image card ────────────────────────────────────────────────────────

function DeviceCard({
  label,
  desc,
  Icon,
  selected,
  onClick,
}: DeviceOption & { selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex items-start gap-4 rounded-[1.35rem] border p-4 text-left transition-all duration-150 focus-visible:outline-none",
        selected
          ? "border-indigo-950 bg-white shadow-[0_10px_24px_rgba(67,56,202,0.08)]"
          : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-sm"
      )}
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-slate-50">
        <Icon
          size={20}
          className={cn(
            "transition-colors",
            selected ? "text-indigo-700" : "text-slate-400 group-hover:text-indigo-500"
          )}
        />
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "text-sm font-semibold",
            selected ? "text-indigo-950" : "text-indigo-900"
          )}
        >
          {label}
        </p>
        <p className="mt-1.5 text-sm leading-7 text-slate-500">
          {desc}
        </p>
      </div>
    </button>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export function Hero() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const h = t.hero;

  const [selectedDeviceType, setSelectedDeviceType] =
    useState<DeviceType>("smartphone");
  const [step2Value, setStep2Value] = useState<string>(h.barStep2Default);
  const [step2Key, setStep2Key] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setActivePanel(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function togglePanel(panel: ActivePanel) {
    setActivePanel((prev) => (prev === panel ? null : panel));
  }

  function selectStep1(deviceType: DeviceType) {
    setSelectedDeviceType(deviceType);
    setActivePanel("step2");
  }

  function selectStep2(label: string, key: string) {
    setStep2Value(label);
    setStep2Key(key);
    setActivePanel(null);
  }

  // Step 1 — device categories
  const step1Options: DeviceOption[] = [
    {
      id: "smartphone",
      label: h.panel1Opt1,
      desc: h.panel1Opt1Desc,
      Icon: PhoneIcon,
      recommendedPlanSlug: "ecran-plus",
    },
    {
      id: "tablet",
      label: h.panel1Opt2,
      desc: h.panel1Opt2Desc,
      Icon: TabletIcon,
      recommendedPlanSlug: "totale",
    },
    {
      id: "tv",
      label: h.panel1Opt3,
      desc: h.panel1Opt3Desc,
      Icon: TvIcon,
      recommendedPlanSlug: "totale",
    },
    {
      id: "computer",
      label: h.panel1Opt4,
      desc: h.panel1Opt4Desc,
      Icon: LaptopIcon,
      recommendedPlanSlug: "totale",
    },
    {
      id: "home_electronics",
      label: h.panel1Opt5,
      desc: h.panel1Opt5Desc,
      Icon: PlugIcon,
      recommendedPlanSlug: "totale",
    },
  ];

  const selectedDeviceOption =
    step1Options.find((option) => option.id === selectedDeviceType) ??
    step1Options[0];

  const ctaHref = (() => {
    if (!step2Key) return "/forfaits";

    if (step2Key === "opt1") {
      const params = new URLSearchParams({
        plan: selectedDeviceOption.recommendedPlanSlug,
        device_type: selectedDeviceOption.id,
      });
      return `/inscription?${params.toString()}`;
    }

    return STEP2_HREFS[step2Key] ?? "/forfaits";
  })();

  const step2Options = [
    { key: "opt1", label: h.panel2Opt1, desc: h.panel2Opt1Desc, Icon: ShieldCheckIcon,         color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100" },
    { key: "opt2", label: h.panel2Opt2, desc: h.panel2Opt2Desc, Icon: ExclamationTriangleIcon, color: "text-amber-500",  bg: "bg-amber-50 border-amber-100" },
    { key: "opt3", label: h.panel2Opt3, desc: h.panel2Opt3Desc, Icon: WrenchScrewdriverIcon,   color: "text-emerald-600",bg: "bg-emerald-50 border-emerald-100" },
    { key: "opt4", label: h.panel2Opt4, desc: h.panel2Opt4Desc, Icon: InformationCircleIcon,   color: "text-slate-500",  bg: "bg-slate-50 border-slate-200" },
  ];

  function handleContinue() {
    if (!step2Key) {
      router.push("/forfaits");
      return;
    }

    if (step2Key === "opt2") {
      if (!isAuthenticated) {
        setIsClaimModalOpen(true);
        return;
      }

      router.push(CLAIM_DASHBOARD_HREF);
      return;
    }

    router.push(ctaHref);
  }

  return (
    <section className="relative z-20 isolate bg-[#FAFAF8] pt-16 pb-18 md:pt-24 md:pb-20">

      {/* Background blobs — contained so they don't spill */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 right-0 h-[500px] w-[500px] rounded-full bg-indigo-100/40 blur-3xl" />
        <div className="absolute top-1/2 -left-32 h-[400px] w-[400px] rounded-full bg-yellow-100/40 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 md:flex-row lg:gap-20">

          {/* ── Left column ── */}
          <div className="flex w-full flex-col items-start md:w-[52%]">

            {/* Headline */}
            <h1 className="mb-4 text-4xl font-semibold leading-[1.12] tracking-tight text-indigo-950 md:text-5xl lg:text-[3.25rem]">
              {h.title}
            </h1>

            {/* Subtitle */}
            <p className="mb-8 max-w-md text-base leading-relaxed text-slate-500 md:text-lg">
              {h.subtitle}
            </p>

            {/* ── Multi-step expandable bar ── */}
            <div ref={barRef} className="relative z-[70] w-full max-w-xl">

              {/* Pill bar */}
              <div className={cn(
                "flex items-stretch overflow-hidden rounded-2xl border bg-white shadow-lg shadow-slate-200/60 transition-all duration-200",
                activePanel ? "border-indigo-200 ring-2 ring-indigo-100" : "border-slate-200 hover:border-slate-300"
              )}>
                {/* Step 1 */}
                <button
                  type="button"
                  onClick={() => togglePanel("step1")}
                  className="group flex flex-1 flex-col items-start gap-0.5 border-r border-slate-100 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    {h.barStep1Label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-indigo-950">{selectedDeviceOption.label}</span>
                    <ChevronDownIcon className={cn("h-3.5 w-3.5 text-slate-400 transition-transform", activePanel === "step1" && "rotate-180")} />
                  </div>
                </button>

                {/* Step 2 */}
                <button
                  type="button"
                  onClick={() => togglePanel("step2")}
                  className="group flex flex-1 flex-col items-start gap-0.5 border-r border-slate-100 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    {h.barStep2Label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={cn("text-sm font-semibold", step2Key ? "text-indigo-950" : "text-slate-400")}>
                      {step2Value}
                    </span>
                    <ChevronDownIcon className={cn("h-3.5 w-3.5 text-slate-400 transition-transform", activePanel === "step2" && "rotate-180")} />
                  </div>
                </button>

                {/* CTA */}
                <button
                  type="button"
                  onClick={handleContinue}
                  className="flex flex-shrink-0 items-center gap-2 rounded-r-2xl bg-yellow-400 px-5 py-3.5 text-sm font-semibold text-indigo-950 transition-colors hover:bg-yellow-500 focus-visible:outline-none"
                >
                  <span className="hidden sm:inline">{h.barCta}</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>

              {/* ── Expanded panel ── */}
              {activePanel && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[90] isolate overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/80 ring-1 ring-slate-100">
                  <div className="absolute inset-0 -z-10 bg-white/100" />

                  {/* Step 1 — device category cards */}
                  {activePanel === "step1" && (
                    <div className="p-5">
                      <p className="mb-4 px-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        {h.panel1Title}
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {step1Options.map((opt) => (
                          <DeviceCard
                            key={opt.id}
                            {...opt}
                            selected={selectedDeviceType === opt.id}
                            onClick={() => selectStep1(opt.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2 — service selector */}
                  {activePanel === "step2" && (
                    <div className="p-4">
                      <p className="mb-3 px-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        {h.panel2Title}
                      </p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {step2Options.map(({ key, label, desc, Icon, color, bg }) => (
                          <button
                            type="button"
                            key={key}
                            onClick={() => selectStep2(label, key)}
                            className={cn(
                              "group flex items-start gap-3.5 rounded-xl border p-4 text-left transition-all hover:shadow-sm focus-visible:outline-none",
                              step2Key === key
                                ? "border-indigo-200 bg-indigo-50/60"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                            )}
                          >
                            <div className={cn("mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border", bg)}>
                              <Icon className={cn("h-[18px] w-[18px]", color)} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-indigo-950">{label}</p>
                              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Social proof */}
            <div className="mt-7 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[
                  { bg: "bg-indigo-500", text: "A" },
                  { bg: "bg-yellow-400", text: "B" },
                  { bg: "bg-emerald-500", text: "C" },
                  { bg: "bg-indigo-300", text: "D" },
                ].map((item) => (
                  <div
                    key={item.text}
                    className={cn("flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#FAFAF8] text-[10px] font-bold text-white shadow-sm", item.bg)}
                  >
                    {item.text}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">{h.socialProof}</p>
            </div>
          </div>

          {/* ── Right column — modular insights ── */}
          <div className="relative flex w-full items-center justify-center md:w-[48%]">

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
              <div className="h-72 w-72 rounded-full bg-indigo-100/60 blur-3xl" />
            </div>

            <div className="relative z-10 grid w-full max-w-xl grid-cols-2 gap-4 md:gap-5">
              <div className="relative min-h-[12.5rem] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[#F7F5FF]">
                <Image
                  src="/safePhoneHeroSectionIllustration.png"
                  alt={h.visualImageAlt}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="flex min-h-[12.5rem] flex-col justify-between rounded-[1.75rem] border border-indigo-100 bg-[#F4F0FF] p-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-400">
                    {h.visualSavingsLabel}
                  </p>
                  <p className="mt-4 text-3xl font-semibold leading-none tracking-tight text-indigo-950 md:text-[2.65rem]">
                    {h.visualSavingsValue}
                  </p>
                </div>
                <p className="max-w-[12rem] text-sm leading-6 text-slate-500">
                  {h.visualSavingsNote}
                </p>
              </div>

              <div className="flex min-h-[10.5rem] flex-col rounded-[1.75rem] border border-slate-200 bg-white p-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    {h.visualRepairLabel}
                  </p>
                  <p className="mt-3 text-3xl font-semibold leading-none tracking-tight text-indigo-950 md:text-[2.35rem]">
                    {h.visualRepairValue}
                  </p>
                  <p className="mt-3 text-base font-semibold leading-6 text-indigo-950">
                    {h.visualRepairSummary}
                  </p>
                </div>
                <p className="mt-4 max-w-[13rem] text-sm leading-6 text-slate-500">
                  {h.visualRepairNote}
                </p>
              </div>

              <div className="flex min-h-[10.5rem] flex-col justify-between rounded-[1.75rem] border border-yellow-100 bg-[#FFF9E8] p-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-500">
                    {h.visualSupportLabel}
                  </p>
                  <p className="mt-4 text-xl font-semibold leading-tight tracking-tight text-indigo-950 md:text-2xl">
                    {h.visualSupportValue}
                  </p>
                </div>
                <p className="max-w-[13rem] text-sm leading-6 text-slate-500">
                  {h.visualSupportNote}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      <ClaimAccessModal
        open={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
      />
    </section>
  );
}
