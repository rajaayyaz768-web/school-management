import api from '@/lib/axios'
import type { DriveBackupFile, GoogleDriveStatus } from '../types/system.types'

export async function sendOtp(email: string): Promise<void> {
  await api.post('/system/google/send-otp', { email })
}

export async function verifyOtp(email: string, otp: string): Promise<void> {
  await api.post('/system/google/verify-otp', { email, otp })
}

export async function getGoogleAuthUrl(email: string): Promise<string> {
  const res = await api.get('/system/google/auth-url', { params: { email } })
  return res.data.data.url
}

export async function getGoogleStatus(): Promise<GoogleDriveStatus> {
  const res = await api.get('/system/google/status')
  return res.data.data
}

export async function disconnectGoogle(): Promise<void> {
  await api.delete('/system/google/disconnect')
}

export async function listBackups(): Promise<DriveBackupFile[]> {
  const res = await api.get('/system/backups')
  return res.data.data
}

export async function triggerBackup(): Promise<{ filename: string | null }> {
  const res = await api.post('/system/backups/trigger')
  return res.data.data
}

export async function deleteBackup(fileId: string): Promise<void> {
  await api.delete(`/system/backups/${fileId}`)
}

export async function restoreBackup(fileId: string): Promise<void> {
  await api.post(`/system/backups/${fileId}/restore`)
}

export function getBackupDownloadUrl(fileId: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? ''
  return `${base}/system/backups/${encodeURIComponent(fileId)}/download`
}
