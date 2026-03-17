'use client'

import { cn } from '@/lib/utils'
import Badge from '../ui/Badge'
import Button from '../ui/Button'

/**
 * FeeStatusCard component for displaying student fee status
 * @param student - Student info
 * @param amount - Total fee amount
 * @param paid - Amount paid
 * @param status - Current fee status
 * @param receiptNo - Receipt number if paid
 * @param dueDate - Due date for payment
 * @param onMarkPaid - Handler for marking as paid
 */
export interface FeeStatusCardProps {
  student: {
    name: string
    program: string
  }
  amount: number
  paid: number
  status: 'paid' | 'pending' | 'overdue' | 'partial'
  receiptNo?: string
  dueDate?: string
  onMarkPaid?: () => void
  className?: string
}

export function FeeStatusCard({
  student,
  amount,
  paid,
  status,
  receiptNo,
  dueDate,
  onMarkPaid,
  className,
}: FeeStatusCardProps) {
  const progress = Math.min((paid / amount) * 100, 100)
  const remaining = amount - paid

  return (
    <div
      className={cn(
        'bg-[var(--surface)] rounded-card border border-[var(--border)] p-5',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-[var(--text)]">
            {student.name}
          </h3>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-[6px] bg-[var(--bg-secondary)] text-[var(--text-muted)] text-xs font-body">
            {student.program}
          </span>
        </div>
        <Badge variant={status} size="md">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <p className="font-display text-2xl font-bold text-[var(--text)]">
          <span className="text-gold-600 dark:text-gold-400 text-lg font-body font-normal">
            PKR{' '}
          </span>
          {amount.toLocaleString()}
        </p>
        {dueDate && status !== 'paid' && (
          <p className="font-body text-xs text-[var(--text-muted)] mt-1">
            Due: {dueDate}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gold-400 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="font-body text-xs text-[var(--text-muted)] mt-2">
          PKR {paid.toLocaleString()} / PKR {amount.toLocaleString()} paid
        </p>
      </div>

      {/* Footer */}
      {status === 'paid' && receiptNo && (
        <p className="font-mono text-xs text-[var(--text-muted)]">
          Receipt: {receiptNo}
        </p>
      )}

      {(status === 'pending' || status === 'overdue' || status === 'partial') && onMarkPaid && (
        <Button variant="gold" size="sm" fullWidth onClick={onMarkPaid}>
          Mark as Paid
        </Button>
      )}
    </div>
  )
}

export default FeeStatusCard
