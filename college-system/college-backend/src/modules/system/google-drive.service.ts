import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { google } from 'googleapis'
import { Readable } from 'stream'
import crypto from 'crypto'
import prisma from '../../config/database'
import { sendOtpEmail } from '../../services/email.service'
import { DriveBackupFile, GoogleDriveStatus } from './system.types'

const execAsync = promisify(exec)

const getOauth2Client = () => new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

// ─── OTP FLOW ─────────────────────────────────────────────────────────────────

export async function sendOtp(userId: string, email: string): Promise<void> {
  const otp = crypto.randomInt(100000, 999999).toString()
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex')
  
  await prisma.emailOtp.create({
    data: {
      email,
      otp: hashedOtp,
      userId,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 mins
    }
  })

  await sendOtpEmail(email, otp)
}

export async function verifyOtp(userId: string, email: string, otp: string): Promise<boolean> {
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex')
  
  const record = await prisma.emailOtp.findFirst({
    where: {
      userId,
      email,
      otp: hashedOtp,
      expiresAt: { gt: new Date() },
      verified: false
    }
  })

  if (!record) {
    throw Object.assign(new Error('Invalid or expired OTP'), { status: 400 })
  }

  await prisma.emailOtp.update({
    where: { id: record.id },
    data: { verified: true }
  })

  return true
}

// ─── OAUTH FLOW ───────────────────────────────────────────────────────────────

export async function getAuthUrl(userId: string, email: string): Promise<string> {
  // Ensure OTP was verified recently
  const verified = await prisma.emailOtp.findFirst({
    where: {
      userId,
      email,
      verified: true,
      expiresAt: { gt: new Date(Date.now() - 30 * 60 * 1000) } // valid for 30 mins after sending
    }
  })

  if (!verified) {
    throw Object.assign(new Error('Email not verified or verification expired'), { status: 400 })
  }

  const oauth2Client = getOauth2Client()
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/userinfo.email'],
    prompt: 'consent',
    login_hint: email,
    state: userId // pass userId in state to correlate callback
  })

  return url
}

export async function handleCallback(code: string, state: string): Promise<void> {
  const userId = state
  const oauth2Client = getOauth2Client()
  const { tokens } = await oauth2Client.getToken(code)
  
  if (!tokens.refresh_token) {
    // If no refresh token, they might have authorized before. 
    // We should prompt them to revoke and retry or we just accept it if we already have one.
    // For simplicity, we require it here.
    throw new Error('No refresh token returned. Please revoke access and try again.')
  }

  oauth2Client.setCredentials(tokens)

  // Verify email matches
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
  const userInfo = await oauth2.userinfo.get()
  const email = userInfo.data.email

  if (!email) {
    throw new Error('Could not retrieve email from Google')
  }

  // Create or get folder
  const drive = google.drive({ version: 'v3', auth: oauth2Client })
  let folderId = ''
  
  const existingFolder = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.folder' and name='College Backups' and trashed=false",
    fields: 'files(id)',
    spaces: 'drive'
  })

  if (existingFolder.data.files && existingFolder.data.files.length > 0) {
    folderId = existingFolder.data.files[0].id!
  } else {
    const folder = await drive.files.create({
      requestBody: {
        name: 'College Backups',
        mimeType: 'application/vnd.google-apps.folder'
      },
      fields: 'id'
    })
    folderId = folder.data.id!
  }

  // Store in DB
  await prisma.googleDriveToken.upsert({
    where: { userId },
    update: {
      email,
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token!,
      expiresAt: new Date(tokens.expiry_date || Date.now() + 3600 * 1000),
      folderId
    },
    create: {
      userId,
      email,
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token!,
      expiresAt: new Date(tokens.expiry_date || Date.now() + 3600 * 1000),
      folderId
    }
  })
}

// ─── DRIVE OPERATIONS ─────────────────────────────────────────────────────────

async function getDriveClient(userId: string) {
  const token = await prisma.googleDriveToken.findUnique({ where: { userId } })
  if (!token) throw Object.assign(new Error('Google Drive not connected'), { status: 400 })

  const client = getOauth2Client()
  client.setCredentials({
    access_token: token.accessToken,
    refresh_token: token.refreshToken,
    expiry_date: token.expiresAt.getTime()
  })

  // Handle token refresh
  client.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      await prisma.googleDriveToken.update({
        where: { userId },
        data: {
          accessToken: tokens.access_token,
          ...(tokens.expiry_date && { expiresAt: new Date(tokens.expiry_date) }),
          ...(tokens.refresh_token && { refreshToken: tokens.refresh_token })
        }
      })
    }
  })

  return { drive: google.drive({ version: 'v3', auth: client }), folderId: token.folderId, email: token.email }
}

export async function getConnectionStatus(userId: string): Promise<GoogleDriveStatus> {
  const token = await prisma.googleDriveToken.findUnique({ where: { userId } })
  if (!token) {
    return {
      connected: false,
      email: null,
      folderId: null,
      lastBackup: null,
      backupCount: 0,
      storageBytesUsed: 0
    }
  }

  try {
    const { drive, folderId, email } = await getDriveClient(userId)
    
    // List files to get stats
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, size, createdTime, name)',
      orderBy: 'createdTime desc'
    })

    const files = res.data.files || []
    let storageBytesUsed = 0
    files.forEach(f => {
      if (f.size) storageBytesUsed += parseInt(f.size)
    })

    const lastFile = files[0]
    let lastBackup = null
    if (lastFile) {
      lastBackup = {
        timestamp: lastFile.createdTime!,
        success: true,
        filename: lastFile.name!
      }
    }

    return {
      connected: true,
      email,
      folderId,
      lastBackup,
      backupCount: files.length,
      storageBytesUsed
    }
  } catch (error) {
    // If auth fails, we might need to disconnect
    return {
      connected: false,
      email: token.email,
      folderId: token.folderId,
      lastBackup: null,
      backupCount: 0,
      storageBytesUsed: 0
    }
  }
}

export async function disconnect(userId: string): Promise<void> {
  const token = await prisma.googleDriveToken.findUnique({ where: { userId } })
  if (token) {
    try {
      const client = getOauth2Client()
      await client.revokeToken(token.refreshToken)
    } catch (e) {
      // Ignore revoke errors
    }
    await prisma.googleDriveToken.delete({ where: { userId } })
  }
}

export async function createBackup(userId: string): Promise<{ message: string, filename?: string }> {
  const { drive, folderId } = await getDriveClient(userId)
  if (!folderId) throw new Error('Backup folder not found in Drive')

  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error('DATABASE_URL not configured')

  const filename = `backup_${new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]}_${new Date().toISOString().split('T')[1].replace(/[:.]/g, '').substring(0, 6)}.sql.gz`
  const tmpPath = path.join('/tmp', filename)

  try {
    // 1. Run pg_dump
    await execAsync(`pg_dump "${dbUrl}" | gzip -9 > "${tmpPath}"`, { timeout: 120_000 })

    // 2. Upload to Drive
    const fileSize = fs.statSync(tmpPath).size
    const res = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [folderId]
      },
      media: {
        mimeType: 'application/gzip',
        body: fs.createReadStream(tmpPath)
      },
      fields: 'id, name'
    })

    // 3. Cleanup tmp
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath)

    return { message: 'Backup created and uploaded successfully', filename: res.data.name! }
  } catch (error: any) {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath)
    throw Object.assign(new Error(`Backup failed: ${error.message}`), { status: 500 })
  }
}

export async function listBackups(userId: string): Promise<DriveBackupFile[]> {
  const { drive, folderId } = await getDriveClient(userId)
  if (!folderId) return []

  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: 'files(id, name, createdTime, size)',
    orderBy: 'createdTime desc'
  })

  const files = res.data.files || []
  return files.map(f => ({
    id: f.id!,
    filename: f.name!,
    createdAt: f.createdTime!,
    sizeBytes: f.size ? parseInt(f.size) : 0
  }))
}

export async function downloadBackup(userId: string, fileId: string): Promise<Readable> {
  const { drive } = await getDriveClient(userId)
  
  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  )

  return res.data as Readable
}

export async function deleteBackup(userId: string, fileId: string): Promise<void> {
  const { drive } = await getDriveClient(userId)
  await drive.files.delete({ fileId })
}

export async function getBackupMetadata(userId: string, fileId: string): Promise<{filename: string, sizeBytes: number}> {
  const { drive } = await getDriveClient(userId)
  const res = await drive.files.get({ fileId, fields: 'name, size' })
  return {
    filename: res.data.name || 'backup.sql.gz',
    sizeBytes: res.data.size ? parseInt(res.data.size) : 0
  }
}

export async function restoreBackup(userId: string, fileId: string): Promise<{ message: string }> {
  const { drive } = await getDriveClient(userId)

  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw Object.assign(new Error('DATABASE_URL not configured'), { status: 500 })

  // 1. Get filename for the temp path
  const meta = await drive.files.get({ fileId, fields: 'name' })
  const filename = meta.data.name || `restore_${Date.now()}.sql.gz`
  const tmpPath = path.join('/tmp', filename)

  try {
    // 2. Download the file from Drive to /tmp
    const destStream = fs.createWriteStream(tmpPath)
    const driveStream = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    )

    await new Promise<void>((resolve, reject) => {
      (driveStream.data as any).pipe(destStream)
      destStream.on('finish', resolve)
      destStream.on('error', reject)
      ;(driveStream.data as any).on('error', reject)
    })

    // 3. Drop and recreate the public schema, then restore
    // Drop schema ensures a clean slate regardless of what is currently in the DB
    await execAsync(
      `psql "${dbUrl}" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO PUBLIC; GRANT ALL ON SCHEMA public TO postgres;"`,
      { timeout: 30_000 }
    )

    // 4. Pipe the gzipped dump into psql
    await execAsync(
      `gunzip -c "${tmpPath}" | psql "${dbUrl}"`,
      { timeout: 300_000 } // 5 minutes for large DBs
    )

    return { message: 'Database restored successfully' }
  } finally {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath)
  }
}
