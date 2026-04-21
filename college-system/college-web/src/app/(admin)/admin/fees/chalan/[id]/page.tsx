'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Printer, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useFeeChalanData } from '@/features/fees/hooks/useFees'
import { Skeleton } from '@/components/ui/Skeleton'
import type { FeeChalanData } from '@/features/fees/types/fees.types'

function feeMonth(dueDate: string) {
  return new Date(dueDate).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })
}

function fmt(n: number) {
  return n.toLocaleString('en-PK', { maximumFractionDigits: 0 })
}

function ChalanStub({ data, copyLabel }: { data: FeeChalanData; copyLabel: string }) {
  const studentName = `${data.student.firstName} ${data.student.lastName}`
  const classFull = [data.program?.name, data.grade?.name, data.section?.name].filter(Boolean).join(' · ')
  const chalanNo = data.receiptNumber ?? data.id.slice(-8).toUpperCase()
  const month = feeMonth(data.dueDate)
  const balance = data.amountDue - data.amountPaid - data.discount

  return (
    <div className="chalan-stub border border-gray-400 p-4 print:p-3 rounded print:rounded-none flex flex-col gap-2 min-h-[280px]">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-gray-300 pb-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-800">
            {data.campus?.name ?? 'Campus'}
          </p>
          <p className="text-[9px] text-gray-500 uppercase tracking-widest">Fee Challan</p>
        </div>
        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-300">
          {copyLabel}
        </span>
      </div>

      {/* Student info */}
      <div className="space-y-1 text-[10px]">
        <Row label="Student" value={studentName} />
        <Row label="Roll No" value={data.student.rollNumber ?? '—'} />
        <Row label="Class" value={classFull || '—'} />
        <Row label="Month" value={month} />
        <Row label="Challan No" value={chalanNo} />
      </div>

      {/* Fee breakdown */}
      <div className="border-t border-b border-dashed border-gray-300 py-1.5 space-y-0.5 text-[10px]">
        {data.feeStructure.tuitionFee > 0 && <FeeRow label="Tuition Fee" amount={data.feeStructure.tuitionFee} />}
        {data.feeStructure.examFee > 0 && <FeeRow label="Exam Fee" amount={data.feeStructure.examFee} />}
        {data.feeStructure.admissionFee > 0 && <FeeRow label="Admission Fee" amount={data.feeStructure.admissionFee} />}
        {data.feeStructure.miscFee > 0 && <FeeRow label="Misc Fee" amount={data.feeStructure.miscFee} />}
        {data.discount > 0 && <FeeRow label="Discount" amount={-data.discount} />}
      </div>

      {/* Totals */}
      <div className="text-[10px] space-y-0.5">
        <div className="flex justify-between font-bold text-[11px]">
          <span>Total Due</span>
          <span>PKR {fmt(data.amountDue)}</span>
        </div>
        {data.amountPaid > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>Paid</span>
            <span>PKR {fmt(data.amountPaid)}</span>
          </div>
        )}
        {balance > 0 && (
          <div className="flex justify-between font-bold text-red-700">
            <span>Balance</span>
            <span>PKR {fmt(balance)}</span>
          </div>
        )}
      </div>

      {/* Dates */}
      <div className="text-[9px] text-gray-500 space-y-0.5 mt-auto">
        <div className="flex justify-between">
          <span>Due Date:</span>
          <span>{new Date(data.dueDate).toLocaleDateString('en-PK')}</span>
        </div>
        {data.paidAt && (
          <div className="flex justify-between text-emerald-700">
            <span>Paid On:</span>
            <span>{new Date(data.paidAt).toLocaleDateString('en-PK')}</span>
          </div>
        )}
      </div>

      {/* Signature block */}
      <div className="flex justify-between mt-2 pt-2 border-t border-gray-300 text-[9px] text-gray-400">
        <span>Cashier Signature: __________</span>
        <span>Stamp</span>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-500 shrink-0">{label}:</span>
      <span className="font-medium text-gray-800 text-right truncate">{value}</span>
    </div>
  )
}

function FeeRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-600">{label}</span>
      <span className={amount < 0 ? 'text-emerald-700' : 'text-gray-800'}>
        {amount < 0 ? `- PKR ${fmt(-amount)}` : `PKR ${fmt(amount)}`}
      </span>
    </div>
  )
}

export default function FeeChalanPage() {
  const params = useParams()
  const id = params.id as string
  const { data, isLoading, error } = useFeeChalanData(id)

  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => window.print(), 500)
      return () => clearTimeout(timer)
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton variant="card" className="h-12" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-72" />)}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400 mb-4">Failed to load chalan data.</p>
        <Link href="/admin/fees" className="text-sm underline text-[var(--primary)]">← Back to Fees</Link>
      </div>
    )
  }

  return (
    <>
      {/* Screen-only header */}
      <div className="print:hidden p-6 flex items-center justify-between border-b border-[var(--border)]">
        <Link href="/admin/fees" className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Fees
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Printer className="w-4 h-4" />
          Print Challan
        </button>
      </div>

      {/* Chalan layout */}
      <div className="p-6 print:p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-4 print:gap-0 print:divide-x print:divide-gray-400">
          <ChalanStub data={data} copyLabel="Bank Copy" />
          <ChalanStub data={data} copyLabel="School Copy" />
          <ChalanStub data={data} copyLabel="Student Copy" />
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          body > * { display: none !important; }
          #__next > * { display: none !important; }
          .print\\:grid-cols-3 { display: grid !important; grid-template-columns: repeat(3,1fr) !important; }
        }
      `}</style>
    </>
  )
}
