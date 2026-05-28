"use client";

import { useEffect } from "react";

/**
 * Last-resort error boundary — fires when the root layout itself throws,
 * meaning error.tsx (which lives below the layout) can't render. Because
 * the layout is gone, we must render our own <html> + <body>. Keep this
 * file zero-dependency: no providers, no hooks beyond useEffect, no CSS
 * framework — assume nothing about what loaded successfully.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.error("[global-error-boundary]", {
        message: error.message,
        digest: error.digest,
      });
    }
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          backgroundColor: "#FAFAF8",
          color: "#1e1b4b",
        }}
      >
        <div
          style={{
            maxWidth: "28rem",
            padding: "2.5rem 2rem",
            textAlign: "center",
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "1.5rem",
          }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#dc2626",
              marginBottom: "1rem",
            }}
          >
            Critical error
          </p>
          <h1
            style={{
              margin: "0 0 0.75rem",
              fontSize: "1.5rem",
              fontWeight: 500,
              letterSpacing: "-0.02em",
            }}
          >
            SafePhone couldn&apos;t load.
          </h1>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#64748b" }}>
            Refresh the page or try again in a moment.
          </p>
          {error.digest && (
            <p
              style={{
                marginTop: "1rem",
                fontFamily: "monospace",
                fontSize: "0.625rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#94a3b8",
              }}
            >
              Ref: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.75rem",
              padding: "0.75rem 1.5rem",
              border: "1px solid #1e1b4b",
              backgroundColor: "#fbbf24",
              color: "#1e1b4b",
              fontSize: "0.875rem",
              fontWeight: 500,
              borderRadius: "0.75rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
