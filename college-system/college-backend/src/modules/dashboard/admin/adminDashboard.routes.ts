import { Router } from 'express'
import { authenticate } from '../../../middlewares/auth.middleware'
import { authorize } from '../../../middlewares/role.middleware'
import { Role } from '@prisma/client'
import { getAdminDashboard } from './adminDashboard.controller'

const router = Router()

router.get(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN),
  getAdminDashboard
)

export { router as adminDashboardRouter }
