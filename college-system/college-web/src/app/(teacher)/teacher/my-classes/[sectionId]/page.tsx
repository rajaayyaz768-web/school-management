'use client'

import { use } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StudentTable } from '@/features/students/components/StudentTable'
import { useStudentsBySection } from '@/features/students/hooks/useStudents'

export default function TeacherSectionStudentsPage({ params }: { params: Promise<{ sectionId: string }> }) {
  const { sectionId } = use(params)
  const { data: students, isLoading } = useStudentsBySection(sectionId)

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Section Students"
        breadcrumb={[
          { label: 'Home', href: '/teacher/dashboard' },
          { label: 'My Classes', href: '/teacher/my-classes' },
          { label: 'Students' },
        ]}
      />
      <StudentTable
        students={students ?? []}
        isLoading={isLoading}
        onView={() => {}}
      />
    </div>
  )
}
