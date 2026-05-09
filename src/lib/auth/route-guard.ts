import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import type { UserRole } from "@/lib/api/types";
import { databasePool } from "@/lib/server/db";
import { getPrimaryRole, normalizeUserRole } from "@/lib/auth/roles";

function buildSignInRedirect(pathname: string) {
  const params = new URLSearchParams({
    auth: "sign-in",
    redirect: pathname,
  });

  return `/?${params.toString()}`;
}

function buildUnauthorizedRedirect(pathname: string, allowedRoles: UserRole[]) {
  const params = new URLSearchParams({
    from: pathname,
    required: allowedRoles.join(","),
  });

  return `/acces-refuse?${params.toString()}`;
}

export async function requireRouteRole(
  pathname: string,
  allowedRoles: UserRole[],
) {
  const session = await auth.api.getSession({
    headers: new Headers(await headers()),
  });

  if (!session?.user) {
    redirect(buildSignInRedirect(pathname));
  }

  const result = await databasePool.query(
    `SELECT
       u.role,
       COALESCE(ep.status, 'active') AS employee_status,
       COALESCE(cp.status, 'active') AS commercial_status,
       EXISTS (
         SELECT 1
         FROM employee_profiles active_ep
         WHERE active_ep.user_id = u.id
           AND active_ep.org_id = u.org_id
           AND active_ep.status = 'active'
       ) AS has_employee_role,
       EXISTS (
         SELECT 1
         FROM commercial_profiles active_cp
         WHERE active_cp.user_id = u.id
           AND active_cp.org_id = u.org_id
           AND active_cp.status = 'active'
       ) AS has_commercial_role,
       EXISTS (
         SELECT 1
         FROM partners p
         WHERE p.user_id = u.id
           AND p.org_id = u.org_id
           AND p.status = 'active'
       ) AS has_partner_role
     FROM users u
     LEFT JOIN employee_profiles ep
       ON ep.user_id = u.id
      AND ep.org_id = u.org_id
     LEFT JOIN commercial_profiles cp
       ON cp.user_id = u.id
      AND cp.org_id = u.org_id
     WHERE u.better_auth_id = $1
       AND u.deleted_at IS NULL
     LIMIT 1`,
    [session.user.id],
  );

  const row = result.rows[0];
  if (!row) {
    redirect(buildUnauthorizedRedirect(pathname, allowedRoles));
  }

  const roles: UserRole[] = [];
  const addRole = (role: UserRole | null) => {
    if (role && !roles.includes(role)) {
      roles.push(role);
    }
  };
  const primaryRole = normalizeUserRole(row.role);
  switch (primaryRole) {
    case "commercial":
      if (!row.commercial_status || row.commercial_status === "active") addRole(primaryRole);
      break;
    case "employee":
      if (!row.employee_status || row.employee_status === "active") addRole(primaryRole);
      break;
    default:
      addRole(primaryRole);
  }
  if (row.has_employee_role && !roles.includes("employee")) roles.push("employee");
  if (row.has_commercial_role && !roles.includes("commercial")) roles.push("commercial");
  if (row.has_partner_role && !roles.includes("partner")) roles.push("partner");
  if (roles.length === 0) roles.push("member");
  const role = getPrimaryRole(roles);

  if (!allowedRoles.some((allowedRole) => roles.includes(allowedRole))) {
    redirect(buildUnauthorizedRedirect(pathname, allowedRoles));
  }

  if (allowedRoles.includes("employee") && roles.includes("employee")) {
    const status = row.employee_status as string | undefined;
    if (status !== "active" && normalizeUserRole(row.role) === "employee") {
      redirect(buildUnauthorizedRedirect(pathname, allowedRoles));
    }
  }

  if (allowedRoles.includes("commercial") && roles.includes("commercial")) {
    const status = row.commercial_status as string | undefined;
    if (status !== "active" && normalizeUserRole(row.role) === "commercial") {
      redirect(buildUnauthorizedRedirect(pathname, allowedRoles));
    }
  }

  return {
    ...session,
    user: {
      ...session.user,
      role,
      roles,
    },
  };
}
