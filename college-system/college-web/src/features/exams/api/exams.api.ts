import axios from '@/lib/axios'
import {
  ExamType,
  Exam,
  ExamResult,
  ExamSchedule,
  CreateExamInput,
  UpdateExamInput,
  BulkEnterResultsInput,
  CreateExamScheduleInput,
  CreateClassTestInput,
} from '../types/exams.types'

export const fetchExamTypes = async (campusId?: string): Promise<ExamType[]> => {
  const params: Record<string, string> = {}
  if (campusId) params.campusId = campusId
  const res = await axios.get('/exams/types', { params })
  return res.data.data
}

export const createExamType = async (data: { name: string; campusId: string }): Promise<ExamType> => {
  const res = await axios.post('/exams/types', data)
  return res.data.data
}

export const fetchExams = async (filters?: {
  sectionId?: string
  subjectId?: string
  examTypeId?: string
  status?: string
  isClassTest?: boolean
}): Promise<Exam[]> => {
  const params: Record<string, string> = {}
  if (filters?.sectionId) params.sectionId = filters.sectionId
  if (filters?.subjectId) params.subjectId = filters.subjectId
  if (filters?.examTypeId) params.examTypeId = filters.examTypeId
  if (filters?.status && filters.status !== 'ALL') params.status = filters.status
  if (filters?.isClassTest !== undefined) params.isClassTest = String(filters.isClassTest)
  const res = await axios.get('/exams', { params })
  return res.data.data
}

export const fetchExamSchedules = async (campusId?: string): Promise<ExamSchedule[]> => {
  const params: Record<string, string> = {}
  if (campusId) params.campusId = campusId
  const res = await axios.get('/exams/schedules', { params })
  return res.data.data
}

export const createExamSchedule = async (
  data: CreateExamScheduleInput
): Promise<{ scheduleId: string; examCount: number }> => {
  const res = await axios.post('/exams/schedule', data)
  return res.data.data
}

export const createClassTest = async (data: CreateClassTestInput): Promise<Exam> => {
  const res = await axios.post('/exams/class-test', data)
  return res.data.data
}

export const fetchExamById = async (id: string): Promise<Exam> => {
  const res = await axios.get(`/exams/${id}`)
  return res.data.data
}

export const createExam = async (data: CreateExamInput): Promise<Exam> => {
  const res = await axios.post('/exams', data)
  return res.data.data
}

export const updateExam = async (id: string, data: UpdateExamInput): Promise<Exam> => {
  const res = await axios.put(`/exams/${id}`, data)
  return res.data.data
}

export const deleteExam = async (id: string): Promise<void> => {
  await axios.delete(`/exams/${id}`)
}

export const fetchExamResults = async (examId: string): Promise<ExamResult[]> => {
  const res = await axios.get(`/exams/${examId}/results`)
  return res.data.data
}

export const enterBulkResults = async (data: BulkEnterResultsInput): Promise<ExamResult[]> => {
  const res = await axios.post('/exams/results/bulk', data)
  return res.data.data
}
