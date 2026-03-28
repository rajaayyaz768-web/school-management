import { StatCard } from '@/components/ui/StatCard'
import { Skeleton } from '@/components/ui/Skeleton'

interface Props {
  totalStudents: number
  present: number
  absent: number
  late: number
  onLeave: number
  isLoading: boolean
}

export function AttendanceReportCard({
  totalStudents,
  present,
  absent,
  late,
  onLeave,
  isLoading
}: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <StatCard
        title="Total Students"
        value={totalStudents}
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
        title="Late"
        value={late}
        className="[&_p.font-display]:text-yellow-600"
      />
      <StatCard
        title="Leave"
        value={onLeave}
        className="[&_p.font-display]:text-blue-600"
      />
    </div>
  )
}
