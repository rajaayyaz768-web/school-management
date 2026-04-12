import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware'
import { Roles } from '../../middlewares/role.middleware'
import { authorize } from '../../middlewares/role.middleware'
import * as controller from './system.controller'

const router = Router()

// All system routes are Principal-only
router.use(authenticate)
router.use(authorize(...Roles.PRINCIPAL_ONLY))

router.get('/backups', controller.listBackups)
router.get('/backups/status', controller.getBackupStatus)
router.post('/backups/trigger', controller.triggerBackup)
router.get('/backups/:filename/download', controller.downloadBackup)

export { router as systemRouter }
