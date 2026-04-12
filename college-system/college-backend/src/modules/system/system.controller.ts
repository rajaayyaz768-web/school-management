import { Request, Response } from 'express'
import { sendSuccess, sendError } from '../../utils/response'
import * as service from './system.service'

export const listBackups = async (_req: Request, res: Response): Promise<void> => {
  try {
    const backups = await service.listBackups()
    sendSuccess(res, 'Backups listed', backups)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).status ?? 500
    sendError(res, message, status)
  }
}

export const getBackupStatus = async (_req: Request, res: Response): Promise<void> => {
  try {
    const status = await service.getBackupStatus()
    sendSuccess(res, 'Backup status fetched', status)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).status ?? 500
    sendError(res, message, status)
  }
}

export const triggerBackup = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await service.triggerBackup()
    sendSuccess(res, result.message, { filename: result.filename ?? null })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).status ?? 500
    sendError(res, message, status)
  }
}

export const downloadBackup = async (req: Request, res: Response): Promise<void> => {
  try {
    const filename = req.params.filename as string
    const absolutePath = service.resolveBackupPath(filename)
    res.download(absolutePath, filename)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    const status = (error as any).status ?? 500
    sendError(res, message, status)
  }
}
