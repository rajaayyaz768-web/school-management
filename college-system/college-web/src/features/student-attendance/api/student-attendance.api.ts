import axios from '@/lib/axios'
import {
  StudentWithAttendance,
  MarkStudentAttendanceInput,
  SectionAttendanceReport,
  StudentAttendanceSummary,
  StudentAttendanceRecord
} from '../types/student-attendance.types'

export const fetchStudentsForAttendance = async (
  sectionId: string,
  subjectId: string,
  date: string
): Promise<StudentWithAttendance[]> => {
  const res = await axios.get('/student-attendance/students-list', {
    params: { sectionId, subjectId, date }
  })
  return res.data.data
}

export const markStudentAttendance = async (
  data: MarkStudentAttendanceInput
): Promise<SectionAttendanceReport> => {
  const res = await axios.post('/student-attendance/mark', data)
  return res.data.data
}

export const fetchSectionAttendanceReport = async (
  sectionId: string,
  subjectId: string,
  date: string
): Promise<SectionAttendanceReport> => {
  const res = await axios.get('/student-attendance/section-report', {
    params: { sectionId, subjectId, date }
  })
  return res.data.data
}

export const fetchStudentAttendanceSummary = async (
  studentId: string,
  subjectId?: string
): Promise<StudentAttendanceSummary> => {
  const res = await axios.get(`/student-attendance/summary/${studentId}`, {
    params: subjectId ? { subjectId } : {}
  })
  return res.data.data
}
