'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Printer, X, AlertTriangle } from 'lucide-react'
import { ChalanStub } from './ChalanModal'
import type { FeeRecordResponse, FeeStructureResponse, FeeChalanData } from '../types/fees.types'

interface Props {
  open: boolean
  onClose: () => void
  sectionName: string
  records: FeeRecordResponse[]
  structures: FeeStructureResponse[]
}

function buildChalanData(
  record: FeeRecordResponse,
  structures: FeeStructureResponse[],
): FeeChalanData | null {
  const structure = structures.find(s => s.id === record.feeStructureId)
  if (!structure) return null

  return {
    id: record.id,
    receiptNumber: record.receiptNumber,
    dueDate: record.dueDate,
    paidAt: record.paidAt,
    amountDue: record.amountDue,
    amountPaid: record.amountPaid,
    discount: record.discount,
    status: record.status,
    parentPhone: record.parentPhone,
    student: {
      id: record.studentId,
      firstName: record.student.firstName,
      lastName: record.student.lastName,
      rollNumber: record.student.rollNumber,
    },
    section: record.student.section,
    grade: structure.grade,
    program: structure.program,
    campus: { ...structure.campus, campusType: 'COLLEGE' as const },
    feeStructure: {
      id: structure.id,
      academicYear: structure.academicYear,
      totalFee: structure.totalFee,
      admissionFee: structure.admissionFee,
      tuitionFee: structure.tuitionFee,
      examFee: structure.examFee,
      miscFee: structure.miscFee,
    },
  }
}

function handleBulkPrint() {
  const el = document.getElementById('bulk-chalan-print-area')
  if (!el) return

  const clone = el.cloneNode(true) as HTMLElement
  clone.removeAttribute('id')

  const printRoot = document.createElement('div')
  printRoot.id = 'print-root'
  printRoot.appendChild(clone)

  const style = document.createElement('style')
  style.id = 'bulk-print-override'
  style.textContent = `
    @media print {
      @page { size: A4 landscape; margin: 6mm; }

      body > *:not(#print-root) {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        overflow: hidden !important;
      }

      [class*="fixed"], [class*="backdrop"], [class*="modal"],
      [style*="position: fixed"], [style*="position:fixed"] {
        display: none !important;
      }

      html, body {
        background: #fff !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
        height: auto !important;
      }

      #print-root {
        display: block !important;
        visibility: visible !important;
        position: static !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
        background: #fff !important;
      }

      .bulk-chalan-page {
        display: flex !important;
        flex-direction: row !important;
        gap: 0 !important;
        width: 285mm !important;
        height: 198mm !important;
        max-height: 198mm !important;
        align-items: stretch !important;
        box-sizing: border-box !important;
        background: #fff !important;
        overflow: hidden !important;
        page-break-after: always !important;
        break-after: page !important;
      }

      .bulk-chalan-page:last-child {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }

      .bulk-chalan-page > div {
        flex: 1 !important;
        min-width: 0 !important;
        max-height: 198mm !important;
        overflow: hidden !important;
        border-right: 1px solid #ccc !important;
        box-sizing: border-box !important;
      }

      .bulk-chalan-page > div:last-child {
        border-right: none !important;
      }

      #print-root, #print-root * {
        visibility: visible !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
    }
  `

  document.head.appendChild(style)
  document.body.appendChild(printRoot)

  const cleanup = () => {
    printRoot.remove()
    style.remove()
    window.onafterprint = null
  }

  window.onafterprint = cleanup

  requestAnimationFrame(() => {
    setTimeout(() => window.print(), 150)
  })
}

export function BulkChalanPrintModal({ open, onClose, sectionName, records, structures }: Props) {
  const challans = records
    .map(r => buildChalanData(r, structures))
    .filter((c): c is FeeChalanData => c !== null)

  const skipped = records.length - challans.length

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="bulk-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            key="bulk-panel"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-[var(--space-4)] pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-5xl bg-[var(--surface)] rounded-[var(--radius-card-lg)] shadow-[var(--shadow-card-lg)] overflow-hidden flex flex-col"
              style={{ maxHeight: '90vh' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-[var(--space-6)] py-[var(--space-4)] border-b border-[var(--border)] shrink-0">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-base font-semibold text-[var(--text)]">
                    Bulk Print — Section {sectionName}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold">
                    {challans.length} challan{challans.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkPrint}
                    disabled={challans.length === 0}
                    className="flex items-center gap-2 px-[var(--space-4)] py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    <Printer className="w-4 h-4" />
                    Print All ({challans.length})
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-container)] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Skipped warning */}
              {skipped > 0 && (
                <div className="flex items-center gap-2 px-[var(--space-6)] py-2 bg-amber-50 border-b border-amber-200 text-amber-700 text-xs shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {skipped} record{skipped !== 1 ? 's were' : ' was'} skipped — no matching fee structure found.
                </div>
              )}

              {/* Preview */}
              <div className="overflow-y-auto flex-1 p-4 bg-gray-100">
                {challans.length === 0 ? (
                  <p className="text-center text-sm text-[var(--text-muted)] py-12">
                    No challans to print. Make sure fee structures are loaded.
                  </p>
                ) : (
                  <div id="bulk-chalan-print-area" className="flex flex-col gap-4">
                    {challans.map(data => (
                      <div
                        key={data.id}
                        className="bulk-chalan-page"
                        style={{ display: 'flex', flexDirection: 'row', gap: '12px', alignItems: 'stretch' }}
                      >
                        <ChalanStub data={data} copyLabel="Admin Office Copy" />
                        <ChalanStub data={data} copyLabel="Account Office Copy" />
                        <ChalanStub data={data} copyLabel="Parent Copy" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
