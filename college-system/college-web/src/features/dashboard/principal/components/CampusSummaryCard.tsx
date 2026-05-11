'use client'

import Link from 'next/link'
import { Users, GraduationCap, CreditCard, Layers, AlertTriangle, UserX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCampusStore } from '@/store/campusStore'
import { useThemeStore } from '@/store/themeStore'
import { CARD_STYLE_PROPS } from '@/lib/cardStyles'
import type { CampusBreakdown } from '../types/principal-dashboard.types'

// ─── SVG Donut ────────────────────────────────────────────────────────────────
function AttendanceDonut({ pct, size = 60 }: { pct: number; size?: number }) {
  const r      = (size - 8) / 2
  const circ   = 2 * Math.PI * r
  const offset = circ - (Math.min(pct, 100) / 100) * circ
  const color  = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative flex shrink-0 items-center justify-center">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={7} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="text-sm font-black" style={{ color }}>{pct}%</span>
      </div>
    </div>
  )
}

// ─── Metric tile ──────────────────────────────────────────────────────────────
function MetricTile({ icon: Icon, label, value, valueClass = 'text-[var(--text)]' }: {
  icon: React.ElementType; label: string; value: React.ReactNode; valueClass?: string
}) {
  return (
    <div className="flex flex-col gap-1 rounded-[var(--radius-sm)] bg-[var(--bg-secondary)]/60 p-2.5">
      <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
        <Icon className="h-3 w-3 shrink-0" />
        <span className="text-xs font-semibold uppercase tracking-widest">{label}</span>
      </div>
      <p className={cn('text-base font-black leading-tight', valueClass)}>{value}</p>
    </div>
  )
}

// ─── Legacy card (used on non-neu pages) ─────────────────────────────────────
export function CampusSummaryCard({ campus }: { campus: CampusBreakdown }) {
  const { activeCampusId, setActiveCampusId } = useCampusStore()
  const isActive  = activeCampusId === campus.campusId
  const cardStyle = useThemeStore(s => s.cardStyle)
  const baseProps = CARD_STYLE_PROPS[cardStyle] ?? CARD_STYLE_PROPS.elevated

  const attendancePct = campus.totalStaff > 0
    ? Math.round((campus.presentStaff / campus.totalStaff) * 100) : 0

  function fmt(n: number) {
    if (n >= 1_000_000) return `PKR ${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000)     return `PKR ${(n / 1_000).toFixed(0)}K`
    return `PKR ${n.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`
  }

  const accentColor = attendancePct >= 80 ? '#10b981' : attendancePct >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <button
      onClick={() => setActiveCampusId(isActive ? null : campus.campusId)}
      className="w-full cursor-pointer text-left transition-all duration-[var(--dur-base)] hover:-translate-y-[2px] overflow-hidden"
      style={{ ...baseProps, ...(isActive ? { border: '1.5px solid var(--primary)', boxShadow: 'var(--shadow-glow)' } : {}) }}>
      <div className="h-1 w-full" style={{ background: accentColor }} />
      <div className="p-4 sm:p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-[var(--text)] leading-tight">{campus.campusName}</h3>
            {isActive && (
              <span className="mt-1 inline-block rounded-full bg-[var(--primary)]/15 px-2 py-0.5 text-xs font-semibold text-[var(--primary)]">
                Active filter
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {campus.absentStaffCount > 0 && (
              <span className="flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/12 px-2 py-0.5 text-xs font-bold text-red-400">
                <UserX className="h-3 w-3" /> {campus.absentStaffCount}
              </span>
            )}
            <AttendanceDonut pct={attendancePct} size={56} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <MetricTile icon={GraduationCap} label="Students" value={campus.totalStudents} valueClass="text-[var(--primary)]" />
          <MetricTile icon={Users} label="Staff"
            value={
              <span>
                <span className={attendancePct >= 80 ? 'text-emerald-500' : 'text-red-400'}>{campus.presentStaff}</span>
                <span className="text-sm font-semibold text-[var(--text-muted)]">/{campus.totalStaff}</span>
              </span>
            } />
          <MetricTile icon={CreditCard} label="Fees" value={<span className="text-[var(--gold)]">{fmt(campus.todayFeeCollection)}</span>} />
          <MetricTile icon={Layers} label="Sections" value={campus.totalSections} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[var(--border)] pt-3">
          <div>
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">This Month</p>
            <p className="text-sm font-black text-emerald-500">{fmt(campus.collectedThisMonth)}</p>
          </div>
          <div>
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Pending</p>
            <p className="text-sm font-black text-amber-500">{fmt(campus.totalPending)}</p>
          </div>
          <div>
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Defaulters</p>
            <Link href={`/principal/fees/defaulters?campusId=${campus.campusId}`} onClick={e => e.stopPropagation()}
              className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 shrink-0 text-red-400" />
              <span className={cn('text-sm font-black', campus.defaulterCount > 0 ? 'text-red-400 underline underline-offset-2' : 'text-[var(--text-muted)]')}>
                {campus.defaulterCount}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </button>
  )
}

// ─── Neumorphic campus card (used on principal dashboard redesign) ─────────────
function NeuDonut({ pct, size = 72 }: { pct: number; size?: number }) {
  const r     = (size - 8) / 2
  const circ  = 2 * Math.PI * r
  const fill  = (Math.min(pct, 100) / 100) * circ
  const color = pct >= 80 ? '#3a7d5c' : pct >= 60 ? '#d4893a' : '#c44e4e'
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#dde1e7" strokeWidth={6}
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeLinecap="round" strokeDasharray={`${fill} ${circ}`}
        transform={`rotate(-90 ${size/2} ${size/2})`} className="neu-donut-fill" />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize={size < 60 ? 11 : 14} fontWeight="900"
        style={{ fontFamily: 'var(--font-jakarta)' }}>
        {pct}%
      </text>
    </svg>
  )
}

export function NeuCampusSummaryCard({ campus }: { campus: CampusBreakdown }) {
  const { activeCampusId, setActiveCampusId } = useCampusStore()
  const isActive = activeCampusId === campus.campusId

  const attendancePct = campus.totalStaff > 0
    ? Math.round((campus.presentStaff / campus.totalStaff) * 100) : 0

  function fmt(n: number) {
    if (n >= 1_000_000) return `PKR ${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000)     return `PKR ${(n / 1_000).toFixed(0)}K`
    return `PKR ${n.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`
  }

  const accentClass = isActive ? '' : 'amber'

  return (
    <button
      onClick={() => setActiveCampusId(isActive ? null : campus.campusId)}
      className={cn(
        'w-full cursor-pointer text-left neu-deep neu-accent-cascade rounded-[28px] p-7 relative overflow-hidden h-full',
        accentClass,
      )}
      style={{ background: isActive ? 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)' : '#ffffff' }}>
      {/* header */}
      <div className="relative z-10 mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-[#2d3240] tracking-tight" style={{ fontFamily: 'var(--font-jakarta)' }}>
            {campus.campusName}
          </h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {isActive && (
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                style={{ background: 'rgba(45,50,64,0.1)', color: '#2d3240' }}>
                Active filter
              </span>
            )}
            {campus.absentStaffCount > 0 && (
              <span className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] font-bold text-[#c44e4e]"
                style={{ background: 'rgba(196,78,78,0.12)' }}>
                <UserX className="h-3 w-3" /> {campus.absentStaffCount} absent
              </span>
            )}
          </div>
        </div>
        <NeuDonut pct={attendancePct} size={72} />
      </div>

      {/* metric 2×2 grid */}
      <div className="relative z-10 mb-4 grid grid-cols-2 gap-3">
        {[
          { label: 'Students', value: campus.totalStudents.toLocaleString(), color: undefined },
          { label: 'Staff', value: `${campus.presentStaff}/${campus.totalStaff}`, color: attendancePct >= 80 ? '#3a7d5c' : '#c44e4e' },
          { label: 'Fees Today', value: fmt(campus.todayFeeCollection), color: '#d4893a' },
          { label: 'Sections', value: campus.totalSections.toString(), color: undefined },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-[14px] p-3.5" style={{ background: '#f4f6f9', border: '1px solid #e8ecf0' }}>
            <p className="text-xl font-black tracking-tight" style={{ color: color ?? '#2d3240', fontFamily: 'var(--font-jakarta)' }}>{value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">{label}</p>
          </div>
        ))}
      </div>

      {/* fee breakdown */}
      <div className="relative z-10 space-y-2.5 border-t pt-4" style={{ borderColor: '#dde1e7' }}>
        {[
          { label: 'This Month', value: fmt(campus.collectedThisMonth), color: '#3a7d5c' },
          { label: 'Pending',    value: fmt(campus.totalPending),       color: '#d4893a' },
          { label: 'Defaulters', value: campus.defaulterCount.toString(), color: campus.defaulterCount > 0 ? '#c44e4e' : '#9ca3af' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6b7280]">{label}</span>
            <span className="text-sm font-black" style={{ color, fontFamily: 'var(--font-jakarta)' }}>{value}</span>
          </div>
        ))}
      </div>
    </button>
  )
}

export default CampusSummaryCard
