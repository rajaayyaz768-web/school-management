import api from '@/lib/axios'
import type { BackupFile, BackupStatus } from '../types/system.types'

export async function listBackups(): Promise<BackupFile[]> {
  const res = await api.get('/system/backups')
  return res.data.data
}

export async function getBackupStatus(): Promise<BackupStatus> {
  const res = await api.get('/system/backups/status')
  return res.data.data
}

export async function triggerBackup(): Promise<{ filename: string | null }> {
  const res = await api.post('/system/backups/trigger')
  return res.data.data
}

export function getBackupDownloadUrl(filename: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? ''
  return `${base}/system/backups/${encodeURIComponent(filename)}/download`
}
