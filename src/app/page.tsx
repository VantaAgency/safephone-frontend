import { Hero } from "@/components/sections/hero";
import { ServicesOverview } from "@/components/sections/services-overview";
import { PaymentMethods } from "@/components/sections/payment-methods";
import { WhySafephoneSection } from "@/components/sections/why-safephone-section";
import { HowItWorks } from "@/components/sections/how-it-works";
import { PlansPreview } from "@/components/sections/plans-preview";
import { PartnerSection } from "@/components/sections/partner-section";
import { Testimonials } from "@/components/sections/testimonials";
import { FAQSection } from "@/components/sections/faq-section";
import { CTASection } from "@/components/sections/cta-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesOverview />
      <PaymentMethods />
      <WhySafephoneSection />
      <HowItWorks />
      <PlansPreview />
      <PartnerSection />
      <Testimonials />
      <FAQSection />
      <CTASection />
    </>
  );
}
