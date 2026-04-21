export interface DriveBackupFile {
  id: string
  filename: string
  createdAt: string
  sizeBytes: number
}

export interface LastBackupRun {
  timestamp: string
  success: boolean
  filename?: string
  error?: string
}

export interface GoogleDriveStatus {
  connected: boolean
  email: string | null
  folderId: string | null
  lastBackup: LastBackupRun | null
  backupCount: number
  storageBytesUsed: number
}
