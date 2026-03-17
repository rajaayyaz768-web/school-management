'use client'

import { cn } from '@/lib/utils'

/**
 * TimetableGrid component for weekly schedule display
 * @param slots - Array of timetable slots
 * @param currentDay - Index of current day (0-5)
 * @param currentPeriod - Index of current period
 */
export interface TimetableSlot {
  day: number
  period: number
  subject?: string
  section?: string
  room?: string
  isBreak?: boolean
  breakLabel?: string
}

export interface TimetableGridProps {
  slots: TimetableSlot[]
  currentDay?: number
  currentPeriod?: number
  periods?: Array<{ start: string; end: string }>
  days?: string[]
  className?: string
}

const defaultDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const defaultPeriods = [
  { start: '8:00', end: '8:45' },
  { start: '8:45', end: '9:30' },
  { start: '9:45', end: '10:30' },
  { start: '10:30', end: '11:15' },
  { start: '11:15', end: '12:00' },
  { start: '12:00', end: '12:45' },
  { start: '1:00', end: '1:45' },
  { start: '1:45', end: '2:30' },
]

export function TimetableGrid({
  slots,
  currentDay,
  currentPeriod,
  periods = defaultPeriods,
  days = defaultDays,
  className,
}: TimetableGridProps) {
  // Group slots by period for break detection
  const getSlot = (day: number, period: number) => {
    return slots.find((s) => s.day === day && s.period === period)
  }

  // Check if period is a break
  const isBreakPeriod = (period: number) => {
    return slots.some((s) => s.period === period && s.isBreak)
  }

  const getBreakLabel = (period: number) => {
    const breakSlot = slots.find((s) => s.period === period && s.isBreak)
    return breakSlot?.breakLabel || 'BREAK'
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <div className="min-w-[800px]">
        {/* Header Row */}
        <div className="grid gap-1" style={{ gridTemplateColumns: '80px repeat(6, 1fr)' }}>
          <div /> {/* Empty corner */}
          {days.map((day, index) => (
            <div
              key={day}
              className={cn(
                'py-3 px-2 text-center font-body text-xs font-bold rounded-[8px]',
                currentDay === index
                  ? 'bg-teal-700 dark:bg-gold-400 text-white dark:text-charcoal-900'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Period Rows */}
        {periods.map((period, periodIndex) => {
          if (isBreakPeriod(periodIndex)) {
            return (
              <div key={`break-${periodIndex}`} className="mt-1">
                <div
                  className="col-span-full py-2 text-center bg-gold-100 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800 rounded-[8px]"
                >
                  <span className="font-body text-[10px] font-semibold text-gold-700 dark:text-gold-400">
                    {getBreakLabel(periodIndex)} — {period.start} to {period.end}
                  </span>
                </div>
              </div>
            )
          }

          return (
            <div
              key={periodIndex}
              className="grid gap-1 mt-1"
              style={{ gridTemplateColumns: '80px repeat(6, 1fr)' }}
            >
              {/* Period Label */}
              <div className="flex items-center justify-center">
                <span className="font-mono text-[10px] text-[var(--text-muted)]">
                  {period.start}
                  <br />
                  {period.end}
                </span>
              </div>

              {/* Day Slots */}
              {days.map((_, dayIndex) => {
                const slot = getSlot(dayIndex, periodIndex)
                const isCurrent = currentDay === dayIndex && currentPeriod === periodIndex

                if (!slot?.subject) {
                  return (
                    <div
                      key={`${dayIndex}-${periodIndex}`}
                      className="m-1 p-3 rounded-[10px] border border-dashed border-[var(--border)] bg-[var(--bg-secondary)] opacity-60 flex items-center justify-center"
                    >
                      <span className="font-body text-[10px] text-[var(--text-disabled)]">
                        Free
                      </span>
                    </div>
                  )
                }

                return (
                  <div
                    key={`${dayIndex}-${periodIndex}`}
                    className={cn(
                      'm-1 p-3 rounded-[10px] transition-all duration-200',
                      isCurrent
                        ? 'bg-teal-700 dark:bg-charcoal-500 border-none shadow-[0_0_20px_rgba(212,168,67,0.3)]'
                        : 'bg-[var(--surface)] border border-[var(--border)] hover:shadow-[var(--shadow-sm)]'
                    )}
                  >
                    <p
                      className={cn(
                        'font-body font-bold text-xs',
                        isCurrent ? 'text-white' : 'text-[var(--text)]'
                      )}
                    >
                      {slot.subject}
                    </p>
                    {slot.section && (
                      <p
                        className={cn(
                          'font-body text-[10px] mt-0.5',
                          isCurrent ? 'text-gold-300' : 'text-[var(--text-muted)]'
                        )}
                      >
                        {slot.section}
                      </p>
                    )}
                    {slot.room && (
                      <p
                        className={cn(
                          'font-body text-[10px]',
                          isCurrent ? 'text-gold-300' : 'text-gold-600 dark:text-gold-400'
                        )}
                      >
                        {slot.room}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TimetableGrid
