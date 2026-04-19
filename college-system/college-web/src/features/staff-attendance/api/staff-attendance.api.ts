import axios from '@/lib/axios'
import {
  StaffWithAttendance,
  MarkAttendanceInput,
  DailyAttendanceReport,
  StaffAttendanceRecord
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
