'use client'

import { useState } from 'react'
import { Search, PenSquare, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

// Chat is not yet implemented on the backend.
// This renders the mobile UI shell matching the Stitch design.

export default function TeacherChatPage() {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-16 flex items-center justify-between">
        <h1 className="font-bold text-lg text-[var(--text)]">Messages</h1>
        <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--surface)] transition-colors text-[var(--text-muted)] hover:text-[var(--primary)]">
          <PenSquare className="w-5 h-5" />
        </button>
      </header>

      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3 h-11">
          <Search className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 py-2">
        {(['all', 'unread'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'h-8 px-4 rounded-full text-xs font-semibold transition-colors capitalize',
              activeTab === tab
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Coming soon state */}
      <div className="flex flex-col items-center justify-center mt-20 px-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-[var(--primary)]" />
        </div>
        <h2 className="font-bold text-lg text-[var(--text)] mb-2">Chat Coming Soon</h2>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          The messaging feature is being set up. You&apos;ll be able to chat with students, parents, and staff here.
        </p>
      </div>
    </div>
  )
}
