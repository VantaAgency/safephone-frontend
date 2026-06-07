"use client";

// The moderation API returns short-lived SIGNED, same-origin paths for
// verification media (e.g. /api/v1/devices/verification-media/<id>/<file>?exp=&sig=).
// They load directly in <img>/<video> — no bearer token — so video streams
// progressively instead of being fully downloaded first.
const MEDIA_PREFIX = "/api/v1/devices/verification-media/";

function safeMediaSrc(u?: string | null): string | null {
  return u && u.startsWith(MEDIA_PREFIX) ? u : null;
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
  const src = safeMediaSrc(url);
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 text-[10px] text-slate-400 ${className ?? ""}`}
      >
        indisponible
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />;
}

// Inline player. `preload="metadata"` loads only the header up front (fast),
// then streams on play.
export function AuthedVideo({
  url,
  className,
}: {
  url?: string | null;
  className?: string;
}) {
  const src = safeMediaSrc(url);
  if (!src) return null;
  return (
    <video
      src={src}
      controls
      preload="metadata"
      className={
        className ??
        "mt-1 w-full max-w-md rounded-xl border border-slate-200 bg-black"
      }
    />
  );
}
