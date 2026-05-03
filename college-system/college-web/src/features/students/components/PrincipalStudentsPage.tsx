'use client'

import { useState } from 'react'
import { ArrowLeft, GraduationCap } from 'lucide-react'
import { CampusSelectorCards } from '@/components/shared/selection/CampusSelectorCards'
import { SectionSelectorCards } from '@/components/shared/selection/SectionSelectorCards'
import { StudentsPage } from './StudentsPage'
import { Button } from '@/components/ui/Button'
import type { CampusCardData, SectionCardData } from '@/components/shared/selection/types'

type Step = 'campus' | 'section' | 'students'

export function PrincipalStudentsPage() {
  const [step, setStep] = useState<Step>('campus')
  const [selectedCampusId, setSelectedCampusId] = useState<string | null>(null)
  const [selectedCampusName, setSelectedCampusName] = useState<string | null>(null)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [selectedSectionName, setSelectedSectionName] = useState<string | null>(null)
  const [viewAllCampuses, setViewAllCampuses] = useState(false)

  const handleCampusSelect = (campus: CampusCardData) => {
    setSelectedCampusId(campus.id)
    setSelectedCampusName(campus.name)
    setViewAllCampuses(false)
    setSelectedSectionId(null)
    setSelectedSectionName(null)
    setStep('section')
  }

  const handleAllCampuses = () => {
    setViewAllCampuses(true)
    setSelectedCampusId(null)
    setSelectedCampusName(null)
    setSelectedSectionId(null)
    setSelectedSectionName(null)
    setStep('students')
  }

  const handleSectionSelect = (section: SectionCardData) => {
    setSelectedSectionId(section.id)
    setSelectedSectionName(section.name)
    setStep('students')
  }

  const handleViewAllInCampus = () => {
    setSelectedSectionId(null)
    setSelectedSectionName(null)
    setStep('students')
  }

  // ── Step 1: Campus ────────────────────────────────────────────────
  if (step === 'campus') {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <header className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-14 flex items-center gap-3 md:hidden">
          <GraduationCap className="w-5 h-5 text-[var(--primary)]" />
          <h1 className="font-bold text-lg text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>Students</h1>
        </header>
        <div className="p-4 space-y-4">
          <p className="text-sm text-[var(--text-muted)]">Select a campus to browse students</p>
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

  // ── Step 2: Section ───────────────────────────────────────────────
  if (step === 'section' && selectedCampusId) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <header className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-14 flex items-center gap-3 md:hidden">
          <button
            onClick={() => { setSelectedCampusId(null); setStep('campus') }}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--text)]" />
          </button>
          <div>
            <h1 className="font-bold text-base text-[var(--text)]">Select Section</h1>
            <p className="text-xs text-[var(--text-muted)]">{selectedCampusName}</p>
          </div>
        </header>
        <div className="p-4 space-y-4">
          <SectionSelectorCards
            campusId={selectedCampusId}
            onSelect={handleSectionSelect}
            selectedId={selectedSectionId}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewAllInCampus}
            className="w-full justify-center py-3 rounded-xl border border-dashed border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40 transition-colors"
          >
            View All Students in {selectedCampusName}
          </Button>
        </div>
      </div>
    )
  }

  // ── Step 3: Students list ─────────────────────────────────────────
  const navigation = (
    <div className="flex items-center gap-2 mb-3 md:mb-4 -mt-2 md:mt-0 flex-wrap">
      <button
        onClick={() => {
          setSelectedSectionId(null)
          setSelectedSectionName(null)
          if (viewAllCampuses) {
            setViewAllCampuses(false)
            setStep('campus')
          } else {
            setStep('section')
          }
        }}
        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors md:hidden active:scale-95"
      >
        <ArrowLeft className="w-4 h-4 text-[var(--text)]" />
      </button>
      <span className="text-xs font-semibold text-[var(--primary)] bg-[var(--primary)]/10 px-2.5 py-1 rounded-full">
        {viewAllCampuses ? 'All Campuses' : selectedCampusName}
      </span>
      {selectedSectionName && (
        <span className="text-xs font-semibold text-[var(--text-muted)] bg-[var(--border)] px-2.5 py-1 rounded-full">
          {selectedSectionName}
        </span>
      )}
    </div>
  )

  return (
    <StudentsPage
      campusId={selectedCampusId ?? undefined}
      sectionId={selectedSectionId ?? undefined}
      navigation={navigation}
    />
  )
}
