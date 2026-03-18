'use client'

import { useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import Button from './Button'

/**
 * Modal component for dialogs and overlays
 * Premium: scale entry animation, backdrop blur, refined header/footer
 */
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: ReactNode
  footer?: ReactNode
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  size = 'md',
  children,
  footer,
}: ModalProps) {
  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[8px] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          'relative w-full bg-[var(--surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)]',
          'animate-scale-in max-h-[90vh] flex flex-col',
          sizeStyles[size]
        )}
      >
        {/* Header */}
        {title && (
          <div className="border-b border-[var(--border)] px-6 py-4 flex items-start justify-between shrink-0">
            <div>
              <h2 id="modal-title" className="font-display text-lg font-semibold text-[var(--text)]">
                {title}
              </h2>
              {subtitle && (
                <p className="font-body text-sm text-[var(--text-muted)] mt-0.5">{subtitle}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="!p-1.5 -mr-1 -mt-0.5 shrink-0"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Close if no title */}
        {!title && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-3 right-3 !p-1.5"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </Button>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-[var(--border)] px-6 py-4 flex justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
