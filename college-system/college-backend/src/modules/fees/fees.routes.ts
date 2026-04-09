import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware'
import { authorize } from '../../middlewares/role.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { Role } from '@prisma/client'
import {
  createFeeStructureSchema,
  updateFeeStructureSchema,
  collectFeeSchema,
  markAsPaidSchema
} from './fees.validation'
import * as controller from './fees.controller'

const router = Router()

// Fee Structure routes
router.get('/structures', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), controller.getAllFeeStructures)
router.get('/structures/:id', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), controller.getFeeStructureById)
router.post('/structures', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), validate(createFeeStructureSchema), controller.createFeeStructure)
router.put('/structures/:id', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), validate(updateFeeStructureSchema), controller.updateFeeStructure)

// Fee Records routes
router.post('/records/generate', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), controller.generateFeeRecords)
router.get('/records', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), controller.getAllFeeRecords)
router.get('/records/student/:studentId', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.PARENT, Role.STUDENT), controller.getStudentFeeRecords)
router.post('/records/:id/mark-paid', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), validate(markAsPaidSchema), controller.markFeeAsPaid)
router.get('/defaulters', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), controller.getFeeDefaulters)

export { router as feesRouter }
