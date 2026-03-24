import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import type { UserRole } from "@/lib/api/types";
import { databasePool } from "@/lib/server/db";

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

  const role = (session.user as { role?: UserRole }).role;
  if (!role || !allowedRoles.includes(role)) {
    redirect(buildUnauthorizedRedirect(pathname, allowedRoles));
  }

  if (role === "employee" && allowedRoles.includes("employee")) {
    const result = await databasePool.query(
      `SELECT COALESCE(ep.status, 'active') AS status
       FROM users u
       LEFT JOIN employee_profiles ep
         ON ep.user_id = u.id
        AND ep.org_id = u.org_id
       WHERE u.better_auth_id = $1
         AND u.deleted_at IS NULL
       LIMIT 1`,
      [session.user.id],
    );

    const status = result.rows[0]?.status as string | undefined;
    if (status !== "active") {
      redirect(buildUnauthorizedRedirect(pathname, allowedRoles));
    }
  }

  return session;
}
