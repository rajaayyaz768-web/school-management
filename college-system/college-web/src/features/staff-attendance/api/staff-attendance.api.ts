import axios from '@/lib/axios'
import {
  StaffWithAttendance,
  MarkAttendanceInput,
  DailyAttendanceReport,
  StaffAttendanceRecord,
  StaffAttendanceSummaryItem,
  AbsentByCampusGroup,
  StaffAttendanceHistoryResponse,
} from '../types/staff-attendance.types'

export const fetchStaffForAttendance = async (
  campusId: string,
  date: string
): Promise<StaffWithAttendance[]> => {
  const res = await axios.get('/staff-attendance/staff-list', {
    params: { campusId, date }
  })
  return res.data.data
}

export const markDailyAttendance = async (
  data: MarkAttendanceInput
): Promise<DailyAttendanceReport> => {
  const res = await axios.post('/staff-attendance/mark', data)
  return res.data.data
}

export const fetchDailyReport = async (
  campusId: string,
  date: string
): Promise<DailyAttendanceReport> => {
  const res = await axios.get('/staff-attendance/daily-report', {
    params: { campusId, date }
  })
  return res.data.data
}

export const fetchAbsentStaffToday = async (
  campusId: string,
  date: string
): Promise<StaffAttendanceRecord[]> => {
  const res = await axios.get('/staff-attendance/absent-today', {
    params: { campusId, date }
  })
  return res.data.data
}

export const fetchMonthlySummary = async (
  campusId: string,
  month?: number,
  year?: number
): Promise<StaffAttendanceSummaryItem[]> => {
  const res = await axios.get('/staff-attendance/monthly-summary', {
    params: { campusId, month, year }
  })
  return res.data.data
}

export const fetchAbsentByCampus = async (
  date?: string
): Promise<AbsentByCampusGroup[]> => {
  const res = await axios.get('/staff-attendance/absent-by-campus', {
    params: { date }
  })
  return res.data.data
}

export const fetchStaffAttendanceHistory = async (
  staffId: string,
  month?: number,
  year?: number
): Promise<StaffAttendanceHistoryResponse> => {
  const res = await axios.get(`/staff-attendance/history/${staffId}`, {
    params: { month, year }
  })
  return res.data.data
}
