import { Request, Response } from 'express'
import * as service from './timetable.service'
import { sendSuccess, sendError } from '../../utils/response'

export const upsertPeriodConfig = async (req: Request, res: Response) => {
	try {
		const result = await service.upsertPeriodConfig(req.body)
		return sendSuccess(res, result, 'Period config upserted')
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
		return sendSuccess(res, result, 'Period config fetched')
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Something went wrong'
		const status = (error as any).status ?? 500
		return sendError(res, message, status)
	}
}

export const createSlot = async (req: Request, res: Response) => {
	try {
		const result = await service.createSlot(req.body)
		return sendSuccess(res, result, 'Slot created', 201)
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Something went wrong'
		const status = (error as any).status ?? 500
		return sendError(res, message, status)
	}
}

export const bulkCreateSlots = async (req: Request, res: Response) => {
	try {
		const result = await service.bulkCreateSlots(req.body.slots)
		return sendSuccess(res, result, 'Slots created', 201)
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Something went wrong'
		const status = (error as any).status ?? 500
		return sendError(res, message, status)
	}
}

export const updateSlot = async (req: Request, res: Response) => {
	try {
		const result = await service.updateSlot(req.params.id, req.body)
		return sendSuccess(res, result, 'Slot updated')
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Something went wrong'
		const status = (error as any).status ?? 500
		return sendError(res, message, status)
	}
}

export const deleteSlot = async (req: Request, res: Response) => {
	try {
		const result = await service.deleteSlot(req.params.id)
		return sendSuccess(res, result, 'Slot deleted')
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
		return sendSuccess(res, result, 'Conflict check completed')
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Something went wrong'
		const status = (error as any).status ?? 500
		return sendError(res, message, status)
	}
}

export const getSectionTimetable = async (req: Request, res: Response) => {
	try {
		const { sectionId } = req.params
		const { academicYear } = req.query as { academicYear: string }
		const result = await service.getSectionTimetable(sectionId, academicYear)
		return sendSuccess(res, result, 'Section timetable fetched')
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Something went wrong'
		const status = (error as any).status ?? 500
		return sendError(res, message, status)
	}
}

export const getTeacherTimetable = async (req: Request, res: Response) => {
	try {
		const { staffId } = req.params
		const { academicYear } = req.query as { academicYear: string }
		const result = await service.getTeacherTimetable(staffId, academicYear)
		return sendSuccess(res, result, 'Teacher timetable fetched')
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Something went wrong'
		const status = (error as any).status ?? 500
		return sendError(res, message, status)
	}
}

export const clearSectionTimetable = async (req: Request, res: Response) => {
	try {
		const { sectionId } = req.params
		const { academicYear } = req.query as { academicYear: string }
		const result = await service.clearSectionTimetable(sectionId, academicYear)
		return sendSuccess(res, result, 'Section timetable cleared')
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Something went wrong'
		const status = (error as any).status ?? 500
		return sendError(res, message, status)
	}
}
