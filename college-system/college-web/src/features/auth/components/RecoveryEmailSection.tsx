'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Mail, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import {
  useRecoveryEmail,
  useSendRecoveryOtp,
  useVerifyRecoveryEmail,
} from '@/features/auth/hooks/useAuth';

const inputCls = [
  'w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)]',
  'px-3.5 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-disabled)]',
  'outline-none transition-all duration-150',
  'focus:border-[var(--border-focus)] focus:shadow-[var(--shadow-glow)]',
].join(' ');

const labelCls =
  'block text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-muted)] mb-1.5';

export function RecoveryEmailSection() {
  const { data, isLoading } = useRecoveryEmail();
  const sendOtp = useSendRecoveryOtp();
  const verify = useVerifyRecoveryEmail();

  const [step, setStep] = useState<'idle' | 'otp'>('idle');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const current = data?.recoveryEmail;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    sendOtp.mutate(email, { onSuccess: () => setStep('otp') });
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    verify.mutate(
      { recoveryEmail: email, otp },
      {
        onSuccess: () => {
          setStep('idle');
          setEmail('');
          setOtp('');
        },
      }
    );
  };

  return (
    <div
      className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-emerald-500/10">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2
            className="text-sm font-semibold text-[var(--text)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Recovery Email
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Used to reset your password if you ever get locked out
          </p>
        </div>
      </div>

      {/* Current status */}
      {isLoading ? (
        <div className="mb-4 flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading…
        </div>
      ) : current ? (
        <div className="mb-4 flex items-center gap-2 rounded-[var(--radius-sm)] border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-900/40 dark:bg-emerald-900/15">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
            {maskEmail(current)}
          </span>
          <button
            type="button"
            onClick={() => { setStep('idle'); setEmail(''); setOtp(''); }}
            className="ml-auto flex cursor-pointer items-center gap-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Change
          </button>
        </div>
      ) : (
        <div className="mb-4 flex items-center gap-2 rounded-[var(--radius-sm)] border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900/40 dark:bg-amber-900/15">
          <Mail className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="text-xs text-amber-700 dark:text-amber-300">
            No recovery email set — you won't be able to reset your password if locked out.
          </span>
        </div>
      )}

      {/* Step: enter email */}
      <AnimatePresence mode="wait">
        {step === 'idle' && (
          <motion.form
            key="email-step"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSendOtp}
            className="flex flex-col gap-3"
          >
            <div>
              <label className={labelCls}>
                {current ? 'New recovery email' : 'Recovery email address'}
              </label>
              <input
                type="email"
                className={inputCls}
                placeholder="e.g. personal@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={sendOtp.isPending}
              />
            </div>
            <div className="flex justify-end">
              <motion.button
                type="submit"
                disabled={sendOtp.isPending || !email}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: 'var(--primary)', fontFamily: 'var(--font-body)' }}
              >
                {sendOtp.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Send verification code
              </motion.button>
            </div>
          </motion.form>
        )}

        {/* Step: enter OTP */}
        {step === 'otp' && (
          <motion.form
            key="otp-step"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleVerify}
            className="flex flex-col gap-3"
          >
            <p className="text-xs text-[var(--text-muted)]">
              A 6-digit code was sent to <span className="font-medium text-[var(--text)]">{email}</span>. Enter it below.
            </p>
            <div>
              <label className={labelCls}>Verification code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                className={inputCls + ' tracking-[0.3em] text-center text-base font-mono'}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                disabled={verify.isPending}
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setStep('idle'); setOtp(''); }}
                className="cursor-pointer text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                ← Back
              </button>
              <motion.button
                type="submit"
                disabled={verify.isPending || otp.length !== 6}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: 'var(--primary)', fontFamily: 'var(--font-body)' }}
              >
                {verify.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Verify &amp; save
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!user || !domain) return email;
  const visible = user.slice(0, 2);
  const masked = '*'.repeat(Math.max(0, user.length - 2));
  return `${visible}${masked}@${domain}`;
}
