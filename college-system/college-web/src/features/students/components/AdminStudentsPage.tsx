'use client'

import { useState } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useCampuses } from '@/features/campus/hooks/useCampus'
import { SectionSelectorCards } from '@/components/shared/selection/SectionSelectorCards'
import { StudentsPage } from './StudentsPage'
import type { SectionCardData } from '@/components/shared/selection/types'

type Step = 'section' | 'students'

export function AdminStudentsPage() {
  const [step, setStep] = useState<Step>('section')
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [selectedSectionName, setSelectedSectionName] = useState<string | null>(null)
  const [viewAll, setViewAll] = useState(false)

  const { data: campuses } = useCampuses()
  const campusId = campuses?.[0]?.id ?? ''

  const handleSectionSelect = (section: SectionCardData) => {
    setViewAll(false)
    setSelectedSectionId(section.id)
    setSelectedSectionName(section.name)
    setStep('students')
  }

  const handleViewAll = () => {
    setViewAll(true)
    setSelectedSectionId(null)
    setSelectedSectionName(null)
    setStep('students')
  }

  if (step === 'section' && campusId) {
    return (
      <div className="flex flex-col gap-6 p-8">
        <PageHeader
          title="Students Management"
          subtitle="Select a section to view students"
        />
        <SectionSelectorCards
          campusId={campusId}
          onSelect={handleSectionSelect}
          selectedId={selectedSectionId}
        />
        <Button variant="ghost" size="sm" onClick={handleViewAll}>
          View All Students
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
          setViewAll(false)
          setStep('section')
        }}
      >
        ← Change section
      </Button>
      {viewAll
        ? <Badge variant="neutral">All Students</Badge>
        : selectedSectionName && <Badge variant="info">{selectedSectionName}</Badge>
      }
    </div>
  )

  return (
    <StudentsPage
      sectionId={selectedSectionId ?? undefined}
      navigation={navigation}
    />
  )
}
