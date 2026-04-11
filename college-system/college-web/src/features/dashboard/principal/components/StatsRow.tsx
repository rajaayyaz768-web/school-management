import { GraduationCap, Users, CalendarCheck, Layers, Banknote, AlertCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { DashboardStats } from '../types/principal-dashboard.types'

function formatPKR(amount: number): string {
  if (amount >= 1_000_000) return `PKR ${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `PKR ${(amount / 1_000).toFixed(0)}K`
  return `PKR ${amount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`
}

type AccentVariant = 'gold' | 'green' | 'red' | 'blue' | 'default'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  accent?: AccentVariant
}

const ACCENT_STYLES: Record<AccentVariant, { card: string; icon: string; value: string }> = {
  gold: {
    card: 'border-[var(--gold)]/30 bg-[var(--gold)]/5',
    icon: 'bg-[var(--gold)]/10 text-[var(--gold)]',
    value: 'text-[var(--gold)]',
  },
  green: {
    card: 'border-emerald-500/30 bg-emerald-500/5',
    icon: 'bg-emerald-500/10 text-emerald-400',
    value: 'text-emerald-400',
  },
  red: {
    card: 'border-red-500/30 bg-red-500/5',
    icon: 'bg-red-500/10 text-red-400',
    value: 'text-red-400',
  },
  blue: {
    card: 'border-blue-500/30 bg-blue-500/5',
    icon: 'bg-blue-500/10 text-blue-400',
    value: 'text-blue-400',
  },
  default: {
    card: 'border-[var(--border)] bg-[var(--surface)]',
    icon: 'bg-white/5 text-[var(--text-muted)]',
    value: 'text-[var(--text)]',
  },
}

function MetricCard({ title, value, subtitle, icon, accent = 'default' }: MetricCardProps) {
  const styles = ACCENT_STYLES[accent]
  return (
    <div className={`rounded-[var(--radius-lg)] border p-4 xl:p-5 flex items-start gap-3 ${styles.card}`}>
      <div className={`w-9 h-9 rounded-[var(--radius)] flex items-center justify-center flex-shrink-0 mt-0.5 ${styles.icon}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest truncate">{title}</p>
        <p className={`text-2xl font-bold leading-tight mt-1 truncate ${styles.value}`}>{value}</p>
        {subtitle && (
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

interface Props {
  stats: DashboardStats
  isLoading: boolean
}

export function StatsRow({ stats, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} variant="card" className="h-24" />
        ))}
      </div>
    )
  }

  const attendancePct =
    stats.totalStaffForCampus > 0
      ? Math.round((stats.presentStaff / stats.totalStaffForCampus) * 100)
      : 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
      <MetricCard
        title="Total Students"
        value={stats.totalStudents.toLocaleString()}
        icon={<GraduationCap className="w-4 h-4" />}
      />
      <MetricCard
        title="Total Staff"
        value={stats.totalStaff}
        icon={<Users className="w-4 h-4" />}
      />
      <MetricCard
        title="Present Today"
        value={`${stats.presentStaff} / ${stats.totalStaffForCampus}`}
        subtitle={`${attendancePct}% attendance`}
        icon={<CalendarCheck className="w-4 h-4" />}
        accent={attendancePct >= 90 ? 'green' : attendancePct >= 75 ? 'blue' : 'red'}
      />
      <MetricCard
        title="Sections"
        value={stats.totalSections}
        icon={<Layers className="w-4 h-4" />}
      />
      <MetricCard
        title="Today's Collection"
        value={formatPKR(stats.todayFeeCollection)}
        subtitle="fee collected"
        icon={<Banknote className="w-4 h-4" />}
        accent="gold"
      />
      <MetricCard
        title="Pending Fees"
        value="—"
        subtitle="no data"
        icon={<AlertCircle className="w-4 h-4" />}
        accent="red"
      />
    </div>
  )
}
