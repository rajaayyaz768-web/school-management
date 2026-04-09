'use client'

import { useState } from 'react'
import {
  TimetableSlot,
  CreateSlotInput,
  UpdateSlotInput,
  DayOfWeek,
  SlotType,
  ConflictCheckResult
} from '../types/timetable.types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { ConflictWarning } from './ConflictWarning'

interface SubjectOption { id: string; name: string; code: string }
interface StaffOption { id: string; firstName: string; lastName: string; staffCode: string }

interface Props {
  isOpen: boolean
  onClose: () => void
  sectionId: string
  academicYear: string
  dayOfWeek: DayOfWeek
  slotNumber: number
  startTime: string
  endTime: string
  existingSlot: TimetableSlot | null
  subjects: SubjectOption[]
  staffList: StaffOption[]
  onSave: (data: CreateSlotInput | UpdateSlotInput) => void
  isSaving: boolean
  conflict: ConflictCheckResult | null
  onConflictCheck: (staffId: string) => void
}

export function SlotModal({
  isOpen,
  onClose,
  sectionId,
  academicYear,
  dayOfWeek,
  slotNumber,
  startTime,
  endTime,
  existingSlot,
  subjects,
  staffList,
  onSave,
  isSaving,
  conflict,
  onConflictCheck,
}: Props) {
  const [slotType, setSlotType] = useState<SlotType>(existingSlot?.slotType ?? 'THEORY')
  const [subjectId, setSubjectId] = useState<string>(existingSlot?.subjectId ?? '')
  const [staffId, setStaffId] = useState<string>(existingSlot?.staffId ?? '')
  const [localStartTime, setLocalStartTime] = useState<string>(existingSlot?.startTime ?? startTime)
  const [localEndTime, setLocalEndTime] = useState<string>(existingSlot?.endTime ?? endTime)

  const isEditing = !!existingSlot
  const modalTitle = isEditing
    ? `Edit Period ${slotNumber} — ${dayOfWeek}`
    : `Add Period ${slotNumber} — ${dayOfWeek}`

  const slotTypeOptions = [
    { value: 'THEORY', label: 'Theory Class' },
    { value: 'PRACTICAL', label: 'Practical Class' },
    { value: 'BREAK', label: 'Break / Free Period' },
  ]

  const subjectOptions = subjects.map((s) => ({
    value: s.id,
    label: `${s.name} (${s.code})`,
  }))

  const staffOptions = staffList.map((st) => ({
    value: st.id,
    label: `${st.firstName} ${st.lastName}`,
  }))

  const handleStaffChange = (id: string) => {
    setStaffId(id)
    if (id) {
      onConflictCheck(id)
    }
  }

  const handleSave = () => {
    if (isEditing) {
      const data: UpdateSlotInput = {
        slotType,
        startTime: localStartTime,
        endTime: localEndTime,
        ...(slotType !== 'BREAK' && subjectId ? { subjectId } : {}),
        ...(slotType !== 'BREAK' && staffId ? { staffId } : {}),
      }
      onSave(data)
    } else {
      const data: CreateSlotInput = {
        sectionId,
        dayOfWeek,
        slotNumber,
        academicYear,
        slotType,
        startTime: localStartTime,
        endTime: localEndTime,
        ...(slotType !== 'BREAK' && subjectId ? { subjectId } : {}),
        ...(slotType !== 'BREAK' && staffId ? { staffId } : {}),
      }
      onSave(data)
    }
  }

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSave}
        loading={isSaving}
        disabled={conflict?.hasConflict === true}
      >
        Save
      </Button>
    </>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="md"
      footer={footer}
    >
      <div className="space-y-4">
        <Select
          label="Slot Type"
          options={slotTypeOptions}
          value={slotType}
          onChange={(e) => setSlotType(e.target.value as SlotType)}
        />

        <Select
          label="Subject"
          options={subjectOptions}
          value={subjectId ?? ''}
          disabled={slotType === 'BREAK'}
          placeholder="Select subject"
          onChange={(e) => setSubjectId(e.target.value)}
        />

        <Select
          label="Teacher"
          options={staffOptions}
          value={staffId ?? ''}
          disabled={slotType === 'BREAK'}
          placeholder="Select teacher"
          onChange={(e) => handleStaffChange(e.target.value)}
        />

        <ConflictWarning conflict={conflict} />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Time"
            type="time"
            value={localStartTime ?? ''}
            onChange={(e) => setLocalStartTime(e.target.value)}
          />
          <Input
            label="End Time"
            type="time"
            value={localEndTime ?? ''}
            onChange={(e) => setLocalEndTime(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  )
}

export default SlotModal
