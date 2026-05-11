export type FontFamily = {
  id: string
  name: string
  description: string
  displayFont: string
  bodyFont: string
  /** CSS font-family stack for display */
  displayStack: string
  /** CSS font-family stack for body */
  bodyStack: string
}

export const FONT_FAMILIES: FontFamily[] = [
  {
    id: 'scholaris',
    name: 'Scholaris',
    description: 'Sora + Manrope — the default',
    displayFont: 'Sora',
    bodyFont: 'Manrope',
    displayStack: '"Sora", ui-sans-serif, system-ui, sans-serif',
    bodyStack:    '"Manrope", ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: 'modern',
    name: 'Modern Clean',
    description: 'Inter — sharp and neutral',
    displayFont: 'Inter',
    bodyFont: 'Inter',
    displayStack: '"Inter", ui-sans-serif, system-ui, sans-serif',
    bodyStack:    '"Inter", ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Playfair Display + Manrope — editorial',
    displayFont: 'Playfair Display',
    bodyFont: 'Manrope',
    displayStack: '"Playfair Display", ui-serif, Georgia, serif',
    bodyStack:    '"Manrope", ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: 'friendly',
    name: 'Friendly',
    description: 'Poppins — warm and approachable',
    displayFont: 'Poppins',
    bodyFont: 'Poppins',
    displayStack: '"Poppins", ui-sans-serif, system-ui, sans-serif',
    bodyStack:    '"Poppins", ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: 'mono',
    name: 'Technical',
    description: 'JetBrains Mono + Manrope — precise',
    displayFont: 'JetBrains Mono',
    bodyFont: 'Manrope',
    displayStack: '"JetBrains Mono", ui-monospace, monospace',
    bodyStack:    '"Manrope", ui-sans-serif, system-ui, sans-serif',
  },
]

export const DEFAULT_FONT_FAMILY_ID = 'scholaris'
