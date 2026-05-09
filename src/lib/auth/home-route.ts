import type { UserRole } from "@/lib/api/types";
import { getPrimaryRole, normalizeUserRoles } from "@/lib/auth/roles";

export function getHomeRouteForRole(role?: UserRole | null) {
  switch (role) {
    case "admin":
      return "/admin";
    case "commercial":
      return "/espace-commercial";
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
  roleOrRoles?: UserRole | UserRole[] | null,
) {
  const safeRedirect = sanitizeRedirect(redirectTo);
  if (safeRedirect) {
    return safeRedirect;
  }

  const roles = Array.isArray(roleOrRoles)
    ? roleOrRoles
    : normalizeUserRoles(undefined, roleOrRoles);
  return getHomeRouteForRole(getPrimaryRole(roles));
}
