import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware'
import { authorize } from '../../middlewares/role.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { Role } from '@prisma/client'
import { markAttendanceSchema, updateAttendanceSchema } from './staff-attendance.validation'
import * as controller from './staff-attendance.controller'

const router = Router()

router.get('/staff-list', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER), controller.getStaffForAttendance)
router.post('/mark', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), validate(markAttendanceSchema), controller.markDailyAttendance)
router.get('/daily-report', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER), controller.getDailyReport)
router.get('/history/:staffId', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER), controller.getStaffAttendanceHistory)
router.get('/absent-today', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER), controller.getAbsentStaffToday)
router.get('/monthly-summary', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), controller.getMonthlySummary)
router.get('/absent-by-campus', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), controller.getAbsentByCampus)
router.put('/:id', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), validate(updateAttendanceSchema), controller.updateSingleAttendance)

export { router as staffAttendanceRouter }