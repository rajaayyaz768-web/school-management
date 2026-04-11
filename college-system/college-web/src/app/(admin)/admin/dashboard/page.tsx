'use client'

import {
  GraduationCap,
  Users,
  CreditCard,
  Layers,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Banknote,
  UserMinus,
  TrendingUp,
  FileText,
  Bell,
  UserCheck,
  BarChart2,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCurrentUser } from '@/store/authStore'
import { useAdminDashboard } from '@/features/dashboard/admin/hooks/useAdminDashboard'
import {
  AdminStaffAttendance,
  AdminFeeStats,
  AdminUpcomingExam,
  AdminRecentPayment,
} from '@/features/dashboard/admin/types/admin-dashboard.types'

function formatPKR(amount: number) {
  return `PKR ${amount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const AVATAR_COLORS = [
  'bg-[var(--gold)]/20 text-[var(--gold)]',
  'bg-emerald-500/20 text-emerald-400',
  'bg-blue-500/20 text-blue-400',
  'bg-purple-500/20 text-purple-400',
  'bg-rose-500/20 text-rose-400',
]

// ── Circular Donut Chart ──────────────────────────────────────────────────

function DonutChart({ percentage, size = 120 }: { percentage: number; size?: number }) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  const cx = size / 2
  const cy = size / 2

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={10}
      />
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="var(--gold)"
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        className="transition-all duration-700"
      />
    </svg>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────

function StatTile({
  title,
  value,
  subtitle,
  icon,
  accent,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  accent?: 'gold' | 'green' | 'red' | 'default'
}) {
  const accentClasses = {
    gold: 'border-[var(--gold)]/30 bg-[var(--gold)]/5',
    green: 'border-emerald-500/30 bg-emerald-500/5',
    red: 'border-red-500/30 bg-red-500/5',
    default: 'border-[var(--border)] bg-[var(--surface)]',
  }

  const iconClasses = {
    gold: 'text-[var(--gold)] bg-[var(--gold)]/10',
    green: 'text-emerald-400 bg-emerald-500/10',
    red: 'text-red-400 bg-red-500/10',
    default: 'text-[var(--text-muted)] bg-white/5',
  }

  const valueClasses = {
    gold: 'text-[var(--gold)]',
    green: 'text-emerald-400',
    red: 'text-red-400',
    default: 'text-[var(--text)]',
  }

  const cls = accent ?? 'default'

  return (
    <div className={`rounded-[var(--radius-lg)] border p-5 flex items-center gap-4 ${accentClasses[cls]}`}>
      <div className={`w-10 h-10 rounded-[var(--radius)] flex items-center justify-center flex-shrink-0 ${iconClasses[cls]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wide truncate">{title}</p>
        <p className={`text-xl font-bold leading-tight mt-0.5 truncate ${valueClasses[cls]}`}>{value}</p>
        {subtitle && <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{subtitle}</p>}
      </div>
    </div>
  )
}

// ── Staff Attendance Card ─────────────────────────────────────────────────

function StaffAttendanceCard({
  data,
  totalStaff,
  isLoading,
}: {
  data: AdminStaffAttendance
  totalStaff: number
  isLoading: boolean
}) {
  const total = totalStaff || data.present + data.absent + data.onLeave + data.halfDay || 1
  const presentPct = Math.round((data.present / total) * 100)

  return (
    <Card className="flex flex-col">
      <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-[var(--border)]">
        <Users className="w-4 h-4 text-[var(--text-muted)]" />
        <h3 className="text-sm font-semibold text-[var(--text)]">Staff Attendance Today</h3>
      </div>
      <div className="p-5">
        {isLoading ? (
          <Skeleton variant="stat" />
        ) : (
          <div className="flex items-center gap-6">
            {/* Donut chart */}
            <div className="relative flex-shrink-0">
              <DonutChart percentage={presentPct} size={110} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-[var(--text)]">{presentPct}%</span>
                <span className="text-[10px] text-[var(--text-muted)] font-medium">Present</span>
              </div>
            </div>
            {/* Breakdown */}
            <div className="flex-1 grid grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2.5 p-2.5 rounded-[var(--radius)] bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] font-medium">Present</p>
                  <p className="text-lg font-bold text-emerald-400 leading-tight">{data.present}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-[var(--radius)] bg-red-500/10 border border-red-500/20">
                <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] font-medium">Absent</p>
                  <p className="text-lg font-bold text-red-400 leading-tight">{data.absent}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-[var(--radius)] bg-blue-500/10 border border-blue-500/20">
                <Clock className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] font-medium">On Leave</p>
                  <p className="text-lg font-bold text-blue-400 leading-tight">{data.onLeave}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-[var(--radius)] bg-amber-500/10 border border-amber-500/20">
                <UserMinus className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] font-medium">Half Day</p>
                  <p className="text-lg font-bold text-amber-400 leading-tight">{data.halfDay}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

// ── Fee Overview Card ─────────────────────────────────────────────────────

function FeeOverviewCard({ data, isLoading }: { data: AdminFeeStats; isLoading: boolean }) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-[var(--border)]">
        <CreditCard className="w-4 h-4 text-[var(--text-muted)]" />
        <h3 className="text-sm font-semibold text-[var(--text)]">Fee Overview</h3>
      </div>
      <div className="p-5 space-y-3">
        {isLoading ? (
          <Skeleton variant="stat" />
        ) : (
          <>
            <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide font-medium mb-1">Pending Records</p>
                <p className="text-2xl font-bold text-[var(--text)]">{data.pendingCount}</p>
              </div>
              <div className="w-10 h-10 rounded-[var(--radius)] bg-white/5 flex items-center justify-center">
                <FileText className="w-4 h-4 text-[var(--text-muted)]" />
              </div>
            </div>
            <div className="rounded-[var(--radius)] border border-red-500/25 bg-red-500/8 p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide font-medium mb-1">Pending Amount</p>
                <p className="text-xl font-bold text-red-400">{formatPKR(data.pendingAmount)}</p>
              </div>
              <div className="w-10 h-10 rounded-[var(--radius)] bg-red-500/10 flex items-center justify-center">
                <Banknote className="w-4 h-4 text-red-400" />
              </div>
            </div>
            <div className="rounded-[var(--radius)] border border-amber-500/25 bg-amber-500/8 p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide font-medium mb-1">Overdue</p>
                <p className="text-2xl font-bold text-amber-400">{data.overdueCount}</p>
              </div>
              <div className="w-10 h-10 rounded-[var(--radius)] bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}

// ── Upcoming Exams Card ───────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  ONGOING: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  COMPLETED: 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)]',
  CANCELLED: 'bg-red-500/15 text-red-400 border-red-500/25',
}

function ExamStatusPill({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? STATUS_STYLES.SCHEDULED
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cls}`}>
      {status}
    </span>
  )
}

function UpcomingExamsCard({ exams, isLoading }: { exams: AdminUpcomingExam[]; isLoading: boolean }) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-[var(--border)]">
        <CalendarDays className="w-4 h-4 text-[var(--text-muted)]" />
        <h3 className="text-sm font-semibold text-[var(--text)]">Upcoming Exams</h3>
        {exams.length > 0 && (
          <span className="ml-auto text-xs text-[var(--text-muted)] font-medium">{exams.length} scheduled</span>
        )}
      </div>
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} variant="text" className="h-10" />)}
          </div>
        ) : exams.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No upcoming exams"
              description="No exams scheduled soon"
              icon={<CalendarDays className="w-8 h-8" />}
            />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-white/2">
                {['Date', 'Section', 'Subject', 'Type', 'Status'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {exams.map((exam) => (
                <tr key={exam.id} className="hover:bg-[var(--surface)] transition-colors group">
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold text-[var(--text)]">
                      {new Date(exam.date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{exam.startTime}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text)]">{exam.sectionName}</td>
                  <td className="px-4 py-3 text-xs font-medium text-[var(--text)]">{exam.subjectName}</td>
                  <td className="px-4 py-3 text-[10px] text-[var(--text-muted)]">{exam.examTypeName}</td>
                  <td className="px-4 py-3">
                    <ExamStatusPill status={exam.status} />
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

// ── Recent Payments Card ──────────────────────────────────────────────────

function RecentPaymentsCard({ payments, isLoading }: { payments: AdminRecentPayment[]; isLoading: boolean }) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-[var(--border)]">
        <Banknote className="w-4 h-4 text-[var(--text-muted)]" />
        <h3 className="text-sm font-semibold text-[var(--text)]">Recent Payments</h3>
        {payments.length > 0 && (
          <span className="ml-auto text-xs text-emerald-400 font-medium">{payments.length} today</span>
        )}
      </div>
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} variant="text" className="h-12" />)}
          </div>
        ) : payments.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-10">No payments today</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {payments.map((p, idx) => {
              const initials = getInitials(p.studentName)
              const colorCls = AVATAR_COLORS[idx % AVATAR_COLORS.length]
              return (
                <li key={p.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--surface)] transition-colors">
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${colorCls}`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text)] truncate">{p.studentName}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      {p.rollNumber ? `#${p.rollNumber}` : ''}
                      {p.receiptNumber ? ` · ${p.receiptNumber}` : ''}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-emerald-400">{formatPKR(p.amountPaid)}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      {new Date(p.paidAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Card>
  )
}

// ── Quick Actions ─────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'Mark Attendance', icon: UserCheck, href: '/admin/attendance', color: 'text-emerald-400' },
  { label: 'Fee Collection', icon: Banknote, href: '/admin/fees', color: 'text-[var(--gold)]' },
  { label: 'View Reports', icon: BarChart2, href: '/admin/reports', color: 'text-blue-400' },
  { label: 'Announcements', icon: Bell, href: '/admin/announcements', color: 'text-purple-400' },
  { label: 'Exam Schedule', icon: CalendarDays, href: '/admin/exams', color: 'text-rose-400' },
  { label: 'Results', icon: TrendingUp, href: '/admin/results', color: 'text-amber-400' },
]

function QuickActionsCard() {
  return (
    <Card className="flex flex-col">
      <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-[var(--border)]">
        <Layers className="w-4 h-4 text-[var(--text-muted)]" />
        <h3 className="text-sm font-semibold text-[var(--text)]">Quick Actions</h3>
      </div>
      <div className="p-4 grid grid-cols-2 gap-2">
        {QUICK_ACTIONS.map((action) => (
          <a
            key={action.label}
            href={action.href}
            className="flex flex-col items-center gap-2 p-4 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--gold)]/40 hover:bg-[var(--gold)]/5 transition-all group text-center"
          >
            <action.icon className={`w-5 h-5 ${action.color} group-hover:scale-110 transition-transform`} />
            <span className="text-[10px] font-medium text-[var(--text-muted)] leading-tight">{action.label}</span>
          </a>
        ))}
      </div>
    </Card>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const user = useCurrentUser()
  const campusId = user?.campusId ?? undefined

  const { data, isLoading } = useAdminDashboard(campusId)

  const stats = data?.stats
  const staffAttendance = data?.staffAttendance ?? { present: 0, absent: 0, onLeave: 0, halfDay: 0 }
  const feeStats = data?.feeStats ?? { pendingCount: 0, pendingAmount: 0, overdueCount: 0 }

  const presentPct =
    stats && stats.totalStaff > 0
      ? Math.round((staffAttendance.present / stats.totalStaff) * 100)
      : 0

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-6 xl:p-8 gap-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Campus operations at a glance"
        breadcrumb={[{ label: 'Home', href: '/admin/dashboard' }, { label: 'Dashboard' }]}
      />

      {/* Row 1 — 4 stat tiles */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} variant="card" className="h-24" />)
        ) : (
          <>
            <StatTile
              title="Total Students"
              value={stats?.totalStudents ?? 0}
              icon={<GraduationCap className="w-4 h-4" />}
            />
            <StatTile
              title="Staff Present"
              value={`${staffAttendance.present} / ${stats?.totalStaff ?? 0}`}
              subtitle={`${presentPct}% attendance today`}
              icon={<Users className="w-4 h-4" />}
              accent={presentPct >= 80 ? 'green' : 'red'}
            />
            <StatTile
              title="Pending Fees"
              value={stats?.pendingFeeCount ?? 0}
              subtitle="records pending"
              icon={<CreditCard className="w-4 h-4" />}
              accent="gold"
            />
            <StatTile
              title="Total Sections"
              value={stats?.totalSections ?? 0}
              icon={<Layers className="w-4 h-4" />}
            />
          </>
        )}
      </div>

      {/* Row 2 — Attendance chart + Fee overview + Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <StaffAttendanceCard
          data={staffAttendance}
          totalStaff={stats?.totalStaff ?? 0}
          isLoading={isLoading}
        />
        <FeeOverviewCard data={feeStats} isLoading={isLoading} />
        <QuickActionsCard />
      </div>

      {/* Row 3 — Upcoming exams + Recent payments */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <UpcomingExamsCard exams={data?.upcomingExams ?? []} isLoading={isLoading} />
        <RecentPaymentsCard payments={data?.recentPayments ?? []} isLoading={isLoading} />
      </div>
    </div>
  )
}
