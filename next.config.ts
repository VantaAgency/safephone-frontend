import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:8081/api/v1/:path*",
      },
      {
        source: "/health/:path*",
        destination: "http://localhost:8081/health/:path*",
      },
    ];
  },
};

export default nextConfig;
