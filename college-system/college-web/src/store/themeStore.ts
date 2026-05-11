import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { COLOR_SCHEMES, DEFAULT_SCHEME_ID } from '@/lib/colorSchemes'
import { DEFAULT_CARD_STYLE_ID } from '@/lib/cardStyles'
import { FONT_SCALE_SIZES, DEFAULT_FONT_SCALE_ID } from '@/lib/fontScales'
import { SHAPE_PRESETS, DEFAULT_SHAPE_ID } from '@/lib/shapePresets'
import { SHADOW_PRESETS, DEFAULT_SHADOW_ID } from '@/lib/shadowPresets'
import { FONT_FAMILIES, DEFAULT_FONT_FAMILY_ID } from '@/lib/fontFamilies'
import { DENSITY_PRESETS, getScaledSpacing, DEFAULT_DENSITY_ID } from '@/lib/densityPresets'
import { MOTION_PRESETS, DEFAULT_MOTION_ID } from '@/lib/motionPresets'

interface ThemeStore {
  // existing
  schemeId:   string
  cardStyle:  string
  isDark:     boolean
  // font
  fontScale:   string
  fontFamily:  string
  // new controls
  shape:       string
  shadowDepth: string
  density:     string
  motionSpeed: string

  setScheme:      (id: string) => void
  setCardStyle:   (id: string) => void
  setFontScale:   (id: string) => void
  setFontFamily:  (id: string) => void
  setShape:       (id: string) => void
  setShadowDepth: (id: string) => void
  setDensity:     (id: string) => void
  setMotionSpeed: (id: string) => void
  /** Legacy toggle */
  toggle: () => void
}

// ─── Apply helpers ────────────────────────────────────────────────────────────

export function applyScheme(id: string) {
  if (typeof document === 'undefined') return
  const scheme = COLOR_SCHEMES.find(s => s.id === id) ?? COLOR_SCHEMES[0]
  const el = document.documentElement
  // Apply every color var directly via style.setProperty — same reliable
  // mechanism as card styles / font scale. Bypasses CSS cascade entirely.
  Object.entries(scheme.vars).forEach(([k, v]) => el.style.setProperty(k, v))
  el.setAttribute('data-scheme', id)
  el.classList.toggle('dark', scheme.isDark)
}

function applyCardStyleAttr(id: string) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-card-style', id)
}

const FONT_SCALE_ROOT: Record<string, string> = {
  compact: '14px', default: '15px', comfortable: '16px', large: '17px', xl: '18px',
}

function applyFontScale(id: string) {
  if (typeof document === 'undefined') return
  const sizes = FONT_SCALE_SIZES[id] ?? FONT_SCALE_SIZES.comfortable
  const el = document.documentElement
  el.style.fontSize = FONT_SCALE_ROOT[id] ?? '16px'
  el.style.setProperty('--font-size-xs',   sizes.xs)
  el.style.setProperty('--font-size-sm',   sizes.sm)
  el.style.setProperty('--font-size-base', sizes.base)
  el.style.setProperty('--font-size-md',   sizes.md)
  el.style.setProperty('--font-size-lg',   sizes.lg)
  el.setAttribute('data-font-scale', id)
}

function applyFontFamily(id: string) {
  if (typeof document === 'undefined') return
  const family = FONT_FAMILIES.find(f => f.id === id) ?? FONT_FAMILIES[0]
  const el = document.documentElement
  el.style.setProperty('--font-display', family.displayStack)
  el.style.setProperty('--font-body',    family.bodyStack)
}

function applyShape(id: string) {
  if (typeof document === 'undefined') return
  const preset = SHAPE_PRESETS.find(p => p.id === id) ?? SHAPE_PRESETS[1]
  const el = document.documentElement
  el.style.setProperty('--radius-xs',      '2px')
  el.style.setProperty('--radius-sm',      preset.sm)
  el.style.setProperty('--radius-md',      preset.md)
  el.style.setProperty('--radius-lg',      preset.lg)
  el.style.setProperty('--radius-xl',      preset.xl)
  el.style.setProperty('--radius-2xl',     preset.xl2)
  el.style.setProperty('--radius-pill',    preset.pill)
  el.style.setProperty('--radius-card',    preset.card)
  el.style.setProperty('--radius-card-sm', preset.cardSm)
  el.style.setProperty('--radius-card-lg', preset.cardLg)
  el.setAttribute('data-shape', id)
}

function applyShadowDepth(id: string) {
  if (typeof document === 'undefined') return
  const preset = SHADOW_PRESETS.find(p => p.id === id) ?? SHADOW_PRESETS[2]
  const el = document.documentElement
  el.style.setProperty('--shadow-sm', preset.sm)
  el.style.setProperty('--shadow-md', preset.md)
  el.style.setProperty('--shadow-lg', preset.lg)
  el.style.setProperty('--shadow-xl', preset.xl)
  el.style.setProperty('--shadow-card',    preset.sm)
  el.style.setProperty('--shadow-card-md', preset.md)
  el.style.setProperty('--shadow-card-lg', preset.lg)
  el.setAttribute('data-shadow', id)
}

function applyDensity(id: string) {
  if (typeof document === 'undefined') return
  const preset = DENSITY_PRESETS.find(p => p.id === id) ?? DENSITY_PRESETS[1]
  const scaled = getScaledSpacing(preset.multiplier)
  const el = document.documentElement
  Object.entries(scaled).forEach(([k, v]) => el.style.setProperty(k, v))
  el.setAttribute('data-density', id)
}

function applyMotionSpeed(id: string) {
  if (typeof document === 'undefined') return
  const preset = MOTION_PRESETS.find(p => p.id === id) ?? MOTION_PRESETS[2]
  const el = document.documentElement
  el.style.setProperty('--dur-fast',  preset.fast)
  el.style.setProperty('--dur-base',  preset.base)
  el.style.setProperty('--dur-slow',  preset.slow)
  el.style.setProperty('--transition-base',   `${preset.fast} cubic-bezier(0.2,0.8,0.2,1)`)
  el.style.setProperty('--transition-slow',   `${preset.base} cubic-bezier(0.2,0.8,0.2,1)`)
  el.style.setProperty('--transition-spring', `${preset.spring} cubic-bezier(0.16,1,0.3,1)`)
  el.setAttribute('data-motion', id)
}

function applyAll(state: Partial<ThemeStore>) {
  applyScheme(state.schemeId       ?? DEFAULT_SCHEME_ID)
  applyCardStyleAttr(state.cardStyle    ?? DEFAULT_CARD_STYLE_ID)
  applyFontScale(state.fontScale   ?? DEFAULT_FONT_SCALE_ID)
  applyFontFamily(state.fontFamily ?? DEFAULT_FONT_FAMILY_ID)
  applyShape(state.shape           ?? DEFAULT_SHAPE_ID)
  applyShadowDepth(state.shadowDepth ?? DEFAULT_SHADOW_ID)
  applyDensity(state.density       ?? DEFAULT_DENSITY_ID)
  applyMotionSpeed(state.motionSpeed ?? DEFAULT_MOTION_ID)
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      schemeId:    DEFAULT_SCHEME_ID,
      cardStyle:   DEFAULT_CARD_STYLE_ID,
      fontScale:   DEFAULT_FONT_SCALE_ID,
      fontFamily:  DEFAULT_FONT_FAMILY_ID,
      shape:       DEFAULT_SHAPE_ID,
      shadowDepth: DEFAULT_SHADOW_ID,
      density:     DEFAULT_DENSITY_ID,
      motionSpeed: DEFAULT_MOTION_ID,
      isDark: false,

      setScheme:      (id) => { applyScheme(id);       set({ schemeId: id,    isDark: COLOR_SCHEMES.find(s => s.id === id)?.isDark ?? false }) },
      setCardStyle:   (id) => { applyCardStyleAttr(id); set({ cardStyle: id   }) },
      setFontScale:   (id) => { applyFontScale(id);    set({ fontScale: id    }) },
      setFontFamily:  (id) => { applyFontFamily(id);   set({ fontFamily: id   }) },
      setShape:       (id) => { applyShape(id);        set({ shape: id        }) },
      setShadowDepth: (id) => { applyShadowDepth(id);  set({ shadowDepth: id  }) },
      setDensity:     (id) => { applyDensity(id);      set({ density: id      }) },
      setMotionSpeed: (id) => { applyMotionSpeed(id);  set({ motionSpeed: id  }) },
      toggle: () => {
        const next = get().schemeId === 'dark' ? DEFAULT_SCHEME_ID : 'dark'
        applyScheme(next)
        set({ schemeId: next, isDark: COLOR_SCHEMES.find(s => s.id === next)?.isDark ?? false })
      },
    }),
    {
      name: 'theme-preference',
      onRehydrateStorage: () => (state) => { if (state) applyAll(state) },
    }
  )
)
