'use client'

import { useState } from 'react'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { CampusSelectorCards } from '@/components/shared/selection/CampusSelectorCards'
import { ProgramsPage } from './ProgramsPage'
import type { CampusCardData } from '@/components/shared/selection/types'

type Step = 'campus' | 'programs'

export function PrincipalProgramsPage() {
  const [step, setStep] = useState<Step>('campus')
  const [selectedCampusId, setSelectedCampusId] = useState<string | null>(null)
  const [selectedCampusName, setSelectedCampusName] = useState<string | null>(null)
  const [viewAllCampuses, setViewAllCampuses] = useState(false)

  const handleCampusSelect = (campus: CampusCardData) => {
    setSelectedCampusId(campus.id)
    setSelectedCampusName(campus.name)
    setViewAllCampuses(false)
    setStep('programs')
  }

  const handleAllCampuses = () => {
    setViewAllCampuses(true)
    setSelectedCampusId(null)
    setSelectedCampusName(null)
    setStep('programs')
  }

  if (step === 'campus') {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <header className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-14 flex items-center gap-3 md:hidden">
          <BookOpen className="w-5 h-5 text-[var(--primary)]" />
          <h1 className="font-bold text-lg text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>Programs</h1>
        </header>
        <div className="p-4 space-y-4">
          <p className="text-sm text-[var(--text-muted)]">Select a campus to view programs</p>
          <CampusSelectorCards
            onSelect={handleCampusSelect}
            showAllOption
            onSelectAll={handleAllCampuses}
            selectedId={selectedCampusId}
          />
        </div>
      </div>
    )
  }

  const navigation = (
    <div className="flex items-center gap-2 mb-3 md:mb-4 -mt-2 md:mt-0">
      <button
        onClick={() => { setViewAllCampuses(false); setSelectedCampusId(null); setSelectedCampusName(null); setStep('campus') }}
        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors md:hidden active:scale-95"
      >
        <ArrowLeft className="w-4 h-4 text-[var(--text)]" />
      </button>
      <span className="text-xs font-semibold text-[var(--primary)] bg-[var(--primary)]/10 px-2.5 py-1 rounded-full">
        {viewAllCampuses ? 'All Campuses' : selectedCampusName}
      </span>
    </div>
  )

  return (
    <ProgramsPage
      campusId={selectedCampusId ?? undefined}
      groupByCampus={viewAllCampuses}
      navigation={navigation}
    />
  )
}
