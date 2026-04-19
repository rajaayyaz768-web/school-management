import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware'
import { authorize } from '../../middlewares/role.middleware'
import { Role } from '@prisma/client'
import * as controller from './reports.controller'

const router = Router()

router.get(
  '/academic-years',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER),
  controller.getAcademicYears
)

router.get(
  '/attendance',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER),
  controller.getAttendanceReport
)

router.get(
  '/fees',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER),
  controller.getFeeReport
)

router.get(
  '/results',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER),
  controller.getResultsReport
)

export { router as reportsRouter }
