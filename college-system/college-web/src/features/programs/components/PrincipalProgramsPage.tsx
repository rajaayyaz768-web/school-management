'use client'

import { useState } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
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
      <div className="flex flex-col gap-6 p-8">
        <PageHeader
          title="Programs Management"
          subtitle="Select a campus to view programs"
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

  const navigation = (
    <div className="flex items-center gap-3 mb-4 -mt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setViewAllCampuses(false)
          setSelectedCampusId(null)
          setSelectedCampusName(null)
          setStep('campus')
        }}
      >
        ← Change Campus
      </Button>
      {viewAllCampuses
        ? <Badge variant="info">All Campuses</Badge>
        : selectedCampusName && <Badge variant="info">{selectedCampusName}</Badge>
      }
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
