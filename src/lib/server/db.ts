import { Pool } from "pg";

function buildDatabaseConfig() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return {};
  }

  const parsed = new URL(connectionString);
  const isLocalhost =
    parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  const isRailwayPublicProxy =
    parsed.hostname.endsWith(".rlwy.net") ||
    parsed.hostname.endsWith(".up.railway.app");

  // node-postgres replaces the ssl object when sslmode is present in the
  // connection string, so strip it before passing explicit TLS options.
  if (isRailwayPublicProxy) {
    parsed.searchParams.delete("sslmode");
    parsed.searchParams.delete("sslcert");
    parsed.searchParams.delete("sslkey");
    parsed.searchParams.delete("sslrootcert");
  }

  return {
    connectionString: parsed.toString(),
    ...(isLocalhost
      ? {}
      : isRailwayPublicProxy
        ? {
            ssl: {
              rejectUnauthorized: false,
            },
          }
        : {}),
  };
}

export const databasePool = new Pool(buildDatabaseConfig());
