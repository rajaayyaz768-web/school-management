'use client'

import { useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import Button from './Button'

/**
 * Modal component for dialogs and overlays
 * @param isOpen - Whether modal is visible
 * @param onClose - Close handler
 * @param title - Modal title
 * @param size - Modal width: sm, md, lg, xl
 * @param footer - Footer content (usually buttons)
 */
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
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
  size = 'md',
  children,
  footer,
}: ModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
    }
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-charcoal-950/70 dark:bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div
        className={cn(
          'relative w-full bg-[var(--surface)] rounded-card-lg shadow-[var(--shadow-lg)]',
          'animate-scale-in max-h-[90vh] overflow-y-auto',
          sizeStyles[size]
        )}
      >
        {/* Header */}
        {title && (
          <div className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
            <h2 className="font-display text-xl text-[var(--text)]">{title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="!p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Close button if no title */}
        {!title && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 !p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </Button>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-[var(--border)] px-6 py-4 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
