"use client";

import { ArrowRight, Check } from "lucide-react";

const discountTiers = [
  {
    name: "Merit A+",
    description: "Outstanding matric performance — 90% and above",
    marks: "90% – 100%",
    discount: 30,
    features: [
      "30% discount on total annual fee",
      "Merit certificate of excellence",
      "Priority subject selection",
      "Free study materials",
      "Dedicated academic counselor",
    ],
    cta: "Apply for Merit A+",
    popular: false,
    badge: null,
  },
  {
    name: "Merit A",
    description: "Excellent performance — 80% to 89%",
    marks: "80% – 89%",
    discount: 20,
    features: [
      "20% discount on total annual fee",
      "Merit certificate",
      "Priority registration",
      "Free study materials",
      "Academic support sessions",
      "Library card included",
    ],
    cta: "Apply for Merit A",
    popular: true,
    badge: "Most Common",
  },
  {
    name: "Merit B",
    description: "Good performance — 70% to 79%",
    marks: "70% – 79%",
    discount: 10,
    features: [
      "10% discount on total annual fee",
      "Participation certificate",
      "Standard registration",
      "Library card included",
      "Academic support sessions",
    ],
    cta: "Apply for Merit B",
    popular: false,
    badge: null,
  },
  {
    name: "Merit C",
    description: "Satisfactory performance — 60% to 69%",
    marks: "60% – 69%",
    discount: 5,
    features: [
      "5% discount on total annual fee",
      "Standard registration benefits",
      "Library card included",
      "Counseling support",
    ],
    cta: "Apply for Merit C",
    popular: false,
    badge: null,
  },
  {
    name: "Standard",
    description: "Below 60% — Full fee applies",
    marks: "Below 60%",
    discount: 0,
    features: [
      "Standard annual fee",
      "All college facilities",
      "Library card included",
      "Academic support available",
    ],
    cta: "Apply Now",
    popular: false,
    badge: null,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-32 lg:py-40 border-t border-foreground/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="max-w-3xl mb-20">
          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase block mb-6">
            Scholarship & Discounts
          </span>
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-tight text-foreground mb-6">
            Matric marks
            <br />
            <span className="text-muted-foreground">earn you more.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl">
            Falcon College rewards academic excellence. Your matric percentage determines your
            fee discount — the higher your marks, the bigger your scholarship.
          </p>
        </div>

        {/* Discount Info Banner */}
        <div className="mb-12 p-4 border border-foreground/10 bg-foreground/[0.02] flex flex-wrap items-center gap-6">
          {discountTiers.map((tier) => (
            <div key={tier.name} className="flex items-center gap-3">
              <span className="font-mono text-sm text-muted-foreground">{tier.marks}</span>
              <span className="text-foreground/20">→</span>
              <span
                className={`font-display text-lg ${
                  tier.discount > 0 ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {tier.discount > 0 ? `${tier.discount}% off` : "Standard fee"}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing Cards – top 3 prominent, bottom 2 compact */}
        <div className="grid md:grid-cols-3 gap-px bg-foreground/10 mb-px">
          {discountTiers.slice(0, 3).map((tier, idx) => (
            <div
              key={tier.name}
              className={`relative p-8 lg:p-10 bg-background ${
                tier.popular ? "md:-my-4 md:py-12 lg:py-14 border-2 border-foreground" : ""
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-8 px-3 py-1 bg-foreground text-background text-xs font-mono uppercase tracking-widest">
                  {tier.badge}
                </span>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <span className="font-mono text-xs text-muted-foreground">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-3xl text-foreground mt-2">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{tier.description}</p>
              </div>

              {/* Discount */}
              <div className="mb-6 pb-6 border-b border-foreground/10">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl lg:text-6xl text-foreground">
                    {tier.discount}%
                  </span>
                  <span className="text-muted-foreground">discount</span>
                </div>
                <p className="text-xs font-mono text-muted-foreground mt-1">on total annual fee</p>
              </div>

              {/* Required marks */}
              <div className="mb-6 px-3 py-2 bg-foreground/5 inline-flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">Matric Marks:</span>
                <span className="text-sm font-mono text-foreground font-medium">{tier.marks}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-foreground mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                className={`w-full py-4 flex items-center justify-center gap-2 text-sm font-medium transition-all group ${
                  tier.popular
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "border border-foreground/20 text-foreground hover:border-foreground hover:bg-foreground/5"
                }`}
              >
                {tier.cta}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          ))}
        </div>

        {/* Bottom 2 compact tiers */}
        <div className="grid md:grid-cols-2 gap-px bg-foreground/10">
          {discountTiers.slice(3).map((tier, idx) => (
            <div key={tier.name} className="relative p-8 bg-background flex flex-col md:flex-row md:items-center md:gap-12">
              <div className="flex-1 mb-6 md:mb-0">
                <div className="flex items-center gap-4 mb-2">
                  <span className="font-mono text-xs text-muted-foreground">{String(idx + 4).padStart(2, "0")}</span>
                  <h3 className="font-display text-2xl text-foreground">{tier.name}</h3>
                  <span className="font-mono text-sm text-muted-foreground">{tier.marks}</span>
                </div>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <span className="font-display text-4xl text-foreground">
                    {tier.discount > 0 ? `${tier.discount}%` : "—"}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {tier.discount > 0 ? "off" : "Standard fee"}
                  </span>
                </div>
                <button className="border border-foreground/20 text-foreground hover:border-foreground hover:bg-foreground/5 px-6 py-3 text-sm font-medium transition-all flex items-center gap-2 group whitespace-nowrap">
                  {tier.cta}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <p className="mt-12 text-center text-sm text-muted-foreground">
          Discounts are applied to total annual fee upon verification of original matric certificate.{" "}
          <a href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">
            View admission policy
          </a>
        </p>
      </div>
    </section>
  );
}
