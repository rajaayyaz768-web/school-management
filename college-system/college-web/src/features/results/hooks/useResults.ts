import { useQuery } from '@tanstack/react-query'
import {
  fetchStudentReportCard,
  fetchSectionResults,
  fetchTopStudents,
} from '../api/results.api'

export const useStudentReportCard = (studentId: string, academicYear?: string) => {
  return useQuery({
    queryKey: ['report-card', studentId, academicYear],
    queryFn: () => fetchStudentReportCard(studentId, academicYear),
    enabled: !!studentId,
  })
}

interface SectionResultFilters {
  sectionId: string
  subjectId?: string
  examId?: string
}

export const useSectionResults = (filters: SectionResultFilters) => {
  return useQuery({
    queryKey: ['section-results', filters],
    queryFn: () => fetchSectionResults(filters),
    enabled: !!filters.sectionId,
  })
}

export const useTopStudents = (sectionId: string, limit?: number) => {
  return useQuery({
    queryKey: ['top-students', sectionId, limit],
    queryFn: () => fetchTopStudents(sectionId, limit),
    enabled: !!sectionId,
  })
}
