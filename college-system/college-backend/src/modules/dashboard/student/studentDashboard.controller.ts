import { Request, Response } from 'express'
import { getStudentDashboardData } from './studentDashboard.service'
import { sendSuccess, sendError } from '../../../utils/response'

export const getStudentDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const data = await getStudentDashboardData(userId)
    sendSuccess(res, 'Student dashboard data fetched successfully', data)
  } catch (error) {
    console.error('[StudentDashboard] Error:', error)
    sendError(res, 'Failed to fetch student dashboard data', 500)
  }
}
