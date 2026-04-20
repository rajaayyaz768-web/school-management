'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
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
      <div className="flex flex-col gap-6 p-8">
        <PageHeader
          title="Reports"
          subtitle="Select a campus to generate reports"
        />
        <CampusSelectorCards onSelect={handleCampusSelect} selectedId={selectedCampusId} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-8">
      <PageHeader
        title="Reports"
        subtitle="Generate and download attendance, fee, and results reports"
      />
      <div className="flex items-center gap-3 -mt-4 mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setSelectedCampusId(null); setStep('campus') }}
        >
          ← Change Campus
        </Button>
        {selectedCampusName && <Badge variant="info">{selectedCampusName}</Badge>}
      </div>
      <AdminReportsContent campusId={selectedCampusId ?? undefined} />
    </div>
  )
}
