import { Request, Response } from 'express'
import { getParentDashboardData } from './parentDashboard.service'
import { sendSuccess, sendError } from '../../../utils/response'

export const getParentDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const studentId = req.query.studentId as string | undefined
    const data = await getParentDashboardData(userId, studentId)
    sendSuccess(res, 'Parent dashboard data fetched successfully', data)
  } catch (error) {
    console.error('[ParentDashboard] Error:', error)
    sendError(res, 'Failed to fetch parent dashboard data', 500)
  }
}
