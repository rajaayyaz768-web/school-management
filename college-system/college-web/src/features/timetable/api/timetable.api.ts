import axios from '@/lib/axios'
import {
  PeriodConfig,
  PeriodConfigInput,
  TimetableSlot,
  CreateSlotInput,
  UpdateSlotInput,
  SectionTimetable,
  ConflictCheckResult,
  DayOfWeek
} from '../types/timetable.types'

export const upsertPeriodConfig = async (data: PeriodConfigInput): Promise<PeriodConfig> => {
  const res = await axios.post('/api/v1/timetable/period-config', data)
  return res.data.data
}

export const fetchPeriodConfig = async (campusId: string, gradeId: string): Promise<PeriodConfig | null> => {
  const res = await axios.get('/api/v1/timetable/period-config', { params: { campusId, gradeId } })
  return res.data.data ?? null
}

export const createSlot = async (data: CreateSlotInput): Promise<TimetableSlot> => {
  const res = await axios.post('/api/v1/timetable/slots', data)
  return res.data.data
}

export const updateSlot = async (id: string, data: UpdateSlotInput): Promise<TimetableSlot> => {
  const res = await axios.put(`/api/v1/timetable/slots/${id}`, data)
  return res.data.data
}

export const deleteSlot = async (id: string): Promise<void> => {
  await axios.delete(`/api/v1/timetable/slots/${id}`)
}

export const checkConflict = async (
  staffId: string,
  dayOfWeek: DayOfWeek,
  slotNumber: number,
  academicYear: string,
  excludeSectionId?: string
): Promise<ConflictCheckResult> => {
  const res = await axios.get('/api/v1/timetable/conflict-check', {
    params: { staffId, dayOfWeek, slotNumber, academicYear, excludeSectionId }
  })
  return res.data.data
}

export const fetchSectionTimetable = async (sectionId: string, academicYear: string): Promise<SectionTimetable> => {
  const res = await axios.get(`/api/v1/timetable/section/${sectionId}`, { params: { academicYear } })
  return res.data.data
}

export const clearSectionTimetable = async (sectionId: string, academicYear: string): Promise<void> => {
  await axios.delete(`/api/v1/timetable/section/${sectionId}/clear`, { params: { academicYear } })
}
