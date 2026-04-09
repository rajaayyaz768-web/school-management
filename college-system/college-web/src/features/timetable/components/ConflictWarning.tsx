'use client'

import { ConflictCheckResult } from '../types/timetable.types'
import { Badge } from '@/components/ui/Badge'

interface Props {
  conflict: ConflictCheckResult | null
}

export function ConflictWarning({ conflict }: Props) {
  if (!conflict || !conflict.hasConflict) return null

  return (
    <div
      className="mt-3 rounded-lg p-4"
      style={{
        border: '1px solid var(--color-danger, #EF4444)',
        background: 'rgba(239,68,68,0.04)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg" aria-hidden="true">⚠️</span>
        <span
          className="font-semibold text-sm"
          style={{ color: 'var(--color-danger, #DC2626)' }}
        >
          Teacher Conflict Detected
        </span>
      </div>
      <div className="space-y-2">
        {conflict.conflicts.map((c, index) => (
          <div key={index}>
            <Badge variant="danger">
              {c.staffName} is already assigned to {c.existingSectionName} at Period {c.slotNumber} on {c.dayOfWeek}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ConflictWarning
