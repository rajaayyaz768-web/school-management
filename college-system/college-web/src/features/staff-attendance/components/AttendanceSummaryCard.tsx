import { StatCard } from '@/components/ui/StatCard'
import { Skeleton } from '@/components/ui/Skeleton'

interface Props {
  totalStaff: number
  present: number
  absent: number
  onLeave: number
  halfDay: number
  isLoading: boolean
}

export function AttendanceSummaryCard({
  totalStaff,
  present,
  absent,
  onLeave,
  isLoading
}: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Staff"
        value={totalStaff}
      />
      <StatCard
        title="Present"
        value={present}
        className="[&_p.font-display]:text-green-600"
      />
      <StatCard
        title="Absent"
        value={absent}
        className="[&_p.font-display]:text-red-600"
      />
      <StatCard
        title="On Leave"
        value={onLeave}
        className="[&_p.font-display]:text-blue-600"
      />
    </div>
  )
}
