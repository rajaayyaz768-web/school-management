'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { useLogin } from '@/features/auth/hooks/useAuth'
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
export default function Login1() {
  const { mutate: login, isPending, error } = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  /* cursor spotlight state */
  const [spot, setSpot] = useState({ x: 0, y: 0 })
  const [spotVisible, setSpotVisible] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!email || !password) { setFormError('Please fill in all fields'); return }
    login({ email: email.trim(), password })
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
                label="Email address"
                placeholder="name@college.edu"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
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
              <span
                className="cursor-pointer text-[12px] text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Forgot your password?
              </span>
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
    </div>
  )
}
