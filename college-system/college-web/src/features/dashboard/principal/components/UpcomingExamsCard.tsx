import { CalendarDays } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { UpcomingExam } from '../types/principal-dashboard.types'

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  ONGOING: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  COMPLETED: 'bg-white/5 text-[var(--text-muted)] border-[var(--border)]',
  CANCELLED: 'bg-red-500/15 text-red-400 border-red-500/25',
}

function ExamStatusPill({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? STATUS_STYLES.SCHEDULED
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cls}`}>
      {status}
    </span>
  )
}

interface Props {
  exams: UpcomingExam[]
  isLoading: boolean
}

export function UpcomingExamsCard({ exams, isLoading }: Props) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-[var(--border)]">
        <CalendarDays className="w-4 h-4 text-[var(--text-muted)]" />
        <h3 className="text-sm font-semibold text-[var(--text)]">Upcoming Exams</h3>
        {exams.length > 0 && (
          <span className="ml-auto text-xs text-[var(--text-muted)] font-medium">{exams.length} scheduled</span>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="text" className="h-10" />
            ))}
          </div>
        ) : exams.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No upcoming exams"
              description="No exams are scheduled in the near future"
              icon={<CalendarDays className="w-8 h-8" />}
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
                      {new Date(exam.date).toLocaleDateString('en-PK', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{exam.startTime}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text)]">{exam.sectionName}</td>
                  <td className="px-4 py-3 text-xs font-medium text-[var(--text)]">{exam.subjectName}</td>
                  <td className="px-4 py-3 text-[10px] text-[var(--text-muted)]">{exam.examTypeName}</td>
                  <td className="px-4 py-3">
                    {exam.status && <ExamStatusPill status={exam.status} />}
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
