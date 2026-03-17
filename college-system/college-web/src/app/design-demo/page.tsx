'use client'

import { useState, useCallback } from 'react'

// ─── COLOR TOKENS ──────────────────────────────────────────────────────────────
type ColorSet = {
  pageBg: string; surface: string; surfaceAlt: string; border: string
  text: string; textSec: string; textMuted: string; primary: string
  gold: string; goldLight: string; goldDark: string
  shadow: string; shadowMd: string
}

function getColors(isDark: boolean): ColorSet {
  return isDark ? {
    pageBg:    '#0C0C0C', surface:    '#1C1C1C', surfaceAlt: '#242424',
    border:    '#333333', text:       '#F0F0F0', textSec:    '#C0C0C0',
    textMuted: '#888888', primary:    '#242424', gold:       '#D4A843',
    goldLight: '#E0BC50', goldDark:   '#A88020',
    shadow:    '0 2px 12px rgba(0,0,0,0.40)',
    shadowMd:  '0 4px 20px rgba(0,0,0,0.50)',
  } : {
    pageBg:    '#F2F7F7', surface:    '#FFFFFF', surfaceAlt: '#F7FAFA',
    border:    '#C8DEDE', text:       '#0A1F1F', textSec:    '#2A4444',
    textMuted: '#4A6868', primary:    '#0F4444', gold:       '#D4A843',
    goldLight: '#E8C870', goldDark:   '#A88020',
    shadow:    '0 2px 12px rgba(8,40,40,0.10)',
    shadowMd:  '0 4px 20px rgba(8,40,40,0.14)',
  }
}

// ─── TYPES ─────────────────────────────────────────────────────────────────────
type AttStatus = 'present' | 'absent' | 'late' | 'leave' | null
type ToastType = 'success' | 'error' | 'warning' | 'info'
interface Toast { id: number; type: ToastType; message: string; title: string }

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getGrade(marks: number | null, total: number): string {
  if (marks === null) return '—'
  const pct = (marks / total) * 100
  if (pct >= 90) return 'A+'
  if (pct >= 80) return 'A'
  if (pct >= 70) return 'B'
  if (pct >= 60) return 'C'
  if (pct >= 50) return 'D'
  return 'F'
}

function getBadgeStyle(status: string): React.CSSProperties {
  const base: React.CSSProperties = {
    borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 700,
    fontFamily: '"DM Sans", sans-serif', display: 'inline-flex', alignItems: 'center', gap: 4,
  }
  const map: Record<string, React.CSSProperties> = {
    present: { background: '#dcfce7', color: '#16a34a' },
    paid:    { background: '#dcfce7', color: '#16a34a' },
    success: { background: '#dcfce7', color: '#16a34a' },
    'a+':    { background: '#FBF4DA', color: '#8A6A10' },
    a:       { background: '#dcfce7', color: '#16a34a' },
    absent:  { background: '#fee2e2', color: '#dc2626' },
    overdue: { background: '#fee2e2', color: '#dc2626' },
    fail:    { background: '#fee2e2', color: '#dc2626' },
    danger:  { background: '#fee2e2', color: '#dc2626' },
    f:       { background: '#fee2e2', color: '#dc2626' },
    late:    { background: '#fef3c7', color: '#d97706' },
    pending: { background: '#fef3c7', color: '#d97706' },
    warning: { background: '#fef3c7', color: '#d97706' },
    c:       { background: '#fef3c7', color: '#b45309' },
    d:       { background: '#fee2e2', color: '#b91c1c' },
    leave:   { background: '#e0f2fe', color: '#0369a1' },
    info:    { background: '#e0f2fe', color: '#0369a1' },
    b:       { background: '#eff6ff', color: '#1d4ed8' },
    partial: { background: '#f3e8ff', color: '#7c3aed' },
    waived:  { background: '#f3e8ff', color: '#7c3aed' },
    neutral: { background: '#f3f4f6', color: '#6b7280' },
  }
  return { ...base, ...(map[status.toLowerCase()] ?? { background: '#f3f4f6', color: '#6b7280' }) }
}

// ─── SECTION WRAPPER ──────────────────────────────────────────────────────────
function Section({ title, desc, children, C }: {
  title: string; desc: string; children: React.ReactNode; C: ColorSet
}) {
  return (
    <div style={{ marginBottom: 64 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
        <div style={{ width: 4, height: 32, background: '#D4A843', borderRadius: 2, flexShrink: 0 }} />
        <h2 style={{
          fontFamily: '"Playfair Display", Georgia, serif', fontSize: 24,
          fontWeight: 700, color: C.text, margin: 0,
        }}>{title}</h2>
      </div>
      <p style={{
        fontFamily: '"DM Sans", sans-serif', fontSize: 13, color: C.textMuted,
        marginBottom: 24, marginLeft: 20, fontStyle: 'italic', lineHeight: 1.6,
      }}>{desc}</p>
      <div style={{
        background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`,
        boxShadow: C.shadow, padding: 28,
      }}>{children}</div>
    </div>
  )
}

// ─── INLINE BUTTON ────────────────────────────────────────────────────────────
function IBtn({
  children, variant = 'primary', size = 'md', C, onClick, disabled, style,
}: {
  children: React.ReactNode
  variant?: 'primary' | 'gold' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  C: ColorSet
  onClick?: () => void
  disabled?: boolean
  style?: React.CSSProperties
}) {
  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: '6px 14px', fontSize: 11 },
    md: { padding: '10px 20px', fontSize: 13 },
    lg: { padding: '13px 26px', fontSize: 14 },
  }
  const variants: Record<string, React.CSSProperties> = {
    primary:   { background: C.primary, color: C.goldLight, border: 'none' },
    gold:      { background: `linear-gradient(135deg, ${C.goldDark}, ${C.gold})`, color: '#0A1F1F', border: 'none', boxShadow: '0 3px 14px rgba(212,168,67,0.38)' },
    secondary: { background: C.surface, color: C.text, border: `1.5px solid ${C.border}` },
    outline:   { background: 'transparent', color: C.primary, border: `2px solid ${C.primary}` },
    danger:    { background: '#dc2626', color: 'white', border: 'none' },
    ghost:     { background: 'transparent', color: C.textMuted, border: 'none' },
  }
  return (
    <button onClick={onClick} disabled={disabled} style={{
      fontFamily: '"DM Sans", sans-serif', fontWeight: 600, borderRadius: 8,
      cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.18s ease',
      display: 'inline-flex', alignItems: 'center', gap: 6,
      opacity: disabled ? 0.55 : 1,
      ...sizes[size], ...variants[variant], ...style,
    }}>{children}</button>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function DesignDemo() {
  const [isDark, setIsDark] = useState(false)
  const C = getColors(isDark)

  const [attStatus, setAttStatus] = useState<Record<number, AttStatus>>({
    0: 'present', 1: 'absent', 2: 'late', 3: 'present', 4: 'leave', 5: null,
  })
  const [marks, setMarks] = useState<Record<number, string>>({
    0: '92', 1: '78', 2: '45', 3: '88', 4: '', 5: '61',
  })
  const [absent, setAbsent] = useState<Record<number, boolean>>({ 4: true })
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: ToastType, title: string, message: string) => {
    const id = Date.now()
    setToasts(t => [...t, { id, type, title, message }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }, [])

  const toastColors: Record<ToastType, string> = {
    success: '#16a34a', error: '#dc2626', warning: '#d97706', info: '#0369a1',
  }
  const toastIcons: Record<ToastType, string> = {
    success: '✓', error: '✕', warning: '⚠', info: 'ℹ',
  }

  const attStudents = [
    { name: 'Ali Hassan',    roll: '001' },
    { name: 'Sara Malik',    roll: '002' },
    { name: 'Umar Farooq',   roll: '003' },
    { name: 'Ayesha Siddiq', roll: '004' },
    { name: 'Bilal Ahmed',   roll: '005' },
    { name: 'Zara Noor',     roll: '006' },
  ]
  const tableRows = [
    { roll: '001', name: 'Ali Hassan',    section: 'FSc PM 1-A',  pct: '94%',  status: 'present' },
    { roll: '002', name: 'Sara Malik',    section: 'FSc PM 1-A',  pct: '72%',  status: 'absent'  },
    { roll: '003', name: 'Umar Farooq',   section: 'ICS 2-B',    pct: '88%',  status: 'late'    },
    { roll: '004', name: 'Ayesha Siddiq', section: 'ICom 1-A',   pct: '100%', status: 'present' },
    { roll: '005', name: 'Bilal Ahmed',   section: 'FSc PE 2-A', pct: '65%',  status: 'late'    },
  ]
  const marksStudents = [
    { name: 'Ali Hassan',    roll: '001' },
    { name: 'Sara Malik',    roll: '002' },
    { name: 'Umar Farooq',   roll: '003' },
    { name: 'Ayesha Siddiq', roll: '004' },
    { name: 'Bilal Ahmed',   roll: '005' },
    { name: 'Zara Noor',     roll: '006' },
  ]

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI']
  const periods = ['P1  8:00–9:00', 'P2  9:00–10:00', 'P3  10:30–11:30', 'P4  11:30–12:30']
  const timetable: Record<string, { subject: string; section: string; room: string }> = {
    'MON-0': { subject: 'Physics',     section: 'FSc PM 1-A', room: 'Lab 1'  },
    'MON-1': { subject: 'Chemistry',   section: 'FSc PM 1-A', room: 'Lab 2'  },
    'MON-2': { subject: 'Biology',     section: 'FSc PM 1-A', room: 'Rm 101' },
    'MON-3': { subject: 'Mathematics', section: 'FSc PE 2-B', room: 'Rm 105' },
    'TUE-0': { subject: 'English',     section: 'FSc PE 1-B', room: 'Rm 103' },
    'TUE-1': { subject: 'Physics',     section: 'FSc PE 1-B', room: 'Lab 1'  },
    'TUE-2': { subject: 'Computer',    section: 'ICS 1-A',    room: 'CS Lab' },
    'TUE-3': { subject: 'Statistics',  section: 'ICS 2-A',    room: 'Rm 201' },
    'WED-0': { subject: 'Urdu',        section: 'FSc PM 1-A', room: 'Rm 104' },
    'WED-1': { subject: 'Physics',     section: 'FSc PM 1-A', room: 'Lab 1'  },
    'WED-2': { subject: 'Chemistry',   section: 'FSc PM 1-A', room: 'Lab 2'  },
    'WED-3': { subject: 'Biology',     section: 'FSc PM 1-A', room: 'Lab 3'  },
    'THU-0': { subject: 'Biology',     section: 'FSc PM 2-B', room: 'Lab 3'  },
    'THU-1': { subject: 'Mathematics', section: 'FSc PM 2-B', room: 'Rm 106' },
    'THU-2': { subject: 'English',     section: 'FSc PM 2-B', room: 'Rm 103' },
    'THU-3': { subject: 'Islamic St.', section: 'All',         room: 'Hall'   },
    'FRI-0': { subject: 'Pak Studies', section: 'All',         room: 'Hall'   },
    'FRI-1': { subject: 'Computer',    section: 'ICS 2-B',    room: 'CS Lab' },
    'FRI-2': { subject: 'Physics',     section: 'FSc PE 2-A', room: 'Lab 1'  },
    'FRI-3': { subject: 'Chemistry',   section: 'FSc PE 2-A', room: 'Lab 2'  },
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: '"DM Sans", sans-serif', fontSize: 11, fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.8px', color: C.textMuted,
    marginBottom: 6, display: 'block',
  }
  const inputBase: React.CSSProperties = {
    width: '100%', padding: '11px 14px', background: C.surface,
    border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13,
    fontFamily: '"DM Sans", sans-serif', color: C.text, outline: 'none',
    transition: 'border-color 0.2s ease', boxSizing: 'border-box',
  }

  return (
    <>
      {/* Toast container */}
      <div style={{
        position: 'fixed', top: 20, right: 20, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none',
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            width: 320, background: C.surface, borderRadius: 12,
            borderLeft: `4px solid ${toastColors[toast.type]}`,
            boxShadow: C.shadowMd, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            animation: 'toastSlideIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
            pointerEvents: 'all',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: toastColors[toast.type] + '22',
              color: toastColors[toast.type], fontSize: 16, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{toastIcons[toast.type]}</div>
            <div>
              <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 13, fontWeight: 700, color: C.text }}>{toast.title}</div>
              <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 11, color: C.textMuted, marginTop: 2 }}>{toast.message}</div>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN CANVAS — fixed, covers viewport */}
      <div style={{
        position: 'fixed', inset: 0, overflowY: 'auto',
        background: C.pageBg, fontFamily: '"DM Sans", system-ui, sans-serif',
        transition: 'background 0.3s ease',
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
          *, *::before, *::after { box-sizing: border-box; }
          @keyframes shimmer {
            0%   { background-position: -200% 0; }
            100% { background-position:  200% 0; }
          }
          @keyframes toastSlideIn {
            from { opacity: 0; transform: translateX(120%); }
            to   { opacity: 1; transform: translateX(0); }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>

        {/* STICKY HEADER */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 1000,
          background: isDark ? 'rgba(8,8,8,0.96)' : 'rgba(6,26,26,0.97)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.10)',
          padding: '0 40px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 20, fontWeight: 700, color: 'white' }}>
              Design System
            </div>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 11, color: '#E8C870', marginTop: 2 }}>
              Option B Light · Option D Dark · Teal + Gold
            </div>
          </div>
          <button
            onClick={() => setIsDark(d => !d)}
            style={{
              background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 10, padding: '9px 20px', cursor: 'pointer', color: 'white',
              fontFamily: '"DM Sans", sans-serif', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s ease',
            }}
          >
            {isDark ? '☀ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        {/* PAGE CONTENT */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 40px 80px' }}>

          {/* S1 ─ Color Palette */}
          <Section title="Color Palette" desc="All design tokens — Teal for authority, Gold for prestige, Charcoal for depth." C={C}>
            {[
              { label: 'TEAL SCALE', swatches: [
                { name: 'teal-950', hex: '#061A1A' }, { name: 'teal-900', hex: '#082828' },
                { name: 'teal-800', hex: '#0F3333' }, { name: 'teal-700', hex: '#0F4444' },
                { name: 'teal-600', hex: '#1A5555' }, { name: 'teal-500', hex: '#226666' },
                { name: 'teal-400', hex: '#4A9090' }, { name: 'teal-100', hex: '#C8E8E8' },
                { name: 'teal-50',  hex: '#F0F8F8' },
              ]},
              { label: 'GOLD SCALE', swatches: [
                { name: 'gold-700', hex: '#8A6A10' }, { name: 'gold-600', hex: '#A88020' },
                { name: 'gold-500', hex: '#C09030' }, { name: 'gold-400', hex: '#D4A843' },
                { name: 'gold-300', hex: '#E8C870' }, { name: 'gold-200', hex: '#F2DC9A' },
                { name: 'gold-100', hex: '#FBF4DA' },
              ]},
              { label: 'CHARCOAL SCALE', swatches: [
                { name: 'c-950', hex: '#080808' }, { name: 'c-900', hex: '#0C0C0C' },
                { name: 'c-800', hex: '#141414' }, { name: 'c-700', hex: '#1C1C1C' },
                { name: 'c-600', hex: '#242424' }, { name: 'c-500', hex: '#2C2C2C' },
                { name: 'c-400', hex: '#333333' }, { name: 'c-300', hex: '#3D3D3D' },
              ]},
              { label: 'SEMANTIC', swatches: [
                { name: 'success', hex: '#16a34a' }, { name: 'warning', hex: '#d97706' },
                { name: 'danger',  hex: '#dc2626' }, { name: 'info',    hex: '#0369a1' },
              ]},
            ].map(group => (
              <div key={group.label} style={{ marginBottom: 32 }}>
                <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 2, color: C.textMuted, textTransform: 'uppercase', marginBottom: 14, paddingLeft: 2 }}>
                  {group.label}
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {group.swatches.map(s => (
                    <div key={s.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 72 }}>
                      <div style={{ width: 72, height: 52, borderRadius: 10, background: s.hex, border: `1px solid ${C.border}`, boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }} />
                      <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 10, color: C.textMuted, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 72 }}>{s.name}</div>
                      <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 9, color: C.textMuted, opacity: 0.7, textAlign: 'center' }}>{s.hex}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Section>

          {/* S2 ─ Typography */}
          <Section title="Typography" desc="Three-font system: Playfair Display for headings, DM Sans for body/UI, JetBrains Mono for data." C={C}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Playfair */}
              <div style={{ padding: 24, borderRadius: 12, border: `1px solid ${C.border}`, background: C.surfaceAlt }}>
                <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#D4A843', textTransform: 'uppercase', marginBottom: 16 }}>PLAYFAIR DISPLAY</div>
                <div style={{ fontFamily: '"Playfair Display",Georgia,serif', fontSize: 36, fontWeight: 700, color: C.text, marginBottom: 8 }}>Academic Excellence</div>
                <div style={{ fontFamily: '"Playfair Display",Georgia,serif', fontSize: 24, fontWeight: 600, color: C.textSec, marginBottom: 8 }}>Intermediate College — Faisalabad</div>
                <div style={{ fontFamily: '"Playfair Display",Georgia,serif', fontSize: 18, fontStyle: 'italic', color: C.textMuted }}>Nurturing Excellence Since 1985</div>
              </div>
              {/* DM Sans */}
              <div style={{ padding: 24, borderRadius: 12, border: `1px solid ${C.border}`, background: C.surfaceAlt }}>
                <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#D4A843', textTransform: 'uppercase', marginBottom: 16 }}>DM SANS — BODY & UI</div>
                <p style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 14, color: C.textSec, lineHeight: 1.7, marginBottom: 20, maxWidth: 600 }}>
                  Al-Noor College Management System provides a unified portal for students, teachers, parents and administrators — enabling seamless academic operations across all campuses.
                </p>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'baseline' }}>
                  {[{ size: 36, label: 'Display 36' }, { size: 28, label: 'H1 28' }, { size: 22, label: 'H2 22' }, { size: 14, label: 'Body 14' }, { size: 12, label: 'Small 12' }].map(t => (
                    <div key={t.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: t.size, fontWeight: 600, color: C.text, lineHeight: 1 }}>{t.size}</div>
                      <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 10, color: C.textMuted, marginTop: 4 }}>{t.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* JetBrains */}
              <div style={{ padding: 24, borderRadius: 12, border: `1px solid ${C.border}`, background: C.surfaceAlt }}>
                <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#D4A843', textTransform: 'uppercase', marginBottom: 16 }}>JETBRAINS MONO — DATA</div>
                <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 18, fontWeight: 500, color: C.text, marginBottom: 10 }}>STU-2024-0087</div>
                <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 14, color: C.textMuted }}>Roll: 042 · Marks: 85/100 · Attendance: 94%</div>
              </div>
            </div>
          </Section>

          {/* S3 ─ Buttons */}
          <Section title="Buttons" desc="6 variants × 3 sizes. Primary uses deep teal, Gold uses gradient, others adapt to mode." C={C}>
            {(['sm', 'md', 'lg'] as const).map(size => (
              <div key={size} style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: C.textMuted, textTransform: 'uppercase', marginBottom: 12 }}>
                  {size.toUpperCase()} SIZE
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  {(['primary', 'gold', 'secondary', 'outline', 'danger', 'ghost'] as const).map(v => (
                    <IBtn key={v} variant={v} size={size} C={C}>{v.charAt(0).toUpperCase() + v.slice(1)}</IBtn>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, marginTop: 4 }}>
              <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: C.textMuted, textTransform: 'uppercase', marginBottom: 12 }}>STATES</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <IBtn variant="primary" C={C}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#E8C870', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Loading...
                </IBtn>
                <IBtn variant="primary" C={C} disabled>Disabled</IBtn>
                <IBtn variant="gold" C={C} disabled>Gold Disabled</IBtn>
              </div>
            </div>
          </Section>

          {/* S4 ─ Badges */}
          <Section title="Badges" desc="Status indicators for attendance, fees, grades and general purpose notifications." C={C}>
            {[
              { label: 'ATTENDANCE', items: ['present', 'absent', 'late', 'leave'] },
              { label: 'FEE STATUS',  items: ['paid', 'pending', 'overdue', 'partial', 'waived'] },
              { label: 'GRADES',     items: ['a+', 'a', 'b', 'c', 'd', 'f'] },
              { label: 'GENERAL',    items: ['success', 'warning', 'danger', 'info', 'neutral'] },
            ].map(group => (
              <div key={group.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: C.textMuted, textTransform: 'uppercase', width: 100, flexShrink: 0 }}>
                  {group.label}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {group.items.map(item => (
                    <span key={item} style={getBadgeStyle(item)}>
                      {['present','absent','late','leave'].includes(item) && (
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%', display: 'inline-block', flexShrink: 0,
                          background: item === 'present' ? '#16a34a' : item === 'absent' ? '#dc2626' : item === 'late' ? '#d97706' : '#0369a1',
                        }} />
                      )}
                      {item.toUpperCase() === 'A+' ? 'A+' : item.charAt(0).toUpperCase() + item.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </Section>

          {/* S5 ─ Form Inputs */}
          <Section title="Form Inputs" desc="Label + input pairs with icon, error, and disabled states." C={C}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={labelStyle}>Student Name</label>
                <input style={inputBase} placeholder="Enter student name" />
              </div>
              <div>
                <label style={labelStyle}>Search</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: C.textMuted }}>🔍</span>
                  <input style={{ ...inputBase, paddingLeft: 36 }} placeholder="Search students..." />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Father&apos;s CNIC</label>
                <input style={{ ...inputBase, border: '1.5px solid #dc2626' }} defaultValue="35202-123" />
                <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 11, color: '#dc2626', marginTop: 5 }}>
                  Invalid CNIC format. Use 00000-0000000-0.
                </div>
              </div>
              <div>
                <label style={{ ...labelStyle, opacity: 0.6 }}>Roll Number (Auto)</label>
                <input style={{ ...inputBase, opacity: 0.6, background: C.surfaceAlt, cursor: 'not-allowed' }} value="FSc-2025-0128" disabled readOnly />
              </div>
            </div>
          </Section>

          {/* S6 ─ Cards & StatCards */}
          <Section title="Cards & StatCards" desc="Card variants and stat display components for dashboard layouts." C={C}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
              {/* Standard */}
              <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: 24 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: C.textMuted, textTransform: 'uppercase' as const, fontFamily: '"DM Sans",sans-serif', marginBottom: 10 }}>STANDARD CARD</div>
                <div style={{ fontFamily: '"Playfair Display",serif', fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 6 }}>Class Dashboard</div>
                <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>FSc Pre-Medical Section A · 38 students enrolled</div>
              </div>
              {/* Gold accent */}
              <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, borderLeft: '4px solid #D4A843', boxShadow: C.shadow, padding: 24 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: '#D4A843', textTransform: 'uppercase' as const, fontFamily: '"DM Sans",sans-serif', marginBottom: 10 }}>GOLD ACCENT</div>
                <div style={{ fontFamily: '"Playfair Display",serif', fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 6 }}>Top Performer</div>
                <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>Ayesha Siddiq · 97% Average · Roll #004</div>
              </div>
              {/* Glass */}
              <div style={{ background: C.primary, borderRadius: 16, padding: 20 }}>
                <div style={{ background: 'rgba(255,255,255,0.09)', backdropFilter: 'blur(20px) saturate(180%)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: '#E8C870', textTransform: 'uppercase' as const, fontFamily: '"DM Sans",sans-serif', marginBottom: 10 }}>GLASS CARD</div>
                  <div style={{ fontFamily: '"Playfair Display",serif', fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 6 }}>Announcements</div>
                  <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>Annual Sports Day · 15th March 2026</div>
                </div>
              </div>
            </div>
            {/* 4 StatCards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[
                { icon: '👥', value: '1,247',    label: 'Students',    gold: false },
                { icon: '📅', value: '94%',      label: 'Attendance',  gold: false },
                { icon: '💰', value: 'PKR 4.2M', label: 'Fees Collected', gold: true },
                { icon: '🎓', value: '12',       label: 'Classes Live', gold: false },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: stat.gold ? 'linear-gradient(135deg, #A88020, #D4A843)' : C.surface,
                  borderRadius: 16, padding: 20,
                  border: stat.gold ? 'none' : `1px solid ${C.border}`,
                  borderLeft: stat.gold ? 'none' : '4px solid #D4A843',
                  boxShadow: stat.gold ? '0 4px 16px rgba(212,168,67,0.30)' : C.shadow,
                }}>
                  <div style={{ fontSize: 24 }}>{stat.icon}</div>
                  <div style={{ fontFamily: '"Playfair Display",Georgia,serif', fontSize: 28, fontWeight: 700, color: stat.gold ? '#0A1F1F' : C.text, margin: '8px 0 4px' }}>{stat.value}</div>
                  <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 11, color: stat.gold ? '#2A1A00' : C.textMuted, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* S7 ─ Data Table */}
          <Section title="Data Table" desc="Teal header with gold labels, alternating rows, badge status and ghost action buttons." C={C}>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}` }}>
              <div style={{ background: C.primary, display: 'grid', gridTemplateColumns: '80px 1fr 160px 100px 120px 110px', padding: '13px 24px', gap: 8 }}>
                {['Roll No', 'Student Name', 'Section', 'Att %', 'Status', 'Action'].map(h => (
                  <div key={h} style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 10, fontWeight: 700, color: '#E8C870', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{h}</div>
                ))}
              </div>
              {tableRows.map((row, i) => (
                <div key={row.roll} style={{
                  display: 'grid', gridTemplateColumns: '80px 1fr 160px 100px 120px 110px',
                  padding: '12px 24px', gap: 8, alignItems: 'center',
                  background: i % 2 === 0 ? C.surface : C.surfaceAlt,
                  borderBottom: i < tableRows.length - 1 ? `1px solid ${C.border}` : 'none',
                }}>
                  <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 11, color: C.textMuted }}>{row.roll}</div>
                  <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 13, fontWeight: 500, color: C.text }}>{row.name}</div>
                  <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 12, color: C.textMuted }}>{row.section}</div>
                  <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 13, fontWeight: 700, color: C.text }}>{row.pct}</div>
                  <div><span style={getBadgeStyle(row.status)}>{row.status.charAt(0).toUpperCase() + row.status.slice(1)}</span></div>
                  <div><IBtn variant="ghost" size="sm" C={C} style={{ color: C.primary, fontWeight: 600 }}>View →</IBtn></div>
                </div>
              ))}
            </div>
          </Section>

          {/* S8 ─ Attendance Cards */}
          <Section title="Attendance Cards" desc="Interactive per-student cards. Click status buttons to mark — card tint and border update live." C={C}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontFamily: '"Playfair Display",serif', fontSize: 16, fontWeight: 600, color: C.text }}>FSc PM 1-A · 8 March 2026</div>
              <IBtn variant="gold" size="sm" C={C}>Submit All</IBtn>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {attStudents.map((student, i) => {
                const st = attStatus[i]
                return (
                  <div key={i} style={{
                    background: st === 'present' ? '#f0fdf4' : st === 'absent' ? '#fef2f2' : st === 'late' ? '#fffbeb' : st === 'leave' ? '#eff6ff' : C.surface,
                    borderRadius: 12, padding: 16, border: `1px solid ${C.border}`,
                    borderLeft: st ? `4px solid ${st === 'present' ? '#16a34a' : st === 'absent' ? '#dc2626' : st === 'late' ? '#d97706' : '#0369a1'}` : `1px solid ${C.border}`,
                    transition: 'all 0.2s ease',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 10, background: C.primary, color: '#E8C870', padding: '2px 8px', borderRadius: 4 }}>{student.roll}</div>
                      <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 13, fontWeight: 600, color: C.text }}>{student.name}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {(['present', 'absent', 'late', 'leave'] as const).map(s => (
                        <button key={s} onClick={() => setAttStatus(prev => ({ ...prev, [i]: s }))} style={{
                          padding: '6px 8px', fontSize: 11, fontFamily: '"DM Sans",sans-serif', fontWeight: 600,
                          borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s ease',
                          border: st === s
                            ? `2px solid ${s === 'present' ? '#16a34a' : s === 'absent' ? '#dc2626' : s === 'late' ? '#d97706' : '#0369a1'}`
                            : `1px solid ${C.border}`,
                          background: st === s
                            ? (s === 'present' ? '#dcfce7' : s === 'absent' ? '#fee2e2' : s === 'late' ? '#fef3c7' : '#e0f2fe')
                            : C.surface,
                          color: st === s
                            ? (s === 'present' ? '#16a34a' : s === 'absent' ? '#dc2626' : s === 'late' ? '#d97706' : '#0369a1')
                            : C.textMuted,
                        }}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>

          {/* S9 ─ Timetable Grid */}
          <Section title="Timetable Grid" desc="Full-week timetable. Thursday P3 is highlighted as the current live period." C={C}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 4, minWidth: 640 }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontFamily: '"DM Sans",sans-serif', fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>Period</th>
                    {days.map(day => (
                      <th key={day} style={{
                        padding: '8px 10px', textAlign: 'center', fontFamily: '"DM Sans",sans-serif',
                        fontSize: 11, fontWeight: 700, borderRadius: 8,
                        background: day === 'THU' ? C.primary : C.surfaceAlt,
                        color: day === 'THU' ? 'white' : C.textMuted, letterSpacing: 1,
                      }}>{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periods.map((period, pi) => (
                    <>
                      {pi === 2 && (
                        <tr key="break">
                          <td colSpan={6} style={{
                            padding: '8px 14px', background: isDark ? '#2A2000' : '#FBF4DA',
                            borderRadius: 8, fontFamily: '"DM Sans",sans-serif', fontSize: 11,
                            fontWeight: 700, color: '#A88020', letterSpacing: 2,
                            textTransform: 'uppercase', textAlign: 'center',
                          }}>
                            ☕ BREAK  10:00 – 10:30
                          </td>
                        </tr>
                      )}
                      <tr key={period}>
                        <td style={{ padding: '8px 10px', fontFamily: '"JetBrains Mono",monospace', fontSize: 10, color: C.textMuted, whiteSpace: 'nowrap' }}>{period}</td>
                        {days.map(day => {
                          const slot = timetable[`${day}-${pi}`]
                          const isNow = day === 'THU' && pi === 2
                          return (
                            <td key={day} style={{
                              padding: '8px 10px', borderRadius: 8, textAlign: 'center',
                              background: isNow ? C.primary : slot ? C.surfaceAlt : 'transparent',
                              border: !slot ? `1px dashed ${C.border}` : 'none',
                              boxShadow: isNow ? '0 0 0 2px #D4A843' : 'none',
                              verticalAlign: 'top',
                            }}>
                              {isNow && <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 8, fontWeight: 700, color: '#E8C870', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>● NOW LIVE</div>}
                              {slot ? (
                                <>
                                  <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 12, fontWeight: 700, color: isNow ? 'white' : C.text }}>{slot.subject}</div>
                                  <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 10, color: isNow ? '#E8C870' : C.textMuted, marginTop: 2 }}>{slot.room}</div>
                                </>
                              ) : (
                                <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 10, color: C.border }}>—</div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* S10 ─ Marks Entry */}
          <Section title="Marks Entry" desc="Live grade calculation as you type. Absent checkbox disables the field and highlights the row red." C={C}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: '"Playfair Display",serif', fontSize: 16, fontWeight: 600, color: C.text }}>
                Monthly Test 1 — Physics — FSc PM 1-A — Total: 100 marks
              </div>
            </div>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}` }}>
              <div style={{ background: C.primary, display: 'grid', gridTemplateColumns: '70px 1fr 140px 90px 90px', padding: '12px 20px', gap: 8 }}>
                {['Roll', 'Student', 'Marks / 100', 'Grade', 'Absent'].map(h => (
                  <div key={h} style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 10, fontWeight: 700, color: '#E8C870', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{h}</div>
                ))}
              </div>
              {marksStudents.map((student, i) => {
                const isAbsent = absent[i] ?? false
                const m = marks[i]
                const mNum = m !== '' && !isNaN(Number(m)) ? Number(m) : null
                const grade = isAbsent ? 'ABS' : getGrade(mNum, 100)
                const gradeColor = grade === 'A+' ? '#8A6A10' : grade === 'A' ? '#16a34a' : grade === 'B' ? '#1d4ed8' : (grade === 'D' || grade === 'F' || grade === 'ABS') ? '#dc2626' : C.textMuted
                return (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '70px 1fr 140px 90px 90px',
                    padding: '10px 20px', gap: 8, alignItems: 'center',
                    background: isAbsent ? (isDark ? '#2a0000' : '#fff5f5') : i % 2 === 0 ? C.surface : C.surfaceAlt,
                    borderBottom: i < marksStudents.length - 1 ? `1px solid ${C.border}` : 'none',
                    borderLeft: isAbsent ? '4px solid #dc2626' : '4px solid transparent',
                    transition: 'all 0.2s ease',
                  }}>
                    <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 11, color: C.textMuted }}>{student.roll}</div>
                    <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 13, fontWeight: 500, color: isAbsent ? '#dc2626' : C.text }}>{student.name}</div>
                    <div>
                      <input
                        type="number" min={0} max={100}
                        value={isAbsent ? '' : (marks[i] ?? '')}
                        disabled={isAbsent}
                        placeholder={isAbsent ? 'Absent' : '0–100'}
                        onChange={e => setMarks(prev => ({ ...prev, [i]: e.target.value }))}
                        style={{
                          width: 110, padding: '6px 10px',
                          fontFamily: '"JetBrains Mono",monospace', fontSize: 13, fontWeight: 600,
                          background: isAbsent ? C.surfaceAlt : C.surface,
                          border: `1.5px solid ${C.border}`, borderRadius: 6,
                          color: C.text, outline: 'none',
                          opacity: isAbsent ? 0.5 : 1, cursor: isAbsent ? 'not-allowed' : 'text',
                        }}
                      />
                    </div>
                    <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 15, fontWeight: 700, color: gradeColor }}>{grade}</div>
                    <div>
                      <input
                        type="checkbox" checked={isAbsent}
                        onChange={e => setAbsent(prev => ({ ...prev, [i]: e.target.checked }))}
                        style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#dc2626' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>

          {/* S11 ─ Toasts */}
          <Section title="Toasts & Notifications" desc="Slide-in toasts from top-right. Auto-dismisses after 4 seconds." C={C}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <IBtn variant="primary" C={C} onClick={() => addToast('success', 'Attendance Saved', 'FSc PM 1-A attendance submitted successfully.')}>✓ Success Toast</IBtn>
              <IBtn variant="danger" C={C} onClick={() => addToast('error', 'Upload Failed', 'PDF file exceeds maximum allowed size of 5MB.')}>✕ Error Toast</IBtn>
              <IBtn variant="secondary" C={C} onClick={() => addToast('warning', 'Fee Overdue', 'Bilal Ahmed has an outstanding fee of PKR 12,000.')}>⚠ Warning Toast</IBtn>
              <IBtn variant="outline" C={C} onClick={() => addToast('info', 'Announcement', 'Annual Sports Day scheduled for 15th March 2026.')}>ℹ Info Toast</IBtn>
            </div>
          </Section>

          {/* S12 ─ Login Card */}
          <Section title="Login Card" desc="Glassmorphism card on deep teal gradient — the system entry point." C={C}>
            <div style={{
              background: 'linear-gradient(135deg, #061A1A 0%, #082828 45%, #0F3333 100%)',
              borderRadius: 20, padding: '48px 24px', position: 'relative', overflow: 'hidden',
              display: 'flex', justifyContent: 'center', minHeight: 420, alignItems: 'center',
            }}>
              <div style={{ position: 'absolute', top: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(15,68,68,0.55) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,67,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{
                width: 380, position: 'relative',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.14)', borderRadius: 22, padding: '44px 40px',
                boxShadow: '0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.10)',
              }}>
                <div style={{ width: 44, height: 2, background: '#D4A843', borderRadius: 1, margin: '0 auto 16px' }} />
                <div style={{ fontFamily: '"Playfair Display",serif', fontSize: 22, color: 'white', textAlign: 'center', fontWeight: 700 }}>Al-Noor College</div>
                <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 12, color: '#E8C870', textAlign: 'center', fontStyle: 'italic', margin: '4px 0 28px' }}>Management Portal</div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.10)', marginBottom: 28 }} />
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Email Address</label>
                  <input style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13, fontFamily: '"DM Sans",sans-serif', color: 'white', outline: 'none', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', boxSizing: 'border-box' }} placeholder="teacher@alnoor.edu.pk" />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Password</label>
                  <input type="password" style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13, fontFamily: '"DM Sans",sans-serif', color: 'white', outline: 'none', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', boxSizing: 'border-box' }} placeholder="••••••••" />
                </div>
                <button style={{ width: '100%', padding: 13, borderRadius: 10, cursor: 'pointer', fontFamily: '"DM Sans",sans-serif', fontSize: 14, fontWeight: 700, background: 'linear-gradient(135deg, #A88020, #D4A843)', color: '#0A1F1F', border: 'none', boxShadow: '0 4px 16px rgba(212,168,67,0.40)', transition: 'all 0.2s ease' }}>Sign In</button>
                <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 16 }}>Forgot password? Contact your administrator.</div>
              </div>
            </div>
          </Section>

          {/* S13 ─ Sidebar */}
          <Section title="Sidebar Component" desc="Always-dark navigation panel with glassmorphism, teal/gold glow effects and gold active item." C={C}>
            <div style={{ background: '#0A0A0A', borderRadius: 20, padding: 24, display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 260, height: 560, borderRadius: 16, overflow: 'hidden', position: 'relative', flexShrink: 0, background: 'linear-gradient(160deg, #061A1A 0%, #0F3333 60%, #061A1A 100%)' }}>
                {/* Glass overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.055)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.07)' }} />
                {/* Glows */}
                <div style={{ position: 'absolute', top: -40, left: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(15,68,68,0.60) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,67,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                {/* Content */}
                <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', padding: '20px 0' }}>
                  {/* Branding */}
                  <div style={{ padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontFamily: '"Playfair Display",serif', fontSize: 16, fontWeight: 700, color: 'white' }}>Al-Noor College</div>
                    <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 10, color: '#E8C870', marginTop: 3 }}>Management System</div>
                  </div>
                  {/* Nav */}
                  <div style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
                    {[
                      { label: 'OVERVIEW', items: [{ icon: '⊞', label: 'Dashboard', active: true }, { icon: '📢', label: 'Announcements', active: false }] },
                      { label: 'ACADEMICS', items: [{ icon: '📅', label: 'Attendance', active: false }, { icon: '📝', label: 'Exams & Marks', active: false }, { icon: '🗓', label: 'Timetable', active: false }] },
                      { label: 'FINANCE', items: [{ icon: '💰', label: 'Fee Management', active: false }, { icon: '📊', label: 'Reports', active: false }] },
                    ].map(section => (
                      <div key={section.label} style={{ marginBottom: 16 }}>
                        <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase', padding: '0 8px', marginBottom: 6 }}>
                          {section.label}
                        </div>
                        {section.items.map(item => (
                          <div key={item.label} style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 8px', borderRadius: 8, cursor: 'pointer',
                            background: item.active ? 'rgba(212,168,67,0.12)' : 'transparent',
                            borderLeft: item.active ? '3px solid #D4A843' : '3px solid transparent',
                            marginBottom: 2, transition: 'all 0.15s ease',
                          }}>
                            <span style={{ fontSize: 15 }}>{item.icon}</span>
                            <span style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 13, fontWeight: item.active ? 700 : 400, color: item.active ? '#E8C870' : 'rgba(255,255,255,0.65)' }}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  {/* User card */}
                  <div style={{ margin: '0 12px', padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #A88020, #D4A843)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"DM Sans",sans-serif', fontSize: 13, fontWeight: 700, color: '#0A1F1F', flexShrink: 0 }}>AH</div>
                    <div>
                      <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 12, fontWeight: 600, color: 'white' }}>Ahmed Hussain</div>
                      <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>Class Teacher</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Footer */}
          <div style={{ textAlign: 'center', padding: '24px 0 0', borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontFamily: '"Playfair Display",serif', fontSize: 14, fontWeight: 600, color: C.textMuted }}>
              Al-Noor College Design System
            </div>
            <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 11, color: C.textMuted, opacity: 0.6, marginTop: 4 }}>
              Option B Light · Option D Dark · Teal + Gold · All inline styles
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
