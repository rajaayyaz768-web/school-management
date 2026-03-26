import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware'
import { authorize } from '../../middlewares/role.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { Role } from '@prisma/client'
import { markStudentAttendanceSchema, updateStudentAttendanceSchema } from './student-attendance.validation'
import * as controller from './student-attendance.controller'

const router = Router()

router.get('/students-list', authenticate, authorize(Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN), controller.getStudentsForAttendance)
router.post('/mark', authenticate, authorize(Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN), validate(markStudentAttendanceSchema), controller.markStudentAttendance)
router.put('/:id', authenticate, authorize(Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN), validate(updateStudentAttendanceSchema), controller.updateStudentAttendance)
router.get('/section-report', authenticate, authorize(Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN), controller.getSectionAttendanceReport)
router.get('/summary/:studentId', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT), controller.getStudentAttendanceSummary)
router.get('/history/:studentId', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT), controller.getStudentAttendanceHistory)

export { router as studentAttendanceRouter }