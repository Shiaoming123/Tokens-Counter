import type { CountInput, CountOptions, CurrencyCode, TokenCountResult } from '../../types/domain'

export interface HistoryEntry {
  id: string
  createdAt: string
  textPreview: string
  imageCount: number
  options: CountOptions
  results: TokenCountResult[]
}

const storageKey = 'ai-token-counter-history-v1'

export function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(storageKey) ?? '[]') as HistoryEntry[]
  } catch {
    return []
  }
}

export function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(storageKey, JSON.stringify(entries.slice(0, 20)))
}

export function createHistoryEntry(input: CountInput, options: CountOptions, results: TokenCountResult[]): HistoryEntry {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    textPreview: input.text.slice(0, 80) || '(no text)',
    imageCount: input.images.length,
    options,
    results,
  }
}

export function resultsToMarkdown(
  results: TokenCountResult[],
  options?: {
    displayCurrencies?: CurrencyCode[]
    exchangeRates?: Record<CurrencyCode, number>
    formatCurrency?: (value: number, currency: CurrencyCode) => string
  },
) {
  const currencies = options?.displayCurrencies?.length ? options.displayCurrencies : (['USD'] as CurrencyCode[])
  const primary = currencies[0]

  function costDisplay(item: TokenCountResult): string {
    const usd = item.normalizedCostUSD ?? item.totalCost
    const rates = options?.exchangeRates
    const fmt = options?.formatCurrency
    if (currencies.length === 1) {
      const val = primary === 'USD' ? usd : usd * (rates?.[primary] ?? 1)
      return fmt ? fmt(val, primary) : `${val.toFixed(6)} ${primary}`
    }
    return currencies
      .map((c) => {
        const val = c === 'USD' ? usd : c === 'CREDITS' ? usd * 1000 : usd * (rates?.[c] ?? 1)
        return fmt ? fmt(val, c) : `${val.toFixed(6)} ${c}`
      })
      .join(' / ')
  }

  const costHeader = currencies.length === 1 ? `Est. Cost (${primary})` : `Est. Cost (${currencies.join(' / ')})`
  const rows = [
    `| Model | Text Tokens | Image Tokens | Total Input Tokens | Est. Output | ${costHeader} | Accuracy | Method |`,
    '| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |',
    ...results.map(
      (item) =>
        `| ${item.displayName} | ${item.textTokens} | ${item.imageTokens} | ${item.inputTokens} | ${item.estimatedOutputTokens} | ${costDisplay(item)} | ${item.accuracy} | ${item.method} |`,
    ),
  ]

  return rows.join('\n')
}

export function resultsToCsv(
  results: TokenCountResult[],
  options?: {
    displayCurrencies?: CurrencyCode[]
    exchangeRates?: Record<CurrencyCode, number>
  },
) {
  const currencies = options?.displayCurrencies?.length ? options.displayCurrencies : (['USD'] as CurrencyCode[])

  const baseHeader = [
    'model',
    'provider',
    'textTokens',
    'imageTokens',
    'inputTokens',
    'estimatedOutputTokens',
    'billableInputTokens',
    'cacheReadTokens',
    'cacheCreationTokens',
    'inputCost',
    'cacheReadCost',
    'cacheCreationCost',
    'outputCost',
    'totalCost',
    'currency',
  ]

  const currencyHeaders = currencies.map((c) => `cost_${c}`)
  const tailHeader = ['accuracy', 'method']

  const header = [...baseHeader, ...currencyHeaders, ...tailHeader]

  const rows = results.map((item) => {
    const usd = item.normalizedCostUSD ?? item.totalCost
    const rates = options?.exchangeRates
    const currencyValues = currencies.map((c) => {
      if (c === 'USD') return usd
      if (c === 'CREDITS') return usd * 1000
      return usd * (rates?.[c] ?? 1)
    })

    return [
      item.displayName,
      item.provider,
      item.textTokens,
      item.imageTokens,
      item.inputTokens,
      item.estimatedOutputTokens,
      item.billableInputTokens,
      item.cacheReadTokens,
      item.cacheCreationTokens,
      item.inputCost,
      item.cacheReadCost,
      item.cacheCreationCost,
      item.outputCost,
      item.totalCost,
      item.currency,
      ...currencyValues,
      item.accuracy,
      item.method,
    ]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(',')
  })

  return [header.join(','), ...rows].join('\n')
}
