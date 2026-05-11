export type DensityPreset = {
  id: string
  name: string
  description: string
  multiplier: number
}

export const DENSITY_PRESETS: DensityPreset[] = [
  { id: 'compact',     name: 'Compact',     description: 'Dense — more data per screen', multiplier: 0.75 },
  { id: 'default',     name: 'Default',     description: 'Balanced — system standard',   multiplier: 1.0  },
  { id: 'comfortable', name: 'Comfortable', description: 'Spacious — easy to scan',       multiplier: 1.15 },
  { id: 'spacious',    name: 'Spacious',    description: 'Airy — maximum breathing room', multiplier: 1.35 },
]

export const DEFAULT_DENSITY_ID = 'default'

/** Base spacing values in px — multiplied by density scale */
const BASE_SPACING: Record<number, number> = {
  1: 4,  2: 8,  3: 12, 4: 16, 5: 20,
  6: 24, 7: 32, 8: 40, 9: 48, 10: 64,
}

export function getScaledSpacing(multiplier: number): Record<string, string> {
  const result: Record<string, string> = {}
  Object.entries(BASE_SPACING).forEach(([k, v]) => {
    result[`--space-${k}`] = `${Math.round(v * multiplier)}px`
  })
  return result
}
