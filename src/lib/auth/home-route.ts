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

export function getPostAuthRedirect(
  redirectTo?: string | null,
  role?: UserRole | null,
) {
  if (redirectTo && redirectTo.trim()) {
    return redirectTo;
  }

  return getHomeRouteForRole(role);
}
