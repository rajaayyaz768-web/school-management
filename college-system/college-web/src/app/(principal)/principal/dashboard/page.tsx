'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Megaphone, ArrowRight, TrendingUp, Users, GraduationCap, Layers, Banknote, AlertCircle, UserX, CheckCircle2, CalendarDays, CreditCard, AlertTriangle } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import { Skeleton, Badge } from '@/components/ui'
import { useCampusStore } from '@/store/campusStore'
import { usePrincipalDashboard } from '@/features/dashboard/principal/hooks/usePrincipalDashboard'
import { CampusSummaryCard } from '@/features/dashboard/principal/components/CampusSummaryCard'
import { useAbsenceAlerts } from '@/features/absence-alerts/hooks/useAbsenceAlerts'
import { AbsenceAlertPanel } from '@/features/absence-alerts/components/AbsenceAlertPanel'

// ─── Animation helpers ────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: 'easeOut' as const, delay },
})

// ─── Stat card ────────────────────────────────────────────────────────────────
type Accent = 'gold' | 'green' | 'red' | 'blue' | 'default'

const ACCENT: Record<Accent, { card: string; icon: string; val: string }> = {
  gold:    { card: 'border-[var(--gold)]/25 bg-[var(--gold)]/6',        icon: 'bg-[var(--gold)]/12 text-[var(--gold)]',   val: 'text-[var(--gold)]' },
  green:   { card: 'border-emerald-500/25 bg-emerald-500/6',            icon: 'bg-emerald-500/12 text-emerald-400',       val: 'text-emerald-400' },
  red:     { card: 'border-red-500/25 bg-red-500/6',                    icon: 'bg-red-500/12 text-red-400',               val: 'text-red-400' },
  blue:    { card: 'border-blue-500/25 bg-blue-500/6',                  icon: 'bg-blue-500/12 text-blue-400',             val: 'text-blue-400' },
  default: { card: 'border-[var(--border)] bg-[var(--surface)]',        icon: 'bg-[var(--border)] text-[var(--text-muted)]', val: 'text-[var(--text)]' },
}

function StatCard({ title, value, sub, icon, accent = 'default', delay = 0 }: {
  title: string; value: string | number; sub?: string
  icon: React.ReactNode; accent?: Accent; delay?: number
}) {
  const a = ACCENT[accent]
  return (
    <motion.div {...fadeUp(delay)}
      className={`flex items-start gap-2 sm:gap-3 rounded-[var(--radius-lg)] border p-3 sm:p-4 ${a.card}`}>
      <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 mt-0.5 ${a.icon}`}>
        <span className="[&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-4 sm:[&>svg]:h-4">{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="label-xs truncate text-[9px] sm:text-[10px] leading-tight">{title}</p>
        <p className={`text-base sm:text-[1.55rem] font-bold leading-tight mt-0.5 tracking-tight truncate ${a.val}`}>{value}</p>
        {sub && <p className="text-[9px] sm:text-[10px] text-[var(--text-muted)] mt-0.5 truncate">{sub}</p>}
      </div>
    </motion.div>
  )
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="label-xs mb-2.5 px-0.5">{children}</p>
  )
}

// ─── Card shell ───────────────────────────────────────────────────────────────
function Panel({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div {...fadeUp(delay)}
      className={`card flex flex-col overflow-hidden ${className}`}>
      {children}
    </motion.div>
  )
}

function PanelHeader({ icon, title, right }: { icon: React.ReactNode; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] shrink-0">
      <span className="text-[var(--text-muted)]">{icon}</span>
      <span className="text-[13px] font-semibold text-[var(--text)]">{title}</span>
      {right && <div className="ml-auto">{right}</div>}
    </div>
  )
}

// ─── Absent staff avatars ─────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-rose-500/20 text-rose-300',
  'bg-orange-500/20 text-orange-300',
  'bg-violet-500/20 text-violet-300',
  'bg-blue-500/20 text-blue-300',
  'bg-amber-500/20 text-amber-300',
]

// ─── Main page ────────────────────────────────────────────────────────────────
const AUDIENCE: Record<string, { label: string; variant: 'info' | 'warning' | 'success' | 'neutral' }> = {
  ALL:      { label: 'All',      variant: 'info' },
  STUDENTS: { label: 'Students', variant: 'success' },
  PARENTS:  { label: 'Parents',  variant: 'warning' },
  TEACHERS: { label: 'Faculty',  variant: 'neutral' },
}

export default function PrincipalDashboardPage() {
  const activeCampusId = useCampusStore(s => s.activeCampusId)
  const { data, isLoading } = usePrincipalDashboard(activeCampusId ?? undefined)
  const { alerts, dismissAlert, clearAlerts } = useAbsenceAlerts()

  const stats  = data?.stats
  const absent = data?.absentStaff ?? []
  const exams  = data?.upcomingExams ?? []
  const fee    = data?.feeSummary
  const anns   = data?.recentAnnouncements ?? []
  const breakdown = data?.campusBreakdown ?? []

  const attendancePct = stats && stats.totalStaffForCampus > 0
    ? Math.round((stats.presentStaff / stats.totalStaffForCampus) * 100)
    : 0

  function fmt(n: number) {
    if (n >= 1_000_000) return `PKR ${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000)     return `PKR ${(n / 1_000).toFixed(0)}K`
    return `PKR ${n.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] gap-3 sm:gap-5 bg-[var(--bg)]">

      {/* Header */}
      <motion.div {...fadeUp(0)}>
        <PageHeader
          title="Principal Dashboard"
          subtitle="Live campus overview"
          breadcrumb={[{ label: 'Dashboard' }]}
        />
      </motion.div>

      {/* Absence alerts */}
      {alerts.length > 0 && (
        <motion.div {...fadeUp(0.04)}>
          <AbsenceAlertPanel alerts={alerts} onDismiss={dismissAlert} onClearAll={clearAlerts} />
        </motion.div>
      )}

      {/* ── KPI Stats row ────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] sm:h-[90px] rounded-[var(--radius-lg)]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3">
          <StatCard delay={0.05} title="Total Students" value={(stats?.totalStudents ?? 0).toLocaleString()}
            icon={<GraduationCap className="w-4 h-4" />} />
          <StatCard delay={0.08} title="Total Staff"    value={stats?.totalStaff ?? 0}
            icon={<Users className="w-4 h-4" />} />
          <StatCard delay={0.11} title="Present Today"  value={`${stats?.presentStaff ?? 0}/${stats?.totalStaffForCampus ?? 0}`}
            sub={`${attendancePct}% attendance`} accent={attendancePct >= 90 ? 'green' : attendancePct >= 75 ? 'blue' : 'red'}
            icon={<TrendingUp className="w-4 h-4" />} />
          <StatCard delay={0.14} title="Sections"       value={stats?.totalSections ?? 0}
            icon={<Layers className="w-4 h-4" />} />
          <StatCard delay={0.17} title="Today's Fees"   value={fmt(stats?.todayFeeCollection ?? 0)}
            sub="collected today" accent="gold" icon={<Banknote className="w-4 h-4" />} />
          <StatCard delay={0.20} title="Pending Fees"   value={fmt(fee?.totalPending ?? 0)}
            sub={`${fee?.defaulterCount ?? 0} defaulters`} accent="red"
            icon={<AlertCircle className="w-4 h-4" />} />
        </div>
      )}

      {/* ── Campus breakdown (multi-campus) ─────────────────────────────── */}
      {breakdown.length > 1 && (
        <div>
          <SectionLabel>Campus Overview — click to drill in</SectionLabel>
          <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
            {breakdown.map((c, i) => (
              <motion.div key={c.campusId} {...fadeUp(0.05 + i * 0.05)}>
                <CampusSummaryCard campus={c} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main bento grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 flex-1">

        {/* Left column — 7 cols */}
        <div className="xl:col-span-7 flex flex-col gap-4">

          {/* Absent Staff */}
          <Panel delay={0.22}>
            <PanelHeader
              icon={<UserX className="w-4 h-4" />}
              title="Absent Today"
              right={absent.length > 0 && <Badge variant="danger">{absent.length}</Badge>}
            />
            <div className="p-3 flex-1 overflow-auto scrollbar-thin">
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
                </div>
              ) : absent.length === 0 ? (
                <div className="flex items-center gap-2 py-5 px-2 text-emerald-500">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium">All staff present today</span>
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {absent.map((s, idx) => (
                    <li key={s.id}
                      className="flex items-center gap-3 py-2 px-3 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)] hover:border-red-500/30 transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                        {s.firstName[0]}{s.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[var(--text)] truncate">{s.firstName} {s.lastName}</p>
                        {s.designation && <p className="text-[10px] text-[var(--text-muted)] truncate">{s.designation}</p>}
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded shrink-0">
                        {s.staffCode}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Panel>

          {/* Upcoming Exams */}
          <Panel delay={0.26}>
            <PanelHeader
              icon={<CalendarDays className="w-4 h-4" />}
              title="Upcoming Exams"
              right={exams.length > 0 && <span className="text-xs text-[var(--text-muted)]">{exams.length} scheduled</span>}
            />
            <div className="flex-1 overflow-auto scrollbar-thin">
              {isLoading ? (
                <div className="p-3 space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
                </div>
              ) : exams.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)] text-center py-8">No exams scheduled soon</p>
              ) : (
                <table className="data-table w-full text-sm">
                  <thead>
                    <tr>
                      {['Date', 'Section', 'Subject', 'Status'].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map(exam => (
                      <tr key={exam.id}>
                        <td>
                          <p className="text-[13px] font-semibold">
                            {new Date(exam.date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)]">{exam.startTime}</p>
                        </td>
                        <td className="text-[13px]">{exam.sectionName}</td>
                        <td className="text-[13px] font-medium">{exam.subjectName}</td>
                        <td>
                          {exam.status && (
                            <span className={`pill text-[10px] ${
                              exam.status === 'ONGOING'   ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' :
                              exam.status === 'SCHEDULED' ? 'bg-blue-500/15 text-blue-400 border-blue-500/25' :
                              exam.status === 'CANCELLED' ? 'bg-red-500/15 text-red-400 border-red-500/25' :
                              'bg-white/5 text-[var(--text-muted)] border-[var(--border)]'
                            }`}>{exam.status}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Panel>
        </div>

        {/* Right column — 5 cols */}
        <div className="xl:col-span-5 flex flex-col gap-4">

          {/* Fee Summary */}
          <Panel delay={0.24}>
            <PanelHeader icon={<CreditCard className="w-4 h-4" />} title="Fee Summary" />
            <div className="p-3 space-y-2.5 flex-1">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[68px] rounded-lg" />)
              ) : (
                <>
                  <div className="rounded-[var(--radius-sm)] border border-[var(--gold)]/25 bg-[var(--gold)]/6 p-3.5 flex items-center justify-between">
                    <div>
                      <p className="label-xs mb-1">Collected This Month</p>
                      <p className="text-xl font-bold text-[var(--gold)] tracking-tight">{fmt(fee?.collectedThisMonth ?? 0)}</p>
                    </div>
                    <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--gold)]/12 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-[var(--gold)]" />
                    </div>
                  </div>

                  <div className="rounded-[var(--radius-sm)] border border-red-500/20 bg-red-500/6 p-3.5 flex items-center justify-between">
                    <div>
                      <p className="label-xs mb-1">Total Pending</p>
                      <p className="text-xl font-bold text-red-400 tracking-tight">{fmt(fee?.totalPending ?? 0)}</p>
                    </div>
                    <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-red-500/12 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    </div>
                  </div>

                  <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-3.5 flex items-center justify-between">
                    <div>
                      <p className="label-xs mb-1">Defaulters</p>
                      <p className="text-xl font-bold text-[var(--text)] tracking-tight">{fee?.defaulterCount ?? 0}</p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">students with overdue fees</p>
                    </div>
                    <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--border)] flex items-center justify-center">
                      <Users className="w-4 h-4 text-[var(--text-muted)]" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </Panel>

          {/* Recent Announcements */}
          <Panel delay={0.28} className="flex-1">
            <PanelHeader
              icon={<Megaphone className="w-4 h-4" />}
              title="Announcements"
              right={anns.length > 0 && <span className="text-xs text-[var(--text-muted)]">{anns.length} posted</span>}
            />
            <div className="p-3 space-y-2 flex-1 overflow-auto scrollbar-thin">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)
              ) : anns.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)] text-center py-8">No recent announcements</p>
              ) : (
                anns.slice(0, 5).map(ann => {
                  const meta = AUDIENCE[ann.audience] ?? { label: ann.audience, variant: 'neutral' as const }
                  return (
                    <div key={ann.id}
                      className="flex items-start justify-between gap-2 px-3 py-2.5 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--gold)]/30 transition-colors group cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[var(--text)] truncate">{ann.title}</p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                          {new Date(ann.publishedAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant={meta.variant} size="sm">{meta.label}</Badge>
                        <ArrowRight className="w-3 h-3 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Panel>

        </div>
      </div>
    </div>
  )
}
