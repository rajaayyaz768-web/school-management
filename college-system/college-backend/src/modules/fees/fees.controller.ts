import { Request, Response } from 'express'
import * as service from './fees.service'
import { sendSuccess, sendError } from '../../utils/response'

export const getAllFeeStructures = async (req: Request, res: Response) => {
  try {
    const { campusId, academicYear } = req.query as { campusId?: string; academicYear?: string }
    const result = await service.getAllFeeStructures({ campusId, academicYear })
    return sendSuccess(res, 'Fee structures fetched successfully', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const getFeeStructureById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const result = await service.getFeeStructureById(id, (req as any).user)
    return sendSuccess(res, 'Fee structure fetched successfully', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const createFeeStructure = async (req: Request, res: Response) => {
  try {
    const result = await service.createFeeStructure(req.body, (req as any).user)
    return sendSuccess(res, 'Fee structure created successfully', result, 201)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const updateFeeStructure = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const result = await service.updateFeeStructure(id, req.body, (req as any).user)
    return sendSuccess(res, 'Fee structure updated successfully', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const generateFeeRecords = async (req: Request, res: Response) => {
  try {
    const { feeStructureId, sectionId } = req.body
    const result = await service.generateFeeRecordsForSection(feeStructureId, sectionId, (req as any).user)
    return sendSuccess(res, 'Fee records generated successfully', result, 201)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const getStudentFeeRecords = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId as string
    const result = await service.getStudentFeeRecords(studentId, (req as any).user)
    return sendSuccess(res, 'Student fee records fetched successfully', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const getAllFeeRecords = async (req: Request, res: Response) => {
  try {
    const { campusId, status, academicYear } = req.query as {
      campusId?: string
      status?: string
      academicYear?: string
    }
    const result = await service.getAllFeeRecords({
      campusId,
      status: status as any,
      academicYear,
    })
    return sendSuccess(res, 'Fee records fetched successfully', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const markFeeAsPaid = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const result = await service.markFeeAsPaid(id, req.body, (req as any).user)
    return sendSuccess(res, 'Fee marked as paid successfully', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const getFeeDefaulters = async (req: Request, res: Response) => {
  try {
    const { campusId, academicYear } = req.query as { campusId?: string; academicYear?: string }
    const result = await service.getFeeDefaulters(campusId ?? '', academicYear ?? '')
    return sendSuccess(res, 'Fee defaulters fetched successfully', result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).statusCode ?? (error as any).status ?? 500
    return sendError(res, message, status)
  }
}
