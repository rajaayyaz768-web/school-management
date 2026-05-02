'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Printer, X, FileText } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionSelectorCards } from '@/components/shared/selection/SectionSelectorCards'
import { useExamTypes } from '@/features/exams/hooks/useExams'
import { useSectionStudentList, useExamReportCard } from '@/features/results/hooks/useResults'
import { ExamReportCard } from '@/features/results/components/ExamReportCard'
import type { SectionCardData } from '@/components/shared/selection/types'
import { useCampusStore } from '@/store/campusStore'
import { useRole } from '@/store/authStore'

const chipBase = 'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer'
const chipActive = 'bg-[var(--primary)] text-white border-[var(--primary)]'
const chipInactive = 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary)]'

function handlePrintReportCard() {
  const style = document.createElement('style')
  style.id = 'report-card-print'
  style.textContent = `
    @media print {
      @page { size: A4 portrait; margin: 0; }
      body * { visibility: hidden !important; }
      #exam-report-card, #exam-report-card * { visibility: visible !important; }
      #exam-report-card { position: fixed; top: 0; left: 0; width: 100vw; }
    }
  `
  document.head.appendChild(style)
  window.onafterprint = () => {
    document.getElementById('report-card-print')?.remove()
    window.onafterprint = null
  }
  window.print()
}

export default function AdminResultsPage() {
  const role = useRole()
  const { activeCampusId } = useCampusStore()
  const campusId = role === 'SUPER_ADMIN' ? (activeCampusId ?? undefined) : undefined

  const [selectedSection, setSelectedSection] = useState<SectionCardData | null>(null)
  const [selectedExamTypeId, setSelectedExamTypeId] = useState<string | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [showCard, setShowCard] = useState(false)

  const { data: examTypes = [] } = useExamTypes(campusId)
  const { data: students = [], isLoading: studentsLoading } = useSectionStudentList(selectedSection?.id ?? '')
  const { data: reportCard, isLoading: cardLoading } = useExamReportCard(
    selectedStudentId ?? '',
    selectedExamTypeId ?? ''
  )

  const handleSectionSelect = (section: SectionCardData) => {
    setSelectedSection(section)
    setSelectedExamTypeId(null)
    setSelectedStudentId(null)
    setShowCard(false)
  }

  const handleStudentSelect = (studentId: string) => {
    if (!selectedExamTypeId) return
    setSelectedStudentId(studentId)
    setShowCard(true)
  }

  const handleBack = () => {
    if (showCard) { setShowCard(false); setSelectedStudentId(null); return }
    if (selectedSection) { setSelectedSection(null); setSelectedExamTypeId(null); }
  }

  // Step 1: Section
  if (!selectedSection) {
    return (
      <div className="flex flex-col gap-6 p-8">
        <PageHeader title="Result Cards" subtitle="Select a section to generate exam report cards" />
        <SectionSelectorCards onSelect={handleSectionSelect} selectedId={null} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <PageHeader
        title="Result Cards"
        subtitle={selectedSection.name}
        actions={<Button variant="ghost" size="sm" onClick={handleBack}>← Back</Button>}
      />

      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 -mt-4">
        <button onClick={() => { setSelectedSection(null); setSelectedExamTypeId(null); setSelectedStudentId(null); setShowCard(false) }}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
          Sections
        </button>
        <span className="text-[var(--text-muted)] text-xs">›</span>
        <Badge variant="info">{selectedSection.name}</Badge>
        {selectedExamTypeId && (
          <>
            <span className="text-[var(--text-muted)] text-xs">›</span>
            <Badge variant="neutral">{examTypes.find(t => t.id === selectedExamTypeId)?.name}</Badge>
          </>
        )}
      </div>

      {/* Exam type chips */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Exam Type</p>
        <div className="flex flex-wrap gap-2">
          {examTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => { setSelectedExamTypeId(t.id); setSelectedStudentId(null); setShowCard(false) }}
              className={`${chipBase} ${selectedExamTypeId === t.id ? chipActive : chipInactive}`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Student list */}
      {selectedExamTypeId && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            Select Student
          </p>
          {studentsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[1,2,3,4].map(i => <Skeleton key={i} variant="card" className="h-16" />)}
            </div>
          ) : students.length === 0 ? (
            <EmptyState title="No students" description="No active students in this section." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {students.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleStudentSelect(s.id)}
                  className={`text-left rounded-[var(--radius-card-sm)] border p-3 transition-all ${
                    selectedStudentId === s.id
                      ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-[var(--text)] truncate">{s.firstName} {s.lastName}</p>
                      {s.rollNumber && <p className="text-xs text-[var(--text-muted)] font-mono truncate">{s.rollNumber}</p>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Report card modal */}
      <AnimatePresence>
        {showCard && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCard(false)}
            />
            <motion.div
              key="panel"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="pointer-events-auto w-full max-w-4xl bg-white rounded-[var(--radius-card-lg)] shadow-[var(--shadow-card-lg)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal toolbar */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-[var(--surface)]">
                  <h2 className="font-semibold text-sm text-[var(--text)]">
                    {examTypes.find(t => t.id === selectedExamTypeId)?.name} — Result Card
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrintReportCard}
                      disabled={cardLoading || !reportCard}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Download PDF
                    </button>
                    <button
                      onClick={() => setShowCard(false)}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card preview */}
                <div className="overflow-y-auto max-h-[82vh] bg-gray-50 p-4">
                  {cardLoading ? (
                    <div className="space-y-3 p-4">
                      <Skeleton variant="card" className="h-12" />
                      <Skeleton variant="card" className="h-40" />
                      <Skeleton variant="card" className="h-60" />
                    </div>
                  ) : !reportCard ? (
                    <EmptyState title="No data" description="No results found for this student in the selected exam type." />
                  ) : (
                    <ExamReportCard data={reportCard} />
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
