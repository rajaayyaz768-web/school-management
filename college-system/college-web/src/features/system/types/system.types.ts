export interface DriveBackupFile {
  id: string
  filename: string
  createdAt: string
  sizeBytes: number
}

export interface GoogleDriveStatus {
  connected: boolean
  email: string | null
  folderId: string | null
  lastBackup: { timestamp: string; success: boolean; filename?: string; error?: string } | null
  backupCount: number
  storageBytesUsed: number
}
