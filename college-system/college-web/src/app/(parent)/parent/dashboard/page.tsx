'use client'

import { useState } from 'react'
import {
  GraduationCap,
  CalendarCheck,
  CreditCard,
  Trophy,
  Megaphone,
  AlertCircle,
  CheckCircle2,
  Check,
  Clock,
  X,
  Minus,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Tabs, TabPanel } from '@/components/ui/Tabs'
import { cn } from '@/lib/utils'
import { useParentDashboard } from '@/features/dashboard/parent/hooks/useParentDashboard'
import {
  LinkedStudent,
  AttendanceSummary,
  PendingFee,
  ExamResult,
  Announcement,
} from '@/features/dashboard/parent/types/parent-dashboard.types'

// ── Helpers ───────────────────────────────────────────────────────────────

function formatPKR(amount: number) {
  return `PKR ${amount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`
}

function getDayLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-PK', { weekday: 'short' })
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(diff / 3_600_000)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(diff / 86_400_000)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })
}

function getGradeVariant(grade: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  if (grade === 'A+' || grade === 'A') return 'success'
  if (grade === 'B' || grade === 'C') return 'warning'
  if (grade === 'D') return 'info'
  return 'danger'
}

function getFeeStatusVariant(status: string): 'overdue' | 'pending' | 'partial' {
  if (status === 'OVERDUE') return 'overdue'
  if (status === 'PARTIAL') return 'partial'
  return 'pending'
}

function getAudienceVariant(audience: string): 'info' | 'success' | 'warning' | 'neutral' {
  if (audience === 'PARENTS') return 'warning'
  if (audience === 'STUDENTS') return 'success'
  return 'info'
}

// ── 7-Day Attendance Strip ─────────────────────────────────────────────────

function AttendanceStrip({ strip }: { strip: AttendanceSummary['sevenDayStrip'] }) {
  return (
    <div className="flex items-center gap-2">
      {strip.map((day) => {
        const label = getDayLabel(day.date)
        const isPresent = day.status === 'PRESENT'
        const isAbsent = day.status === 'ABSENT'
        const isLate = day.status === 'LATE'

        const Icon = isPresent ? Check : isAbsent ? X : isLate ? Clock : Minus

        return (
          <div key={day.date} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] text-[var(--text-muted)] font-medium">{label}</span>
            <div
              className={cn(
                'w-10 h-10 rounded-[var(--radius)] flex items-center justify-center border transition-colors',
                isPresent && 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
                isAbsent && 'bg-red-500/15 border-red-500/30 text-red-400',
                isLate && 'bg-amber-500/15 border-amber-500/30 text-amber-400',
                !day.status && 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)]'
              )}
            >
              <Icon className="w-4 h-4" strokeWidth={isPresent ? 2.5 : 2} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Student Summary Card ───────────────────────────────────────────────────

function StudentSummaryCard({ student, isLoading }: { student: LinkedStudent | null; isLoading: boolean }) {
  if (isLoading) return <Skeleton variant="card" className="h-28" />
  if (!student) return null

  return (
    <div className="flex items-center gap-5 p-5 rounded-[var(--radius-lg)] bg-gradient-to-r from-[var(--surface)] to-[var(--background)] border border-[var(--border)]">
      <div className="w-14 h-14 rounded-full bg-[var(--gold)]/20 border border-[var(--gold)]/30 flex items-center justify-center flex-shrink-0">
        <GraduationCap className="w-7 h-7 text-[var(--gold)]" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-[var(--text)]">
          {student.firstName} {student.lastName}
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          {student.programName && student.gradeName
            ? `${student.programName} · ${student.gradeName}`
            : ''}
          {student.sectionName ? ` · Section ${student.sectionName}` : ''}
        </p>
        {student.rollNumber && (
          <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
            Roll No: {student.rollNumber}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Stats Row ─────────────────────────────────────────────────────────────

function StatTile({
  title,
  value,
  subtitle,
  icon,
  accent = 'default',
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  accent?: 'gold' | 'green' | 'red' | 'default'
}) {
  const styles = {
    gold: { card: 'border-[var(--gold)]/30 bg-[var(--gold)]/5', icon: 'bg-[var(--gold)]/10 text-[var(--gold)]', value: 'text-[var(--gold)]' },
    green: { card: 'border-emerald-500/30 bg-emerald-500/5', icon: 'bg-emerald-500/10 text-emerald-400', value: 'text-emerald-400' },
    red: { card: 'border-red-500/30 bg-red-500/5', icon: 'bg-red-500/10 text-red-400', value: 'text-red-400' },
    default: { card: 'border-[var(--border)] bg-[var(--surface)]', icon: 'bg-white/5 text-[var(--text-muted)]', value: 'text-[var(--text)]' },
  }
  const s = styles[accent]
  return (
    <div className={`rounded-[var(--radius-lg)] border p-4 flex items-start gap-3 ${s.card}`}>
      <div className={`w-9 h-9 rounded-[var(--radius)] flex items-center justify-center flex-shrink-0 mt-0.5 ${s.icon}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest truncate">{title}</p>
        <p className={`text-xl font-bold leading-tight mt-1 truncate ${s.value}`}>{value}</p>
        {subtitle && <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">{subtitle}</p>}
      </div>
    </div>
  )
}

function StudentStatsRow({
  attendanceSummary,
  feeStatus,
  recentResults,
  isLoading,
}: {
  attendanceSummary: AttendanceSummary | null
  feeStatus: PendingFee[]
  recentResults: ExamResult[]
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <Skeleton key={i} variant="card" className="h-24" />)}
      </div>
    )
  }

  const pct = attendanceSummary?.attendancePct ?? 0
  const hasPending = feeStatus.length > 0
  const lastGrade = recentResults[0]?.grade ?? '—'

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatTile
        title="Attendance (30d)"
        value={`${pct}%`}
        subtitle={`${attendanceSummary?.presentDays ?? 0}P / ${attendanceSummary?.absentDays ?? 0}A`}
        icon={<CalendarCheck className="w-4 h-4" />}
        accent={pct >= 90 ? 'green' : pct >= 75 ? 'default' : 'red'}
      />
      <StatTile
        title="Fee Status"
        value={hasPending ? `${feeStatus.length} Pending` : 'All Clear'}
        subtitle={hasPending ? formatPKR(feeStatus.reduce((s, f) => s + f.balance, 0)) : 'No outstanding fees'}
        icon={<CreditCard className="w-4 h-4" />}
        accent={hasPending ? 'gold' : 'green'}
      />
      <StatTile
        title="Latest Result"
        value={lastGrade}
        subtitle={recentResults[0] ? recentResults[0].subjectName : 'No results yet'}
        icon={<Trophy className="w-4 h-4" />}
        accent={lastGrade === 'A+' || lastGrade === 'A' ? 'green' : lastGrade === 'F' ? 'red' : 'default'}
      />
    </div>
  )
}

// ── Pending Fees Card ─────────────────────────────────────────────────────

function PendingFeesCard({ fees, isLoading }: { fees: PendingFee[]; isLoading: boolean }) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-[var(--border)]">
        <CreditCard className="w-4 h-4 text-[var(--text-muted)]" />
        <h3 className="text-sm font-semibold text-[var(--text)]">Pending Fees</h3>
        {!isLoading && fees.length > 0 && (
          <Badge variant="overdue" size="sm">{fees.length}</Badge>
        )}
      </div>
      <div className="flex-1 p-4 space-y-2">
        {isLoading ? (
          [...Array(2)].map((_, i) => <Skeleton key={i} variant="text" className="h-12" />)
        ) : fees.length === 0 ? (
          <div className="flex items-center gap-2 py-4 text-emerald-500">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">No pending fees</span>
          </div>
        ) : (
          fees.map((fee) => (
            <div
              key={fee.id}
              className="flex items-center justify-between px-3 py-2.5 rounded-[var(--radius)] bg-[var(--background)] border border-[var(--border)]"
            >
              <div>
                <p className="text-sm font-medium text-[var(--text)]">{fee.academicYear}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Due: {new Date(fee.dueDate).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-red-400">{formatPKR(fee.balance)}</p>
                <Badge variant={getFeeStatusVariant(fee.status)} size="sm" className="mt-1">
                  {fee.status}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

// ── Recent Results Card ───────────────────────────────────────────────────

function RecentResultsCard({ results, isLoading }: { results: ExamResult[]; isLoading: boolean }) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-[var(--border)]">
        <Trophy className="w-4 h-4 text-[var(--text-muted)]" />
        <h3 className="text-sm font-semibold text-[var(--text)]">Recent Results</h3>
      </div>
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} variant="text" className="h-8" />)}
          </div>
        ) : results.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No results yet"
              description="Exam results will appear here once published"
              icon={<Trophy className="w-8 h-8" />}
            />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['Subject', 'Type', 'Marks', 'Grade'].map((h) => (
                  <th key={h} className="text-left px-5 py-2.5 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface)] transition-colors">
                  <td className="px-5 py-3 font-medium text-[var(--text)]">{r.subjectName}</td>
                  <td className="px-5 py-3 text-xs text-[var(--text-muted)]">{r.examTypeName}</td>
                  <td className="px-5 py-3 text-[var(--text)]">
                    {r.obtainedMarks} / {r.totalMarks}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={getGradeVariant(r.grade)} size="sm">{r.grade}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  )
}

// ── Announcements Section ─────────────────────────────────────────────────

function AnnouncementsSection({ announcements, isLoading }: { announcements: Announcement[]; isLoading: boolean }) {
  if (!isLoading && announcements.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Megaphone className="w-4 h-4 text-[var(--text-muted)]" />
        <h3 className="text-sm font-semibold text-[var(--text)]">Recent Announcements</h3>
      </div>
      <div className="space-y-3">
        {isLoading
          ? [...Array(2)].map((_, i) => <Skeleton key={i} variant="text" className="h-16" />)
          : announcements.map((ann) => (
              <div
                key={ann.id}
                className="flex items-start justify-between gap-4 px-4 py-3.5 rounded-[var(--radius-lg)] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getAudienceVariant(ann.audience)} size="sm">{ann.audience}</Badge>
                  </div>
                  <p className="text-sm font-medium text-[var(--text)] truncate">{ann.title}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">{ann.content}</p>
                </div>
                <p className="text-xs text-[var(--text-muted)] flex-shrink-0 mt-0.5">
                  {getRelativeTime(ann.publishedAt)}
                </p>
              </div>
            ))}
      </div>
    </div>
  )
}

// ── Child Dashboard Panel ─────────────────────────────────────────────────

function ChildDashboard({ studentId }: { studentId: string }) {
  const { data, isLoading } = useParentDashboard(studentId)

  const student = data?.linkedStudents.find((s) => s.id === studentId) ?? data?.primaryStudent ?? null

  return (
    <div className="space-y-6 pt-4">
      <StudentSummaryCard student={student} isLoading={isLoading} />

      <StudentStatsRow
        attendanceSummary={data?.attendanceSummary ?? null}
        feeStatus={data?.feeStatus ?? []}
        recentResults={data?.recentResults ?? []}
        isLoading={isLoading}
      />

      {/* 7-day attendance strip */}
      {!isLoading && data?.attendanceSummary && (
        <Card className="p-5">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-4">
            Last 7 Days Attendance
          </p>
          <AttendanceStrip strip={data.attendanceSummary.sevenDayStrip} />
        </Card>
      )}

      {/* Fees + Results grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PendingFeesCard fees={data?.feeStatus ?? []} isLoading={isLoading} />
        <RecentResultsCard results={data?.recentResults ?? []} isLoading={isLoading} />
      </div>

      <AnnouncementsSection announcements={data?.announcements ?? []} isLoading={isLoading} />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function ParentDashboardPage() {
  const [activeTab, setActiveTab] = useState<string>('')

  // Initial load — no studentId to get linkedStudents list
  const { data: initial, isLoading: initialLoading } = useParentDashboard()

  const students = initial?.linkedStudents ?? []

  // Set default active tab once students load
  const effectiveTab = activeTab || students[0]?.id || ''

  if (initialLoading) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)] p-8 gap-6">
        <PageHeader
          title="Parent Portal"
          subtitle="Track your child's progress"
          breadcrumb={[{ label: 'Home', href: '/parent/dashboard' }, { label: 'Dashboard' }]}
        />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} variant="card" className="h-28" />)}
        </div>
        <Skeleton variant="card" />
        <Skeleton variant="table" />
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)] p-8 gap-6">
        <PageHeader
          title="Parent Portal"
          subtitle="Track your child's progress"
          breadcrumb={[{ label: 'Home', href: '/parent/dashboard' }, { label: 'Dashboard' }]}
        />
        <EmptyState
          title="No linked students"
          description="Your account has no students linked yet. Please contact the school admin."
          icon={<AlertCircle className="w-10 h-10" />}
        />
      </div>
    )
  }

  // Single child — no tabs
  if (students.length === 1) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)] p-8 gap-6">
        <PageHeader
          title="Parent Portal"
          subtitle="Track your child's progress"
          breadcrumb={[{ label: 'Home', href: '/parent/dashboard' }, { label: 'Dashboard' }]}
        />
        <ChildDashboard studentId={students[0].id} />
      </div>
    )
  }

  // Multiple children — tabs
  const tabs = students.map((s) => ({
    id: s.id,
    label: `${s.firstName} ${s.lastName}`,
    icon: <GraduationCap className="w-4 h-4" />,
  }))

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-8 gap-6">
      <PageHeader
        title="Parent Portal"
        subtitle="Track your children's progress"
        breadcrumb={[{ label: 'Home', href: '/parent/dashboard' }, { label: 'Dashboard' }]}
      />

      <Card className="flex flex-col">
        <Tabs tabs={tabs} activeTab={effectiveTab} onChange={setActiveTab} />
        <div className="p-6 bg-[var(--background)]">
          {students.map((s) => (
            <TabPanel key={s.id} tabId={s.id} activeTab={effectiveTab}>
              <ChildDashboard studentId={s.id} />
            </TabPanel>
          ))}
        </div>
      </Card>
    </div>
  )
}
