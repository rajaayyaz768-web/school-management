'use client'

import Link from 'next/link'
import {
  CalendarDays,
  Clock,
  BookOpen,
  Users,
  ArrowRight,
  ClipboardCheck,
  Coffee,
  UserRound,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'
import { useTeacherDashboard } from '@/features/dashboard/teacher/hooks/useTeacherDashboard'
import {
  TodayScheduleSlot,
  TeacherSection,
  TeacherUpcomingExam,
  RecentAttendanceSession,
} from '@/features/dashboard/teacher/types/teacher-dashboard.types'

// ── Helpers ───────────────────────────────────────────────────────────────

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function getPeriodState(startTime: string, endTime: string): 'past' | 'current' | 'upcoming' {
  const now = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)
  if (nowMins > end) return 'past'
  if (nowMins >= start && nowMins <= end) return 'current'
  return 'upcoming'
}

// ── Period Card ───────────────────────────────────────────────────────────

function PeriodCard({ slot }: { slot: TodayScheduleSlot }) {
  const isBreak = slot.slotType === 'BREAK'
  const state = isBreak ? 'upcoming' : getPeriodState(slot.startTime, slot.endTime)

  return (
    <div
      className={cn(
        'flex-shrink-0 w-44 rounded-[var(--radius-lg)] p-4 border transition-all duration-200',
        state === 'current' &&
          'border-[var(--gold)] bg-[var(--gold)]/10 shadow-[0_0_16px_rgba(212,168,67,0.2)]',
        state === 'past' &&
          'border-[var(--border)] bg-[var(--surface)] opacity-50',
        state === 'upcoming' &&
          'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--gold)]/50 hover:bg-[var(--gold)]/5'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={cn(
            'text-xs font-bold uppercase tracking-wider',
            state === 'current' ? 'text-[var(--gold)]' : 'text-[var(--text-muted)]'
          )}
        >
          {isBreak ? 'Break' : `Period ${slot.slotNumber}`}
        </span>
        {state === 'current' && (
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[var(--gold)] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--gold)]" />
          </span>
        )}
        {isBreak && <Coffee className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
      </div>

      <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] mb-3">
        <Clock className="w-3 h-3" />
        <span>{slot.startTime} – {slot.endTime}</span>
      </div>

      {isBreak ? (
        <p className="text-sm font-medium text-[var(--text-muted)]">Break Time</p>
      ) : (
        <>
          <p className={cn(
            'text-sm font-semibold truncate',
            state === 'current' ? 'text-[var(--text)]' : 'text-[var(--text)]'
          )}>
            {slot.subjectName ?? '—'}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{slot.sectionName}</p>
        </>
      )}
    </div>
  )
}

// ── Today's Schedule ─────────────────────────────────────────────────────

function TodayScheduleSection({
  slots,
  isLoading,
}: {
  slots: TodayScheduleSlot[]
  isLoading: boolean
}) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-[var(--text-muted)]" />
          <h3 className="text-sm font-semibold text-[var(--text)]">Today's Schedule</h3>
        </div>
        <span className="text-xs text-[var(--text-muted)]">
          {new Date().toLocaleDateString('en-PK', { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div className="p-5">
        {isLoading ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-44 h-28 rounded-[var(--radius-lg)] bg-[var(--surface)] border border-[var(--border)] animate-pulse" />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <EmptyState
            title="No classes today"
            description="You have no scheduled periods for today"
            icon={<CalendarDays className="w-8 h-8" />}
          />
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {slots.map((slot) => (
              <PeriodCard key={slot.id} slot={slot} />
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

// ── My Sections Card ─────────────────────────────────────────────────────

function MySectionsCard({
  sections,
  isLoading,
}: {
  sections: TeacherSection[]
  isLoading: boolean
}) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-[var(--border)]">
        <Users className="w-4 h-4 text-[var(--text-muted)]" />
        <h3 className="text-sm font-semibold text-[var(--text)]">My Sections</h3>
      </div>
      <div className="flex-1 p-4 space-y-2">
        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} variant="text" className="h-12" />)
        ) : sections.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-6">
            No sections assigned
          </p>
        ) : (
          sections.map((section) => (
            <div
              key={section.id}
              className="flex items-center justify-between px-3 py-2.5 rounded-[var(--radius)] bg-[var(--background)] border border-[var(--border)] hover:border-[var(--gold)]/40 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-[var(--radius)] bg-[var(--gold)]/10 border border-[var(--gold)]/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-3.5 h-3.5 text-[var(--gold)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text)] truncate">{section.name}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                    {section.programName} · {section.gradeName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  <UserRound className="w-3 h-3" />
                  <span>{section.studentCount}</span>
                </div>
                <Link
                  href="/admin/attendance/students"
                  className="flex items-center gap-1 text-xs text-[var(--text-muted)] group-hover:text-[var(--gold)] transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  Mark
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick link at bottom */}
      <div className="px-4 pb-4 border-t border-[var(--border)] pt-3">
        <Link
          href="/admin/attendance/students"
          className="flex items-center justify-center gap-2 w-full py-2 rounded-[var(--radius)] text-xs font-medium text-[var(--gold)] border border-[var(--gold)]/30 hover:bg-[var(--gold)]/10 transition-colors"
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          Mark Attendance
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </Card>
  )
}

// ── Upcoming Exams Card ───────────────────────────────────────────────────

const EXAM_STATUS_STYLES: Record<string, string> = {
  SCHEDULED: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  ONGOING: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  COMPLETED: 'bg-white/5 text-[var(--text-muted)] border-[var(--border)]',
  CANCELLED: 'bg-red-500/15 text-red-400 border-red-500/25',
}

function ExamStatusPill({ status }: { status: string }) {
  const cls = EXAM_STATUS_STYLES[status] ?? EXAM_STATUS_STYLES.SCHEDULED
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cls}`}>
      {status}
    </span>
  )
}

function UpcomingExamsCard({
  exams,
  isLoading,
}: {
  exams: TeacherUpcomingExam[]
  isLoading: boolean
}) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-[var(--border)]">
        <BookOpen className="w-4 h-4 text-[var(--text-muted)]" />
        <h3 className="text-sm font-semibold text-[var(--text)]">Upcoming Exams</h3>
        {exams.length > 0 && (
          <span className="ml-auto text-xs text-[var(--text-muted)] font-medium">{exams.length} scheduled</span>
        )}
      </div>
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} variant="text" className="h-10" />)}
          </div>
        ) : exams.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No upcoming exams"
              description="No exams scheduled in your sections"
              icon={<BookOpen className="w-8 h-8" />}
            />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-white/2">
                {['Date', 'Section', 'Subject', 'Type', 'Status'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {exams.map((exam) => (
                <tr key={exam.id} className="hover:bg-[var(--surface)] transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold text-[var(--text)]">
                      {new Date(exam.date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{exam.startTime}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text)]">{exam.sectionName}</td>
                  <td className="px-4 py-3 text-xs font-medium text-[var(--text)]">{exam.subjectName}</td>
                  <td className="px-4 py-3 text-[10px] text-[var(--text-muted)]">{exam.examTypeName}</td>
                  <td className="px-4 py-3">
                    <ExamStatusPill status={exam.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  )
}

// ── Recent Attendance Card ────────────────────────────────────────────────

function RecentAttendanceCard({
  sessions,
  isLoading,
}: {
  sessions: RecentAttendanceSession[]
  isLoading: boolean
}) {
  if (isLoading || sessions.length === 0) return null

  return (
    <Card className="flex flex-col">
      <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-[var(--border)]">
        <ClipboardCheck className="w-4 h-4 text-[var(--text-muted)]" />
        <h3 className="text-sm font-semibold text-[var(--text)]">Recently Marked</h3>
      </div>
      <ul className="divide-y divide-[var(--border)]">
        {sessions.map((s, i) => (
          <li key={i} className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="text-sm font-medium text-[var(--text)]">{s.sectionName}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{s.subjectName}</p>
            </div>
            <div className="text-right">
              <Badge variant="present" size="sm">Marked</Badge>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {new Date(s.date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function TeacherDashboardPage() {
  const { data, isLoading } = useTeacherDashboard()

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-8 gap-6">
      <PageHeader
        title="My Dashboard"
        subtitle="Your classes, sections, and upcoming exams at a glance"
        breadcrumb={[{ label: 'Home', href: '/teacher/dashboard' }, { label: 'Dashboard' }]}
      />

      {/* Today's schedule timeline */}
      <TodayScheduleSection
        slots={data?.todaySchedule ?? []}
        isLoading={isLoading}
      />

      {/* My sections + upcoming exams */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <MySectionsCard sections={data?.mySections ?? []} isLoading={isLoading} />
        <UpcomingExamsCard exams={data?.upcomingExams ?? []} isLoading={isLoading} />
      </div>

      {/* Recently marked attendance — only shown when data exists */}
      <RecentAttendanceCard
        sessions={data?.recentAttendance ?? []}
        isLoading={isLoading}
      />
    </div>
  )
}
