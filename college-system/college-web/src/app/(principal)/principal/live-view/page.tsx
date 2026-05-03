'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, CalendarDays, Coffee, Users, ChevronRight, Radio } from 'lucide-react'
import { CampusSelectorCards } from '@/components/shared/selection/CampusSelectorCards'
import { SectionSelectorCards } from '@/components/shared/selection/SectionSelectorCards'
import { EmptyState } from '@/components/ui/EmptyState'
import { useSectionTimetable } from '@/features/timetable/hooks/useTimetable'
import { TimetableSlot, DayOfWeek } from '@/features/timetable/types/timetable.types'
import { cn } from '@/lib/utils'
import type { CampusCardData, SectionCardData } from '@/components/shared/selection/types'

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

// ─── Timetable period card (Stitch vertical timeline style) ───────────────────
function PeriodCard({ slot, index }: { slot: TimetableSlot; index: number }) {
  const isBreak = slot.slotType === 'BREAK'
  const state = isBreak ? 'upcoming' : getPeriodState(slot.startTime, slot.endTime)

  if (isBreak) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.3 }}
        className="flex items-center gap-3 px-4 py-3 bg-[var(--surface)] rounded-xl border border-[var(--border)]"
      >
        <Coffee className="w-4 h-4 text-[var(--text-muted)]" />
        <span className="text-sm text-[var(--text-muted)] font-medium flex-1">Break</span>
        <span className="text-xs text-[var(--text-muted)] font-mono">{slot.startTime} – {slot.endTime}</span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className={cn(
        'flex items-stretch bg-[var(--surface)] border rounded-xl overflow-hidden',
        state === 'current'
          ? 'border-[var(--primary)] shadow-[0_0_16px_rgba(0,133,122,0.12)]'
          : 'border-[var(--border)]',
        state === 'past' && 'opacity-45',
      )}
    >
      {/* Time column */}
      <div className={cn(
        'w-16 flex flex-col items-center justify-center py-3 px-2 border-r shrink-0',
        state === 'current'
          ? 'bg-[var(--primary)]/10 border-[var(--primary)]/20'
          : 'bg-[var(--bg)] border-[var(--border)]'
      )}>
        <span className={cn(
          'text-sm font-bold',
          state === 'current' ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'
        )}>
          {slot.startTime}
        </span>
        <span className="text-[10px] text-[var(--text-muted)]">{slot.endTime}</span>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 min-w-0 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-sm text-[var(--text)] truncate">
            {slot.subject?.name ?? 'Free Period'}
          </h3>
          {slot.staff && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
              {slot.staff.firstName} {slot.staff.lastName}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[var(--border)]/50 text-[var(--text-muted)]">
            P{slot.slotNumber}
          </span>
          {state === 'current' && (
            <span className="text-[10px] font-bold text-[var(--primary)] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />NOW
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

type Step = 'campus' | 'section' | 'view'

export default function LiveViewPage() {
  const [step, setStep] = useState<Step>('campus')
  const [selectedCampus, setSelectedCampus] = useState<CampusCardData | null>(null)
  const [selectedSection, setSelectedSection] = useState<SectionCardData | null>(null)
  const [academicYear, setAcademicYear] = useState('2025-2026')
  const [activeDay, setActiveDay] = useState<DayOfWeek>('MON')

  const { data: timetable, isLoading: ttLoading } = useSectionTimetable(selectedSection?.id ?? '', academicYear)

  const slotsByDay = (day: DayOfWeek) =>
    (timetable?.slots ?? []).filter(s => s.dayOfWeek === day).sort((a, b) => a.slotNumber - b.slotNumber)

  const currentSlots = slotsByDay(activeDay)

  // ── STEP 1 — Campus ───────────────────────────────────────────────────────
  if (step === 'campus') {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <header className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-14 flex items-center gap-3 md:hidden">
          <Radio className="w-5 h-5 text-[var(--primary)]" />
          <h1 className="font-bold text-lg text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>Live Timetable</h1>
        </header>
        <div className="p-4 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--text)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>Select Campus</h2>
            <p className="text-sm text-[var(--text-muted)]">Choose a campus to view live timetable</p>
          </div>
          <CampusSelectorCards
            onSelect={c => { setSelectedCampus(c); setSelectedSection(null); setStep('section') }}
            selectedId={selectedCampus?.id}
          />
        </div>
      </div>
    )
  }

  // ── STEP 2 — Section ──────────────────────────────────────────────────────
  if (step === 'section') {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <header className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-14 flex items-center gap-3 md:hidden">
          <button onClick={() => setStep('campus')} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5 text-[var(--text)]" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-base text-[var(--text)]">Select Section</h1>
            <p className="text-xs text-[var(--text-muted)] truncate">{selectedCampus?.name}</p>
          </div>
        </header>
        <div className="p-4 space-y-4">
          <p className="text-sm text-[var(--text-muted)]">Choose a section to view its timetable</p>
          <SectionSelectorCards
            campusId={selectedCampus?.id ?? ''}
            onSelect={s => { setSelectedSection(s); setStep('view') }}
            selectedId={selectedSection?.id}
          />
        </div>
      </div>
    )
  }

  // ── STEP 3 — Timetable view ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-14 flex items-center gap-3 md:hidden">
        <button onClick={() => { setStep('section'); setSelectedSection(null) }} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors shrink-0 active:scale-95">
          <ArrowLeft className="w-5 h-5 text-[var(--text)]" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-sm text-[var(--text)] truncate">Section {selectedSection?.name}</h1>
          <p className="text-[11px] text-[var(--text-muted)] truncate">{selectedCampus?.name} · {selectedSection?.programCode} · {selectedSection?.gradeName}</p>
        </div>
        <input
          type="text"
          value={academicYear}
          onChange={e => setAcademicYear(e.target.value)}
          className="w-24 text-xs text-center font-semibold px-2 py-1.5 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/20 outline-none"
        />
      </header>

      {/* Day tabs — horizontal scroll */}
      <div className="flex overflow-x-auto gap-2 px-4 py-3 border-b border-[var(--border)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {DAYS.map(day => {
          const hasSlots = slotsByDay(day.key).length > 0
          const isActive = activeDay === day.key
          return (
            <button
              key={day.key}
              onClick={() => setActiveDay(day.key)}
              disabled={!hasSlots && !ttLoading}
              className={cn(
                'shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all min-h-[40px]',
                isActive
                  ? 'bg-[var(--primary)] text-white shadow-[0_0_12px_rgba(0,133,122,0.2)]'
                  : hasSlots
                    ? 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--primary)]/40 active:scale-95'
                    : 'bg-[var(--surface)] text-[var(--border)] border border-[var(--border)] opacity-40 cursor-not-allowed'
              )}
            >
              {day.short}
            </button>
          )
        })}
      </div>

      {/* Timetable slots */}
      <div className="p-4 space-y-2.5">
        {ttLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-[72px] rounded-xl bg-[var(--surface)] border border-[var(--border)] animate-pulse" />
          ))
        ) : currentSlots.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              icon={<CalendarDays size={32} className="text-[var(--primary)]" />}
              title={`No classes on ${DAYS.find(d => d.key === activeDay)?.label}`}
              description="No timetable slots for this day."
            />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={activeDay} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-2.5">
              {currentSlots.map((slot, i) => <PeriodCard key={slot.id} slot={slot} index={i} />)}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
