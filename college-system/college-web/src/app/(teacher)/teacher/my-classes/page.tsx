'use client'

import { BookOpen, Users, GraduationCap, Building2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useTeacherDashboard } from '@/features/dashboard/teacher/hooks/useTeacherDashboard'
import { TeacherSection } from '@/features/dashboard/teacher/types/teacher-dashboard.types'

function SectionCard({ section }: { section: TeacherSection }) {
  return (
    <Card hoverable className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[var(--radius)] bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text)] text-base">Section {section.name}</h3>
            <p className="text-sm text-[var(--text-muted)]">{section.gradeName}</p>
          </div>
        </div>
        <Badge variant="info">{section.programName}</Badge>
      </div>

      <div className="flex items-center gap-4 pt-2 border-t border-[var(--border)]">
        <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium text-[var(--text)]">{section.studentCount}</span>
          <span className="text-sm">students</span>
        </div>
        <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
          <GraduationCap className="w-4 h-4" />
          <span className="text-sm">{section.gradeName}</span>
        </div>
      </div>
    </Card>
  )
}

export default function TeacherMyClassesPage() {
  const { data, isLoading } = useTeacherDashboard()
  const sections = data?.mySections ?? []

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="My Classes"
        breadcrumb={[{ label: 'Home', href: '/teacher/dashboard' }, { label: 'My Classes' }]}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-36" />)}
        </div>
      ) : !sections.length ? (
        <div className="rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <EmptyState
            icon={<Building2 size={28} style={{ color: 'var(--primary)' }} />}
            title="No Classes Assigned"
            description="You haven't been assigned to any sections yet. Contact your administrator."
          />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <Users className="w-4 h-4" />
            <span>{sections.length} class{sections.length !== 1 ? 'es' : ''} assigned</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section) => (
              <SectionCard key={section.id} section={section} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
