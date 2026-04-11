import { CreditCard, TrendingUp, AlertTriangle, Users } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { FeeSummary } from '../types/principal-dashboard.types'

function formatPKR(amount: number): string {
  return `PKR ${amount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`
}

interface Props {
  feeSummary: FeeSummary
  isLoading: boolean
}

export function FeeSummaryCard({ feeSummary, isLoading }: Props) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-[var(--border)]">
        <CreditCard className="w-4 h-4 text-[var(--text-muted)]" />
        <h3 className="text-sm font-semibold text-[var(--text)]">Fee Summary</h3>
      </div>

      <div className="p-5 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} variant="text" className="h-16" />
            ))}
          </div>
        ) : (
          <>
            {/* Collected This Month — primary gold */}
            <div className="rounded-[var(--radius)] border border-[var(--gold)]/30 bg-[var(--gold)]/8 p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide font-semibold mb-1">
                  Collected This Month
                </p>
                <p className="text-xl font-bold text-[var(--gold)]">
                  {formatPKR(feeSummary.collectedThisMonth)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-[var(--radius)] bg-[var(--gold)]/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[var(--gold)]" />
              </div>
            </div>

            {/* Total Pending — red */}
            <div className="rounded-[var(--radius)] border border-red-500/25 bg-red-500/8 p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide font-semibold mb-1">
                  Total Pending
                </p>
                <p className="text-xl font-bold text-red-400">{formatPKR(feeSummary.totalPending)}</p>
              </div>
              <div className="w-10 h-10 rounded-[var(--radius)] bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
            </div>

            {/* Defaulters */}
            <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide font-semibold mb-1">
                  Defaulters
                </p>
                <p className="text-xl font-bold text-[var(--text)]">{feeSummary.defaulterCount}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">students with overdue fees</p>
              </div>
              <div className="w-10 h-10 rounded-[var(--radius)] bg-white/5 flex items-center justify-center">
                <Users className="w-4 h-4 text-[var(--text-muted)]" />
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
