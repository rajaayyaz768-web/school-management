'use client'

import { useParams } from 'next/navigation'
import { Printer, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useFeeChalanData } from '@/features/fees/hooks/useFees'
import { Skeleton } from '@/components/ui/Skeleton'
import type { FeeChalanData } from '@/features/fees/types/fees.types'

function fmt(n: number) {
  return `PKR ${n.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`
}

function feeMonth(dueDate: string) {
  return new Date(dueDate).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })
}


function ChalanStub({ data, copyLabel }: { data: FeeChalanData; copyLabel: string }) {
  const studentName = `${data.student.firstName} ${data.student.lastName}`
  const classFull = [data.program?.name, data.grade?.name].filter(Boolean).join(' / ')
  const sectionName = data.section?.name ?? '—'
  const chalanNo = data.receiptNumber ?? data.id.slice(-8).toUpperCase()
  const balance = data.amountDue - data.amountPaid - data.discount
  const dueDate = fmtDate(data.dueDate)
  const month = feeMonth(data.dueDate)
  const campusName = data.campus?.name ?? 'Campus'

  const lineItems = [
    data.feeStructure.tuitionFee > 0 && { label: 'Tuition Fee', amount: data.feeStructure.tuitionFee },
    data.feeStructure.examFee > 0 && { label: 'Examination Fee', amount: data.feeStructure.examFee },
    data.feeStructure.admissionFee > 0 && { label: 'Admission Fee', amount: data.feeStructure.admissionFee },
    data.feeStructure.miscFee > 0 && { label: 'Miscellaneous Fee', amount: data.feeStructure.miscFee },
  ].filter(Boolean) as { label: string; amount: number }[]

  if (data.discount > 0) lineItems.push({ label: 'Discount Applied', amount: -data.discount })

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '9px', color: '#111', background: '#fff', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 10px 6px', borderBottom: '2px solid #111' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
          <div style={{ border: '2px solid #111', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '4px 8px', minWidth: '60px' }}>
            <span style={{ fontWeight: 900, fontSize: '11px', lineHeight: 1, letterSpacing: '-0.5px' }}>Falcon</span>
            <span style={{ fontWeight: 700, fontSize: '7px', lineHeight: 1.3, marginTop: '2px', textAlign: 'center', letterSpacing: '0.2px' }}>{campusName}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 900, fontSize: '11px', letterSpacing: '0.5px', lineHeight: 1 }}>FEE CHALLAN</div>
          <div style={{ marginTop: '3px', display: 'inline-block', border: '1px solid #111', padding: '1px 5px', fontSize: '7px', fontWeight: 600 }}>
            {copyLabel}
          </div>
        </div>
      </div>

      {/* Student + Meta */}
      <div style={{ display: 'flex', borderBottom: '1px solid #111' }}>
        <div style={{ flex: 1, padding: '6px 8px', borderRight: '1px solid #bbb' }}>
          <div style={{ fontSize: '7px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#555', marginBottom: '3px' }}>Student Details</div>
          <div style={{ fontWeight: 700, fontSize: '9px', marginBottom: '1px' }}>{studentName}</div>
          <div style={{ color: '#333', lineHeight: 1.6, fontSize: '8px' }}>
            <div>Roll No: <span style={{ fontWeight: 600 }}>{data.student.rollNumber ?? '—'}</span></div>
            <div>Class: <span style={{ fontWeight: 600 }}>{classFull || '—'}</span></div>
            <div>Section: <span style={{ fontWeight: 600 }}>{sectionName}</span></div>
          </div>
        </div>
        <div style={{ width: '110px', padding: '6px 8px', flexShrink: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7.5px', lineHeight: 1.7 }}>
            <tbody>
              <tr><td style={{ color: '#555', paddingRight: '4px', whiteSpace: 'nowrap' }}>Invoice No.</td><td style={{ fontWeight: 700, textAlign: 'right' }}>{chalanNo}</td></tr>
              <tr><td style={{ color: '#555', paddingRight: '4px', whiteSpace: 'nowrap' }}>Due Date</td><td style={{ fontWeight: 600, textAlign: 'right' }}>{dueDate}</td></tr>
              <tr><td style={{ color: '#555', paddingRight: '4px', whiteSpace: 'nowrap' }}>Month</td><td style={{ fontWeight: 600, textAlign: 'right' }}>{month}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Items table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', flex: 1 }}>
        <thead>
          <tr style={{ background: '#111', color: '#fff' }}>
            <th style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 700, fontSize: '7.5px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Description</th>
            <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 700, fontSize: '7.5px', letterSpacing: '0.3px', textTransform: 'uppercase', width: '80px' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #e8e8e8', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
              <td style={{ padding: '4px 8px', fontSize: '8.5px' }}>{item.label}</td>
              <td style={{ padding: '4px 8px', textAlign: 'right', fontSize: '8.5px', color: item.amount < 0 ? '#16a34a' : '#111' }}>
                {item.amount < 0 ? `- PKR ${fmt(-item.amount).replace('PKR ', '')}` : fmt(item.amount)}
              </td>
            </tr>
          ))}
          {lineItems.length < 5 && Array.from({ length: 5 - lineItems.length }).map((_, i) => (
            <tr key={`e${i}`} style={{ borderBottom: '1px solid #e8e8e8' }}>
              <td style={{ padding: '4px 8px' }}>&nbsp;</td>
              <td style={{ padding: '4px 8px' }}>&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ borderTop: '2px solid #111', display: 'flex', justifyContent: 'flex-end' }}>
        <table style={{ width: '150px', borderCollapse: 'collapse', fontSize: '8px' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e8e8e8' }}>
              <td style={{ padding: '3px 8px', color: '#555' }}>Sub Total</td>
              <td style={{ padding: '3px 8px', textAlign: 'right', fontWeight: 600 }}>{fmt(data.amountDue)}</td>
            </tr>
            {data.discount > 0 && (
              <tr style={{ borderBottom: '1px solid #e8e8e8' }}>
                <td style={{ padding: '3px 8px', color: '#555' }}>Discount</td>
                <td style={{ padding: '3px 8px', textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>- {fmt(data.discount)}</td>
              </tr>
            )}
            {data.amountPaid > 0 && (
              <tr style={{ borderBottom: '1px solid #e8e8e8' }}>
                <td style={{ padding: '3px 8px', color: '#555' }}>Paid</td>
                <td style={{ padding: '3px 8px', textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>- {fmt(data.amountPaid)}</td>
              </tr>
            )}
            <tr style={{ background: '#111', color: '#fff' }}>
              <td style={{ padding: '4px 8px', fontWeight: 700, fontSize: '8.5px' }}>Balance Due</td>
              <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 700, fontSize: '8.5px' }}>{fmt(balance)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signature */}
      <div style={{ borderTop: '1px solid #ccc', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', fontSize: '7px', color: '#555' }}>
        <span>Cashier Signature: _______________</span>
        <span>Stamp</span>
      </div>
    </div>
  )
}

export default function FeeChalanPage() {
  const params = useParams()
  const id = params.id as string
  const { data, isLoading, error } = useFeeChalanData(id)

  function handlePrint() {
    const el = document.getElementById('challan-print-area')
    if (!el) return

    const clone = el.cloneNode(true) as HTMLElement
    clone.removeAttribute('id')

    const printRoot = document.createElement('div')
    printRoot.id = 'print-root'
    printRoot.appendChild(clone)

    const style = document.createElement('style')
    style.id = 'challan-page-print'
    style.textContent = `
      @media print {
        @page { size: A4 landscape; margin: 6mm; }

        body > *:not(#print-root) {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          overflow: hidden !important;
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

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton variant="card" className="h-12" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-80" />)}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400 mb-4">Failed to load chalan data.</p>
        <Link href="/fees" className="text-sm underline text-[var(--primary)]">← Back to Fees</Link>
      </div>
    )
  }

  return (
    <div>
      {/* Screen toolbar */}
      <div className="print:hidden p-6 flex items-center justify-between border-b border-[var(--border)]">
        <Link href="/fees" className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Fees
        </Link>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Printer className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      {/* Challan — landscape 3-column */}
      <div className="p-6 bg-gray-100 min-h-screen">
        <div id="challan-print-area" className="flex flex-row bg-white max-w-5xl mx-auto shadow divide-x divide-gray-300">
          <ChalanStub data={data} copyLabel="Admin Office Copy" />
          <ChalanStub data={data} copyLabel="Account Office Copy" />
          <ChalanStub data={data} copyLabel="Parent Copy" />
        </div>
      </div>
    </div>
  )
}
