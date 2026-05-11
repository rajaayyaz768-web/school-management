'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Palette, LayoutGrid, Type, Shapes, Layers, Bold, Maximize2, Zap, Check, GraduationCap, Users } from 'lucide-react'
import { COLOR_SCHEMES } from '@/lib/colorSchemes'
import { CARD_STYLES, CARD_STYLE_PROPS } from '@/lib/cardStyles'
import { FONT_SCALES, FONT_SCALE_SIZES } from '@/lib/fontScales'
import { SHAPE_PRESETS } from '@/lib/shapePresets'
import { SHADOW_PRESETS } from '@/lib/shadowPresets'
import { FONT_FAMILIES } from '@/lib/fontFamilies'
import { DENSITY_PRESETS } from '@/lib/densityPresets'
import { MOTION_PRESETS } from '@/lib/motionPresets'
import { useThemeStore } from '@/store/themeStore'
import PageHeader from '@/components/layout/PageHeader'

// ─── Shared primitives ───────────────────────────────────────────────────────

function Section({ icon: Icon, title, subtitle, delay = 0, children }: {
  icon: React.ElementType; title: string; subtitle: string; delay?: number; children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-[var(--radius-lg)] border border-[var(--border)] p-6"
      style={{ background: 'var(--surface)' }}
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)]/10">
          <Icon className="h-4 w-4 text-[var(--primary)]" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>{title}</h2>
          <p className="text-[var(--font-size-xs)] text-[var(--text-muted)]">{subtitle}</p>
        </div>
      </div>
      {children}
    </motion.div>
  )
}

function PickerBtn({ isActive, onClick, children, className = '' }: {
  isActive: boolean; onClick: () => void; children: React.ReactNode; className?: string
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
      className={`relative flex flex-col gap-2 rounded-[10px] border-2 p-3 text-left cursor-pointer transition-all ${className}`}
      style={{
        borderColor: isActive ? 'var(--primary)' : 'var(--border)',
        background:  isActive ? 'var(--bg-tint)'  : 'var(--bg)',
        boxShadow:   isActive ? 'var(--shadow-glow)' : 'none',
      }}
    >
      {isActive && (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center z-10"
          style={{ background: 'var(--primary)' }}>
          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
        </motion.span>
      )}
      {children}
    </motion.button>
  )
}

function Label({ isActive, children }: { isActive: boolean; children: React.ReactNode }) {
  return (
    <p className="font-semibold leading-tight text-[var(--font-size-xs)]"
      style={{ color: isActive ? 'var(--primary)' : 'var(--text)' }}>
      {children}
    </p>
  )
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="leading-tight text-[var(--text-muted)]" style={{ fontSize: '10px' }}>{children}</p>
}

// ─── Live preview helpers ────────────────────────────────────────────────────

function CardLivePreview({ cardStyle }: { cardStyle: string }) {
  const sp = CARD_STYLE_PROPS[cardStyle] ?? CARD_STYLE_PROPS.elevated
  return (
    <div className="mt-5 pt-5 border-t border-[var(--border)]">
      <p className="text-[var(--font-size-xs)] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">Live Preview</p>
      <AnimatePresence mode="wait">
        <motion.div key={cardStyle}
          initial={{ opacity: 0, scale: 0.94, y: 8 }}
          animate={{ opacity: 1, scale: 1,    y: 0 }}
          exit={{    opacity: 0, scale: 0.96,  y: -4 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[260px] p-4 flex flex-col gap-2" style={sp}
        >
          <div className="flex items-center justify-between">
            <p className="text-[var(--font-size-xs)] font-bold uppercase tracking-widest text-[var(--text-muted)]">Total Students</p>
            <div className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center bg-[var(--primary)]/10">
              <GraduationCap className="w-4 h-4 text-[var(--primary)]" />
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--primary)] leading-none">1,240</p>
          <p className="text-[var(--font-size-xs)] text-[var(--text-muted)]">Across all campuses</p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function FontPreview({ fontScale }: { fontScale: string }) {
  const sz = FONT_SCALE_SIZES[fontScale] ?? FONT_SCALE_SIZES.comfortable
  return (
    <div className="mt-5 pt-5 border-t border-[var(--border)]">
      <p className="text-[var(--font-size-xs)] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">Live Preview</p>
      <AnimatePresence mode="wait">
        <motion.div key={fontScale}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22 }}
          className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] px-4 py-3.5 space-y-2.5"
        >
          {[
            { size: sz.xs,   label: sz.xs,   text: 'ATTENDANCE TODAY — 94.2%',        weight: 'font-bold uppercase tracking-widest text-[var(--text-muted)]' },
            { size: sz.sm,   label: sz.sm,   text: 'Fees collected PKR 2.4M this month', weight: 'font-semibold text-[var(--text)]' },
            { size: sz.base, label: sz.base, text: 'Section 9-A · Morning · 42 students', weight: 'font-medium text-[var(--text-secondary)]' },
            { size: sz.lg,   label: sz.lg,   text: 'Principal Dashboard',             weight: 'font-bold text-[var(--text)]' },
          ].map(({ size, label, text, weight }) => (
            <div key={size} className="flex items-baseline gap-3">
              <span className="font-mono text-[var(--primary)] shrink-0 w-10" style={{ fontSize: '10px' }}>{label}</span>
              <p className={weight} style={{ fontSize: size }}>{text}</p>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function ShapePreview({ shape }: { shape: string }) {
  const preset = SHAPE_PRESETS.find(p => p.id === shape) ?? SHAPE_PRESETS[1]
  return (
    <div className="mt-5 pt-5 border-t border-[var(--border)] flex flex-wrap gap-3">
      {[
        { label: 'Button',  r: preset.md,  cls: 'h-9 px-4 bg-[var(--primary)] text-white text-sm font-semibold' },
        { label: 'Input',   r: preset.md,  cls: 'h-9 px-3 border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text-muted)] w-28' },
        { label: 'Card',    r: preset.card,cls: 'h-16 w-28 border border-[var(--border)] bg-[var(--surface)]' },
        { label: 'Badge',   r: preset.sm,  cls: 'h-6 px-2.5 bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-semibold' },
      ].map(({ label, r, cls }) => (
        <AnimatePresence key={label} mode="wait">
          <motion.div key={shape + label}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center justify-center ${cls}`}
            style={{ borderRadius: r }}>
            <span className="text-[var(--font-size-xs)] font-medium">{label}</span>
          </motion.div>
        </AnimatePresence>
      ))}
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function AppearancePage() {
  const {
    schemeId, cardStyle, fontScale, shape, shadowDepth, fontFamily, density, motionSpeed,
    setScheme, setCardStyle, setFontScale, setShape, setShadowDepth, setFontFamily, setDensity, setMotionSpeed,
  } = useThemeStore()

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-14 flex items-center md:hidden">
        <h1 className="font-bold text-lg text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>Design Controls</h1>
      </header>

      <div className="hidden sm:block">
        <PageHeader title="Design Controls"
          subtitle="All 8 visual dimensions — changes apply instantly to every page in the portal"
          breadcrumb={[{ label: 'Settings', href: '/principal/settings/account' }, { label: 'Design Controls' }]} />
      </div>

      <div className="max-w-4xl space-y-5 p-4 sm:px-6 sm:pb-8 sm:pt-2">

        {/* 1 — Colour Scheme */}
        <Section icon={Palette} title="Colour Scheme" subtitle="28 schemes across 8 color families — changes apply instantly" delay={0}>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {COLOR_SCHEMES.map((scheme, i) => {
              const [bg, surface, primary] = scheme.swatches
              return (
                <PickerBtn key={scheme.id} isActive={schemeId === scheme.id} onClick={() => setScheme(scheme.id)}>
                  <div className="w-full h-8 rounded-[6px] overflow-hidden flex" style={{ border: '1px solid rgba(0,0,0,0.07)' }}>
                    <div className="flex-1" style={{ background: bg }} />
                    <div className="flex-1" style={{ background: surface }} />
                    <div className="flex-[1.5]" style={{ background: primary }} />
                  </div>
                  <Label isActive={schemeId === scheme.id}>{scheme.name}</Label>
                  <Hint>{scheme.description}</Hint>
                </PickerBtn>
              )
            })}
          </div>
        </Section>

        {/* 2 — Card Style */}
        <Section icon={LayoutGrid} title="Card Style" subtitle="Controls how every card looks site-wide" delay={0.04}>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
            {CARD_STYLES.map((style) => {
              const preview = CARD_STYLE_PROPS[style.id]
              return (
                <PickerBtn key={style.id} isActive={cardStyle === style.id} onClick={() => setCardStyle(style.id)}>
                  <div className="w-full h-12 p-2.5" style={preview}>
                    <div className="h-2 rounded-sm mb-1.5 bg-[var(--text-muted)]/20" style={{ width: '60%' }} />
                    <div className="h-2.5 rounded-sm bg-[var(--primary)]/30" style={{ width: '45%' }} />
                  </div>
                  <Label isActive={cardStyle === style.id}>{style.name}</Label>
                  <Hint>{style.description}</Hint>
                </PickerBtn>
              )
            })}
          </div>
          <CardLivePreview cardStyle={cardStyle} />
        </Section>

        {/* 3 — Shape */}
        <Section icon={Shapes} title="Shape" subtitle="Border radius — affects buttons, inputs, cards and badges everywhere" delay={0.08}>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {SHAPE_PRESETS.map((preset) => (
              <PickerBtn key={preset.id} isActive={shape === preset.id} onClick={() => setShape(preset.id)}>
                <div className="w-full h-10 border-2 border-[var(--primary)]/40"
                  style={{ borderRadius: preset.card, background: 'var(--bg-tint)' }} />
                <Label isActive={shape === preset.id}>{preset.name}</Label>
                <Hint>{preset.description}</Hint>
              </PickerBtn>
            ))}
          </div>
          <ShapePreview shape={shape} />
        </Section>

        {/* 4 — Shadow Depth */}
        <Section icon={Layers} title="Shadow Depth" subtitle="Controls depth and elevation across all surfaces" delay={0.12}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SHADOW_PRESETS.map((preset) => (
              <PickerBtn key={preset.id} isActive={shadowDepth === preset.id} onClick={() => setShadowDepth(preset.id)}>
                <div className="w-full h-12 rounded-[var(--radius-md)] bg-[var(--surface)]"
                  style={{ boxShadow: preset.md }} />
                <Label isActive={shadowDepth === preset.id}>{preset.name}</Label>
                <Hint>{preset.description}</Hint>
              </PickerBtn>
            ))}
          </div>
        </Section>

        {/* 5 — Font Family */}
        <Section icon={Bold} title="Font Family" subtitle="Changes display and body fonts site-wide via CSS inheritance" delay={0.16}>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {FONT_FAMILIES.map((ff) => (
              <PickerBtn key={ff.id} isActive={fontFamily === ff.id} onClick={() => setFontFamily(ff.id)}>
                <div className="space-y-0.5">
                  <p className="text-lg font-bold text-[var(--text)] leading-tight"
                    style={{ fontFamily: ff.displayStack }}>
                    {ff.displayFont}
                  </p>
                  <p className="text-[var(--font-size-xs)] text-[var(--text-muted)]"
                    style={{ fontFamily: ff.bodyStack }}>
                    {ff.bodyFont} — body text
                  </p>
                </div>
                <Label isActive={fontFamily === ff.id}>{ff.name}</Label>
                <Hint>{ff.description}</Hint>
              </PickerBtn>
            ))}
          </div>
        </Section>

        {/* 6 — Text Size */}
        <Section icon={Type} title="Text Size" subtitle="Scales all text globally — root font-size + CSS variables" delay={0.20}>
          <div className="flex flex-wrap gap-2 mb-5">
            {FONT_SCALES.map((scale) => {
              const sz = FONT_SCALE_SIZES[scale.id]
              const isActive = fontScale === scale.id
              return (
                <motion.button key={scale.id} onClick={() => setFontScale(scale.id)}
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border-2 cursor-pointer transition-all"
                  style={{ borderColor: isActive ? 'var(--primary)' : 'var(--border)', background: isActive ? 'var(--primary)' : 'var(--bg)', boxShadow: isActive ? 'var(--shadow-glow)' : 'none' }}
                >
                  <span className="font-black" style={{ fontSize: sz.lg, color: isActive ? '#fff' : 'var(--text)' }}>Aa</span>
                  <div className="flex flex-col items-start">
                    <span className="font-bold leading-none" style={{ fontSize: sz.sm, color: isActive ? 'rgba(255,255,255,0.95)' : 'var(--text)' }}>{scale.name}</span>
                    <span className="leading-none mt-0.5" style={{ fontSize: '10px', color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>min {scale.minSize}</span>
                  </div>
                </motion.button>
              )
            })}
          </div>
          <FontPreview fontScale={fontScale} />
        </Section>

        {/* 7 — Spacing Density */}
        <Section icon={Maximize2} title="Spacing Density" subtitle="Scales padding and gaps in cards, panels and lists globally" delay={0.24}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DENSITY_PRESETS.map((preset) => (
              <PickerBtn key={preset.id} isActive={density === preset.id} onClick={() => setDensity(preset.id)}>
                <div className="w-full flex flex-col gap-1">
                  {[1, 2, 3].map((row) => (
                    <div key={row} className="rounded-sm bg-[var(--primary)]/20 h-2"
                      style={{ width: `${70 + row * 8}%` }} />
                  ))}
                </div>
                <Label isActive={density === preset.id}>{preset.name}</Label>
                <Hint>{preset.description}</Hint>
              </PickerBtn>
            ))}
          </div>
        </Section>

        {/* 8 — Motion Speed */}
        <Section icon={Zap} title="Motion Speed" subtitle="Controls all transitions and animations globally" delay={0.28}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {MOTION_PRESETS.map((preset) => {
              const isActive = motionSpeed === preset.id
              return (
                <PickerBtn key={preset.id} isActive={isActive} onClick={() => setMotionSpeed(preset.id)}>
                  <div className="flex items-center gap-1.5 h-8">
                    {[1, 2, 3].map((i) => (
                      <motion.div key={i}
                        animate={{ scaleY: isActive ? [1, 1.8, 1] : 1 }}
                        transition={{ duration: parseFloat(preset.base) / 1000 || 0.22, repeat: isActive ? Infinity : 0, delay: i * 0.1 }}
                        className="flex-1 rounded-sm bg-[var(--primary)]/40"
                        style={{ height: `${40 + i * 20}%` }}
                      />
                    ))}
                  </div>
                  <Label isActive={isActive}>{preset.name}</Label>
                  <Hint>{preset.description}</Hint>
                </PickerBtn>
              )
            })}
          </div>
        </Section>

        {/* How-to hint */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.32 }}
          className="rounded-[10px] border border-dashed border-[var(--border)] px-4 py-3.5 flex items-start gap-3"
          style={{ background: 'var(--bg)' }}>
          <span className="text-lg mt-px">💡</span>
          <p className="text-[var(--text-muted)] leading-relaxed" style={{ fontSize: '11px' }}>
            To add a new <strong className="text-[var(--text)]">colour scheme</strong>: append an entry to{' '}
            <code className="font-mono bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded text-[10px]">src/lib/colorSchemes.ts</code>,
            add a matching <code className="font-mono bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded text-[10px]">[data-scheme]</code> block in{' '}
            <code className="font-mono bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded text-[10px]">globals.css</code>, and register it in the{' '}
            <code className="font-mono bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded text-[10px]">layout.tsx</code> schemeVars map.
            All other controls (shape, shadow, font, density, motion) auto-apply globally via CSS custom properties.
          </p>
        </motion.div>

      </div>
    </div>
  )
}
