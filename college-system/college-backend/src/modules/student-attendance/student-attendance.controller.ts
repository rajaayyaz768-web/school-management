import { Request, Response } from 'express'
import * as service from './student-attendance.service'
import { sendSuccess, sendError } from '../../utils/response'

export const getStudentsForAttendance = async (req: Request, res: Response) => {
  try {
    const { sectionId, subjectId, date } = req.query as { sectionId: string, subjectId: string, date: string }
    const result = await service.getStudentsForAttendance(sectionId, subjectId, date, req.user)
    return sendSuccess(res, 'Students attendance list fetched', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const markStudentAttendance = async (req: Request, res: Response) => {
  try {
    const body = req.body
    const markedById = req.user!.id
    const result = await service.markStudentAttendance(body, markedById, req.user)
    return sendSuccess(res, 'Student attendance marked', result, 201)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const updateStudentAttendance = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const body = req.body
    const result = await service.updateStudentAttendance(id, body, req.user)
    return sendSuccess(res, 'Student attendance updated', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const getSectionAttendanceReport = async (req: Request, res: Response) => {
  try {
    const { sectionId, subjectId, date } = req.query as { sectionId: string, subjectId: string, date: string }
    const result = await service.getSectionAttendanceReport(sectionId, subjectId, date, req.user)
    return sendSuccess(res, 'Section attendance report fetched', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const getStudentAttendanceSummary = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId as string
    const subjectId = req.query.subjectId as string | undefined
    const result = await service.getStudentAttendanceSummary(studentId, subjectId, req.user)
    return sendSuccess(res, 'Student attendance summary fetched', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const getStudentAttendanceHistory = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId as string
    const subjectId = req.query.subjectId as string | undefined
    const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined
    const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined
    const result = await service.getStudentAttendanceHistory(studentId, { subjectId, month, year }, req.user)
    return sendSuccess(res, 'Student attendance history fetched', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}
