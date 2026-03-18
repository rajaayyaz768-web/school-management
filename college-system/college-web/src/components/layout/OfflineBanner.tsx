'use client'

import { cn } from '@/lib/utils'
import { WifiOff } from 'lucide-react'

/**
 * OfflineBanner — full-width strip indicating offline state
 */
export interface OfflineBannerProps {
  className?: string
}

export function OfflineBanner({ className }: OfflineBannerProps) {
  return (
    <div
      className={cn(
        'w-full bg-[var(--danger)] text-white py-2 px-4',
        'flex items-center justify-center gap-2',
        'font-body text-sm font-medium',
        'animate-slide-in',
        className
      )}
      role="alert"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>You are currently offline. Some features may be unavailable.</span>
    </div>
  )
}

export default OfflineBanner
