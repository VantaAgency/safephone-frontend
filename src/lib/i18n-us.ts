/**
 * US-market copy overrides.
 *
 * Deep-merged on top of `T.en` when the active market is US and the user's
 * language preference is EN. SN users who toggle to EN still see the
 * Senegal-flavoured English in `T.en` — overrides only apply on US market.
 *
 * Positioning: phone repair protection MEMBERSHIP, not insurance. Safe
 * vocabulary only: "repair protection", "approved repair partners",
 * "cracked screen repair support", "deductibles may apply", "claims
 * subject to approval". Avoid: insurance, warranty, guaranteed replacement,
 * theft protection, loss protection, "we cover everything".
 */

import type { Translations } from "./i18n";

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends string
    ? string
    : T[K] extends Array<infer U>
      ? Array<U>
      : DeepPartial<T[K]>;
};

export const US_OVERRIDES: DeepPartial<Translations> = {
  hero: {
    badge: "Phone repair protection · United States",
    title: "Affordable phone repair protection, without the confusion.",
    subtitle:
      "SafePhone helps you prepare for expensive phone repair surprises with simple monthly plans, clear claim rules, and guided repair support.",
    panel2Opt3: "Repair at an approved partner",
    panel2Opt3Desc: "Drop off at a vetted partner shop in your area.",
    visualSavingsValue: "Up to $300",
    visualSavingsNote: "saved on a typical screen or back-glass repair",
    visualRepairSummary: "Approved repair partners",
    visualRepairNote: "vetted repair shops nationwide",
    visualSupportLabel: "Member service",
    visualSupportValue: "Online claim filing & guided repair",
    visualSupportNote: "a simple monthly membership, priced in USD",
    socialProof: "Trusted by phone owners across the US",
    value2Title: "No surprise repair bills",
    value2Desc:
      "Predictable monthly cost. Your membership helps cover eligible parts and labor.",
    value3Title: "Approved repair partners",
    value3Desc:
      "Drop off at a vetted partner shop. Any deductible is disclosed before repair begins.",
    floatingNetworkValue: "Approved partners",
  },
  home: {
    badge: "Phone repair protection · United States",
    hero: "Your phone deserves",
    hero2: "honest protection.",
    sub: "Cracked screen, drop damage, accidental cracks — SafePhone helps you handle phone repair bills. Subscribe in 2 minutes, pay with any major card, and get protected today.",
    paymentBanner: "Secure payments powered by Stripe",
    whyFeature1Desc:
      "No more $200–$400 surprise repair bills. With a small monthly membership, SafePhone helps cover eligible repair costs (parts and labor).",
    whyFeature3Title: "Repair with our approved partners",
    whyFeature3Desc:
      "Once your claim is approved, drop your phone off at an approved partner shop. They repair the device, SafePhone helps cover the bill. Deductibles may apply.",
    whyHighlightTitle: "Built for US phone owners",
    whyHighlightP1:
      "Phone repair protection without the carrier-add-on confusion.",
    whyHighlightP2:
      "Clear monthly pricing in USD, secure card payments via Stripe, and a vetted repair partner network so you know what to expect when something goes wrong.",
    step1:
      "Pick the monthly plan that fits your phone. Cancel any time, no long-term contract.",
    step2t: "Register your phone",
    step2:
      "Add your phone's make, model, and a few photos so we can confirm eligibility.",
    step3t: "Pay securely by card",
    step3:
      "Your membership activates after secure payment via Stripe — Visa, Mastercard, Amex, Apple Pay or Google Pay.",
    step4:
      "Got damage? File a claim online. Once approved, visit an approved repair partner. They repair, SafePhone helps cover the bill.",
    partnerSub:
      "You run a phone shop? Share one reusable partner link, display a QR code in-store, and earn a one-time acquisition commission on each new client's first successful payment.",
    partnerBenefit2Desc:
      "A reusable partner link, an in-store QR code, and real-time tracking for signups and acquisition commissions.",
    partnerBenefit3Title: "Client subscribes",
    partnerBenefit3Desc:
      "Your customer picks a plan, pays securely by card via Stripe, and stays attributed to your partner account.",
    testimonialsSub:
      "Members share their experience — from subscribing online to getting their phone repaired at an approved partner.",
    faq2q: "Can I get my phone repaired anywhere?",
    faq2a:
      "No. To make sure repairs meet quality standards and to keep deductibles predictable, repairs must be carried out at one of our approved partner shops.",
    ctaSub:
      "Protect your phone today in less than 3 minutes and join SafePhone members across the US.",
    ctaButton: "Get protected",
    ctaWhatsapp: "Contact support",
    trust: "Why members choose SafePhone",
    t1: "Secure card payments",
    t1d: "Visa, Mastercard, Amex, Apple Pay and Google Pay accepted",
    t2: "Honest coverage",
    t2d: "Cracked screens, back glass, liquid damage support — depending on your plan",
    t3: "Fast repair",
    t3d: "Approved partner network — repair in 24 to 72h when in stock",
    t4: "7-day support",
    t4d: "Via email or in-app chat, every day of the week",
    mobitechTitle: "Need a repair?",
    mobitechSub:
      "Our network of approved repair partners handles in-store drop-off across the US.",
    mobitechCta: "Book a repair",
    processStep3t: "Repair at an approved partner",
    processStep3:
      "An approved repair partner handles your device once your claim is reviewed and approved.",
    coveredTitle: "We help cover your phone",
    coveredSub:
      "SafePhone helps you handle common phone repair surprises, starting at $9.99/month.",
    covered1: "Cracked screen",
    covered1d:
      "Drops, impacts and cracked screens — handled depending on your plan.",
    covered2: "Breakdown & failure",
    covered2d:
      "Hardware failures handled at an approved partner shop — depending on your plan.",
    covered3: "Water damage support",
    covered3d:
      "Liquid damage assessment available on the Complete plan, subject to review.",
    covered4: "What's not covered",
    covered4d: "Theft, loss, and pre-existing damage are not eligible.",
    coveredBrands: "Most phones are eligible",
    coveredBrandsSub:
      "iPhone, Samsung, Google Pixel, Motorola and many more — working phones less than 4 years old typically qualify.",
    comparisonTitle: "SafePhone vs. paying out of pocket",
    comparisonSub:
      "The difference between an unexpected $300 repair and peace of mind at $9.99/month.",
    whyW1: "Screen repair: $200 – $400 on average",
    whyW2: "Hours spent finding a trustworthy repair shop",
    whyW3: "No follow-up, no quality guarantee",
    whyW4: "Stress and unexpected expenses pile up",
    whyS1: "Coverage starting at $9.99/month",
    whyS2: "Approved partner repair in 24 to 72h",
    whyS3: "Online claim in 2 minutes, real-time status updates",
    whyS4: "Pay with any major card via Stripe",
  },
  plans: {
    title: "Simple monthly plans for phone repair protection",
    sub: "Pick the plan that fits how you use your phone. No long-term contract — cancel before your next renewal.",
    perMonth: "/ month",
    perYear: "/ year",
    cta: "Get",
  },
  mobitech: {
    title: "Fast repair with our approved partners",
    sub: "SafePhone's network of approved repair partners. Cracked screens, batteries, connectors — drop-off at the partner location closest to you.",
    homeService: "At-home service",
    homeServiceSub: "A technician schedules a pickup at your location",
  },
  partners: {
    title: "Become a certified SafePhone partner",
    sub: "Run a phone shop? Join our network with one reusable partner link and an in-store QR code.",
    b3d: "Your customer picks a plan, pays securely by card via Stripe, and stays attributed to your partner account.",
    b4d: "After each new client's first successful payment, your acquisition commission is created once.",
    success: "Application received! We'll contact you within two business days.",
  },
  footer: {
    description:
      "Affordable phone repair protection in the US. Simple monthly plans, clear claim rules, and secure payments via Stripe.",
    copyright: "SafePhone United States. All rights reserved.",
    madeIn: "Built for US phone owners",
  },
};

/**
 * Deep-merge an overlay on top of a base object.
 * - Strings replace.
 * - Arrays REPLACE wholesale (no concatenation).
 * - Nested objects merge recursively.
 *
 * Returns a fresh object — does not mutate base.
 */
export function mergeOverrides<T extends object>(
  base: T,
  override: DeepPartial<T> | undefined,
): T {
  if (!override) return base;
  const result = { ...base } as T;
  for (const key in override) {
    const baseVal = (base as Record<string, unknown>)[key];
    const overrideVal = (override as Record<string, unknown>)[key];
    if (overrideVal === undefined) continue;
    if (
      baseVal &&
      typeof baseVal === "object" &&
      !Array.isArray(baseVal) &&
      overrideVal &&
      typeof overrideVal === "object" &&
      !Array.isArray(overrideVal)
    ) {
      (result as Record<string, unknown>)[key] = mergeOverrides(
        baseVal as object,
        overrideVal as DeepPartial<object>,
      );
    } else {
      (result as Record<string, unknown>)[key] = overrideVal;
    }
  }
  return result;
}
