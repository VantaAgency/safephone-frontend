import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { LanguageProvider } from "@/lib/language-context";
import { PipelineProvider } from "@/lib/pipeline-context";
import { AuthProvider } from "@/lib/auth/auth-provider";
import { QueryProvider } from "@/lib/api/query-provider";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "SafePhone — L'assurance smartphone de confiance au Sénégal",
  description:
    "Protégez votre smartphone contre la casse. Abonnement mensuel, déclaration en ligne, réparation gratuite chez MobiTech.",
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
            <PipelineProvider>
              <LanguageProvider>
                <ToastProvider>
                  <AppShell>{children}</AppShell>
                </ToastProvider>
              </LanguageProvider>
            </PipelineProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
