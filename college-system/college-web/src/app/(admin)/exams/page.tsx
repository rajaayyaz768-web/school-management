'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, Select, Card, Modal, ConfirmDialog, Tabs, TabPanel } from '@/components/ui'
import { Badge } from '@/components/ui/Badge'
import { CampusSelectorCards } from '@/components/shared/selection/CampusSelectorCards'
import { SectionSelectorCards } from '@/components/shared/selection/SectionSelectorCards'
import { useCampuses } from '@/features/campus/hooks/useCampus'
import { useExamTypes, useCreateExamType, useExams, useDeleteExam } from '@/features/exams/hooks/useExams'
import { ExamTable } from '@/features/exams/components/ExamTable'
import { ExamForm } from '@/features/exams/components/ExamForm'
import { ExamScheduleForm } from '@/features/exams/components/ExamScheduleForm'
import { ResultEntryTable } from '@/features/exams/components/ResultEntryTable'
import { ExamSelectorCards } from '@/features/exams/components/ExamSelectorCards'
import { Exam } from '@/features/exams/types/exams.types'
import type { SectionCardData } from '@/components/shared/selection/types'
import { Plus, CalendarDays, ClipboardList, X, Tag } from 'lucide-react'

const TABS = [
  { id: 'schedule', label: 'Exam Schedule', icon: <CalendarDays className="w-4 h-4" /> },
  { id: 'results', label: 'Enter Results', icon: <ClipboardList className="w-4 h-4" /> },
  { id: 'types', label: 'Exam Types', icon: <Tag className="w-4 h-4" /> },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'ONGOING', label: 'Ongoing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export default function ExamsPage() {
  const [activeTab, setActiveTab] = useState('schedule')

  // ── Navigation state ─────────────────────────────────────────
  const [selectedCampusId, setSelectedCampusId] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<SectionCardData | null>(null)

  // ── Content filters (type + status) ──────────────────────────
  const [filterExamTypeId, setFilterExamTypeId] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // ── Modals ───────────────────────────────────────────────────
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedExamId, setSelectedExamId] = useState('')

  // ── Exam Types tab state ─────────────────────────────────────
  const [newTypeName, setNewTypeName] = useState('')
  const [newTypeCampusId, setNewTypeCampusId] = useState('')

  // ── Data ────────────────────────────────────────────────────
  const { data: campuses } = useCampuses()
  const { data: examTypes } = useExamTypes()
  const { data: allExamTypes, refetch: refetchAllTypes } = useExamTypes(newTypeCampusId || undefined)
  const createTypeMutation = useCreateExamType()
  const { data: exams, isLoading: examsLoading } = useExams({
    sectionId: selectedSection?.id || undefined,
    examTypeId: filterExamTypeId || undefined,
    status: filterStatus || undefined,
  })

  const deleteMutation = useDeleteExam()

  const resultExams = (exams ?? []).filter(
    (e) => e.status === 'SCHEDULED' || e.status === 'ONGOING' || e.status === 'COMPLETED'
  )
  const selectedExam = resultExams.find((e) => e.id === selectedExamId) ?? null
  const hasContentFilter = !!(filterExamTypeId || filterStatus)

  const handleSectionSelect = (section: SectionCardData) => {
    setSelectedSection(section)
    setFilterExamTypeId('')
    setFilterStatus('')
    setSelectedExamId('')
  }

  const handleOpenSchedule = () => setIsScheduleOpen(true)
  const handleOpenCreate = () => { setEditingExam(undefined); setIsFormOpen(true) }
  const handleEdit = (exam: Exam) => { setEditingExam(exam); setIsFormOpen(true) }
  const handleDeleteConfirm = () => {
    if (!deleteId) return
    deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) })
  }
  const handleEnterResults = (exam: Exam) => {
    setSelectedExamId(exam.id)
    setActiveTab('results')
  }

  // ── Campus / Section selection steps ────────────────────────
  if (!selectedCampusId) {
    return (
      <div className="flex flex-col gap-6 p-8">
        <PageHeader title="Exam Management" subtitle="Select a section to view and manage exams" />
        {/* Admin has 1 campus → auto-skips immediately */}
        <CampusSelectorCards onSelect={(c) => setSelectedCampusId(c.id)} />
      </div>
    )
  }

  if (!selectedSection) {
    return (
      <div className="flex flex-col gap-6 p-8">
        <PageHeader title="Exam Management" subtitle="Select a section to view and manage exams" />
        <SectionSelectorCards
          campusId={selectedCampusId}
          onSelect={handleSectionSelect}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-8">
      <PageHeader
        title="Exam Management"
        subtitle="Schedule exams, manage exam types, and enter student results"
        actions={
          activeTab === 'schedule' ? (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleOpenSchedule} icon={<CalendarDays className="w-4 h-4" />}>
                Schedule Exam
              </Button>
              <Button onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
                Add Single Exam
              </Button>
            </div>
          ) : undefined
        }
      />
      <div className="flex items-center gap-3 mb-2 -mt-4">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedSection(null); setSelectedCampusId(null) }}>
          ← Change section
        </Button>
        <Badge variant="info">{selectedSection.name}</Badge>
        {selectedSection.programName && (
          <span className="text-sm text-[var(--text-muted)]">{selectedSection.programName}</span>
        )}
      </div>

      <Card className="flex-1 overflow-hidden mt-6 flex flex-col bg-[var(--surface)] border-[var(--border)]">
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        <div className="flex-1 overflow-auto p-6 bg-[var(--background)]">
          {/* ── Tab 1: Exam Schedule ── */}
          <TabPanel tabId="schedule" activeTab={activeTab}>
            {/* Content filters: Exam Type + Status only */}
            <div className="flex flex-wrap items-end gap-4 mb-6">
              <Select
                label="Exam Type"
                value={filterExamTypeId}
                onChange={(e) => setFilterExamTypeId(e.target.value)}
                options={[
                  { value: '', label: 'All Types' },
                  ...(examTypes ?? []).map((t) => ({ value: t.id, label: t.name })),
                ]}
              />
              <Select
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={STATUS_OPTIONS}
              />
              {hasContentFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setFilterExamTypeId(''); setFilterStatus('') }}
                  icon={<X className="w-3.5 h-3.5" />}
                  className="mb-0.5"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            <ExamTable
              exams={exams ?? []}
              isLoading={examsLoading}
              onEdit={handleEdit}
              onDelete={(id) => setDeleteId(id)}
              onEnterResults={handleEnterResults}
            />
          </TabPanel>

          {/* ── Tab 3: Exam Types ── */}
          <TabPanel tabId="types" activeTab={activeTab}>
            <div className="max-w-lg space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Create New Exam Type</h3>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Select
                      label="Campus"
                      value={newTypeCampusId}
                      onChange={(e) => setNewTypeCampusId(e.target.value)}
                      options={[
                        { value: '', label: 'Select Campus' },
                        ...(campuses ?? []).map((c) => ({ value: c.id, label: c.name })),
                      ]}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                      Type Name
                    </label>
                    <input
                      className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] px-4 py-2.5 font-body text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                      placeholder="e.g. Mid-Term, Final, Quiz"
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={() => {
                      if (!newTypeCampusId) return
                      if (!newTypeName.trim()) return
                      createTypeMutation.mutate(
                        { name: newTypeName.trim(), campusId: newTypeCampusId },
                        {
                          onSuccess: () => {
                            setNewTypeName('')
                            refetchAllTypes()
                          },
                        }
                      )
                    }}
                    loading={createTypeMutation.isPending}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {newTypeCampusId && (
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text)] mb-3">Existing Types</h3>
                  {(allExamTypes ?? []).length === 0 ? (
                    <p className="text-sm text-[var(--text-muted)]">No exam types for this campus yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {(allExamTypes ?? []).map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)]"
                        >
                          <span className="text-sm font-medium text-[var(--text)]">{t.name}</span>
                          <Tag className="w-4 h-4 text-[var(--text-muted)]" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabPanel>

          {/* ── Tab 2: Enter Results ── */}
          <TabPanel tabId="results" activeTab={activeTab}>
            <div className="space-y-6">
              {!selectedExamId ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Select an Exam
                  </p>
                  <ExamSelectorCards
                    exams={resultExams}
                    selectedId={selectedExamId || null}
                    onSelect={(exam) => setSelectedExamId(exam.id)}
                    isLoading={examsLoading}
                  />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedExamId('')}>
                      ← Change Exam
                    </Button>
                    {selectedExam && (
                      <Badge variant="success">{selectedExam.subject?.name}</Badge>
                    )}
                  </div>

                  {selectedExam && (
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4">
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        <div>
                          <span className="text-[var(--text-muted)] font-medium uppercase text-xs tracking-wide">Subject</span>
                          <p className="font-medium mt-0.5">
                            {selectedExam.subject?.name ?? '—'}{' '}
                            <span className="text-[var(--text-muted)]">({selectedExam.subject?.code ?? ''})</span>
                          </p>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)] font-medium uppercase text-xs tracking-wide">Section</span>
                          <p className="font-medium mt-0.5">{selectedExam.section?.name ?? '—'}</p>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)] font-medium uppercase text-xs tracking-wide">Date</span>
                          <p className="font-medium mt-0.5">
                            {selectedExam.date
                              ? new Date(selectedExam.date).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })
                              : '—'}
                          </p>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)] font-medium uppercase text-xs tracking-wide">Total Marks</span>
                          <p className="font-medium mt-0.5">{selectedExam.totalMarks}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <ResultEntryTable
                    examId={selectedExamId}
                    totalMarks={selectedExam?.totalMarks ?? 100}
                    isLoading={false}
                  />
                </>
              )}
            </div>
          </TabPanel>
        </div>
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingExam ? 'Edit Exam' : 'Schedule New Exam'}
        subtitle={
          editingExam
            ? 'Update exam details below'
            : 'Fill in the details to schedule a new exam'
        }
        size="lg"
      >
        <ExamForm
          exam={editingExam}
          onSuccess={() => setIsFormOpen(false)}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* Bulk Exam Schedule Modal */}
      <Modal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        title="Schedule Exam"
        subtitle="Create exams for multiple sections and subjects at once"
        size="lg"
      >
        <ExamScheduleForm
          campusId={selectedCampusId ?? ''}
          academicYear="2025-2026"
          onSuccess={() => setIsScheduleOpen(false)}
          onCancel={() => setIsScheduleOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Exam"
        message="Are you sure you want to delete this exam? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
