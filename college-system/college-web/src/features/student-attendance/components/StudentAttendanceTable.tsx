import { MessageCircle } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/ui'
import { StudentWithAttendance, AttendanceStatus, SingleStudentAttendanceInput } from '../types/student-attendance.types'
import { sendAbsentWhatsApp } from '@/lib/whatsapp'

interface Props {
  studentList: StudentWithAttendance[]
  isLoading: boolean
  pendingAttendances: Record<string, SingleStudentAttendanceInput>
  onStatusChange: (studentId: string, status: AttendanceStatus) => void
  onRemarksChange: (studentId: string, remarks: string) => void
  subjectName?: string
  sectionName?: string
  campusName?: string
  date?: string
}

const AVATAR_COLORS = [
  'bg-[var(--primary)]',
  'bg-[var(--gold)]',
  'bg-purple-600',
  'bg-blue-600',
  'bg-rose-600',
  'bg-emerald-600',
]

function getInitials(first: string, last: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase()
}

const STATUS_BTNS: { key: AttendanceStatus; label: string; activeClass: string }[] = [
  { key: 'PRESENT', label: 'P',  activeClass: 'bg-[var(--primary)] text-white' },
  { key: 'ABSENT',  label: 'A',  activeClass: 'bg-red-500 text-white' },
  { key: 'LATE',    label: 'L',  activeClass: 'bg-amber-500 text-white' },
  { key: 'LEAVE',   label: 'OL', activeClass: 'bg-blue-500 text-white' },
]

export function StudentAttendanceTable({
  studentList,
  isLoading,
  pendingAttendances,
  onStatusChange,
  onRemarksChange,
  subjectName = '',
  sectionName = '',
  campusName = '',
  date = new Date().toISOString().split('T')[0],
}: Props) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-[72px] rounded-xl bg-[var(--surface)] border border-[var(--border)] animate-pulse" />
        ))}
      </div>
    )
  }

  if (studentList.length === 0) {
    return (
      <p className="text-center text-sm text-[var(--text-muted)] py-8">
        No students found in this section.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {studentList.map(({ student, attendance }, i) => {
        const current = pendingAttendances[student.id]?.status ?? attendance?.status ?? 'PRESENT'
        const isAbsent = current === 'ABSENT'
        const hasPhone = !!student.parentPhone

        return (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-[var(--space-3)] flex flex-col sm:flex-row sm:items-center justify-between gap-[var(--space-3)] min-h-[72px]"
          >
            {/* Left: avatar + info */}
            <div className="flex items-center gap-[var(--space-3)] min-w-0">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0',
                AVATAR_COLORS[i % AVATAR_COLORS.length]
              )}>
                {getInitials(student.firstName, student.lastName)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[var(--text)] truncate">
                  {student.firstName} {student.lastName}
                </p>
                {student.rollNumber && (
                  <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">{student.rollNumber}</p>
                )}
              </div>
            </div>

            {/* Right: status toggles + WA button for absent */}
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <div className="flex bg-[var(--bg)] rounded-lg p-1 border border-[var(--border)]">
                {STATUS_BTNS.map(btn => (
                  <button
                    key={btn.key}
                    onClick={() => onStatusChange(student.id, btn.key)}
                    className={cn(
                      'w-10 h-10 rounded-md font-bold text-sm flex items-center justify-center transition-colors',
                      current === btn.key
                        ? btn.activeClass
                        : 'text-[var(--text-muted)] hover:bg-[var(--surface)]'
                    )}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {isAbsent && hasPhone && (
                <Tooltip content="Notify parent via WhatsApp">
                  <button
                    onClick={() => sendAbsentWhatsApp({
                      phone: student.parentPhone!,
                      studentName: `${student.firstName} ${student.lastName}`,
                      className: sectionName,
                      subjectName,
                      campusName,
                      date,
                    })}
                    className="w-10 h-10 rounded-lg flex items-center justify-center border border-green-300 text-green-600 hover:bg-green-50 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </Tooltip>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
