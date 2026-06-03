"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api/client";
import { useLanguage } from "@/lib/language-context";
import type { Device } from "@/lib/api/types";

// Hits /api/v1/admin/verifications which returns the queue of devices
// whose verification_status is 'pending'. The same Device type covers the
// full row since the backend includes verification_photos / verification_video
// / verification_status / verified_at / etc.
async function fetchPendingVerifications(): Promise<Device[]> {
  return api.get<Device[]>("/admin/verifications", { limit: 50 });
}

async function approveVerification(deviceID: string): Promise<void> {
  await api.post<unknown>(`/admin/verifications/${deviceID}/approve`);
}

async function rejectVerification(
  deviceID: string,
  reason: string,
): Promise<void> {
  await api.post<unknown>(`/admin/verifications/${deviceID}/reject`, { reason });
}

export function AdminVerificationsTab() {
  const { lang } = useLanguage();
  const queryClient = useQueryClient();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data, isLoading, error } = useQuery<Device[]>({
    queryKey: ["admin-verifications"],
    queryFn: fetchPendingVerifications,
  });

  const approveMutation = useMutation({
    mutationFn: approveVerification,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-verifications"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectVerification(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-verifications"] });
      setRejectingId(null);
      setRejectionReason("");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        {lang === "fr"
          ? "Impossible de charger les vérifications."
          : "Could not load verifications."}
      </div>
    );
  }

  const devices = data ?? [];
  if (devices.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-12 text-center text-sm text-slate-400">
        {lang === "fr"
          ? "Aucune vérification en attente."
          : "No pending verifications."}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {devices.map((d) => (
        <div
          key={d.id}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-base font-medium text-indigo-950">
                {d.brand} — {d.model}
              </div>
              <div className="mt-0.5 text-sm text-slate-500">
                {d.device_type} ·{" "}
                <span className="font-mono text-xs">
                  {d.imei || d.metadata?.serial_number || "—"}
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
              {lang === "fr" ? "En attente" : "Pending"}
            </span>
          </div>

          {/* Photos */}
          {d.verification_photos && d.verification_photos.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">
              {d.verification_photos.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition hover:border-indigo-400"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Verification ${idx + 1}`}
                    className="h-24 w-full object-cover"
                  />
                </a>
              ))}
            </div>
          )}

          {/* Video */}
          {d.verification_video && (
            <div className="mt-3">
              <a
                href={d.verification_video}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-indigo-600 hover:underline"
              >
                {lang === "fr" ? "Voir la vidéo" : "Open video"} →
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 md:flex-row md:items-center md:justify-end">
            {rejectingId === d.id ? (
              <div className="flex flex-1 flex-col gap-2 md:flex-row">
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={
                    lang === "fr"
                      ? "Motif de refus (visible par le client)"
                      : "Rejection reason (shown to the user)"
                  }
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-indigo-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                <Button
                  variant="danger"
                  size="sm"
                  loading={rejectMutation.isPending}
                  disabled={rejectionReason.trim().length < 3}
                  onClick={() =>
                    rejectMutation.mutate({
                      id: d.id,
                      reason: rejectionReason.trim(),
                    })
                  }
                >
                  {lang === "fr" ? "Confirmer le refus" : "Confirm reject"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRejectingId(null);
                    setRejectionReason("");
                  }}
                >
                  {lang === "fr" ? "Annuler" : "Cancel"}
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setRejectingId(d.id)}
                  disabled={
                    approveMutation.isPending || rejectMutation.isPending
                  }
                >
                  {lang === "fr" ? "Refuser" : "Reject"}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  loading={approveMutation.isPending}
                  disabled={approveMutation.isPending}
                  onClick={() => approveMutation.mutate(d.id)}
                >
                  {lang === "fr" ? "Approuver" : "Approve"}
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
