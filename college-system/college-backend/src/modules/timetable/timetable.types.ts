import { DayOfWeek, SlotType } from '@prisma/client'

export interface PeriodConfigDto {
	campusId: string
	gradeId: string
	totalPeriods: number
	periodDurationMins: number
	breakAfterPeriod: number
}

export interface PeriodConfigResponse {
	id: string
	campusId: string
	gradeId: string
	totalPeriods: number
	periodDurationMins: number
	breakAfterPeriod: number
	createdAt: string
}

export interface CreateSlotDto {
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

export interface UpdateSlotDto {
	subjectId?: string
	staffId?: string
	slotType?: SlotType
	startTime?: string
	endTime?: string
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

export interface TimetableSlotResponse {
	id: string
	sectionId: string
	subjectId: string | null
	staffId: string | null
	dayOfWeek: string
	slotNumber: number
	slotType: string
	startTime: string
	endTime: string
	academicYear: string
	createdAt: string
	subject: SlotSubjectInfo | null
	staff: SlotStaffInfo | null
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

export interface SectionTimetable {
	sectionId: string
	sectionName: string
	academicYear: string
	slots: TimetableSlotResponse[]
}

export interface TeacherTimetable {
	staffId: string
	staffName: string
	academicYear: string
	slots: TimetableSlotResponse[]
}
