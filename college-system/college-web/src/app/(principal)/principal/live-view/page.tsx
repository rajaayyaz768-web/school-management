'use client'

import { useState } from 'react'
import axios from '@/lib/axios'
import { Eye, CalendarDays, Clock, User } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCampuses } from '@/features/campus/hooks/useCampus'
import { usePrograms } from '@/features/programs/hooks/usePrograms'
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

export default function LiveViewPage() {
  const [selectedCampusId, setSelectedCampusId] = useState('')
  const [selectedProgramId, setSelectedProgramId] = useState('')
  const [selectedGradeId, setSelectedGradeId] = useState('')
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [academicYear, setAcademicYear] = useState('2025-2026')
  const [grades, setGrades] = useState<{ id: string; name: string }[]>([])
  const [sections, setSections] = useState<{ id: string; name: string }[]>([])

  const { data: campuses } = useCampuses()
  const { data: programs } = usePrograms(selectedCampusId)
  const { data: timetable, isLoading: ttLoading } = useSectionTimetable(selectedSectionId, academicYear)

  const handleCampusChange = (id: string) => {
    setSelectedCampusId(id)
    setSelectedProgramId('')
    setSelectedGradeId('')
    setSelectedSectionId('')
    setGrades([])
    setSections([])
  }

  const handleProgramChange = async (id: string) => {
    setSelectedProgramId(id)
    setSelectedGradeId('')
    setSelectedSectionId('')
    setSections([])
    if (!id) { setGrades([]); return }
    try {
      const res = await axios.get('/grades', { params: { program_id: id } })
      setGrades(res.data.data ?? [])
    } catch { setGrades([]) }
  }

  const handleGradeChange = async (id: string) => {
    setSelectedGradeId(id)
    setSelectedSectionId('')
    if (!id) { setSections([]); return }
    try {
      const res = await axios.get('/sections', { params: { grade_id: id } })
      setSections(res.data.data ?? [])
    } catch { setSections([]) }
  }

  const slotsByDay = (day: DayOfWeek) =>
    (timetable?.slots ?? [])
      .filter((s) => s.dayOfWeek === day)
      .sort((a, b) => a.slotNumber - b.slotNumber)

  const activeDays = DAYS.filter((d) => slotsByDay(d.key).length > 0)

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Live Timetable View"
        breadcrumb={[{ label: 'Home', href: '/principal/dashboard' }, { label: 'Live View' }]}
      />

      {/* Filters */}
      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Select
            label="Campus"
            id="campus"
            options={(campuses ?? []).map((c: any) => ({ value: c.id, label: c.name }))}
            value={selectedCampusId}
            placeholder="Select campus"
            onChange={(e) => handleCampusChange(e.target.value)}
          />
          <Select
            label="Program"
            id="program"
            options={(programs ?? []).map((p: any) => ({ value: p.id, label: p.name }))}
            value={selectedProgramId}
            placeholder="Select program"
            disabled={!selectedCampusId}
            onChange={(e) => handleProgramChange(e.target.value)}
          />
          <Select
            label="Grade"
            id="grade"
            options={grades.map((g) => ({ value: g.id, label: g.name }))}
            value={selectedGradeId}
            placeholder="Select grade"
            disabled={!selectedProgramId}
            onChange={(e) => handleGradeChange(e.target.value)}
          />
          <Select
            label="Section"
            id="section"
            options={sections.map((s) => ({ value: s.id, label: s.name }))}
            value={selectedSectionId}
            placeholder="Select section"
            disabled={!selectedGradeId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
          />
          <Input
            label="Academic Year"
            id="academic-year"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          />
        </div>
      </div>

      {/* Timetable */}
      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {!selectedSectionId ? (
          <EmptyState
            icon={<Eye size={28} style={{ color: 'var(--primary)' }} />}
            title="Select a Section"
            description="Choose a campus, program, grade and section to view its live timetable."
          />
        ) : ttLoading ? (
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
