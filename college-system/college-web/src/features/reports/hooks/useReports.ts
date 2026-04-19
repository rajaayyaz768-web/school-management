import { useMutation, useQuery } from '@tanstack/react-query'
import { useToast } from '@/hooks/useToast'
import {
  downloadAttendanceExcel,
  printAttendanceReport,
  downloadFeeExcel,
  printFeeReport,
  downloadResultsExcel,
  printResultsReport,
  fetchAcademicYears,
} from '../api/reports.api'
import { AttendanceReportFilters, FeeReportFilters, ResultsReportFilters } from '../types/reports.types'

export const useAcademicYears = (campusId?: string) => {
  return useQuery({
    queryKey: ['report-academic-years', campusId],
    queryFn: () => fetchAcademicYears(campusId),
    enabled: true,
  })
}

function useErrorHandler() {
  const toast = useToast()
  return (error: unknown) => {
    const msg =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      (error instanceof Error ? error.message : 'Something went wrong')
    toast.error(msg)
  }
}

export const useDownloadAttendanceExcel = () => {
  const toast = useToast()
  const onError = useErrorHandler()
  return useMutation({
    mutationFn: (filters: AttendanceReportFilters) => downloadAttendanceExcel(filters),
    onSuccess: () => toast.success('Report downloaded'),
    onError,
  })
}

export const usePrintAttendanceReport = () => {
  const onError = useErrorHandler()
  return useMutation({
    mutationFn: (filters: AttendanceReportFilters) => printAttendanceReport(filters),
    onError,
  })
}

export const useDownloadFeeExcel = () => {
  const toast = useToast()
  const onError = useErrorHandler()
  return useMutation({
    mutationFn: (filters: FeeReportFilters) => downloadFeeExcel(filters),
    onSuccess: () => toast.success('Report downloaded'),
    onError,
  })
}

export const usePrintFeeReport = () => {
  const onError = useErrorHandler()
  return useMutation({
    mutationFn: (filters: FeeReportFilters) => printFeeReport(filters),
    onError,
  })
}

export const useDownloadResultsExcel = () => {
  const toast = useToast()
  const onError = useErrorHandler()
  return useMutation({
    mutationFn: (filters: ResultsReportFilters) => downloadResultsExcel(filters),
    onSuccess: () => toast.success('Report downloaded'),
    onError,
  })
}

export const usePrintResultsReport = () => {
  const onError = useErrorHandler()
  return useMutation({
    mutationFn: (filters: ResultsReportFilters) => printResultsReport(filters),
    onError,
  })
}
