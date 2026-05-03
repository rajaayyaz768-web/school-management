'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import axios from '@/lib/axios'
import { ArrowLeft, ArrowRight, Calendar, Check } from 'lucide-react'
import { SectionSelectorCards } from '@/components/shared/selection/SectionSelectorCards'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { AttendanceReportCard } from '@/features/student-attendance/components/AttendanceReportCard'
import { StudentAttendanceTable } from '@/features/student-attendance/components/StudentAttendanceTable'
import {
  useStudentsForAttendance,
  useSectionAttendanceReport,
  useMarkStudentAttendance,
} from '@/features/student-attendance/hooks/useStudentAttendance'
import type {
  AttendanceStatus,
  SingleStudentAttendanceInput,
} from '@/features/student-attendance/types/student-attendance.types'
import type { SectionCardData } from '@/components/shared/selection/types'
import { cn } from '@/lib/utils'

type Step = 'section' | 'subject' | 'marking'

interface SubjectOption { id: string; name: string; code: string }

// ── Step progress bar ─────────────────────────────────────────────────────────
function StepBar({ current }: { current: Step }) {
  const steps: Step[] = ['section', 'subject', 'marking']
  const labels = ['Section', 'Subject', 'Marking']
  const idx = steps.indexOf(current)
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((s, i) => (
        <div key={s} className="flex-1 flex flex-col items-center gap-1">
          <div className={cn(
            'w-full h-2 rounded-full transition-colors',
            i <= idx ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
          )} />
          <span className={cn(
            'text-[10px] font-semibold uppercase tracking-wider',
            i <= idx ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'
          )}>
            {labels[i]}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function TeacherAttendancePage() {
  const [step, setStep] = useState<Step>('section')
  const [sectionId, setSectionId] = useState<string | null>(null)
  const [sectionName, setSectionName] = useState<string | null>(null)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [selectedSubjectName, setSelectedSubjectName] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [pendingAttendances, setPendingAttendances] = useState<Record<string, SingleStudentAttendanceInput>>({})
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const isMarkingReady = !!sectionId && !!selectedSubjectId && !!selectedDate

  const { data: studentList, isLoading: studentsLoading } = useStudentsForAttendance(
    sectionId ?? '', selectedSubjectId ?? '', selectedDate
  )
  const { data: report, isLoading: reportLoading } = useSectionAttendanceReport(
    sectionId ?? '', selectedSubjectId ?? '', selectedDate
  )
  const { mutate: submitAttendance, isPending } = useMarkStudentAttendance()

  useEffect(() => {
    if (!sectionId) return
    const id = sectionId
    let cancelled = false
    async function load() {
      try {
        setSubjectsLoading(true)
        const res = await axios.get('/subjects/assignments', { params: { section_id: id } })
        if (cancelled) return
        const assignments: { subject: SubjectOption }[] = res.data.data ?? []
        setSubjects(assignments.map(a => ({ id: a.subject.id, name: a.subject.name, code: a.subject.code })))
      } catch { if (!cancelled) setSubjects([]) }
      finally { if (!cancelled) setSubjectsLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [sectionId])

  const handleSectionSelect = (section: SectionCardData) => {
    setSectionId(section.id)
    setSectionName(section.name)
    setSubjects([])
    setSelectedSubjectId(null)
    setSelectedSubjectName(null)
    setPendingAttendances({})
    setStep('subject')
  }

  const handleSubjectSelect = (id: string, name: string) => {
    setSelectedSubjectId(id)
    setSelectedSubjectName(name)
    setPendingAttendances({})
    setStep('marking')
  }

  const handleBackToSection = () => {
    setSectionId(null); setSectionName(null)
    setSubjects([]); setSelectedSubjectId(null); setSelectedSubjectName(null)
    setPendingAttendances({}); setStep('section')
  }

  const handleBackToSubject = () => {
    setSelectedSubjectId(null); setSelectedSubjectName(null)
    setPendingAttendances({}); setStep('subject')
  }

  const handleStatusChange = (studentId: string, status: AttendanceStatus) =>
    setPendingAttendances(prev => ({ ...prev, [studentId]: { ...prev[studentId], studentId, status } }))

  const handleRemarksChange = (studentId: string, remarks: string) =>
    setPendingAttendances(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], studentId, status: prev[studentId]?.status ?? 'PRESENT', remarks },
    }))

  const handleConfirmSubmit = () => {
    if (!sectionId || !selectedSubjectId) return
    submitAttendance(
      {
        sectionId,
        subjectId: selectedSubjectId,
        date: selectedDate,
        attendances: studentList?.map(({ student, attendance }) => ({
          studentId: student.id,
          status: pendingAttendances[student.id]?.status ?? attendance?.status ?? 'PRESENT',
          remarks: pendingAttendances[student.id]?.remarks ?? attendance?.remarks ?? undefined,
        })) ?? [],
      },
      {
        onSuccess: () => {
          setShowConfirmDialog(false)
          setPendingAttendances({})
        },
      }
    )
  }

  // ── STEP 1 — Section ──────────────────────────────────────────────────────
  if (step === 'section') {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <header className="sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-16 flex items-center justify-between">
          <h1 className="font-bold text-base text-[var(--text)]">Mark Attendance</h1>
          <span className="text-xs text-[var(--text-muted)]">Step 1 of 3</span>
        </header>
        <div className="p-4">
          <StepBar current="section" />
          <p className="text-lg font-bold text-[var(--text)] mb-4">Select Section</p>
          <SectionSelectorCards
            onSelect={handleSectionSelect}
            selectedId={sectionId}
            emptyDescription="No sections assigned. Contact your administrator."
          />
        </div>
      </div>
    )
  }

  // ── STEP 2 — Subject + Date ───────────────────────────────────────────────
  if (step === 'subject') {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <header className="sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-16 flex items-center gap-3">
          <button onClick={handleBackToSection} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--surface)] transition-colors">
            <ArrowLeft className="w-5 h-5 text-[var(--text)]" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-base text-[var(--text)]">Mark Attendance</h1>
            <p className="text-xs text-[var(--text-muted)]">Section {sectionName}</p>
          </div>
          <span className="text-xs text-[var(--text-muted)]">Step 2 of 3</span>
        </header>

        <div className="p-4 space-y-6">
          <StepBar current="subject" />

          {/* Date picker */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Date</p>
            <label className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 cursor-pointer hover:border-[var(--primary)] transition-colors">
              <Calendar className="w-4 h-4 text-[var(--primary)] shrink-0" />
              <span className="text-sm font-medium text-[var(--text)]">
                {new Date(selectedDate).toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={e => { setSelectedDate(e.target.value); setPendingAttendances({}) }}
                className="sr-only"
              />
            </label>
          </div>

          {/* Subject selection */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Select Subject</p>
            {subjectsLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 rounded-xl bg-[var(--surface)] border border-[var(--border)] animate-pulse" />
                ))}
              </div>
            ) : subjects.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-center">
                No subjects assigned to you for this section.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {subjects.map(sub => {
                  const isSelected = selectedSubjectId === sub.id
                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleSubjectSelect(sub.id, sub.name)}
                      className={cn(
                        'relative bg-[var(--surface)] border rounded-xl p-4 text-left transition-all active:scale-[0.98]',
                        isSelected
                          ? 'border-[var(--primary)] bg-[var(--primary)]/8'
                          : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <p className="font-semibold text-sm text-[var(--text)] leading-tight">{sub.name}</p>
                      <p className="text-xs text-[var(--text-muted)] font-mono mt-1">{sub.code}</p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {selectedSubjectId && (
            <button
              onClick={() => setStep('marking')}
              className="w-full h-12 bg-[var(--primary)] text-white rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-[var(--primary)]/90 transition-colors"
            >
              Continue to Marking
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── STEP 3 — Marking ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--bg)] pb-36">
      <header className="sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-16 flex items-center gap-2">
        <button onClick={handleBackToSubject} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--surface)] transition-colors shrink-0">
          <ArrowLeft className="w-5 h-5 text-[var(--text)]" />
        </button>
        <div className="flex-1 min-w-0 text-center">
          <h1 className="font-bold text-sm text-[var(--text)] truncate">
            Section {sectionName} · {selectedSubjectName}
          </h1>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--primary)]/15 text-[var(--primary)]">
            {selectedDate}
          </span>
        </div>
        <button
          onClick={() => setShowConfirmDialog(true)}
          disabled={!studentList?.length || isPending}
          className="shrink-0 h-9 px-4 bg-[var(--primary)] text-white rounded-full text-sm font-semibold disabled:opacity-40 hover:bg-[var(--primary)]/90 transition-colors"
        >
          Save
        </button>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Step dots */}
        <div className="flex justify-center gap-2">
          {['section', 'subject', 'marking'].map(s => (
            <div key={s} className="w-2 h-2 rounded-full bg-[var(--primary)]" />
          ))}
        </div>

        {/* Stats row */}
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { label: `${report?.present ?? 0} Present`,  color: '#10b981' },
            { label: `${report?.absent ?? 0} Absent`,   color: '#ef4444' },
            { label: `${report?.late ?? 0} Late`,       color: '#f59e0b' },
            { label: `${report?.onLeave ?? 0} On Leave`,color: '#3b82f6' },
          ].map(stat => (
            <div key={stat.label} className="shrink-0 flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-full px-4 py-2">
              <span className="w-2 h-2 rounded-full" style={{ background: stat.color }} />
              <span className="text-xs font-semibold" style={{ color: stat.color }}>{stat.label}</span>
            </div>
          ))}
        </div>

        <StudentAttendanceTable
          studentList={studentList ?? []}
          isLoading={studentsLoading}
          pendingAttendances={pendingAttendances}
          onStatusChange={handleStatusChange}
          onRemarksChange={handleRemarksChange}
        />
      </div>

      {/* Fixed save bar */}
      <div className="fixed bottom-20 left-0 right-0 bg-[var(--bg)] border-t border-[var(--border)] p-4 z-40 md:hidden">
        <button
          onClick={() => setShowConfirmDialog(true)}
          disabled={!studentList?.length || isPending}
          className="w-full h-12 bg-[var(--primary)] text-white rounded-full font-semibold disabled:opacity-40 hover:bg-[var(--primary)]/90 transition-colors"
        >
          {isPending ? 'Saving…' : 'Save Attendance'}
        </button>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirm Student Attendance"
        message="Save attendance for all students in this section for the selected subject and date?"
      />
    </div>
  )
}
