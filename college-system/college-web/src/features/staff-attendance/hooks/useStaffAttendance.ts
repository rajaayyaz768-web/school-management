import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/useToast'
import {
  fetchStaffForAttendance,
  markDailyAttendance,
  fetchDailyReport,
  fetchAbsentStaffToday,
  fetchMonthlySummary,
  fetchAbsentByCampus,
  fetchStaffAttendanceHistory,
} from '../api/staff-attendance.api'
import { MarkAttendanceInput } from '../types/staff-attendance.types'

export const useStaffForAttendance = (campusId: string, date: string) => {
  return useQuery({
    queryKey: ['staff-attendance', 'list', campusId, date],
    queryFn: () => fetchStaffForAttendance(campusId, date),
    enabled: !!campusId && !!date,
  })
}

export const useDailyReport = (campusId: string, date: string) => {
  return useQuery({
    queryKey: ['staff-attendance', 'report', campusId, date],
    queryFn: () => fetchDailyReport(campusId, date),
    enabled: !!campusId && !!date,
  })
}

export const useAbsentStaffToday = (campusId: string, date: string) => {
  return useQuery({
    queryKey: ['staff-attendance', 'absent', campusId, date],
    queryFn: () => fetchAbsentStaffToday(campusId, date),
    enabled: !!campusId && !!date,
  })
}

export const useMonthlySummary = (campusId: string, month?: number, year?: number) => {
  return useQuery({
    queryKey: ['staff-attendance', 'monthly-summary', campusId, month, year],
    queryFn: () => fetchMonthlySummary(campusId, month, year),
    enabled: !!campusId,
  })
}

export const useAbsentByCampus = (date?: string) => {
  return useQuery({
    queryKey: ['staff-attendance', 'absent-by-campus', date],
    queryFn: () => fetchAbsentByCampus(date),
  })
}

export const useStaffAttendanceHistory = (staffId: string | null, month?: number, year?: number) => {
  return useQuery({
    queryKey: ['staff-attendance', 'history', staffId, month, year],
    queryFn: () => fetchStaffAttendanceHistory(staffId!, month, year),
    enabled: !!staffId,
  })
}

export const useMarkDailyAttendance = () => {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (data: MarkAttendanceInput) => markDailyAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-attendance'] })
      toast.success('Attendance marked successfully')
    },
    onError: () => {
      toast.error('Failed to mark attendance')
    }
  })
}
