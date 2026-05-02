import { useQuery } from '@tanstack/react-query'
import {
  fetchStudentReportCard,
  fetchSectionResults,
  fetchTopStudents,
  fetchExamReportCard,
  fetchSectionStudentList,
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

export const useExamReportCard = (studentId: string, examTypeId: string) => {
  return useQuery({
    queryKey: ['exam-report-card', studentId, examTypeId],
    queryFn: () => fetchExamReportCard(studentId, examTypeId),
    enabled: !!studentId && !!examTypeId,
  })
}

export const useSectionStudentList = (sectionId: string) => {
  return useQuery({
    queryKey: ['section-students', sectionId],
    queryFn: () => fetchSectionStudentList(sectionId),
    enabled: !!sectionId,
  })
}

export const useTopStudents = (sectionId: string, limit?: number) => {
  return useQuery({
    queryKey: ['top-students', sectionId, limit],
    queryFn: () => fetchTopStudents(sectionId, limit),
    enabled: !!sectionId,
  })
}
