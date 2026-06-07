import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  experimental: {
    // The /api/v1 rewrites proxy uploads (verification photos/videos) to the
    // backend. Next buffers the proxied body and truncates it past this limit
    // (default 10MB) — a 26MB MOV then reaches the backend incomplete and its
    // multipart parse times out. Match the backend's 100MiB form ceiling so
    // videos (capped at 75MiB server-side) get through intact.
    proxyClientMaxBodySize: "100mb",
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
      {
        source: "/health/:path*",
        destination: `${BACKEND_URL}/health/:path*`,
      },
    ];
  },
};

export default nextConfig;
