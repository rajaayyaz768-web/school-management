import { Request, Response } from 'express'
import { sendSuccess, sendError, sendBadRequest } from '../../utils/response'
import * as driveService from './google-drive.service'

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body
    if (!email) {
      sendBadRequest(res, 'Email is required')
      return
    }
    await driveService.sendOtp(req.user!.id, email)
    sendSuccess(res, 'OTP sent successfully')
  } catch (error: any) {
    sendError(res, error.message, error.status || 500)
  }
}

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body
    if (!email || !otp) {
      sendBadRequest(res, 'Email and OTP are required')
      return
    }
    await driveService.verifyOtp(req.user!.id, email, otp)
    sendSuccess(res, 'OTP verified successfully')
  } catch (error: any) {
    sendError(res, error.message, error.status || 500)
  }
}

export const getGoogleAuthUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.query
    if (!email || typeof email !== 'string') {
      sendBadRequest(res, 'Email is required')
      return
    }
    const url = await driveService.getAuthUrl(req.user!.id, email)
    sendSuccess(res, 'Auth URL generated', { url })
  } catch (error: any) {
    sendError(res, error.message, error.status || 500)
  }
}

export const handleGoogleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, state } = req.query
    if (!code || typeof code !== 'string' || !state || typeof state !== 'string') {
      res.status(400).send('Invalid callback parameters')
      return
    }
    const codeStr = typeof code === 'string' ? code : String(code)
    const stateStr = typeof state === 'string' ? state : String(state)
    await driveService.handleCallback(codeStr, stateStr)
    // Redirect to frontend backup page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    res.redirect(`${frontendUrl}/principal/settings/backups`)
  } catch (error: any) {
    res.status(500).send(`Authentication failed: ${error.message}`)
  }
}

export const getStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = await driveService.getConnectionStatus(req.user!.id)
    sendSuccess(res, 'Google Drive status fetched', status)
  } catch (error: any) {
    sendError(res, error.message, error.status || 500)
  }
}

export const disconnectGoogle = async (req: Request, res: Response): Promise<void> => {
  try {
    await driveService.disconnect(req.user!.id)
    sendSuccess(res, 'Google Drive disconnected')
  } catch (error: any) {
    sendError(res, error.message, error.status || 500)
  }
}

export const triggerBackup = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await driveService.createBackup(req.user!.id)
    sendSuccess(res, result.message, { filename: result.filename ?? null })
  } catch (error: any) {
    sendError(res, error.message, error.status || 500)
  }
}

export const listBackups = async (req: Request, res: Response): Promise<void> => {
  try {
    const backups = await driveService.listBackups(req.user!.id)
    sendSuccess(res, 'Backups listed', backups)
  } catch (error: any) {
    sendError(res, error.message, error.status || 500)
  }
}

export const downloadBackup = async (req: Request, res: Response): Promise<void> => {
  try {
    const fileId = req.params.fileId as string
    const { filename, sizeBytes } = await driveService.getBackupMetadata(req.user!.id, fileId)
    
    res.setHeader('Content-disposition', `attachment; filename=${filename}`)
    res.setHeader('Content-type', 'application/gzip')
    res.setHeader('Content-Length', sizeBytes)

    const stream = await driveService.downloadBackup(req.user!.id, fileId)
    stream.pipe(res)
  } catch (error: any) {
    sendError(res, error.message, error.status || 500)
  }
}

export const deleteBackup = async (req: Request, res: Response): Promise<void> => {
  try {
    const fileId = req.params.fileId as string
    await driveService.deleteBackup(req.user!.id, fileId)
    sendSuccess(res, 'Backup deleted successfully')
  } catch (error: any) {
    sendError(res, error.message, error.status || 500)
  }
}
