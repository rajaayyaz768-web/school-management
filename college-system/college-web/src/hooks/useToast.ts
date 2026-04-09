'use client'

import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

const MAX_TOASTS = 3
const DEFAULT_DURATION = 4000

interface ToastStore {
  toasts: Toast[]
  addToast: (type: ToastType, message: string, duration?: number) => void
  dismiss: (id: string) => void
  dismissAll: () => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (type, message, duration = DEFAULT_DURATION) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const toast: Toast = { id, type, message, duration }

    set((state) => ({
      toasts: [...state.toasts, toast].slice(-MAX_TOASTS),
    }))

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      }, duration)
    }
  },

  dismiss: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },

  dismissAll: () => {
    set({ toasts: [] })
  },
}))

interface UseToastReturn {
  toasts: Toast[]
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  dismiss: (id: string) => void
  dismissAll: () => void
}

export function useToast(): UseToastReturn {
  const { toasts, addToast, dismiss, dismissAll } = useToastStore()

  return {
    toasts,
    success: (message: string, duration?: number) => {
      console.log('%c[TOAST SUCCESS]', 'color: #10B981; font-weight: bold', message)
      addToast('success', message, duration)
    },
    error: (message: string, duration?: number) => {
      console.error('%c[TOAST ERROR]', 'color: #EF4444; font-weight: bold', message)
      addToast('error', message, duration)
    },
    warning: (message: string, duration?: number) => {
      console.warn('%c[TOAST WARNING]', 'color: #F59E0B; font-weight: bold', message)
      addToast('warning', message, duration)
    },
    info: (message: string, duration?: number) => {
      console.log('%c[TOAST INFO]', 'color: #3B82F6; font-weight: bold', message)
      addToast('info', message, duration)
    },
    dismiss,
    dismissAll,
  }
}
