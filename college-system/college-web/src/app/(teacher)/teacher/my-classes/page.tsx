'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { Users, Building2, ChevronRight } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { useTeacherDashboard } from '@/features/dashboard/teacher/hooks/useTeacherDashboard'
import { TeacherSection } from '@/features/dashboard/teacher/types/teacher-dashboard.types'

const AVATAR_COLORS = [
  'bg-[var(--primary)]',
  'bg-[var(--gold)]',
  'bg-purple-600',
  'bg-blue-600',
  'bg-rose-600',
]

function SectionCard({ section, index }: { section: TeacherSection; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Link
        href={`/teacher/my-classes/${section.id}`}
        className="block bg-[var(--surface)] border border-[var(--border)] rounded-xl relative overflow-hidden flex items-center hover:bg-[var(--surface-hover)] transition-colors active:scale-[0.99] group"
      >
        {/* Left accent border */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary)]" />

        <div className="flex-1 pl-5 pr-3 py-4">
          <h2 className="text-lg font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
            Section {section.name}
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {section.programName} · {section.gradeName}
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium text-[var(--text)]">{section.studentCount}</span>
              <span className="text-sm">students</span>
            </div>
            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <Building2 className="w-4 h-4" />
              <span className="text-sm">{section.programName}</span>
            </div>
          </div>
        </div>

        <div className="pr-4 shrink-0">
          <ChevronRight className="w-5 h-5 text-[var(--gold)]" />
        </div>
      </Link>
    </motion.div>
  )
}

export default function TeacherMyClassesPage() {
  const { data, isLoading } = useTeacherDashboard()
  const sections = data?.mySections ?? []

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-16 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg text-[var(--text)]">My Classes</h1>
          {!isLoading && (
            <p className="text-xs text-[var(--text-muted)]">
              {sections.length} class{sections.length !== 1 ? 'es' : ''} assigned
            </p>
          )}
        </div>
      </header>

      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-[var(--surface)] border border-[var(--border)] animate-pulse" />
            ))}
          </div>
        ) : sections.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              icon={<Building2 size={32} className="text-[var(--primary)]" />}
              title="No Classes Assigned"
              description="You haven't been assigned to any sections yet. Contact your administrator."
            />
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((section, i) => (
              <SectionCard key={section.id} section={section} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
