import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware'
import { authorize } from '../../middlewares/role.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { Role } from '@prisma/client'
import {
	periodConfigSchema,
	createSlotSchema,
	bulkCreateSlotsSchema,
	updateSlotSchema,
	conflictCheckSchema
} from './timetable.validation'
import * as controller from './timetable.controller'

const router = Router()

router.post('/period-config', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), validate(periodConfigSchema), controller.upsertPeriodConfig)
router.get('/period-config', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER), controller.getPeriodConfig)
router.post('/slots', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), validate(createSlotSchema), controller.createSlot)
router.post('/slots/bulk', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), validate(bulkCreateSlotsSchema), controller.bulkCreateSlots)
router.put('/slots/:id', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), validate(updateSlotSchema), controller.updateSlot)
router.delete('/slots/:id', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), controller.deleteSlot)
router.get('/conflict-check', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), controller.checkConflict)
router.get('/section/:sectionId', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT), controller.getSectionTimetable)
router.get('/my-schedule', authenticate, authorize(Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN), controller.getMyTeacherTimetable)
router.get('/teacher/:staffId', authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER), controller.getTeacherTimetable)
router.get('/live/teachers', authenticate, authorize(Role.SUPER_ADMIN), controller.getLiveTeachers)
router.delete('/section/:sectionId/clear', authenticate, authorize(Role.SUPER_ADMIN), controller.clearSectionTimetable)

export { router as timetableRouter }
