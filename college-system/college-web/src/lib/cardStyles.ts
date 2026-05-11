import type { CSSProperties } from 'react'

export type CardStyle = {
  id: string
  name: string
  description: string
}

/**
 * Computed React CSSProperties for each card style.
 * Components read cardStyle from Zustand and apply these directly so
 * React sees a *new object* on every style change and forces a DOM update.
 * CSS variable references (var(--surface) etc.) still work here — the browser
 * resolves them at paint time. The critical thing is that the object
 * reference differs between styles so React's reconciler updates the DOM.
 */
export const CARD_STYLE_PROPS: Record<string, CSSProperties> = {
  elevated: {
    background:   'var(--surface)',
    border:       'none',
    boxShadow:    '0 6px 28px rgba(30,58,95,0.12), 0 2px 6px rgba(30,58,95,0.07)',
    borderRadius: '16px',
    borderTop:    'none',
  },
  outlined: {
    background:   'var(--surface)',
    border:       '1.5px solid var(--primary)',
    boxShadow:    'none',
    borderRadius: '14px',
    borderTop:    'none',
  },
  gradient: {
    background:   'linear-gradient(145deg, var(--bg-tint) 0%, var(--surface) 70%)',
    border:       '1px solid var(--border)',
    boxShadow:    '0 1px 3px rgba(30,58,95,0.06)',
    borderRadius: '14px',
    borderTop:    'none',
  },
  flat: {
    background:   'var(--surface)',
    border:       '1px solid var(--border)',
    boxShadow:    'none',
    borderRadius: '10px',
    borderTop:    'none',
  },
  filled: {
    background:   'var(--bg-tint)',
    border:       'none',
    boxShadow:    'none',
    borderRadius: '14px',
    borderTop:    '3px solid var(--primary)',
  },
}

/**
 * Single source of truth for card style presets.
 * Each entry maps to a [data-card-style="id"] CSS block in globals.css.
 * Adding a new entry here + a matching CSS block makes it appear in
 * Settings → Appearance automatically.
 */
export const CARD_STYLES: CardStyle[] = [
  {
    id: 'elevated',
    name: 'Elevated',
    description: 'Floating shadow, no border — premium depth',
  },
  {
    id: 'outlined',
    name: 'Outlined',
    description: 'Accent-coloured border, clean and crisp',
  },
  {
    id: 'gradient',
    name: 'Gradient Tint',
    description: 'Subtle primary-colour gradient wash',
  },
  {
    id: 'flat',
    name: 'Flat',
    description: 'Minimal border, no shadow — maximum density',
  },
  {
    id: 'filled',
    name: 'Filled',
    description: 'Solid tinted background with top accent bar',
  },
]

export const DEFAULT_CARD_STYLE_ID = 'elevated'
