'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HardDrive, UserCog } from 'lucide-react'
import { cn } from '@/lib/utils'

const SETTINGS_NAV = [
  { label: 'Account', href: '/principal/settings/account', icon: UserCog },
  { label: 'Backups', href: '/principal/settings/backups', icon: HardDrive },
]

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-6 xl:p-8 gap-6">
      {/* Settings sub-nav */}
      <nav className="flex gap-1 border-b border-[var(--border)] pb-0">
        {SETTINGS_NAV.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                isActive
                  ? 'text-[var(--primary)] border-[var(--primary)]'
                  : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text)] hover:border-[var(--gold)]/50'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Page content */}
      <div className="flex-1">{children}</div>
    </div>
  )
}
