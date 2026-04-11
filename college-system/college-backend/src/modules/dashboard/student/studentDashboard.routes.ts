import { Router } from 'express'
import { authenticate } from '../../../middlewares/auth.middleware'
import { authorize } from '../../../middlewares/role.middleware'
import { getStudentDashboard } from './studentDashboard.controller'

export const studentDashboardRouter = Router()

studentDashboardRouter.get(
  '/',
  authenticate,
  authorize('STUDENT', 'ADMIN', 'SUPER_ADMIN'),
  getStudentDashboard
)
