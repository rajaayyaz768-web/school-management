'use client'

import { useState } from 'react'
import {
  TimetableSlot,
  DayOfWeek,
  SectionTimetable,
  ConflictCheckResult,
} from '../types/timetable.types'
import { checkConflict } from '@/features/timetable/api/timetable.api'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tooltip } from '@/components/ui/Tooltip'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SlotModal } from './SlotModal'
import { Pencil, Trash2, Plus } from 'lucide-react'

interface SubjectOption { id: string; name: string; code: string }
interface StaffOption { id: string; firstName: string; lastName: string; staffCode: string }

interface Props {
  timetable: SectionTimetable | null
  periodConfig: { totalPeriods: number; periodDurationMins: number; breakAfterPeriod: number } | null
  isLoading: boolean
  subjects: SubjectOption[]
  staffList: StaffOption[]
  onSlotSave: (data: any, existingSlotId?: string) => void
  isSaving: boolean
  onSlotDelete: (id: string) => void
  academicYear: string
  sectionId: string
}

const DAYS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

export function TimetableGrid({
  timetable,
  periodConfig,
  isLoading,
  subjects,
  staffList,
  onSlotSave,
  isSaving,
  onSlotDelete,
  academicYear,
  sectionId,
}: Props) {
  const [selectedCell, setSelectedCell] = useState<{ day: DayOfWeek; period: number } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null)
  const [conflict, setConflict] = useState<ConflictCheckResult | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const totalPeriods = periodConfig?.totalPeriods ?? 8

  const handleConflictCheck = async (staffId: string) => {
    if (!selectedCell || !staffId) { setConflict(null); return }
    try {
      const result = await checkConflict(
        staffId,
        selectedCell.day,
        selectedCell.period,
        academicYear,
        sectionId
      )
      setConflict(result)
    } catch { setConflict(null) }
  }

  const handleAddClick = (day: DayOfWeek, period: number) => {
    setSelectedCell({ day, period })
    setEditingSlot(null)
    setConflict(null)
    setIsModalOpen(true)
  }

  const handleEditClick = (slot: TimetableSlot) => {
    setSelectedCell({ day: slot.dayOfWeek, period: slot.slotNumber })
    setEditingSlot(slot)
    setConflict(null)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingSlot(null)
    setSelectedCell(null)
    setConflict(null)
  }

  const handleModalSave = (data: any) => {
    if (editingSlot) {
      onSlotSave(data, editingSlot.id)
    } else {
      onSlotSave({
        ...data,
        sectionId,
        dayOfWeek: selectedCell!.day,
        slotNumber: selectedCell!.period,
        academicYear,
      })
    }
    handleModalClose()
  }

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      onSlotDelete(deleteConfirmId)
      setDeleteConfirmId(null)
    }
  }

  const getSlotBadgeVariant = (slotType: string) => {
    if (slotType === 'THEORY') return 'info' as const
    if (slotType === 'PRACTICAL') return 'warning' as const
    return 'neutral' as const
  }

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse"
          style={{ minWidth: `${(totalPeriods + 1) * 120}px` }}
        >
          <thead>
            <tr>
              <th
                className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-tl-lg"
                style={{
                  background: 'var(--primary)',
                  color: '#fff',
                  minWidth: '80px',
                }}
              >
                Day / Period
              </th>
              {Array.from({ length: totalPeriods }).map((_, i) => (
                <th
                  key={i}
                  className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-center"
                  style={{ background: 'var(--primary)', color: '#fff', minWidth: '120px' }}
                >
                  P{i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, rowIdx) => (
              <tr
                key={day}
                style={{
                  background: rowIdx % 2 === 0 ? 'var(--surface)' : 'var(--surface-alt, var(--bg-secondary))',
                }}
              >
                <td
                  className="px-4 py-3 font-semibold text-xs uppercase tracking-wider"
                  style={{ color: 'var(--primary)', minWidth: '80px' }}
                >
                  {day}
                </td>
                {Array.from({ length: totalPeriods }).map((_, colIdx) => (
                  <td key={colIdx} className="px-2 py-2" style={{ minWidth: '120px' }}>
                    <Skeleton variant="text" lines={2} className="w-full h-16" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <table
          className="w-full border-collapse"
          style={{ minWidth: `${(totalPeriods + 1) * 120}px` }}
        >
          <thead>
            <tr>
              <th
                className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-tl-lg"
                style={{
                  background: 'var(--primary)',
                  color: '#fff',
                  minWidth: '80px',
                }}
              >
                Day / Period
              </th>
              {Array.from({ length: totalPeriods }).map((_, i) => (
                <th
                  key={i}
                  className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-center"
                  style={{
                    background: 'var(--primary)',
                    color: '#fff',
                    minWidth: '130px',
                  }}
                >
                  P{i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, rowIdx) => (
              <tr
                key={day}
                style={{
                  background: rowIdx % 2 === 0 ? 'var(--surface)' : 'var(--bg-secondary)',
                }}
              >
                <td
                  className="px-4 py-3 font-bold text-xs uppercase tracking-wider border-r"
                  style={{
                    color: 'var(--primary)',
                    borderColor: 'var(--border)',
                    minWidth: '80px',
                  }}
                >
                  {day}
                </td>
                {Array.from({ length: totalPeriods }).map((_, colIdx) => {
                  const period = colIdx + 1
                  const slot = timetable?.slots.find(
                    (s) => s.dayOfWeek === day && s.slotNumber === period
                  )

                  return (
                    <td
                      key={period}
                      className="px-2 py-2 border-r last:border-r-0"
                      style={{
                        borderColor: 'var(--border)',
                        minWidth: '130px',
                        height: '80px',
                        verticalAlign: 'top',
                      }}
                    >
                      {slot ? (
                        <div
                          className="group relative h-full rounded-lg p-2 transition-all duration-150"
                          style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                            minHeight: '68px',
                          }}
                        >
                          <div className="flex flex-col gap-1">
                            <span
                              className="font-semibold text-xs leading-tight truncate"
                              style={{ color: 'var(--text)' }}
                            >
                              {slot.slotType === 'BREAK' ? 'Break' : (slot.subject?.name ?? '—')}
                            </span>
                            {slot.staff && slot.slotType !== 'BREAK' && (
                              <span
                                className="text-xs truncate"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                {slot.staff.firstName} {slot.staff.lastName}
                              </span>
                            )}
                            <Badge variant={getSlotBadgeVariant(slot.slotType)} size="sm">
                              {slot.slotType}
                            </Badge>
                          </div>

                          {/* Hover action buttons */}
                          <div
                            className="absolute top-1 right-1 items-center gap-1 hidden group-hover:flex"
                          >
                            <Tooltip content="Edit slot" position="top">
                              <button
                                onClick={() => handleEditClick(slot)}
                                className="p-1 rounded transition-colors"
                                style={{ color: 'var(--primary)', background: 'var(--surface)' }}
                                aria-label="Edit slot"
                              >
                                <Pencil size={12} />
                              </button>
                            </Tooltip>
                            <Tooltip content="Delete slot" position="top">
                              <button
                                onClick={() => setDeleteConfirmId(slot.id)}
                                className="p-1 rounded transition-colors"
                                style={{ color: 'var(--danger, #EF4444)', background: 'var(--surface)' }}
                                aria-label="Delete slot"
                              >
                                <Trash2 size={12} />
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddClick(day, period)}
                          className="w-full h-full flex items-center justify-center rounded-lg transition-all duration-150 group/add"
                          style={{
                            minHeight: '68px',
                            border: '1.5px dashed var(--border)',
                            color: 'var(--text-muted)',
                          }}
                          aria-label={`Add slot for ${day} Period ${period}`}
                        >
                          <Plus
                            size={18}
                            className="group-hover/add:scale-110 transition-transform"
                            style={{ color: 'var(--primary)' }}
                          />
                        </button>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slot Modal */}
      {selectedCell && (
        <SlotModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          sectionId={sectionId}
          academicYear={academicYear}
          dayOfWeek={selectedCell.day}
          slotNumber={selectedCell.period}
          startTime=""
          endTime=""
          existingSlot={editingSlot}
          subjects={subjects}
          staffList={staffList}
          onSave={handleModalSave}
          isSaving={isSaving}
          conflict={conflict}
          onConflictCheck={handleConflictCheck}
        />
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Slot"
        message="Delete this timetable slot?"
        confirmText="Delete"
        variant="danger"
      />
    </>
  )
}

export default TimetableGrid
