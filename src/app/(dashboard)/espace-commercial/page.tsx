"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { useRouter } from "next/navigation";
import { RouteGuardLoader } from "@/components/auth/route-guard-loader";
import { StatCard } from "@/components/cards/stat-card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/form-field";
import {
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  MapPinIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  useCommercialActivityReports,
  useCommercialCommissions,
  useCommercialOverview,
  useCommercialPartners,
  useCreateCommercialActivityReport,
} from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth/auth-provider";
import { hasRole } from "@/lib/auth/roles";
import { formatXOF } from "@/lib/data";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";
import type { CommercialActivityReport, CommercialCommission, CommercialPartner } from "@/lib/api/types";

type CommercialTab = "overview" | "partners" | "invite" | "activity" | "commissions";

const ACTIVITY_TYPES = [
  "partner_registration",
  "partner_onboarding",
  "partner_training",
  "follow_up_visit",
  "sales_meeting",
  "document_collection",
  "support_visit",
] as const;

export default function CommercialDashboardPage() {
  const { lang } = useLanguage();
  const { user, isPending, getToken } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<CommercialTab>("overview");
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [activityForm, setActivityForm] = useState({
    partnerId: "",
    prospectName: "",
    activityType: "partner_registration",
    comment: "",
    city: "",
    location: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [formMessage, setFormMessage] = useState("");

  const isCommercial = hasRole(user?.roles, "commercial");
  const { data: overview, isLoading: overviewLoading } = useCommercialOverview({
    enabled: isCommercial,
  });
  const { data: partners = [] } = useCommercialPartners({
    enabled: isCommercial,
  });
  const { data: reports = [] } = useCommercialActivityReports({
    enabled: isCommercial && tab === "activity",
  });
  const { data: commissions = [] } = useCommercialCommissions({
    enabled: isCommercial && tab === "commissions",
  });
  const createReport = useCreateCommercialActivityReport();

  useEffect(() => {
    if (!isPending && !isCommercial) {
      router.replace("/acces-refuse?required=commercial&from=%2Fespace-commercial");
    }
  }, [isCommercial, isPending, router]);

  useEffect(() => {
    if (!overview?.referral_link) return;
    QRCode.toDataURL(overview.referral_link, {
      margin: 1,
      width: 220,
      color: { dark: "#172554", light: "#ffffff" },
    }).then(setQrDataUrl).catch(() => setQrDataUrl(""));
  }, [overview?.referral_link]);

  const labels = useMemo(
    () => ({
      partner_registration: lang === "fr" ? "Inscription partenaire" : "Partner registration",
      partner_onboarding: lang === "fr" ? "Onboarding partenaire" : "Partner onboarding",
      partner_training: lang === "fr" ? "Formation partenaire" : "Partner training",
      follow_up_visit: lang === "fr" ? "Visite de suivi" : "Follow-up visit",
      sales_meeting: lang === "fr" ? "Rendez-vous commercial" : "Sales meeting",
      document_collection: lang === "fr" ? "Collecte de documents" : "Document collection",
      support_visit: lang === "fr" ? "Visite support" : "Support visit",
    }),
    [lang],
  );

  if (isPending || !isCommercial) {
    return <RouteGuardLoader />;
  }

  const referralLink = overview?.referral_link ?? "";
  const recentReports = tab === "activity" ? reports : overview?.recent_reports ?? [];
  const displayedCommissions = tab === "commissions" ? commissions : overview?.recent_commissions ?? [];
  const displayedPartners = tab === "partners" ? partners : overview?.recent_partners ?? [];

  const copyReferralLink = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const submitActivityReport = async () => {
    setFormMessage("");
    if (!photo) {
      setFormMessage(lang === "fr" ? "Ajoutez une photo de preuve." : "Add a proof photo.");
      return;
    }
    if (!activityForm.comment.trim()) {
      setFormMessage(lang === "fr" ? "Ajoutez un commentaire." : "Add a comment.");
      return;
    }

    const data = new FormData();
    if (activityForm.partnerId) data.set("partner_id", activityForm.partnerId);
    if (activityForm.prospectName.trim()) data.set("prospect_name", activityForm.prospectName.trim());
    data.set("activity_type", activityForm.activityType);
    data.set("comment", activityForm.comment.trim());
    if (activityForm.city.trim()) data.set("city", activityForm.city.trim());
    if (activityForm.location.trim()) data.set("location", activityForm.location.trim());
    data.set("photo", photo);

    try {
      await createReport.mutateAsync(data);
      setActivityForm({
        partnerId: "",
        prospectName: "",
        activityType: "partner_registration",
        comment: "",
        city: "",
        location: "",
      });
      setPhoto(null);
      setFormMessage(lang === "fr" ? "Rapport envoyé." : "Report submitted.");
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : "Upload failed");
    }
  };

  const tabLabels: Record<CommercialTab, string> = {
    overview: lang === "fr" ? "Vue d'ensemble" : "Overview",
    partners: lang === "fr" ? "Mes partenaires" : "My partners",
    invite: lang === "fr" ? "Lien / QR" : "Link / QR",
    activity: lang === "fr" ? "Visites terrain" : "Field visits",
    commissions: lang === "fr" ? "Commissions" : "Commissions",
  };

  return (
    <div className="bg-slate-50 py-10 md:py-16">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-indigo-950 px-2.5 py-0.5 text-xs font-medium text-white">
                {lang === "fr" ? "Commercial" : "Commercial"}
              </span>
              {overview?.profile.referral_code && (
                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-950 ring-1 ring-slate-200">
                  {overview.profile.referral_code}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-medium tracking-tight text-indigo-950 md:text-3xl">
              {lang === "fr" ? "Espace commercial" : "Commercial dashboard"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {lang === "fr"
                ? "Acquisition partenaires, preuves terrain et commissions en un seul espace."
                : "Partner acquisition, field proof, and commissions in one workspace."}
            </p>
          </div>
          <Button variant="outline" onClick={copyReferralLink}>
            {copied ? (lang === "fr" ? "Copié" : "Copied") : (lang === "fr" ? "Copier le lien" : "Copy link")}
          </Button>
        </div>

        <div className="mb-8 flex gap-1 overflow-x-auto rounded-full bg-slate-100 p-1">
          {(Object.keys(tabLabels) as CommercialTab[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={cn(
                "flex-shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-all",
                tab === item ? "bg-white text-indigo-950 shadow-sm" : "text-slate-500 hover:text-indigo-950",
              )}
            >
              {tabLabels[item]}
            </button>
          ))}
        </div>

        {(tab === "overview" || overviewLoading) && (
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label={lang === "fr" ? "Partenaires" : "Partners"} value={String(overview?.partners_brought ?? 0)} icon={<UsersIcon size={20} className="text-indigo-600" />} />
            <StatCard label={lang === "fr" ? "En attente" : "Pending"} value={String(overview?.pending_partner_applications ?? 0)} icon={<ClockIcon size={20} className="text-yellow-500" />} />
            <StatCard label={lang === "fr" ? "Conversions" : "Conversions"} value={String(overview?.first_client_conversions ?? 0)} icon={<CheckCircleIcon size={20} className="text-emerald-500" />} />
            <StatCard label={lang === "fr" ? "Commission due" : "Commission pending"} value={formatXOF(overview?.commission_pending_xof ?? 0)} icon={<CreditCardIcon size={20} className="text-violet-600" />} />
          </div>
        )}

        {tab === "invite" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-medium text-indigo-950">
                {lang === "fr" ? "Lien d'acquisition partenaire" : "Partner acquisition link"}
              </h2>
              <p className="mt-2 break-all rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {referralLink || "—"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={copyReferralLink}>{lang === "fr" ? "Copier" : "Copy"}</Button>
                <Button variant="outline" onClick={() => window.open(referralLink, "_blank", "noopener,noreferrer")}>
                  {lang === "fr" ? "Ouvrir" : "Open"}
                </Button>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-sm">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt="QR code" className="mx-auto h-56 w-56 rounded-xl border border-slate-100" />
              ) : (
                <div className="mx-auto h-56 w-56 animate-pulse rounded-xl bg-slate-100" />
              )}
            </div>
          </div>
        )}

        {(tab === "overview" || tab === "partners") && (
          <PartnerTable partners={displayedPartners} lang={lang} />
        )}

        {tab === "activity" && (
          <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-medium text-indigo-950">
                {lang === "fr" ? "Nouveau rapport terrain" : "New field report"}
              </h2>
              <div className="space-y-3">
                <Select value={activityForm.partnerId} onChange={(event) => setActivityForm((current) => ({ ...current, partnerId: event.target.value }))}>
                  <option value="">{lang === "fr" ? "Prospect non créé" : "Uncreated prospect"}</option>
                  {partners.map((partner) => (
                    <option key={partner.id} value={partner.id}>{partner.store_name}</option>
                  ))}
                </Select>
                <Input placeholder={lang === "fr" ? "Nom prospect" : "Prospect name"} value={activityForm.prospectName} onChange={(event) => setActivityForm((current) => ({ ...current, prospectName: event.target.value }))} />
                <Select value={activityForm.activityType} onChange={(event) => setActivityForm((current) => ({ ...current, activityType: event.target.value }))}>
                  {ACTIVITY_TYPES.map((type) => <option key={type} value={type}>{labels[type]}</option>)}
                </Select>
                <Textarea rows={4} placeholder={lang === "fr" ? "Commentaire" : "Comment"} value={activityForm.comment} onChange={(event) => setActivityForm((current) => ({ ...current, comment: event.target.value }))} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input placeholder={lang === "fr" ? "Région" : "Region"} value={activityForm.city} onChange={(event) => setActivityForm((current) => ({ ...current, city: event.target.value }))} />
                  <Input placeholder={lang === "fr" ? "Quartier" : "Neighborhood"} value={activityForm.location} onChange={(event) => setActivityForm((current) => ({ ...current, location: event.target.value }))} />
                </div>
                <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} />
                {formMessage && <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">{formMessage}</p>}
                <Button fullWidth loading={createReport.isPending} onClick={submitActivityReport}>
                  {lang === "fr" ? "Envoyer le rapport" : "Submit report"}
                </Button>
              </div>
            </div>
            <ReportList reports={recentReports} labels={labels} getToken={getToken} lang={lang} />
          </div>
        )}

        {tab === "commissions" && (
          <CommissionTable commissions={displayedCommissions} lang={lang} />
        )}
      </div>
    </div>
  );
}

function PartnerTable({ partners, lang }: { partners: CommercialPartner[]; lang: "fr" | "en" }) {
  if (!partners.length) {
    return <EmptyState text={lang === "fr" ? "Aucun partenaire attribué pour le moment." : "No attributed partners yet."} />;
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {["Partenaire", "Ville", "Clients", "Premier paiement", "Statut"].map((heading) => (
                <th key={heading} className="whitespace-nowrap px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {partners.map((partner) => (
              <tr key={partner.id} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-3.5">
                  <div className="font-medium text-indigo-950">{partner.store_name}</div>
                  <div className="text-xs text-slate-400">{partner.owner_name} · {partner.owner_email}</div>
                </td>
                <td className="px-5 py-3.5 text-slate-500">{partner.city} · {partner.business_location}</td>
                <td className="px-5 py-3.5 text-slate-500">{partner.active_clients}/{partner.clients_count}</td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={partner.first_payment_status ? "active" : "pending"} label={partner.first_payment_status ?? (lang === "fr" ? "En attente" : "Pending")} />
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={partner.status === "active" ? "active" : "pending"} label={partner.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportList({
  reports,
  labels,
  getToken,
  lang,
}: {
  reports: CommercialActivityReport[];
  labels: Record<string, string>;
  getToken: () => Promise<string | null>;
  lang: "fr" | "en";
}) {
  if (!reports.length) {
    return <EmptyState text={lang === "fr" ? "Aucun rapport terrain." : "No field reports yet."} />;
  }
  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <div key={report.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex gap-4">
            <ActivityPhoto report={report} getToken={getToken} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-indigo-950/5 px-2.5 py-0.5 text-xs font-medium text-indigo-950">{labels[report.activity_type] ?? report.activity_type}</span>
                <span className="text-xs text-slate-400">{new Date(report.created_at).toLocaleString(lang === "fr" ? "fr-FR" : "en-US")}</span>
              </div>
              <p className="mt-2 font-medium text-indigo-950">{report.partner_store_name ?? report.prospect_name ?? "—"}</p>
              <p className="mt-1 text-sm text-slate-500">{report.comment}</p>
              {(report.city || report.location) && (
                <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                  <MapPinIcon size={14} /> {[report.city, report.location].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityPhoto({ report, getToken }: { report: CommercialActivityReport; getToken: () => Promise<string | null> }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let revoked = "";
    getToken().then(async (token) => {
      if (!token) return;
      const response = await fetch(report.photo_url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      revoked = url;
      setSrc(url);
    });
    return () => {
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [getToken, report.photo_url]);

  if (!src) return <div className="h-24 w-24 shrink-0 rounded-xl bg-slate-100" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className="h-24 w-24 shrink-0 rounded-xl object-cover" />;
}

function CommissionTable({ commissions, lang }: { commissions: CommercialCommission[]; lang: "fr" | "en" }) {
  if (!commissions.length) {
    return <EmptyState text={lang === "fr" ? "Aucune commission générée." : "No commissions generated yet."} />;
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {["Partenaire", "Client", "Base", "Commission", "Statut"].map((heading) => (
                <th key={heading} className="whitespace-nowrap px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {commissions.map((commission) => (
              <tr key={commission.id} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-3.5 font-medium text-indigo-950">{commission.partner_store_name}</td>
                <td className="px-5 py-3.5 text-slate-500">{commission.client_name}</td>
                <td className="px-5 py-3.5 text-slate-500">{formatXOF(commission.base_amount_xof)}</td>
                <td className="px-5 py-3.5">
                  <div className="font-medium text-indigo-950">{formatXOF(commission.commission_amount_xof)}</div>
                  <div className="text-xs text-slate-400">{commission.commission_percentage}%</div>
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={commission.status === "paid" ? "active" : "pending"} label={commission.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white py-14 text-center text-sm text-slate-500 shadow-sm">
      {text}
    </div>
  );
}
