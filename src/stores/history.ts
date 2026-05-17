import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  loadHistory,
  saveHistory,
  resultsToCsv,
  resultsToMarkdown,
  type HistoryEntry,
} from '../core/history/historyStorage'
import type { TokenCountResult } from '../types/domain'
import { useCurrencyStore } from './currency'

const MAX_ENTRIES = 20

export const useHistoryStore = defineStore('history', () => {
  const entries = ref<HistoryEntry[]>([])

  function load() {
    entries.value = loadHistory()
  }

  function prependEntry(entry: HistoryEntry) {
    entries.value = [entry, ...entries.value].slice(0, MAX_ENTRIES)
    saveHistory(entries.value)
  }

  function clearAll() {
    entries.value = []
    saveHistory([])
  }

  function copyMarkdown(results: TokenCountResult[]) {
    if (!results.length) return Promise.resolve('')
    const currencyStore = useCurrencyStore()
    return resultsToMarkdown(results, {
      displayCurrencies: currencyStore.displayCurrencies,
      exchangeRates: currencyStore.exchangeRates,
      formatCurrency: currencyStore.formatCurrencyValue,
    })
  }

  function exportCsv(results: TokenCountResult[]) {
    if (!results.length) return
    const currencyStore = useCurrencyStore()
    const csv = resultsToCsv(results, {
      displayCurrencies: currencyStore.displayCurrencies,
      exchangeRates: currencyStore.exchangeRates,
    })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `token-count-${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return {
    entries,
    load,
    prependEntry,
    clearAll,
    copyMarkdown,
    exportCsv,
  }
})
