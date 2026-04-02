"use client";

import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { useLanguage } from "@/lib/language-context";
import { usePathname } from "next/navigation";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { lang, setLang, t } = useLanguage();
  const pathname = usePathname();
  const hideFooter = [
    "/forfaits",
    "/reparations",
    "/partenaires",
    "/inscription-compte",
    "/connexion",
    "/mot-de-passe-oublie",
    "/reinitialiser-mot-de-passe",
  ].includes(pathname);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar lang={lang} setLang={setLang} t={t} />
      <main className="flex-1 pt-16">{children}</main>
      {!hideFooter && <Footer t={t} />}
    </div>
  );
}
