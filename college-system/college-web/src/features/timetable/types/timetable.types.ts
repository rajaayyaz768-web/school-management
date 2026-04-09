export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT'
export type SlotType = 'THEORY' | 'PRACTICAL' | 'BREAK'

export interface PeriodConfig {
  id: string
  campusId: string
  gradeId: string
  totalPeriods: number
  periodDurationMins: number
  breakAfterPeriod: number
  createdAt: string
}

export interface SlotSubjectInfo {
  id: string
  name: string
  code: string
}

export interface SlotStaffInfo {
  id: string
  firstName: string
  lastName: string
  staffCode: string
  designation: string | null
}

export interface TimetableSlot {
  id: string
  sectionId: string
  subjectId: string | null
  staffId: string | null
  dayOfWeek: DayOfWeek
  slotNumber: number
  slotType: SlotType
  startTime: string
  endTime: string
  academicYear: string
  createdAt: string
  subject: SlotSubjectInfo | null
  staff: SlotStaffInfo | null
}

export interface SectionTimetable {
  sectionId: string
  sectionName: string
  academicYear: string
  slots: TimetableSlot[]
}

export interface ConflictCheckResult {
  hasConflict: boolean
  conflicts: Array<{
    staffId: string
    staffName: string
    dayOfWeek: string
    slotNumber: number
    existingSectionId: string
    existingSectionName: string
  }>
}

export interface CreateSlotInput {
  sectionId: string
  subjectId?: string
  staffId?: string
  dayOfWeek: DayOfWeek
  slotNumber: number
  slotType: SlotType
  startTime: string
  endTime: string
  academicYear: string
}

export interface UpdateSlotInput {
  subjectId?: string
  staffId?: string
  slotType?: SlotType
  startTime?: string
  endTime?: string
}

export interface PeriodConfigInput {
  campusId: string
  gradeId: string
  totalPeriods: number
  periodDurationMins: number
  breakAfterPeriod: number
}
