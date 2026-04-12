import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { BackupFile, BackupStatus, LastBackupRun } from './system.types'

const execAsync = promisify(exec)

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getBackupDir(): string | null {
  const dir = process.env.BACKUP_DIR
  return dir ? path.resolve(dir) : null
}

/** Returns the resolved absolute path of a backup file after validating it
 *  stays within BACKUP_DIR. Throws with status 400 on any invalid input. */
export function resolveBackupPath(filename: string): string {
  const backupDir = getBackupDir()
  if (!backupDir) throw Object.assign(new Error('Backup directory not configured'), { status: 503 })

  // Strict filename pattern — only allow backup_YYYY-MM-DD*.sql.gz
  if (!/^backup_\d{4}-\d{2}-\d{2}[^/\\]*\.sql\.gz$/.test(filename)) {
    throw Object.assign(new Error('Invalid backup filename'), { status: 400 })
  }

  const resolved = path.resolve(path.join(backupDir, filename))

  // Path-traversal guard: resolved path must start with backupDir
  if (!resolved.startsWith(backupDir + path.sep) && resolved !== backupDir) {
    throw Object.assign(new Error('Invalid backup path'), { status: 400 })
  }

  if (!fs.existsSync(resolved)) {
    throw Object.assign(new Error('Backup file not found'), { status: 404 })
  }

  return resolved
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function listBackups(): Promise<BackupFile[]> {
  const backupDir = getBackupDir()
  if (!backupDir || !fs.existsSync(backupDir)) return []

  const entries = fs.readdirSync(backupDir)
  const backups: BackupFile[] = []

  for (const filename of entries) {
    if (!/^backup_\d{4}-\d{2}-\d{2}[^/\\]*\.sql\.gz$/.test(filename)) continue
    const fullPath = path.join(backupDir, filename)
    const stat = fs.statSync(fullPath)
    backups.push({
      filename,
      createdAt: stat.mtime.toISOString(),
      sizeBytes: stat.size,
    })
  }

  // Most recent first
  return backups.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getBackupStatus(): Promise<BackupStatus> {
  const backupDir = getBackupDir()

  if (!backupDir) {
    return { configured: false, lastRun: null, storageBytesUsed: 0, backupDir: null }
  }

  if (!fs.existsSync(backupDir)) {
    return { configured: true, lastRun: null, storageBytesUsed: 0, backupDir }
  }

  // Read last-status.json written by the backup script
  let lastRun: LastBackupRun | null = null
  const statusFile = path.join(backupDir, 'last-status.json')
  if (fs.existsSync(statusFile)) {
    try {
      lastRun = JSON.parse(fs.readFileSync(statusFile, 'utf8')) as LastBackupRun
    } catch {
      // Ignore malformed status file
    }
  }

  // Sum all file sizes in the directory for storage used
  let storageBytesUsed = 0
  try {
    const entries = fs.readdirSync(backupDir)
    for (const f of entries) {
      const stat = fs.statSync(path.join(backupDir, f))
      if (stat.isFile()) storageBytesUsed += stat.size
    }
  } catch {
    // Directory not accessible — leave as 0
  }

  return { configured: true, lastRun, storageBytesUsed, backupDir }
}

export async function triggerBackup(): Promise<{ message: string; filename?: string }> {
  const scriptPath = process.env.BACKUP_SCRIPT
  if (!scriptPath) {
    throw Object.assign(
      new Error('Backup script not configured. Set BACKUP_SCRIPT in environment.'),
      { status: 503 }
    )
  }

  if (!fs.existsSync(scriptPath)) {
    throw Object.assign(
      new Error(`Backup script not found at: ${scriptPath}`),
      { status: 503 }
    )
  }

  try {
    const { stdout } = await execAsync(`bash "${scriptPath}"`, { timeout: 120_000 })
    // Script should print the backup filename on stdout
    const filename = stdout.trim().split('\n').pop() ?? ''
    return { message: 'Backup completed successfully', filename: filename || undefined }
  } catch (err: any) {
    const message = err.stderr ?? err.message ?? 'Backup script failed'
    throw Object.assign(new Error(`Backup failed: ${message}`), { status: 500 })
  }
}
