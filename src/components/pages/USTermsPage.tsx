import USLegalPage, { type LegalSection } from "./USLegalPage";

const SECTIONS: LegalSection[] = [
  {
    heading: "Who we are",
    paragraphs: [
      "SafePhone is a phone repair protection membership service. References to \"SafePhone,\" \"we,\" \"us,\" or \"our\" mean the SafePhone team and its operators. References to \"you\" or \"your\" mean the individual using our website or holding a SafePhone membership.",
      "SafePhone is not an insurance company. We do not issue insurance policies, do not provide warranties on devices, and do not guarantee device replacement. SafePhone provides access to phone repair services through a network of approved repair partners, subject to the terms of your membership.",
    ],
  },
  {
    heading: "Eligibility",
    paragraphs: [
      "You must be at least 18 years old and a resident of the United States to purchase a SafePhone membership. By creating an account, you confirm that the information you provide is accurate.",
      "SafePhone memberships cover smartphones that you own and have registered with us. You may not transfer a membership to another person or another device without our written consent.",
    ],
  },
  {
    heading: "Your account",
    paragraphs: [
      "You are responsible for keeping your login credentials confidential and for all activity that occurs under your account. Notify us immediately if you suspect unauthorized access.",
      "You may close your account at any time from your dashboard. Closing your account will cancel any active membership at the end of the current billing period.",
    ],
  },
  {
    heading: "Billing and cancellation",
    paragraphs: [
      "SafePhone memberships are billed monthly via Stripe. Pricing is shown in U.S. dollars on the plans page at the time of subscription.",
      "You may cancel your membership at any time. Cancellation takes effect at the end of the current billing period; no pro-rated refunds are issued for partial months.",
      "We may suspend or terminate a membership for non-payment, misuse of the service, fraudulent claims, or violation of these terms.",
    ],
  },
  {
    heading: "Acceptable use",
    paragraphs: [
      "You agree not to misuse the SafePhone service or website. This includes (but is not limited to) submitting false claim information, attempting to access another member's account, or using the service to circumvent the policies of repair partners.",
      "Repeated abuse may result in termination of your membership without refund.",
    ],
  },
  {
    heading: "Intellectual property",
    paragraphs: [
      "The SafePhone name, logo, website, and software are owned by SafePhone. You may use them only as needed to use the service. All other rights are reserved.",
    ],
  },
  {
    heading: "Disclaimer of warranties",
    paragraphs: [
      "The SafePhone website is provided \"as is.\" We do not warrant that the website will be uninterrupted or error-free. To the fullest extent permitted by law, we disclaim all implied warranties.",
      "Your membership benefits are governed by the SafePhone Membership Agreement, which you can read separately. Nothing on this page replaces or modifies that agreement.",
    ],
  },
  {
    heading: "Limitation of liability",
    paragraphs: [
      "To the fullest extent permitted by applicable law, SafePhone's total liability arising from or related to these terms is limited to the amount you paid us in the twelve months preceding the claim.",
      "We are not liable for indirect, incidental, or consequential damages — including lost data, lost revenue, or business interruption.",
    ],
  },
  {
    heading: "Governing law",
    paragraphs: [
      "These terms are governed by the laws of the State of Delaware, without regard to its conflict-of-laws rules. Any dispute will be resolved in the state or federal courts located in that state.",
    ],
  },
  {
    heading: "Changes to these terms",
    paragraphs: [
      "We may update these terms from time to time. When we do, we'll post the updated version on this page and update the \"Last updated\" date. Material changes will also be notified by email at least 30 days before they take effect.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "Questions about these terms? Reach out via the Contact page on our site.",
    ],
  },
];

export default function USTermsPage() {
  return (
    <USLegalPage
      badge="Legal"
      title="Terms of service"
      lastUpdated="May 21, 2026"
      intro="These terms govern your use of the SafePhone website and your SafePhone phone repair protection membership. Please read them carefully — by creating an account or starting a membership, you agree to them."
      sections={SECTIONS}
      footnote="This document is a baseline draft. The final version is subject to review by SafePhone's legal counsel before launch. If your state requires specific consumer disclosures, those will be added in the final version."
    />
  );
}
