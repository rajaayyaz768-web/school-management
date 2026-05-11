"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

const TESTIMONIALS = [
  {
    quote: "The principal dashboard gives me a real-time overview of both campuses — attendance, fees, and results at a glance. I can focus on leadership instead of chasing reports.",
    name: "Dr. Imran Siddiqui",
    role: "Principal",
    tag: "Administration",
    color: "#0D3B2A",
    light: "rgba(13,59,42,0.12)",
  },
  {
    quote: "Marking attendance used to take 15 minutes of paperwork. Now it takes 30 seconds on my phone. Parents get the WhatsApp alert before I even put my phone down.",
    name: "Zara Ahmed",
    role: "Class Teacher, Grade 11",
    tag: "Teaching Staff",
    color: "#C8963A",
    light: "rgba(200,150,58,0.12)",
  },
  {
    quote: "I used to call the school office every week to check my son's progress. Now I open the portal and see his attendance, marks, and fee status — all in real time.",
    name: "Muhammad Tariq",
    role: "Parent",
    tag: "Parent Portal",
    color: "#1A3A5C",
    light: "rgba(26,58,92,0.12)",
  },
];

function TestimonialCard({ t, index }: { t: typeof TESTIMONIALS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.07)",
        borderRadius: 20,
        padding: "36px 32px",
        display: "flex", flexDirection: "column", gap: 24,
        position: "relative", overflow: "hidden",
        boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 3, background: `linear-gradient(90deg, ${t.color}, transparent)` }} />

      <span style={{
        display: "inline-flex", alignSelf: "flex-start",
        padding: "4px 12px", borderRadius: 100,
        background: t.light,
        fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
        letterSpacing: "0.1em", textTransform: "uppercase" as const,
        color: t.color,
      }}>{t.tag}</span>

      <div style={{ fontFamily: "Georgia, serif", fontSize: 72, color: t.color, lineHeight: 0.8, opacity: 0.15, userSelect: "none" as const }}>&ldquo;</div>

      <blockquote style={{
        fontFamily: "var(--font-body)", fontSize: 16, lineHeight: 1.7,
        color: "#353D4D", margin: 0, fontStyle: "italic", flex: 1,
      }}>
        {t.quote}
      </blockquote>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: `linear-gradient(135deg, ${t.color}, ${t.color}99)`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "#fff" }}>
            {t.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
          </span>
        </div>
        <div>
          <p style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15, color: "#0D1B0B", margin: 0 }}>{t.name}</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#8B98A8", margin: 0, marginTop: 1 }}>{t.role}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function TestimonialsSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headerRef, { once: true });

  return (
    <section style={{ background: "#FAFAF7", paddingTop: 96, paddingBottom: 96 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div ref={headerRef} style={{ marginBottom: 56 }}>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            style={{
              display: "inline-block",
              fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.16em", textTransform: "uppercase" as const,
              color: "#C8963A", marginBottom: 16,
            }}
          >
            Community Voice
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: "clamp(2rem,4.5vw,3.2rem)",
              lineHeight: 1.1, letterSpacing: "-0.025em",
              color: "#0D3B2A", maxWidth: 560, margin: 0,
            }}
          >
            Trusted by every member of our school community.
          </motion.h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.name} t={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
