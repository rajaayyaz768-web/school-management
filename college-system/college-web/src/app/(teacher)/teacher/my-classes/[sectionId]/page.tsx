'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { ArrowLeft, Search, Users } from 'lucide-react'
import { useStudentsBySection } from '@/features/students/hooks/useStudents'

const AVATAR_COLORS = [
  'bg-[var(--primary)]',
  'bg-[var(--gold)]',
  'bg-purple-600',
  'bg-blue-600',
  'bg-rose-600',
  'bg-emerald-600',
]

function getInitials(first: string, last: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase()
}

export default function TeacherSectionStudentsPage({ params }: { params: Promise<{ sectionId: string }> }) {
  const { sectionId } = use(params)
  const router = useRouter()
  const { data: students, isLoading } = useStudentsBySection(sectionId)
  const [search, setSearch] = useState('')

  const filtered = (students ?? []).filter(s => {
    const name = `${s.firstName} ${s.lastName}`.toLowerCase()
    const roll = (s.rollNumber ?? '').toLowerCase()
    const q = search.toLowerCase()
    return name.includes(q) || roll.includes(q)
  })

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-16 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--surface)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--text)]" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-base text-[var(--text)] truncate">Section Students</h1>
        </div>
        {!isLoading && (
          <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--primary)]/15 text-[var(--primary)]">
            {students?.length ?? 0} students
          </span>
        )}
      </header>

      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3 h-11">
          <Search className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none"
          />
        </div>
      </div>

      <div className="px-4 py-2 space-y-2 pb-6">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-[var(--surface)] border border-[var(--border)] animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="mt-12 text-center">
            <Users className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-sm font-medium text-[var(--text-muted)]">
              {search ? 'No students match your search' : 'No students in this section'}
            </p>
          </div>
        ) : (
          filtered.map((student, i) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                  {getInitials(student.firstName, student.lastName)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-[var(--text)] truncate">
                    {student.firstName} {student.lastName}
                  </p>
                  {student.rollNumber && (
                    <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">{student.rollNumber}</p>
                  )}
                </div>
              </div>
              <span className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                View
              </span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
