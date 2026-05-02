'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Button, Input, Select } from '@/components/ui'
import { useExamTypes, useCreateExamSchedule } from '../hooks/useExams'
import { useSections } from '@/features/sections/hooks/useSections'
import { useSubjectsByGrade } from '@/features/programs/hooks/usePrograms'
import type { Section } from '@/features/sections/types/sections.types'

interface Props {
  campusId: string
  academicYear: string
  onSuccess: () => void
  onCancel: () => void
}

interface SubjectMark {
  subjectId: string
  totalMarks: number
  durationMins: number
}

interface SectionConfig {
  sectionId: string
  subjects: SubjectMark[]
}

const chipBase = 'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer'
const chipActive = 'bg-[var(--primary)] text-white border-[var(--primary)]'
const chipInactive = 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary)]'

export function ExamScheduleForm({ campusId, academicYear, onSuccess, onCancel }: Props) {
  const [examTypeId, setExamTypeId] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([])
  const [sectionConfigs, setSectionConfigs] = useState<Record<string, SectionConfig>>({})
  const [defaultMarks, setDefaultMarks] = useState(100)
  const [defaultDuration, setDefaultDuration] = useState(180)

  const { data: examTypes = [] } = useExamTypes(campusId)
  const { data: allSections = [] } = useSections(undefined, campusId)
  const mutation = useCreateExamSchedule()

  // Group sections by grade for display
  const sectionsByGrade = allSections.reduce<Record<string, { gradeName: string; sections: Section[] }>>(
    (acc, s) => {
      const gradeId = s.grade?.id ?? 'unknown'
      if (!acc[gradeId]) acc[gradeId] = { gradeName: s.grade?.name ?? 'Unknown', sections: [] }
      acc[gradeId].sections.push(s)
      return acc
    },
    {}
  )

  const toggleSection = (sectionId: string) => {
    setSelectedSectionIds((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    )
  }

  const getConfig = (sectionId: string): SectionConfig =>
    sectionConfigs[sectionId] ?? { sectionId, subjects: [] }

  const setSubjectMark = (sectionId: string, subjectId: string, field: 'totalMarks' | 'durationMins', value: number) => {
    setSectionConfigs((prev) => {
      const cfg = prev[sectionId] ?? { sectionId, subjects: [] }
      const existing = cfg.subjects.find((s) => s.subjectId === subjectId)
      const updated = existing
        ? cfg.subjects.map((s) => (s.subjectId === subjectId ? { ...s, [field]: value } : s))
        : [...cfg.subjects, { subjectId, totalMarks: defaultMarks, durationMins: defaultDuration, [field]: value }]
      return { ...prev, [sectionId]: { ...cfg, subjects: updated } }
    })
  }

  const applyDefaultsToAll = () => {
    const updated: Record<string, SectionConfig> = {}
    for (const sectionId of selectedSectionIds) {
      const cfg = sectionConfigs[sectionId] ?? { sectionId, subjects: [] }
      updated[sectionId] = {
        ...cfg,
        subjects: cfg.subjects.map((s) => ({ ...s, totalMarks: defaultMarks, durationMins: defaultDuration })),
      }
    }
    setSectionConfigs((prev) => ({ ...prev, ...updated }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!examTypeId || !date || selectedSectionIds.length === 0) return

    const sections = selectedSectionIds
      .map((sectionId) => {
        const cfg = sectionConfigs[sectionId]
        return { sectionId, subjects: cfg?.subjects ?? [] }
      })
      .filter((s) => s.subjects.length > 0)

    if (sections.length === 0) return

    mutation.mutate(
      { examTypeId, campusId, academicYear, date, startTime, sections },
      { onSuccess }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
      {/* Basic fields */}
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Exam Type"
          value={examTypeId}
          onChange={(e) => setExamTypeId(e.target.value)}
          options={examTypes.map((t) => ({ label: t.name, value: t.id }))}
          placeholder="Select type"
          required
        />
        <Input label="Academic Year" value={academicYear} readOnly disabled />
        <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <Input label="Start Time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
      </div>

      {/* Default marks bar */}
      <div className="flex items-end gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-container-lowest)]">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Default Marks</p>
          <input
            type="number" min={1} max={1000} value={defaultMarks}
            onChange={(e) => setDefaultMarks(Number(e.target.value))}
            className="w-full text-sm border border-[var(--border)] rounded-md px-3 py-1.5 bg-[var(--surface)] text-[var(--text)]"
          />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Default Duration (min)</p>
          <input
            type="number" min={5} max={300} value={defaultDuration}
            onChange={(e) => setDefaultDuration(Number(e.target.value))}
            className="w-full text-sm border border-[var(--border)] rounded-md px-3 py-1.5 bg-[var(--surface)] text-[var(--text)]"
          />
        </div>
        <button
          type="button" onClick={applyDefaultsToAll}
          className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[var(--primary)] text-white hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          Apply to All
        </button>
      </div>

      {/* Section selection */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
          Select Sections ({selectedSectionIds.length} selected)
        </p>
        <div className="space-y-3">
          {Object.entries(sectionsByGrade).map(([gradeId, { gradeName, sections }]) => (
            <div key={gradeId}>
              <p className="text-xs text-[var(--text-muted)] mb-1.5">{gradeName}</p>
              <div className="flex flex-wrap gap-2">
                {sections.map((s) => (
                  <button
                    key={s.id} type="button"
                    onClick={() => toggleSection(s.id)}
                    className={`${chipBase} ${selectedSectionIds.includes(s.id) ? chipActive : chipInactive}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-section subject config */}
      {selectedSectionIds.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Configure Subjects & Marks</p>
          {selectedSectionIds.map((sectionId) => {
            const section = allSections.find((s) => s.id === sectionId)
            return section ? (
              <SectionSubjectConfig
                key={sectionId}
                section={section}
                config={getConfig(sectionId)}
                defaultMarks={defaultMarks}
                defaultDuration={defaultDuration}
                onSubjectMark={setSubjectMark}
              />
            ) : null
          })}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={mutation.isPending}>Cancel</Button>
        <Button
          type="submit" variant="primary" loading={mutation.isPending}
          disabled={!examTypeId || !date || selectedSectionIds.length === 0}
        >
          Create Schedule
        </Button>
      </div>
    </form>
  )
}

function SectionSubjectConfig({
  section, config, defaultMarks, defaultDuration, onSubjectMark,
}: {
  section: Section
  config: SectionConfig
  defaultMarks: number
  defaultDuration: number
  onSubjectMark: (sectionId: string, subjectId: string, field: 'totalMarks' | 'durationMins', value: number) => void
}) {
  const gradeId = section.grade?.id ?? ''
  const { data: subjects = [] } = useSubjectsByGrade(gradeId)
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjectIds((prev) => {
      const next = prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
      if (!prev.includes(subjectId)) {
        onSubjectMark(section.id, subjectId, 'totalMarks', defaultMarks)
        onSubjectMark(section.id, subjectId, 'durationMins', defaultDuration)
      }
      return next
    })
  }

  const getSubjectConfig = (subjectId: string) =>
    config.subjects.find((s) => s.subjectId === subjectId) ?? { totalMarks: defaultMarks, durationMins: defaultDuration }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-[var(--border)] rounded-[var(--radius-card-sm)] p-3"
    >
      <p className="text-sm font-medium text-[var(--text)] mb-2">
        Section {section.name}
        <span className="ml-2 text-xs text-[var(--text-muted)]">{section.grade?.name}</span>
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        {subjects.map((sub) => (
          <button
            key={sub.id} type="button"
            onClick={() => toggleSubject(sub.id)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              selectedSubjectIds.includes(sub.id) ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary)]'
            }`}
          >
            {sub.name}
          </button>
        ))}
      </div>
      {selectedSubjectIds.length > 0 && (
        <div className="space-y-2">
          {selectedSubjectIds.map((subjectId) => {
            const sub = subjects.find((s) => s.id === subjectId)
            const cfg = getSubjectConfig(subjectId)
            return (
              <div key={subjectId} className="flex items-center gap-2 text-xs">
                <span className="w-24 truncate text-[var(--text)]">{sub?.name}</span>
                <input
                  type="number" min={1} max={1000} value={cfg.totalMarks}
                  onChange={(e) => onSubjectMark(section.id, subjectId, 'totalMarks', Number(e.target.value))}
                  className="w-20 border border-[var(--border)] rounded px-2 py-1 text-xs bg-[var(--surface)] text-[var(--text)]"
                  placeholder="Marks"
                />
                <span className="text-[var(--text-muted)]">marks</span>
                <input
                  type="number" min={5} max={300} value={cfg.durationMins}
                  onChange={(e) => onSubjectMark(section.id, subjectId, 'durationMins', Number(e.target.value))}
                  className="w-20 border border-[var(--border)] rounded px-2 py-1 text-xs bg-[var(--surface)] text-[var(--text)]"
                  placeholder="Mins"
                />
                <span className="text-[var(--text-muted)]">min</span>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
