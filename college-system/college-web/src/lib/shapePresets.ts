export type ShapePreset = {
  id: string
  name: string
  description: string
  sm: string; md: string; lg: string; xl: string; xl2: string; pill: string
  card: string; cardSm: string; cardLg: string
}

export const SHAPE_PRESETS: ShapePreset[] = [
  { id: 'sharp',   name: 'Sharp',   description: 'Crisp square corners',           sm: '3px',   md: '6px',   lg: '8px',   xl: '12px',  xl2: '16px', pill: '999px', card: '8px',   cardSm: '6px',  cardLg: '12px'  },
  { id: 'default', name: 'Default', description: 'Balanced rounded corners',        sm: '6px',   md: '10px',  lg: '14px',  xl: '20px',  xl2: '28px', pill: '999px', card: '14px',  cardSm: '10px', cardLg: '20px'  },
  { id: 'soft',    name: 'Soft',    description: 'Softer, friendlier corners',      sm: '10px',  md: '14px',  lg: '20px',  xl: '28px',  xl2: '36px', pill: '999px', card: '20px',  cardSm: '14px', cardLg: '28px'  },
  { id: 'round',   name: 'Round',   description: 'Fully rounded modern look',       sm: '14px',  md: '20px',  lg: '28px',  xl: '36px',  xl2: '48px', pill: '999px', card: '28px',  cardSm: '20px', cardLg: '36px'  },
  { id: 'pill',    name: 'Pill',    description: 'Pill-shaped buttons and inputs',  sm: '999px', md: '999px', lg: '999px', xl: '999px', xl2: '999px',pill: '999px', card: '24px',  cardSm: '16px', cardLg: '32px'  },
]

export const DEFAULT_SHAPE_ID = 'default'
