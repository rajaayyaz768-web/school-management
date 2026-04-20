'use client'

import { useState } from 'react'
import { CreditCard, Users, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ChildSwitcher } from '@/components/shared/selection/ChildSwitcher'
import { ChildInfoStrip } from '@/components/shared/selection/ChildInfoStrip'
import { useMyChildren } from '@/features/parents/hooks/useParents'
import { useStudentFeeRecords } from '@/features/fees/hooks/useFees'
import { FeeRecordResponse, FeeStatus } from '@/features/fees/types/fees.types'

const STATUS_VARIANT: Record<FeeStatus, 'paid' | 'pending' | 'overdue' | 'partial' | 'waived'> = {
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue',
  PARTIAL: 'partial',
  WAIVED: 'waived',
}

function formatPKR(n: number) {
  return `PKR ${n.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`
}

function FeeCard({ record }: { record: FeeRecordResponse }) {
  const balance = record.amountDue - record.amountPaid - record.discount

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-[var(--text)] text-sm">
            {record.feeStructure?.program?.name ?? '—'} · {record.feeStructure?.grade?.name ?? '—'}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{record.academicYear}</p>
        </div>
        <Badge variant={STATUS_VARIANT[record.status]}>{record.status}</Badge>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center text-sm border-t border-[var(--border)] pt-3">
        <div>
          <p className="text-xs text-[var(--text-muted)]">Due</p>
          <p className="font-semibold">{formatPKR(record.amountDue)}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)]">Paid</p>
          <p className="font-semibold text-[#10B981]">{formatPKR(record.amountPaid)}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)]">Balance</p>
          <p className={`font-semibold ${balance > 0 ? 'text-[var(--danger)]' : 'text-[#10B981]'}`}>
            {formatPKR(balance)}
          </p>
        </div>
      </div>

      {record.dueDate && (
        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Due: {new Date(record.dueDate).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}
        </p>
      )}
    </Card>
  )
}

export default function ParentFeesPage() {
  const { data: children, isLoading: childrenLoading } = useMyChildren()
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')

  const activeChild = children?.find(c => c.student.id === (selectedStudentId || children?.[0]?.student.id))
  const studentId = activeChild?.student.id ?? ''

  const { data: records, isLoading: feesLoading } = useStudentFeeRecords(studentId)

  const totalDue = (records ?? []).reduce((s, r) => s + r.amountDue, 0)
  const totalPaid = (records ?? []).reduce((s, r) => s + r.amountPaid, 0)
  const totalBalance = totalDue - totalPaid

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Fee Status"
        breadcrumb={[{ label: 'Home', href: '/parent/dashboard' }, { label: 'Fees' }]}
      />

      {!childrenLoading && children && (
        <>
          <ChildSwitcher
            children={children}
            activeId={studentId}
            onChange={setSelectedStudentId}
          />
          {activeChild && <ChildInfoStrip child={activeChild} />}
        </>
      )}

      {childrenLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-24" />)}
        </div>
      ) : !studentId ? (
        <div className="rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <EmptyState
            icon={<Users size={28} style={{ color: 'var(--primary)' }} />}
            title="No Child Linked"
            description="No student has been linked to your account."
          />
        </div>
      ) : feesLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-32" />)}
        </div>
      ) : !records?.length ? (
        <div className="rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <EmptyState
            icon={<CreditCard size={28} style={{ color: 'var(--primary)' }} />}
            title="No Fee Records"
            description="No fee records have been generated for your child yet."
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Due', value: formatPKR(totalDue), icon: <AlertCircle className="w-5 h-5" />, color: 'var(--danger)' },
              { label: 'Total Paid', value: formatPKR(totalPaid), icon: <CheckCircle2 className="w-5 h-5" />, color: '#10B981' },
              { label: 'Balance', value: formatPKR(totalBalance), icon: <CreditCard className="w-5 h-5" />, color: totalBalance > 0 ? 'var(--danger)' : '#10B981' },
            ].map(({ label, value, icon, color }) => (
              <Card key={label} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, color }}>
                  {icon}
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">{label}</p>
                  <p className="font-bold text-[var(--text)]">{value}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {records.map((record) => <FeeCard key={record.id} record={record} />)}
          </div>
        </>
      )}
    </div>
  )
}
