'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { useLogin, useSendPasswordResetOtp, useResetPassword } from '@/features/auth/hooks/useAuth'
import { FalconEagleLogo } from '@/components/landing/FalconEagleLogo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { cn } from '@/lib/utils'

/* ─── Magnetic Input ──────────────────────────────────────────────── */
interface InputProps {
  label?: string
  placeholder?: string
  icon?: React.ReactNode
  error?: boolean
  [key: string]: any
}

const MagneticInput = ({ label, placeholder, icon, error, ...rest }: InputProps) => {
  const [mx, setMx] = useState(0)
  const [hovering, setHovering] = useState(false)

  const onMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMx(e.clientX - rect.left)
  }

  return (
    <div className="w-full">
      {label && (
        <label
          className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-muted)]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {label}
        </label>
      )}
      <div className="relative w-full">
        <input
          className={cn(
            'peer relative z-10 h-11 w-full rounded-[10px] border bg-[var(--bg)] px-3.5 text-sm text-[var(--text)]',
            'outline-none transition-all duration-200',
            'placeholder:text-[var(--text-disabled)]',
            'focus:border-[var(--border-focus)] focus:shadow-[var(--shadow-glow)]',
            error
              ? 'border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.10)]'
              : 'border-[var(--border)]'
          )}
          placeholder={placeholder}
          onMouseMove={onMove}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          style={{ fontFamily: 'var(--font-body)' }}
          {...rest}
        />

        {/* magnetic top border */}
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 z-20 h-[2px] overflow-hidden rounded-t-[10px] transition-opacity duration-150"
          style={{
            opacity: hovering ? 1 : 0,
            background: `radial-gradient(50px circle at ${mx}px 0px, var(--primary) 0%, transparent 70%)`,
          }}
        />
        {/* magnetic bottom border */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-[2px] overflow-hidden rounded-b-[10px] transition-opacity duration-150"
          style={{
            opacity: hovering ? 1 : 0,
            background: `radial-gradient(50px circle at ${mx}px 2px, var(--primary) 0%, transparent 70%)`,
          }}
        />

        {icon && (
          <div className="absolute right-3 top-1/2 z-20 -translate-y-1/2 text-[var(--text-muted)]">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Grain constant ──────────────────────────────────────────────── */
const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.055'/%3E%3C/svg%3E")`

const FEATURES = [
  'Secure role-based access control',
  'Real-time attendance tracking',
  'Integrated fee management',
  'Live timetable & result portal',
]

const STATS = [
  { num: '1000+', label: 'Students' },
  { num: '45+', label: 'Staff' },
  { num: '2', label: 'Campuses' },
  { num: '5', label: 'Programs' },
]

/* ─── Main Component ──────────────────────────────────────────────── */
type ForgotStep = 'email' | 'recovery' | 'otp' | 'reset' | 'done'

export default function Login1() {
  const { mutate: login, isPending, error } = useLogin()
  const sendResetOtp = useSendPasswordResetOtp()
  const resetPassword = useResetPassword()

  const [identifier, setIdentifier] = useState('')
  const [email, setEmail] = useState('') // used only for forgot-password flow
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  /* ── forgot password state ── */
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotStep, setForgotStep] = useState<ForgotStep>('email')
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotRecoveryEmail, setForgotRecoveryEmail] = useState('')
  const [forgotOtp, setForgotOtp] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)

  const openForgot = () => { setForgotOpen(true); setForgotStep('email'); setForgotEmail(''); setForgotRecoveryEmail(''); setForgotOtp(''); setNewPwd(''); setConfirmPwd(''); setResetError(null) }
  const closeForgot = () => setForgotOpen(false)

  const handleLoginEmailNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail) return
    setForgotStep('recovery')
  }

  const handleSendResetOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotRecoveryEmail) return
    sendResetOtp.mutate(
      { email: forgotEmail, recoveryEmail: forgotRecoveryEmail },
      { onSuccess: () => setForgotStep('otp') }
    )
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (forgotOtp.length === 6) setForgotStep('reset')
  }

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    setResetError(null)
    if (newPwd !== confirmPwd) { setResetError('Passwords do not match'); return }
    if (newPwd.length < 8) { setResetError('Password must be at least 8 characters'); return }
    resetPassword.mutate(
      { email: forgotEmail, otp: forgotOtp, newPassword: newPwd },
      { onSuccess: () => setForgotStep('done') }
    )
  }

  /* cursor spotlight state */
  const [spot, setSpot] = useState({ x: 0, y: 0 })
  const [spotVisible, setSpotVisible] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!identifier || !password) { setFormError('Please fill in all fields'); return }
    login({ identifier: identifier.trim(), password })
  }

  const errMsg = (() => {
    if (formError) return formError
    if (!error) return null
    const e = error as any
    return e.response?.data?.message || e.message || 'Login failed.'
  })()

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg)] p-4">

      {/* theme toggle */}
      <div className="absolute right-5 top-5 z-50">
        <ThemeToggle />
      </div>

      {/* ── outer ambient blobs ── */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(180,83,9,0.10) 0%, transparent 65%)' }} />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(212,168,67,0.09) 0%, transparent 65%)' }} />

      {/* ══════════════════════════════════════════════
          CARD
          ══════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex w-full max-w-[880px] overflow-hidden rounded-[22px]"
        style={{
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg), 0 0 0 1px rgba(255,255,255,0.4)',
        }}
      >

        {/* ── LEFT — FORM PANEL ── */}
        <div
          className="relative flex w-full flex-col justify-center overflow-hidden px-8 py-12 lg:w-1/2 lg:px-14"
          style={{ background: 'var(--surface)' }}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            setSpot({ x: e.clientX - r.left, y: e.clientY - r.top })
          }}
          onMouseEnter={() => setSpotVisible(true)}
          onMouseLeave={() => setSpotVisible(false)}
        >
          {/* cursor spotlight */}
          <div
            className="pointer-events-none absolute z-0 h-[480px] w-[480px] rounded-full transition-opacity duration-200"
            style={{
              background: 'radial-gradient(circle, rgba(180,83,9,0.10) 0%, transparent 65%)',
              transform: `translate(${spot.x - 240}px, ${spot.y - 240}px)`,
              transition: 'transform 0.08s linear, opacity 0.2s ease',
              opacity: spotVisible ? 1 : 0,
            }}
          />

          <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-0">

            {/* heading */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="text-[26px] font-bold text-[var(--text)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Welcome back
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.24 }}
              className="mb-8 mt-1 text-sm text-[var(--text-muted)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Sign in to your account to continue
            </motion.p>

            {/* email */}
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.30 }}
              className="mb-4"
            >
              <MagneticInput
                label="Email / Roll Number / CNIC"
                placeholder="Email, roll number, or CNIC"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdentifier(e.target.value)}
                disabled={isPending}
                error={!!errMsg}
              />
            </motion.div>

            {/* password */}
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.36 }}
              className="mb-2"
            >
              <MagneticInput
                label="Password"
                placeholder="Enter your password"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                disabled={isPending}
                error={!!errMsg}
                icon={
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="cursor-pointer text-[var(--text-disabled)] transition-colors hover:text-[var(--text-muted)] focus:outline-none"
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />
            </motion.div>

            {/* error */}
            <AnimatePresence mode="wait">
              {errMsg && (
                <motion.div
                  key="err"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5 overflow-hidden"
                >
                  <AlertCircle size={12} className="shrink-0 text-red-500" />
                  <span className="text-[12px] text-red-500" style={{ fontFamily: 'var(--font-body)' }}>
                    {errMsg}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* forgot */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.40 }}
              className="mt-3 text-right"
            >
              <button
                type="button"
                onClick={openForgot}
                className="cursor-pointer text-[12px] text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors focus:outline-none"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Forgot your password?
              </button>
            </motion.div>

            {/* sign in button — shiny sweep */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.44 }}
              className="mt-6"
            >
              <motion.button
                type="submit"
                disabled={isPending}
                whileHover={!isPending ? { scale: 1.015, y: -1 } : {}}
                whileTap={!isPending ? { scale: 0.985 } : {}}
                className={cn(
                  'group/btn relative flex w-full cursor-pointer items-center justify-center gap-2',
                  'overflow-hidden rounded-[11px] py-2.5 text-sm font-medium text-white',
                  'transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-75'
                )}
                style={{
                  fontFamily: 'var(--font-body)',
                  background: 'var(--primary)',
                  boxShadow: '0 4px 18px rgba(180,83,9,0.30), inset 0 1px 0 rgba(255,255,255,0.14)',
                }}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
                {/* shiny sweep overlay */}
                <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-14deg)_translateX(-110%)] group-hover/btn:duration-700 group-hover/btn:[transform:skew(-14deg)_translateX(110%)]">
                  <div className="relative h-full w-10 bg-white/20" />
                </div>
              </motion.button>
            </motion.div>

            {/* footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.50 }}
              className="mt-5 text-center text-[12px] text-[var(--text-muted)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Need access?{' '}
              <span className="cursor-pointer font-medium text-[var(--primary)] hover:underline">
                Contact the admin office
              </span>
            </motion.p>

          </form>
        </div>

        {/* ── RIGHT — BRAND PANEL ── */}
        <div
          className="relative hidden flex-col items-start justify-between overflow-hidden p-12 lg:flex lg:w-1/2"
          style={{
            background: '#1A1A1B',
            backgroundImage: GRAIN,
            backgroundRepeat: 'repeat',
            backgroundSize: '300px 300px',
          }}
        >
          {/* ambient amber orb */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-[360px] w-[360px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(180,83,9,0.22) 0%, transparent 65%)' }} />
          {/* gold orb bottom-left */}
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-[280px] w-[280px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(212,168,67,0.16) 0%, transparent 65%)' }} />

          {/* subtle grid */}
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* top — logo + name */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.30, duration: 0.5 }}
            className="relative z-10 flex flex-col gap-4"
          >
            <FalconEagleLogo size={52} />

            <div>
              <h1
                className="text-[22px] font-bold leading-tight text-white/90"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Government<br />Intermediate College
              </h1>
              <p
                className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/35"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Management System
              </p>
            </div>

            {/* gold rule */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.48, duration: 0.45 }}
              className="h-px w-9 origin-left"
              style={{ background: 'rgba(212,168,67,0.50)' }}
            />

            {/* features */}
            <ul className="flex flex-col gap-2.5">
              {FEATURES.map((f, i) => (
                <motion.li
                  key={f}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.52 + i * 0.07 }}
                  className="flex items-center gap-2.5 text-[13px] text-white/55"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: '#D4A843', boxShadow: '0 0 6px rgba(212,168,67,0.55)' }}
                  />
                  {f}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* bottom — stats grid */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62, duration: 0.45 }}
            className="relative z-10 grid w-full grid-cols-2 gap-2.5"
          >
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.66 + i * 0.06 }}
                className="flex flex-col rounded-[11px] px-4 py-3"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <span
                  className="text-xl font-bold"
                  style={{ color: '#D4A843', fontFamily: 'var(--font-body)' }}
                >
                  {s.num}
                </span>
                <span
                  className="text-[11px]"
                  style={{ color: 'rgba(255,255,255,0.32)', fontFamily: 'var(--font-body)' }}
                >
                  {s.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </motion.div>

      {/* ══════════════════════════════════════════════
          FORGOT PASSWORD OVERLAY
          ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {forgotOpen && (
          <motion.div
            key="forgot-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) closeForgot() }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[380px] rounded-[20px] p-8"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
            >
              <AnimatePresence mode="wait">

                {/* Step 1 — enter login email */}
                {forgotStep === 'email' && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                    <h3 className="text-lg font-bold text-[var(--text)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>Reset password</h3>
                    <p className="text-xs text-[var(--text-muted)] mb-6">Enter your login email to begin. You will need your recovery email in the next step.</p>
                    <form onSubmit={handleLoginEmailNext} className="flex flex-col gap-4">
                      <MagneticInput label="Login email" type="email" placeholder="name@college.edu" value={forgotEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForgotEmail(e.target.value)} />
                      <div className="flex items-center justify-between pt-1">
                        <button type="button" onClick={closeForgot} className="cursor-pointer text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Cancel</button>
                        <motion.button type="submit" disabled={!forgotEmail} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                          className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                          style={{ background: 'var(--primary)', fontFamily: 'var(--font-body)' }}>
                          Next
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Step 2 — verify recovery email */}
                {forgotStep === 'recovery' && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                    <h3 className="text-lg font-bold text-[var(--text)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>Verify your identity</h3>
                    <p className="text-xs text-[var(--text-muted)] mb-6">Enter the recovery email registered on your account. If it matches, a reset code will be sent there.</p>
                    <form onSubmit={handleSendResetOtp} className="flex flex-col gap-4">
                      <MagneticInput label="Recovery email" type="email" placeholder="your.recovery@gmail.com" value={forgotRecoveryEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForgotRecoveryEmail(e.target.value)} disabled={sendResetOtp.isPending} />
                      <div className="flex items-center justify-between pt-1">
                        <button type="button" onClick={() => setForgotStep('email')} className="cursor-pointer text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">← Back</button>
                        <motion.button type="submit" disabled={sendResetOtp.isPending || !forgotRecoveryEmail} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                          className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                          style={{ background: 'var(--primary)', fontFamily: 'var(--font-body)' }}>
                          {sendResetOtp.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                          Send code
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Step 3 — enter OTP */}
                {forgotStep === 'otp' && (
                  <motion.div key="s3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                    <h3 className="text-lg font-bold text-[var(--text)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>Enter reset code</h3>
                    <p className="text-xs text-[var(--text-muted)] mb-6">A 6-digit code was sent to <span className="text-[var(--text)] font-medium">{forgotRecoveryEmail}</span>. It expires in 10 minutes.</p>
                    <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                      <div>
                        <label className="block text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-muted)] mb-1.5">6-digit code</label>
                        <input
                          type="text" inputMode="numeric" maxLength={6}
                          className="w-full rounded-[10px] border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2.5 text-center text-xl font-mono tracking-[0.4em] text-[var(--text)] outline-none transition-all focus:border-[var(--border-focus)] focus:shadow-[var(--shadow-glow)]"
                          placeholder="000000"
                          value={forgotOtp}
                          onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <button type="button" onClick={() => setForgotStep('recovery')} className="cursor-pointer text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">← Back</button>
                        <motion.button type="submit" disabled={forgotOtp.length !== 6} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                          className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                          style={{ background: 'var(--primary)', fontFamily: 'var(--font-body)' }}>
                          Continue
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Step 4 — new password */}
                {forgotStep === 'reset' && (
                  <motion.div key="s4" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                    <h3 className="text-lg font-bold text-[var(--text)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>New password</h3>
                    <p className="text-xs text-[var(--text-muted)] mb-6">Choose a strong password of at least 8 characters.</p>
                    <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                      <MagneticInput
                        label="New password"
                        type={showNewPwd ? 'text' : 'password'}
                        placeholder="Minimum 8 characters"
                        value={newPwd}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPwd(e.target.value)}
                        disabled={resetPassword.isPending}
                        icon={
                          <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="cursor-pointer text-[var(--text-disabled)] hover:text-[var(--text-muted)] transition-colors focus:outline-none">
                            {showNewPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        }
                      />
                      <MagneticInput label="Confirm password" type="password" placeholder="Repeat new password" value={confirmPwd} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPwd(e.target.value)} disabled={resetPassword.isPending} />
                      {resetError && <p className="text-xs text-red-500">{resetError}</p>}
                      <div className="flex items-center justify-between pt-1">
                        <button type="button" onClick={() => setForgotStep('otp')} className="cursor-pointer text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">← Back</button>
                        <motion.button type="submit" disabled={resetPassword.isPending || !newPwd || !confirmPwd} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                          className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                          style={{ background: 'var(--primary)', fontFamily: 'var(--font-body)' }}>
                          {resetPassword.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                          Reset password
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Step 5 — done */}
                {forgotStep === 'done' && (
                  <motion.div key="s5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }} className="text-center py-4">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'rgba(16,185,129,0.12)' }}>
                      <svg className="h-7 w-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>Password reset!</h3>
                    <p className="text-xs text-[var(--text-muted)] mb-6">Your password has been updated. Sign in with your new password.</p>
                    <motion.button type="button" onClick={closeForgot} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      className="w-full cursor-pointer rounded-[var(--radius-sm)] py-2.5 text-sm font-medium text-white"
                      style={{ background: 'var(--primary)', fontFamily: 'var(--font-body)' }}>
                      Back to sign in
                    </motion.button>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
