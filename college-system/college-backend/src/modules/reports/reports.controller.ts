import { Request, Response } from 'express'
import * as service from './reports.service'
import { sendSuccess, sendError } from '../../utils/response'
import { AttendanceReportFilters, FeeReportFilters, ResultsReportFilters, ReportFormat } from './reports.types'

export const getAttendanceReport = async (req: Request, res: Response) => {
  try {
    const {
      campusId,
      sectionId,
      studentId,
      startDate,
      endDate,
      format = 'json',
    } = req.query as {
      campusId?: string
      sectionId?: string
      studentId?: string
      startDate?: string
      endDate?: string
      format?: string
    }

    if (!campusId) return sendError(res, 'campusId is required', 400)
    if (!startDate) return sendError(res, 'startDate is required', 400)
    if (!endDate)   return sendError(res, 'endDate is required', 400)

    const filters: AttendanceReportFilters = {
      campusId,
      sectionId,
      studentId,
      startDate,
      endDate,
    }

    const reportFormat = (format as ReportFormat) || 'json'

    if (reportFormat === 'excel') {
      const { buffer, filename } = await service.generateAttendanceReport(filters, 'excel')
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      return res.end(buffer)
    }

    if (reportFormat === 'html') {
      const { html } = await service.generateAttendanceReport(filters, 'html')
      res.setHeader('Content-Type', 'text/html')
      return res.send(html)
    }

    const { data, filename } = await service.generateAttendanceReport(filters, 'json')
    return sendSuccess(res, 'Attendance report generated', { data, filename })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const getFeeReport = async (req: Request, res: Response) => {
  try {
    const {
      campusId,
      academicYear,
      status,
      format = 'json',
    } = req.query as {
      campusId?: string
      academicYear?: string
      status?: string
      format?: string
    }

    if (!campusId)     return sendError(res, 'campusId is required', 400)
    if (!academicYear) return sendError(res, 'academicYear is required', 400)

    const filters: FeeReportFilters = { campusId, academicYear, status }
    const reportFormat = (format as ReportFormat) || 'json'

    if (reportFormat === 'excel') {
      const { buffer, filename } = await service.generateFeeReport(filters, 'excel')
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      return res.end(buffer)
    }

    if (reportFormat === 'html') {
      const { html } = await service.generateFeeReport(filters, 'html')
      res.setHeader('Content-Type', 'text/html')
      return res.send(html)
    }

    const { data, filename } = await service.generateFeeReport(filters, 'json')
    return sendSuccess(res, 'Fee report generated', { data, filename })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).status ?? 500
    return sendError(res, message, status)
  }
}

export const getResultsReport = async (req: Request, res: Response) => {
  try {
    const {
      sectionId,
      examId,
      subjectId,
      format = 'json',
    } = req.query as {
      sectionId?: string
      examId?: string
      subjectId?: string
      format?: string
    }

    if (!sectionId) return sendError(res, 'sectionId is required', 400)

    const filters: ResultsReportFilters = { sectionId, examId, subjectId }
    const reportFormat = (format as ReportFormat) || 'json'

    if (reportFormat === 'excel') {
      const { buffer, filename } = await service.generateResultsReport(filters, 'excel')
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      return res.end(buffer)
    }

    if (reportFormat === 'html') {
      const { html } = await service.generateResultsReport(filters, 'html')
      res.setHeader('Content-Type', 'text/html')
      return res.send(html)
    }

    const { data, filename } = await service.generateResultsReport(filters, 'json')
    return sendSuccess(res, 'Results report generated', { data, filename })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).status ?? 500
    return sendError(res, message, status)
  }
}
