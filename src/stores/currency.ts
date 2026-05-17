import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { CurrencyCode } from '../types/domain'

const STORAGE_KEY_RATES = 'tc-exchange-rates'
const STORAGE_KEY_DISPLAY = 'tc-display-currencies'
const STORAGE_KEY_FETCHED = 'tc-rates-fetched'
const RATE_TTL_MS = 24 * 60 * 60 * 1000 // 24h
const CREDITS_PER_USD = 1000

const FALLBACK_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  CNY: 7.25,
  EUR: 0.92,
  JPY: 155,
  GBP: 0.79,
  KRW: 1350,
  CREDITS: CREDITS_PER_USD,
}

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  CNY: '¥',
  EUR: '€',
  JPY: '¥',
  GBP: '£',
  KRW: '₩',
  CREDITS: '',
}

export const ALL_CURRENCIES: CurrencyCode[] = ['USD', 'CNY', 'EUR', 'JPY', 'GBP', 'KRW', 'CREDITS']

export const useCurrencyStore = defineStore('currency', () => {
  const displayCurrencies = ref<CurrencyCode[]>(
    loadFromStorage<CurrencyCode[]>(STORAGE_KEY_DISPLAY, ['USD']),
  )
  const exchangeRates = ref<Record<CurrencyCode, number>>(
    loadFromStorage<Record<CurrencyCode, number>>(STORAGE_KEY_RATES, { ...FALLBACK_RATES }),
  )
  const lastFetched = ref(loadFromStorage<number>(STORAGE_KEY_FETCHED, 0))
  const fetching = ref(false)

  const primaryCurrency = computed(() => displayCurrencies.value[0] ?? 'USD')

  const ratesStale = computed(() => Date.now() - lastFetched.value > RATE_TTL_MS)

  function setDisplayCurrencies(currencies: CurrencyCode[]) {
    displayCurrencies.value = currencies.length > 0 ? currencies : ['USD']
    localStorage.setItem(STORAGE_KEY_DISPLAY, JSON.stringify(displayCurrencies.value))
  }

  function convertFromUSD(amountUSD: number, target: CurrencyCode): number {
    if (target === 'CREDITS') return amountUSD * CREDITS_PER_USD
    return amountUSD * (exchangeRates.value[target] ?? 1)
  }

  function convertToUSD(amount: number, sourceCurrency: CurrencyCode): number {
    if (sourceCurrency === 'CREDITS') return amount / CREDITS_PER_USD
    const rate = exchangeRates.value[sourceCurrency]
    if (!rate || rate === 0) return amount
    return amount / rate
  }

  function formatCurrencyValue(value: number, currency: CurrencyCode): string {
    if (currency === 'CREDITS') {
      return `${value.toFixed(value < 1 ? 4 : 2)} credits`
    }
    const symbol = CURRENCY_SYMBOLS[currency]
    const decimals = value < 0.01 ? 6 : value < 1 ? 4 : 2
    return `${symbol}${value.toFixed(decimals)}`
  }

  async function fetchRates() {
    if (fetching.value) return
    fetching.value = true
    try {
      const resp = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const data = await resp.json()
      const r = data.rates
      exchangeRates.value = {
        USD: 1,
        CNY: r.CNY ?? 7.25,
        EUR: r.EUR ?? 0.92,
        JPY: r.JPY ?? 155,
        GBP: r.GBP ?? 0.79,
        KRW: r.KRW ?? 1350,
        CREDITS: CREDITS_PER_USD,
      }
      lastFetched.value = Date.now()
      localStorage.setItem(STORAGE_KEY_RATES, JSON.stringify(exchangeRates.value))
      localStorage.setItem(STORAGE_KEY_FETCHED, String(lastFetched.value))
    } catch {
      // keep existing rates (fallback or cached)
    } finally {
      fetching.value = false
    }
  }

  // Auto-fetch on init if stale
  if (ratesStale.value) {
    fetchRates()
  }

  return {
    displayCurrencies,
    exchangeRates,
    lastFetched,
    fetching,
    primaryCurrency,
    ratesStale,
    setDisplayCurrencies,
    convertFromUSD,
    convertToUSD,
    formatCurrencyValue,
    fetchRates,
  }
})

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
  } catch {
    // ignore
  }
  return fallback
}
