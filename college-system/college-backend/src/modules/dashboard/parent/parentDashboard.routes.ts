import { Router } from 'express'
import { authenticate } from '../../../middlewares/auth.middleware'
import { authorize } from '../../../middlewares/role.middleware'
import { Role } from '@prisma/client'
import { getParentDashboard } from './parentDashboard.controller'

const router = Router()

router.get(
  '/',
  authenticate,
  authorize(Role.PARENT, Role.ADMIN, Role.SUPER_ADMIN),
  getParentDashboard
)

export { router as parentDashboardRouter }
