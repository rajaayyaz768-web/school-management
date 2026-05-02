'use client'

import { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { useCreateClassTest } from '../hooks/useExams'

interface Props {
  sectionId: string
  subjectId: string
  subjectName: string
  onSuccess: () => void
  onCancel: () => void
}

export function ClassTestForm({ sectionId, subjectId, subjectName, onSuccess, onCancel }: Props) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('08:00')
  const [durationMins, setDurationMins] = useState(45)
  const [totalMarks, setTotalMarks] = useState(20)
  const [venue, setVenue] = useState('')

  const mutation = useCreateClassTest()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(
      { sectionId, subjectId, date, startTime, durationMins, totalMarks, venue: venue || undefined },
      { onSuccess }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg bg-[var(--surface-container-lowest)] border border-[var(--border)] px-4 py-2">
        <p className="text-xs text-[var(--text-muted)]">Subject</p>
        <p className="font-medium text-sm text-[var(--text)]">{subjectName}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <Input
          label="Start Time"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
        <Input
          label="Duration (minutes)"
          type="number"
          value={durationMins}
          min={5}
          max={240}
          onChange={(e) => setDurationMins(Number(e.target.value))}
          required
        />
        <Input
          label="Total Marks"
          type="number"
          value={totalMarks}
          min={1}
          max={1000}
          onChange={(e) => setTotalMarks(Number(e.target.value))}
          required
        />
      </div>

      <Input
        label="Venue (optional)"
        value={venue}
        onChange={(e) => setVenue(e.target.value)}
        placeholder="e.g. Room 4"
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={mutation.isPending}>
          Create Test
        </Button>
      </div>
    </form>
  )
}
