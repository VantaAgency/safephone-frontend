import { getSiteURL } from "@/lib/site-url";
import { sanitizeRedirect } from "./home-route";

export const FORGOT_PASSWORD_PATH = "/mot-de-passe-oublie";
export const RESET_PASSWORD_PATH = "/reinitialiser-mot-de-passe";
const LOGIN_PATH = "/connexion";

function buildPath(
  pathname: string,
  options?: { redirect?: string | null; reset?: "success" },
) {
  const params = new URLSearchParams();
  const safeRedirect = sanitizeRedirect(options?.redirect);

  if (safeRedirect) {
    params.set("redirect", safeRedirect);
  }

  if (options?.reset) {
    params.set("reset", options.reset);
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function buildForgotPasswordHref(redirect?: string | null) {
  return buildPath(FORGOT_PASSWORD_PATH, { redirect });
}

export function buildLoginHref(options?: {
  redirect?: string | null;
  reset?: "success";
}) {
  return buildPath(LOGIN_PATH, options);
}

export function buildResetPasswordRedirectTo(redirect?: string | null) {
  const url = new URL(RESET_PASSWORD_PATH, getSiteURL());
  const safeRedirect = sanitizeRedirect(redirect);

  if (safeRedirect) {
    url.searchParams.set("redirect", safeRedirect);
  }

  return url.toString();
}
