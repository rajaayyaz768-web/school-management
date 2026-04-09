'use client'

import { cn } from '@/lib/utils'
import { AlertTriangle, AlertCircle } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'

/**
 * ConfirmDialog component for confirmation prompts
 * @param isOpen - Whether dialog is visible
 * @param onClose - Close handler
 * @param onConfirm - Confirm action handler
 * @param title - Dialog title
 * @param message - Dialog message
 * @param confirmText - Confirm button text
 * @param variant - Visual style: danger, warning
 */
export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  variant?: 'danger' | 'warning'
  loading?: boolean
  children?: React.ReactNode
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  variant = 'danger',
  loading = false,
  children,
}: ConfirmDialogProps) {
  const isDanger = variant === 'danger'

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        <div
          className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4',
            isDanger
              ? 'bg-red-100 dark:bg-red-950'
              : 'bg-amber-100 dark:bg-amber-950'
          )}
        >
          {isDanger ? (
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          )}
        </div>

        <h3 className="font-display text-lg font-semibold text-[var(--text)] mb-2">
          {title}
        </h3>
        <p className="font-body text-sm text-[var(--text-muted)] mb-6">
          {message}
        </p>

        {children && <div className="mb-6 text-left">{children}</div>}

        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'gold'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
