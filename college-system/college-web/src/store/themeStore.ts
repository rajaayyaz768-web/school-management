import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Theme store for managing dark/light mode toggle
 * Uses class-based dark mode with persistence
 */
interface ThemeStore {
  /** Current dark mode state */
  isDark: boolean
  /** Toggle between dark and light mode */
  toggle: () => void
  /** Set dark mode explicitly */
  setDark: (dark: boolean) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDark: false,
      toggle: () => set((s) => {
        const next = !s.isDark
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', next)
        }
        return { isDark: next }
      }),
      setDark: (dark) => {
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', dark)
        }
        set({ isDark: dark })
      },
    }),
    { name: 'theme-preference' }
  )
)
