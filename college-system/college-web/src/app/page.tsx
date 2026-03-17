"use client";

import Link from "next/link";
import { GraduationCap, BookOpen, Users, Calendar } from "lucide-react";
import Button from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg)] font-body text-[var(--text)] flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-[var(--surface)] border-b border-[var(--border)] glass sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--gold)]">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-[var(--primary)]">
            College Portal
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="gold">Portal Login</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)', backgroundSize: '32px 32px' }}>
        </div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[var(--radius-pill)] bg-gold-400/10 text-[var(--gold)] text-sm font-semibold mb-6 ring-1 ring-gold-400/20">
          <span>✨ Welcome to the future of education management</span>
        </div>
        
        <h1 className="font-display text-5xl md:text-7xl font-bold text-[var(--primary)] max-w-4xl tracking-tight mb-6">
          Empowering Education,<br />
          <span className="text-[var(--gold)]">Inspiring Excellence.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mb-10 leading-relaxed">
          A premium digital ecosystem unifying students, parents, and staff under one intelligent institutional framework.
        </p>

        <Link href="/login">
          <Button variant="primary" size="lg" className="px-8 shadow-teal h-14 text-lg">
            Access The Portal
          </Button>
        </Link>
      </main>

      {/* Features Grid */}
      <section className="bg-[var(--surface)] py-20 px-6 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-[var(--primary)] mb-4">Unified Institutional Command</h2>
            <p className="text-[var(--text-muted)]">Everything you need to manage a thriving academic environment.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-[var(--radius-card)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--border-focus)] transition-colors">
              <div className="h-12 w-12 bg-teal-500/10 text-[var(--primary)] rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Role-Based Access</h3>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">Dedicated interfaces for Principal, Staff, Students, and Parents ensuring secure, relevant data access.</p>
            </div>
            
            <div className="p-6 rounded-[var(--radius-card)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--border-focus)] transition-colors">
              <div className="h-12 w-12 bg-gold-400/10 text-[var(--gold)] rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Live Attendance & Timetables</h3>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">Real-time scheduling and attendance tracking with instant notification pushes to parents and students.</p>
            </div>
            
            <div className="p-6 rounded-[var(--radius-card)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--border-focus)] transition-colors">
              <div className="h-12 w-12 bg-teal-500/10 text-[var(--primary)] rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Academic Excellence</h3>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">Centralized grade books, fee ledgers, and institutional reporting available strictly on demand.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center bg-[var(--primary)] text-white border-t border-[var(--border-strong)]">
        <p className="text-sm text-teal-100/60 font-body">© {new Date().getFullYear()} College Portal System. All rights reserved.</p>
      </footer>
    </div>
  );
}

