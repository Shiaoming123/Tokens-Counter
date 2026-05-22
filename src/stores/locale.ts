import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { translations } from '../i18n/locales.js'

export type Locale = 'en' | 'zh'

const storageKey = 'ai-token-counter-locale'

function loadLocale(): Locale {
  const saved = localStorage.getItem(storageKey)
  if (saved === 'en' || saved === 'zh') return saved
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<Locale>(loadLocale())

  watch(locale, (value) => {
    localStorage.setItem(storageKey, value)
  })

  function t(key: string, params?: Record<string, string | number>): string {
    const entry = translations[key]
    if (!entry) return key
    let text = entry[locale.value] ?? entry.en ?? key
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, String(v))
      }
    }
    return text
  }

  return { locale, t }
})
