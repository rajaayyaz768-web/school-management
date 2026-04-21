'use client'

import { useState } from 'react'
import { CalendarDays, Clock, User } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { CampusSelectorCards } from '@/components/shared/selection/CampusSelectorCards'
import { SectionSelectorCards } from '@/components/shared/selection/SectionSelectorCards'
import { useSectionTimetable } from '@/features/timetable/hooks/useTimetable'
import { TimetableSlot, DayOfWeek } from '@/features/timetable/types/timetable.types'
import { cn } from '@/lib/utils'
import type { CampusCardData, SectionCardData } from '@/components/shared/selection/types'

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

function SlotCell({ slot }: { slot: TimetableSlot }) {
  const isBreak = slot.slotType === 'BREAK'
  const state = isBreak ? 'upcoming' : getPeriodState(slot.startTime, slot.endTime)

  return (
    <div
      className={cn(
        'rounded-lg p-2.5 border text-xs',
        state === 'current' && 'bg-[var(--gold)]/10 border-[var(--gold)]/40',
        state === 'past' && 'opacity-50 bg-[var(--surface)] border-[var(--border)]',
        state === 'upcoming' && !isBreak && 'bg-[var(--primary)]/6 border-[var(--primary)]/20',
        isBreak && 'bg-[var(--border)]/30 border-[var(--border)] text-[var(--text-muted)] text-center'
      )}
    >
      {isBreak ? (
        <span>Break</span>
      ) : (
        <>
          <div className="flex items-center gap-1 mb-1">
            <Clock className="w-2.5 h-2.5 text-[var(--text-muted)]" />
            <span className="text-[var(--text-muted)]">{slot.startTime}</span>
          </div>
          <p className={cn('font-semibold leading-tight truncate', state === 'current' ? 'text-[var(--gold)]' : 'text-[var(--text)]')}>
            {slot.subject?.name ?? 'Free'}
          </p>
          {slot.staff && (
            <p className="text-[var(--text-muted)] flex items-center gap-0.5 mt-0.5 truncate">
              <User className="w-2.5 h-2.5 flex-shrink-0" />
              {slot.staff.firstName} {slot.staff.lastName}
            </p>
          )}
        </>
      )}
    </div>
  )
}

type Step = 'campus' | 'section' | 'view'

export default function LiveViewPage() {
  const [step, setStep] = useState<Step>('campus')
  const [selectedCampus, setSelectedCampus] = useState<CampusCardData | null>(null)
  const [selectedSection, setSelectedSection] = useState<SectionCardData | null>(null)
  const [academicYear, setAcademicYear] = useState('2025-2026')

  const { data: timetable, isLoading: ttLoading } = useSectionTimetable(selectedSection?.id ?? '', academicYear)

  const slotsByDay = (day: DayOfWeek) =>
    (timetable?.slots ?? [])
      .filter((s) => s.dayOfWeek === day)
      .sort((a, b) => a.slotNumber - b.slotNumber)

  const activeDays = DAYS.filter((d) => slotsByDay(d.key).length > 0)

  const breadcrumb = [{ label: 'Home', href: '/principal/dashboard' }, { label: 'Live View' }]

  if (step === 'campus') {
    return (
      <div className="p-6 space-y-6">
        <PageHeader title="Live Timetable View" subtitle="Select a campus to begin" breadcrumb={breadcrumb} />
        <CampusSelectorCards
          onSelect={(campus) => { setSelectedCampus(campus); setSelectedSection(null); setStep('section') }}
          selectedId={selectedCampus?.id}
        />
      </div>
    )
  }

  if (step === 'section') {
    return (
      <div className="p-6 space-y-6">
        <PageHeader title="Live Timetable View" subtitle="Select a section" breadcrumb={breadcrumb} />
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setStep('campus')}>← Back</Button>
          {selectedCampus && <Badge variant="info">{selectedCampus.name}</Badge>}
        </div>
        <SectionSelectorCards
          campusId={selectedCampus?.id ?? ''}
          onSelect={(section) => { setSelectedSection(section); setStep('view') }}
          selectedId={selectedSection?.id}
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Live Timetable View" breadcrumb={breadcrumb} />

      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => { setStep('section'); setSelectedSection(null) }}>
          ← Change Section
        </Button>
        {selectedCampus && <Badge variant="neutral">{selectedCampus.name}</Badge>}
        {selectedSection && <Badge variant="info">{selectedSection.name}</Badge>}
        {selectedSection?.programCode && (
          <span className="text-sm text-[var(--text-muted)]">{selectedSection.programCode}</span>
        )}
        {selectedSection?.gradeName && (
          <span className="text-sm text-[var(--text-muted)]">· {selectedSection.gradeName}</span>
        )}
        <div className="ml-auto max-w-[160px]">
          <Input label="" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="Academic Year" />
        </div>
      </div>

      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {ttLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-48" />)}
          </div>
        ) : !timetable?.slots?.length ? (
          <EmptyState
            icon={<CalendarDays size={28} style={{ color: 'var(--primary)' }} />}
            title="No Timetable Configured"
            description="No timetable slots have been set up for this section yet."
          />
        ) : (
          <>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Section <strong className="text-[var(--text)]">{timetable.sectionName}</strong> · {academicYear}
            </p>
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
                    {slotsByDay(key).map((slot) => <SlotCell key={slot.id} slot={slot} />)}
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
