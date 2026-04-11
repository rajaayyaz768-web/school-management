import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware'
import { authorize } from '../../middlewares/role.middleware'
import { Role } from '@prisma/client'
import * as controller from './results.controller'

const router = Router()

router.get(
  '/report-card/:studentId',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT),
  controller.getStudentReportCard
)

router.get(
  '/section',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER),
  controller.getSectionResults
)

router.get(
  '/top-students/:sectionId',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER),
  controller.getTopStudents
)

export { router as resultsRouter }
