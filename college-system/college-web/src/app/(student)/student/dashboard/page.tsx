'use client'

import {
  GraduationCap,
  CalendarCheck,
  Trophy,
  Megaphone,
  Clock,
  Coffee,
  BookOpen,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'
import { useStudentDashboard } from '@/features/dashboard/student/hooks/useStudentDashboard'
import {
  StudentInfo,
  TimetableSlot,
  AttendanceSummary,
  ExamResult,
  Announcement,
} from '@/features/dashboard/student/types/student-dashboard.types'

// ── Helpers ───────────────────────────────────────────────────────────────

function timeToMinutes(t: string): number {
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

function getGradeVariant(grade: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (grade === 'A+' || grade === 'A') return 'success'
  if (grade === 'B' || grade === 'C') return 'warning'
  if (grade === 'D') return 'neutral'
  return 'danger'
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

// ── Welcome Card ──────────────────────────────────────────────────────────

function WelcomeCard({ student, isLoading }: { student: StudentInfo | null; isLoading: boolean }) {
  if (isLoading) return <Skeleton variant="card" className="h-28" />
  if (!student) return null

  const initials = getInitials(`${student.firstName} ${student.lastName}`)
  const today = new Date().toLocaleDateString('en-PK', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--gold)]/25 bg-gradient-to-r from-[var(--gold)]/10 via-[var(--surface)] to-[var(--surface)] p-5 flex items-center gap-5">
      {/* Avatar */}
      <div className="w-14 h-14 rounded-full bg-[var(--gold)]/20 border-2 border-[var(--gold)]/40 flex items-center justify-center flex-shrink-0">
        <span className="text-lg font-bold text-[var(--gold)]">{initials}</span>
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[var(--text-muted)] font-medium mb-0.5">Welcome back</p>
        <h2 className="text-xl font-bold text-[var(--text)]">
          {student.firstName} {student.lastName}
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-0.5 truncate">
          {[student.programName, student.gradeName, student.sectionName && `Section ${student.sectionName}`]
            .filter(Boolean)
            .join(' · ')}
          {student.rollNumber && (
            <span className="ml-2 font-mono text-xs bg-white/5 px-1.5 py-0.5 rounded">
              #{student.rollNumber}
            </span>
          )}
        </p>
      </div>
      {/* Date */}
      <p className="text-xs text-[var(--text-muted)] hidden md:block flex-shrink-0">{today}</p>
    </div>
  )
}

// ── Stat Tile ─────────────────────────────────────────────────────────────

function StatTile({
  title,
  value,
  subtitle,
  icon,
  accent = 'default',
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  accent?: 'gold' | 'green' | 'red' | 'default'
}) {
  const styles = {
    gold: { card: 'border-[var(--gold)]/30 bg-[var(--gold)]/5', icon: 'bg-[var(--gold)]/10 text-[var(--gold)]', value: 'text-[var(--gold)]' },
    green: { card: 'border-emerald-500/30 bg-emerald-500/5', icon: 'bg-emerald-500/10 text-emerald-400', value: 'text-emerald-400' },
    red: { card: 'border-red-500/30 bg-red-500/5', icon: 'bg-red-500/10 text-red-400', value: 'text-red-400' },
    default: { card: 'border-[var(--border)] bg-[var(--surface)]', icon: 'bg-white/5 text-[var(--text-muted)]', value: 'text-[var(--text)]' },
  }
  const s = styles[accent]
  return (
    <div className={`rounded-[var(--radius-lg)] border p-4 flex items-start gap-3 ${s.card}`}>
      <div className={`w-9 h-9 rounded-[var(--radius)] flex items-center justify-center flex-shrink-0 mt-0.5 ${s.icon}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest truncate">{title}</p>
        <p className={`text-xl font-bold leading-tight mt-1 truncate ${s.value}`}>{value}</p>
        {subtitle && <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">{subtitle}</p>}
      </div>
    </div>
  )
}

// ── Today's Timetable ─────────────────────────────────────────────────────

function PeriodCard({ slot }: { slot: TimetableSlot }) {
  const isBreak = slot.slotType === 'BREAK'
  const state = isBreak ? 'upcoming' : getPeriodState(slot.startTime, slot.endTime)

  return (
    <div
      className={cn(
        'flex-shrink-0 w-44 rounded-[var(--radius-lg)] p-4 border transition-all duration-200',
        state === 'current' && 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_16px_rgba(16,185,129,0.15)]',
        state === 'past' && 'border-[var(--border)] bg-[var(--surface)] opacity-45',
        state === 'upcoming' && 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--gold)]/50'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={cn(
          'text-[10px] font-bold uppercase tracking-wider',
          state === 'current' ? 'text-emerald-400' : 'text-[var(--text-muted)]'
        )}>
          {isBreak ? 'Break' : `Period ${slot.slotNumber}`}
        </span>
        {state === 'current' ? (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
        ) : isBreak ? (
          <Coffee className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        ) : null}
      </div>

      <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] mb-3">
        <Clock className="w-3 h-3" />
        <span>{slot.startTime} – {slot.endTime}</span>
      </div>

      {isBreak ? (
        <p className="text-sm font-medium text-[var(--text-muted)]">Break Time</p>
      ) : (
        <>
          <p className="text-sm font-semibold text-[var(--text)] truncate">{slot.subjectName ?? '—'}</p>
          {slot.teacherName && (
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">{slot.teacherName}</p>
          )}
        </>
      )}
    </div>
  )
}

function TodayTimetableCard({ slots, isLoading }: { slots: TimetableSlot[]; isLoading: boolean }) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-[var(--text-muted)]" />
          <h3 className="text-sm font-semibold text-[var(--text)]">Today's Timetable</h3>
        </div>
        <span className="text-xs text-[var(--text-muted)]">
          {new Date().toLocaleDateString('en-PK', { weekday: 'long', month: 'short', day: 'numeric' })}
        </span>
      </div>
      <div className="p-5">
        {isLoading ? (
          <div className="flex gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-44 h-28 rounded-[var(--radius-lg)] bg-[var(--surface)] border border-[var(--border)] animate-pulse" />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <EmptyState
            title="No classes today"
            description="Your timetable shows no periods scheduled for today"
            icon={<CalendarCheck className="w-8 h-8" />}
          />
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {slots.map((slot) => (
              <PeriodCard key={slot.id} slot={slot} />
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

// ── Attendance by Subject ─────────────────────────────────────────────────

function AttendanceCard({ summary, isLoading }: { summary: AttendanceSummary; isLoading: boolean }) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-[var(--border)]">
        <CheckCircle2 className="w-4 h-4 text-[var(--text-muted)]" />
        <h3 className="text-sm font-semibold text-[var(--text)]">Attendance by Subject</h3>
        <span className="ml-auto text-xs text-[var(--text-muted)] font-medium">Last 30 days</span>
      </div>
      <div className="p-4 space-y-3">
        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} variant="text" className="h-8" />)
        ) : summary.bySubject.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-6">No attendance records yet</p>
        ) : (
          summary.bySubject.map((s) => (
            <div key={s.subjectName}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-[var(--text)] truncate flex-1 mr-3">{s.subjectName}</span>
                <span className={cn(
                  'text-xs font-bold',
                  s.pct >= 75 ? 'text-emerald-400' : 'text-red-400'
                )}>{s.pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    s.pct >= 75 ? 'bg-emerald-500' : 'bg-red-500'
                  )}
                  style={{ width: `${s.pct}%` }}
                />
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{s.presentDays}/{s.totalDays} days</p>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

// ── Recent Results ────────────────────────────────────────────────────────

function RecentResultsCard({ results, isLoading }: { results: ExamResult[]; isLoading: boolean }) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-[var(--border)]">
        <Trophy className="w-4 h-4 text-[var(--text-muted)]" />
        <h3 className="text-sm font-semibold text-[var(--text)]">Recent Results</h3>
        {results.length > 0 && (
          <span className="ml-auto text-xs text-[var(--text-muted)] font-medium">{results.length} exams</span>
        )}
      </div>
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} variant="text" className="h-10" />)}
          </div>
        ) : results.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No results yet"
              description="Your exam results will appear here"
              icon={<Trophy className="w-8 h-8" />}
            />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-white/2">
                {['Subject', 'Type', 'Marks', 'Grade'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {results.map((r) => (
                <tr key={r.id} className="hover:bg-[var(--surface)] transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-[var(--text)]">{r.subjectName}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      {new Date(r.date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-[10px] text-[var(--text-muted)]">{r.examTypeName}</td>
                  <td className="px-4 py-3 text-xs text-[var(--text)]">
                    {r.obtainedMarks} / {r.totalMarks}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getGradeVariant(r.grade)} size="sm">{r.grade}</Badge>
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

// ── Announcements ─────────────────────────────────────────────────────────

const AUDIENCE_META: Record<string, { label: string; variant: 'info' | 'success' | 'warning' | 'neutral' }> = {
  ALL: { label: 'All', variant: 'info' },
  STUDENTS: { label: 'Students', variant: 'success' },
  PARENTS: { label: 'Parents', variant: 'warning' },
  TEACHERS: { label: 'Faculty', variant: 'neutral' },
}

function AnnouncementsCard({ announcements, isLoading }: { announcements: Announcement[]; isLoading: boolean }) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-[var(--border)]">
        <Megaphone className="w-4 h-4 text-[var(--text-muted)]" />
        <h3 className="text-sm font-semibold text-[var(--text)]">Announcements</h3>
        {announcements.length > 0 && (
          <span className="ml-auto text-xs text-[var(--text-muted)] font-medium">{announcements.length} notices</span>
        )}
      </div>
      <div className="p-4 space-y-2.5">
        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} variant="text" className="h-16" />)
        ) : announcements.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-6">No announcements</p>
        ) : (
          announcements.slice(0, 5).map((ann) => {
            const meta = AUDIENCE_META[ann.audience] ?? { label: ann.audience, variant: 'neutral' as const }
            return (
              <div
                key={ann.id}
                className="flex items-start gap-3 px-4 py-3 rounded-[var(--radius)] bg-[var(--background)] border border-[var(--border)] hover:border-[var(--gold)]/30 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={meta.variant} size="sm">{meta.label}</Badge>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {new Date(ann.publishedAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[var(--text)] truncate">{ann.title}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5 line-clamp-1">{ann.content}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function StudentDashboardPage() {
  const { data, isLoading } = useStudentDashboard()

  const student = data?.student ?? null
  const summary = data?.attendanceSummary ?? { presentDays: 0, absentDays: 0, totalDays: 0, attendancePct: 0, bySubject: [] }
  const pct = summary.attendancePct

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-6 xl:p-8 gap-6">
      <PageHeader
        title="Student Portal"
        subtitle="Your classes, results and notices at a glance"
        breadcrumb={[{ label: 'Home', href: '/student/dashboard' }, { label: 'Dashboard' }]}
      />

      {/* Welcome banner */}
      <WelcomeCard student={student} isLoading={isLoading} />

      {/* 3 stat tiles */}
      <div className="grid grid-cols-3 gap-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} variant="card" className="h-24" />)
        ) : (
          <>
            <StatTile
              title="Attendance (30d)"
              value={`${pct}%`}
              subtitle={`${summary.presentDays}P / ${summary.absentDays}A days`}
              icon={<CalendarCheck className="w-4 h-4" />}
              accent={pct >= 90 ? 'green' : pct >= 75 ? 'default' : 'red'}
            />
            <StatTile
              title="Exams Taken"
              value={data?.recentResults.length ?? 0}
              subtitle="results available"
              icon={<BookOpen className="w-4 h-4" />}
              accent="gold"
            />
            <StatTile
              title="Announcements"
              value={data?.announcements.length ?? 0}
              subtitle="active notices"
              icon={<Megaphone className="w-4 h-4" />}
            />
          </>
        )}
      </div>

      {/* Today's timetable — full width horizontal scroll */}
      <TodayTimetableCard slots={data?.todayTimetable ?? []} isLoading={isLoading} />

      {/* Two column — results + announcements */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RecentResultsCard results={data?.recentResults ?? []} isLoading={isLoading} />
        <AnnouncementsCard announcements={data?.announcements ?? []} isLoading={isLoading} />
      </div>

      {/* Attendance by subject — full width at bottom */}
      <AttendanceCard summary={summary} isLoading={isLoading} />
    </div>
  )
}
