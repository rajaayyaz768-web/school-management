'use client'

import { useCallback, useState } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface UseToastReturn {
  toasts: Toast[]
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  dismiss: (id: string) => void
  dismissAll: () => void
}

const MAX_TOASTS = 3
const DEFAULT_DURATION = 4000

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback(
    (type: ToastType, message: string, duration = DEFAULT_DURATION) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const toast: Toast = { id, type, message, duration }

      setToasts((prev) => {
        const newToasts = [...prev, toast]
        // Keep only the last MAX_TOASTS
        return newToasts.slice(-MAX_TOASTS)
      })

      // Auto dismiss
      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }, duration)
      }
    },
    []
  )

  const success = useCallback(
    (message: string, duration?: number) => addToast('success', message, duration),
    [addToast]
  )

  const error = useCallback(
    (message: string, duration?: number) => addToast('error', message, duration),
    [addToast]
  )

  const warning = useCallback(
    (message: string, duration?: number) => addToast('warning', message, duration),
    [addToast]
  )

  const info = useCallback(
    (message: string, duration?: number) => addToast('info', message, duration),
    [addToast]
  )

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  return { toasts, success, error, warning, info, dismiss, dismissAll }
}
