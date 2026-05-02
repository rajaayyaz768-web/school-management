import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware'
import { authorize } from '../../middlewares/role.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { Role } from '@prisma/client'
import {
  createExamTypeSchema,
  createExamSchema,
  updateExamSchema,
  bulkEnterResultsSchema,
} from './exams.validation'
import * as controller from './exams.controller'

const router = Router()

router.get('/types', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER), controller.getAllExamTypes)
router.post('/types', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), validate(createExamTypeSchema), controller.createExamType)
// Exam schedules (admin bulk creation)
router.get('/schedules', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), controller.getExamSchedules)
router.post('/schedule', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), controller.createExamSchedule)
// Class tests (teacher-created)
router.post('/class-test', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER), controller.createClassTest)
// Main exam routes — student/parent can now fetch their section's exams
router.get('/', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT), controller.getAllExams)
router.get('/student/:studentId', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT), controller.getStudentResults)
router.get('/:id', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT), controller.getExamById)
router.post('/', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), validate(createExamSchema), controller.createExam)
router.put('/:id', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), validate(updateExamSchema), controller.updateExam)
router.delete('/:id', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), controller.deleteExam)
router.get('/:id/results', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT), controller.getExamResults)
router.post('/results/bulk', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER), validate(bulkEnterResultsSchema), controller.enterBulkResults)

export { router as examsRouter }
