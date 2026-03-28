import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/useToast'
import {
  fetchStudentsForAttendance,
  markStudentAttendance,
  fetchSectionAttendanceReport,
  fetchStudentAttendanceSummary
} from '../api/student-attendance.api'
import { MarkStudentAttendanceInput } from '../types/student-attendance.types'

export const useStudentsForAttendance = (
  sectionId: string,
  subjectId: string,
  date: string
) => {
  return useQuery({
    queryKey: ['student-attendance', 'list', sectionId, subjectId, date],
    queryFn: () => fetchStudentsForAttendance(sectionId, subjectId, date),
    enabled: !!sectionId && !!subjectId && !!date,
  })
}

export const useSectionAttendanceReport = (
  sectionId: string,
  subjectId: string,
  date: string
) => {
  return useQuery({
    queryKey: ['student-attendance', 'report', sectionId, subjectId, date],
    queryFn: () => fetchSectionAttendanceReport(sectionId, subjectId, date),
    enabled: !!sectionId && !!subjectId && !!date,
  })
}

export const useStudentAttendanceSummary = (
  studentId: string,
  subjectId?: string
) => {
  return useQuery({
    queryKey: ['student-attendance', 'summary', studentId, subjectId],
    queryFn: () => fetchStudentAttendanceSummary(studentId, subjectId),
    enabled: !!studentId,
  })
}

export const useMarkStudentAttendance = () => {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (data: MarkStudentAttendanceInput) => markStudentAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-attendance'] })
      toast.success('Student attendance marked successfully')
    },
    onError: () => {
      toast.error('Failed to mark attendance')
    }
  })
}
