'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { User, Lock, Eye, EyeOff, Loader2, Shield, Building2, Bell } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore, useCurrentUser } from '@/store/authStore'
import { useUpdateProfile, useChangePassword } from '@/features/auth/hooks/useAuth'
import { RecoveryEmailSection } from '@/features/auth/components/RecoveryEmailSection'
import { useCampuses } from '@/features/campus/hooks/useCampus'

const inputCls = [
  'w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)]',
  'px-3.5 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-disabled)]',
  'outline-none transition-all duration-150',
  'focus:border-[var(--border-focus)] focus:shadow-[var(--shadow-glow)]',
].join(' ')

const labelCls =
  'block text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-muted)] mb-1.5'

const cardCls =
  'rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6'

function SectionHeader({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)]/10">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-semibold text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>
          {title}
        </h2>
        <p className="text-xs text-[var(--text-muted)]">{desc}</p>
      </div>
    </div>
  )
}

export default function AdminSettingsPage() {
  const { user } = useAuthStore()
  const currentUser = useCurrentUser()
  const { data: campuses } = useCampuses()
  const campusName = campuses?.find((c) => c.id === user?.campusId)?.name
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()

  const [firstName, setFirstName] = useState(() => {
    const parts = (currentUser?.fullName ?? '').trim().split(' ')
    return parts[0] ?? ''
  })
  const [lastName, setLastName] = useState(() => {
    const parts = (currentUser?.fullName ?? '').trim().split(' ')
    return parts.slice(1).join(' ')
  })

  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwdError, setPwdError] = useState<string | null>(null)

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) return
    updateProfile.mutate({ firstName: firstName.trim(), lastName: lastName.trim() })
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPwdError(null)
    if (newPwd !== confirmPwd) { setPwdError('New passwords do not match'); return }
    if (newPwd.length < 8) { setPwdError('New password must be at least 8 characters'); return }
    changePassword.mutate(
      { currentPassword: currentPwd, newPassword: newPwd },
      { onSuccess: () => { setCurrentPwd(''); setNewPwd(''); setConfirmPwd('') } }
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <PageHeader
        title="Settings"
        breadcrumb={[{ label: 'Home', href: '/admin/dashboard' }, { label: 'Settings' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── Left column: account management ── */}
        <div className="flex flex-col gap-6">

          {/* Update Name */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cardCls}
          >
            <SectionHeader
              icon={<User className="h-4 w-4 text-[var(--primary)]" />}
              title="Display Name"
              desc="Update how your name appears across the system"
            />
            <form onSubmit={handleNameSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>First name</label>
                  <input className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" disabled={updateProfile.isPending} />
                </div>
                <div>
                  <label className={labelCls}>Last name</label>
                  <input className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" disabled={updateProfile.isPending} />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-[var(--text-muted)]">
                  Current: <span className="font-medium text-[var(--text)]">{currentUser?.fullName || '—'}</span>
                </p>
                <motion.button
                  type="submit"
                  disabled={updateProfile.isPending || !firstName.trim() || !lastName.trim()}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ background: 'var(--primary)', fontFamily: 'var(--font-body)' }}
                >
                  {updateProfile.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save name
                </motion.button>
              </div>
            </form>
          </motion.div>

          {/* Change Password */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            className={cardCls}
          >
            <SectionHeader
              icon={<Lock className="h-4 w-4 text-[var(--gold-dark,#A16207)]" />}
              title="Change Password"
              desc="Use a strong password of at least 8 characters"
            />
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              {[
                { label: 'Current password', value: currentPwd, set: setCurrentPwd, show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
                { label: 'New password', value: newPwd, set: setNewPwd, show: showNew, toggle: () => setShowNew(!showNew), placeholder: 'Minimum 8 characters' },
                { label: 'Confirm new password', value: confirmPwd, set: setConfirmPwd, show: showConfirm, toggle: () => setShowConfirm(!showConfirm), placeholder: 'Repeat new password' },
              ].map(({ label, value, set, show, toggle, placeholder }) => (
                <div key={label}>
                  <label className={labelCls}>{label}</label>
                  <div className="relative">
                    <input
                      type={show ? 'text' : 'password'}
                      className={inputCls + ' pr-10'}
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      placeholder={placeholder ?? 'Enter password'}
                      disabled={changePassword.isPending}
                    />
                    <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[var(--text-disabled)] hover:text-[var(--text-muted)] transition-colors focus:outline-none">
                      {show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}
              {pwdError && <p className="text-xs text-red-500">{pwdError}</p>}
              <div className="flex justify-end pt-1">
                <motion.button
                  type="submit"
                  disabled={changePassword.isPending || !currentPwd || !newPwd || !confirmPwd}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ background: 'var(--surface-alt)', color: 'var(--text)', border: '1px solid var(--border)', fontFamily: 'var(--font-body)' }}
                >
                  {changePassword.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Update password
                </motion.button>
              </div>
            </form>
          </motion.div>

          {/* Recovery Email */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.16 }}>
            <RecoveryEmailSection />
          </motion.div>

        </div>

        {/* ── Right column: info panels ── */}
        <div className="flex flex-col gap-6">

          {/* Account Info */}
          <Card className="space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
              <div className="w-7 h-7 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                <User className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-[var(--text)]">Account Information</h3>
            </div>
            {[
              { label: 'Email', value: user?.email ?? '—' },
              { label: 'Role', value: <Badge variant="info">Admin</Badge> },
              { label: 'Campus', value: campusName ?? '—' },
              { label: 'Status', value: <Badge variant="success">Active</Badge> },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                <span className="text-sm text-[var(--text-muted)]">{label}</span>
                <span className="text-sm font-medium text-[var(--text)]">{value}</span>
              </div>
            ))}
          </Card>

          {/* Permissions */}
          <Card className="space-y-2">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
              <div className="w-7 h-7 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-[var(--text)]">Permissions</h3>
            </div>
            {[
              'Manage Students & Parents',
              'Manage Staff',
              'Configure Fee Structures',
              'Record Attendance',
              'Enter Exam Results',
              'Manage Timetable',
              'Post Announcements',
              'View Reports',
            ].map((perm) => (
              <div key={perm} className="flex items-center gap-2 py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
                <span className="text-sm text-[var(--text)]">{perm}</span>
              </div>
            ))}
          </Card>

        </div>
      </div>
    </div>
  )
}
