"use client";

import { ArrowUpRight } from "lucide-react";
import { AnimatedWave } from "./animated-wave";

import { FalconEagleLogo } from "./FalconEagleLogo";

const footerLinks = {
  Academics: [
    { name: "Programs", href: "#integrations" },
    { name: "How to Enroll", href: "#how-it-works" },
    { name: "Scholarships", href: "#pricing" },
    { name: "Timetables", href: "#developers" },
  ],
  Campus: [
    { name: "Facilities", href: "#" },
    { name: "Library", href: "#" },
    { name: "Labs", href: "#" },
    { name: "Sports", href: "#" },
  ],
  Portals: [
    { name: "Student Portal", href: "/login" },
    { name: "Parent Portal", href: "/login" },
    { name: "Teacher Portal", href: "/login" },
    { name: "Admin Portal", href: "/login" },
  ],
  Info: [
    { name: "About Us", href: "#" },
    { name: "Contact", href: "#" },
    { name: "Privacy Policy", href: "#" },
    { name: "Admissions", href: "#pricing" },
  ],
};

const socialLinks = [
  { name: "Facebook", href: "#" },
  { name: "Twitter", href: "#" },
  { name: "LinkedIn", href: "#" },
];

export function FooterSection() {
  return (
    <footer className="relative border-t border-foreground/10">
      {/* Animated wave background */}
      <div className="absolute inset-0 h-64 opacity-20 pointer-events-none overflow-hidden">
        <AnimatedWave />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Main Footer */}
        <div className="py-16 lg:py-24">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-12 lg:gap-8">
            {/* Brand Column */}
            <div className="col-span-2">
              <a href="#" className="inline-flex items-center gap-3 mb-6 group">
                {/* Animated Flying Eagle Logo */}
                <FalconEagleLogo size={64} />
                <div className="flex flex-col leading-none">
                  <span className="text-xl font-display">Falcon</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">School System</span>
                </div>
              </a>

              <p className="text-muted-foreground leading-relaxed mb-8 max-w-xs">
                Empowering education and inspiring excellence. Falcon College — where students soar to new heights.
              </p>

              {/* Social Links */}
              <div className="flex gap-6">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-sm font-medium mb-6">{title}</h3>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                      >
                        {link.name}
                        {"badge" in link && (link as { badge?: string }).badge && (
                          <span className="text-xs px-2 py-0.5 bg-foreground text-background rounded-full">
                            {(link as { badge?: string }).badge}
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Falcon College. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              All portals operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
