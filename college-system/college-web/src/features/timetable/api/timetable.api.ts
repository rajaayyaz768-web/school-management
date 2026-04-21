import axios from '@/lib/axios'
import {
  PeriodConfig,
  PeriodConfigInput,
  TimetableSlot,
  CreateSlotInput,
  UpdateSlotInput,
  SectionTimetable,
  TeacherSchedule,
  ConflictCheckResult,
  DayOfWeek
} from '../types/timetable.types'

export const upsertPeriodConfig = async (data: PeriodConfigInput): Promise<PeriodConfig> => {
  const res = await axios.post('/timetable/period-config', data)
  return res.data.data
}

export const fetchPeriodConfig = async (campusId: string, gradeId: string): Promise<PeriodConfig | null> => {
  const res = await axios.get('/timetable/period-config', { params: { campusId, gradeId } })
  return res.data.data ?? null
}

export const createSlot = async (data: CreateSlotInput): Promise<TimetableSlot> => {
  const res = await axios.post('/timetable/slots', data)
  return res.data.data
}

export const updateSlot = async (id: string, data: UpdateSlotInput): Promise<TimetableSlot> => {
  const res = await axios.put(`/timetable/slots/${id}`, data)
  return res.data.data
}

export const deleteSlot = async (id: string): Promise<void> => {
  await axios.delete(`/timetable/slots/${id}`)
}

export const checkConflict = async (
  staffId: string,
  dayOfWeek: DayOfWeek,
  slotNumber: number,
  academicYear: string,
  excludeSectionId?: string
): Promise<ConflictCheckResult> => {
  const res = await axios.get('/timetable/conflict-check', {
    params: { staffId, dayOfWeek, slotNumber, academicYear, excludeSectionId }
  })
  return res.data.data
}

export const fetchSectionTimetable = async (sectionId: string, academicYear: string): Promise<SectionTimetable> => {
  const res = await axios.get(`/timetable/section/${sectionId}`, { params: { academicYear } })
  return res.data.data
}

export const clearSectionTimetable = async (sectionId: string, academicYear: string): Promise<void> => {
  await axios.delete(`/timetable/section/${sectionId}/clear`, { params: { academicYear } })
}

export const fetchMyTeacherSchedule = async (academicYear: string): Promise<TeacherSchedule> => {
  const res = await axios.get('/timetable/my-schedule', { params: { academicYear } })
  return res.data.data
}

export interface LiveTeacherCampus {
  campusId: string
  campusName: string
  busy: {
    staffId: string
    staffName: string
    sectionName: string
    programCode: string
    gradeName: string
    subjectName: string
    slotNumber: number
    endTime: string
  }[]
  free: { staffId: string; staffName: string }[]
}

export const fetchLiveTeachers = async (campusId?: string): Promise<LiveTeacherCampus[]> => {
  const res = await axios.get('/timetable/live/teachers', { params: campusId ? { campusId } : {} })
  return res.data.data
}
