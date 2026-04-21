import { Request, Response } from 'express'
import * as service from './results.service'
import { sendSuccess, sendError } from '../../utils/response'

export const getStudentReportCard = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId as string
    const { academicYear } = req.query as { academicYear?: string }
    const result = await service.getStudentReportCard(studentId, academicYear, (req as any).user)
    return sendSuccess(res, 'Student report card fetched successfully', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const getSectionResults = async (req: Request, res: Response) => {
  try {
    const { sectionId, subjectId, examId } = req.query as {
      sectionId?: string
      subjectId?: string
      examId?: string
    }
    if (!sectionId) {
      return sendError(res, 'sectionId is required', 400)
    }
    const result = await service.getSectionResults(sectionId, subjectId, examId, (req as any).user)
    return sendSuccess(res, 'Section results fetched successfully', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const getTopStudents = async (req: Request, res: Response) => {
  try {
    const sectionId = req.params.sectionId as string
    const limitParam = req.query.limit as string | undefined
    const limit = limitParam ? parseInt(limitParam, 10) : 10
    const result = await service.getTopStudents(sectionId, limit, (req as any).user)
    return sendSuccess(res, 'Top students fetched successfully', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}
