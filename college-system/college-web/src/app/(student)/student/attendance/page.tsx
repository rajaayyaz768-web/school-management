'use client'

import { CalendarCheck, CheckCircle2, XCircle, Clock, MinusCircle } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { StudentContextStrip } from '@/components/shared/selection/StudentContextStrip'
import { useMyProfile } from '@/features/students/hooks/useStudents'
import { useStudentAttendanceSummary } from '@/features/student-attendance/hooks/useStudentAttendance'

function CircleProgress({ pct, size = 80 }: { pct: number; size?: number }) {
  const r = size / 2 - 8
  const circ = 2 * Math.PI * r
  const stroke = circ * (1 - pct / 100)
  const color = pct >= 75 ? '#10B981' : pct >= 60 ? '#F59E0B' : '#EF4444'

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={stroke}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  )
}

export default function StudentAttendancePage() {
  const { data: profile, isLoading: profileLoading } = useMyProfile()
  const studentId = profile?.id ?? ''
  const { data: summary, isLoading: summaryLoading } = useStudentAttendanceSummary(studentId)

  const isLoading = profileLoading || summaryLoading
  const pct = summary?.attendancePercentage ?? 0
  const pctColor = pct >= 75 ? 'success' : pct >= 60 ? 'warning' : 'danger'

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="My Attendance"
        breadcrumb={[{ label: 'Home', href: '/student/dashboard' }, { label: 'Attendance' }]}
      />

      {profile && <StudentContextStrip profile={profile} />}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="card" className="h-28" />)}
        </div>
      ) : !studentId ? (
        <div className="rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <EmptyState
            icon={<CalendarCheck size={28} style={{ color: 'var(--primary)' }} />}
            title="Profile Not Found"
            description="Your student profile could not be loaded. Please contact support."
          />
        </div>
      ) : !summary || summary.totalDays === 0 ? (
        <div className="rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <EmptyState
            icon={<CalendarCheck size={28} style={{ color: 'var(--primary)' }} />}
            title="No Attendance Records"
            description="No attendance has been recorded for you yet."
          />
        </div>
      ) : (
        <>
          {/* Summary Card */}
          <Card className="flex flex-col sm:flex-row items-center gap-6 p-6">
            <div className="relative flex items-center justify-center">
              <CircleProgress pct={pct} size={100} />
              <div className="absolute text-center">
                <p className="text-xl font-bold text-[var(--text)]">{pct.toFixed(0)}%</p>
              </div>
            </div>
            <div className="flex-1 space-y-1 text-center sm:text-left">
              <p className="font-semibold text-[var(--text)]">Overall Attendance</p>
              <Badge variant={pctColor}>{pct >= 75 ? 'Good Standing' : pct >= 60 ? 'At Risk' : 'Low Attendance'}</Badge>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                {summary.totalDays} total school days recorded
              </p>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Present', value: summary.presentDays, icon: <CheckCircle2 className="w-5 h-5" />, color: '#10B981' },
              { label: 'Absent', value: summary.absentDays, icon: <XCircle className="w-5 h-5" />, color: '#EF4444' },
              { label: 'Late', value: summary.lateDays, icon: <Clock className="w-5 h-5" />, color: '#F59E0B' },
              { label: 'Leave', value: summary.leaveDays, icon: <MinusCircle className="w-5 h-5" />, color: '#3B82F6' },
            ].map(({ label, value, icon, color }) => (
              <Card key={label} className="text-center space-y-2 p-4">
                <div className="flex justify-center" style={{ color }}>{icon}</div>
                <p className="text-2xl font-bold text-[var(--text)]">{value}</p>
                <p className="text-xs text-[var(--text-muted)]">{label}</p>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
