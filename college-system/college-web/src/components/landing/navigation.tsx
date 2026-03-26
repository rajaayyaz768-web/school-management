"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Menu, X } from "lucide-react";
import { FalconEagleLogo } from "./FalconEagleLogo";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "How it works", href: "#how-it-works" },
  { name: "Academics", href: "#developers" },
  { name: "Admissions", href: "#pricing" },
];

function FalconLogo({ isScrolled }: { isScrolled: boolean }) {
  return (
    <a href="#" className="flex items-center gap-3 group" aria-label="Falcon College Home">
      {/* Animated Flying Eagle Logo */}
      <FalconEagleLogo size={isScrolled ? 36 : 48} />

      {/* College name */}
      <div className="flex flex-col leading-none">
        <span
          className={`font-display tracking-tight transition-all duration-500 text-[var(--foreground)] ${
            isScrolled ? "text-lg" : "text-2xl"
          }`}
        >
          Falcon
        </span>
        <span
          className={`font-mono uppercase tracking-[0.2em] text-[var(--muted-foreground)] transition-all duration-500 ${
            isScrolled ? "text-[8px]" : "text-[10px]"
          }`}
        >
          School System
        </span>
      </div>
    </a>
  );
}

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ${
        isScrolled
          ? "top-4 left-4 right-4"
          : "top-0 left-0 right-0"
      }`}
    >
      <nav
        className={`mx-auto transition-all duration-500 ${
          isScrolled || isMobileMenuOpen
            ? "bg-[var(--background)]/80 backdrop-blur-xl border border-[var(--foreground)]/10 rounded-2xl shadow-lg max-w-[1200px]"
            : "bg-transparent max-w-[1400px]"
        }`}
      >
        <div
          className={`flex items-center justify-between transition-all duration-500 px-6 lg:px-8 ${
            isScrolled ? "h-14" : "h-20"
          }`}
        >
          {/* Logo */}
          <FalconLogo isScrolled={isScrolled} />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-colors duration-300 relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[var(--foreground)] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className={`text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-all duration-500 ${
                isScrolled ? "text-xs" : "text-sm"
              }`}
            >
              Sign in
            </Link>
            <Link href="/login">
              <Button
                variant="primary"
                size="sm"
                className={`rounded-full transition-all duration-500 ${
                  isScrolled ? "px-4 h-8 text-xs" : "px-6"
                }`}
              >
                Portal Login
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu - Full Screen Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-[var(--background)] z-40 transition-all duration-500 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{ top: 0 }}
      >
        <div className="flex flex-col h-full px-8 pt-28 pb-8">
          {/* Navigation Links */}
          <div className="flex-1 flex flex-col justify-center gap-8">
            {navLinks.map((link, i) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-5xl font-display text-[var(--foreground)] hover:text-[var(--muted-foreground)] transition-all duration-500 ${
                  isMobileMenuOpen
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: isMobileMenuOpen ? `${i * 75}ms` : "0ms" }}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Bottom CTAs */}
          <div
            className={`flex gap-4 pt-8 border-t border-[var(--foreground)]/10 transition-all duration-500 ${
              isMobileMenuOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: isMobileMenuOpen ? "300ms" : "0ms" }}
          >
            <Link href="/login" className="flex-1">
              <Button
                variant="outline"
                className="w-full rounded-full h-14 text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign in
              </Button>
            </Link>
            <Link href="/login" className="flex-1">
              <Button
                variant="primary"
                className="w-full rounded-full h-14 text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Portal Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
