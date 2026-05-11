"use client";

import { Navigation }         from "@/components/landing/navigation";
import { HeroSection }        from "@/components/landing/hero-section";
import { FeaturesSection }    from "@/components/landing/features-section";
import { CampusSection }      from "@/components/landing/campus-section";
import { MetricsSection }     from "@/components/landing/metrics-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { CtaSection }         from "@/components/landing/cta-section";
import { FooterSection }      from "@/components/landing/footer-section";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden" style={{ fontFamily: "var(--font-body)" }}>
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <CampusSection />
      <MetricsSection />
      <TestimonialsSection />
      <CtaSection />
      <FooterSection />
    </main>
  );
}
