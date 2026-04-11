import { Router } from 'express'
import { authenticate } from '../../../middlewares/auth.middleware'
import { authorize } from '../../../middlewares/role.middleware'
import { Role } from '@prisma/client'
import { getPrincipalDashboard } from './principalDashboard.controller'

const router = Router()

router.get(
  '/',
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  getPrincipalDashboard
)

export { router as principalDashboardRouter }
