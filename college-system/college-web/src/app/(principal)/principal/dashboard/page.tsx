'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  BarChart3, UserCheck, GraduationCap, Building2, Users, Layers,
  Banknote, AlertTriangle, TrendingUp, Wallet, UserX, CalendarDays,
  BookOpen, AlertCircle, Bell, ChevronDown, ChevronRight, Megaphone,
  CheckCircle2, Filter,
} from 'lucide-react'
import { Skeleton } from '@/components/ui'
import { useCampusStore } from '@/store/campusStore'
import { useCurrentUser } from '@/store/authStore'
import { usePrincipalDashboard } from '@/features/dashboard/principal/hooks/usePrincipalDashboard'
import { NeuCampusSummaryCard } from '@/features/dashboard/principal/components/CampusSummaryCard'
import { useAbsenceAlerts } from '@/features/absence-alerts/hooks/useAbsenceAlerts'
import { AbsenceAlertPanel } from '@/features/absence-alerts/components/AbsenceAlertPanel'
import type { UpcomingExam } from '@/features/dashboard/principal/types/principal-dashboard.types'

// ─── helpers ─────────────────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 1_000_000) return `PKR ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `PKR ${(n / 1_000).toFixed(0)}K`
  return `PKR ${n.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number,number,number,number], delay },
})

const AVATAR_COLORS = [
  'bg-rose-400', 'bg-violet-400', 'bg-amber-400',
  'bg-sky-400',  'bg-emerald-400','bg-pink-400',
]

const AUD_META: Record<string, { dot: string; label: string; color: string }> = {
  ALL:      { dot: 'bg-[#2d3240]',   label: 'All',      color: 'text-[#2d3240]/60' },
  STUDENTS: { dot: 'bg-emerald-500', label: 'Students',  color: 'text-emerald-600'  },
  PARENTS:  { dot: 'bg-amber-500',   label: 'Parents',   color: 'text-amber-600'    },
  TEACHERS: { dot: 'bg-violet-500',  label: 'Teachers',  color: 'text-violet-600'   },
}

const EXAM_STATUS: Record<string, string> = {
  SCHEDULED: 'bg-[#2d3240]/10 text-[#2d3240]',
  ONGOING:   'bg-emerald-500/15 text-emerald-600',
  COMPLETED: 'bg-[#dde1e7] text-[#6b7280]',
  CANCELLED: 'bg-[#c44e4e]/12 text-[#c44e4e]',
}

// ─── hero ─────────────────────────────────────────────────────────────────────
function HeroBanner({ totalStudents, attendancePct, campusCount, isLoading, displayName }: {
  totalStudents: number; attendancePct: number; campusCount: number; isLoading: boolean; displayName: string
}) {
  const now = new Date()
  const h   = now.getHours()
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr  = now.toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2d3240 0%, #1a1f2e 40%, #151925 100%)' }}>
      {/* decorative blobs */}
      <div className="neu-float-1 pointer-events-none absolute -top-20 -right-16 h-[350px] w-[350px] rounded-full bg-white opacity-[0.07]" />
      <div className="neu-float-2 pointer-events-none absolute -bottom-24 left-[8%] h-[250px] w-[250px] rounded-full bg-white opacity-[0.05]" />
      <div className="neu-float-3 pointer-events-none absolute top-[20%] left-1/2 h-[180px] w-[180px] rounded-full bg-white opacity-[0.06]" />
      <div className="pointer-events-none absolute bottom-0 right-[20%] h-[200px] w-[300px] rounded-full opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, #e85d3a, transparent 70%)' }} />

      <div className="relative z-10 mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          {/* greeting */}
          <div className="flex-1">
            <div className="mb-3 flex items-center gap-2">
              <span className="neu-live-dot h-2 w-2 rounded-full bg-emerald-400" />
              <p className="text-sm font-medium text-white/50 tracking-wide">{dateStr}</p>
            </div>
            <h1 className="mb-3 text-4xl md:text-5xl lg:text-[56px] font-black text-white tracking-tight leading-[1.1]"
              style={{ fontFamily: 'var(--font-jakarta)' }}>
              {greeting},<br />
              <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                {displayName}
              </span>
            </h1>
            <p className="max-w-md text-base md:text-lg text-white/55">
              Here&apos;s your live campus overview for today
            </p>
          </div>

          {/* stat pills */}
          <div className="flex flex-wrap lg:flex-nowrap gap-3 md:gap-4">
            {[
              { icon: UserCheck,    color: '#10b981', bg: 'rgba(58,125,92,0.15)',   border: 'rgba(58,125,92,0.3)',   label: 'Staff Attendance', value: isLoading ? '…' : `${attendancePct}%`          },
              { icon: GraduationCap,color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.25)', label: 'Total Students',   value: isLoading ? '…' : totalStudents.toLocaleString() },
              { icon: Building2,    color: '#fbbf24', bg: 'rgba(212,137,58,0.12)',  border: 'rgba(212,137,58,0.25)', label: 'Campuses',         value: isLoading ? '…' : campusCount.toString()          },
            ].map(({ icon: Icon, color, bg, border, label, value }) => (
              <div key={label}
                className="flex min-w-[160px] items-center gap-4 rounded-[20px] px-6 py-4"
                style={{ background: bg, backdropFilter: 'blur(16px)', border: `1px solid ${border}` }}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: bg }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <div>
                  <p className="text-2xl font-black leading-none text-white" style={{ fontFamily: 'var(--font-jakarta)' }}>{value}</p>
                  <p className="mt-1 text-[11px] font-medium" style={{ color: `${color}99` }}>{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── large attendance donut ───────────────────────────────────────────────────
function AttendanceDonut({ pct, size = 150, color }: { pct: number; size?: number; color: string }) {
  const r    = (size - 14) / 2
  const circ = 2 * Math.PI * r
  const fill = (Math.min(pct, 100) / 100) * circ
  return (
    <div className="relative flex shrink-0 items-center justify-center">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#dde1e7" strokeWidth={10} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeLinecap="round" strokeDasharray={`${fill} ${circ}`} className="neu-donut-fill" />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="text-[40px] font-black tracking-tight" style={{ color, fontFamily: 'var(--font-jakarta)' }}>{pct}%</span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-[#9ca3af]">attendance</span>
      </div>
    </div>
  )
}

// ─── collapsible section ──────────────────────────────────────────────────────
const STORAGE_KEY = 'principal-dashboard-neu-collapsed'

function useCollapsed(ids: string[]) {
  const [state, setState] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {}
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } catch { return {} }
  })
  const toggle = useCallback((id: string) => {
    setState(prev => {
      const next = { ...prev, [id]: !prev[id] }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])
  return { isOpen: (id: string) => !state[id], toggle }
}

function SectionToggle({
  id, label, subtitle, icon: Icon, badge, open, onToggle, delay = 0,
}: {
  id: string; label: string; subtitle?: string; icon: React.ElementType
  badge?: React.ReactNode; open: boolean; onToggle: () => void; delay?: number
}) {
  return (
    <motion.button {...fadeUp(delay)} onClick={onToggle}
      className="mb-6 flex w-full items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl neu-soft">
          <Icon className="h-5 w-5" style={{ color: '#2d3240' }} />
          {badge}
        </div>
        <div className="text-left">
          <h2 className="text-xl font-black tracking-tight text-[#2d3240]" style={{ fontFamily: 'var(--font-jakarta)' }}>
            {label}
          </h2>
          {subtitle && <p className="text-[11px] font-medium text-[#9ca3af]">{subtitle}</p>}
        </div>
      </div>
      <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.3, ease: [0.22,1,0.36,1] }}>
        <ChevronDown className="h-5 w-5 text-[#9ca3af]" />
      </motion.div>
    </motion.button>
  )
}

function SectionContent({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="c"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22,1,0.36,1] }}
          style={{ overflow: 'hidden' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── exam status badge ────────────────────────────────────────────────────────
function ExamStatusBadge({ status }: { status?: string }) {
  const s = status ?? 'SCHEDULED'
  const cls = EXAM_STATUS[s] ?? EXAM_STATUS.SCHEDULED
  return (
    <span className={`flex shrink-0 items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${cls}`}>
      {s === 'ONGOING' && <span className="neu-live-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />}
      {s}
    </span>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function PrincipalDashboardPage() {
  const user              = useCurrentUser()
  const activeCampusId    = useCampusStore(s => s.activeCampusId)
  const setActiveCampusId = useCampusStore(s => s.setActiveCampusId)
  const { data, isLoading } = usePrincipalDashboard(activeCampusId ?? undefined)
  const displayName = user?.fullName?.trim() || 'Principal'
  const { alerts, dismissAlert, clearAlerts } = useAbsenceAlerts()
  const { isOpen, toggle } = useCollapsed(['kpi','absent','exams','announcements','campus'])

  const stats     = data?.stats
  const absent    = data?.absentStaff ?? []
  const exams     = data?.upcomingExams ?? []
  const fee       = data?.feeSummary
  const anns      = data?.recentAnnouncements ?? []
  const breakdown = data?.campusBreakdown ?? []

  const attendancePct = stats && stats.totalStaffForCampus > 0
    ? Math.round((stats.presentStaff / stats.totalStaffForCampus) * 100) : 0
  const donutColor = attendancePct >= 80 ? '#3a7d5c' : attendancePct >= 60 ? '#d4893a' : '#c44e4e'

  const feeTotal = (fee?.collectedThisMonth ?? 0) + (fee?.totalPending ?? 0)
  const feePct   = feeTotal > 0 ? Math.round(((fee?.collectedThisMonth ?? 0) / feeTotal) * 100) : 0

  return (
    <div
      className="-mx-5 -mt-5 sm:-mx-7 sm:-mt-7 -mb-24 md:-mb-8 min-h-screen neu-scroll"
      style={{ background: '#e8ecf0' }}
    >
      {/* ── Hero ─────────────────────────────────────────── */}
      <HeroBanner
        totalStudents={stats?.totalStudents ?? 0}
        attendancePct={attendancePct}
        campusCount={breakdown.length || 1}
        isLoading={isLoading}
        displayName={displayName}
      />

      {/* ── Content ─────────────────────────────────────── */}
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10 pt-10 pb-16 space-y-12">

        {/* absence alerts (if any) */}
        {alerts.length > 0 && (
          <motion.div {...fadeUp(0.03)}>
            <AbsenceAlertPanel alerts={alerts} onDismiss={dismissAlert} onClearAll={clearAlerts} />
          </motion.div>
        )}

        {/* ── Key Statistics ──────────────────────────────── */}
        <section>
          <SectionToggle id="kpi" label="Key Statistics" subtitle="Live overview across all campuses"
            icon={BarChart3} open={isOpen('kpi')} onToggle={() => toggle('kpi')} delay={0.04} />
          <SectionContent open={isOpen('kpi')}>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-12 gap-5">
                <Skeleton className="col-span-2 md:col-span-5 h-44 rounded-3xl" />
                <Skeleton className="col-span-1 md:col-span-3 h-44 rounded-3xl" />
                <Skeleton className="col-span-1 md:col-span-4 row-span-2 h-80 rounded-3xl" />
                <Skeleton className="col-span-1 md:col-span-3 h-36 rounded-3xl" />
                <Skeleton className="col-span-1 md:col-span-5 h-36 rounded-3xl" />
                <Skeleton className="col-span-2 md:col-span-12 h-28 rounded-3xl" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-12 gap-5">

                {/* Total Students — wide gradient */}
                <motion.div {...fadeUp(0.06)} className="col-span-2 md:col-span-5">
                  <div className="neu-deep rounded-3xl p-6 md:p-7 min-h-[170px] relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f4f6fb 50%, #f0f0f8 100%)' }}>
                    <div className="pointer-events-none absolute top-0 right-0 h-36 w-36 rounded-full opacity-[0.06]"
                      style={{ background: 'radial-gradient(circle, #2d3240, transparent 70%)', transform: 'translate(30px,-30px)' }} />
                    <div className="mb-4 flex items-start justify-between">
                      <div className="neu-inset-light flex h-14 w-14 items-center justify-center rounded-[18px]"
                        style={{ background: 'rgba(45,50,64,0.08)' }}>
                        <GraduationCap className="h-6 w-6 text-[#2d3240]" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9ca3af]">Total Students</span>
                    </div>
                    <p className="text-[42px] font-black leading-none tracking-tight text-[#2d3240]"
                      style={{ fontFamily: 'var(--font-jakarta)' }}>
                      {(stats?.totalStudents ?? 0).toLocaleString()}
                    </p>
                    <p className="mt-2 text-sm text-[#6b7280]">
                      across <span className="font-bold text-[#2d3240]">{breakdown.length} campuses</span>
                    </p>
                    {breakdown.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {breakdown.map(c => (
                          <span key={c.campusId}
                            className="rounded-full px-3 py-1 text-[10px] font-bold text-[#2d3240]"
                            style={{ background: 'rgba(45,50,64,0.08)' }}>
                            {c.campusName.replace(' Campus', '')}: {c.totalStudents.toLocaleString()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Total Staff — coral cascade */}
                <motion.div {...fadeUp(0.08)} className="col-span-1 md:col-span-3">
                  <div className="neu-deep neu-accent-cascade coral rounded-3xl p-6 min-h-[170px] flex flex-col justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl mb-4" style={{ background: 'rgba(232,93,58,0.1)' }}>
                      <Users className="h-5 w-5 text-[#e85d3a]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9ca3af]">Total Staff</span>
                      <p className="mt-2 text-[38px] font-black leading-none tracking-tight text-[#2d3240]"
                        style={{ fontFamily: 'var(--font-jakarta)' }}>
                        {stats?.totalStaff ?? 0}
                      </p>
                      <p className="mt-1 text-xs text-[#9ca3af]">registered staff</p>
                    </div>
                  </div>
                </motion.div>

                {/* Present Today — tall donut, spans 2 rows */}
                <motion.div {...fadeUp(0.10)} className="col-span-2 md:col-span-4 md:row-span-2">
                  <div className="neu-deep neu-glow-green rounded-[28px] p-7 md:p-8 h-full min-h-[340px] flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
                      style={{ background: 'radial-gradient(circle at 50% 40%, #3a7d5c, transparent 70%)' }} />
                    {/* trend badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold"
                      style={{ background: 'rgba(58,125,92,0.12)', color: '#3a7d5c' }}>
                      <TrendingUp className="h-3 w-3" /> Live
                    </div>
                    <span className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] relative z-10" style={{ color: 'rgba(58,125,92,0.7)' }}>
                      Present Today
                    </span>
                    <div className="relative z-10 mb-5">
                      {isLoading
                        ? <div className="h-[150px] w-[150px] rounded-full bg-[#dde1e7] animate-pulse" />
                        : <AttendanceDonut pct={attendancePct} color={donutColor} />
                      }
                    </div>
                    <p className="relative z-10 text-2xl font-black tracking-tight text-[#2d3240]"
                      style={{ fontFamily: 'var(--font-jakarta)' }}>
                      {stats?.presentStaff ?? 0}
                      <span className="text-lg font-semibold text-[#9ca3af]">/{stats?.totalStaffForCampus ?? 0}</span>
                    </p>
                    <p className="relative z-10 mt-1 text-xs text-[#6b7280]">staff present today</p>
                    {/* present / absent mini tiles */}
                    <div className="relative z-10 mt-5 flex w-full gap-3">
                      <div className="flex-1 rounded-[var(--radius-md)] py-2.5 text-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
                        <p className="text-lg font-black text-emerald-500" style={{ fontFamily: 'var(--font-jakarta)' }}>{stats?.presentStaff ?? 0}</p>
                        <p className="text-xs font-semibold text-[#6b7280]">Present</p>
                      </div>
                      <div className="flex-1 rounded-[var(--radius-md)] py-2.5 text-center" style={{ background: 'rgba(196,78,78,0.1)' }}>
                        <p className="text-lg font-black text-[#c44e4e]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                          {Math.max(0, (stats?.totalStaffForCampus ?? 0) - (stats?.presentStaff ?? 0))}
                        </p>
                        <p className="text-xs font-semibold text-[#6b7280]">Absent</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Sections */}
                <motion.div {...fadeUp(0.12)} className="col-span-1 md:col-span-3">
                  <div className="neu-card rounded-[22px] p-5 min-h-[130px] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="neu-inset-light flex h-10 w-10 items-center justify-center rounded-2xl">
                        <Layers className="h-5 w-5 text-[#6b7280]" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9ca3af]">Sections</span>
                    </div>
                    <div>
                      <p className="text-3xl font-black tracking-tight text-[#2d3240]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                        {stats?.totalSections ?? 0}
                      </p>
                      <p className="mt-0.5 text-xs text-[#9ca3af]">active sections</p>
                    </div>
                  </div>
                </motion.div>

                {/* Today's Fees — gold gradient */}
                <motion.div {...fadeUp(0.14)} className="col-span-1 md:col-span-5">
                  <div className="neu-deep neu-glow-gold rounded-3xl p-6 min-h-[130px] relative overflow-hidden"
                    style={{ borderTop: '4px solid #d4893a', background: 'linear-gradient(135deg, #fff8ef 0%, #ffffff 50%, #fff5e8 100%)' }}>
                    <div className="pointer-events-none absolute top-0 right-0 h-28 w-28 rounded-full opacity-[0.06]"
                      style={{ background: 'radial-gradient(circle, #d4893a, transparent 70%)', transform: 'translate(24px,-24px)' }} />
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4893a]/70">Today&apos;s Fees</span>
                        <p className="mt-2 text-[36px] font-black leading-none tracking-tight text-[#d4893a]"
                          style={{ fontFamily: 'var(--font-jakarta)' }}>
                          {fmt(stats?.todayFeeCollection ?? 0)}
                        </p>
                        <p className="mt-1.5 text-xs text-[#6b7280]">collected today</p>
                      </div>
                      <div className="neu-inset-light flex h-16 w-16 items-center justify-center rounded-[20px]" style={{ background: 'rgba(212,137,58,0.12)' }}>
                        <Banknote className="h-6 w-6 text-[#d4893a]" />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Pending Fees — dark card, full width */}
                <motion.div {...fadeUp(0.16)} className="col-span-2 md:col-span-12">
                  <div className="rounded-3xl p-6 border-[3px] border-[#3d4255] relative overflow-hidden transition-all duration-[400ms] hover:border-[#c44e4e] hover:scale-[1.005]"
                    style={{ background: '#2d3240' }}>
                    <div className="pointer-events-none absolute top-0 right-0 h-28 w-28 rounded-full opacity-[0.06]"
                      style={{ background: 'radial-gradient(circle, #c44e4e, transparent 70%)', transform: 'translate(24px,-24px)' }} />
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
                      {/* pending amount */}
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Total Pending Fees</span>
                        <p className="mt-2 text-[34px] font-black leading-none tracking-tight text-white" style={{ fontFamily: 'var(--font-jakarta)' }}>
                          {fmt(fee?.totalPending ?? 0)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-red-400" style={{ background: 'rgba(239,68,68,0.2)' }}>
                            {fee?.defaulterCount ?? 0} defaulters
                          </span>
                          <AlertCircle className="h-4 w-4 text-red-400/60" />
                        </div>
                      </div>
                      {/* divider */}
                      <div className="hidden sm:block h-12 w-px bg-[#4a4f63]" />
                      {/* collection rate */}
                      <div className="flex-1 min-w-0">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Collection Rate</span>
                          <span className="text-sm font-black text-white/80">{feePct}%</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${feePct}%` }}
                            transition={{ duration: 1.2, ease: [0.22,1,0.36,1], delay: 0.5 }}
                            className="h-full rounded-full" style={{ background: '#3a7d5c' }} />
                        </div>
                        <p className="mt-2 text-xs text-white/40">
                          {fmt(fee?.collectedThisMonth ?? 0)} collected this month
                        </p>
                      </div>
                      {/* icon */}
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-[#4a4f63]">
                        <AlertTriangle className="h-6 w-6 text-[#c44e4e]" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </SectionContent>
        </section>

        <div className="neu-divider" />

        {/* ── Absent Today ──────────────────────────────────── */}
        <section>
          <SectionToggle id="absent" label="Absent Today" subtitle="Staff not present across all campuses"
            icon={UserX} open={isOpen('absent')} onToggle={() => toggle('absent')} delay={0.08}
            badge={absent.length > 0
              ? <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#c44e4e] text-[10px] font-black text-white shadow-lg">{absent.length}</span>
              : undefined
            } />
          <SectionContent open={isOpen('absent')}>
            <motion.div {...fadeUp(0.02)}>
              <div className="neu-deep rounded-[28px] p-6 md:p-7" style={{ borderTop: '4px solid #c44e4e' }}>
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
                  </div>
                ) : absent.length === 0 && attendancePct === 0 && (stats?.totalStaffForCampus ?? 0) > 0 ? (
                  <div className="flex items-center gap-3 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'rgba(212,137,58,0.15)' }}>
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-500">Attendance not marked yet</p>
                      <p className="mt-0.5 text-xs text-[#6b7280]">{stats?.totalStaffForCampus ?? 0} staff — mark attendance to see who is absent</p>
                    </div>
                  </div>
                ) : absent.length === 0 ? (
                  <div className="flex items-center gap-3 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'rgba(16,185,129,0.15)' }}>
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-500">All staff present today</p>
                      <p className="mt-0.5 text-xs text-[#6b7280]">No absences recorded</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {absent.slice(0, 7).map((s, idx) => (
                      <div key={s.id}
                        className="neu-inset-light flex items-center gap-3 rounded-2xl p-3.5 transition-all duration-300 hover:shadow-none">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                          {s.firstName[0]}{s.lastName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-bold text-[#2d3240]">{s.firstName} {s.lastName}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            {s.designation && (
                              <span className="rounded-lg px-2 py-0.5 text-[10px] font-semibold text-[#6b7280]"
                                style={{ background: '#dde1e7' }}>
                                {s.designation}
                              </span>
                            )}
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-black text-[#c44e4e]"
                              style={{ background: 'rgba(196,78,78,0.12)' }}>Absent</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {absent.length > 7 && (
                      <div className="neu-inset-light flex cursor-pointer items-center justify-center rounded-2xl p-3.5 transition-colors hover:bg-[#dde1e7]/40">
                        <div className="text-center">
                          <p className="text-lg font-black text-[#6b7280]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                            +{absent.length - 7}
                          </p>
                          <p className="text-[10px] font-medium text-[#9ca3af]">more absent</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </SectionContent>
        </section>

        <div className="neu-divider" />

        {/* ── Exams & Fees ──────────────────────────────────── */}
        <section>
          <SectionToggle id="exams" label="Exams & Fees" subtitle="Upcoming schedule & financial overview"
            icon={CalendarDays} open={isOpen('exams')} onToggle={() => toggle('exams')} delay={0.06} />
          <SectionContent open={isOpen('exams')}>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

              {/* Upcoming Exams */}
              <motion.div {...fadeUp(0.04)} className="xl:col-span-7 neu-deep rounded-[28px] p-6 md:p-7">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-black text-[#2d3240]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    <BookOpen className="h-4 w-4 text-[#9ca3af]" /> Upcoming Exams
                  </h3>
                  {exams.length > 0 && (
                    <span className="rounded-full px-3 py-1 text-[10px] font-bold text-[#6b7280]"
                      style={{ background: 'rgba(45,50,64,0.08)' }}>
                      {exams.length} scheduled
                    </span>
                  )}
                </div>

                {isLoading ? (
                  <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[68px] rounded-[18px]" />)}</div>
                ) : exams.length === 0 ? (
                  <div className="flex flex-col items-center py-10 text-[#9ca3af]">
                    <CalendarDays className="mb-2 h-8 w-8 opacity-30" />
                    <p className="text-sm">No exams scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {exams.map((exam: UpcomingExam) => {
                      const d = new Date(exam.date)
                      const isOngoing = exam.status === 'ONGOING'
                      return (
                        <div key={exam.id}
                          className="flex items-center gap-4 rounded-[18px] p-4 transition-all duration-300 hover:scale-[1.01]"
                          style={{
                            background: isOngoing ? 'rgba(58,125,92,0.06)' : 'rgba(221,225,231,0.4)',
                            borderLeft: `3px solid ${isOngoing ? '#3a7d5c' : 'rgba(45,50,64,0.2)'}`,
                          }}>
                          <div className="neu-inset-light flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-[16px]"
                            style={{ background: isOngoing ? 'rgba(58,125,92,0.1)' : undefined }}>
                            <span className="text-[10px] font-bold uppercase" style={{ color: isOngoing ? '#3a7d5c' : '#9ca3af' }}>
                              {d.toLocaleDateString('en-PK', { month: 'short' })}
                            </span>
                            <span className="text-xl font-black leading-none" style={{ color: isOngoing ? '#3a7d5c' : '#2d3240', fontFamily: 'var(--font-jakarta)' }}>
                              {d.toLocaleDateString('en-PK', { day: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-bold text-[#2d3240]">{exam.subjectName}</p>
                            <p className="mt-0.5 truncate text-xs text-[#9ca3af]">{exam.sectionName} · {exam.startTime}</p>
                          </div>
                          <ExamStatusBadge status={exam.status} />
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>

              {/* Fee Summary */}
              <div className="xl:col-span-5 space-y-5">
                {/* Collected This Month — gold */}
                <motion.div {...fadeUp(0.06)}>
                  <div className="neu-deep neu-glow-gold rounded-[22px] p-6 relative overflow-hidden"
                    style={{ borderTop: '4px solid #d4893a', background: 'linear-gradient(135deg, #fff8ef 0%, #ffffff 50%, #fff5e8 100%)' }}>
                    <div className="pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-full opacity-[0.08]"
                      style={{ background: 'radial-gradient(circle, #d4893a, transparent 70%)', transform: 'translate(20px,-20px)' }} />
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4893a]/60">Collected This Month</span>
                        <p className="mt-2 text-3xl font-black leading-none tracking-tight text-[#d4893a]"
                          style={{ fontFamily: 'var(--font-jakarta)' }}>
                          {fmt(fee?.collectedThisMonth ?? 0)}
                        </p>
                        {feePct > 0 && (
                          <div className="mt-2 flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5 text-[#3a7d5c]" />
                            <span className="text-[11px] font-bold text-[#3a7d5c]">{feePct}% collection rate</span>
                          </div>
                        )}
                      </div>
                      <div className="neu-inset-light flex h-16 w-16 items-center justify-center rounded-[20px]" style={{ background: 'rgba(212,137,58,0.15)' }}>
                        <Wallet className="h-6 w-6 text-[#d4893a]" />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Pending + Defaulters */}
                <motion.div {...fadeUp(0.08)} className="grid grid-cols-2 gap-4">
                  <div className="neu-deep neu-glow-danger rounded-[20px] p-5" style={{ borderTop: '4px solid #c44e4e' }}>
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#c44e4e]/60">Pending</span>
                    <p className="mt-2 text-xl font-black leading-none tracking-tight text-[#c44e4e]"
                      style={{ fontFamily: 'var(--font-jakarta)' }}>
                      {fmt(fee?.totalPending ?? 0)}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-[#c44e4e]/50" />
                      <span className="text-[10px] text-[#6b7280]">overdue</span>
                    </div>
                  </div>
                  <div className="neu-card rounded-[20px] p-5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9ca3af]">Defaulters</span>
                    <p className="mt-2 text-xl font-black leading-none tracking-tight text-[#2d3240]"
                      style={{ fontFamily: 'var(--font-jakarta)' }}>
                      {fee?.defaulterCount ?? 0}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      <Users className="h-3 w-3 text-[#9ca3af]" />
                      <span className="text-[10px] text-[#6b7280]">students</span>
                    </div>
                  </div>
                </motion.div>

                {/* Collection Rate Bar */}
                {feeTotal > 0 && (
                  <motion.div {...fadeUp(0.10)}>
                    <div className="neu-card rounded-[20px] p-5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9ca3af]">Collection Rate</span>
                        <span className="text-sm font-black text-[#3a7d5c]">{feePct}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full" style={{ background: '#dde1e7' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${feePct}%` }}
                          transition={{ duration: 1.2, ease: [0.22,1,0.36,1], delay: 0.4 }}
                          className="h-full rounded-full" style={{ background: '#3a7d5c' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </SectionContent>
        </section>

        <div className="neu-divider" />

        {/* ── Announcements ─────────────────────────────────── */}
        <section>
          <SectionToggle id="announcements" label="Announcements" subtitle="Latest updates for the school community"
            icon={Bell} open={isOpen('announcements')} onToggle={() => toggle('announcements')} delay={0.05}
            badge={anns.length > 0
              ? <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#d4893a] text-[9px] font-black text-white shadow-md">{anns.length}</span>
              : undefined
            } />
          <SectionContent open={isOpen('announcements')}>
            <motion.div {...fadeUp(0.02)}>
              <div className="neu-deep rounded-[28px] p-6 md:p-7">
                {isLoading ? (
                  <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-[18px]" />)}</div>
                ) : anns.length === 0 ? (
                  <div className="flex flex-col items-center py-10 text-[#9ca3af]">
                    <Megaphone className="mb-2 h-8 w-8 opacity-30" />
                    <p className="text-sm">No recent announcements</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {anns.slice(0, 5).map(ann => {
                      const meta = AUD_META[ann.audience] ?? AUD_META.ALL
                      return (
                        <div key={ann.id}
                          className="neu-ann-row flex cursor-pointer items-center gap-4 rounded-[18px] p-4 transition-all duration-300 hover:bg-[#dde1e7]/50">
                          <span className={`h-3 w-3 shrink-0 rounded-full ${meta.dot}`} />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-bold text-[#2d3240]">{ann.title}</p>
                            <p className="mt-0.5 text-xs text-[#9ca3af]">
                              {new Date(ann.publishedAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}
                              {' · '}<span className={`font-semibold ${meta.color}`}>{meta.label}</span>
                            </p>
                          </div>
                          <ChevronRight className="neu-ann-chevron h-4 w-4 shrink-0 text-[#9ca3af]" />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </SectionContent>
        </section>

        <div className="neu-divider" />

        {/* ── Campus Overview ───────────────────────────────── */}
        {breakdown.length > 0 && (
          <section>
            <SectionToggle id="campus" label="Campus Overview" subtitle="Per-campus breakdown & metrics"
              icon={Building2} open={isOpen('campus')} onToggle={() => toggle('campus')} delay={0.05} />
            <SectionContent open={isOpen('campus')}>
              {activeCampusId && (
                <motion.div {...fadeUp(0)} className="mb-4">
                  <button
                    onClick={() => setActiveCampusId(null)}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors hover:bg-[#dde1e7]"
                    style={{ background: 'rgba(212,137,58,0.1)', border: '1px solid rgba(212,137,58,0.3)', color: '#d4893a' }}>
                    <Filter className="h-3 w-3" /> Filtered — reset
                  </button>
                </motion.div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {breakdown.map((c, i) => (
                  <motion.div key={c.campusId} {...fadeUp(0.04 + i * 0.05)}>
                    <NeuCampusSummaryCard campus={c} />
                  </motion.div>
                ))}
              </div>
            </SectionContent>
          </section>
        )}
      </div>
    </div>
  )
}
