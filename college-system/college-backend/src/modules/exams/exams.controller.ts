import { Request, Response } from 'express'
import * as service from './exams.service'
import { sendSuccess, sendError } from '../../utils/response'

export const getAllExamTypes = async (req: Request, res: Response) => {
  try {
    const { campusId } = req.query as { campusId?: string }
    const result = await service.getAllExamTypes(campusId)
    return sendSuccess(res, 'Exam types fetched successfully', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const createExamType = async (req: Request, res: Response) => {
  try {
    const result = await service.createExamType(req.body)
    return sendSuccess(res, 'Exam type created successfully', result, 201)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const getAllExams = async (req: Request, res: Response) => {
  try {
    const { sectionId, subjectId, examTypeId, status, campusId, isClassTest } = req.query as {
      sectionId?: string
      subjectId?: string
      examTypeId?: string
      status?: string
      campusId?: string
      isClassTest?: string
    }
    const result = await service.getAllExams(
      {
        sectionId,
        subjectId,
        examTypeId,
        status,
        campusId,
        isClassTest: isClassTest !== undefined ? isClassTest === 'true' : undefined,
      },
      (req as any).user
    )
    return sendSuccess(res, 'Exams fetched successfully', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const getExamById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const result = await service.getExamById(id, (req as any).user)
    return sendSuccess(res, 'Exam fetched successfully', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const createExam = async (req: Request, res: Response) => {
  try {
    const result = await service.createExam(req.body, (req as any).user)
    return sendSuccess(res, 'Exam created successfully', result, 201)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const updateExam = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const result = await service.updateExam(id, req.body, (req as any).user)
    return sendSuccess(res, 'Exam updated successfully', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const deleteExam = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    await service.deleteExam(id, (req as any).user)
    return sendSuccess(res, 'Exam deleted successfully')
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const getExamResults = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const result = await service.getExamResults(id, (req as any).user)
    return sendSuccess(res, 'Exam results fetched successfully', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const enterBulkResults = async (req: Request, res: Response) => {
  try {
    const gradedById = (req as any).user.id
    const result = await service.enterBulkResults(req.body, gradedById, (req as any).user)
    return sendSuccess(res, 'Results entered successfully', result, 201)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const getStudentResults = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId as string
    const result = await service.getStudentResults(studentId)
    return sendSuccess(res, 'Student results fetched successfully', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const createExamSchedule = async (req: Request, res: Response) => {
  try {
    const result = await service.createExamSchedule(req.body, (req as any).user.id)
    return sendSuccess(res, `Exam schedule created — ${result.examCount} exam(s) generated`, result, 201)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const getExamSchedules = async (req: Request, res: Response) => {
  try {
    const { campusId } = req.query as { campusId?: string }
    const result = await service.getExamSchedules(campusId)
    return sendSuccess(res, 'Exam schedules fetched successfully', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const createClassTest = async (req: Request, res: Response) => {
  try {
    const result = await service.createClassTest(req.body, (req as any).user)
    return sendSuccess(res, 'Class test created successfully', result, 201)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}
