import { Request, Response } from 'express'
import { getPrincipalDashboardData } from './principalDashboard.service'
import { sendSuccess, sendError } from '../../../utils/response'

export const getPrincipalDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const campusId = req.query.campusId as string | undefined
    const data = await getPrincipalDashboardData(campusId || undefined)
    sendSuccess(res, 'Principal dashboard data fetched successfully', data)
  } catch (error) {
    console.error('[PrincipalDashboard] Error:', error)
    sendError(res, 'Failed to fetch principal dashboard data', 500)
  }
}
