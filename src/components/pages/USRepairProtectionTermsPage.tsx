import USLegalPage, { type LegalSection } from "./USLegalPage";

const SECTIONS: LegalSection[] = [
  {
    heading: "What this membership is",
    paragraphs: [
      "Your SafePhone membership gives you access to repair services for the smartphone you registered, performed by an approved SafePhone repair partner, in exchange for a monthly membership fee and a deductible per repair.",
      "SafePhone is not insurance. It is not a warranty. It does not guarantee replacement of your device. It is a membership program for accidental damage repair services. We use those terms intentionally to keep what we offer clear.",
    ],
  },
  {
    heading: "What's covered",
    paragraphs: [
      "Repairs for accidental damage to the registered device — cracked screens, broken back glass, charging port issues, and similar physical damage that occurred after the membership start date.",
      "Mechanical and electrical failures that occur outside any manufacturer warranty window and are not the result of misuse.",
      "Coverage scope depends on the specific plan you chose. The full list of what each plan covers is shown on the plans page at the time of purchase.",
    ],
  },
  {
    heading: "What's not covered",
    paragraphs: [
      "Theft, loss, or disappearance of the device. SafePhone does not cover lost or stolen devices.",
      "Cosmetic damage that does not affect device function (scratches, dents, minor scuffs).",
      "Pre-existing damage — anything that was already broken before you started your membership or registered the device.",
      "Damage caused by intentional misuse, modification, jailbreaking/rooting, or unauthorized repair attempts.",
      "Damage covered by another active warranty, service plan, or insurance policy (you must pursue that coverage first).",
      "Loss of data on the device. Always back up your data; we are not responsible for what's stored on the phone.",
      "Software issues that are not caused by physical damage (operating system bugs, app crashes, virus infections).",
    ],
  },
  {
    heading: "Waiting period",
    paragraphs: [
      "A 14-day waiting period applies from the membership start date. Claims for damage that occurred during the waiting period are not eligible. This prevents members from signing up after damage has already happened.",
    ],
  },
  {
    heading: "Deductibles",
    paragraphs: [
      "Each claim has a flat deductible that you pay directly to the repair partner. The deductible amount depends on your plan and the type of repair, and is disclosed before you confirm the claim.",
      "Deductibles cover the partner's cost-share for the repair. You are not asked to pay anything beyond the deductible for covered repairs.",
    ],
  },
  {
    heading: "Claim process",
    paragraphs: [
      "Open a claim from your SafePhone dashboard within 30 days of the incident.",
      "We review the claim, confirm coverage, and route you to the nearest approved repair partner.",
      "You bring the device to the partner, pay the deductible, and pick it up when the repair is complete.",
      "Repairs use quality parts (OEM or equivalent) and are backed by the partner's repair warranty.",
    ],
  },
  {
    heading: "Claim limits",
    paragraphs: [
      "Coverage is subject to a per-membership annual limit on the total value of repairs we cover. The limit depends on your plan and is disclosed at signup.",
      "We may also limit the number of claims allowed per rolling 12-month period to prevent fraud and abuse. Reasonable limits are stated on each plan.",
    ],
  },
  {
    heading: "Cancellation",
    paragraphs: [
      "You may cancel your membership any time. Cancellation stops further billing at the end of the current period; in-progress claims continue to be honored.",
      "We may cancel a membership for non-payment, fraudulent claims, or abuse — in which case any open claims are forfeited.",
    ],
  },
  {
    heading: "Disputes",
    paragraphs: [
      "If you disagree with a claim decision or a repair partner's work, contact us. We'll review the case, work with the partner, and try to reach a fair outcome.",
      "Any remaining dispute is handled under the SafePhone Terms of Service.",
    ],
  },
  {
    heading: "Changes to this agreement",
    paragraphs: [
      "We may update this membership agreement. Material changes will be notified by email at least 30 days before they take effect. If you don't agree with the new terms, you can cancel before they take effect — your existing claims will still be handled under the prior terms.",
    ],
  },
];

export default function USRepairProtectionTermsPage() {
  return (
    <USLegalPage
      badge="Membership"
      title="Membership agreement"
      lastUpdated="May 21, 2026"
      intro="This is the agreement between you and SafePhone for your phone repair protection membership. It explains what's covered, what isn't, deductibles, the claim process, and the rules around cancellation."
      sections={SECTIONS}
      footnote="This document is a baseline draft. Coverage limits, deductible amounts, and waiting periods will be finalized in the launch version after legal review. The substantive structure (no insurance, no theft/loss, deductibles apply, approved partners) reflects SafePhone's positioning and is intended to remain stable."
    />
  );
}
