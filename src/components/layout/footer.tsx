import Link from "next/link";
import { Logo } from "./logo";
import type { Translations } from "@/lib/i18n";

interface FooterProps {
  t: Translations;
}

export function Footer({ t }: FooterProps) {
  return (
    <footer className="border-t border-slate-200/60 bg-white pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-12 lg:gap-8">
          {/* Brand Info */}
          <div className="md:col-span-12 lg:col-span-4">
            <Logo />
            <p className="mt-4 pr-4 text-sm leading-relaxed text-slate-500">
              {t.footer.description}
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 transition-colors hover:border-indigo-200 hover:text-indigo-600"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 transition-colors hover:border-indigo-200 hover:text-indigo-600"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z" />
                </svg>
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 transition-colors hover:border-indigo-200 hover:text-indigo-600"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Insurance Links */}
          <div className="md:col-span-4 lg:col-span-3 lg:col-start-6">
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-tight text-indigo-950">
              {t.footer.product}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/forfaits" className="text-sm text-slate-500 transition-colors hover:text-indigo-600">
                  {t.nav.plans}
                </Link>
              </li>
              <li>
                <Link href="/sinistres" className="text-sm text-slate-500 transition-colors hover:text-indigo-600">
                  {t.nav.claims}
                </Link>
              </li>
              <li>
                <Link href="/inscription" className="text-sm text-slate-500 transition-colors hover:text-indigo-600">
                  {t.nav.register}
                </Link>
              </li>
            </ul>
          </div>

          {/* Network Links */}
          <div className="md:col-span-4 lg:col-span-2">
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-tight text-indigo-950">
              {t.footer.company}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/partenaires" className="text-sm text-slate-500 transition-colors hover:text-indigo-600">
                  {t.nav.partners}
                </Link>
              </li>
              <li>
                <Link href="/reparations" className="text-sm text-slate-500 transition-colors hover:text-indigo-600">
                  {t.nav.mobitech}
                </Link>
              </li>
              <li>
                <Link href="/espace-partenaire" className="text-sm text-slate-500 transition-colors hover:text-indigo-600">
                  {t.footer.help}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="md:col-span-4 lg:col-span-2">
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-tight text-indigo-950">
              {t.footer.support}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-sm text-slate-500 transition-colors hover:text-indigo-600">
                  {t.nav.contact}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-slate-500 transition-colors hover:text-indigo-600">
                  {t.footer.terms}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-slate-500 transition-colors hover:text-indigo-600">
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-slate-500 transition-colors hover:text-indigo-600">
                  {t.footer.legal}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Line */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 md:flex-row">
          <p className="text-sm text-slate-400">
            &copy; 2025 {t.footer.copyright}
          </p>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <span className="text-xs font-medium text-slate-500">
              Tous les systèmes opérationnels
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
