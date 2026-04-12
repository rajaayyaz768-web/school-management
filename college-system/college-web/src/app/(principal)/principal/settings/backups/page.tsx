'use client'

import { useState } from 'react'
import {
  HardDrive,
  RefreshCw,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Database,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import { useBackupList, useBackupStatus, useTriggerBackup } from '@/features/system/hooks/useBackups'
import { getBackupDownloadUrl } from '@/features/system/api/system.api'
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

// ── Not configured state ──────────────────────────────────────────────────────

function NotConfigured() {
  return (
    <Card className="p-8 text-center">
      <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
      <h3 className="text-base font-semibold text-[var(--text)] mb-1">Backups not configured</h3>
      <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto">
        Set <code className="px-1 py-0.5 rounded bg-white/10 text-xs">BACKUP_DIR</code> and{' '}
        <code className="px-1 py-0.5 rounded bg-white/10 text-xs">BACKUP_SCRIPT</code> environment
        variables on the server to enable backup management.
      </p>
    </Card>
  )
}

// ── Status Panel ──────────────────────────────────────────────────────────────

function StatusPanel() {
  const { data: status, isLoading } = useBackupStatus()

  if (isLoading) return <Skeleton variant="card" className="h-28" />
  if (!status?.configured) return <NotConfigured />

  const lastRun = status.lastRun
  const isHealthy = lastRun?.success ?? false
  const isStale =
    lastRun && Date.now() - new Date(lastRun.timestamp).getTime() > 36 * 3_600_000

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Last backup run */}
      <div className={cn(
        'rounded-[var(--radius-lg)] border p-4',
        !lastRun ? 'border-[var(--border)] bg-[var(--surface)]' :
        isHealthy && !isStale ? 'border-emerald-500/30 bg-emerald-500/5' :
        'border-red-500/30 bg-red-500/5'
      )}>
        <div className="flex items-center gap-2 mb-2">
          {!lastRun ? <Clock className="w-4 h-4 text-[var(--text-muted)]" /> :
           isHealthy && !isStale ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> :
           <XCircle className="w-4 h-4 text-red-400" />}
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Last Backup
          </span>
        </div>
        <p className={cn(
          'text-base font-bold',
          !lastRun ? 'text-[var(--text-muted)]' :
          isHealthy && !isStale ? 'text-emerald-400' : 'text-red-400'
        )}>
          {lastRun ? getRelativeTime(lastRun.timestamp) : 'Never'}
        </p>
        {lastRun && (
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
            {new Date(lastRun.timestamp).toLocaleString('en-PK')}
          </p>
        )}
        {lastRun?.error && (
          <p className="text-[10px] text-red-400 mt-1 truncate" title={lastRun.error}>
            {lastRun.error}
          </p>
        )}
      </div>

      {/* Storage used */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-4 h-4 text-[var(--text-muted)]" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Storage Used
          </span>
        </div>
        <p className="text-base font-bold text-[var(--text)]">
          {formatBytes(status.storageBytesUsed)}
        </p>
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-mono truncate">
          {status.backupDir}
        </p>
      </div>

      {/* Health indicator */}
      <div className={cn(
        'rounded-[var(--radius-lg)] border p-4',
        isHealthy && !isStale
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : 'border-amber-500/30 bg-amber-500/5'
      )}>
        <div className="flex items-center gap-2 mb-2">
          <HardDrive className={cn(
            'w-4 h-4',
            isHealthy && !isStale ? 'text-emerald-400' : 'text-amber-400'
          )} />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Status
          </span>
        </div>
        <p className={cn(
          'text-base font-bold',
          isHealthy && !isStale ? 'text-emerald-400' : 'text-amber-400'
        )}>
          {!lastRun ? 'Awaiting first run' : isStale ? 'Overdue' : isHealthy ? 'Healthy' : 'Failed'}
        </p>
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
          {isStale ? 'Last backup > 36 hours ago' : 'Automatic backup running'}
        </p>
      </div>
    </div>
  )
}

// ── Backups Table ─────────────────────────────────────────────────────────────

function BackupsTable() {
  const { data: backups, isLoading } = useBackupList()
  const { data: status } = useBackupStatus()
  const accessToken = useAuthStore((s) => s.accessToken)

  const handleDownload = (filename: string) => {
    const url = getBackupDownloadUrl(filename)
    const link = document.createElement('a')
    link.href = url
    // Attach the auth header via a fetch-based download for protected endpoints
    fetch(url, { headers: { Authorization: `Bearer ${accessToken ?? ''}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob)
        link.href = objectUrl
        link.download = filename
        link.click()
        URL.revokeObjectURL(objectUrl)
      })
      .catch(() => {
        // Fallback: open directly in new tab
        window.open(url, '_blank')
      })
  }

  if (!status?.configured) return null

  if (isLoading) {
    return (
      <Card>
        <div className="p-4 space-y-2">
          {[...Array(3)].map((_, i) => <Skeleton key={i} variant="text" className="h-12" />)}
        </div>
      </Card>
    )
  }

  if (!backups || backups.length === 0) {
    return (
      <Card className="p-8 text-center">
        <HardDrive className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
        <p className="text-sm text-[var(--text-muted)]">No backups found in the backup directory.</p>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text)]">Recent Backups</h3>
        <span className="text-xs text-[var(--text-muted)]">{backups.length} file{backups.length !== 1 ? 's' : ''}</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] bg-white/2">
            {['Filename', 'Created', 'Size', ''].map((h) => (
              <th
                key={h}
                className="text-left px-5 py-3 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {backups.map((backup) => (
            <tr key={backup.filename} className="hover:bg-[var(--surface)] transition-colors">
              <td className="px-5 py-3 font-mono text-xs text-[var(--text)]">{backup.filename}</td>
              <td className="px-5 py-3 text-xs text-[var(--text-muted)]">
                {new Date(backup.createdAt).toLocaleDateString('en-PK', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="px-5 py-3 text-xs text-[var(--text-muted)]">
                {formatBytes(backup.sizeBytes)}
              </td>
              <td className="px-5 py-3 text-right">
                <button
                  onClick={() => handleDownload(backup.filename)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-[var(--gold)] border border-[var(--gold)]/30 hover:bg-[var(--gold)]/10 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BackupsPage() {
  const { data: status } = useBackupStatus()
  const { mutate: trigger, isPending, isSuccess, isError } = useTriggerBackup()
  const [triggered, setTriggered] = useState(false)

  const handleTrigger = () => {
    setTriggered(true)
    trigger()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Backup Management"
          subtitle="Database backups and restore points"
          breadcrumb={[
            { label: 'Home', href: '/principal/dashboard' },
            { label: 'Settings', href: '/principal/settings/backups' },
            { label: 'Backups' },
          ]}
        />

        {status?.configured && (
          <div className="flex items-center gap-3 pt-1">
            {triggered && isSuccess && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Backup created
              </span>
            )}
            {triggered && isError && (
              <span className="flex items-center gap-1.5 text-xs text-red-400">
                <XCircle className="w-3.5 h-3.5" />
                Backup failed
              </span>
            )}
            <Button
              onClick={handleTrigger}
              disabled={isPending}
              icon={<RefreshCw className={cn('w-4 h-4', isPending && 'animate-spin')} />}
              size="sm"
            >
              {isPending ? 'Creating backup…' : 'Create Backup Now'}
            </Button>
          </div>
        )}
      </div>

      <StatusPanel />
      <BackupsTable />
    </div>
  )
}
