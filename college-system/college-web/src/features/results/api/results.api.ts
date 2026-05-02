import axios from '@/lib/axios'
import { StudentReportCard, SectionResultSummary, TopStudent, ExamReportCard } from '../types/results.types'

export const fetchStudentReportCard = async (
  studentId: string,
  academicYear?: string
): Promise<StudentReportCard> => {
  const params: Record<string, string> = {}
  if (academicYear) params.academicYear = academicYear
  const res = await axios.get(`/results/report-card/${studentId}`, { params })
  return res.data.data
}

export const fetchSectionResults = async (filters: {
  sectionId: string
  subjectId?: string
  examId?: string
}): Promise<SectionResultSummary[]> => {
  const params: Record<string, string> = { sectionId: filters.sectionId }
  if (filters.subjectId) params.subjectId = filters.subjectId
  if (filters.examId) params.examId = filters.examId
  const res = await axios.get('/results/section', { params })
  return res.data.data
}

export const fetchExamReportCard = async (
  studentId: string,
  examTypeId: string
): Promise<ExamReportCard> => {
  const res = await axios.get('/results/exam-report-card', { params: { studentId, examTypeId } })
  return res.data.data
}

export const fetchSectionStudentList = async (
  sectionId: string
): Promise<{ id: string; firstName: string; lastName: string; rollNumber: string | null }[]> => {
  const res = await axios.get('/results/section-students', { params: { sectionId } })
  return res.data.data
}

export const fetchTopStudents = async (
  sectionId: string,
  limit?: number
): Promise<TopStudent[]> => {
  const params: Record<string, string | number> = {}
  if (limit) params.limit = limit
  const res = await axios.get(`/results/top-students/${sectionId}`, { params })
  return res.data.data
}
