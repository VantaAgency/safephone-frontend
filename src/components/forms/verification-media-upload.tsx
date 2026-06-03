"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api/client";
import { useLanguage } from "@/lib/language-context";

type Kind = "photo" | "video";

interface UploadResponse {
  url: string;
}

async function uploadVerificationMedia(
  file: File,
  kind: Kind,
): Promise<string> {
  const fd = new FormData();
  fd.append("kind", kind);
  fd.append("file", file);
  const res = await api.postForm<UploadResponse>(
    "/devices/verification-media",
    fd,
  );
  return res.url;
}

interface VerificationMediaUploadProps {
  kind: Kind;
  index?: number;
  value: string;
  onChange: (next: string) => void;
}

// Single-file upload slot. Owns its own loading + error state; pushes
// the resulting backend URL upstream via onChange so the parent form's
// submit gate can count filled slots without caring about the upload
// mechanics. The backend caps photo at 12 MiB / video at 75 MiB, but
// we don't repeat that check here — the server's 422 surfaces back as
// an inline error message.
export function VerificationMediaUpload({
  kind,
  index,
  value,
  onChange,
}: VerificationMediaUploadProps) {
  const { lang } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept =
    kind === "photo"
      ? "image/jpeg,image/png,image/webp,image/heic"
      : "video/mp4,video/quicktime,video/webm";

  async function handlePick(file: File) {
    setError(null);
    setUploading(true);
    try {
      const url = await uploadVerificationMedia(file, kind);
      onChange(url);
    } catch (err) {
      const fallback =
        kind === "photo"
          ? lang === "fr"
            ? "Échec du chargement de la photo."
            : "Failed to upload photo."
          : lang === "fr"
            ? "Échec du chargement de la vidéo."
            : "Failed to upload video.";
      const msg =
        err instanceof ApiError
          ? err.fields?.file ||
            err.fields?.kind ||
            err.message ||
            fallback
          : fallback;
      setError(msg);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const label =
    kind === "photo"
      ? lang === "fr"
        ? `Photo ${index ?? ""}`.trim()
        : `Photo ${index ?? ""}`.trim()
      : lang === "fr"
        ? "Vidéo"
        : "Video";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-slate-600">{label}</div>
          {value ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 block truncate text-xs text-indigo-600 hover:underline"
            >
              {lang === "fr" ? "Voir le fichier" : "View uploaded file"}
            </a>
          ) : (
            <div className="mt-0.5 text-xs text-slate-400">
              {lang === "fr" ? "Aucun fichier" : "No file yet"}
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          loading={uploading}
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {value
            ? lang === "fr"
              ? "Remplacer"
              : "Replace"
            : lang === "fr"
              ? "Charger"
              : "Upload"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handlePick(file);
          }}
        />
      </div>
      {error && (
        <div className="mt-2 text-xs text-red-600">{error}</div>
      )}
    </div>
  );
}
