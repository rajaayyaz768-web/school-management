"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import collegeImg from "../images/remove_the_cars_too_2K_202605081013.jpeg";

export function CtaSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });

  return (
    <section ref={ref} style={{ background: "#F6F0E6", padding: "96px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            borderRadius: 24, overflow: "hidden",
            display: "grid", gridTemplateColumns: "1.1fr 0.9fr",
            minHeight: 420,
            boxShadow: "0 32px 80px rgba(0,0,0,0.16)",
          }}
          className="grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]"
        >
          {/* Left — dark green content */}
          <div
            style={{
              background: "linear-gradient(135deg, #0D3B2A 0%, #071e16 100%)",
              padding: "56px 64px",
              display: "flex", flexDirection: "column", justifyContent: "center",
              position: "relative", overflow: "hidden",
            }}
          >
            {/* Decorative circles */}
            <svg className="absolute top-0 right-0 opacity-10" width="280" height="280" viewBox="0 0 280 280" fill="none">
              <circle cx="280" cy="0" r="160" stroke="#C8963A" strokeWidth="1" />
              <circle cx="280" cy="0" r="100" stroke="#C8963A" strokeWidth="0.6" />
            </svg>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: "relative", zIndex: 1 }}
            >
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "4px 12px", borderRadius: 100,
                background: "rgba(200,150,58,0.2)", border: "1px solid rgba(200,150,58,0.4)",
                fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase" as const,
                color: "#C8963A", marginBottom: 24,
              }}>
                <Zap size={10} />
                Ready to get started
              </span>

              <h2 style={{
                fontFamily: "var(--font-display)", fontWeight: 800,
                fontSize: "clamp(1.8rem,3.5vw,2.8rem)",
                lineHeight: 1.1, letterSpacing: "-0.025em",
                color: "#fff", marginBottom: 16,
              }}>
                Ready to run your school from one desk?
              </h2>

              <p style={{
                fontFamily: "var(--font-body)", fontSize: 16, lineHeight: 1.65,
                color: "rgba(255,255,255,0.55)", maxWidth: 420, marginBottom: 36,
              }}>
                Log in with your assigned credentials and get started instantly.
                No setup, no training needed — everything works on day one.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
                <Link href="/login">
                  <motion.span
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 10,
                      padding: "14px 32px", borderRadius: 10,
                      background: "linear-gradient(135deg, #C8963A, #a87729)",
                      color: "#fff",
                      fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 16,
                      boxShadow: "0 8px 28px rgba(200,150,58,0.38)",
                      cursor: "pointer",
                    }}
                  >
                    Login to Portal
                    <ArrowRight size={16} />
                  </motion.span>
                </Link>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <ShieldCheck size={13} color="rgba(255,255,255,0.35)" />
                  <span style={{
                    fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600,
                    color: "rgba(255,255,255,0.35)",
                  }}>
                    Secure · Role-based access · All campuses
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right — school photo */}
          <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "relative", minHeight: 320 }}
          >
            <Image
              src={collegeImg}
              alt="Falcon School campus building"
              fill
              sizes="600px"
              className="object-cover object-center"
            />
            {/* Overlay */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(90deg, rgba(7,30,22,0.35) 0%, transparent 50%)",
              pointerEvents: "none",
            }} />
            {/* Caption */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "linear-gradient(180deg, transparent, rgba(7,30,22,0.75))",
              padding: "48px 32px 24px",
            }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#C8963A", letterSpacing: "0.12em", textTransform: "uppercase" as const, margin: 0 }}>Government Intermediate College</p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#fff", margin: 0, marginTop: 2 }}>Main Campus · Est. 2010</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
