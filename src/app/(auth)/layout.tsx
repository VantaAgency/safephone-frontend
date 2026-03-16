"use client";

import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { useLanguage } from "@/lib/language-context";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { lang, setLang } = useLanguage();

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50">
      {/* Decorative blur circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-yellow-200/20 blur-3xl" />
      </div>

      {/* Minimal header */}
      <header className="relative z-10 flex h-16 items-center justify-between px-5 md:px-8">
        <Link href="/">
          <Logo />
        </Link>
        <button
          onClick={() => setLang(lang === "fr" ? "en" : "fr")}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-[11px] font-medium text-slate-400 transition-all hover:border-indigo-950/25 hover:text-indigo-950 cursor-pointer"
        >
          {lang === "fr" ? "EN" : "FR"}
        </button>
      </header>

      {/* Centered content */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
