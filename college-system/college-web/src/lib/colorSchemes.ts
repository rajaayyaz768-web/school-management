export type ColorScheme = {
  id: string
  name: string
  description: string
  isDark: boolean
  /** [background, surface, primary] — used for the swatch preview */
  swatches: [string, string, string]
  /** CSS custom property values applied via style.setProperty — same mechanism as card styles */
  vars: Record<string, string>
}

/** Build the vars map for a light scheme given a primary color */
function light(primary: string, primaryDark: string, primaryLight: string, r: number, g: number, b: number, gold = '#E0A11B'): Record<string, string> {
  return {
    '--primary':       primary,
    '--primary-dark':  primaryDark,
    '--primary-light': primaryLight,
    '--primary-hover': primaryDark,
    '--info':          primary,
    '--border-focus':  primary,
    '--shadow-focus':  `0 0 0 4px rgba(${r},${g},${b},0.22)`,
    '--shadow-glow':   `0 0 0 4px rgba(${r},${g},${b},0.22)`,
    '--surface-alt':   `rgba(${r},${g},${b},0.06)`,
    '--surface-hover': `rgba(${r},${g},${b},0.05)`,
    '--bg-tint':       `rgba(${r},${g},${b},0.06)`,
    '--gold':          gold,
    '--gold-light':    gold,
    '--gold-dark':     primaryDark,
    '--gold-muted':    primaryDark,
  }
}

export const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: 'default', name: 'Scholaris Blue', description: 'Clean professional blue — the classic default',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#3D86C9'],
    vars: light('#3D86C9', '#2A6FB6', '#6BA3D8', 61, 134, 201),
  },
  {
    id: 'teal', name: 'Ocean Teal', description: 'Fresh teal accent on a light canvas',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#0D9488'],
    vars: light('#0D9488', '#0F766E', '#2DD4BF', 13, 148, 136),
  },
  {
    id: 'sapphire', name: 'Sapphire Elegance', description: 'Deep sapphire — timeless academic authority',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#1E5BA8'],
    vars: light('#1E5BA8', '#0D3A66', '#6BA3D8', 30, 91, 168),
  },
  {
    id: 'emerald', name: 'Emerald Coast', description: 'Vibrant emerald — clean and modern',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#059669'],
    vars: light('#059669', '#015841', '#6EE7B7', 5, 150, 105, '#D4A574'),
  },
  {
    id: 'slate-plum', name: 'Slate Plum', description: 'Deep purple-plum — sophisticated authority',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#6B21A8'],
    vars: light('#6B21A8', '#3F0F5C', '#C084FC', 107, 33, 168, '#C2B280'),
  },
  {
    id: 'crimson', name: 'Crimson Authority', description: 'Deep wine red — prestigious and distinguished',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#C2185B'],
    vars: light('#C2185B', '#800E47', '#F48FB1', 194, 24, 91),
  },
  {
    id: 'teal-horizon', name: 'Teal Horizon', description: 'Bright cyan-teal — fresh and energetic',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#0891B2'],
    vars: light('#0891B2', '#0E7490', '#67E8F9', 8, 145, 178),
  },
  {
    id: 'amber-heritage', name: 'Amber Heritage', description: 'Warm amber-brown — organic established feel',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#B45309'],
    vars: light('#B45309', '#78350F', '#FCD34D', 180, 83, 9, '#D4A574'),
  },
  {
    id: 'indigo', name: 'Indigo Precision', description: 'Deep indigo — intellectual and structured',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#4F46E5'],
    vars: light('#4F46E5', '#3730A3', '#A5B4FC', 79, 70, 229, '#F59E0B'),
  },
  {
    id: 'jade', name: 'Jade Serenity', description: 'Deep teal-jade — calm and balanced',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#0F766E'],
    vars: light('#0F766E', '#134E4A', '#5EEAD4', 15, 118, 110, '#C2B280'),
  },
  {
    id: 'coral', name: 'Coral Excellence', description: 'Warm coral-orange — vibrant and approachable',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#EA580C'],
    vars: light('#EA580C', '#B74909', '#FDBA74', 234, 88, 12),
  },
  {
    id: 'cobalt', name: 'Cobalt Trust', description: 'Deep cobalt — confident and intelligent',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#1E40AF'],
    vars: light('#1E40AF', '#0F2555', '#93C5FD', 30, 64, 175, '#D4A574'),
  },
  {
    id: 'violet-prestige', name: 'Violet Prestige', description: 'Vibrant violet — premium and forward-thinking',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#7C3AED'],
    vars: light('#7C3AED', '#5B21B6', '#C4B5FD', 124, 58, 237, '#F59E0B'),
  },
  {
    id: 'rose-garden', name: 'Rose Garden', description: 'Deep rose — elegant and welcoming',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#BE185D'],
    vars: light('#BE185D', '#831843', '#F9A8D4', 190, 24, 93),
  },
  {
    id: 'forest-authority', name: 'Forest Authority', description: 'Deep forest green — grounded and growth-focused',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#15803D'],
    vars: light('#15803D', '#065F46', '#86EFAC', 21, 128, 61, '#D4A574'),
  },
  {
    id: 'cobalt-sky', name: 'Cobalt Sky', description: 'Bright sky blue — open and clear',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#0284C7'],
    vars: light('#0284C7', '#0369A1', '#7DD3FC', 2, 132, 199),
  },
  {
    id: 'deep-slate', name: 'Deep Slate', description: 'Cool slate gray — neutral and trustworthy',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#334155'],
    vars: light('#334155', '#1E293B', '#94A3B8', 51, 65, 85, '#C2B280'),
  },

  // ── Vibrant 8-family schemes ─────────────────────────────────────────────
  {
    id: 'midnight-indigo', name: 'Midnight Indigo', description: 'Electric indigo — bold, modern, and energetic',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#6366f1'],
    vars: light('#6366f1', '#4f46e5', '#818cf8', 99, 102, 241, '#fbbf24'),
  },
  {
    id: 'royal-violet', name: 'Royal Violet', description: 'Rich violet-purple — creative and premium',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#8b5cf6'],
    vars: light('#8b5cf6', '#7c3aed', '#a78bfa', 139, 92, 246, '#fbbf24'),
  },
  {
    id: 'hot-rose', name: 'Hot Rose', description: 'Vivid rose-red — bold and high-energy',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#f43f5e'],
    vars: light('#f43f5e', '#e11d48', '#fb7185', 244, 63, 94, '#fbbf24'),
  },
  {
    id: 'electric-orange', name: 'Electric Orange', description: 'Warm electric orange — dynamic and approachable',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#f97316'],
    vars: light('#f97316', '#ea580c', '#fb923c', 249, 115, 22, '#fbbf24'),
  },
  {
    id: 'cyber-cyan', name: 'Cyber Cyan', description: 'Futuristic cyan-blue — sharp and innovative',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#06b6d4'],
    vars: light('#06b6d4', '#0891b2', '#22d3ee', 6, 182, 212, '#fbbf24'),
  },
  {
    id: 'golden-sun', name: 'Golden Sun', description: 'Warm amber-gold — prestigious and established',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#f59e0b'],
    vars: light('#f59e0b', '#d97706', '#fbbf24', 245, 158, 11, '#fbbf24'),
  },
  {
    id: 'mint-fresh', name: 'Mint Fresh', description: 'Vibrant emerald green — growth and clarity',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#10b981'],
    vars: light('#10b981', '#059669', '#34d399', 16, 185, 129, '#fbbf24'),
  },
  {
    id: 'deep-teal', name: 'Deep Teal', description: 'Rich teal — calm authority with depth',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#14b8a6'],
    vars: light('#14b8a6', '#0d9488', '#2dd4bf', 20, 184, 166, '#fbbf24'),
  },
  {
    id: 'night-blue', name: 'Night Blue', description: 'Deep electric blue — confident and clear',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#2563eb'],
    vars: light('#2563eb', '#1d4ed8', '#60a5fa', 37, 99, 235, '#fbbf24'),
  },
  {
    id: 'cherry-red', name: 'Cherry Red', description: 'Bold cherry red — strong leadership presence',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#dc2626'],
    vars: light('#dc2626', '#b91c1c', '#f87171', 220, 38, 38, '#fbbf24'),
  },
  {
    id: 'hot-pink', name: 'Hot Pink', description: 'Vivid pink — expressive and distinctive',
    isDark: false, swatches: ['#F5F7FA', '#FFFFFF', '#ec4899'],
    vars: light('#ec4899', '#db2777', '#f472b6', 236, 72, 153, '#fbbf24'),
  },
]

export const DEFAULT_SCHEME_ID = 'default'
