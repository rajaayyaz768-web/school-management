import type { ReactNode } from 'react'
import Link from 'next/link'
import { HardDrive } from 'lucide-react'

const SETTINGS_NAV = [
  { label: 'Backups', href: '/principal/settings/backups', icon: HardDrive },
]

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-6 xl:p-8 gap-6">
      {/* Settings sub-nav */}
      <nav className="flex gap-1 border-b border-[var(--border)] pb-0">
        {SETTINGS_NAV.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] border-b-2 border-transparent hover:text-[var(--text)] hover:border-[var(--gold)]/50 transition-colors -mb-px"
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Page content */}
      <div className="flex-1">{children}</div>
    </div>
  )
}
