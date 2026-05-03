'use client'

import { useState } from 'react'
import { ArrowLeft, ClipboardList } from 'lucide-react'
import { CampusSelectorCards } from '@/components/shared/selection/CampusSelectorCards'
import { AdminReportsContent } from '@/app/(admin)/reports/page'
import type { CampusCardData } from '@/components/shared/selection/types'

type Step = 'campus' | 'reports'

export default function PrincipalReportsPage() {
  const [step, setStep] = useState<Step>('campus')
  const [selectedCampusId, setSelectedCampusId] = useState<string | null>(null)
  const [selectedCampusName, setSelectedCampusName] = useState<string | null>(null)

  const handleCampusSelect = (campus: CampusCardData) => {
    setSelectedCampusId(campus.id)
    setSelectedCampusName(campus.name)
    setStep('reports')
  }

  if (step === 'campus') {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <header className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-14 flex items-center gap-3 md:hidden">
          <ClipboardList className="w-5 h-5 text-[var(--primary)]" />
          <h1 className="font-bold text-lg text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>Reports</h1>
        </header>
        <div className="p-4 space-y-4">
          <p className="text-sm text-[var(--text-muted)]">Select a campus to generate reports</p>
          <CampusSelectorCards onSelect={handleCampusSelect} selectedId={selectedCampusId} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-14 flex items-center gap-3 md:hidden">
        <button
          onClick={() => { setSelectedCampusId(null); setStep('campus') }}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors shrink-0 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--text)]" />
        </button>
        <div>
          <h1 className="font-bold text-base text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>Reports</h1>
          <p className="text-xs text-[var(--text-muted)]">{selectedCampusName}</p>
        </div>
      </header>
      <div className="p-4">
        <AdminReportsContent campusId={selectedCampusId ?? undefined} />
      </div>
    </div>
  )
}
