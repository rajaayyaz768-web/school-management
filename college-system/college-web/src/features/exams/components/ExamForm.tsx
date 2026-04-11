'use client'

import { useState, useEffect } from 'react'
import { Button, Select, Input, DatePicker } from '@/components/ui'
import { useCampuses } from '@/features/campus/hooks/useCampus'
import { usePrograms } from '@/features/programs/hooks/usePrograms'
import { useProgramGrades, useSections } from '@/features/sections/hooks/useSections'
import { useAssignmentsBySection } from '@/features/subjects/hooks/useSubjects'
import { useExamTypes, useCreateExam, useUpdateExam } from '../hooks/useExams'
import { Exam, CreateExamInput, UpdateExamInput } from '../types/exams.types'

interface Props {
  exam?: Exam
  onSuccess: () => void
  onCancel: () => void
}

export function ExamForm({ exam, onSuccess, onCancel }: Props) {
  const isEdit = !!exam

  // Cascade state
  const [campusId, setCampusId] = useState('')
  const [programId, setProgramId] = useState('')
  const [gradeId, setGradeId] = useState('')
  const [sectionId, setSectionId] = useState(exam?.sectionId ?? '')
  const [subjectId, setSubjectId] = useState(exam?.subjectId ?? '')
  const [examTypeId, setExamTypeId] = useState(exam?.examTypeId ?? '')

  // Form fields
  const [date, setDate] = useState(exam?.date?.split('T')[0] ?? '')
  const [startTime, setStartTime] = useState(exam?.startTime ?? '')
  const [durationMins, setDurationMins] = useState<number>(exam?.durationMins ?? 180)
  const [totalMarks, setTotalMarks] = useState<number>(exam?.totalMarks ?? 100)
  const [venue, setVenue] = useState(exam?.venue ?? '')

  // Cascade data
  const { data: campuses } = useCampuses()
  const { data: programs } = usePrograms(campusId || undefined)
  const { data: grades } = useProgramGrades(programId || undefined)
  const { data: sections } = useSections(gradeId || undefined)
  const { data: assignments } = useAssignmentsBySection(sectionId)
  const { data: examTypes } = useExamTypes(campusId || undefined)

  const createMutation = useCreateExam()
  const updateMutation = useUpdateExam()

  const isPending = createMutation.isPending || updateMutation.isPending

  // When editing, try to pre-fill cascade from section's grade/program/campus
  useEffect(() => {
    if (isEdit && exam) {
      setSectionId(exam.sectionId)
      setSubjectId(exam.subjectId)
      setExamTypeId(exam.examTypeId)
      setDate(exam.date?.split('T')[0] ?? '')
      setStartTime(exam.startTime ?? '')
      setDurationMins(exam.durationMins)
      setTotalMarks(exam.totalMarks)
      setVenue(exam.venue ?? '')
    }
  }, [isEdit, exam])

  // Reset downstream when campus changes
  const handleCampusChange = (val: string) => {
    setCampusId(val)
    setProgramId('')
    setGradeId('')
    setSectionId('')
    setSubjectId('')
    setExamTypeId('')
  }

  const handleProgramChange = (val: string) => {
    setProgramId(val)
    setGradeId('')
    setSectionId('')
    setSubjectId('')
  }

  const handleGradeChange = (val: string) => {
    setGradeId(val)
    setSectionId('')
    setSubjectId('')
  }

  const handleSectionChange = (val: string) => {
    setSectionId(val)
    setSubjectId('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isEdit && exam) {
      const data: UpdateExamInput = {}
      if (date) data.date = date
      if (startTime) data.startTime = startTime
      data.durationMins = durationMins
      data.totalMarks = totalMarks
      if (venue) data.venue = venue
      updateMutation.mutate({ id: exam.id, data }, { onSuccess })
    } else {
      const data: CreateExamInput = {
        examTypeId,
        sectionId,
        subjectId,
        date,
        startTime,
        durationMins,
        totalMarks,
        venue: venue || undefined,
      }
      createMutation.mutate(data, { onSuccess })
    }
  }

  const campusOptions = [
    { value: '', label: 'Select Campus' },
    ...(campuses ?? []).map((c) => ({ value: c.id, label: c.name })),
  ]

  const programOptions = [
    { value: '', label: campusId ? 'Select Program' : 'Select campus first' },
    ...(programs ?? []).map((p) => ({ value: p.id, label: p.name })),
  ]

  const gradeOptions = [
    { value: '', label: programId ? 'Select Grade' : 'Select program first' },
    ...(grades ?? []).map((g) => ({ value: g.id, label: g.name })),
  ]

  const sectionOptions = [
    { value: '', label: gradeId ? 'Select Section' : 'Select grade first' },
    ...(sections ?? []).map((s) => ({ value: s.id, label: s.name })),
  ]

  const subjectOptions = [
    { value: '', label: sectionId ? 'Select Subject' : 'Select section first' },
    ...(assignments ?? []).map((a) => ({
      value: a.subjectId,
      label: a.subject ? `${a.subject.name} (${a.subject.code})` : a.subjectId,
    })),
  ]

  const examTypeOptions = [
    { value: '', label: 'Select Exam Type' },
    ...(examTypes ?? []).map((t) => ({ value: t.id, label: t.name })),
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Row 1: Campus + Program */}
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Campus"
          value={campusId ?? ''}
          onChange={(e) => handleCampusChange(e.target.value)}
          options={campusOptions}
          placeholder="Select Campus"
          disabled={isEdit}
        />
        <Select
          label="Program"
          value={programId ?? ''}
          onChange={(e) => handleProgramChange(e.target.value)}
          options={programOptions}
          disabled={!campusId || isEdit}
        />
      </div>

      {/* Row 2: Grade + Section */}
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Grade"
          value={gradeId ?? ''}
          onChange={(e) => handleGradeChange(e.target.value)}
          options={gradeOptions}
          disabled={!programId || isEdit}
        />
        <Select
          label="Section"
          value={sectionId ?? ''}
          onChange={(e) => handleSectionChange(e.target.value)}
          options={sectionOptions}
          disabled={!gradeId || isEdit}
          required
        />
      </div>

      {/* Row 3: Exam Type + Subject */}
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Exam Type"
          value={examTypeId ?? ''}
          onChange={(e) => setExamTypeId(e.target.value)}
          options={examTypeOptions}
          placeholder="Select Exam Type"
          required
        />
        <Select
          label="Subject"
          value={subjectId ?? ''}
          onChange={(e) => setSubjectId(e.target.value)}
          options={subjectOptions}
          disabled={!sectionId || isEdit}
          required
        />
      </div>

      {/* Row 4: Date + Start Time */}
      <div className="grid grid-cols-2 gap-4">
        <DatePicker
          label="Date"
          value={date ?? ''}
          onChange={(val) => setDate(val)}
          required
        />
        <Input
          label="Start Time"
          type="time"
          value={startTime ?? ''}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </div>

      {/* Row 5: Duration + Total Marks */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Duration (minutes)"
          type="number"
          min={15}
          max={480}
          value={durationMins ?? ''}
          onChange={(e) => setDurationMins(Number(e.target.value))}
          required
        />
        <Input
          label="Total Marks"
          type="number"
          min={1}
          max={1000}
          value={totalMarks ?? ''}
          onChange={(e) => setTotalMarks(Number(e.target.value))}
          required
        />
      </div>

      {/* Row 6: Venue (full width) */}
      <Input
        label="Venue (optional)"
        type="text"
        value={venue ?? ''}
        onChange={(e) => setVenue(e.target.value)}
        placeholder="e.g. Examination Hall A"
      />

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" loading={isPending}>
          {isEdit ? 'Update Exam' : 'Schedule Exam'}
        </Button>
      </div>
    </form>
  )
}
