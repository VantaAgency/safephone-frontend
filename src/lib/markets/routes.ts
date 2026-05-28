import { MARKETS, type MarketCode } from "./config";

/**
 * Semantic route keys that every component references through routesFor()
 * instead of hardcoding French URLs like "/forfaits". Maps to the right
 * physical URL per market.
 */
export type RouteKey =
  | "home"
  | "plans"
  | "signup"
  | "login"
  | "dashboard"
  | "claim"
  | "repair"
  | "partners"
  | "contact"
  | "howItWorks"
  | "faq"
  | "terms"
  | "privacy"
  | "repairProtectionTerms"
  | "paymentSuccess"
  | "paymentCancel";

export interface MarketRoutes {
  home: string;
  plans: string;
  /** Where "Subscribe" CTAs land. */
  signup: string;
  login: string;
  dashboard: string;
  claim: string;
  repair: string;
  partners: string;
  contact: string;
  howItWorks: string;
  faq: string;
  terms: string;
  privacy: string;
  repairProtectionTerms: string;
  paymentSuccess: string;
  paymentCancel: string;
}

const SN_ROUTES: MarketRoutes = {
  home: "/sn",
  plans: "/sn/forfaits",
  signup: "/sn/inscription",
  login: "/connexion",
  dashboard: "/tableau-de-bord",
  claim: "/sn/sinistres",
  repair: "/sn/reparations",
  partners: "/sn/partenaires",
  contact: "/sn/contact",
  howItWorks: "/sn#comment-ca-marche",
  faq: "/sn#faq",
  // SN doesn't ship dedicated legal pages today — anchor on the home
  // section that mentions them. Keep references stable so consumers don't
  // need to special-case nulls.
  terms: "/sn#legal",
  privacy: "/sn#legal",
  repairProtectionTerms: "/sn#legal",
  paymentSuccess: "/paiement/succes",
  paymentCancel: "/paiement/echec",
};

const US_ROUTES: MarketRoutes = {
  home: "/us",
  plans: "/us/pricing",
  // US "Subscribe" doesn't pre-collect device info — Stripe Checkout is
  // the entry point, device registration happens post-payment.
  signup: "/us/signup",
  login: "/us/login",
  dashboard: "/us/dashboard",
  claim: "/us/claims",
  repair: "/us/repair",
  partners: "/us/partners",
  contact: "/us/contact",
  howItWorks: "/us/how-it-works",
  faq: "/us#faq",
  terms: "/us/terms",
  privacy: "/us/privacy",
  repairProtectionTerms: "/us/repair-protection-terms",
  paymentSuccess: "/us/checkout/success",
  paymentCancel: "/us/checkout/cancel",
};

const BY_MARKET: Record<MarketCode, MarketRoutes> = {
  SN: SN_ROUTES,
  US: US_ROUTES,
};

/** Returns the routes object for the given market. */
export function routesFor(market: MarketCode): MarketRoutes {
  return BY_MARKET[market];
}

/** Returns a single route URL for the given market and semantic key. */
export function marketRoute(market: MarketCode, key: RouteKey): string {
  return BY_MARKET[market][key];
}

/** Re-export markets list for consumers that need both. */
export { MARKETS };
