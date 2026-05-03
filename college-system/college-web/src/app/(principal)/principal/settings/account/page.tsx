'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useCurrentUser } from '@/store/authStore';
import { useUpdateProfile, useChangePassword } from '@/features/auth/hooks/useAuth';
import PageHeader from '@/components/layout/PageHeader';
import { RecoveryEmailSection } from '@/features/auth/components/RecoveryEmailSection';

const card = "rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6";
const label = "block text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-muted)] mb-1.5";
const input = [
  "w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)]",
  "px-3.5 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-disabled)]",
  "outline-none transition-all duration-150",
  "focus:border-[var(--border-focus)] focus:shadow-[var(--shadow-glow)]",
].join(" ");

export default function AccountSettingsPage() {
  const user = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  /* ── name form ── */
  const [firstName, setFirstName] = useState(() => {
    const parts = (user?.fullName ?? '').trim().split(' ');
    return parts[0] ?? '';
  });
  const [lastName, setLastName] = useState(() => {
    const parts = (user?.fullName ?? '').trim().split(' ');
    return parts.slice(1).join(' ');
  });

  /* ── password form ── */
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;
    updateProfile.mutate({ firstName: firstName.trim(), lastName: lastName.trim() });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    if (newPwd !== confirmPwd) {
      setPwdError('New passwords do not match');
      return;
    }
    if (newPwd.length < 8) {
      setPwdError('New password must be at least 8 characters');
      return;
    }
    changePassword.mutate(
      { currentPassword: currentPwd, newPassword: newPwd },
      {
        onSuccess: () => {
          setCurrentPwd('');
          setNewPwd('');
          setConfirmPwd('');
        },
      }
    );
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Account Settings"
        breadcrumb={[
          { label: 'Settings', href: '/principal/settings/backups' },
          { label: 'Account' },
        ]}
      />

      <div className="flex flex-col gap-6 mt-2">

        {/* ── Update Name ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={card}
        >
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)]/10">
              <User className="h-4 w-4 text-[var(--primary)]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>
                Display Name
              </h2>
              <p className="text-xs text-[var(--text-muted)]">Update how your name appears across the system</p>
            </div>
          </div>

          <form onSubmit={handleNameSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>First name</label>
                <input
                  className={input}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  disabled={updateProfile.isPending}
                />
              </div>
              <div>
                <label className={label}>Last name</label>
                <input
                  className={input}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  disabled={updateProfile.isPending}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-[var(--text-muted)]">
                Current: <span className="font-medium text-[var(--text)]">{user?.fullName || '—'}</span>
              </p>
              <motion.button
                type="submit"
                disabled={updateProfile.isPending || !firstName.trim() || !lastName.trim()}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: 'var(--primary)', fontFamily: 'var(--font-body)' }}
              >
                {updateProfile.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save name
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* ── Change Password ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className={card}
        >
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--gold)]/10">
              <Lock className="h-4 w-4 text-[var(--gold-dark)]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>
                Change Password
              </h2>
              <p className="text-xs text-[var(--text-muted)]">Use a strong password of at least 8 characters</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            {/* current password */}
            <div>
              <label className={label}>Current password</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  className={input + ' pr-10'}
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  placeholder="Enter current password"
                  disabled={changePassword.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[var(--text-disabled)] hover:text-[var(--text-muted)] transition-colors focus:outline-none"
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* new password */}
            <div>
              <label className={label}>New password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  className={input + ' pr-10'}
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="Minimum 8 characters"
                  disabled={changePassword.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[var(--text-disabled)] hover:text-[var(--text-muted)] transition-colors focus:outline-none"
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* confirm password */}
            <div>
              <label className={label}>Confirm new password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className={input + ' pr-10'}
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="Repeat new password"
                  disabled={changePassword.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[var(--text-disabled)] hover:text-[var(--text-muted)] transition-colors focus:outline-none"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* inline error */}
            {pwdError && (
              <p className="text-xs text-red-500">{pwdError}</p>
            )}

            <div className="flex justify-end pt-1">
              <motion.button
                type="submit"
                disabled={changePassword.isPending || !currentPwd || !newPwd || !confirmPwd}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: 'var(--surface-alt)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {changePassword.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Update password
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* ── Recovery Email ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.16 }}
        >
          <RecoveryEmailSection />
        </motion.div>

      </div>
    </div>
  );
}
