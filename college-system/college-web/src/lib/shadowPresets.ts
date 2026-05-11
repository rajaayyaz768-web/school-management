export type ShadowPreset = {
  id: string
  name: string
  description: string
  sm: string; md: string; lg: string; xl: string
}

export const SHADOW_PRESETS: ShadowPreset[] = [
  {
    id: 'none', name: 'None', description: 'Flat — no shadows anywhere',
    sm: 'none', md: 'none', lg: 'none', xl: 'none',
  },
  {
    id: 'subtle', name: 'Subtle', description: 'Very light depth hints',
    sm: '0 1px 2px rgba(19,38,67,0.04)',
    md: '0 2px 6px rgba(19,38,67,0.06)',
    lg: '0 4px 12px rgba(19,38,67,0.08)',
    xl: '0 8px 20px rgba(19,38,67,0.10)',
  },
  {
    id: 'default', name: 'Default', description: 'Balanced depth — system standard',
    sm: '0 1px 2px rgba(19,38,67,0.05), 0 1px 3px rgba(19,38,67,0.06)',
    md: '0 4px 8px -2px rgba(19,38,67,0.06), 0 2px 4px -2px rgba(19,38,67,0.05)',
    lg: '0 12px 24px -8px rgba(19,38,67,0.10), 0 4px 8px -4px rgba(19,38,67,0.06)',
    xl: '0 24px 48px -16px rgba(19,38,67,0.16), 0 8px 16px -8px rgba(19,38,67,0.08)',
  },
  {
    id: 'elevated', name: 'Elevated', description: 'Strong dramatic depth',
    sm: '0 2px 8px rgba(19,38,67,0.10), 0 1px 3px rgba(19,38,67,0.08)',
    md: '0 6px 20px rgba(19,38,67,0.14), 0 2px 6px rgba(19,38,67,0.08)',
    lg: '0 16px 40px rgba(19,38,67,0.18), 0 6px 12px rgba(19,38,67,0.10)',
    xl: '0 28px 60px rgba(19,38,67,0.22), 0 10px 20px rgba(19,38,67,0.12)',
  },
]

export const DEFAULT_SHADOW_ID = 'default'
