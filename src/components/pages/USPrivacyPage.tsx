import USLegalPage, { type LegalSection } from "./USLegalPage";

const SECTIONS: LegalSection[] = [
  {
    heading: "What we collect",
    paragraphs: [
      "When you create an account, we collect your name and email address. When you start a membership, we record the plan you chose and basic device details (brand, model, optional IMEI) so we know what's covered.",
      "When you pay, payment information is handled directly by Stripe. We receive a Stripe customer identifier and the status of your subscription — never your full card number.",
      "We log basic technical information when you use the website (IP address, browser, pages visited) so we can keep the service running and detect abuse.",
    ],
  },
  {
    heading: "Why we use it",
    paragraphs: [
      "To operate your SafePhone membership — billing, claims handling, and routing to approved repair partners.",
      "To improve the service — understanding which pages and plans members find useful.",
      "To prevent fraud and protect the safety of our members and partners.",
      "To communicate with you — service updates, claim status, and (only if you opt in) product news.",
    ],
  },
  {
    heading: "Who we share it with",
    paragraphs: [
      "Approved repair partners receive only the details needed to handle a claim you've opened (your name, device brand/model, claim summary).",
      "Service providers — like Stripe for payments, our email provider, and our hosting provider — process data on our behalf under contracts that require them to safeguard it.",
      "Law enforcement, when required by a valid legal request.",
      "We do not sell your personal information.",
    ],
  },
  {
    heading: "How long we keep it",
    paragraphs: [
      "We keep account and membership information for as long as your account is active, plus a reasonable period afterwards to comply with tax and accounting obligations.",
      "Technical logs are retained for up to 90 days, then deleted or aggregated.",
    ],
  },
  {
    heading: "Your rights",
    paragraphs: [
      "You can access, correct, or delete your personal information by logging in and visiting your dashboard, or by contacting us directly.",
      "If you live in California or another state with similar privacy laws, you have additional rights — including the right to know what information we collect about you and to request its deletion. We honor those requests at no cost to you.",
      "You can opt out of marketing emails at any time via the unsubscribe link in our messages.",
    ],
  },
  {
    heading: "Cookies",
    paragraphs: [
      "We use cookies that are strictly necessary for the site to function (such as keeping you signed in). We do not use cookies to track you across other websites.",
    ],
  },
  {
    heading: "Children",
    paragraphs: [
      "SafePhone is not intended for children under 13. We do not knowingly collect information from anyone under 13. If you believe we have, contact us and we'll delete it.",
    ],
  },
  {
    heading: "International transfers",
    paragraphs: [
      "Our service is operated from the United States. If you access SafePhone from outside the U.S., your information will be transferred to and processed in the U.S.",
    ],
  },
  {
    heading: "Security",
    paragraphs: [
      "We use industry-standard safeguards — encrypted connections, access controls, and audit logging — to protect your information. No system is perfectly secure; we encourage you to use a strong, unique password and to keep it confidential.",
    ],
  },
  {
    heading: "Changes to this policy",
    paragraphs: [
      "When we update this policy, we'll post the new version here and update the \"Last updated\" date. Material changes will also be notified by email.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "Questions about privacy? Reach out via the Contact page on our site.",
    ],
  },
];

export default function USPrivacyPage() {
  return (
    <USLegalPage
      badge="Privacy"
      title="Privacy policy"
      lastUpdated="May 21, 2026"
      intro="This policy explains what personal information SafePhone collects when you use our site or hold a membership, why we collect it, and what control you have over it."
      sections={SECTIONS}
      footnote="This document is a baseline draft. The final version will be reviewed by counsel before launch and updated to reflect any state-specific disclosures required at that time."
    />
  );
}
