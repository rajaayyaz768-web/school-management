import { Request, Response } from 'express'
import * as service from './staff-attendance.service'
import { sendSuccess, sendError } from '../../utils/response'
import { buildAbsenceAlert } from './staff-attendance.alerter'
import { io } from '../../config/socket'

export const getStaffForAttendance = async (req: Request, res: Response) => {
  try {
    const { campusId, date } = req.query as { campusId: string, date: string }
    const result = await service.getStaffForAttendance(campusId, date)
    return sendSuccess(res, result, 'Staff attendance list fetched')
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const markDailyAttendance = async (req: Request, res: Response) => {
  try {
    const body = req.body
    const markedById = (req as any).user.id
    const result = await service.markDailyAttendance(body, markedById)

    // Emit absence alerts for any ABSENT staff
    try {
      if (io) {
        const absentItems = req.body.attendances?.filter(
          (a: any) => a.status === 'ABSENT'
        ) ?? []
        for (const item of absentItems) {
          const alert = await buildAbsenceAlert(item.staffId, req.body.campusId, req.body.date)
          if (alert && alert.affectedPeriods.length > 0) {
            io.emit('teacher:absent', alert)
          }
        }
      }
    } catch (alertError) {
      // Alert emission failure should not break attendance marking
      console.error('Alert emission error:', alertError)
    }

    return sendSuccess(res, result, 'Daily attendance marked', 201)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const updateSingleAttendance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const body = req.body
    const result = await service.updateSingleAttendance(id, body)
    return sendSuccess(res, result, 'Attendance updated')
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const getDailyReport = async (req: Request, res: Response) => {
  try {
    const { campusId, date } = req.query as { campusId: string, date: string }
    const result = await service.getDailyReport(campusId, date)
    return sendSuccess(res, result, 'Daily attendance report fetched')
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const getStaffAttendanceHistory = async (req: Request, res: Response) => {
  try {
    const { staffId } = req.params
    const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined
    const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined
    const result = await service.getStaffAttendanceHistory(staffId, month, year)
    return sendSuccess(res, result, 'Staff attendance history fetched')
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const getAbsentStaffToday = async (req: Request, res: Response) => {
  try {
    const { campusId, date } = req.query as { campusId: string, date: string }
    const result = await service.getAbsentStaffToday(campusId, date)
    return sendSuccess(res, result, 'Absent staff fetched')
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).status ?? 500
    return sendError(res, message, status)
  }
}