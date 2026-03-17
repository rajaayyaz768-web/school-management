'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import type { Toast as ToastType, ToastType as ToastVariant } from '@/hooks/useToast'

/**
 * Toast notification component
 */
interface ToastProps {
  toast: ToastType
  onDismiss: (id: string) => void
}

const iconMap: Record<ToastVariant, React.ElementType> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const colorMap: Record<ToastVariant, { border: string; icon: string }> = {
  success: {
    border: 'border-l-green-500',
    icon: 'text-green-600 dark:text-green-400',
  },
  error: {
    border: 'border-l-red-500',
    icon: 'text-red-600 dark:text-red-400',
  },
  warning: {
    border: 'border-l-amber-500',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  info: {
    border: 'border-l-blue-500',
    icon: 'text-blue-600 dark:text-blue-400',
  },
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const [progress, setProgress] = useState(100)
  const Icon = iconMap[toast.type]
  const colors = colorMap[toast.type]
  const duration = toast.duration || 4000

  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
    }, 50)

    return () => clearInterval(interval)
  }, [duration])

  return (
    <div
      className={cn(
        'w-[340px] bg-[var(--surface)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)]',
        'border-l-4 animate-toast-in relative overflow-hidden',
        colors.border
      )}
    >
      <div className="px-4 py-3 flex items-start gap-3">
        <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', colors.icon)} />
        <p className="font-body text-sm text-[var(--text)] flex-1">
          {toast.message}
        </p>
        <button
          onClick={() => onDismiss(toast.id)}
          className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-0.5 bg-[var(--border)]">
        <div
          className={cn(
            'h-full transition-all duration-100',
            toast.type === 'success' && 'bg-green-500',
            toast.type === 'error' && 'bg-red-500',
            toast.type === 'warning' && 'bg-amber-500',
            toast.type === 'info' && 'bg-blue-500'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Toast container component - renders at fixed position
 */
interface ToastContainerProps {
  toasts: ToastType[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

export default Toast
