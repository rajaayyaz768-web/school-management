"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { name: "Features",   href: "#features" },
  { name: "Campus",     href: "#campus" },
  { name: "Admissions", href: "#" },
  { name: "Contact",    href: "#" },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        height: scrolled ? "64px" : "80px",
        background: scrolled ? "rgba(255,255,255,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(180,155,100,0.18)" : "1px solid transparent",
        boxShadow: scrolled ? "0 2px 24px rgba(0,0,0,0.06)" : "none",
        transition: "all 280ms cubic-bezier(0.4,0,0.2,1)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div className="max-w-[1280px] mx-auto w-full px-6 lg:px-10 flex items-center gap-8">

        {/* Logo */}
        <a href="#" className="flex items-center gap-3 shrink-0">
          <div
            style={{
              width: 38, height: 38,
              background: scrolled ? "linear-gradient(135deg,#0D3B2A,#1a6045)" : "rgba(255,255,255,0.15)",
              border: scrolled ? "none" : "1.5px solid rgba(255,255,255,0.35)",
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(8px)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7l9 5 9-5-9-5Z" fill={scrolled ? "#C8963A" : "#fff"} />
              <path d="M3 12l9 5 9-5" stroke={scrolled ? "#C8963A" : "#fff"} strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M3 17l9 5 9-5" stroke={scrolled ? "#C8963A" : "rgba(255,255,255,0.6)"} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: "-0.02em",
              color: scrolled ? "#0D3B2A" : "#fff",
              lineHeight: 1.2,
              transition: "color 280ms",
            }}>Falcon School</span>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: scrolled ? "#C8963A" : "rgba(255,255,255,0.55)",
              transition: "color 280ms",
            }}>Management System</span>
          </div>
        </a>

        {/* Separator */}
        <div style={{ width: 1, height: 24, background: scrolled ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.18)", marginLeft: 4 }} className="hidden md:block" />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {NAV_LINKS.map(link => (
            <a
              key={link.name}
              href={link.href}
              className="relative group px-3.5 py-2 text-sm font-semibold transition-colors"
              style={{ color: scrolled ? "#4A5567" : "rgba(255,255,255,0.78)", fontFamily: "var(--font-body)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = scrolled ? "#0D3B2A" : "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = scrolled ? "#4A5567" : "rgba(255,255,255,0.78)"; }}
            >
              {link.name}
              <span className="absolute bottom-0 left-3.5 right-3.5 h-px bg-current scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left opacity-40" />
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          <Link
            href="/login"
            style={{
              fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14,
              color: scrolled ? "#4A5567" : "rgba(255,255,255,0.78)",
              transition: "color 200ms",
              padding: "8px 12px",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = scrolled ? "#0D3B2A" : "#fff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = scrolled ? "#4A5567" : "rgba(255,255,255,0.78)"; }}
          >
            Sign in
          </Link>
          <Link
            href="/login"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "9px 20px", borderRadius: 8,
              background: scrolled ? "linear-gradient(135deg,#0D3B2A,#1a6045)" : "rgba(255,255,255,0.18)",
              border: scrolled ? "none" : "1.5px solid rgba(255,255,255,0.4)",
              color: "#fff",
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14,
              backdropFilter: "blur(8px)",
              boxShadow: scrolled ? "0 2px 12px rgba(13,59,42,0.28)" : "none",
              transition: "all 220ms",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(13,59,42,0.35)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = scrolled ? "0 2px 12px rgba(13,59,42,0.28)" : "none";
            }}
          >
            Login to Portal
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="md:hidden ml-auto"
          style={{ color: scrolled ? "#0D3B2A" : "#fff", padding: 8 }}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="absolute top-full left-0 right-0 md:hidden px-6 py-6 flex flex-col gap-4"
          style={{
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(180,155,100,0.18)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          }}
        >
          {NAV_LINKS.map(link => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, color: "#1C2B1A" }}
            >
              {link.name}
            </a>
          ))}
          <div style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "12px 24px", borderRadius: 8,
              background: "linear-gradient(135deg,#0D3B2A,#1a6045)",
              color: "#fff", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14,
            }}
          >
            Login to Portal <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </header>
  );
}
