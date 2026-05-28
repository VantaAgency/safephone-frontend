// Lightweight client-side logger. The actual transport is intentionally
// trivial today — every level forwards to console.* — but every call goes
// through this module so we can swap in Sentry / Datadog later by editing
// one file instead of grepping for 100+ console.* sites.
//
// Use this everywhere instead of `console.*`. Reserve raw `console.error`
// for the two error boundaries (app/error.tsx, app/global-error.tsx) where
// we want the absolute minimal dependency surface.

type LogContext = Record<string, unknown> | undefined;

function emit(
  level: "debug" | "info" | "warn" | "error",
  message: string,
  context?: LogContext,
) {
  const payload = context ? [message, context] : [message];

  // Today: pass through. Tomorrow: also forward to Sentry / a /log endpoint.
  // eslint-disable-next-line no-console
  console[level](...payload);
}

export const logger = {
  debug: (msg: string, ctx?: LogContext) => emit("debug", msg, ctx),
  info: (msg: string, ctx?: LogContext) => emit("info", msg, ctx),
  warn: (msg: string, ctx?: LogContext) => emit("warn", msg, ctx),
  error: (msg: string, ctx?: LogContext) => emit("error", msg, ctx),
};
