"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, MenuIcon, PhoneIcon, SettingsIcon, ShieldCheckIcon, UsersIcon, XIcon } from "@/components/ui/icons";
import { useAuth } from "@/lib/auth/auth-provider";
import { useAuthModal } from "@/components/auth/auth-modal-provider";
import { getHomeRouteForRole } from "@/lib/auth/home-route";
import type { Lang, Translations } from "@/lib/i18n";

interface NavbarProps {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}

const NAV_LINKS = [
  { key: "plans", href: "/forfaits" },
  { key: "mobitech", href: "/reparations" },
  { key: "partners", href: "/partenaires" },
  { key: "contact", href: "/contact" },
] as const;

interface AccountDestination {
  href: string;
  icon: typeof PhoneIcon;
  label: string;
  description: string;
}

export function Navbar({ lang, setLang, t }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isPending, signOut } = useAuth();
  const { openAuthModal } = useAuthModal();
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  const isActive = (href: string) => pathname === href;

  const handleSignOut = async () => {
    setAccountMenuOpen(false);
    setMobileOpen(false);
    await signOut();
    router.push("/");
  };

  const userName = user?.name?.trim() || t.nav.dashboard;
  const userInitials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "SP";

  const accountDestinations: AccountDestination[] = [
    {
      href: getHomeRouteForRole(user?.role === "member" ? "member" : undefined),
      icon: PhoneIcon,
      label: lang === "fr" ? "Mon espace" : "My space",
      description: lang === "fr" ? "Appareils, paiements et sinistres" : "Devices, payments and claims",
    },
  ];

  if (user?.role === "employee") {
    accountDestinations.unshift({
      href: "/espace-employe",
      icon: SettingsIcon,
      label: lang === "fr" ? "Espace employé" : "Employee workspace",
      description: lang === "fr" ? "Clients, suivis et opérations" : "Clients, follow-up and operations",
    });
  }

  if (user?.role === "partner") {
    accountDestinations.push({
      href: "/espace-partenaire",
      icon: UsersIcon,
      label: lang === "fr" ? "Espace partenaire" : "Partner dashboard",
      description: lang === "fr" ? "Clients, ventes et commissions" : "Clients, sales and commissions",
    });
  }

  if (user?.role === "admin") {
    accountDestinations.push({
      href: "/admin",
      icon: ShieldCheckIcon,
      label: lang === "fr" ? "Administration" : "Admin dashboard",
      description: lang === "fr" ? "Pilotage et supervision" : "Operations and oversight",
    });
  }

  useEffect(() => {
    if (!accountMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [accountMenuOpen]);

  return (
    <header className="fixed top-0 w-full z-50 glass-panel border-b border-slate-200/50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center space-x-8 md:flex">
          {NAV_LINKS.map(({ key, href }) => (
            <Link
              key={key}
              href={href}
              className={cn(
                "text-sm font-medium transition-colors",
                isActive(href)
                  ? "text-indigo-950"
                  : "text-slate-500 hover:text-indigo-950"
              )}
            >
              {t.nav[key as keyof typeof t.nav]}
            </Link>
          ))}
        </nav>

        {/* Desktop Right Section */}
        <div className="hidden items-center space-x-4 md:flex">
          <button
            onClick={() => setLang(lang === "fr" ? "en" : "fr")}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-medium text-slate-400 transition-colors hover:text-indigo-950 cursor-pointer"
          >
            {lang === "fr" ? "EN" : "FR"}
          </button>

          {isPending ? (
            <div className="h-8 w-20 animate-pulse rounded-full bg-slate-100" />
          ) : isAuthenticated ? (
            <div className="relative" ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => setAccountMenuOpen((open) => !open)}
                className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
                aria-haspopup="menu"
                aria-expanded={accountMenuOpen}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-950 text-xs font-semibold text-white">
                  {userInitials}
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
                    {lang === "fr" ? "Mon espace" : "My space"}
                  </div>
                  <div className="max-w-[140px] truncate text-sm font-medium text-indigo-950">
                    {userName}
                  </div>
                </div>
                <ChevronDownIcon
                  size={16}
                  className={cn(
                    "text-slate-400 transition-transform",
                    accountMenuOpen && "rotate-180"
                  )}
                />
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+0.75rem)] w-80 rounded-[1.5rem] border border-slate-200/80 bg-white p-3 shadow-xl shadow-slate-900/10">
                  <div className="rounded-[1.25rem] bg-slate-50 px-4 py-3">
                    <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                      {lang === "fr" ? "Compte" : "Account"}
                    </div>
                    <div className="mt-1 text-sm font-medium text-indigo-950">{userName}</div>
                    {user?.email && (
                      <div className="mt-0.5 text-xs text-slate-500">{user.email}</div>
                    )}
                  </div>

                  <div className="mt-3 space-y-1">
                    {accountDestinations.map(({ href, icon: Icon, label, description }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setAccountMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-[1.1rem] px-3 py-3 transition-colors",
                          isActive(href)
                            ? "bg-indigo-50 text-indigo-950"
                            : "hover:bg-slate-50 text-slate-600"
                        )}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80">
                          <Icon size={18} className={isActive(href) ? "text-indigo-600" : "text-slate-500"} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-indigo-950">{label}</div>
                          <div className="truncate text-xs text-slate-500">{description}</div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <Button variant="outline" size="sm" fullWidth onClick={handleSignOut}>
                      {lang === "fr" ? "Déconnexion" : "Sign out"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => openAuthModal("sign-in")}
                className="text-sm font-medium text-slate-500 hover:text-indigo-950 transition-colors cursor-pointer"
              >
                {t.nav.login}
              </button>
              <Link href="/inscription">
                <Button variant="primary" size="sm">
                  {lang === "fr" ? "M'abonner maintenant" : "Subscribe now"}
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Right */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setLang(lang === "fr" ? "en" : "fr")}
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-slate-400 cursor-pointer"
          >
            {lang === "fr" ? "EN" : "FR"}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:text-indigo-950 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-slate-200/50 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map(({ key, href }) => (
              <Link
                key={key}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  isActive(href)
                    ? "bg-indigo-50 text-indigo-950"
                    : "text-slate-500 hover:bg-slate-50 hover:text-indigo-950"
                )}
              >
                {t.nav[key as keyof typeof t.nav]}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
            {isAuthenticated ? (
              <>
                <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50 p-3">
                  <div className="flex items-center gap-3 px-1 pb-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-950 text-sm font-semibold text-white">
                      {userInitials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
                        {lang === "fr" ? "Mon espace" : "My space"}
                      </div>
                      <div className="truncate text-sm font-medium text-indigo-950">
                        {userName}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {accountDestinations.map(({ href, icon: Icon, label, description }) => (
                      <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                        <div className="flex items-center gap-3 rounded-[1rem] bg-white px-3 py-3 shadow-sm ring-1 ring-slate-200/70">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
                            <Icon size={18} className="text-slate-500" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-indigo-950">{label}</div>
                            <div className="truncate text-xs text-slate-500">{description}</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => { handleSignOut(); setMobileOpen(false); }}
                >
                  {lang === "fr" ? "Déconnexion" : "Sign out"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => { setMobileOpen(false); openAuthModal("sign-in"); }}
                >
                  {t.nav.login}
                </Button>
                <Link href="/inscription" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" fullWidth>
                    {lang === "fr" ? "M'abonner maintenant" : "Subscribe now"}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
