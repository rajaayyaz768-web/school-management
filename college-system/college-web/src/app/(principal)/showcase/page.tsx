'use client'

import React, { useState, useEffect } from 'react'
import {
  GraduationCap, Users, Search, UserCog, Wallet, BookOpen, ClipboardList,
  CalendarCheck, Clock, BarChart3, Settings, Bell, Plus, Eye, Pencil, Trash2,
  LayoutDashboard, Megaphone, Github, Mail, Lock, User, Phone,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { StatCard } from '@/components/ui/StatCard'
import { Avatar, AvatarGroup } from '@/components/ui/Avatar'
import { Table } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Tabs, TabPanel } from '@/components/ui/Tabs'
import { MultiSelect } from '@/components/ui/MultiSelect'
import { Skeleton } from '@/components/ui/Skeleton'
import { Pagination } from '@/components/ui/Pagination'
import { Textarea } from '@/components/ui/Textarea'
import { DatePicker } from '@/components/ui/DatePicker'
import { FileUpload } from '@/components/ui/FileUpload'
import { OfflineBanner } from '@/components/layout/OfflineBanner'
import { SearchInput } from '@/components/ui/SearchInput'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { Tooltip } from '@/components/ui/Tooltip'
import { StatusDot } from '@/components/ui/StatusDot'
import { Drawer } from '@/components/ui/Drawer'
import { Popover, PopoverContent, PopoverItem, PopoverDivider, PopoverHeader } from '@/components/ui/Popover'

/* ────────────────────────────────────────── */
/* Showcase Data                              */
/* ────────────────────────────────────────── */

const SECTIONS = [
  { id: 'foundations', label: 'Foundations' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'inputs', label: 'Inputs' },
  { id: 'form-utilities', label: 'Form Utilities' },
  { id: 'data-display', label: 'Data Display' },
  { id: 'utility-indicators', label: 'Utility Indicators' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'overlays', label: 'Overlays' },
  { id: 'overlays-popovers', label: 'Overlays & Popovers' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'cards', label: 'Card Variants' },
  { id: 'composition', label: 'Composition' },
]

const STUDENT_DATA = [
  { name: 'Ahmed Khan', rollNo: 'BSE-2024-001', section: 'A', attendance: 'present' as const, feeStatus: 'paid' as const },
  { name: 'Fatima Ali', rollNo: 'BSE-2024-002', section: 'A', attendance: 'absent' as const, feeStatus: 'pending' as const },
  { name: 'Usman Shah', rollNo: 'BSE-2024-003', section: 'B', attendance: 'present' as const, feeStatus: 'paid' as const },
  { name: 'Ayesha Noor', rollNo: 'BSE-2024-004', section: 'A', attendance: 'late' as const, feeStatus: 'overdue' as const },
  { name: 'Bilal Raza', rollNo: 'BSE-2024-005', section: 'B', attendance: 'present' as const, feeStatus: 'partial' as const },
]

const TABLE_COLUMNS = [
  {
    key: 'name',
    header: 'Student',
    render: (row: typeof STUDENT_DATA[0]) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.name} size="sm" />
        <span className="font-medium">{row.name}</span>
      </div>
    ),
  },
  { key: 'rollNo', header: 'Roll No' },
  { key: 'section', header: 'Section' },
  {
    key: 'attendance',
    header: 'Attendance',
    render: (row: typeof STUDENT_DATA[0]) => (
      <Badge variant={row.attendance} dot>{row.attendance}</Badge>
    ),
  },
  {
    key: 'feeStatus',
    header: 'Fee Status',
    render: (row: typeof STUDENT_DATA[0]) => (
      <Badge variant={row.feeStatus}>{row.feeStatus}</Badge>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: () => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} aria-label="View" />
        <Button variant="ghost" size="sm" icon={<Pencil className="w-4 h-4" />} aria-label="Edit" />
        <Button variant="ghost" size="sm" icon={<Trash2 className="w-4 h-4" />} aria-label="Delete" />
      </div>
    ),
  },
]

/* ────────────────────────────────────────── */
/* Helper Components                          */
/* ────────────────────────────────────────── */

function ThemePanel({ mode, children }: { mode: 'light' | 'dark'; children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-w-0">
      <div
        className="px-4 py-2 border-b"
        style={{
          background: mode === 'light' ? '#E8F0F0' : '#141414',
          borderColor: mode === 'light' ? '#C8DEDE' : '#333333',
        }}
      >
        <span
          className="font-body text-[11px] font-semibold uppercase"
          style={{
            letterSpacing: '0.08em',
            color: mode === 'light' ? '#4A6868' : '#888888',
          }}
        >
          {mode === 'light' ? 'Light Mode' : 'Dark Mode'}
        </span>
      </div>
      <div
        data-theme={mode}
        className="p-6 flex-1"
        style={{
          background: mode === 'light' ? '#F2F7F7' : '#0C0C0C',
          borderRadius: mode === 'light' ? '0 0 0 12px' : '0 0 12px 0',
        }}
      >
        {children}
      </div>
    </div>
  )
}

function DualPanel({ children }: { children: (mode: 'light' | 'dark') => React.ReactNode }) {
  return (
    <div className="border rounded-[var(--radius-lg)] overflow-hidden" style={{ borderColor: '#C8DEDE' }}>
      <div className="grid grid-cols-2">
        <ThemePanel mode="light">{children('light')}</ThemePanel>
        <div style={{ borderLeft: '1px solid #C8DEDE' }}>
          <ThemePanel mode="dark">{children('dark')}</ThemePanel>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ id, title, subtitle }: { id: string; title: string; subtitle: string }) {
  return (
    <div id={id} className="scroll-mt-28 mb-8">
      <h2 className="font-display text-[32px] font-bold" style={{ color: '#0F4444' }}>
        {title}
      </h2>
      <p className="font-body text-[15px] mt-1" style={{ color: '#4A6868' }}>
        {subtitle}
      </p>
    </div>
  )
}

/* ────────────────────────────────────────── */
/* Main Showcase Page                         */
/* ────────────────────────────────────────── */

export default function ShowcasePage() {
  const [activeSection, setActiveSection] = useState('foundations')
  const [activeTab, setActiveTab] = useState('profile')
  const [multiSelectValue, setMultiSelectValue] = useState<string[]>(['sec-a', 'sec-b'])
  const [currentPage, setCurrentPage] = useState(1)

  // Track active section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { rootMargin: '-100px 0px -70% 0px' }
    )

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="-m-6 min-h-screen" style={{ background: '#F2F7F7' }}>
      {/* ── Fixed Header ── */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{
          background: 'rgba(242, 247, 247, 0.85)',
          borderColor: '#C8DEDE',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#D4A843' }}>
              <GraduationCap className="w-5 h-5" style={{ color: '#0F4444' }} />
            </div>
            <h1 className="font-display text-xl font-bold" style={{ color: '#0F4444' }}>
              Design System
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="font-body text-xs font-semibold px-2.5 py-1 rounded-full border"
              style={{ color: '#4A6868', borderColor: '#C8DEDE', background: '#FFFFFF' }}
            >
              v1.0
            </span>
            <a
              href="#"
              className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity"
              style={{ color: '#4A6868' }}
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Section Nav */}
        <div className="max-w-7xl mx-auto px-6 pb-3">
          <div className="flex gap-1.5 overflow-x-auto">
            {SECTIONS.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="font-body text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-[180ms]"
                style={{
                  background: activeSection === id ? '#0F4444' : 'transparent',
                  color: activeSection === id ? '#FFFFFF' : '#4A6868',
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* ━━ SECTION 1: FOUNDATIONS ━━ */}
        <section className="pb-20">
          <SectionHeader id="foundations" title="Foundations" subtitle="Color palette, typography, spacing, shadows, and border radius tokens" />

          <DualPanel>
            {() => (
              <div className="space-y-8">
                {/* Colors */}
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Color Palette</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Primary', color: 'var(--primary)' },
                      { label: 'Gold', color: 'var(--gold)' },
                      { label: 'Success', color: 'var(--success)' },
                      { label: 'Warning', color: 'var(--warning)' },
                      { label: 'Danger', color: 'var(--danger)' },
                      { label: 'Info', color: 'var(--info)' },
                      { label: 'Surface', color: 'var(--surface)' },
                      { label: 'Border', color: 'var(--border)' },
                    ].map(({ label, color }) => (
                      <div key={label} className="text-center">
                        <div className="w-full h-10 rounded-lg border border-[var(--border)]" style={{ background: color }} />
                        <p className="font-body text-[10px] text-[var(--text-muted)] mt-1">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography */}
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Typography</p>
                  <div className="space-y-2">
                    <p className="font-display text-2xl font-bold text-[var(--text)]">Playfair Display</p>
                    <p className="font-body text-base text-[var(--text)]">DM Sans — Body text, UI elements</p>
                    <p className="font-body text-sm text-[var(--text-secondary)]">Secondary text — 14px</p>
                    <p className="font-body text-xs text-[var(--text-muted)]">Muted text — 12px</p>
                  </div>
                </div>

                {/* Shadows */}
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Shadows</p>
                  <div className="flex gap-4">
                    {['sm', 'md', 'lg'].map((s) => (
                      <div
                        key={s}
                        className="w-20 h-20 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center"
                        style={{ boxShadow: `var(--shadow-${s})` }}
                      >
                        <span className="font-body text-xs text-[var(--text-muted)]">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Radius */}
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Border Radius</p>
                  <div className="flex gap-4 items-end">
                    {[
                      { label: 'sm (8px)', val: 'var(--radius-sm)' },
                      { label: 'md (12px)', val: 'var(--radius-md)' },
                      { label: 'lg (16px)', val: 'var(--radius-lg)' },
                    ].map(({ label, val }) => (
                      <div key={label} className="text-center">
                        <div className="w-16 h-16 bg-[var(--primary)]/10 border border-[var(--primary)]/30" style={{ borderRadius: val }} />
                        <p className="font-body text-[10px] text-[var(--text-muted)] mt-1">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DualPanel>
        </section>


        {/* ━━ SECTION 2: BUTTONS ━━ */}
        <section className="pb-20">
          <SectionHeader id="buttons" title="Buttons" subtitle="Interactive buttons with hover lift, active press, and focus rings" />

          <DualPanel>
            {() => (
              <div className="space-y-6">
                {/* Variants */}
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Variants</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="gold">Gold</Button>
                    <Button variant="outline">Outline</Button>
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Sizes</p>
                  <div className="flex items-center gap-2">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>

                {/* States */}
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">States</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button loading>Loading</Button>
                    <Button disabled>Disabled</Button>
                    <Button icon={<Plus className="w-4 h-4" />}>With Icon</Button>
                    <Button variant="secondary" icon={<Plus className="w-4 h-4" />} />
                  </div>
                </div>

                {/* Button Group */}
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Button Group</p>
                  <div className="inline-flex rounded-[var(--radius-sm)] border border-[var(--border)] overflow-hidden">
                    <Button variant="ghost" size="sm" className="rounded-none border-r border-[var(--border)]">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-none border-r border-[var(--border)]">
                      Day
                    </Button>
                    <Button variant="primary" size="sm" className="rounded-none border-r border-[var(--border)]">
                      Week
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-none">
                      Month
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-none border-l border-[var(--border)]">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DualPanel>
        </section>


        {/* ━━ SECTION 3: FORM INPUTS ━━ */}
        <section className="pb-20">
          <SectionHeader id="inputs" title="Form Inputs" subtitle="Text inputs, selects, multiselects, textarea, date picker, and file upload" />

          <DualPanel>
            {() => (
              <div className="space-y-6">
                {/* Input variants */}
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Full Name" placeholder="Enter name" icon={<User className="w-4 h-4" />} />
                  <Input label="Email" placeholder="email@example.com" icon={<Mail className="w-4 h-4" />} rightIcon={<span className="text-[10px] font-body text-[var(--text-muted)]">.edu</span>} />
                  <Input label="Password" type="password" placeholder="Enter password" icon={<Lock className="w-4 h-4" />} />
                  <Input label="Phone" placeholder="0300-1234567" error="Invalid phone number" icon={<Phone className="w-4 h-4" />} />
                  <Input label="With Hint" placeholder="Optional field" hint="This field is optional" />
                  <Input label="Disabled" placeholder="Cannot edit" disabled />
                </div>

                {/* Select & MultiSelect */}
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Program"
                    placeholder="Select program"
                    options={[
                      { value: 'bse', label: 'BSE - Software Engineering' },
                      { value: 'bcs', label: 'BCS - Computer Science' },
                      { value: 'bba', label: 'BBA - Business Admin' },
                    ]}
                  />
                  <MultiSelect
                    label="Sections"
                    placeholder="Select sections"
                    value={multiSelectValue}
                    onChange={setMultiSelectValue}
                    options={[
                      { value: 'sec-a', label: 'Section A' },
                      { value: 'sec-b', label: 'Section B' },
                      { value: 'sec-c', label: 'Section C' },
                      { value: 'sec-d', label: 'Section D' },
                    ]}
                  />
                </div>

                {/* Textarea & DatePicker */}
                <div className="grid grid-cols-2 gap-4">
                  <Textarea label="Notes" placeholder="Enter additional notes" showCount maxLength={200} defaultValue="Student performs well in academics." />
                  <DatePicker label="Admission Date" value="2024-09-01" onChange={() => {}} />
                </div>

                {/* FileUpload */}
                <FileUpload label="Student Photo" accept="image/*" hint="JPG, PNG up to 5MB" maxSize={5} />
              </div>
            )}
          </DualPanel>
        </section>


        {/* ━━ SECTION 3.5: FORM UTILITIES ━━ */}
        <section className="pb-20">
          <SectionHeader id="form-utilities" title="Form Utilities" subtitle="Advanced inputs like search with debounce and phone number formatting" />

          <DualPanel>
            {() => (
              <div className="space-y-8">
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Search Input</p>
                  <div className="space-y-4 max-w-md">
                    <SearchInput value="" onChange={() => {}} placeholder="Default (empty)..." />
                    <SearchInput value="Query" onChange={() => {}} placeholder="With value..." />
                    <SearchInput value="" onChange={() => {}} placeholder="Loading state..." isLoading />
                    <div className="flex gap-4">
                      <SearchInput value="" onChange={() => {}} placeholder="Small (sm)" size="sm" />
                      <SearchInput value="" onChange={() => {}} placeholder="Large (lg)" size="lg" />
                    </div>
                    <SearchInput value="" onChange={() => {}} placeholder="Disabled" disabled />
                  </div>
                </div>

                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Phone Input</p>
                  <div className="space-y-4 max-w-md">
                    <PhoneInput value="" onChange={() => {}} label="Empty Input" />
                    <PhoneInput value="03001234567" onChange={() => {}} label="With Value" />
                    <PhoneInput value="03" onChange={() => {}} label="With Error" error="Enter a valid Pakistani mobile number" />
                    
                    <div className="pt-4 space-y-3 border-t border-[var(--border)]">
                      <p className="font-body text-[11px] font-medium text-[var(--text-muted)]">Display Mode (Read Only)</p>
                      <PhoneInput value="03001234567" onChange={() => {}} showInput={false} name="Father" />
                      <PhoneInput value="04235555555" onChange={() => {}} showInput={false} name="Landline" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DualPanel>
        </section>


        {/* ━━ SECTION 4: DATA DISPLAY ━━ */}
        <section className="pb-20">
          <SectionHeader id="data-display" title="Data Display" subtitle="Badges, stat cards, avatars, tables, and skeleton loading states" />

          <DualPanel>
            {() => (
              <div className="space-y-8">
                {/* Badges */}
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Badges</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(['present', 'absent', 'late', 'paid', 'pending', 'overdue', 'success', 'danger', 'warning', 'info', 'neutral'] as const).map((v) => (
                      <Badge key={v} variant={v}>{v}</Badge>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Badge variant="success" dot>Online</Badge>
                    <Badge variant="neutral" dot>Offline</Badge>
                    <Badge variant="warning" dot>Away</Badge>
                  </div>
                </div>

                {/* Stat Cards */}
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Stat Cards</p>
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard title="Total Students" value="1,024" trend={{ direction: 'up', value: '+12%' }} icon={<Users className="w-5 h-5" />} />
                    <StatCard title="Fee Collected" value="PKR 2.4M" trend={{ direction: 'up', value: '+8%' }} icon={<Wallet className="w-5 h-5" />} />
                    <StatCard title="Staff Present" value="43/45" trend={{ direction: 'neutral', value: 'Same' }} icon={<UserCog className="w-5 h-5" />} />
                    <StatCard title="Avg Attendance" value="87.3%" trend={{ direction: 'down', value: '-2%' }} icon={<CalendarCheck className="w-5 h-5" />} />
                  </div>
                </div>

                {/* Avatars */}
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Avatars</p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar name="Ahmed Khan" size="xs" />
                      <Avatar name="Fatima Ali" size="sm" />
                      <Avatar name="Usman Shah" size="md" />
                      <Avatar name="Ayesha Noor" size="lg" />
                      <Avatar name="Bilal Raza" size="xl" />
                    </div>
                    <div className="flex items-center gap-4">
                      <Avatar name="Ali" size="md" status="online" />
                      <Avatar name="Sara" size="md" status="away" />
                      <Avatar name="Omar" size="md" status="offline" />
                    </div>
                    <AvatarGroup
                      avatars={[
                        { name: 'Ahmed Khan' },
                        { name: 'Fatima Ali' },
                        { name: 'Usman Shah' },
                        { name: 'Ayesha Noor' },
                        { name: 'Bilal Raza' },
                        { name: 'Hassan Malik' },
                        { name: 'Zara Sheikh' },
                      ]}
                      max={4}
                    />
                    <Avatar name="Upload Photo" size="lg" uploadable />
                  </div>
                </div>

                {/* Table */}
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Table</p>
                  <Table
                    columns={TABLE_COLUMNS}
                    data={STUDENT_DATA as any}
                    selectedRows={[1]}
                  />
                  <Pagination currentPage={currentPage} totalPages={5} totalItems={25} itemsPerPage={5} onPageChange={setCurrentPage} className="mt-2" />
                </div>

                {/* Skeleton */}
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Skeleton</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton variant="card" />
                    <Skeleton variant="stat" />
                  </div>
                </div>
              </div>
            )}
          </DualPanel>
        </section>


        {/* ━━ SECTION 4.5: UTILITY INDICATORS ━━ */}
        <section className="pb-20">
          <SectionHeader id="utility-indicators" title="Utility Indicators" subtitle="Status dots, presence indicators, and context tooltips" />

          <DualPanel>
            {() => (
              <div className="space-y-8">
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Status Dots</p>
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-6 items-center">
                      <StatusDot status="online" label="Online" />
                      <StatusDot status="offline" label="Offline" />
                      <StatusDot status="away" label="Away" />
                      <StatusDot status="break" label="Break" />
                      <StatusDot status="default" label="Unknown" />
                    </div>
                    <div className="flex flex-wrap gap-6 items-center pt-2">
                      <StatusDot status="active" pulse label="Active (Pulse)" />
                      <StatusDot status="late" pulse label="Late (Pulse)" />
                    </div>
                    <div className="flex flex-wrap gap-6 items-center pt-2">
                      <StatusDot status="online" size="xs" />
                      <StatusDot status="online" size="sm" />
                      <StatusDot status="online" size="md" />
                      <StatusDot status="online" size="lg" />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Tooltips</p>
                  <div className="flex flex-wrap gap-8 items-center mt-6">
                    <Tooltip content="Tooltip centered above" position="top">
                      <Button variant="outline" size="sm">Top</Button>
                    </Tooltip>
                    <Tooltip content="Tooltip centered below" position="bottom">
                      <Button variant="outline" size="sm">Bottom</Button>
                    </Tooltip>
                    <Tooltip content="Tooltip on the left side" position="left">
                      <Button variant="outline" size="sm">Left</Button>
                    </Tooltip>
                    <Tooltip content="Tooltip on the right side" position="right">
                      <Button variant="outline" size="sm">Right</Button>
                    </Tooltip>
                    <Tooltip content="This is a very long tooltip that should automatically wrap to multiple lines because it exceeds the maximum width specified in the design constraints." position="top">
                      <Button variant="secondary" size="sm">Long Text Wrapper</Button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            )}
          </DualPanel>
        </section>


        {/* ━━ SECTION 5: NAVIGATION ━━ */}
        <section className="pb-20">
          <SectionHeader id="navigation" title="Navigation" subtitle="Sidebar, top bar, and tab components" />

          <DualPanel>
            {() => (
              <div className="space-y-8">
                {/* Sidebar Preview */}
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Sidebar</p>
                  <div className="flex gap-4">
                    {/* Expanded sidebar mock */}
                    <div className="w-56 rounded-[var(--radius-md)] overflow-hidden shadow-[var(--shadow-md)]" style={{ background: '#0F4444' }}>
                      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-white/10">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#D4A843' }}>
                          <GraduationCap className="w-4 h-4" style={{ color: '#0F4444' }} />
                        </div>
                        <span className="font-display text-sm font-bold text-white">College Portal</span>
                      </div>
                      <nav className="py-3 px-2 space-y-0.5">
                        {[
                          { icon: LayoutDashboard, label: 'Dashboard', active: true },
                          { icon: Users, label: 'Students' },
                          { icon: UserCog, label: 'Staff' },
                          { icon: CalendarCheck, label: 'Attendance' },
                          { icon: Clock, label: 'Timetable' },
                          { icon: Wallet, label: 'Fees' },
                          { icon: BookOpen, label: 'Exams' },
                          { icon: ClipboardList, label: 'Results' },
                          { icon: BarChart3, label: 'Reports' },
                          { icon: Settings, label: 'Settings' },
                        ].map(({ icon: Icon, label, active }) => (
                          <div
                            key={label}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm"
                            style={{
                              background: active ? 'rgba(212, 168, 67, 0.15)' : 'transparent',
                              color: active ? '#D4A843' : 'rgba(255,255,255,0.7)',
                              borderLeft: active ? '3px solid #D4A843' : '3px solid transparent',
                              fontWeight: active ? 600 : 400,
                            }}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{label}</span>
                          </div>
                        ))}
                      </nav>
                      <div className="border-t border-white/10 p-3 mt-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: '#D4A843', color: '#0F4444' }}>
                            PA
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">Principal</p>
                            <p className="text-[10px] text-white/50">Super Admin</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Collapsed sidebar mock */}
                    <div className="w-14 rounded-[var(--radius-md)] overflow-hidden shadow-[var(--shadow-md)]" style={{ background: '#0F4444' }}>
                      <div className="flex items-center justify-center h-14 border-b border-white/10">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#D4A843' }}>
                          <GraduationCap className="w-4 h-4" style={{ color: '#0F4444' }} />
                        </div>
                      </div>
                      <nav className="py-3 px-1.5 space-y-0.5">
                        {[LayoutDashboard, Users, UserCog, CalendarCheck, Clock, Wallet, BookOpen, ClipboardList, BarChart3, Settings].map((Icon, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-center p-2.5 rounded-lg"
                            style={{
                              background: i === 0 ? 'rgba(212, 168, 67, 0.15)' : 'transparent',
                              color: i === 0 ? '#D4A843' : 'rgba(255,255,255,0.7)',
                            }}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                        ))}
                      </nav>
                    </div>
                  </div>
                </div>

                {/* TopBar Preview */}
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Top Bar</p>
                  <div className="border border-[var(--border)] rounded-[var(--radius-md)] overflow-hidden bg-[var(--surface)]">
                    <div className="h-14 flex items-center justify-between px-6 border-b border-[var(--border)]">
                      <span className="font-display text-lg font-bold text-[var(--primary)]">College Portal</span>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--surface-hover)] transition-colors">
                            <Bell className="w-4 h-4 text-[var(--text-muted)]" />
                          </button>
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--danger)] text-white text-[10px] font-bold flex items-center justify-center">3</span>
                        </div>
                        <div className="w-px h-6 bg-[var(--border)] mx-1" />
                        <div className="flex items-center gap-2">
                          <Avatar name="Principal Admin" size="sm" />
                          <span className="font-body text-sm font-medium text-[var(--text)]">Principal</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Tabs</p>
                  <div className="bg-[var(--surface)] rounded-[var(--radius-md)] border border-[var(--border)] overflow-hidden">
                    <div className="px-4">
                      <Tabs
                        tabs={[
                          { id: 'profile', label: 'Profile' },
                          { id: 'attendance', label: 'Attendance', count: 0, countVariant: 'neutral' },
                          { id: 'fees', label: 'Fees', count: 3, countVariant: 'alert' },
                          { id: 'results', label: 'Results' },
                        ]}
                        activeTab={activeTab}
                        onChange={setActiveTab}
                      />
                    </div>
                    <TabPanel tabId="profile" activeTab={activeTab} className="px-4 pb-4">
                      <p className="font-body text-sm text-[var(--text-muted)]">Student profile content area</p>
                    </TabPanel>
                    <TabPanel tabId="attendance" activeTab={activeTab} className="px-4 pb-4">
                      <p className="font-body text-sm text-[var(--text-muted)]">Attendance records here</p>
                    </TabPanel>
                    <TabPanel tabId="fees" activeTab={activeTab} className="px-4 pb-4">
                      <p className="font-body text-sm text-[var(--text-muted)]">Fee details here</p>
                    </TabPanel>
                    <TabPanel tabId="results" activeTab={activeTab} className="px-4 pb-4">
                      <p className="font-body text-sm text-[var(--text-muted)]">Academic results here</p>
                    </TabPanel>
                  </div>
                </div>
              </div>
            )}
          </DualPanel>
        </section>


        {/* ━━ SECTION 6: OVERLAYS ━━ */}
        <section className="pb-20">
          <SectionHeader id="overlays" title="Overlays" subtitle="Modals and confirmation dialogs" />

          <DualPanel>
            {() => (
              <div className="space-y-8">
                {/* Modal SM - Delete Confirm */}
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Modal (sm) — Confirm Deletion</p>
                  <div className="bg-[var(--surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-[var(--border)] max-w-sm">
                    <div className="border-b border-[var(--border)] px-6 py-4">
                      <h3 className="font-display text-lg font-semibold text-[var(--text)]">Confirm Deletion</h3>
                    </div>
                    <div className="p-6">
                      <p className="font-body text-sm text-[var(--text-muted)] leading-relaxed">
                        Are you sure you want to delete this student record? This action cannot be undone.
                      </p>
                    </div>
                    <div className="border-t border-[var(--border)] px-6 py-4 flex justify-end gap-3">
                      <Button variant="secondary" size="sm">Cancel</Button>
                      <Button variant="danger" size="sm">Delete</Button>
                    </div>
                  </div>
                </div>

                {/* Modal MD - Add Student */}
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Modal (md) — Add Student</p>
                  <div className="bg-[var(--surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-[var(--border)] max-w-md">
                    <div className="border-b border-[var(--border)] px-6 py-4">
                      <h3 className="font-display text-lg font-semibold text-[var(--text)]">Add Student</h3>
                      <p className="font-body text-sm text-[var(--text-muted)] mt-0.5">Enter student details below</p>
                    </div>
                    <div className="p-6 space-y-4">
                      <Input label="Full Name" placeholder="Enter student name" />
                      <Input label="Email" placeholder="student@college.edu" />
                    </div>
                    <div className="border-t border-[var(--border)] px-6 py-4 flex justify-end gap-3">
                      <Button variant="secondary" size="sm">Cancel</Button>
                      <Button variant="primary" size="sm">Save Student</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DualPanel>
        </section>


        {/* ━━ SECTION 6.5: OVERLAYS & POPOVERS ━━ */}
        <section className="pb-20">
          <SectionHeader id="overlays-popovers" title="Overlays & Popovers" subtitle="Slide-in drawers and floating interactive menus" />

          <DualPanel>
            {() => (
              <div className="space-y-8">
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Drawer (Mockup Preview)</p>
                  <div className="relative h-[400px] w-full max-w-[600px] overflow-hidden border border-[var(--border)] rounded-[var(--radius-lg)] shadow-sm bg-[var(--surface-hover)]"> 
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                    <div className="absolute right-0 top-0 bottom-0 w-[360px] bg-[var(--surface)] shadow-[var(--shadow-lg)] flex flex-col border-l border-[var(--border)] animate-in slide-in-from-right duration-[280ms]">
                      <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-[var(--border)] px-5">
                        <div>
                          <h2 className="font-body text-[16px] font-semibold text-[var(--text)] leading-tight">Student Profile</h2>
                          <p className="font-body text-[12px] text-[var(--text-secondary)] mt-0.5">Ahmed Khan — BSE-2024</p>
                        </div>
                        <div className="h-8 w-8 rounded-[var(--radius-sm)] bg-[var(--surface-hover)] flex items-center justify-center">
                          <Trash2 className="h-4 w-4 text-[var(--text-muted)]" />
                        </div>
                      </div>
                      <div className="flex-1 p-5 space-y-4 opacity-50">
                        <Skeleton variant="text" />
                        <Skeleton variant="text" />
                        <Skeleton variant="card" />
                      </div>
                      <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-[var(--border)] bg-[var(--surface)] p-4 px-5">
                        <Button variant="secondary" size="sm">Close</Button>
                        <Button variant="primary" size="sm">Edit</Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Popover Previews</p>
                  <div className="flex flex-wrap gap-8 items-start">
                    
                    {/* Action Menu Mock */}
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] w-[180px]">
                      <PopoverContent>
                        <PopoverItem label="View profile" icon={<Eye className="w-4 h-4" />} />
                        <PopoverItem label="Edit student" icon={<Pencil className="w-4 h-4" />} />
                        <PopoverDivider />
                        <PopoverItem label="Delete record" icon={<Trash2 className="w-4 h-4" />} variant="danger" />
                      </PopoverContent>
                    </div>

                    {/* Teacher Finder Mock */}
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] w-[200px]">
                      <PopoverContent>
                        <PopoverHeader>Available Teachers</PopoverHeader>
                        <PopoverItem label="Prof. Ali Raza" />
                        <PopoverItem label="Dr. Ayesha" />
                        <PopoverItem label="Mr. Usman" />
                      </PopoverContent>
                    </div>

                    {/* Notifications Mock */}
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] w-[240px]">
                      <PopoverContent>
                        <PopoverHeader>Recent Notifications</PopoverHeader>
                        <div className="px-3 py-2 border-b border-[var(--border)]">
                          <p className="font-body text-[13px] text-[var(--text)]">Fee deadline approaching</p>
                          <p className="font-body text-[11px] text-[var(--text-muted)] mt-0.5">2 hours ago</p>
                        </div>
                        <div className="px-3 py-2">
                          <p className="font-body text-[13px] text-[var(--text)]">New announcement posted</p>
                          <p className="font-body text-[11px] text-[var(--text-muted)] mt-0.5">5 hours ago</p>
                        </div>
                      </PopoverContent>
                    </div>

                  </div>
                </div>
              </div>
            )}
          </DualPanel>
        </section>


        {/* ━━ SECTION 7: FEEDBACK ━━ */}
        <section className="pb-20">
          <SectionHeader id="feedback" title="Feedback" subtitle="Toasts, empty states, error states, and offline banner" />

          <DualPanel>
            {() => (
              <div className="space-y-8">
                {/* Toast mocks */}
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Toast Notifications</p>
                  <div className="space-y-2.5">
                    {[
                      { type: 'success', message: 'Fee payment recorded successfully', border: '#10B981', icon: '✓' },
                      { type: 'warning', message: '3 teachers are absent today', border: '#F59E0B', icon: '⚠' },
                      { type: 'error', message: 'Failed to sync attendance records', border: '#EF4444', icon: '✕' },
                      { type: 'info', message: 'Timetable updated for next semester', border: '#3B82F6', icon: 'ℹ' },
                    ].map(({ type, message, border }) => (
                      <div
                        key={type}
                        className="bg-[var(--surface)] rounded-[var(--radius-md)] shadow-[var(--shadow-md)] border border-[var(--border)] overflow-hidden max-w-sm"
                        style={{ borderLeftWidth: '3px', borderLeftColor: border }}
                      >
                        <div className="px-4 py-3">
                          <p className="font-body text-sm text-[var(--text)]">{message}</p>
                        </div>
                        <div className="h-[2px] bg-[var(--border)]/30">
                          <div className="h-full w-3/4" style={{ background: border }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Empty State */}
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Empty State</p>
                  <div className="bg-[var(--surface)] rounded-[var(--radius-md)] border border-[var(--border)]">
                    <EmptyState
                      title="No students found"
                      description="Try adjusting your search filters or add a new student"
                      action={{ label: 'Add Student', onClick: () => {} }}
                    />
                  </div>
                </div>

                {/* Error State */}
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Error State</p>
                  <div className="bg-[var(--surface)] rounded-[var(--radius-md)] border border-[var(--border)]">
                    <ErrorState
                      title="Something went wrong"
                      description="Failed to load student data. Check your connection."
                      action={{ label: 'Try Again', onClick: () => {} }}
                    />
                  </div>
                </div>

                {/* Offline Banner */}
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Offline Banner</p>
                  <div className="rounded-[var(--radius-md)] overflow-hidden border border-[var(--border)]">
                    <OfflineBanner />
                  </div>
                </div>
              </div>
            )}
          </DualPanel>
        </section>


        {/* ━━ SECTION 8: CARD VARIANTS ━━ */}
        <section className="pb-20">
          <SectionHeader id="cards" title="Card Variants" subtitle="Default, glass, hoverable, and edge-to-edge card styles" />

          <DualPanel>
            {() => (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Default card */}
                  <Card title="Student Summary" subtitle="Overview of student data" padding="md">
                    <div className="space-y-2">
                      <div className="flex justify-between font-body text-sm">
                        <span className="text-[var(--text-muted)]">Name</span>
                        <span className="text-[var(--text)] font-medium">Ahmed Khan</span>
                      </div>
                      <div className="flex justify-between font-body text-sm">
                        <span className="text-[var(--text-muted)]">Roll No</span>
                        <span className="text-[var(--text)] font-medium">BSE-2024-001</span>
                      </div>
                      <div className="flex justify-between font-body text-sm">
                        <span className="text-[var(--text-muted)]">Section</span>
                        <span className="text-[var(--text)] font-medium">A</span>
                      </div>
                    </div>
                  </Card>

                  {/* Glass variant */}
                  <div className="rounded-[var(--radius-lg)] p-4" style={{ background: 'linear-gradient(135deg, #0F4444, #1A5555)' }}>
                    <Card glass padding="md">
                      <p className="font-body text-sm text-white/80">Glass variant shown on a teal gradient background for the frosted effect.</p>
                    </Card>
                  </div>

                  {/* Hoverable */}
                  <Card hoverable padding="md">
                    <p className="font-body text-sm text-[var(--text-muted)]">Hover over this card to see the lift effect and shadow upgrade.</p>
                  </Card>

                  {/* Bordered */}
                  <Card bordered padding="md">
                    <p className="font-body text-sm text-[var(--text-muted)]">Bordered variant with gold left accent. Great for highlighting important content.</p>
                  </Card>
                </div>
              </div>
            )}
          </DualPanel>
        </section>


        {/* ━━ SECTION 9: REALISTIC COMPOSITION ━━ */}
        <section className="pb-20">
          <SectionHeader id="composition" title="Realistic Composition" subtitle="A mini-dashboard showing how components compose together" />

          <DualPanel>
            {() => (
              <div className="space-y-6">
                {/* Mini TopBar */}
                <div className="bg-[var(--surface)] rounded-[var(--radius-md)] border border-[var(--border)] h-12 flex items-center justify-between px-4">
                  <span className="font-display text-sm font-bold text-[var(--primary)]">Dashboard</span>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[var(--surface-hover)]">
                      <Bell className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    </div>
                    <Avatar name="Admin User" size="xs" />
                  </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <StatCard title="Students" value="1,024" trend={{ direction: 'up', value: '+12%' }} icon={<Users className="w-4 h-4" />} />
                  <StatCard title="Attendance" value="87%" trend={{ direction: 'down', value: '-2%' }} icon={<CalendarCheck className="w-4 h-4" />} />
                </div>

                {/* Mini Table */}
                <Table
                  columns={TABLE_COLUMNS.slice(0, 4)}
                  data={STUDENT_DATA.slice(0, 3) as any}
                />
              </div>
            )}
          </DualPanel>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center" style={{ borderColor: '#C8DEDE' }}>
        <p className="font-body text-xs" style={{ color: '#4A6868' }}>
          College Management System — Design System v1.0
        </p>
      </footer>
    </div>
  )
}
