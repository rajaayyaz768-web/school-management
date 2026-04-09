'use client'

import { Card, Badge, Button, EmptyState } from '@/components/ui'
import { AbsenceAlert } from '../types/absence-alert.types'
import { AlertTriangle, X, Clock, User } from 'lucide-react'

interface Props {
  alerts: AbsenceAlert[]
  onDismiss: (staffId: string) => void
  onClearAll: () => void
}

export function AbsenceAlertPanel({ alerts, onDismiss, onClearAll }: Props) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden shadow-[var(--shadow-md)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[var(--danger)]/10 border-b border-[var(--danger)]/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--danger)]/15 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-[var(--danger)]" />
          </div>
          <h3 className="font-display text-base font-semibold text-[var(--text)]">
            ⚠️ Absent Teacher Alerts
          </h3>
          {alerts.length > 0 && (
            <Badge variant="danger">{alerts.length}</Badge>
          )}
        </div>
        {alerts.length > 0 && (
          <Button size="sm" variant="outline" onClick={onClearAll}>
            Clear All
          </Button>
        )}
      </div>

      {/* Body */}
      <div className="bg-[var(--surface)] p-4 max-h-[500px] overflow-y-auto">
        {alerts.length === 0 ? (
          <EmptyState
            icon={<AlertTriangle className="w-7 h-7 text-[var(--text-muted)]" />}
            title="No absence alerts today"
            description="Alerts will appear here when a teacher is marked absent and has scheduled classes"
          />
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.staffId} className="p-5 border border-[var(--border)] bg-[var(--background)]">
                {/* Staff Info */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--danger)]/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-[var(--danger)]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--text)]">{alert.staffName}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="default">{alert.staffCode}</Badge>
                        {alert.designation && (
                          <span className="text-xs text-[var(--text-muted)]">{alert.designation}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {new Date(alert.date).toLocaleDateString('en-PK', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                </div>

                {/* Affected Periods */}
                {alert.affectedPeriods.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Affected Periods
                    </div>
                    {alert.affectedPeriods.map((period) => (
                      <div
                        key={`${alert.staffId}-${period.slotNumber}`}
                        className="bg-[var(--surface-alt)]/50 rounded-[var(--radius-md)] p-3 border border-[var(--border)]/50"
                      >
                        <div className="flex items-center gap-2 text-sm text-[var(--text)]">
                          <Clock className="w-3.5 h-3.5 text-[var(--primary)]" />
                          <span className="font-medium">Period {period.slotNumber}</span>
                          <span className="text-[var(--text-muted)]">—</span>
                          <span>{period.subjectName}</span>
                          <span className="text-[var(--text-muted)]">—</span>
                          <span>Section {period.sectionName}</span>
                        </div>

                        {period.freeTeachers.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] self-center mr-1">
                              Free:
                            </span>
                            {period.freeTeachers.slice(0, 6).map((teacher) => (
                              <Badge key={teacher.id} variant="success">
                                {teacher.firstName} {teacher.lastName}
                              </Badge>
                            ))}
                            {period.freeTeachers.length > 6 && (
                              <Badge variant="default">+{period.freeTeachers.length - 6} more</Badge>
                            )}
                          </div>
                        )}

                        {period.freeTeachers.length === 0 && (
                          <div className="mt-2 text-xs text-[var(--danger)]">
                            No free teachers available for this period
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Dismiss Button */}
                <div className="flex justify-end pt-2 border-t border-[var(--border)]/50">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDismiss(alert.staffId)}
                    icon={<X className="w-3.5 h-3.5" />}
                  >
                    Dismiss
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
