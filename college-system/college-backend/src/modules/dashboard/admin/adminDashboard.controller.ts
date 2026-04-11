import { Request, Response } from 'express'
import { getAdminDashboardData } from './adminDashboard.service'
import { sendSuccess, sendError } from '../../../utils/response'

export const getAdminDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const campusId = (req.query.campusId as string) || req.user?.campusId || undefined
    const data = await getAdminDashboardData(campusId ?? undefined)
    sendSuccess(res, 'Admin dashboard data fetched successfully', data)
  } catch (error) {
    console.error('[AdminDashboard] Error:', error)
    sendError(res, 'Failed to fetch admin dashboard data', 500)
  }
}
