export interface BackupFile {
  filename: string
  createdAt: string
  sizeBytes: number
}

export interface LastBackupRun {
  timestamp: string
  success: boolean
  error?: string
}

export interface BackupStatus {
  configured: boolean
  lastRun: LastBackupRun | null
  storageBytesUsed: number
  backupDir: string | null
}
