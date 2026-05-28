/**
 * Market configuration — single source of truth for everything that varies
 * per country. Components import a Market via useMarket() and read data from
 * it (currency, payment provider, copy snippets, etc.) instead of hardcoding
 * Senegal-specific values.
 *
 * Visual identity, layout, animations, and Tailwind classes never depend on
 * market — only the *data* components consume changes.
 */

export type MarketCode = "SN" | "US";
export type PaymentProvider = "DEXPAY" | "STRIPE";
export type SupportedLang = "fr" | "en";
export type SupportedCurrency = "XOF" | "USD";

/** Inline SVG component reference (resolved at render time). */
export type PaymentMethodLogo = {
  key: string;
  alt: string;
  /**
   * Either a static image path (PNG/SVG in /public) OR a hint to an inline
   * SVG component the page renders. We keep the data flat so components
   * stay agnostic — they just read `kind` + the right field.
   */
  kind: "image" | "svgBrand";
  src?: string;
  svgBrand?: "visa" | "mastercard" | "amex" | "applepay" | "googlepay";
};

export type Testimonial = {
  name: string;
  context: string;
  /** Quote in the market's native language (FR for SN, EN for US). */
  quote: string;
  /** Quote in EN for SN users who toggle to EN. Same as `quote` for US. */
  quoteEn: string;
  avatar: string;
  rating: number;
};

export type ContactInfo = {
  whatsapp: string | null;
  whatsappDisplay: string | null;
  phone: string | null;
  phoneDisplay: string | null;
  /** Multi-line postal address shown on the contact page. */
  address: string | null;
  phonePlaceholder: string;
  /** Sample full name shown as placeholder in name inputs. */
  namePlaceholder: string;
  /** Sample email shown as placeholder in email inputs. */
  emailPlaceholder: string;
  /**
   * Regex pattern source (a string, NOT a RegExp instance). Stored as a
   * string so the Market object stays serializable across Server→Client
   * Component boundaries. Build a RegExp at use-site with
   * `new RegExp(market.contact.phoneRegex)`.
   */
  phoneRegex: string;
  phoneRegexMessage: string;
};

export type Market = {
  code: MarketCode;
  country: string;
  countryEnglish: string;
  countryCode: string;
  language: SupportedLang;
  currency: SupportedCurrency;
  currencyLabel: string;
  /**
   * 1 for currencies stored as whole units (XOF), 100 for currencies stored
   * as minor units (USD cents). formatPrice uses this to know whether to
   * divide before formatting.
   */
  currencyMinorUnit: 1 | 100;
  paymentProvider: PaymentProvider;
  domain: string;
  htmlLang: string;
  ogLocale: string;
  flag: string;
  /** Where to send a user who clicks the country switcher for this market. */
  routePrefix: "/sn" | "/us";
  contact: ContactInfo;
  payment: {
    /** Display labels for payment method enum values stored in the DB. */
    methodLabels: Record<string, string>;
    /** Logos shown in the PaymentMethods homepage section. */
    methodLogos: PaymentMethodLogo[];
  };
  /** Cities offered in the partner application form. */
  partnerCities: string[];
  /** Pre-formatted strings the partner-section mockup needs. */
  copy: {
    repairBrand: string;
    repairBadge: string;
    partnerMockupName: string;
    partnerMockupId: string;
    /** Static mockup labels + sample transactions for the PartnerSection illustration. */
    partnerMockup: {
      initials: string;
      statusLabel: string;
      commissionsLabel: string;
      mainAmount: string;
      mainAmountSuffix: string;
      trend: string;
      clientsLabel: string;
      clientsValue: string;
      commissionLabel: string;
      commissionValue: string;
      recentLabel: string;
      viewAllLabel: string;
      paymentLabel: string;
      validatedLabel: string;
      transactions: { phone: string; plan: string; time: string; amount: string }[];
    };
  };
  testimonials: Testimonial[];
};

const SN_TESTIMONIALS: Testimonial[] = [
  {
    name: "Aminata D.",
    context: "Formule Ecran+",
    quote: "J'ai declare mon ecran casse en ligne et tout est alle tres vite.",
    quoteEn: "I reported my broken screen online and everything moved very quickly.",
    avatar: "/avatars/customer-a.svg",
    rating: 5,
  },
  {
    name: "Moussa F.",
    context: "Paiement mensuel via Wave",
    quote: "3 500 FCFA par mois, et zero surprise le jour ou mon telephone est tombe.",
    quoteEn: "3,500 FCFA per month, and no surprise the day my phone fell.",
    avatar: "/avatars/customer-b.svg",
    rating: 5,
  },
  {
    name: "Ousmane S.",
    context: "Suivi de dossier en ligne",
    quote: "Le suivi etait clair. Je savais exactement ou en etait ma reparation.",
    quoteEn: "The tracking was clear. I always knew where my repair stood.",
    avatar: "/avatars/customer-c.svg",
    rating: 5,
  },
  {
    name: "Fatou N.",
    context: "Protection de smartphone",
    quote: "L'abonnement est simple, et la prise en charge s'est faite sans frais en plus.",
    quoteEn: "The subscription is simple, and the service was handled with no extra fees.",
    avatar: "/avatars/customer-a.svg",
    rating: 5,
  },
  {
    name: "Cheikh T.",
    context: "Souscription rapide",
    quote: "J'ai souscrit depuis mon telephone en quelques minutes seulement.",
    quoteEn: "I subscribed from my phone in just a few minutes.",
    avatar: "/avatars/customer-b.svg",
    rating: 4,
  },
  {
    name: "Marième S.",
    context: "Assistance SafePhone",
    quote: "Quand j'ai eu un probleme, j'ai ete orientee vite vers la bonne solution.",
    quoteEn: "When I had an issue, I was quickly guided to the right solution.",
    avatar: "/avatars/customer-c.svg",
    rating: 5,
  },
];

const US_TESTIMONIALS: Testimonial[] = [
  {
    name: "Jordan M.",
    context: "Essential plan",
    quote: "Filed a claim from my phone in five minutes. Repair was scheduled the same day.",
    quoteEn: "Filed a claim from my phone in five minutes. Repair was scheduled the same day.",
    avatar: "/avatars/customer-a.svg",
    rating: 5,
  },
  {
    name: "Priya R.",
    context: "Complete plan",
    quote: "$14.99 a month and I finally stopped panicking every time my phone slipped out of my hand.",
    quoteEn: "$14.99 a month and I finally stopped panicking every time my phone slipped out of my hand.",
    avatar: "/avatars/customer-b.svg",
    rating: 5,
  },
  {
    name: "Marcus T.",
    context: "Cracked screen repair",
    quote: "The claim review was fast and the deductible was clear before any work started.",
    quoteEn: "The claim review was fast and the deductible was clear before any work started.",
    avatar: "/avatars/customer-c.svg",
    rating: 5,
  },
  {
    name: "Emily K.",
    context: "Online claim flow",
    quote: "Way simpler than my carrier's protection plan. Pricing is upfront and there's no fine print drama.",
    quoteEn: "Way simpler than my carrier's protection plan. Pricing is upfront and there's no fine print drama.",
    avatar: "/avatars/customer-a.svg",
    rating: 5,
  },
  {
    name: "David L.",
    context: "Signed up in minutes",
    quote: "Set up the membership during lunch. Took about three minutes start to finish.",
    quoteEn: "Set up the membership during lunch. Took about three minutes start to finish.",
    avatar: "/avatars/customer-b.svg",
    rating: 4,
  },
  {
    name: "Hannah S.",
    context: "Customer support",
    quote: "Support team answered every question before I subscribed. No pressure, no upsells.",
    quoteEn: "Support team answered every question before I subscribed. No pressure, no upsells.",
    avatar: "/avatars/customer-c.svg",
    rating: 5,
  },
];

export const MARKETS: Record<MarketCode, Market> = {
  SN: {
    code: "SN",
    country: "Sénégal",
    countryEnglish: "Senegal",
    countryCode: "SN",
    language: "fr",
    currency: "XOF",
    currencyLabel: "FCFA",
    currencyMinorUnit: 1,
    paymentProvider: "DEXPAY",
    domain: "safephone.sn",
    htmlLang: "fr",
    ogLocale: "fr_SN",
    flag: "🇸🇳",
    routePrefix: "/sn",
    contact: {
      whatsapp: "https://wa.me/221770000000",
      whatsappDisplay: "+221 77 000 00 00",
      phone: "tel:+221770000000",
      phoneDisplay: "+221 77 000 00 00",
      address: "Point E, Rue 8 × Avenue Bourguiba\nDakar, Sénégal",
      phonePlaceholder: "+221 77 000 00 00",
      namePlaceholder: "Aminata Diallo",
      emailPlaceholder: "aminata@email.com",
      // Senegal mobile: +221 followed by 9 digits, allow spaces.
      phoneRegex: "^(\\+221\\s?)?[0-9\\s]{9,15}$",
      phoneRegexMessage: "Format: +221 77 000 00 00",
    },
    payment: {
      methodLabels: {
        wave: "Wave",
        orange_money: "Orange Money",
        free_money: "Free Money",
        card: "Carte bancaire",
        hosted_checkout: "Paiement sécurisé",
      },
      methodLogos: [
        { key: "wave", alt: "Wave", kind: "image", src: "/wave.png" },
        { key: "orange_money", alt: "Orange Money", kind: "image", src: "/orangeMoneyLogo.png" },
        { key: "free_money", alt: "Free Money", kind: "image", src: "/freemoney.svg" },
      ],
    },
    partnerCities: [
      "Dakar",
      "Thiès",
      "Saint-Louis",
      "Kaolack",
      "Ziguinchor",
      "Touba",
      "Rufisque",
      "Mbour",
    ],
    copy: {
      repairBrand: "MobiTech",
      repairBadge: "MobiTech 48h",
      partnerMockupName: "Touba Mobile",
      partnerMockupId: "ID: #SP-8492",
      partnerMockup: {
        initials: "TM",
        statusLabel: "Connecté",
        commissionsLabel: "Commissions d'acquisition",
        mainAmount: "145 000",
        mainAmountSuffix: "FCFA total",
        trend: "+12%",
        clientsLabel: "Clients inscrits",
        clientsValue: "42",
        commissionLabel: "Commission attribuée",
        commissionValue: "12%",
        recentLabel: "Dernières commissions uniques",
        viewAllLabel: "Tout voir",
        paymentLabel: "1er paiement",
        validatedLabel: "Validé",
        transactions: [
          { phone: "77 *** ** 45", plan: "Forfait Écran+", time: "14:30", amount: "+2 000 F" },
          { phone: "76 *** ** 12", plan: "Forfait Essentiel", time: "Hier", amount: "+1 500 F" },
        ],
      },
    },
    testimonials: SN_TESTIMONIALS,
  },
  US: {
    code: "US",
    country: "United States",
    countryEnglish: "United States",
    countryCode: "US",
    language: "en",
    currency: "USD",
    currencyLabel: "$",
    currencyMinorUnit: 100,
    paymentProvider: "STRIPE",
    domain: "getsafephone.com",
    htmlLang: "en",
    ogLocale: "en_US",
    flag: "🇺🇸",
    routePrefix: "/us",
    contact: {
      // US doesn't operate WhatsApp support — CTA falls back to /us/contact.
      whatsapp: null,
      whatsappDisplay: null,
      phone: null,
      phoneDisplay: null,
      address: null,
      phonePlaceholder: "+1 (555) 555-5555",
      namePlaceholder: "Jordan Smith",
      emailPlaceholder: "jordan@example.com",
      // US: optional +1 country code, 10 digits with separators allowed.
      phoneRegex: "^(\\+1\\s?)?(\\(?\\d{3}\\)?[\\s.-]?)?\\d{3}[\\s.-]?\\d{4}$",
      phoneRegexMessage: "Format: +1 (555) 555-5555",
    },
    payment: {
      methodLabels: {
        card: "Card",
        apple_pay: "Apple Pay",
        google_pay: "Google Pay",
      },
      methodLogos: [
        { key: "visa", alt: "Visa", kind: "svgBrand", svgBrand: "visa" },
        { key: "mastercard", alt: "Mastercard", kind: "svgBrand", svgBrand: "mastercard" },
        { key: "amex", alt: "American Express", kind: "svgBrand", svgBrand: "amex" },
        { key: "applepay", alt: "Apple Pay", kind: "svgBrand", svgBrand: "applepay" },
        { key: "googlepay", alt: "Google Pay", kind: "svgBrand", svgBrand: "googlepay" },
      ],
    },
    partnerCities: [
      "New York, NY",
      "Los Angeles, CA",
      "Chicago, IL",
      "Houston, TX",
      "Phoenix, AZ",
      "Philadelphia, PA",
      "San Antonio, TX",
      "Miami, FL",
      "Dallas, TX",
      "Atlanta, GA",
      "Other",
    ],
    copy: {
      repairBrand: "Approved Partner",
      repairBadge: "Approved 48h",
      partnerMockupName: "ProShop Mobile",
      partnerMockupId: "ID: #SP-1042",
      partnerMockup: {
        initials: "PM",
        statusLabel: "Connected",
        commissionsLabel: "Acquisition commissions",
        mainAmount: "$2,840",
        mainAmountSuffix: "earned",
        trend: "+12%",
        clientsLabel: "Active clients",
        clientsValue: "42",
        commissionLabel: "Commission rate",
        commissionValue: "12%",
        recentLabel: "Recent one-time commissions",
        viewAllLabel: "View all",
        paymentLabel: "First payment",
        validatedLabel: "Approved",
        transactions: [
          { phone: "(415) *** **45", plan: "Screen+ plan", time: "2:30 PM", amount: "+$24" },
          { phone: "(202) *** **12", plan: "Essential plan", time: "Yesterday", amount: "+$18" },
        ],
      },
    },
    testimonials: US_TESTIMONIALS,
  },
};

export const SUPPORTED_MARKET_CODES = Object.keys(MARKETS) as MarketCode[];

export const DEFAULT_MARKET: MarketCode = "SN";

export const MARKET_COOKIE = "sp_market";

/** Legal disclaimer text required on US-facing marketing surfaces. */
export const US_DISCLAIMER =
  "SafePhone is a phone repair protection membership, not an insurance product. Coverage is subject to eligibility, plan limits, waiting periods, deductibles, and claim approval.";

export function isMarketCode(value: string | null | undefined): value is MarketCode {
  return value === "SN" || value === "US";
}

export function getMarket(code: MarketCode): Market {
  return MARKETS[code];
}

/** Markets in display order for the country switcher. */
export function listMarkets(): Market[] {
  return SUPPORTED_MARKET_CODES.map((code) => MARKETS[code]);
}
