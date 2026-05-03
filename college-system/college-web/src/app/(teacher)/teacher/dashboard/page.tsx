'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import {
  Clock, BookOpen, Users, ClipboardCheck, Coffee,
  CalendarDays, ChevronRight, UserRound, BookMarked, FileText,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'
import { useTeacherDashboard } from '@/features/dashboard/teacher/hooks/useTeacherDashboard'
import { useCurrentUser } from '@/store/authStore'
import {
  TodayScheduleSlot,
  TeacherSection,
  TeacherUpcomingExam,
} from '@/features/dashboard/teacher/types/teacher-dashboard.types'

// ── helpers ───────────────────────────────────────────────────────────────────
function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function getPeriodState(start: string, end: string): 'past' | 'current' | 'upcoming' {
  const now = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const s = timeToMinutes(start)
  const e = timeToMinutes(end)
  if (nowMins > e) return 'past'
  if (nowMins >= s) return 'current'
  return 'upcoming'
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// ── Schedule card ─────────────────────────────────────────────────────────────
function PeriodCard({ slot, index }: { slot: TodayScheduleSlot; index: number }) {
  const isBreak = slot.slotType === 'BREAK'
  const state = isBreak ? 'upcoming' : getPeriodState(slot.startTime, slot.endTime)

  if (isBreak) {
    return (
      <div className="min-w-[180px] shrink-0 bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-xl p-4 flex flex-col items-center justify-center gap-2 opacity-60">
        <Coffee className="w-5 h-5 text-[var(--text-muted)]" />
        <p className="text-sm font-medium text-[var(--text-muted)]">Break</p>
        <p className="text-xs text-[var(--text-muted)]">{slot.startTime} – {slot.endTime}</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'min-w-[260px] shrink-0 rounded-xl p-4 border flex flex-col gap-2 transition-all',
        state === 'current' && 'border-l-4 border-l-[var(--gold)] border-[var(--gold)]/30 bg-[var(--gold)]/8 shadow-[0_0_16px_rgba(212,168,67,0.15)]',
        state === 'past' && 'border-[var(--border)] bg-[var(--surface)] opacity-50',
        state === 'upcoming' && 'border-[var(--border)] bg-[var(--surface)]',
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn(
          'text-xs font-semibold px-2 py-0.5 rounded-full',
          state === 'current'
            ? 'bg-[var(--gold)]/20 text-[var(--gold)]'
            : 'bg-[var(--surface-hover)] text-[var(--text-muted)]'
        )}>
          Period {slot.slotNumber}
        </span>
        <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {slot.startTime} – {slot.endTime}
        </span>
      </div>
      <h3 className="font-semibold text-[var(--text)] leading-tight">{slot.subjectName ?? '—'}</h3>
      <p className="text-xs text-[var(--text-muted)]">{slot.sectionName}</p>
      {state === 'current' && (
        <div className="flex items-center gap-1.5 mt-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--gold)] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--gold)]" />
          </span>
          <span className="text-[10px] font-bold text-[var(--gold)] uppercase tracking-wider">Live Now</span>
        </div>
      )}
    </motion.div>
  )
}

// ── Quick action tile ─────────────────────────────────────────────────────────
function QuickAction({ href, icon: Icon, label, colorClass }: {
  href: string; icon: React.ElementType; label: string; colorClass: string
}) {
  return (
    <Link
      href={href}
      className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 flex flex-col items-center justify-center gap-3 aspect-square hover:bg-[var(--surface-hover)] transition-colors active:scale-95"
    >
      <div className={cn('h-12 w-12 rounded-full flex items-center justify-center', colorClass)}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-xs font-semibold text-[var(--text)] text-center leading-tight">{label}</span>
    </Link>
  )
}

// ── Section row ───────────────────────────────────────────────────────────────
function SectionRow({ section }: { section: TeacherSection }) {
  return (
    <Link
      href={`/teacher/my-classes/${section.id}`}
      className="bg-[var(--surface)] border border-[var(--border)] border-l-4 border-l-[var(--primary)] rounded-r-xl p-4 flex items-center justify-between hover:bg-[var(--surface-hover)] transition-colors active:scale-[0.99]"
    >
      <div className="min-w-0">
        <h3 className="font-semibold text-[var(--text)]">Section {section.name}</h3>
        <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
          {section.programName} · {section.gradeName}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-3">
        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <UserRound className="w-3.5 h-3.5" />
          <span>{section.studentCount}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-[var(--gold)]" />
      </div>
    </Link>
  )
}

// ── Exam card ─────────────────────────────────────────────────────────────────
const EXAM_STATUS: Record<string, { bg: string; text: string }> = {
  SCHEDULED: { bg: 'bg-blue-500/15',   text: 'text-blue-400' },
  ONGOING:   { bg: 'bg-emerald-500/15',text: 'text-emerald-400' },
  COMPLETED: { bg: 'bg-white/5',       text: 'text-[var(--text-muted)]' },
  CANCELLED: { bg: 'bg-red-500/15',    text: 'text-red-400' },
}

function ExamCard({ exam }: { exam: TeacherUpcomingExam }) {
  const style = EXAM_STATUS[exam.status] ?? EXAM_STATUS.SCHEDULED
  const date = new Date(exam.date)
  const day = date.toLocaleDateString('en-PK', { day: 'numeric' })
  const month = date.toLocaleDateString('en-PK', { month: 'short' })

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl flex overflow-hidden">
      <div className="w-16 bg-[var(--primary)] flex flex-col items-center justify-center py-3 shrink-0">
        <span className="text-[10px] font-semibold text-white/70 uppercase">{month}</span>
        <span className="text-2xl font-bold text-white leading-tight">{day}</span>
      </div>
      <div className="p-3 flex-1 flex flex-col justify-center min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm text-[var(--text)] truncate">{exam.subjectName}</h3>
          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0', style.bg, style.text)}>
            {exam.status}
          </span>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{exam.sectionName} · {exam.startTime}</p>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TeacherDashboardPage() {
  const { data, isLoading } = useTeacherDashboard()
  const user = useCurrentUser()

  const today = new Date().toLocaleDateString('en-PK', {
    weekday: 'long', month: 'long', day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-16 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg text-[var(--text)] leading-tight">Good Morning, Sir 👋</h1>
          <p className="text-xs text-[var(--gold)] font-medium">{today}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-bold shrink-0">
          {user?.fullName ? getInitials(user.fullName) : 'AT'}
        </div>
      </header>

      <div className="p-4 space-y-8">
        {/* Today's Schedule */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
            Today&apos;s Schedule
          </h2>
          {isLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="min-w-[260px] shrink-0 h-28 rounded-xl bg-[var(--surface)] border border-[var(--border)] animate-pulse" />
              ))}
            </div>
          ) : (data?.todaySchedule ?? []).length === 0 ? (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 text-center text-sm text-[var(--text-muted)]">
              No classes scheduled today
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {(data?.todaySchedule ?? []).map((slot, i) => (
                <PeriodCard key={slot.id} slot={slot} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <QuickAction href="/teacher/attendance/history" icon={ClipboardCheck} label="Mark Attendance" colorClass="bg-[var(--primary)]/15 text-[var(--primary)]" />
            <QuickAction href="/teacher/results" icon={BookMarked} label="Enter Results" colorClass="bg-[var(--gold)]/15 text-[var(--gold)]" />
            <QuickAction href="/teacher/exams" icon={FileText} label="View Exams" colorClass="bg-purple-500/15 text-purple-400" />
          </div>
        </section>

        {/* My Sections */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
            My Sections
          </h2>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-[var(--surface)] border border-[var(--border)] animate-pulse" />
              ))}
            </div>
          ) : (data?.mySections ?? []).length === 0 ? (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 text-center text-sm text-[var(--text-muted)]">
              No sections assigned
            </div>
          ) : (
            <div className="space-y-2">
              {(data?.mySections ?? []).map(section => (
                <SectionRow key={section.id} section={section} />
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Exams */}
        {(isLoading || (data?.upcomingExams ?? []).length > 0) && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
              Upcoming Exams
            </h2>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-[var(--surface)] border border-[var(--border)] animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {(data?.upcomingExams ?? []).map(exam => (
                  <ExamCard key={exam.id} exam={exam} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Recently Marked */}
        {(data?.recentAttendance ?? []).length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
              Recently Marked
            </h2>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl divide-y divide-[var(--border)]">
              {(data?.recentAttendance ?? []).map((s, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{s.sectionName}</p>
                    <p className="text-xs text-[var(--text-muted)]">{s.subjectName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">Marked</span>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {new Date(s.date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
