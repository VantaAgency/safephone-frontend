import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { LanguageProvider } from "@/lib/language-context";
import { AuthProvider } from "@/lib/auth/auth-provider";
import { AuthModalProvider } from "@/components/auth/auth-modal-provider";
import { QueryProvider } from "@/lib/api/query-provider";
import { ToastProvider } from "@/components/ui/toast";
import { getSiteURL } from "@/lib/site-url";
import "./globals.css";

const siteURL = getSiteURL();

export const metadata: Metadata = {
  title: "SafePhone — La protection smartphone de confiance au Sénégal",
  description:
    "Protégez votre smartphone contre la casse. Abonnement mensuel, déclaration en ligne, réparation gratuite chez MobiTech.",
  metadataBase: new URL(siteURL),
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
    canonical: "/",
  },
  openGraph: {
    title: "SafePhone — La protection smartphone de confiance au Sénégal",
    description:
      "Protégez votre smartphone contre la casse. Abonnement mensuel, déclaration en ligne, réparation gratuite chez MobiTech.",
    url: siteURL,
    siteName: "SafePhone",
    locale: "fr_SN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
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
            <LanguageProvider>
              <Suspense>
                <AuthModalProvider>
                  <ToastProvider>
                    <AppShell>{children}</AppShell>
                  </ToastProvider>
                </AuthModalProvider>
              </Suspense>
            </LanguageProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
