'use client'

import { useState } from 'react'
import { Users, BookOpen, RefreshCw, ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useLiveTeachers } from '@/features/timetable/hooks/useTimetable'
import type { LiveTeacherCampus } from '@/features/timetable/api/timetable.api'
import { cn } from '@/lib/utils'

type Step = 'overview' | 'campus'

function CampusOverviewCard({
  campus,
  onClick,
}: {
  campus: LiveTeacherCampus
  onClick: () => void
}) {
  const freeCount = campus.free.length
  const busyCount = campus.busy.length
  const total = freeCount + busyCount

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/4 transition-all duration-200"
    >
      <h3 className="font-bold text-[var(--text)] mb-3 text-sm">{campus.campusName}</h3>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="space-y-0.5">
          <p className="text-[var(--text-muted)] uppercase tracking-widest text-[10px]">Free Now</p>
          <p className="text-xl font-bold text-emerald-400">{freeCount}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[var(--text-muted)] uppercase tracking-widest text-[10px]">Teaching</p>
          <p className="text-xl font-bold text-[var(--primary)]">{busyCount}</p>
        </div>
      </div>
      {total > 0 && (
        <div className="mt-3">
          <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
              style={{ width: `${(busyCount / total) * 100}%` }}
            />
          </div>
          <p className="text-[9px] text-[var(--text-muted)] mt-1 text-right">
            {Math.round((busyCount / total) * 100)}% occupied
          </p>
        </div>
      )}
      {freeCount > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {campus.free.slice(0, 3).map((t) => (
            <span key={t.staffId} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {t.staffName.split(' ')[0]}
            </span>
          ))}
          {freeCount > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--border)] text-[var(--text-muted)]">
              +{freeCount - 3} more
            </span>
          )}
        </div>
      )}
    </button>
  )
}

function CampusDetailView({ campus }: { campus: LiveTeacherCampus }) {
  return (
    <div className="space-y-6">
      {/* Free teachers */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <h3 className="font-semibold text-[var(--text)] text-sm">
            Free Now <span className="text-[var(--text-muted)] font-normal">({campus.free.length})</span>
          </h3>
        </div>
        {campus.free.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] italic">All teachers are currently occupied.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {campus.free.map((t) => (
              <span
                key={t.staffId}
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
              >
                {t.staffName}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Busy teachers table */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
          <h3 className="font-semibold text-[var(--text)] text-sm">
            Currently Teaching <span className="text-[var(--text-muted)] font-normal">({campus.busy.length})</span>
          </h3>
        </div>
        {campus.busy.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] italic">No teachers are currently in a class.</p>
        ) : (
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                  <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">Teacher</th>
                  <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">Section</th>
                  <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">Subject</th>
                  <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">Ends At</th>
                </tr>
              </thead>
              <tbody>
                {campus.busy.map((t) => (
                  <tr key={t.staffId} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3 font-medium text-[var(--text)]">{t.staffName}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">
                      {t.sectionName}
                      {(t.programCode || t.gradeName) && (
                        <span className="text-[10px] block">{[t.programCode, t.gradeName].filter(Boolean).join(' · ')}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{t.subjectName}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{t.endTime}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TeachersLivePage() {
  const [step, setStep] = useState<Step>('overview')
  const [selectedCampusId, setSelectedCampusId] = useState<string | null>(null)

  const { data: allCampuses, isLoading, dataUpdatedAt, refetch } = useLiveTeachers()

  const selectedCampus = allCampuses?.find((c) => c.campusId === selectedCampusId) ?? null

  const totalFree = allCampuses?.reduce((sum, c) => sum + c.free.length, 0) ?? 0
  const totalBusy = allCampuses?.reduce((sum, c) => sum + c.busy.length, 0) ?? 0

  const breadcrumb = [{ label: 'Home', href: '/principal/dashboard' }, { label: 'Teachers Live' }]
  const lastUpdate = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) : null

  if (step === 'overview' || !selectedCampus) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader
          title="Teachers Live"
          subtitle="Real-time view of who is teaching and who is free"
          breadcrumb={breadcrumb}
        />

        {/* Summary banner */}
        {!isLoading && allCampuses && (
          <div className="flex items-center gap-4 p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">{totalFree} free</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
              <span className="text-sm font-semibold text-[var(--primary)]">{totalBusy} teaching</span>
            </div>
            <span className="text-xs text-[var(--text-muted)] ml-auto">Across all campuses</span>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {lastUpdate ? `Updated ${lastUpdate}` : 'Refresh'}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-48" />)}
          </div>
        ) : !allCampuses?.length ? (
          <EmptyState
            icon={<Users size={28} style={{ color: 'var(--primary)' }} />}
            title="No campus data"
            description="No active campuses found or timetable data is unavailable."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allCampuses.map((campus) => (
              <CampusOverviewCard
                key={campus.campusId}
                campus={campus}
                onClick={() => { setSelectedCampusId(campus.campusId); setStep('campus') }}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Teachers Live" breadcrumb={breadcrumb} />

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => { setStep('overview'); setSelectedCampusId(null) }}
          className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All Campuses
        </button>
        <Badge variant="info">{selectedCampus.campusName}</Badge>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 ml-auto text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {lastUpdate ? `Updated ${lastUpdate}` : 'Refresh'}
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton variant="card" className="h-24" />
          <Skeleton variant="table" />
        </div>
      ) : (
        <CampusDetailView campus={selectedCampus} />
      )}
    </div>
  )
}
