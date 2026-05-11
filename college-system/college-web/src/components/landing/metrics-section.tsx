"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";

const METRICS = [
  { value: 1240, suffix: "+", label: "Students Enrolled",  sub: "Academic Year 2025" },
  { value: 45,   suffix: "+", label: "Staff Members",      sub: "Teachers & Admin" },
  { value: 5,    suffix: "",  label: "Academic Programs",  sub: "F.Sc · F.A · CS · Commerce" },
  { value: 15,   suffix: "+", label: "Years of Excellence",sub: "Est. 2010" },
];

function Counter({ end, suffix, inView, delay = 0 }: {
  end: number; suffix: string; inView: boolean; delay?: number;
}) {
  const [count, setCount] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    if (!inView || done.current) return;
    done.current = true;
    const duration = 2000;
    const startTime = performance.now() + delay * 1000;
    function tick(now: number) {
      const elapsed = Math.max(0, now - startTime);
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    }
    if (delay > 0) {
      const t = setTimeout(() => requestAnimationFrame(tick), delay * 1000);
      return () => clearTimeout(t);
    }
    requestAnimationFrame(tick);
  }, [inView, end, delay]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

export function MetricsSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });

  return (
    <section
      ref={ref}
      style={{
        background: "#F6F0E6",
        paddingTop: 96, paddingBottom: 96,
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Big decorative text in background */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        fontFamily: "var(--font-display)", fontWeight: 900,
        fontSize: "clamp(120px, 20vw, 240px)",
        color: "rgba(13,59,42,0.04)",
        letterSpacing: "-0.06em", whiteSpace: "nowrap",
        pointerEvents: "none", userSelect: "none",
      }}>
        FALCON
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 72, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}
        >
          <div>
            <span style={{
              display: "inline-block",
              fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: "#C8963A", marginBottom: 12,
            }}>By The Numbers</span>
            <h2 style={{
              fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: "clamp(2rem,4vw,3rem)",
              lineHeight: 1.1, letterSpacing: "-0.025em",
              color: "#0D3B2A", margin: 0,
            }}>
              Excellence you can measure.
            </h2>
          </div>
          <div style={{
            height: 1, flex: 1, maxWidth: 200,
            background: "linear-gradient(90deg, rgba(13,59,42,0.15), transparent)",
            alignSelf: "center", marginLeft: 32, display: "none",
          }} className="hidden lg:block" />
        </motion.div>

        {/* Metrics grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 0,
        }} className="grid grid-cols-2 lg:grid-cols-4">
          {METRICS.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                padding: "32px 24px",
                borderLeft: i === 0 ? "3px solid #C8963A" : "1px solid rgba(13,59,42,0.12)",
                display: "flex", flexDirection: "column", gap: 6,
              }}
            >
              <div style={{
                fontFamily: "var(--font-display)", fontWeight: 800,
                fontSize: "clamp(3rem, 6vw, 5rem)",
                lineHeight: 0.9, letterSpacing: "-0.04em",
                color: "#0D3B2A",
              }}>
                <Counter end={m.value} suffix={m.suffix} inView={inView} delay={0.1 + i * 0.1} />
              </div>
              <p style={{
                fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15,
                color: "#0D3B2A", margin: 0, marginTop: 8,
              }}>{m.label}</p>
              <p style={{
                fontFamily: "var(--font-body)", fontSize: 12,
                color: "#8B98A8", margin: 0, letterSpacing: "0.02em",
              }}>{m.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Decorative bottom line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: 1, marginTop: 48,
            background: "linear-gradient(90deg, #C8963A, #0D3B2A, transparent)",
            transformOrigin: "left",
          }}
        />
      </div>
    </section>
  );
}
