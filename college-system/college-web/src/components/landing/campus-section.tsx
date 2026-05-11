"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { MapPin, Users, BookOpen, Trophy } from "lucide-react";
import collegeImg from "../images/remove_the_cars_too_2K_202605081013.jpeg";

const CAMPUS_HIGHLIGHTS = [
  { icon: MapPin,   label: "2 Campuses",       sub: "Boys & Girls" },
  { icon: Users,    label: "1,240+ Students",  sub: "Enrolled 2025" },
  { icon: BookOpen, label: "5 Programs",       sub: "F.Sc · F.A · CS" },
  { icon: Trophy,   label: "15+ Years",        sub: "Of Excellence" },
];

/* Decorative campus life tile */
function LifeTile({ label, color, icon: Icon }: { label: string; color: string; icon: React.ElementType }) {
  return (
    <div
      style={{
        background: color,
        borderRadius: 12,
        padding: "24px 20px",
        display: "flex", flexDirection: "column",
        justifyContent: "space-between",
        height: "100%", minHeight: 120,
      }}
    >
      <Icon size={24} color="rgba(255,255,255,0.8)" />
      <p style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, color: "#fff", margin: 0, lineHeight: 1.3 }}>{label}</p>
    </div>
  );
}

export function CampusSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -100px 0px" });

  return (
    <section
      id="campus"
      ref={ref}
      style={{ background: "#F6F0E6", paddingTop: 96, paddingBottom: 96, overflow: "hidden" }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>

        {/* Section header */}
        <div style={{ marginBottom: 56, display: "flex", flexDirection: "column", gap: 8 }}>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            style={{
              fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: "#C8963A",
            }}
          >
            Our Campus
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: "clamp(2rem,4.5vw,3.2rem)",
              lineHeight: 1.1, letterSpacing: "-0.025em",
              color: "#0D3B2A", maxWidth: 640, margin: 0,
            }}
          >
            Where generations of students have built their future.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontFamily: "var(--font-body)", fontSize: 17, lineHeight: 1.65,
              color: "#4A5567", maxWidth: 560, margin: 0, marginTop: 4,
            }}
          >
            Government Intermediate College has been a cornerstone of education in the region
            since 2010, serving thousands of students across our campuses.
          </motion.p>
        </div>

        {/* Main photo mosaic grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gridTemplateRows: "auto auto", gap: 12 }}>

          {/* PRIMARY — large school building photo spanning 8 cols */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.75, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              gridColumn: "1 / 9", gridRow: "1 / 3",
              position: "relative", borderRadius: 16, overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              minHeight: 340,
            }}
          >
            <Image
              src={collegeImg}
              alt="Falcon School — Government Intermediate College main campus building"
              fill
              sizes="(max-width: 768px) 100vw, 66vw"
              className="object-cover object-center"
            />
            {/* Overlay gradient for readability */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, transparent 45%, rgba(7,30,22,0.7) 100%)",
              pointerEvents: "none",
            }} />

            {/* Label overlay */}
            <div style={{
              position: "absolute", bottom: 24, left: 24, right: 24,
              display: "flex", alignItems: "flex-end", justifyContent: "space-between",
            }}>
              <div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "#C8963A", textTransform: "uppercase", margin: 0 }}>
                  Main Campus
                </p>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                  Government Intermediate College
                </p>
              </div>
              <div style={{
                background: "rgba(200,150,58,0.9)",
                borderRadius: 6, padding: "6px 12px",
                fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
                color: "#fff", letterSpacing: "0.08em", whiteSpace: "nowrap",
              }}>
                Est. 2010
              </div>
            </div>
          </motion.div>

          {/* TOP RIGHT — Campus life tiles */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ gridColumn: "9 / 13", gridRow: "1 / 2" }}
          >
            <LifeTile
              label="Academic Excellence & Rigorous Curriculum"
              color="linear-gradient(135deg, #0D3B2A, #1a6045)"
              icon={BookOpen}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.45 }}
            style={{ gridColumn: "9 / 11", gridRow: "2 / 3" }}
          >
            <LifeTile
              label="Multi-Campus Learning Environment"
              color="linear-gradient(135deg, #C8963A, #a87729)"
              icon={MapPin}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.55 }}
            style={{ gridColumn: "11 / 13", gridRow: "2 / 3" }}
          >
            <LifeTile
              label="Student Achievement & Results"
              color="linear-gradient(135deg, #1A3A5C, #0a2844)"
              icon={Trophy}
            />
          </motion.div>
        </div>

        {/* Highlight strip below mosaic */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{
            marginTop: 24,
            background: "linear-gradient(135deg, #0D3B2A, #0a2e20)",
            borderRadius: 16, padding: "28px 36px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 24,
          }}
        >
          {CAMPUS_HIGHLIGHTS.map((h, i) => (
            <motion.div
              key={h.label}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.65 + i * 0.08 }}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                borderRight: i < 3 ? "1px solid rgba(255,255,255,0.1)" : "none",
                paddingRight: i < 3 ? 24 : 0,
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: "rgba(200,150,58,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <h.icon size={18} color="#C8963A" />
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#fff", margin: 0, lineHeight: 1.2 }}>{h.label}</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0, marginTop: 2 }}>{h.sub}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Second school photo — wide panoramic strip */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
          style={{
            marginTop: 24,
            position: "relative", height: 220, borderRadius: 16, overflow: "hidden",
            boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
          }}
        >
          <Image
            src="/school-hero.jpg"
            alt="Falcon School campus — aerial view"
            fill
            sizes="100vw"
            className="object-cover object-center"
            onError={() => {}} // graceful fallback
          />
          {/* Overlay with a tint */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, rgba(13,59,42,0.7) 0%, rgba(13,59,42,0.2) 50%, rgba(13,59,42,0.5) 100%)",
          }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", padding: "0 48px" }}>
            <div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#C8963A", margin: 0 }}>Campus Grounds</p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#fff", margin: 0, marginTop: 4, letterSpacing: "-0.02em" }}>
                A Space Built for Learning
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "rgba(255,255,255,0.65)", margin: 0, marginTop: 6, maxWidth: 400 }}>
                Modern infrastructure, dedicated classrooms, and safe environments across all campuses.
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
