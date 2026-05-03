'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, RefreshCw, Users } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useLiveTeachers } from '@/features/timetable/hooks/useTimetable'
import type { LiveTeacherCampus } from '@/features/timetable/api/timetable.api'
import { cn } from '@/lib/utils'

const AVATAR_COLORS = ['bg-[var(--primary)]', 'bg-[var(--gold)]', 'bg-purple-600', 'bg-blue-600', 'bg-rose-600']

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// ─── Campus summary card ──────────────────────────────────────────────────────
function CampusCard({ campus, onClick, delay }: { campus: LiveTeacherCampus; onClick: () => void; delay: number }) {
  const freeCount = campus.free.length
  const busyCount = campus.busy.length
  const total = freeCount + busyCount
  const pct = total > 0 ? Math.round((busyCount / total) * 100) : 0

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      onClick={onClick}
      className="w-full text-left bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--primary)]/30 transition-all active:scale-[0.98]"
    >
      <h3 className="font-bold text-[var(--text)] text-lg mb-4" style={{ fontFamily: 'var(--font-display)' }}>{campus.campusName}</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold mb-1">Free Now</p>
          <p className="text-3xl font-bold text-emerald-400">{freeCount}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold mb-1">Teaching</p>
          <p className="text-3xl font-bold text-[var(--primary)]">{busyCount}</p>
        </div>
      </div>

      {total > 0 && (
        <>
          <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden mb-1.5">
            <div className="h-full rounded-full bg-[var(--primary)] transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[10px] text-[var(--text-muted)] text-right">{pct}% occupied</p>
        </>
      )}

      {freeCount > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {campus.free.slice(0, 3).map(t => (
            <span key={t.staffId} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {t.staffName.split(' ')[0]}
            </span>
          ))}
          {freeCount > 3 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--border)] text-[var(--text-muted)]">+{freeCount - 3} more</span>
          )}
        </div>
      )}
    </motion.button>
  )
}

// ─── Campus detail: teacher card list ─────────────────────────────────────────
function TeacherRow({ name, status, detail, index, color }: {
  name: string; status: 'free' | 'busy'; detail?: string; index: number; color: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5 active:bg-white/[0.02] transition-colors"
    >
      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0', color)}>
        {getInitials(name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[var(--text)] truncate">{name}</p>
        {detail && <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{detail}</p>}
      </div>
      <span className={cn(
        'text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0',
        status === 'free' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[var(--primary)]/15 text-[var(--primary)]'
      )}>
        {status === 'free' ? 'Available' : `Until ${detail?.split('·')[0]?.trim() || ''}`}
      </span>
    </motion.div>
  )
}

function CampusDetailView({ campus }: { campus: LiveTeacherCampus }) {
  return (
    <div className="space-y-6">
      {/* Free teachers */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3 flex items-center gap-2 px-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          Free Now ({campus.free.length})
        </p>
        {campus.free.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] italic px-1">All teachers are currently occupied.</p>
        ) : (
          <div className="space-y-2">
            {campus.free.map((t, i) => (
              <TeacherRow key={t.staffId} name={t.staffName} status="free" index={i} color={AVATAR_COLORS[i % AVATAR_COLORS.length]} />
            ))}
          </div>
        )}
      </div>

      {/* Busy teachers */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3 flex items-center gap-2 px-1">
          <span className="w-2 h-2 rounded-full bg-[var(--primary)] inline-block" />
          Currently Teaching ({campus.busy.length})
        </p>
        {campus.busy.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] italic px-1">No teachers in class right now.</p>
        ) : (
          <div className="space-y-2">
            {campus.busy.map((t, i) => (
              <motion.div
                key={t.staffId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
                className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5"
              >
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0', AVATAR_COLORS[i % AVATAR_COLORS.length])}>
                  {getInitials(t.staffName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[var(--text)] truncate">{t.staffName}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{t.subjectName} · Section {t.sectionName}</p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] shrink-0">
                  Until {t.endTime}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
type Step = 'overview' | 'campus'

export default function TeachersLivePage() {
  const [step, setStep] = useState<Step>('overview')
  const [selectedCampusId, setSelectedCampusId] = useState<string | null>(null)
  const { data: allCampuses, isLoading, dataUpdatedAt, refetch } = useLiveTeachers()
  const selectedCampus = allCampuses?.find(c => c.campusId === selectedCampusId) ?? null
  const totalFree = allCampuses?.reduce((s, c) => s + c.free.length, 0) ?? 0
  const totalBusy = allCampuses?.reduce((s, c) => s + c.busy.length, 0) ?? 0
  const lastUpdate = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) : null

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-14 flex items-center gap-3 md:hidden">
        {step === 'campus' && (
          <button onClick={() => { setStep('overview'); setSelectedCampusId(null) }} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors shrink-0 active:scale-95">
            <ArrowLeft className="w-5 h-5 text-[var(--text)]" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-lg text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>Teachers Live</h1>
          {step === 'campus' && selectedCampus && (
            <p className="text-xs text-[var(--text-muted)] truncate">{selectedCampus.campusName}</p>
          )}
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors px-2.5 py-1.5 rounded-full bg-white/5 active:scale-95">
          <RefreshCw className="w-3.5 h-3.5" />
          {lastUpdate ?? 'Refresh'}
        </button>
      </header>

      <div className="p-4 space-y-4">
        {/* Summary bar (overview only) */}
        {step === 'overview' && !isLoading && allCampuses && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">{totalFree} free</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
              <span className="text-sm font-semibold text-[var(--primary)]">{totalBusy} teaching</span>
            </div>
            <span className="text-xs text-[var(--text-muted)] ml-auto">All campuses</span>
          </motion.div>
        )}

        {/* Loading skeleton */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
          </div>
        ) : step === 'overview' ? (
          !allCampuses?.length ? (
            <EmptyState icon={<Users size={28} className="text-[var(--primary)]" />} title="No campus data" description="No active campuses or timetable data available." />
          ) : (
            <div className="space-y-4">
              {allCampuses.map((campus, i) => (
                <CampusCard
                  key={campus.campusId}
                  campus={campus}
                  delay={0.05 + i * 0.08}
                  onClick={() => { setSelectedCampusId(campus.campusId); setStep('campus') }}
                />
              ))}
            </div>
          )
        ) : selectedCampus ? (
          <CampusDetailView campus={selectedCampus} />
        ) : null}
      </div>
    </div>
  )
}
