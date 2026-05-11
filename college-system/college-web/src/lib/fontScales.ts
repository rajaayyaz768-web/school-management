export type FontScale = {
  id: string
  name: string
  description: string
  /** smallest font size in this scale (for preview) */
  minSize: string
}

/** Actual pixel size values per scale — used in inline styles so React re-renders on change */
export const FONT_SCALE_SIZES: Record<string, { xs: string; sm: string; base: string; md: string; lg: string }> = {
  compact:     { xs: '11px', sm: '12px', base: '13px', md: '14px', lg: '16px' },
  default:     { xs: '12px', sm: '13px', base: '14px', md: '15px', lg: '17px' },
  comfortable: { xs: '13px', sm: '14px', base: '15px', md: '16px', lg: '18px' },
  large:       { xs: '14px', sm: '15px', base: '16px', md: '17px', lg: '19px' },
  xl:          { xs: '15px', sm: '16px', base: '17px', md: '18px', lg: '21px' },
}

/**
 * Single source of truth for font scale presets.
 * Each entry maps to a [data-font-scale="id"] CSS block in globals.css.
 */
export const FONT_SCALES: FontScale[] = [
  {
    id: 'compact',
    name: 'Compact',
    description: 'Dense — max data per screen',
    minSize: '11px',
  },
  {
    id: 'default',
    name: 'Default',
    description: 'Balanced size — system standard',
    minSize: '12px',
  },
  {
    id: 'comfortable',
    name: 'Comfortable',
    description: 'Slightly larger — recommended',
    minSize: '13px',
  },
  {
    id: 'large',
    name: 'Large',
    description: 'Easy to read — great for presentations',
    minSize: '14px',
  },
  {
    id: 'xl',
    name: 'Extra Large',
    description: 'Accessibility-friendly maximum size',
    minSize: '15px',
  },
]

export const DEFAULT_FONT_SCALE_ID = 'comfortable'
