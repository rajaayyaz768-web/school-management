'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import type { Toast as ToastType, ToastType as ToastVariant } from '@/hooks/useToast'

/**
 * Toast notification component
 * Sleek notification bar with progress countdown and left border accent
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

const colorMap: Record<ToastVariant, { border: string; icon: string; progress: string }> = {
  success: {
    border: 'border-l-[#10B981]',
    icon: 'text-[#10B981]',
    progress: 'bg-[#10B981]',
  },
  error: {
    border: 'border-l-[#EF4444]',
    icon: 'text-[#EF4444]',
    progress: 'bg-[#EF4444]',
  },
  warning: {
    border: 'border-l-[#F59E0B]',
    icon: 'text-[#F59E0B]',
    progress: 'bg-[#F59E0B]',
  },
  info: {
    border: 'border-l-[#3B82F6]',
    icon: 'text-[#3B82F6]',
    progress: 'bg-[#3B82F6]',
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
        'w-[360px] bg-[var(--surface)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)]',
        'border border-[var(--border)] border-l-[3px]',
        'animate-toast-in relative overflow-hidden',
        colors.border
      )}
      role="alert"
    >
      <div className="px-4 py-3 flex items-start gap-3">
        <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', colors.icon)} />
        <p className="font-body text-sm text-[var(--text)] flex-1 leading-relaxed">
          {toast.message}
        </p>
        <button
          onClick={() => onDismiss(toast.id)}
          className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors duration-[180ms] shrink-0 mt-0.5"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-[2px] bg-[var(--border)]/50">
        <div
          className={cn('h-full transition-all duration-100 ease-linear', colors.progress)}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Toast container — fixed position, stacked
 */
interface ToastContainerProps {
  toasts: ToastType[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2.5">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

export default Toast
