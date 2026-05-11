"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import {
  CalendarCheck, CreditCard, FileText,
  Clock, MessageSquare, Building2,
} from "lucide-react";

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "Attendance Tracking",
    description: "Real-time marking by teachers. Parents receive a WhatsApp alert the moment a student is marked absent — before the period ends.",
    color: "#0D3B2A",
    light: "rgba(13,59,42,0.08)",
  },
  {
    icon: CreditCard,
    title: "Fee Management",
    description: "Generate challans, track payment status, send automated reminders, and view monthly collection reports across all campuses.",
    color: "#C8963A",
    light: "rgba(200,150,58,0.08)",
  },
  {
    icon: FileText,
    title: "Exam Results",
    description: "Enter marks section-by-section. Students and parents see results the moment a teacher submits — no delay, no paperwork.",
    color: "#1A3A5C",
    light: "rgba(26,58,92,0.08)",
  },
  {
    icon: Clock,
    title: "Live Timetable",
    description: "Teachers see their live day schedule. Students and parents always know exactly which class is happening right now.",
    color: "#4A1B7A",
    light: "rgba(74,27,122,0.08)",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Alerts",
    description: "Automated messages for attendance, fee reminders, exam schedules, and result announcements via the Meta Business API.",
    color: "#0D5C3B",
    light: "rgba(13,92,59,0.08)",
  },
  {
    icon: Building2,
    title: "Multi-Campus Support",
    description: "One system for every campus. The principal sees all; admins are scoped to their campus automatically at the server level.",
    color: "#7C2D12",
    light: "rgba(124,45,18,0.08)",
  },
];

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="group"
      style={{
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.07)",
        borderRadius: 16,
        padding: "32px 28px",
        display: "flex", flexDirection: "column", gap: 16,
        cursor: "default",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        transition: "all 250ms cubic-bezier(0.4,0,0.2,1)",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = feature.color;
        el.style.boxShadow = `0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px ${feature.color}20`;
        el.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(0,0,0,0.07)";
        el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
        el.style.transform = "translateY(0)";
      }}
    >
      {/* Top color accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${feature.color}, transparent)`,
        opacity: 0, transition: "opacity 250ms",
      }} className="group-hover:opacity-100" />

      {/* Icon */}
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: feature.light,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <feature.icon size={22} color={feature.color} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <h3 style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19,
          letterSpacing: "-0.015em", lineHeight: 1.25, color: "#0D1B0B",
          margin: 0,
        }}>{feature.title}</h3>
        <p style={{
          fontFamily: "var(--font-body)", fontSize: 14.5, lineHeight: 1.65,
          color: "#62718A", margin: 0,
        }}>{feature.description}</p>
      </div>

      {/* Arrow */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
        <span style={{
          fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13,
          color: feature.color,
        }}>Learn more</span>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ transition: "transform 200ms" }}
          className="group-hover:translate-x-1">
          <path d="M3 8h10M9 4l4 4-4 4" stroke={feature.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headerRef, { once: true });

  return (
    <section
      id="features"
      style={{ background: "#FAFAF7", paddingTop: 96, paddingBottom: 96 }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <div ref={headerRef} style={{ marginBottom: 56 }}>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            style={{
              display: "inline-block",
              fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: "#C8963A", marginBottom: 16,
            }}
          >
            Platform Capabilities
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: "clamp(2rem,4.5vw,3.2rem)",
              lineHeight: 1.1, letterSpacing: "-0.025em",
              color: "#0D1B0B", maxWidth: 640, margin: 0, marginBottom: 16,
            }}
          >
            Everything your school needs, in one place.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontFamily: "var(--font-body)", fontSize: 18, lineHeight: 1.65,
              color: "#4A5567", maxWidth: 560, margin: 0,
            }}
          >
            From daily attendance to end-of-year results — the platform handles the admin
            work so educators can focus on teaching.
          </motion.p>
        </div>

        {/* Cards grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 20,
        }}>
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
