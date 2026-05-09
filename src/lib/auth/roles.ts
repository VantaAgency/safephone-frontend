import type { UserRole } from "@/lib/api/types";

const ROLE_PRIORITY: UserRole[] = [
  "admin",
  "commercial",
  "partner",
  "employee",
  "member",
  "viewer",
];

const VALID_ROLES = new Set<UserRole>(ROLE_PRIORITY);

export function normalizeUserRole(value: unknown): UserRole | null {
  if (typeof value !== "string") return null;
  const rawRole = value.trim();
  if (rawRole === "user") return "member";
  const role = rawRole as UserRole;
  return VALID_ROLES.has(role) ? role : null;
}

export function normalizeUserRoles(
  value: unknown,
  fallback?: UserRole | null,
): UserRole[] {
  const roles: UserRole[] = [];
  const add = (role: UserRole | null) => {
    if (role && !roles.includes(role)) {
      roles.push(role);
    }
  };

  if (Array.isArray(value)) {
    value.forEach((item) => add(normalizeUserRole(item)));
  } else if (typeof value === "string") {
    value.split(",").forEach((item) => add(normalizeUserRole(item)));
  }

  add(fallback ?? null);
  if (roles.length === 0) {
    roles.push("member");
  }

  return roles;
}

export function getPrimaryRole(roles?: UserRole[] | null): UserRole {
  for (const role of ROLE_PRIORITY) {
    if (roles?.includes(role)) {
      return role;
    }
  }
  return "member";
}

export function hasRole(
  roles: UserRole[] | undefined | null,
  role: UserRole,
) {
  return !!roles?.includes(role);
}
