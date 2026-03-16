"use client";

import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { useLanguage } from "@/lib/language-context";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar lang={lang} setLang={setLang} t={t} />
      <main className="flex-1 pt-16">{children}</main>
      <Footer t={t} />
    </div>
  );
}
