'use client'

import { useState } from 'react'
import { CalendarDays, Clock, User, Coffee } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { StudentContextStrip } from '@/components/shared/selection/StudentContextStrip'
import { useMyProfile } from '@/features/students/hooks/useStudents'
import { useSectionTimetable } from '@/features/timetable/hooks/useTimetable'
import { TimetableSlot, DayOfWeek } from '@/features/timetable/types/timetable.types'
import { cn } from '@/lib/utils'

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'MON', label: 'Monday' },
  { key: 'TUE', label: 'Tuesday' },
  { key: 'WED', label: 'Wednesday' },
  { key: 'THU', label: 'Thursday' },
  { key: 'FRI', label: 'Friday' },
  { key: 'SAT', label: 'Saturday' },
]

function timeToMins(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function getPeriodState(start: string, end: string): 'past' | 'current' | 'upcoming' {
  const now = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const s = timeToMins(start)
  const e = timeToMins(end)
  if (nowMins > e) return 'past'
  if (nowMins >= s) return 'current'
  return 'upcoming'
}

function SlotCard({ slot }: { slot: TimetableSlot }) {
  const isBreak = slot.slotType === 'BREAK'
  const state = isBreak ? 'upcoming' : getPeriodState(slot.startTime, slot.endTime)

  return (
    <div
      className={cn(
        'rounded-lg p-3 border text-sm transition-all',
        state === 'current' && 'bg-[var(--gold)]/10 border-[var(--gold)]/40 shadow-sm',
        state === 'past' && 'opacity-50 bg-[var(--surface)] border-[var(--border)]',
        state === 'upcoming' && !isBreak && 'bg-[var(--primary)]/6 border-[var(--primary)]/20',
        isBreak && 'bg-[var(--border)]/30 border-[var(--border)] text-[var(--text-muted)]'
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={cn(
          'font-bold text-xs uppercase tracking-wider',
          state === 'current' ? 'text-[var(--gold)]' : 'text-[var(--text-muted)]'
        )}>
          {isBreak ? 'Break' : `P${slot.slotNumber}`}
        </span>
        <span className="text-xs text-[var(--text-muted)] flex items-center gap-0.5">
          <Clock className="w-3 h-3" />
          {slot.startTime}
        </span>
      </div>
      {isBreak ? (
        <div className="flex items-center gap-1 mt-1">
          <Coffee className="w-3.5 h-3.5" />
          <span className="text-xs">Break Time</span>
        </div>
      ) : (
        <>
          <p className={cn('font-semibold leading-tight', state === 'current' ? 'text-[var(--gold)]' : 'text-[var(--text)]')}>
            {slot.subject?.name ?? 'Free Period'}
          </p>
          {slot.staff && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
              <User className="w-3 h-3" />
              {slot.staff.firstName} {slot.staff.lastName}
            </p>
          )}
        </>
      )}
    </div>
  )
}

export default function StudentTimetablePage() {
  const [academicYear, setAcademicYear] = useState('2025-2026')
  const { data: profile, isLoading: dashLoading } = useMyProfile()
  const sectionId = profile?.sectionId ?? ''
  const { data: timetable, isLoading: ttLoading } = useSectionTimetable(sectionId, academicYear)

  const isLoading = dashLoading || ttLoading

  const slotsByDay = (day: DayOfWeek) =>
    (timetable?.slots ?? [])
      .filter((s) => s.dayOfWeek === day)
      .sort((a, b) => a.slotNumber - b.slotNumber)

  const activeDays = DAYS.filter((d) => slotsByDay(d.key).length > 0)

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="My Timetable"
        breadcrumb={[{ label: 'Home', href: '/student/dashboard' }, { label: 'Timetable' }]}
      />

      {profile && <StudentContextStrip profile={profile} />}

      <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="max-w-xs">
          <Input
            label="Academic Year"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            id="academic-year"
          />
        </div>
      </div>

      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-48" />)}
          </div>
        ) : !sectionId ? (
          <EmptyState
            icon={<CalendarDays size={28} style={{ color: 'var(--primary)' }} />}
            title="No Section Assigned"
            description="You are not currently assigned to any section. Contact your administrator."
          />
        ) : !timetable?.slots?.length ? (
          <EmptyState
            icon={<CalendarDays size={28} style={{ color: 'var(--primary)' }} />}
            title="Timetable Not Set"
            description="No timetable has been configured for your section yet."
          />
        ) : (
          <>
            {timetable.sectionName && (
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Section <strong className="text-[var(--text)]">{timetable.sectionName}</strong> · {academicYear}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeDays.map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
                    <Badge variant="info">{key}</Badge>
                    <span className="font-semibold text-sm text-[var(--text)]">{label}</span>
                  </div>
                  <div className="space-y-2">
                    {slotsByDay(key).map((slot) => (
                      <SlotCard key={slot.id} slot={slot} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
