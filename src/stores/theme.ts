import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'system'
export type DesignStyle = 'apple'

const themeKey = 'ai-token-counter-theme'

function loadTheme(): Theme {
  const saved = localStorage.getItem(themeKey)
  if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
  return 'system'
}

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>(loadTheme())
  const style: DesignStyle = 'apple'
  let themeTransitionTimer: number | undefined
  let hasAppliedTheme = false

  const effectiveTheme = computed<'light' | 'dark'>(() => {
    return theme.value === 'system' ? getSystemTheme() : theme.value
  })

  function applyTheme(value: 'light' | 'dark') {
    if (hasAppliedTheme && document.documentElement.dataset.theme !== value) {
      document.documentElement.classList.add('theme-transitioning')
      window.clearTimeout(themeTransitionTimer)
      themeTransitionTimer = window.setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning')
      }, 520)
    }
    document.documentElement.dataset.theme = value
    document.documentElement.style.colorScheme = value
    hasAppliedTheme = true
  }

  function applyStyle() {
    document.documentElement.dataset.style = 'apple'
  }

  watch(theme, () => {
    localStorage.setItem(themeKey, theme.value)
    applyTheme(effectiveTheme.value)
  })

  watch(effectiveTheme, (value) => {
    applyTheme(value)
  })

  // Apply on init
  applyTheme(effectiveTheme.value)
  applyStyle()

  // Listen for system theme changes
  const mql = window.matchMedia('(prefers-color-scheme: dark)')
  mql.addEventListener('change', () => {
    if (theme.value === 'system') {
      applyTheme(getSystemTheme())
    }
  })

  return { theme, style, effectiveTheme }
})
