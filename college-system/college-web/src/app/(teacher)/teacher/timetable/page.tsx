'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Users, Coffee, CalendarDays } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { useMyTeacherSchedule } from '@/features/timetable/hooks/useTimetable'
import { TeacherScheduleSlot, DayOfWeek } from '@/features/timetable/types/timetable.types'
import { cn } from '@/lib/utils'

const DAYS: { key: DayOfWeek; label: string; short: string }[] = [
  { key: 'MON', label: 'Monday',    short: 'Mon' },
  { key: 'TUE', label: 'Tuesday',   short: 'Tue' },
  { key: 'WED', label: 'Wednesday', short: 'Wed' },
  { key: 'THU', label: 'Thursday',  short: 'Thu' },
  { key: 'FRI', label: 'Friday',    short: 'Fri' },
  { key: 'SAT', label: 'Saturday',  short: 'Sat' },
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

function PeriodRow({ slot }: { slot: TeacherScheduleSlot }) {
  const isBreak = slot.slotType === 'BREAK'
  const state = isBreak ? 'upcoming' : getPeriodState(slot.startTime, slot.endTime)

  if (isBreak) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-[var(--border)]/20 rounded-lg">
        <Coffee className="w-4 h-4 text-[var(--text-muted)]" />
        <span className="text-sm text-[var(--text-muted)] font-medium">Break</span>
        <span className="ml-auto text-xs text-[var(--text-muted)]">{slot.startTime}–{slot.endTime}</span>
      </div>
    )
  }

  return (
    <div className={cn(
      'relative flex items-stretch bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden transition-all',
      state === 'current' && 'border-l-4 border-l-[var(--primary)] shadow-[0_0_12px_rgba(0,133,122,0.15)]',
      state === 'past' && 'opacity-50',
    )}>
      {/* Time column */}
      <div className="w-16 flex flex-col items-center justify-center py-3 px-2 bg-[var(--bg)] border-r border-[var(--border)] shrink-0">
        <span className={cn('text-sm font-bold leading-tight', state === 'current' ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]')}>
          {slot.startTime}
        </span>
        <span className="text-[10px] text-[var(--text-muted)] mt-0.5">{slot.endTime}</span>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-[var(--text)] leading-tight truncate">
              {slot.subject?.name ?? 'Free Period'}
            </h3>
            {slot.sectionName && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Section {slot.sectionName}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[var(--surface-hover)] text-[var(--text-muted)]">
              P{slot.slotNumber}
            </span>
            {state === 'current' && (
              <span className="text-[10px] font-bold text-[var(--primary)] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                NOW
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TeacherTimetablePage() {
  const [academicYear, setAcademicYear] = useState('2025-2026')
  const { data: schedule, isLoading } = useMyTeacherSchedule(academicYear)

  const todayKey = (['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()] ?? 'MON') as DayOfWeek
  const [activeDay, setActiveDay] = useState<DayOfWeek>(todayKey)

  const slotsByDay = (day: DayOfWeek) =>
    (schedule?.slots ?? [])
      .filter(s => s.dayOfWeek === day)
      .sort((a, b) => a.slotNumber - b.slotNumber)

  const currentSlots = slotsByDay(activeDay)

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-16 flex items-center justify-between">
        <h1 className="font-bold text-lg text-[var(--text)]">My Timetable</h1>
        <input
          type="text"
          value={academicYear}
          onChange={e => setAcademicYear(e.target.value)}
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/20 outline-none w-28 text-center"
        />
      </header>

      {/* Day tabs */}
      <div className="flex overflow-x-auto gap-2 px-4 py-3 border-b border-[var(--border)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {DAYS.map(day => {
          const hasSlots = slotsByDay(day.key).length > 0
          const isActive = activeDay === day.key
          return (
            <button
              key={day.key}
              onClick={() => setActiveDay(day.key)}
              disabled={!hasSlots && !isLoading}
              className={cn(
                'shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150',
                isActive
                  ? 'bg-[var(--primary)] text-white'
                  : hasSlots
                  ? 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
                  : 'bg-[var(--surface)] text-[var(--border)] border border-[var(--border)] opacity-40 cursor-not-allowed'
              )}
            >
              {day.short}
            </button>
          )
        })}
      </div>

      {/* Schedule */}
      <div className="p-4 space-y-2">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-[var(--surface)] border border-[var(--border)] animate-pulse" />
          ))
        ) : currentSlots.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              icon={<CalendarDays size={32} className="text-[var(--primary)]" />}
              title={`No classes on ${DAYS.find(d => d.key === activeDay)?.label}`}
              description="No timetable slots assigned for this day."
            />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="space-y-2"
            >
              {currentSlots.map(slot => (
                <PeriodRow key={slot.id} slot={slot} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
