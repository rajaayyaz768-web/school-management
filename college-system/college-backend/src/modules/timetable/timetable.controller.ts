import { Request, Response } from 'express'
import * as service from './timetable.service'
import { sendSuccess, sendError } from '../../utils/response'

export const upsertPeriodConfig = async (req: Request, res: Response) => {
	try {
		const result = await service.upsertPeriodConfig(req.body)
		return sendSuccess(res, 'Period config upserted', result)
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Something went wrong'
		const status = (error as any).status ?? 500
		return sendError(res, message, status)
	}
}

export const getPeriodConfig = async (req: Request, res: Response) => {
	try {
		const { campusId, gradeId } = req.query as { campusId: string, gradeId: string }
		const result = await service.getPeriodConfig(campusId, gradeId)
		return sendSuccess(res, 'Period config fetched', result)
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Something went wrong'
		const status = (error as any).status ?? 500
		return sendError(res, message, status)
	}
}

export const createSlot = async (req: Request, res: Response) => {
	try {
		const result = await service.createSlot(req.body)
		return sendSuccess(res, 'Slot created', result, 201)
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Something went wrong'
		const status = (error as any).status ?? 500
		return sendError(res, message, status)
	}
}

export const bulkCreateSlots = async (req: Request, res: Response) => {
	try {
		const result = await service.bulkCreateSlots(req.body.slots)
		return sendSuccess(res, 'Slots created', result, 201)
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Something went wrong'
		const status = (error as any).status ?? 500
		return sendError(res, message, status)
	}
}

export const updateSlot = async (req: Request, res: Response) => {
	try {
		const result = await service.updateSlot(req.params.id as string, req.body)
		return sendSuccess(res, 'Slot updated', result)
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Something went wrong'
		const status = (error as any).status ?? 500
		return sendError(res, message, status)
	}
}

export const deleteSlot = async (req: Request, res: Response) => {
	try {
		await service.deleteSlot(req.params.id as string)
		return sendSuccess(res, 'Slot deleted')
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Something went wrong'
		const status = (error as any).status ?? 500
		return sendError(res, message, status)
	}
}

export const checkConflict = async (req: Request, res: Response) => {
	try {
		const { staffId, dayOfWeek, slotNumber, academicYear, excludeSectionId } = req.query as {
			staffId: string
			dayOfWeek: any
			slotNumber: string
			academicYear: string
			excludeSectionId?: string
		}
		const result = await service.checkConflict(staffId, dayOfWeek, parseInt(slotNumber, 10), academicYear, excludeSectionId)
		return sendSuccess(res, 'Conflict check completed', result)
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Something went wrong'
		const status = (error as any).status ?? 500
		return sendError(res, message, status)
	}
}

export const getSectionTimetable = async (req: Request, res: Response) => {
	try {
		const sectionId = req.params.sectionId as string
		const { academicYear } = req.query as { academicYear: string }
		const result = await service.getSectionTimetable(sectionId, academicYear)
		return sendSuccess(res, 'Section timetable fetched', result)
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Something went wrong'
		const status = (error as any).status ?? 500
		return sendError(res, message, status)
	}
}

export const getTeacherTimetable = async (req: Request, res: Response) => {
	try {
		const staffId = req.params.staffId as string
		const { academicYear } = req.query as { academicYear: string }
		const result = await service.getTeacherTimetable(staffId, academicYear)
		return sendSuccess(res, 'Teacher timetable fetched', result)
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Something went wrong'
		const status = (error as any).status ?? 500
		return sendError(res, message, status)
	}
}

export const clearSectionTimetable = async (req: Request, res: Response) => {
	try {
		const sectionId = req.params.sectionId as string
		const { academicYear } = req.query as { academicYear: string }
		const result = await service.clearSectionTimetable(sectionId, academicYear)
		return sendSuccess(res, 'Section timetable cleared', result)
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Something went wrong'
		const status = (error as any).status ?? 500
		return sendError(res, message, status)
	}
}
