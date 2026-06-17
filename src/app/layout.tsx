import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import { AppShell } from "@/components/layout/app-shell";
import { LanguageProvider } from "@/lib/language-context";
import { AuthProvider } from "@/lib/auth/auth-provider";
import { AuthModalProvider } from "@/components/auth/auth-modal-provider";
import { QueryProvider } from "@/lib/api/query-provider";
import { ToastProvider } from "@/components/ui/toast";
import { MarketProvider } from "@/lib/markets/context";
import { resolveMarket } from "@/lib/markets/server";
import { DEFAULT_MARKET, MARKETS } from "@/lib/markets/config";
import { US_ORIGIN, SN_ORIGIN, hostKind } from "@/lib/markets/domains";
import { getSiteURL } from "@/lib/site-url";
import "./globals.css";

const siteURL = getSiteURL();

const SN_TITLE = "SafePhone — La protection smartphone de confiance au Sénégal";
const SN_DESCRIPTION =
  "Protégez votre smartphone contre la casse. Abonnement mensuel, déclaration en ligne, réparation gratuite chez MobiTech.";
const US_TITLE = "SafePhone — Affordable phone repair protection";
const US_DESCRIPTION =
  "SafePhone helps you prepare for expensive phone repair surprises with simple monthly plans, clear claim rules, and guided repair support.";

export async function generateMetadata(): Promise<Metadata> {
  const resolution = await resolveMarket();
  const market =
    resolution.status === "resolved" ? resolution.market : MARKETS[DEFAULT_MARKET];
  const isUS = market.code === "US";
  const title = isUS ? US_TITLE : SN_TITLE;
  const description = isUS ? US_DESCRIPTION : SN_DESCRIPTION;

  // Each market has its own canonical home on its own domain. The US site
  // serves clean URLs at the root; SN lives under /sn.
  const headerStore = await headers();
  const kind = hostKind(
    headerStore.get("host") ?? headerStore.get("x-forwarded-host"),
  );
  const usHome = `${US_ORIGIN}/`;
  const snHome = `${SN_ORIGIN}/sn`;
  const canonical = isUS ? usHome : snHome;
  // metadataBase makes relative OG/asset URLs resolve against the host the
  // page is actually served from.
  const base = kind === "us" ? US_ORIGIN : siteURL;

  return {
    title,
    description,
    metadataBase: new URL(base),
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "48x48" },
        { url: "/favicon.svg", type: "image/svg+xml" },
      ],
      shortcut: [{ url: "/favicon.ico" }],
      apple: [
        {
          url: "/apple-touch-icon-180x180.png",
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },
    alternates: {
      canonical,
      // hreflang alternates so search engines understand the per-market URLs.
      languages: {
        "fr-SN": snHome,
        "en-US": usHome,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "SafePhone",
      locale: market.ogLocale,
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const resolution = await resolveMarket();
  const resolved = resolution.status === "resolved";
  const marketCode = resolved ? resolution.market.code : DEFAULT_MARKET;
  const htmlLang = resolved ? resolution.market.htmlLang : MARKETS[DEFAULT_MARKET].htmlLang;

  return (
    <html lang={htmlLang} className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <QueryProvider>
          <AuthProvider>
            <MarketProvider marketCode={marketCode} resolved={resolved}>
              <LanguageProvider>
                <Suspense>
                  <AuthModalProvider>
                    <ToastProvider>
                      <AppShell>{children}</AppShell>
                    </ToastProvider>
                  </AuthModalProvider>
                </Suspense>
              </LanguageProvider>
            </MarketProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
