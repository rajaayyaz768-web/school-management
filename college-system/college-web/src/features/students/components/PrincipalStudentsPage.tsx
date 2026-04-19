'use client'

import { useState } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CampusSelectorCards } from '@/components/shared/selection/CampusSelectorCards'
import { SectionSelectorCards } from '@/components/shared/selection/SectionSelectorCards'
import { StudentsPage } from './StudentsPage'
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

  if (step === 'campus') {
    return (
      <div className="flex flex-col gap-6 p-8">
        <PageHeader
          title="Students Management"
          subtitle="Select a campus to browse students"
        />
        <CampusSelectorCards
          onSelect={handleCampusSelect}
          showAllOption
          onSelectAll={handleAllCampuses}
          selectedId={selectedCampusId}
        />
      </div>
    )
  }

  if (step === 'section' && selectedCampusId) {
    return (
      <div className="flex flex-col gap-6 p-8">
        <PageHeader
          title="Students Management"
          subtitle="Select a section or view all students in this campus"
        />
        <div className="flex items-center gap-3 -mt-4">
          <Button variant="ghost" size="sm" onClick={() => { setSelectedCampusId(null); setStep('campus') }}>
            ← Back to Campuses
          </Button>
          <Badge variant="info">{selectedCampusName}</Badge>
        </div>
        <SectionSelectorCards
          campusId={selectedCampusId}
          onSelect={handleSectionSelect}
          selectedId={selectedSectionId}
        />
        <Button variant="ghost" size="sm" onClick={handleViewAllInCampus}>
          View All Students in {selectedCampusName}
        </Button>
      </div>
    )
  }

  const navigation = (
    <div className="flex items-center gap-3 mb-2 -mt-4">
      <Button
        variant="ghost"
        size="sm"
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
      >
        ← Change selection
      </Button>
      {viewAllCampuses
        ? <Badge variant="info">All Campuses</Badge>
        : selectedCampusName && <Badge variant="info">{selectedCampusName}</Badge>
      }
      {selectedSectionName && <Badge variant="neutral">{selectedSectionName}</Badge>}
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
