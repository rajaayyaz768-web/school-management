"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, GraduationCap, Users, BookOpen, Award } from "lucide-react";
import { motion, useInView } from "motion/react";
import collegeImg from "../images/remove_the_cars_too_2K_202605081013.jpeg";

const STATS = [
  { icon: GraduationCap, value: "1,240+", label: "Students" },
  { icon: Users,         value: "45+",    label: "Staff Members" },
  { icon: BookOpen,      value: "5",      label: "Programs" },
  { icon: Award,         value: "Est. 2010", label: "Excellence" },
];

export function HeroSection() {
  const rightRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rightRef, { once: true });

  return (
    <section className="relative overflow-hidden" style={{ minHeight: "100svh", background: "#F6F0E6" }}>

      {/* ── LEFT PANEL — Forest green ── */}
      <div
        className="absolute inset-y-0 left-0 w-full lg:w-[52%]"
        style={{ background: "linear-gradient(160deg, #0D3B2A 0%, #0a2e20 60%, #071e16 100%)" }}
      >
        {/* Subtle grain texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />
        {/* Corner decoration */}
        <svg className="absolute top-0 right-0 opacity-10" width="320" height="320" viewBox="0 0 320 320" fill="none">
          <circle cx="320" cy="0" r="200" stroke="#C8963A" strokeWidth="0.8" />
          <circle cx="320" cy="0" r="130" stroke="#C8963A" strokeWidth="0.6" />
          <circle cx="320" cy="0" r="70" stroke="#C8963A" strokeWidth="0.4" />
        </svg>
        {/* Bottom corner decoration */}
        <svg className="absolute bottom-0 left-0 opacity-8" width="200" height="200" viewBox="0 0 200 200" fill="none">
          <circle cx="0" cy="200" r="140" stroke="#C8963A" strokeWidth="0.6" />
        </svg>
      </div>

      {/* ── RIGHT PANEL — Cream ── */}
      <div
        className="absolute inset-y-0 right-0 hidden lg:block"
        style={{ width: "48%", background: "#F6F0E6" }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(circle, #C8963A 0.8px, transparent 0.8px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* ── CONTENT ── */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-10 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-[52%_48%] gap-0 w-full items-center py-28 lg:py-0">

          {/* ── LEFT: Text content ── */}
          <div className="py-10 lg:py-0 lg:pr-16">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <span
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "6px 16px",
                  borderRadius: 100,
                  background: "rgba(200,150,58,0.15)",
                  border: "1px solid rgba(200,150,58,0.4)",
                  color: "#C8963A",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#C8963A", display: "inline-block" }} />
                Falcon School System · Est. 2010
              </span>
            </motion.div>

            {/* Headline */}
            <div style={{ overflow: "hidden" }}>
              {["Empowering", "Education,", "Inspiring", "Excellence"].map((word, i) => (
                <motion.div
                  key={word}
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.75, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  style={{ display: "inline-block", marginRight: "0.3em" }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: "clamp(2.6rem,5.8vw,5rem)",
                      lineHeight: 1.05,
                      letterSpacing: "-0.028em",
                      color: i === 2 || i === 3 ? "#C8963A" : "#fff",
                      display: "inline-block",
                    }}
                  >
                    {word}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Divider line */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              style={{ width: 72, height: 3, background: "#C8963A", borderRadius: 2, margin: "24px 0", transformOrigin: "left" }}
            />

            {/* Institution name */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              style={{
                fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: "#C8963A", marginBottom: 8,
              }}
            >
              Government Intermediate College
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.95 }}
              style={{
                fontFamily: "var(--font-body)", fontSize: 17, lineHeight: 1.65,
                color: "rgba(255,255,255,0.55)", maxWidth: 420, marginBottom: 40,
              }}
            >
              A unified digital management system for students, parents, staff,
              and administration — everything your institution needs in one secure portal.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 48 }}
            >
              <Link href="/login">
                <motion.span
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "13px 28px", borderRadius: 8,
                    background: "linear-gradient(135deg,#C8963A,#a87729)",
                    color: "#fff",
                    fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15,
                    boxShadow: "0 8px 28px rgba(200,150,58,0.38)",
                    cursor: "pointer",
                  }}
                >
                  Login to Portal
                  <ArrowRight size={16} />
                </motion.span>
              </Link>
              <a href="#features">
                <motion.span
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "13px 28px", borderRadius: 8,
                    background: "rgba(255,255,255,0.07)",
                    border: "1.5px solid rgba(255,255,255,0.2)",
                    color: "rgba(255,255,255,0.85)",
                    fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15,
                    cursor: "pointer",
                  }}
                >
                  Explore Features
                </motion.span>
              </a>
            </motion.div>

            {/* Stats strip */}
            <motion.div
              ref={statsRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              style={{ display: "flex", flexWrap: "wrap", gap: 4 }}
            >
              {STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  style={{
                    display: "flex", flexDirection: "column",
                    padding: "12px 20px",
                    borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none",
                  }}
                >
                  <span style={{
                    fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22,
                    color: "#fff", lineHeight: 1, letterSpacing: "-0.02em",
                  }}>{stat.value}</span>
                  <span style={{
                    fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: "0.08em",
                    color: "rgba(255,255,255,0.42)", marginTop: 3,
                  }}>{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT: School photo featured ── */}
          <div
            ref={rightRef}
            className="hidden lg:flex items-center justify-center relative"
            style={{ paddingLeft: 48, paddingTop: 40, paddingBottom: 40 }}
          >
            {/* Large school photo — the star of the show */}
            <motion.div
              initial={{ opacity: 0, y: 40, rotate: -1 }}
              animate={inView ? { opacity: 1, y: 0, rotate: -1.5 } : {}}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "relative", width: "100%", maxWidth: 560,
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 32px 80px rgba(0,0,0,0.28), 0 8px 24px rgba(0,0,0,0.18)",
                border: "4px solid #fff",
                transform: "rotate(-1.5deg)",
              }}
            >
              <div style={{ aspectRatio: "4/3", position: "relative" }}>
                <Image
                  src={collegeImg}
                  alt="Falcon School campus — Government Intermediate College"
                  fill
                  sizes="560px"
                  className="object-cover object-center"
                  priority
                />
                {/* Subtle vignette */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.15) 100%)",
                  pointerEvents: "none",
                }} />
              </div>

              {/* Photo caption bar */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "rgba(13,59,42,0.92)", backdropFilter: "blur(8px)",
                padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: "#fff", margin: 0 }}>
                    Main Campus Building
                  </p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", margin: 0 }}>
                    GOV'T INTERMEDIATE COLLEGE
                  </p>
                </div>
                <div style={{
                  background: "#C8963A", padding: "4px 10px", borderRadius: 4,
                  fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
                  color: "#fff", letterSpacing: "0.08em",
                }}>
                  EST. 2010
                </div>
              </div>
            </motion.div>

            {/* Floating gold badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, x: 20 }}
              animate={inView ? { opacity: 1, scale: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "absolute", top: "14%", right: "-12px",
                background: "#fff",
                borderRadius: 12, padding: "12px 16px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
                display: "flex", alignItems: "center", gap: 10,
                border: "1px solid rgba(200,150,58,0.25)",
                zIndex: 10,
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: "linear-gradient(135deg,#0D3B2A,#1a6045)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <GraduationCap size={18} color="#C8963A" />
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "#0D3B2A", lineHeight: 1, margin: 0 }}>1,240+</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#6B7280", letterSpacing: "0.04em", margin: 0 }}>Active Students</p>
              </div>
            </motion.div>

            {/* Floating green badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, x: -20 }}
              animate={inView ? { opacity: 1, scale: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 1.05, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "absolute", bottom: "18%", left: "-8px",
                background: "linear-gradient(135deg,#0D3B2A,#1a6045)",
                borderRadius: 12, padding: "12px 16px",
                boxShadow: "0 8px 32px rgba(13,59,42,0.35)",
                display: "flex", alignItems: "center", gap: 10,
                zIndex: 10,
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 6,
                background: "rgba(200,150,58,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Award size={16} color="#C8963A" />
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: "#fff", margin: 0 }}>Multi-Campus Portal</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(255,255,255,0.55)", margin: 0 }}>Boys · Girls · Primary</p>
              </div>
            </motion.div>

            {/* Gold accent circle behind photo */}
            <div style={{
              position: "absolute", top: "20%", right: "8%",
              width: 120, height: 120, borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(200,150,58,0.2), rgba(200,150,58,0.05))",
              border: "1.5px solid rgba(200,150,58,0.25)",
              zIndex: 0,
            }} />
          </div>
        </div>
      </div>

      {/* Mobile photo strip — shown only on mobile */}
      <div className="lg:hidden relative z-10 w-full" style={{ marginTop: -20, background: "#F6F0E6" }}>
        <div style={{ position: "relative", width: "100%", height: 240, overflow: "hidden" }}>
          <Image
            src={collegeImg}
            alt="Falcon School campus"
            fill
            className="object-cover object-top"
            priority
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(13,59,42,0.5) 0%, transparent 40%, transparent 60%, rgba(13,59,42,0.4) 100%)" }} />
          <div style={{
            position: "absolute", bottom: 12, left: 16, right: 16,
            background: "rgba(13,59,42,0.85)", backdropFilter: "blur(8px)",
            borderRadius: 8, padding: "8px 14px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "#fff" }}>Main Campus Building</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#C8963A", letterSpacing: "0.1em" }}>EST. 2010</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.6 }}
        className="absolute bottom-8 left-[26%] -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 z-10"
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(255,255,255,0.28)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Scroll</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 1, height: 32, background: "linear-gradient(180deg, rgba(255,255,255,0.25), transparent)" }}
        />
      </motion.div>

    </section>
  );
}
