"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

const COLUMNS = [
  {
    heading: "Platform",
    links: [
      { label: "Features",    href: "#features" },
      { label: "Login",       href: "/login" },
      { label: "Boys Campus", href: "#" },
      { label: "Girls Campus",href: "#" },
    ],
  },
  {
    heading: "Institution",
    links: [
      { label: "About",      href: "#" },
      { label: "Admissions", href: "#" },
      { label: "Contact",    href: "#" },
      { label: "Privacy",    href: "#" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Terms",       href: "#" },
    ],
  },
];

const CONTACT = [
  { Icon: MapPin, text: "Government Intermediate College, Pakistan" },
  { Icon: Phone,  text: "+92-XXX-XXXXXXX" },
  { Icon: Mail,   text: "info@falconschool.edu.pk" },
];

export function FooterSection() {
  return (
    <footer style={{ background: "#0D3B2A", paddingTop: 64, paddingBottom: 40 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1.4fr",
          gap: 48, marginBottom: 48, paddingBottom: 48,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: "rgba(200,150,58,0.2)", border: "1px solid rgba(200,150,58,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 7l9 5 9-5-9-5Z" fill="#C8963A" />
                  <path d="M3 12l9 5 9-5" stroke="#C8963A" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M3 17l9 5 9-5" stroke="rgba(200,150,58,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "#fff", margin: 0, lineHeight: 1.2 }}>Falcon School</p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#C8963A", margin: 0 }}>Management System</p>
              </div>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.45)", maxWidth: 280, margin: 0 }}>
              A unified digital management platform for Government Intermediate College — students, staff, parents, and admin.
            </p>
          </div>

          {COLUMNS.map(col => (
            <div key={col.heading}>
              <h4 style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", marginBottom: 16, marginTop: 0 }}>{col.heading}</h4>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" as const, gap: 10 }}>
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(255,255,255,0.55)", textDecoration: "none" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#C8963A"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"; }}
                    >{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", marginBottom: 16, marginTop: 0 }}>Contact</h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" as const, gap: 12 }}>
              {CONTACT.map(({ Icon, text }) => (
                <li key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Icon size={13} color="#C8963A" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(255,255,255,0.28)", margin: 0 }}>
            © {new Date().getFullYear()} Government Intermediate College. All rights reserved.
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", margin: 0 }}>
            POWERED BY FALCON SCHOOL SYSTEM
          </p>
        </div>
      </div>
    </footer>
  );
}
