'use client'

import { useState } from 'react'
import axios from '@/lib/axios'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useCampuses } from '@/features/campus/hooks/useCampus'
import { usePrograms } from '@/features/programs/hooks/usePrograms'
import {
  useSectionTimetable,
  usePeriodConfig,
  useCreateSlot,
  useUpdateSlot,
  useDeleteSlot,
  useClearTimetable,
  useUpsertPeriodConfig,
} from '@/features/timetable/hooks/useTimetable'
import { TimetableGrid } from '@/features/timetable/components/TimetableGrid'
import { CalendarDays, Settings2 } from 'lucide-react'

export default function TimetablePage() {
  const [selectedCampusId, setSelectedCampusId] = useState<string>('')
  const [selectedProgramId, setSelectedProgramId] = useState<string>('')
  const [selectedGradeId, setSelectedGradeId] = useState<string>('')
  const [selectedSectionId, setSelectedSectionId] = useState<string>('')
  const [academicYear, setAcademicYear] = useState<string>('2025-2026')
  const [sections, setSections] = useState<{ id: string; name: string }[]>([])
  const [grades, setGrades] = useState<{ id: string; name: string; displayOrder: number }[]>([])
  const [subjects, setSubjects] = useState<{ id: string; name: string; code: string }[]>([])
  const [staffList, setStaffList] = useState<{ id: string; firstName: string; lastName: string; staffCode: string }[]>([])
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [configForm, setConfigForm] = useState({ totalPeriods: 8, periodDurationMins: 45, breakAfterPeriod: 4 })

  const { data: campuses } = useCampuses()
  const { data: programs } = usePrograms(selectedCampusId)
  const { data: timetable, isLoading: timetableLoading } = useSectionTimetable(selectedSectionId, academicYear)
  const { data: periodConfig } = usePeriodConfig(selectedCampusId, selectedGradeId)
  const { mutate: saveSlot, isPending: isSaving } = useCreateSlot()
  const { mutate: editSlot } = useUpdateSlot()
  const { mutate: removeSlot } = useDeleteSlot()
  const { mutate: clearTimetable, isPending: isClearing } = useClearTimetable()
  const { mutate: savePeriodConfig } = useUpsertPeriodConfig()

  const handleCampusChange = (id: string) => {
    setSelectedCampusId(id)
    setSelectedProgramId('')
    setSelectedGradeId('')
    setSelectedSectionId('')
    setGrades([])
    setSections([])
    setSubjects([])
    setStaffList([])
  }

  const handleProgramChange = async (id: string) => {
    setSelectedProgramId(id)
    setSelectedGradeId('')
    setSelectedSectionId('')
    setSections([])
    setSubjects([])
    if (!id) { setGrades([]); return }
    try {
      const res = await axios.get('/api/v1/grades', { params: { program_id: id } })
      setGrades(res.data.data ?? [])
    } catch { setGrades([]) }
  }

  const handleGradeChange = async (id: string) => {
    setSelectedGradeId(id)
    setSelectedSectionId('')
    setSubjects([])
    if (!id) { setSections([]); return }
    try {
      const res = await axios.get('/api/v1/sections', { params: { grade_id: id } })
      setSections(res.data.data ?? [])
    } catch { setSections([]) }
  }

  const handleSectionChange = async (id: string) => {
    setSelectedSectionId(id)
    setSubjects([])
    if (!id) return
    try {
      const [subjectsRes, staffRes] = await Promise.all([
        axios.get('/api/v1/subjects/assignments', { params: { section_id: id } }),
        axios.get(`/api/v1/staff/by-campus/${selectedCampusId}`)
      ])
      const assignments = subjectsRes.data.data ?? []
      setSubjects(assignments.map((a: any) => ({ id: a.subject.id, name: a.subject.name, code: a.subject.code })))
      setStaffList(staffRes.data.data ?? [])
    } catch { setSubjects([]); setStaffList([]) }
  }

  const handleSlotSave = (data: any, existingSlotId?: string) => {
    if (existingSlotId) {
      editSlot({ id: existingSlotId, data })
    } else {
      saveSlot(data)
    }
  }

  const campusOptions = (campuses ?? []).map((c: any) => ({ value: c.id, label: c.name }))
  const programOptions = (programs ?? []).map((p: any) => ({ value: p.id, label: p.name }))
  const gradeOptions = grades.map((g) => ({ value: g.id, label: g.name }))
  const sectionOptions = sections.map((s) => ({ value: s.id, label: s.name }))

  const configFooter = (
    <>
      <Button variant="secondary" onClick={() => setShowConfigModal(false)}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={() => {
          savePeriodConfig({
            campusId: selectedCampusId,
            gradeId: selectedGradeId,
            ...configForm,
          })
          setShowConfigModal(false)
        }}
      >
        Save Configuration
      </Button>
    </>
  )

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Timetable Builder"
        breadcrumb={[
          { label: 'Home', href: '/admin/dashboard' },
          { label: 'Timetable' },
        ]}
        actions={
          <>
            <Button
              variant="secondary"
              icon={<Settings2 size={16} />}
              onClick={() => setShowConfigModal(true)}
            >
              Configure Periods
            </Button>
            <Button
              variant="danger"
              disabled={!selectedSectionId}
              onClick={() => setShowClearConfirm(true)}
            >
              Clear Timetable
            </Button>
          </>
        }
      />

      {/* Filter Bar */}
      <div
        className="rounded-xl p-5"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Select
            label="Campus"
            options={campusOptions}
            value={selectedCampusId ?? ''}
            placeholder="Select campus"
            onChange={(e) => handleCampusChange(e.target.value)}
            id="filter-campus"
          />
          <Select
            label="Program"
            options={programOptions}
            value={selectedProgramId ?? ''}
            placeholder="Select program"
            disabled={!selectedCampusId}
            onChange={(e) => handleProgramChange(e.target.value)}
            id="filter-program"
          />
          <Select
            label="Grade"
            options={gradeOptions}
            value={selectedGradeId ?? ''}
            placeholder="Select grade"
            disabled={!selectedProgramId}
            onChange={(e) => handleGradeChange(e.target.value)}
            id="filter-grade"
          />
          <Select
            label="Section"
            options={sectionOptions}
            value={selectedSectionId ?? ''}
            placeholder="Select section"
            disabled={!selectedGradeId}
            onChange={(e) => handleSectionChange(e.target.value)}
            id="filter-section"
          />
          <Input
            label="Academic Year"
            type="text"
            value={academicYear ?? ''}
            onChange={(e) => setAcademicYear(e.target.value)}
            id="filter-academic-year"
          />
        </div>
      </div>

      {/* Main Content */}
      {!selectedSectionId ? (
        <div
          className="rounded-xl"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <EmptyState
            icon={<CalendarDays size={28} style={{ color: 'var(--primary)' }} />}
            title="No Section Selected"
            description="Select a section to view and build its timetable"
          />
        </div>
      ) : (
        <div
          className="rounded-xl p-4"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <TimetableGrid
            timetable={timetable ?? null}
            periodConfig={periodConfig ?? null}
            isLoading={timetableLoading}
            subjects={subjects}
            staffList={staffList}
            onSlotSave={handleSlotSave}
            isSaving={isSaving}
            onSlotDelete={(id) => removeSlot(id)}
            academicYear={academicYear}
            sectionId={selectedSectionId}
          />
        </div>
      )}

      {/* Configure Periods Modal */}
      <Modal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        title="Configure Period Structure"
        size="sm"
        footer={configFooter}
      >
        <div className="space-y-4">
          <Input
            label="Total Periods"
            type="number"
            value={configForm.totalPeriods ?? ''}
            onChange={(e) =>
              setConfigForm((prev) => ({ ...prev, totalPeriods: Number(e.target.value) }))
            }
            id="config-total-periods"
          />
          <Input
            label="Period Duration (mins)"
            type="number"
            value={configForm.periodDurationMins ?? ''}
            onChange={(e) =>
              setConfigForm((prev) => ({ ...prev, periodDurationMins: Number(e.target.value) }))
            }
            id="config-period-duration"
          />
          <Input
            label="Break After Period"
            type="number"
            value={configForm.breakAfterPeriod ?? ''}
            onChange={(e) =>
              setConfigForm((prev) => ({ ...prev, breakAfterPeriod: Number(e.target.value) }))
            }
            id="config-break-after"
          />
        </div>
      </Modal>

      {/* Clear Timetable Confirm Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
          clearTimetable({ sectionId: selectedSectionId, academicYear })
          setShowClearConfirm(false)
        }}
        title="Clear Timetable"
        message="This will delete ALL timetable slots for this section. This cannot be undone."
        confirmText="Clear All"
        variant="danger"
        loading={isClearing}
      />
    </div>
  )
}
