'use client'

import { useState } from 'react'
import { CalendarDays, Clock, BookOpen, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useMyTeacherSchedule } from '@/features/timetable/hooks/useTimetable'
import { TeacherScheduleSlot, DayOfWeek } from '@/features/timetable/types/timetable.types'
import { cn } from '@/lib/utils'

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'MON', label: 'Monday' },
  { key: 'TUE', label: 'Tuesday' },
  { key: 'WED', label: 'Wednesday' },
  { key: 'THU', label: 'Thursday' },
  { key: 'FRI', label: 'Friday' },
  { key: 'SAT', label: 'Saturday' },
]

function SlotCard({ slot }: { slot: TeacherScheduleSlot }) {
  const isBreak = slot.slotType === 'BREAK'

  return (
    <div
      className={cn(
        'rounded-lg p-3 border text-sm',
        isBreak
          ? 'bg-[var(--border)]/40 border-[var(--border)] text-[var(--text-muted)]'
          : 'bg-[var(--primary)]/6 border-[var(--primary)]/20'
      )}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-semibold text-xs text-[var(--text-muted)] uppercase tracking-wider">
          {isBreak ? 'Break' : `Period ${slot.slotNumber}`}
        </span>
        <span className="text-xs text-[var(--text-muted)] flex items-center gap-0.5">
          <Clock className="w-3 h-3" />
          {slot.startTime}–{slot.endTime}
        </span>
      </div>
      {!isBreak && (
        <>
          <p className="font-semibold text-[var(--text)] leading-tight">
            {slot.subject?.name ?? 'Free Period'}
          </p>
          {slot.sectionName && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
              <Users className="w-3 h-3" />
              Section {slot.sectionName}
            </p>
          )}
        </>
      )}
    </div>
  )
}

export default function TeacherTimetablePage() {
  const [academicYear, setAcademicYear] = useState('2025-2026')
  const { data: schedule, isLoading } = useMyTeacherSchedule(academicYear)

  const slotsByDay = (day: DayOfWeek) =>
    (schedule?.slots ?? [])
      .filter((s) => s.dayOfWeek === day)
      .sort((a, b) => a.slotNumber - b.slotNumber)

  const activeDays = DAYS.filter((d) => slotsByDay(d.key).length > 0)

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="My Timetable"
        breadcrumb={[{ label: 'Home', href: '/teacher/dashboard' }, { label: 'Timetable' }]}
      />

      {/* Academic Year Selector */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="max-w-xs">
          <Input
            label="Academic Year"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            id="academic-year"
          />
        </div>
      </div>

      {/* Timetable Grid */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-48" />)}
          </div>
        ) : !schedule?.slots?.length ? (
          <EmptyState
            icon={<CalendarDays size={28} style={{ color: 'var(--primary)' }} />}
            title="No Schedule Found"
            description="No timetable slots have been assigned to you for this academic year."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeDays.map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
                  <Badge variant="info">{key}</Badge>
                  <span className="font-semibold text-sm text-[var(--text)]">{label}</span>
                  <span className="ml-auto text-xs text-[var(--text-muted)]">
                    {slotsByDay(key).filter((s) => s.slotType !== 'BREAK').length} periods
                  </span>
                </div>
                <div className="space-y-2">
                  {slotsByDay(key).map((slot) => (
                    <SlotCard key={slot.id} slot={slot} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
