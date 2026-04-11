'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, Select, Card, Modal, ConfirmDialog, Tabs, TabPanel } from '@/components/ui'
import { useCampuses } from '@/features/campus/hooks/useCampus'
import { useSections } from '@/features/sections/hooks/useSections'
import { useExamTypes, useExams, useDeleteExam } from '@/features/exams/hooks/useExams'
import { ExamTable } from '@/features/exams/components/ExamTable'
import { ExamForm } from '@/features/exams/components/ExamForm'
import { ResultEntryTable } from '@/features/exams/components/ResultEntryTable'
import { Exam } from '@/features/exams/types/exams.types'
import { Plus, CalendarDays, ClipboardList, X } from 'lucide-react'

const TABS = [
  { id: 'schedule', label: 'Exam Schedule', icon: <CalendarDays className="w-4 h-4" /> },
  { id: 'results', label: 'Enter Results', icon: <ClipboardList className="w-4 h-4" /> },
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

  // ── Tab 1 filters ───────────────────────────────────────────
  const [filterCampusId, setFilterCampusId] = useState('')
  const [filterSectionId, setFilterSectionId] = useState('')
  const [filterExamTypeId, setFilterExamTypeId] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // ── Tab 1 modals ────────────────────────────────────────────
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // ── Tab 2 state ─────────────────────────────────────────────
  const [selectedExamId, setSelectedExamId] = useState('')

  // ── Data ────────────────────────────────────────────────────
  const { data: campuses } = useCampuses()
  const { data: sections } = useSections(undefined)
  const { data: examTypes } = useExamTypes(filterCampusId || undefined)
  const { data: exams, isLoading: examsLoading } = useExams({
    sectionId: filterSectionId || undefined,
    examTypeId: filterExamTypeId || undefined,
    status: filterStatus || undefined,
  })

  const deleteMutation = useDeleteExam()

  // Exams available for result entry (SCHEDULED or ONGOING)
  const resultExams = (exams ?? []).filter(
    (e) => e.status === 'SCHEDULED' || e.status === 'ONGOING' || e.status === 'COMPLETED'
  )

  const selectedExam = resultExams.find((e) => e.id === selectedExamId) ?? null

  // Sections filtered by campus (client-side from full list)
  const filteredSections = filterCampusId
    ? (sections ?? []).filter(
        (s) => s.grade?.program?.campus?.id === filterCampusId
      )
    : (sections ?? [])

  const handleOpenCreate = () => {
    setEditingExam(undefined)
    setIsFormOpen(true)
  }

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam)
    setIsFormOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!deleteId) return
    deleteMutation.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
    })
  }

  const handleEnterResults = (exam: Exam) => {
    setSelectedExamId(exam.id)
    setActiveTab('results')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-8">
      <PageHeader
        title="Exam Management"
        subtitle="Schedule exams, manage exam types, and enter student results"
        actions={
          activeTab === 'schedule' ? (
            <Button onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
              Add Exam
            </Button>
          ) : undefined
        }
      />

      <Card className="flex-1 overflow-hidden mt-6 flex flex-col bg-[var(--surface)] border-[var(--border)]">
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        <div className="flex-1 overflow-auto p-6 bg-[var(--background)]">
          {/* ── Tab 1: Exam Schedule ── */}
          <TabPanel tabId="schedule" activeTab={activeTab}>
            <div className="flex flex-wrap items-end gap-4 mb-6">
              <Select
                label="Campus"
                value={filterCampusId ?? ''}
                onChange={(e) => {
                  setFilterCampusId(e.target.value)
                  setFilterSectionId('')
                  setFilterExamTypeId('')
                }}
                options={[
                  { value: '', label: 'All Campuses' },
                  ...(campuses ?? []).map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
              <Select
                label="Section"
                value={filterSectionId ?? ''}
                onChange={(e) => setFilterSectionId(e.target.value)}
                options={[
                  { value: '', label: 'All Sections' },
                  ...filteredSections.map((s) => ({ value: s.id, label: s.name })),
                ]}
              />
              <Select
                label="Exam Type"
                value={filterExamTypeId ?? ''}
                onChange={(e) => setFilterExamTypeId(e.target.value)}
                options={[
                  { value: '', label: 'All Types' },
                  ...(examTypes ?? []).map((t) => ({ value: t.id, label: t.name })),
                ]}
              />
              <Select
                label="Status"
                value={filterStatus ?? ''}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={STATUS_OPTIONS}
              />
              {(filterCampusId || filterSectionId || filterExamTypeId || filterStatus) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterCampusId('')
                    setFilterSectionId('')
                    setFilterExamTypeId('')
                    setFilterStatus('')
                  }}
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

          {/* ── Tab 2: Enter Results ── */}
          <TabPanel tabId="results" activeTab={activeTab}>
            <div className="space-y-6">
              {/* Exam selector */}
              <div className="max-w-lg">
                <Select
                  label="Select Exam"
                  value={selectedExamId ?? ''}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  options={[
                    { value: '', label: 'Choose an exam to enter results...' },
                    ...resultExams.map((e) => ({
                      value: e.id,
                      label: `${e.subject?.name ?? ''} — ${e.section?.name ?? ''} (${
                        e.date ? new Date(e.date).toLocaleDateString() : ''
                      })`,
                    })),
                  ]}
                />
              </div>

              {/* Exam detail card */}
              {selectedExam && (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <div>
                      <span className="text-[var(--text-muted)] font-medium uppercase text-xs tracking-wide">
                        Subject
                      </span>
                      <p className="font-medium mt-0.5">
                        {selectedExam.subject?.name ?? '—'}{' '}
                        <span className="text-[var(--text-muted)]">
                          ({selectedExam.subject?.code ?? ''})
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] font-medium uppercase text-xs tracking-wide">
                        Section
                      </span>
                      <p className="font-medium mt-0.5">{selectedExam.section?.name ?? '—'}</p>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] font-medium uppercase text-xs tracking-wide">
                        Date
                      </span>
                      <p className="font-medium mt-0.5">
                        {selectedExam.date
                          ? new Date(selectedExam.date).toLocaleDateString('en-PK', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] font-medium uppercase text-xs tracking-wide">
                        Total Marks
                      </span>
                      <p className="font-medium mt-0.5">{selectedExam.totalMarks}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Results table */}
              {selectedExamId && (
                <ResultEntryTable
                  examId={selectedExamId}
                  totalMarks={selectedExam?.totalMarks ?? 100}
                  isLoading={false}
                />
              )}

              {!selectedExamId && (
                <div className="text-center py-16 text-[var(--text-muted)]">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select an exam above to enter student results.</p>
                </div>
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
