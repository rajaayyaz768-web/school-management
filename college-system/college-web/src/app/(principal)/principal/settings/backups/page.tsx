'use client'

import { useState, useEffect } from 'react'
import {
  HardDrive,
  RefreshCw,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Database,
  Link as LinkIcon,
  Unlink,
  Mail,
  Trash2,
  KeyRound,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import {
  useGoogleStatus,
  useSendOtp,
  useVerifyOtp,
  useDisconnectGoogle,
  useBackupList,
  useTriggerBackup,
  useDeleteBackup,
  useRestoreBackup,
} from '@/features/system/hooks/useBackups'
import type { DriveBackupFile } from '@/features/system/types/system.types'
import { getGoogleAuthUrl, getBackupDownloadUrl } from '@/features/system/api/system.api'
import { useAuthStore } from '@/store/authStore'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function getRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(diff / 3_600_000)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

// ── Restore Confirmation Modal ────────────────────────────────────────────────

interface RestoreModalProps {
  file: DriveBackupFile
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}

function RestoreModal({ file, onConfirm, onCancel, isPending }: RestoreModalProps) {
  const [confirmText, setConfirmText] = useState('')
  const ready = confirmText === 'RESTORE'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[var(--surface)] border border-red-500/30 rounded-2xl shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">Restore Database</h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              This will permanently replace all current data.
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="p-4 rounded-xl bg-red-500/8 border border-red-500/20 space-y-2 text-sm text-red-300">
          <p className="font-semibold">⚠ What will happen:</p>
          <ul className="list-disc list-inside space-y-1 text-red-300/80">
            <li>All current database data will be wiped</li>
            <li>All users will be signed out immediately</li>
            <li>Data will be replaced with this backup</li>
          </ul>
        </div>

        {/* File info */}
        <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm">
          <p className="font-medium text-[var(--text)] truncate">{file.filename}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {new Date(file.createdAt).toLocaleString()} · {formatBytes(file.sizeBytes)}
          </p>
        </div>

        {/* Confirm input */}
        <div className="space-y-2">
          <label className="block text-sm text-[var(--text-muted)]">
            Type <span className="font-mono font-bold text-red-400">RESTORE</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder="RESTORE"
            disabled={isPending}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono text-[var(--text)] placeholder:text-[var(--text-muted)]/40 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 disabled:opacity-50"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--primary)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!ready || isPending}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all',
              ready && !isPending
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-red-600/30 text-red-400/50 cursor-not-allowed'
            )}
          >
            {isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Restoring…
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                Restore Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Components ────────────────────────────────────────────────────────────────

export default function BackupsPage() {
  const { data: status, isLoading: statusLoading } = useGoogleStatus()
  const { data: backups, isLoading: backupsLoading } = useBackupList()
  
  const sendOtpMutation = useSendOtp()
  const verifyOtpMutation = useVerifyOtp()
  const disconnectMutation = useDisconnectGoogle()
  const triggerMutation = useTriggerBackup()
  const deleteMutation = useDeleteBackup()
  const restoreMutation = useRestoreBackup()

  // Setup Flow State
  const [setupStep, setSetupStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Restore State
  const [restoreTarget, setRestoreTarget] = useState<DriveBackupFile | null>(null)
  const [restoreResult, setRestoreResult] = useState<'success' | 'error' | null>(null)
  const [restoreError, setRestoreError] = useState('')

  const handleRestore = async () => {
    if (!restoreTarget) return
    setRestoreResult(null)
    setRestoreError('')
    try {
      await restoreMutation.mutateAsync(restoreTarget.id)
      setRestoreResult('success')
      setRestoreTarget(null)
    } catch (err: any) {
      setRestoreResult('error')
      setRestoreError(err.response?.data?.message || 'Restore failed')
      setRestoreTarget(null)
    }
  }

  useEffect(() => {
    // Reset state if status changes
    if (status?.connected) {
      setSetupStep(1)
      setEmail('')
      setOtp('')
    }
  }, [status?.connected])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setErrorMsg('')
    try {
      await sendOtpMutation.mutateAsync(email)
      setSetupStep(2)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to send OTP')
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp) return
    setErrorMsg('')
    try {
      await verifyOtpMutation.mutateAsync({ email, otp })
      setSetupStep(3)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid OTP')
    }
  }

  const handleAuthorize = async () => {
    try {
      const url = await getGoogleAuthUrl(email)
      window.location.href = url
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to start authorization')
    }
  }

  if (statusLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <PageHeader title="Database Backups" />
        <Skeleton className="h-64 w-full rounded-xl bg-white/5" />
      </div>
    )
  }

  // ── Flow: Not Connected ─────────────────────────────────────────────────────
  if (!status?.connected) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <PageHeader title="Database Backups" />

        <div className="max-w-xl mx-auto mt-12">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4">
                <HardDrive className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-[var(--text)] mb-2">Connect Google Drive</h2>
              <p className="text-[var(--text-muted)] text-sm">
                Securely store your daily database backups off-site. We need to verify your email before requesting Drive access.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="text-sm">{errorMsg}</span>
              </div>
            )}

            {setupStep === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
                    Gmail Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin@gmail.com"
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/50"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  loading={sendOtpMutation.isPending}
                >
                  Send Verification Code
                </Button>
              </form>
            )}

            {setupStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
                    Enter Verification Code sent to {email}
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      required
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/50 tracking-widest font-mono focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/50"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="flex-1"
                    onClick={() => setSetupStep(1)}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    loading={verifyOtpMutation.isPending}
                  >
                    Verify
                  </Button>
                </div>
              </form>
            )}

            {setupStep === 3 && (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-green-500/10 text-green-400 mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium text-[var(--text)]">Email Verified</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  Click below to authorize College Portal to store backups in your Google Drive.
                </p>
                <Button 
                  onClick={handleAuthorize} 
                  className="w-full mt-4"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Authorize Google Drive
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    )
  }

  // ── Flow: Connected Dashboard ────────────────────────────────────────────────
  const isBackingUp = triggerMutation.isPending

  return (
    <>
    {/* Restore confirmation modal */}
    {restoreTarget && (
      <RestoreModal
        file={restoreTarget}
        onConfirm={handleRestore}
        onCancel={() => setRestoreTarget(null)}
        isPending={restoreMutation.isPending}
      />
    )}
    <div className="min-h-screen bg-[var(--bg)]">
    {/* Mobile header */}
    <header className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-14 flex items-center justify-between md:hidden">
      <h1 className="font-bold text-lg text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>System Backups</h1>
      <Button size="sm" onClick={() => triggerMutation.mutate()} disabled={isBackingUp} loading={isBackingUp}>
        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
        {isBackingUp ? 'Creating...' : 'Backup Now'}
      </Button>
    </header>
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="hidden sm:block">
      <PageHeader
        title="Database Backups"
        actions={
          <Button
            onClick={() => triggerMutation.mutate()}
            disabled={isBackingUp}
            loading={isBackingUp}
          >
            {isBackingUp ? (
              'Creating...'
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">Create Backup Now</span>
              </>
            )}
          </Button>
        }
      />
      </div>

      {/* Restore result banner */}
      {restoreResult === 'success' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Database restored successfully</p>
            <p className="text-xs text-emerald-400/70 mt-0.5">All users have been signed out. Please refresh and log in again.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setRestoreResult(null)} className="ml-auto !p-1 text-emerald-400/50 hover:text-emerald-400 hover:!bg-transparent">
            <XCircle className="w-4 h-4" />
          </Button>
        </div>
      )}
      {restoreResult === 'error' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Restore failed</p>
            <p className="text-xs text-red-400/70 mt-0.5">{restoreError}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setRestoreResult(null)} className="ml-auto !p-1 text-red-400/50 hover:text-red-400 hover:!bg-transparent">
            <XCircle className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Connection Info */}
      <Card className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full flex items-center justify-center shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--text)] flex items-center gap-2">
              Google Drive Connected
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </h3>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              Syncing to <span className="text-[var(--text)]">{status?.email}</span>
            </p>
          </div>
        </div>
        <Button 
          variant="danger" 
          size="sm"
          onClick={() => disconnectMutation.mutate()}
          loading={disconnectMutation.isPending}
        >
          <Unlink className="w-4 h-4 mr-2" />
          Disconnect
        </Button>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
              Last Backup
            </p>
            <p className="text-lg font-semibold text-[var(--text)]">
              {status?.lastBackup ? getRelativeTime(status.lastBackup.timestamp) : 'Never'}
            </p>
            {status?.lastBackup && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate max-w-[150px]">
                {status.lastBackup.success ? 'Successful' : 'Failed'}
              </p>
            )}
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
              Total Backups
            </p>
            <p className="text-lg font-semibold text-[var(--text)]">
              {status?.backupCount || 0} files
            </p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
              Storage Used
            </p>
            <p className="text-lg font-semibold text-[var(--text)]">
              {formatBytes(status?.storageBytesUsed || 0)}
            </p>
          </div>
        </Card>
      </div>

      {/* Files List */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h3 className="text-base font-semibold text-[var(--text)]">Backup History</h3>
        </div>
        
        {backupsLoading ? (
          <div className="p-8 text-center text-[var(--text-muted)] text-sm">
            Loading backups...
          </div>
        ) : !backups || backups.length === 0 ? (
          <div className="p-12 text-center">
            <Database className="w-8 h-8 text-[var(--text-muted)]/50 mx-auto mb-3" />
            <p className="text-sm text-[var(--text-muted)]">No backups found in Drive.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {backups.map(file => (
              <div key={file.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center">
                    <Database className="w-5 h-5 text-[var(--text-muted)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{file.filename}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
                      <span>{new Date(file.createdAt).toLocaleString()}</span>
                      <span>•</span>
                      <span>{formatBytes(file.sizeBytes)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 gap-1.5 text-xs font-medium"
                    onClick={() => { setRestoreTarget(file); setRestoreResult(null) }}
                    disabled={restoreMutation.isPending}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 text-[var(--text-muted)] hover:text-white"
                    onClick={() => {
                      const url = getBackupDownloadUrl(file.id)
                      const token = useAuthStore.getState().accessToken
                      fetch(url, { headers: { Authorization: `Bearer ${token}` } })
                        .then(r => r.blob())
                        .then(blob => {
                          const objectUrl = window.URL.createObjectURL(blob)
                          const link = document.createElement('a')
                          link.href = objectUrl
                          link.download = file.filename
                          document.body.appendChild(link)
                          link.click()
                          link.remove()
                          window.URL.revokeObjectURL(objectUrl)
                        })
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => deleteMutation.mutate(file.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
    </div>
    </>
  )
}
