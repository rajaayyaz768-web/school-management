import { Router } from 'express'
import { authenticate } from '../../../middlewares/auth.middleware'
import { authorize } from '../../../middlewares/role.middleware'
import { Role } from '@prisma/client'
import { getTeacherDashboard } from './teacherDashboard.controller'

const router = Router()

router.get(
  '/',
  authenticate,
  authorize(Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN),
  getTeacherDashboard
)

export { router as teacherDashboardRouter }
