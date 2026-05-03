'use client'

import { motion } from 'motion/react'
import {
  Megaphone, ArrowRight, TrendingUp, Users, GraduationCap,
  Layers, Banknote, AlertCircle, UserX, CheckCircle2,
  CalendarDays, CreditCard, AlertTriangle, ChevronRight,
} from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import { Skeleton, Badge } from '@/components/ui'
import { useCampusStore } from '@/store/campusStore'
import { usePrincipalDashboard } from '@/features/dashboard/principal/hooks/usePrincipalDashboard'
import { CampusSummaryCard } from '@/features/dashboard/principal/components/CampusSummaryCard'
import { useAbsenceAlerts } from '@/features/absence-alerts/hooks/useAbsenceAlerts'
import { AbsenceAlertPanel } from '@/features/absence-alerts/components/AbsenceAlertPanel'

// ─── Animation helpers ────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' as const, delay },
})

// ─── Mobile KPI Card ──────────────────────────────────────────────────────────
type Accent = 'teal' | 'gold' | 'green' | 'red' | 'blue' | 'default'

const ACCENT_MAP: Record<Accent, { bg: string; iconBg: string; val: string }> = {
  teal:    { bg: 'bg-[var(--primary)]/8 border-[var(--primary)]/20',  iconBg: 'bg-[var(--primary)]/15 text-[var(--primary)]',  val: 'text-[var(--primary)]' },
  gold:    { bg: 'bg-[var(--gold)]/8 border-[var(--gold)]/20',        iconBg: 'bg-[var(--gold)]/15 text-[var(--gold)]',        val: 'text-[var(--gold)]' },
  green:   { bg: 'bg-emerald-500/8 border-emerald-500/20',            iconBg: 'bg-emerald-500/15 text-emerald-400',            val: 'text-emerald-400' },
  red:     { bg: 'bg-red-500/8 border-red-500/20',                    iconBg: 'bg-red-500/15 text-red-400',                    val: 'text-red-400' },
  blue:    { bg: 'bg-blue-500/8 border-blue-500/20',                  iconBg: 'bg-blue-500/15 text-blue-400',                  val: 'text-blue-400' },
  default: { bg: 'bg-[var(--surface)] border-[var(--border)]',        iconBg: 'bg-[var(--border)] text-[var(--text-muted)]',   val: 'text-[var(--text)]' },
}

function KpiCard({ title, value, sub, icon, accent = 'default', delay = 0 }: {
  title: string; value: string | number; sub?: string
  icon: React.ReactNode; accent?: Accent; delay?: number
}) {
  const a = ACCENT_MAP[accent]
  return (
    <motion.div {...fadeUp(delay)}
      className={`shrink-0 min-w-[150px] sm:min-w-0 flex flex-col gap-2 rounded-xl border p-4 ${a.bg}`}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">{title}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${a.iconBg}`}>
          <span className="[&>svg]:w-4 [&>svg]:h-4">{icon}</span>
        </div>
      </div>
      <p className={`text-2xl font-bold leading-tight tracking-tight ${a.val}`}>{value}</p>
      {sub && <p className="text-[11px] text-[var(--text-muted)] -mt-1">{sub}</p>}
    </motion.div>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-1 mb-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">{children}</p>
      {right}
    </div>
  )
}

// ─── Absent staff row ─────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-rose-500/20 text-rose-300',
  'bg-orange-500/20 text-orange-300',
  'bg-violet-500/20 text-violet-300',
  'bg-blue-500/20 text-blue-300',
  'bg-amber-500/20 text-amber-300',
]

// ─── Audience mapping ─────────────────────────────────────────────────────────
const AUDIENCE: Record<string, { label: string; variant: 'info' | 'warning' | 'success' | 'neutral' }> = {
  ALL: { label: 'All', variant: 'info' },
  STUDENTS: { label: 'Students', variant: 'success' },
  PARENTS: { label: 'Parents', variant: 'warning' },
  TEACHERS: { label: 'Faculty', variant: 'neutral' },
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PrincipalDashboardPage() {
  const activeCampusId = useCampusStore(s => s.activeCampusId)
  const { data, isLoading } = usePrincipalDashboard(activeCampusId ?? undefined)
  const { alerts, dismissAlert, clearAlerts } = useAbsenceAlerts()

  const stats = data?.stats
  const absent = data?.absentStaff ?? []
  const exams = data?.upcomingExams ?? []
  const fee = data?.feeSummary
  const anns = data?.recentAnnouncements ?? []
  const breakdown = data?.campusBreakdown ?? []

  const attendancePct = stats && stats.totalStaffForCampus > 0
    ? Math.round((stats.presentStaff / stats.totalStaffForCampus) * 100)
    : 0

  function fmt(n: number) {
    if (n >= 1_000_000) return `PKR ${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `PKR ${(n / 1_000).toFixed(0)}K`
    return `PKR ${n.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)]">

      {/* ── Mobile header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-14 flex items-center justify-between md:hidden">
        <h1 className="text-lg font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>Dashboard</h1>
        <span className="text-[11px] font-semibold text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1 rounded-full">
          {activeCampusId ? 'Campus Active' : 'All Campuses'}
        </span>
      </header>

      {/* ── Desktop header ─────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0)} className="hidden sm:block">
        <PageHeader
          title="Principal Dashboard"
          subtitle="Live campus overview"
          breadcrumb={[{ label: 'Dashboard' }]}
        />
      </motion.div>

      <div className="p-4 sm:p-0 space-y-5">

        {/* Absence alerts */}
        {alerts.length > 0 && (
          <motion.div {...fadeUp(0.04)}>
            <AbsenceAlertPanel alerts={alerts} onDismiss={dismissAlert} onClearAll={clearAlerts} />
          </motion.div>
        )}

        {/* ── KPI Stats — horizontal scroll on mobile, grid on desktop ── */}
        {isLoading ? (
          <div className="flex overflow-x-auto gap-3 pb-1 sm:grid sm:grid-cols-3 xl:grid-cols-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="shrink-0 min-w-[150px] sm:min-w-0 h-[100px] rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-3 pb-1 sm:grid sm:grid-cols-3 xl:grid-cols-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <KpiCard delay={0.05} title="Total Students" value={(stats?.totalStudents ?? 0).toLocaleString()}
              icon={<GraduationCap />} accent="teal" />
            <KpiCard delay={0.08} title="Total Staff" value={stats?.totalStaff ?? 0}
              icon={<Users />} accent="blue" />
            <KpiCard delay={0.11} title="Present Today" value={`${stats?.presentStaff ?? 0}/${stats?.totalStaffForCampus ?? 0}`}
              sub={`${attendancePct}% attendance`} accent={attendancePct >= 90 ? 'green' : attendancePct >= 75 ? 'blue' : 'red'}
              icon={<TrendingUp />} />
            <KpiCard delay={0.14} title="Sections" value={stats?.totalSections ?? 0}
              icon={<Layers />} />
            <KpiCard delay={0.17} title="Today's Fees" value={fmt(stats?.todayFeeCollection ?? 0)}
              sub="collected today" accent="gold" icon={<Banknote />} />
            <KpiCard delay={0.20} title="Pending Fees" value={fmt(fee?.totalPending ?? 0)}
              sub={`${fee?.defaulterCount ?? 0} defaulters`} accent="red"
              icon={<AlertCircle />} />
          </div>
        )}

        {/* ── Campus breakdown (multi-campus) ─────────────────────────── */}
        {breakdown.length > 1 && (
          <div>
            <SectionLabel>Campus Overview</SectionLabel>
            <div className="flex overflow-x-auto gap-3 pb-1 sm:grid sm:grid-cols-2 xl:grid-cols-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {breakdown.map((c, i) => (
                <motion.div key={c.campusId} {...fadeUp(0.05 + i * 0.05)} className="shrink-0 min-w-[280px] sm:min-w-0">
                  <CampusSummaryCard campus={c} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── Absent Staff — card list ─────────────────────────────────── */}
        <motion.div {...fadeUp(0.22)}>
          <SectionLabel right={absent.length > 0 && <Badge variant="danger">{absent.length}</Badge>}>
            Absent Today
          </SectionLabel>
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden">
            {isLoading ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
              </div>
            ) : absent.length === 0 ? (
              <div className="flex items-center gap-3 py-6 px-4 text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="text-sm font-semibold">All staff present today</span>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {absent.map((s, idx) => (
                  <li key={s.id}
                    className="flex items-center gap-3 px-4 py-3 active:bg-white/[0.02] transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                      {s.firstName[0]}{s.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text)] truncate">{s.firstName} {s.lastName}</p>
                      {s.designation && <p className="text-[11px] text-[var(--text-muted)] truncate">{s.designation}</p>}
                    </div>
                    <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full shrink-0">
                      Absent
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>

        {/* ── Two-column grid on desktop ───────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* ── Upcoming Exams ─────────────────────────────────────────── */}
          <motion.div {...fadeUp(0.26)}>
            <SectionLabel right={exams.length > 0 && <span className="text-xs text-[var(--text-muted)]">{exams.length} scheduled</span>}>
              Upcoming Exams
            </SectionLabel>
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden">
              {isLoading ? (
                <div className="p-3 space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                </div>
              ) : exams.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)] text-center py-10">No exams scheduled</p>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {exams.map(exam => {
                    const date = new Date(exam.date)
                    const statusCls = exam.status === 'ONGOING' ? 'bg-emerald-500/15 text-emerald-400' :
                      exam.status === 'SCHEDULED' ? 'bg-blue-500/15 text-blue-400' :
                        exam.status === 'CANCELLED' ? 'bg-red-500/15 text-red-400' :
                          'bg-white/5 text-[var(--text-muted)]'
                    return (
                      <div key={exam.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-12 h-12 bg-[var(--primary)]/15 rounded-lg flex flex-col items-center justify-center shrink-0">
                          <span className="text-[9px] text-[var(--primary)] font-bold uppercase">{date.toLocaleDateString('en-PK', { month: 'short' })}</span>
                          <span className="text-lg font-bold text-[var(--primary)] leading-tight">{date.toLocaleDateString('en-PK', { day: 'numeric' })}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[var(--text)] truncate">{exam.subjectName}</p>
                          <p className="text-[11px] text-[var(--text-muted)] truncate">{exam.sectionName} · {exam.startTime}</p>
                        </div>
                        {exam.status && (
                          <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${statusCls}`}>{exam.status}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Fee Summary ─────────────────────────────────────────────── */}
          <motion.div {...fadeUp(0.24)}>
            <SectionLabel>Fee Summary</SectionLabel>
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
              ) : (
                <>
                  <div className="rounded-xl border border-[var(--gold)]/20 bg-[var(--gold)]/8 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1">Collected This Month</p>
                      <p className="text-2xl font-bold text-[var(--gold)] tracking-tight">{fmt(fee?.collectedThisMonth ?? 0)}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-[var(--gold)]/15 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-[var(--gold)]" />
                    </div>
                  </div>

                  <div className="rounded-xl border border-red-500/20 bg-red-500/8 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1">Total Pending</p>
                      <p className="text-2xl font-bold text-red-400 tracking-tight">{fmt(fee?.totalPending ?? 0)}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                  </div>

                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1">Defaulters</p>
                      <p className="text-2xl font-bold text-[var(--text)] tracking-tight">{fee?.defaulterCount ?? 0}</p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">students with overdue fees</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-[var(--border)] flex items-center justify-center">
                      <Users className="w-5 h-5 text-[var(--text-muted)]" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Recent Announcements ──────────────────────────────────────── */}
        <motion.div {...fadeUp(0.28)}>
          <SectionLabel right={anns.length > 0 && <span className="text-xs text-[var(--text-muted)]">{anns.length} posted</span>}>
            Announcements
          </SectionLabel>
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden">
            {isLoading ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
              </div>
            ) : anns.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] text-center py-10">No recent announcements</p>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {anns.slice(0, 5).map(ann => {
                  const meta = AUDIENCE[ann.audience] ?? { label: ann.audience, variant: 'neutral' as const }
                  return (
                    <li key={ann.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 active:bg-white/[0.02] transition-colors group cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text)] truncate">{ann.title}</p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                          {new Date(ann.publishedAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={meta.variant} size="sm">{meta.label}</Badge>
                        <ChevronRight className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  )
}
