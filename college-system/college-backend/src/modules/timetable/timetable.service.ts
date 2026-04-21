import { PrismaClient, DayOfWeek, SlotType, Role } from '@prisma/client'
import {
	PeriodConfigDto,
	CreateSlotDto,
	UpdateSlotDto,
	TimetableSlotResponse,
	PeriodConfigResponse,
	ConflictCheckResult,
	SectionTimetable,
	TeacherTimetable
} from './timetable.types'
import { assertSectionCampus, requireOwnCampus } from '../../utils/campusGuard'

interface RequestUser { id: string; role: Role; campusId: string | null }

const prisma = new PrismaClient()

const slotInclude = {
	subject: {
		select: { id: true, name: true, code: true }
	},
	staff: {
		select: { id: true, firstName: true, lastName: true, staffCode: true, designation: true }
	}
}

function mapSlotToResponse(slot: any): TimetableSlotResponse {
	return {
		id: slot.id,
		sectionId: slot.sectionId,
		subjectId: slot.subjectId ?? null,
		staffId: slot.staffId ?? null,
		dayOfWeek: slot.dayOfWeek,
		slotNumber: slot.slotNumber,
		slotType: slot.slotType,
		startTime: slot.startTime,
		endTime: slot.endTime,
		academicYear: slot.academicYear,
		createdAt: slot.createdAt.toISOString(),
		subject: slot.subject ? {
			id: slot.subject.id,
			name: slot.subject.name,
			code: slot.subject.code,
		} : null,
		staff: slot.staff ? {
			id: slot.staff.id,
			firstName: slot.staff.firstName,
			lastName: slot.staff.lastName,
			staffCode: slot.staff.staffCode,
			designation: slot.staff.designation ?? null,
		} : null,
	}
}

export const upsertPeriodConfig = async (data: PeriodConfigDto, user?: RequestUser): Promise<PeriodConfigResponse> => {
	if (user) requireOwnCampus(user, data.campusId)
	const config = await prisma.timetablePeriodsConfig.upsert({
		where: { campusId_gradeId: { campusId: data.campusId, gradeId: data.gradeId } },
		create: {
			campusId: data.campusId,
			gradeId: data.gradeId,
			totalPeriods: data.totalPeriods,
			periodDurationMins: data.periodDurationMins,
			breakAfterPeriod: data.breakAfterPeriod,
		},
		update: {
			totalPeriods: data.totalPeriods,
			periodDurationMins: data.periodDurationMins,
			breakAfterPeriod: data.breakAfterPeriod,
		}
	})

	return {
		id: config.id,
		campusId: config.campusId,
		gradeId: config.gradeId,
		totalPeriods: config.totalPeriods,
		periodDurationMins: config.periodDurationMins,
		breakAfterPeriod: config.breakAfterPeriod,
		createdAt: config.createdAt.toISOString(),
	}
}

export const getPeriodConfig = async (campusId: string, gradeId: string): Promise<PeriodConfigResponse | null> => {
	const config = await prisma.timetablePeriodsConfig.findUnique({ where: { campusId_gradeId: { campusId, gradeId } } })

	if (!config) {
		return null
	}

	return {
		id: config.id,
		campusId: config.campusId,
		gradeId: config.gradeId,
		totalPeriods: config.totalPeriods,
		periodDurationMins: config.periodDurationMins,
		breakAfterPeriod: config.breakAfterPeriod,
		createdAt: config.createdAt.toISOString(),
	}
}

export const createSlot = async (data: CreateSlotDto, user?: RequestUser): Promise<TimetableSlotResponse> => {
	if (user) await assertSectionCampus(data.sectionId, user)

	if (data.slotType !== SlotType.BREAK && data.staffId) {
		const conflict = await checkConflict(data.staffId, data.dayOfWeek, data.slotNumber, data.academicYear, data.sectionId)
		if (conflict.hasConflict) {
			const firstConflict = conflict.conflicts[0]
			const error = new Error(`Teacher conflict: ${firstConflict.staffName} is already assigned to ${firstConflict.existingSectionName} at this time`) as any
			error.status = 409
			throw error
		}
	}

	const result = await prisma.timetableSlot.upsert({
		where: { sectionId_dayOfWeek_slotNumber_academicYear: { sectionId: data.sectionId, dayOfWeek: data.dayOfWeek, slotNumber: data.slotNumber, academicYear: data.academicYear } },
		create: {
			sectionId: data.sectionId,
			subjectId: data.subjectId,
			staffId: data.staffId,
			dayOfWeek: data.dayOfWeek,
			slotNumber: data.slotNumber,
			slotType: data.slotType,
			startTime: data.startTime,
			endTime: data.endTime,
			academicYear: data.academicYear,
		},
		update: {
			subjectId: data.subjectId,
			staffId: data.staffId,
			slotType: data.slotType,
			startTime: data.startTime,
			endTime: data.endTime,
		},
		include: slotInclude,
	})

	return mapSlotToResponse(result)
}

export const bulkCreateSlots = async (slots: CreateSlotDto[], user?: RequestUser): Promise<TimetableSlotResponse[]> => {
	const results: TimetableSlotResponse[] = []
	for (const slot of slots) {
		const result = await createSlot(slot, user)
		results.push(result)
	}
	return results
}

export const updateSlot = async (id: string, data: UpdateSlotDto, user?: RequestUser): Promise<TimetableSlotResponse> => {
	const existing = await prisma.timetableSlot.findUnique({ where: { id }, include: slotInclude })
	if (!existing) {
		const error = new Error('Attendance record not found') as any
		error.status = 404
		throw error
	}

	if (user) await assertSectionCampus(existing.sectionId, user)

	if (data.staffId && data.staffId !== existing.staffId && (data.slotType ?? existing.slotType) !== SlotType.BREAK) {
		const conflict = await checkConflict(data.staffId, existing.dayOfWeek, existing.slotNumber, existing.academicYear, existing.sectionId)
		if (conflict.hasConflict) {
			const firstConflict = conflict.conflicts[0]
			const error = new Error(`Teacher conflict: ${firstConflict.staffName} is already assigned to ${firstConflict.existingSectionName} at this time`) as any
			error.status = 409
			throw error
		}
	}

	const updated = await prisma.timetableSlot.update({ where: { id }, data, include: slotInclude })
	return mapSlotToResponse(updated)
}

export const deleteSlot = async (id: string, user?: RequestUser): Promise<void> => {
	const existing = await prisma.timetableSlot.findUnique({ where: { id } })
	if (!existing) {
		const error = new Error('Attendance record not found') as any
		error.status = 404
		throw error
	}

	if (user) await assertSectionCampus(existing.sectionId, user)

	await prisma.timetableSlot.delete({ where: { id } })
}

export const checkConflict = async (staffId: string, dayOfWeek: DayOfWeek, slotNumber: number, academicYear: string, excludeSectionId?: string): Promise<ConflictCheckResult> => {
	const conflicts = await prisma.timetableSlot.findMany({
		where: {
			staffId,
			dayOfWeek,
			slotNumber,
			academicYear,
			...(excludeSectionId ? { sectionId: { not: excludeSectionId } } : {}),
		},
		include: {
			section: { select: { id: true, name: true } },
			staff: { select: { id: true, firstName: true, lastName: true } },
		}
	})

	if (conflicts.length > 0) {
		return {
			hasConflict: true,
			conflicts: conflicts.map((c) => ({
				staffId: c.staff?.id ?? staffId,
				staffName: c.staff ? `${c.staff.firstName} ${c.staff.lastName}` : '',
				dayOfWeek: c.dayOfWeek,
				slotNumber: c.slotNumber,
				existingSectionId: c.section.id,
				existingSectionName: c.section.name,
			}))
		}
	}

	return { hasConflict: false, conflicts: [] }
}

export const getSectionTimetable = async (sectionId: string, academicYear: string, user?: RequestUser): Promise<SectionTimetable> => {
	if (user) await assertSectionCampus(sectionId, user)

	const section = await prisma.section.findUnique({ where: { id: sectionId }, select: { id: true, name: true } })
	if (!section) {
		const error = new Error('Attendance record not found') as any
		error.status = 404
		throw error
	}

	const slots = await prisma.timetableSlot.findMany({
		where: { sectionId, academicYear },
		include: slotInclude,
		orderBy: [{ dayOfWeek: 'asc' }, { slotNumber: 'asc' }]
	})

	return {
		sectionId: section.id,
		sectionName: section.name,
		academicYear,
		slots: slots.map(mapSlotToResponse)
	}
}

export const getTeacherTimetable = async (staffId: string, academicYear: string): Promise<TeacherTimetable> => {
	const staff = await prisma.staffProfile.findUnique({ where: { id: staffId }, select: { id: true, firstName: true, lastName: true } })
	if (!staff) {
		const error = new Error('Attendance record not found') as any
		error.status = 404
		throw error
	}

	const slots = await prisma.timetableSlot.findMany({
		where: { staffId, academicYear },
		include: { ...slotInclude, section: { select: { id: true, name: true } } },
		orderBy: [{ dayOfWeek: 'asc' }, { slotNumber: 'asc' }]
	})

	return {
		staffId: staff.id,
		staffName: `${staff.firstName} ${staff.lastName}`,
		academicYear,
		slots: slots.map((s) => ({ ...mapSlotToResponse(s), sectionName: s.section?.name ?? null }))
	}
}

export const getMyTeacherTimetable = async (userId: string, academicYear: string): Promise<TeacherTimetable> => {
	const staffProfile = await prisma.staffProfile.findUnique({ where: { userId }, select: { id: true, firstName: true, lastName: true } })
	if (!staffProfile) {
		const error = new Error('Staff profile not found') as any
		error.status = 404
		throw error
	}
	return getTeacherTimetable(staffProfile.id, academicYear)
}

export const clearSectionTimetable = async (sectionId: string, academicYear: string, user?: RequestUser): Promise<{ deleted: number }> => {
	if (user) await assertSectionCampus(sectionId, user)

	const result = await prisma.timetableSlot.deleteMany({ where: { sectionId, academicYear } })
	return { deleted: result.count }
}
