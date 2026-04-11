import { Request, Response } from 'express'
import { getTeacherDashboardData } from './teacherDashboard.service'
import { sendSuccess, sendError } from '../../../utils/response'

export const getTeacherDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const data = await getTeacherDashboardData(userId)
    sendSuccess(res, 'Teacher dashboard data fetched successfully', data)
  } catch (error) {
    console.error('[TeacherDashboard] Error:', error)
    sendError(res, 'Failed to fetch teacher dashboard data', 500)
  }
}
