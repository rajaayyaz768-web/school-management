export type MotionPreset = {
  id: string
  name: string
  description: string
  fast: string; base: string; slow: string; spring: string
}

export const MOTION_PRESETS: MotionPreset[] = [
  {
    id: 'instant', name: 'Instant', description: 'No transitions — immediate',
    fast: '0ms', base: '0ms', slow: '0ms', spring: '0ms',
  },
  {
    id: 'fast', name: 'Fast', description: 'Snappy — minimal delay',
    fast: '80ms', base: '140ms', slow: '240ms', spring: '200ms',
  },
  {
    id: 'default', name: 'Default', description: 'Balanced — system standard',
    fast: '140ms', base: '220ms', slow: '420ms', spring: '320ms',
  },
  {
    id: 'relaxed', name: 'Relaxed', description: 'Smooth and easygoing',
    fast: '220ms', base: '380ms', slow: '600ms', spring: '480ms',
  },
]

export const DEFAULT_MOTION_ID = 'default'
