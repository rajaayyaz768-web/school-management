'use client'

import { useState } from 'react'
import axios from '@/lib/axios'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useCampuses } from '@/features/campus/hooks/useCampus'
import { SectionSelectorCards } from '@/components/shared/selection/SectionSelectorCards'
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
import { Settings2, CalendarDays } from 'lucide-react'
import type { SectionCardData } from '@/components/shared/selection/types'

type Step = 'section' | 'builder'

export default function TimetablePage() {
  const [step, setStep] = useState<Step>('section')
  const [selectedSection, setSelectedSection] = useState<SectionCardData | null>(null)
  const [academicYear, setAcademicYear] = useState('2025-2026')
  const [subjects, setSubjects] = useState<{ id: string; name: string; code: string }[]>([])
  const [staffList, setStaffList] = useState<{ id: string; firstName: string; lastName: string; staffCode: string }[]>([])
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [configForm, setConfigForm] = useState({ totalPeriods: 8, periodDurationMins: 45, breakAfterPeriod: 4 })

  const { data: campuses } = useCampuses()
  const campusId = campuses?.[0]?.id ?? ''

  const sectionId = selectedSection?.id ?? ''
  const gradeId = selectedSection?.gradeId ?? ''

  const { data: timetable, isLoading: timetableLoading } = useSectionTimetable(sectionId, academicYear)
  const { data: periodConfig } = usePeriodConfig(campusId, gradeId)
  const { mutate: saveSlot, isPending: isSaving } = useCreateSlot()
  const { mutate: editSlot } = useUpdateSlot()
  const { mutate: removeSlot } = useDeleteSlot()
  const { mutate: clearTimetable, isPending: isClearing } = useClearTimetable()
  const { mutate: savePeriodConfig } = useUpsertPeriodConfig()

  const handleSectionSelect = async (section: SectionCardData) => {
    setSelectedSection(section)
    setSubjects([])
    setStaffList([])
    try {
      const [subjectsRes, staffRes] = await Promise.all([
        axios.get('/subjects/assignments', { params: { section_id: section.id } }),
        campusId ? axios.get(`/staff/by-campus/${campusId}`) : Promise.resolve({ data: { data: [] } }),
      ])
      const assignments = subjectsRes.data.data ?? []
      const seen = new Set<string>()
      setSubjects(
        assignments
          .filter((a: any) => a.subject && !seen.has(a.subject.id) && seen.add(a.subject.id))
          .map((a: any) => ({ id: a.subject.id, name: a.subject.name, code: a.subject.code }))
      )
      setStaffList(staffRes.data.data ?? [])
    } catch {
      setSubjects([])
      setStaffList([])
    }
    setStep('builder')
  }

  const handleSlotSave = (data: any, existingSlotId?: string) => {
    if (existingSlotId) {
      editSlot({ id: existingSlotId, data })
    } else {
      saveSlot(data)
    }
  }

  const configFooter = (
    <>
      <Button variant="secondary" onClick={() => setShowConfigModal(false)}>Cancel</Button>
      <Button
        variant="primary"
        onClick={() => {
          savePeriodConfig({ campusId, gradeId, ...configForm })
          setShowConfigModal(false)
        }}
      >
        Save Configuration
      </Button>
    </>
  )

  if (step === 'section' && campusId) {
    return (
      <div className="flex flex-col gap-6 p-8">
        <PageHeader
          title="Timetable Builder"
          subtitle="Select a section to view or build its timetable"
        />
        <div className="max-w-xs">
          <Input
            label="Academic Year"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          />
        </div>
        <SectionSelectorCards
          campusId={campusId}
          onSelect={handleSectionSelect}
          selectedId={selectedSection?.id}
        />
      </div>
    )
  }

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
            <Button variant="secondary" icon={<Settings2 size={16} />} onClick={() => setShowConfigModal(true)}>
              Configure Periods
            </Button>
            <Button variant="danger" disabled={!sectionId} onClick={() => setShowClearConfirm(true)}>
              Clear Timetable
            </Button>
          </>
        }
      />

      <div className="flex items-center gap-3 -mt-4">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedSection(null); setStep('section') }}>
          ← Change Section
        </Button>
        {selectedSection && <Badge variant="info">{selectedSection.name}</Badge>}
        {selectedSection?.programCode && (
          <span className="text-sm text-[var(--text-muted)]">{selectedSection.programCode}</span>
        )}
        <div className="ml-auto max-w-[180px]">
          <Input
            label=""
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="Academic Year"
          />
        </div>
      </div>

      <div
        className="rounded-xl p-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
      >
        {sectionId ? (
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
            sectionId={sectionId}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
            <CalendarDays className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">Select a section to start building.</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        title="Configure Period Structure"
        size="sm"
        footer={configFooter}
      >
        <div className="space-y-4">
          <Input label="Total Periods" type="number" value={configForm.totalPeriods} onChange={(e) => setConfigForm((p) => ({ ...p, totalPeriods: Number(e.target.value) }))} />
          <Input label="Period Duration (mins)" type="number" value={configForm.periodDurationMins} onChange={(e) => setConfigForm((p) => ({ ...p, periodDurationMins: Number(e.target.value) }))} />
          <Input label="Break After Period" type="number" value={configForm.breakAfterPeriod} onChange={(e) => setConfigForm((p) => ({ ...p, breakAfterPeriod: Number(e.target.value) }))} />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => { clearTimetable({ sectionId, academicYear }); setShowClearConfirm(false) }}
        title="Clear Timetable"
        message="This will delete ALL timetable slots for this section. This cannot be undone."
        confirmText="Clear All"
        variant="danger"
        loading={isClearing}
      />
    </div>
  )
}
