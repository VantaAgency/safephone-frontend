import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import type { UserRole } from "@/lib/api/types";

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

  return session;
}
