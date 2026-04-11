import { UserX, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { AbsentStaffMember } from '../types/principal-dashboard.types'

const AVATAR_COLORS = [
  'bg-rose-500/20 text-rose-400',
  'bg-orange-500/20 text-orange-400',
  'bg-purple-500/20 text-purple-400',
  'bg-blue-500/20 text-blue-400',
  'bg-amber-500/20 text-amber-400',
]

function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

interface Props {
  absentStaff: AbsentStaffMember[]
  isLoading: boolean
}

export function AbsentStaffCard({ absentStaff, isLoading }: Props) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <UserX className="w-4 h-4 text-[var(--text-muted)]" />
          <h3 className="text-sm font-semibold text-[var(--text)]">Absent Today</h3>
        </div>
        {!isLoading && absentStaff.length > 0 && (
          <Badge variant="danger">{absentStaff.length}</Badge>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="space-y-2.5">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} variant="text" className="h-12" />
            ))}
          </div>
        ) : absentStaff.length === 0 ? (
          <div className="flex items-center gap-2 py-6 px-1 text-emerald-500">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">All staff present today</span>
          </div>
        ) : (
          <ul className="space-y-2">
            {absentStaff.map((staff, idx) => {
              const initials = getInitials(staff.firstName, staff.lastName)
              const colorCls = AVATAR_COLORS[idx % AVATAR_COLORS.length]
              return (
                <li
                  key={staff.id}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-[var(--radius)] bg-[var(--background)] border border-[var(--border)] hover:border-red-500/30 transition-colors"
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${colorCls}`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text)] truncate">
                      {staff.firstName} {staff.lastName}
                    </p>
                    {staff.designation && (
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">{staff.designation}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono bg-white/5 px-2 py-0.5 rounded flex-shrink-0">
                    {staff.staffCode}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Card>
  )
}
