import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware'
import { authorize } from '../../middlewares/role.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { Role } from '@prisma/client'
import * as controller from './announcements.controller'
import { createAnnouncementSchema, updateAnnouncementSchema } from './announcements.validation'

const router = Router()

// All announcements (admin/teacher view)
router.get(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER),
  controller.getAllAnnouncements
)

// Announcements for a specific user context (students, parents, etc.)
router.get(
  '/feed',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT),
  controller.getAnnouncementsForUser
)

// Get single announcement
router.get(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT),
  controller.getAnnouncementById
)

// Create announcement
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER),
  validate(createAnnouncementSchema),
  controller.createAnnouncement
)

// Update announcement
router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER),
  validate(updateAnnouncementSchema),
  controller.updateAnnouncement
)

// Delete announcement
router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN),
  controller.deleteAnnouncement
)

export { router as announcementsRouter }
