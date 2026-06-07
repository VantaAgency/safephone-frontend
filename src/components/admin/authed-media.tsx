"use client";

import { useEffect, useState } from "react";
import { fetchAuthedObjectUrl } from "@/lib/api/client";

// Verification media URLs come from user input and are served behind auth.
// Refuse anything that isn't http(s); the backend Serve endpoint then checks
// the requester is the uploader or an admin/employee.
function safeHttp(u?: string | null): string | null {
  try {
    const p = new URL(u ?? "");
    return p.protocol === "https:" || p.protocol === "http:"
      ? p.toString()
      : null;
  } catch {
    return null;
  }
}

// Fetches a protected media URL with the Bearer token and exposes an object
// URL, revoking it on unmount / url change. <img>/<video> tags can't send the
// Authorization header themselves, hence this indirection.
function useAuthedObjectUrl(url?: string | null) {
  const safe = safeHttp(url);
  // State is only ever written from async callbacks (never synchronously in
  // the effect body), and the invalid-url case is derived — so no
  // set-state-in-effect.
  const [state, setState] = useState<{ objUrl: string | null; error: boolean }>(
    { objUrl: null, error: false },
  );

  useEffect(() => {
    if (!safe) return;
    let cancelled = false;
    let created: string | null = null;
    fetchAuthedObjectUrl(safe)
      .then((u) => {
        if (cancelled) {
          URL.revokeObjectURL(u);
          return;
        }
        created = u;
        setState({ objUrl: u, error: false });
      })
      .catch(() => {
        if (!cancelled) setState({ objUrl: null, error: true });
      });
    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [safe]);

  return {
    objUrl: safe ? state.objUrl : null,
    error: safe ? state.error : true,
  };
}

export function AuthedImage({
  url,
  alt,
  className,
}: {
  url?: string | null;
  alt: string;
  className?: string;
}) {
  const { objUrl, error } = useAuthedObjectUrl(url);
  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 text-[10px] text-slate-400 ${className ?? ""}`}
      >
        indisponible
      </div>
    );
  }
  if (!objUrl) {
    return <div className={`animate-pulse bg-slate-100 ${className ?? ""}`} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={objUrl} alt={alt} className={className} />;
}

// Videos can be large, so fetch the blob only when the user asks to view it,
// then play it INLINE. Opening a blob in a new tab via window.open() after an
// await is blocked by the popup blocker (the call is no longer in the click
// gesture), which is why a plain "open in new tab" button silently failed.
export function AuthedVideo({
  url,
  label,
  className,
}: {
  url?: string | null;
  label: string;
  className?: string;
}) {
  const [objUrl, setObjUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const safe = safeHttp(url);

  useEffect(
    () => () => {
      if (objUrl) URL.revokeObjectURL(objUrl);
    },
    [objUrl],
  );

  if (!safe) return null;

  if (objUrl) {
    return (
      <video
        src={objUrl}
        controls
        autoPlay
        className="mt-1 w-full max-w-md rounded-xl border border-slate-200 bg-black"
      />
    );
  }

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      setObjUrl(await fetchAuthedObjectUrl(safe));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={load}
      disabled={loading}
      className={className}
    >
      {loading ? "…" : error ? "Vidéo indisponible" : label}
    </button>
  );
}
