'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Printer, X } from 'lucide-react'
import { useFeeChalanData } from '../hooks/useFees'
import { Skeleton } from '@/components/ui/Skeleton'
import type { FeeChalanData } from '../types/fees.types'

interface Props {
  recordId: string | null
  onClose: () => void
}

function fmt(n: number) {
  return `PKR ${n.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`
}

function feeMonth(dueDate: string) {
  return new Date(dueDate).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Single Challan Stub ───────────────────────────────────────────────────────
function ChalanStub({ data, copyLabel }: { data: FeeChalanData; copyLabel: string }) {
  const studentName = `${data.student.firstName} ${data.student.lastName}`
  const classFull   = [data.program?.name, data.grade?.name].filter(Boolean).join(' / ')
  const sectionName = data.section?.name ?? '—'
  const chalanNo    = data.receiptNumber ?? data.id.slice(-8).toUpperCase()
  const balance     = data.amountDue - data.amountPaid - data.discount
  const dueDate     = fmtDate(data.dueDate)
  const month       = feeMonth(data.dueDate)
  const campusName  = data.campus?.name ?? 'Campus'

  const lineItems = [
    data.feeStructure.tuitionFee   > 0 && { label: 'Tuition Fee',       amount: data.feeStructure.tuitionFee },
    data.feeStructure.examFee      > 0 && { label: 'Examination Fee',   amount: data.feeStructure.examFee },
    data.feeStructure.admissionFee > 0 && { label: 'Admission Fee',     amount: data.feeStructure.admissionFee },
    data.feeStructure.miscFee      > 0 && { label: 'Miscellaneous Fee', amount: data.feeStructure.miscFee },
  ].filter(Boolean) as { label: string; amount: number }[]

  if (data.discount > 0) lineItems.push({ label: 'Discount', amount: -data.discount })

  const S: Record<string, React.CSSProperties> = {
    root: {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '8.5px',
      color: '#111',
      background: '#fff',
      flex: 1,
      minWidth: 0,
      border: '1px solid #222',
      display: 'flex',
      flexDirection: 'column',
      WebkitPrintColorAdjust: 'exact',
      printColorAdjust: 'exact',
    } as React.CSSProperties,

    // ── Header band ───────────────────────────────────────────────────────────
    header: {
      background: '#1a1a2e',
      color: '#fff',
      padding: '7px 10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logoBox: {
      display: 'flex',
      flexDirection: 'column',
    },
    logoName: {
      fontWeight: 900,
      fontSize: '13px',
      letterSpacing: '-0.3px',
      lineHeight: 1.1,
    },
    logoCampus: {
      fontSize: '7px',
      fontWeight: 400,
      opacity: 0.75,
      marginTop: '1px',
      letterSpacing: '0.3px',
    },
    headerRight: {
      textAlign: 'right' as const,
    },
    challanTitle: {
      fontWeight: 800,
      fontSize: '10px',
      letterSpacing: '1px',
      textTransform: 'uppercase' as const,
      lineHeight: 1,
    },
    copyBadge: {
      display: 'inline-block',
      marginTop: '4px',
      background: 'rgba(255,255,255,0.15)',
      border: '1px solid rgba(255,255,255,0.35)',
      padding: '1px 6px',
      fontSize: '7px',
      fontWeight: 700,
      letterSpacing: '0.5px',
      borderRadius: '2px',
    },

    // ── Meta row (invoice / due / month) ─────────────────────────────────────
    metaRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      borderBottom: '1px solid #ddd',
      background: '#f7f7f7',
    },
    metaCell: {
      padding: '4px 8px',
      borderRight: '1px solid #ddd',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1px',
    },
    metaLabel: {
      fontSize: '6.5px',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.4px',
      color: '#777',
    },
    metaValue: {
      fontSize: '8px',
      fontWeight: 700,
      color: '#111',
    },

    // ── Student details ───────────────────────────────────────────────────────
    studentRow: {
      padding: '5px 8px 6px',
      borderBottom: '1px solid #ddd',
      background: '#fff',
    },
    studentLabel: {
      fontSize: '6.5px',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.4px',
      color: '#777',
      marginBottom: '2px',
    },
    studentName: {
      fontWeight: 800,
      fontSize: '10px',
      marginBottom: '2px',
      color: '#111',
    },
    studentGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1px 8px',
    },
    studentDetail: {
      fontSize: '7.5px',
      color: '#444',
    },
    studentDetailBold: {
      fontWeight: 700,
      color: '#111',
    },

    // ── Items table ───────────────────────────────────────────────────────────
    tableHead: {
      display: 'grid',
      gridTemplateColumns: '1fr 70px',
      background: '#1a1a2e',
      padding: '3px 8px',
    },
    tableHeadLabel: {
      fontSize: '7px',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      color: '#fff',
    },
    tableRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 70px',
      padding: '4px 8px',
      borderBottom: '1px solid #efefef',
    },
    tableRowAlt: {
      background: '#fafafa',
    },
    tableDesc: {
      fontSize: '8px',
      color: '#222',
    },
    tableAmt: {
      fontSize: '8px',
      textAlign: 'right' as const,
      fontWeight: 600,
      color: '#111',
    },
    tableAmtDiscount: {
      fontSize: '8px',
      textAlign: 'right' as const,
      fontWeight: 600,
      color: '#16a34a',
    },

    // ── Total block ───────────────────────────────────────────────────────────
    totalSection: {
      borderTop: '2px solid #1a1a2e',
      marginTop: 'auto',
    },
    totalRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 90px',
      padding: '3px 8px',
      borderBottom: '1px solid #efefef',
    },
    totalLabel: {
      fontSize: '8px',
      color: '#555',
    },
    totalValue: {
      fontSize: '8px',
      textAlign: 'right' as const,
      fontWeight: 600,
    },
    grandRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 90px',
      padding: '5px 8px',
      background: '#1a1a2e',
    },
    grandLabel: {
      fontSize: '8.5px',
      fontWeight: 800,
      color: '#fff',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.3px',
    },
    grandValue: {
      fontSize: '9px',
      textAlign: 'right' as const,
      fontWeight: 900,
      color: '#fff',
    },

    // ── Footer ───────────────────────────────────────────────────────────────
    footer: {
      borderTop: '1px solid #ddd',
      padding: '4px 8px',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0 8px',
    },
    footerLabel: {
      fontSize: '6.5px',
      color: '#888',
      marginBottom: '8px',
    },
    footerLine: {
      borderBottom: '1px solid #bbb',
      marginBottom: '1px',
    },
    footerCaption: {
      fontSize: '6px',
      color: '#aaa',
      textAlign: 'center' as const,
    },
    footerNote: {
      fontSize: '6px',
      color: '#aaa',
      textAlign: 'center' as const,
      gridColumn: '1 / -1',
      paddingTop: '2px',
      borderTop: '1px dashed #ddd',
      marginTop: '2px',
    },
  }

  return (
    <div style={S.root}>

      {/* ── Header ── */}
      <div style={S.header}>
        <div style={S.logoBox}>
          <span style={S.logoName}>Falcon</span>
          <span style={S.logoCampus}>{campusName}</span>
        </div>
        <div style={S.headerRight}>
          <div style={S.challanTitle}>Fee Challan</div>
          <div style={S.copyBadge}>{copyLabel}</div>
        </div>
      </div>

      {/* ── Meta row ── */}
      <div style={S.metaRow}>
        <div style={S.metaCell}>
          <span style={S.metaLabel}>Invoice No.</span>
          <span style={S.metaValue}>{chalanNo}</span>
        </div>
        <div style={S.metaCell}>
          <span style={S.metaLabel}>Due Date</span>
          <span style={S.metaValue}>{dueDate}</span>
        </div>
        <div style={{ ...S.metaCell, borderRight: 'none' }}>
          <span style={S.metaLabel}>Month</span>
          <span style={S.metaValue}>{month}</span>
        </div>
      </div>

      {/* ── Student Details ── */}
      <div style={S.studentRow}>
        <div style={S.studentLabel}>Student Details</div>
        <div style={S.studentName}>{studentName}</div>
        <div style={S.studentGrid}>
          <span style={S.studentDetail}>Roll No: <span style={S.studentDetailBold}>{data.student.rollNumber ?? '—'}</span></span>
          <span style={S.studentDetail}>Class: <span style={S.studentDetailBold}>{classFull || '—'}</span></span>
          <span style={S.studentDetail}>Section: <span style={S.studentDetailBold}>{sectionName}</span></span>
        </div>
      </div>

      {/* ── Fee Items ── */}
      <div style={S.tableHead}>
        <span style={S.tableHeadLabel}>Description</span>
        <span style={{ ...S.tableHeadLabel, textAlign: 'right' }}>Amount</span>
      </div>
      {lineItems.map((item, i) => (
        <div key={i} style={{ ...S.tableRow, ...(i % 2 !== 0 ? S.tableRowAlt : {}) }}>
          <span style={S.tableDesc}>{item.label}</span>
          <span style={item.amount < 0 ? S.tableAmtDiscount : S.tableAmt}>
            {item.amount < 0 ? `- PKR ${Math.abs(item.amount).toLocaleString('en-PK')}` : fmt(item.amount)}
          </span>
        </div>
      ))}

      {/* ── Totals ── */}
      <div style={S.totalSection}>
        <div style={S.totalRow}>
          <span style={S.totalLabel}>Sub Total</span>
          <span style={S.totalValue}>{fmt(data.amountDue)}</span>
        </div>
        {data.discount > 0 && (
          <div style={S.totalRow}>
            <span style={S.totalLabel}>Discount</span>
            <span style={{ ...S.totalValue, color: '#16a34a' }}>− {fmt(data.discount)}</span>
          </div>
        )}
        {data.amountPaid > 0 && (
          <div style={S.totalRow}>
            <span style={S.totalLabel}>Paid</span>
            <span style={{ ...S.totalValue, color: '#16a34a' }}>− {fmt(data.amountPaid)}</span>
          </div>
        )}
        <div style={S.grandRow}>
          <span style={S.grandLabel}>Balance Due</span>
          <span style={S.grandValue}>{fmt(balance)}</span>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={S.footer}>
        <div>
          <div style={S.footerLabel}>Cashier Signature</div>
          <div style={S.footerLine} />
          <div style={S.footerCaption}>Authorized Signatory</div>
        </div>
        <div>
          <div style={S.footerLabel}>Official Stamp</div>
          <div style={{ ...S.footerLine, borderStyle: 'dashed' }} />
          <div style={S.footerCaption}>Office Use Only</div>
        </div>
        <div style={S.footerNote}>Please pay before due date • Late payment may incur penalty</div>
      </div>

    </div>
  )
}

// ── Print handler ─────────────────────────────────────────────────────────────
function handleDownloadPDF() {
  const el = document.getElementById('challan-print-area')
  if (!el) return

  const clone = el.cloneNode(true) as HTMLElement
  clone.removeAttribute('id')

  const printRoot = document.createElement('div')
  printRoot.id = 'print-root'
  printRoot.appendChild(clone)

  const style = document.createElement('style')
  style.id = 'challan-print-override'
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

      #print-root > div {
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
      }

      #print-root > div > div {
        flex: 1 !important;
        min-width: 0 !important;
        max-height: 198mm !important;
        overflow: hidden !important;
        border-right: 1px solid #ccc !important;
        box-sizing: border-box !important;
      }

      #print-root > div > div:last-child {
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

// ── Modal ─────────────────────────────────────────────────────────────────────
export function ChalanModal({ recordId, onClose }: Props) {
  const { data, isLoading } = useFeeChalanData(recordId ?? '')

  return (
    <AnimatePresence>
      {recordId && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-5xl bg-[var(--surface)] rounded-[var(--radius-card-lg)] shadow-[var(--shadow-card-lg)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                <h2 className="font-display text-base font-semibold text-[var(--text)]">Fee Challan</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isLoading || !data}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    <Printer className="w-4 h-4" />
                    Download PDF
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-container)] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Preview — landscape 3-column */}
              <div className="p-4 bg-gray-100 max-h-[78vh] overflow-y-auto">
                {isLoading ? (
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-80" />)}
                  </div>
                ) : !data ? (
                  <p className="text-center text-sm text-[var(--text-muted)] py-8">Failed to load challan data.</p>
                ) : (
                  <div
                    id="challan-print-area"
                    style={{ display: 'flex', flexDirection: 'row', gap: '12px', alignItems: 'stretch' }}
                  >
                    <ChalanStub data={data} copyLabel="Bank Copy" />
                    <ChalanStub data={data} copyLabel="School Copy" />
                    <ChalanStub data={data} copyLabel="Student Copy" />
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
