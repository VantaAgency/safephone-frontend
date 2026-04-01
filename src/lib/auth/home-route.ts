import type { UserRole } from "@/lib/api/types";

export function getHomeRouteForRole(role?: UserRole | null) {
  switch (role) {
    case "admin":
      return "/admin";
    case "partner":
      return "/espace-partenaire";
    case "employee":
      return "/espace-employe";
    default:
      return "/tableau-de-bord";
  }
}

/**
 * Sanitize a redirect URL to prevent open redirects.
 * Only allows relative paths starting with "/". Rejects absolute URLs,
 * protocol-relative URLs ("//evil.com"), and other schemes.
 */
export function sanitizeRedirect(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  // Must start with exactly one "/" and NOT "//" (protocol-relative)
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }
  return null;
}

export function getPostAuthRedirect(
  redirectTo?: string | null,
  role?: UserRole | null,
) {
  const safeRedirect = sanitizeRedirect(redirectTo);
  if (safeRedirect) {
    return safeRedirect;
  }

  return getHomeRouteForRole(role);
}
