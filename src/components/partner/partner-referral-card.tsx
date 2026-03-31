"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  buildTrackedPartnerReferralLink,
  normalizePartnerReferralLink,
  type PartnerReferralSourceMedium,
} from "@/lib/partner-referrals";

interface PartnerReferralCardProps {
  lang: "fr" | "en";
  storeName?: string;
  referralCode?: string;
  referralLink: string;
  className?: string;
}

export function PartnerReferralCard({
  lang,
  storeName,
  referralCode,
  referralLink,
  className,
}: PartnerReferralCardProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const normalizedReferralLink = useMemo(
    () => normalizePartnerReferralLink(referralLink),
    [referralLink],
  );

  const shareLink = useMemo(
    () => buildTrackedPartnerReferralLink(normalizedReferralLink, "share"),
    [normalizedReferralLink],
  );
  const qrLink = useMemo(
    () => buildTrackedPartnerReferralLink(normalizedReferralLink, "qr"),
    [normalizedReferralLink],
  );

  useEffect(() => {
    let cancelled = false;

    if (!qrLink) {
      setQrDataUrl("");
      return;
    }

    void QRCode.toDataURL(qrLink, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 320,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    }).then((url) => {
      if (!cancelled) {
        setQrDataUrl(url);
      }
    }).catch(() => {
      if (!cancelled) {
        setQrDataUrl("");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [qrLink]);

  const handleCopy = async () => {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!shareLink) return;

    const shareText =
      lang === "fr"
        ? `${storeName ?? "SafePhone"} peut vous accompagner sur votre inscription SafePhone : ${shareLink}`
        : `${storeName ?? "SafePhone"} can guide you through your SafePhone signup: ${shareLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "SafePhone",
          text: shareText,
          url: shareLink,
        });
        return;
      } catch {
        // Fall back to copy when share is dismissed or unavailable.
      }
    }

    await handleCopy();
  };

  const handleDownload = async () => {
    if (!qrDataUrl) return;

    setDownloading(true);
    try {
      const link = document.createElement("a");
      link.href = qrDataUrl;
      link.download = `safephone-partner-${(referralCode ?? "referral").toLowerCase()}.png`;
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const actionLabel = (medium: PartnerReferralSourceMedium) => {
    switch (medium) {
      case "qr":
        return lang === "fr" ? "Télécharger le QR" : "Download QR";
      case "share":
        return lang === "fr" ? "Partager" : "Share";
      default:
        return lang === "fr" ? "Copier le lien" : "Copy link";
    }
  };

  return (
    <div
      className={cn(
        "grid gap-6 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6 lg:grid-cols-[minmax(0,1.35fr)_320px]",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {lang === "fr" ? "Mon lien partenaire" : "My partner link"}
        </p>
        <h2 className="mt-3 text-2xl font-medium text-indigo-950">
          {lang === "fr"
            ? "Un lien unique, prêt à partager en boutique"
            : "One reusable link, ready to share in-store"}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
          {lang === "fr"
            ? "Partagez ce lien directement avec vos clients ou affichez le QR code à votre point de vente. SafePhone rattache automatiquement chaque inscription à votre compte partenaire."
            : "Share this link directly with customers or display the QR code in-store. SafePhone automatically attaches each signup to your partner account."}
        </p>

        <div className="mt-5 min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center gap-2">
            {referralCode && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-950 shadow-sm">
                {referralCode}
              </span>
            )}
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              {lang === "fr" ? "Lien réutilisable" : "Reusable link"}
            </span>
          </div>
          <code className="mt-3 block max-w-full overflow-x-auto break-all rounded-xl bg-white px-3 py-3 text-sm leading-relaxed text-indigo-950 shadow-sm ring-1 ring-slate-200 [overflow-wrap:anywhere]">
            {shareLink || normalizedReferralLink || referralLink || "—"}
          </code>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Button variant="primary" size="md" fullWidth onClick={() => void handleCopy()}>
              {copied
                ? lang === "fr"
                  ? "Lien copié"
                  : "Link copied"
                : actionLabel("unknown")}
            </Button>
            <Button variant="secondary" size="md" fullWidth onClick={() => void handleShare()}>
              {actionLabel("share")}
            </Button>
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => void handleDownload()}
              disabled={!qrDataUrl}
              loading={downloading}
            >
              {actionLabel("qr")}
            </Button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {lang === "fr"
              ? "Conseil: affichez ce QR code sur le comptoir, sur une vitrine ou sur un flyer pour accélérer les inscriptions."
              : "Tip: place this QR code on the counter, in the storefront, or on flyers to speed up signups."}
          </p>
        </div>
      </div>

      <div className="min-w-0 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {lang === "fr" ? "QR code boutique" : "In-store QR code"}
        </p>
        <div className="mt-4 flex min-h-[220px] items-center justify-center rounded-[1.5rem] bg-white p-3 shadow-sm ring-1 ring-slate-200 sm:min-h-[270px] sm:p-4">
          {qrDataUrl ? (
            <Image
              src={qrDataUrl}
              alt={
                lang === "fr"
                  ? "QR code du lien partenaire SafePhone"
                  : "SafePhone partner referral QR code"
              }
              width={240}
              height={240}
              unoptimized
              className="h-auto w-full max-w-[240px] rounded-2xl"
            />
          ) : (
            <div className="text-center text-sm text-slate-400">
              {lang === "fr"
                ? "Génération du QR code..."
                : "Generating QR code..."}
            </div>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">
          {lang === "fr"
            ? "Le QR encode un lien dédié avec suivi des scans."
            : "This QR encodes a tracked referral link."}
        </p>
      </div>
    </div>
  );
}
