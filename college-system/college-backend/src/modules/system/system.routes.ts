import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware'
import { Roles } from '../../middlewares/role.middleware'
import { authorize } from '../../middlewares/role.middleware'
import * as controller from './system.controller'

const router = Router()

// OAuth callback does NOT need auth middleware since Google redirects here directly
router.get('/google/callback', controller.handleGoogleCallback)

// All other system routes are Principal-only
router.use(authenticate)
router.use(authorize(...Roles.PRINCIPAL_ONLY))

// Google Drive & OTP flow
router.post('/google/send-otp', controller.sendOtp)
router.post('/google/verify-otp', controller.verifyOtp)
router.get('/google/auth-url', controller.getGoogleAuthUrl)
router.get('/google/status', controller.getStatus)
router.delete('/google/disconnect', controller.disconnectGoogle)

// Backup Operations
router.get('/backups', controller.listBackups)
router.post('/backups/trigger', controller.triggerBackup)
router.get('/backups/:fileId/download', controller.downloadBackup)
router.post('/backups/:fileId/restore', controller.restoreBackup)
router.delete('/backups/:fileId', controller.deleteBackup)

export { router as systemRouter }
