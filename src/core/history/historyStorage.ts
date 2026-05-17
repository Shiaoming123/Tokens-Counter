import type { CountInput, CountOptions, TokenCountResult } from '../../types/domain'

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

export function resultsToMarkdown(results: TokenCountResult[]) {
  const rows = [
    '| Model | Text Tokens | Image Tokens | Total Input Tokens | Est. Output | Est. Cost | Accuracy | Method |',
    '| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |',
    ...results.map(
      (item) =>
        `| ${item.displayName} | ${item.textTokens} | ${item.imageTokens} | ${item.inputTokens} | ${item.estimatedOutputTokens} | ${item.totalCost.toFixed(6)} ${item.currency} | ${item.accuracy} | ${item.method} |`,
    ),
  ]

  return rows.join('\n')
}

export function resultsToCsv(results: TokenCountResult[]) {
  const header = [
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
    'accuracy',
    'method',
  ]

  const rows = results.map((item) =>
    [
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
      item.accuracy,
      item.method,
    ]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(','),
  )

  return [header.join(','), ...rows].join('\n')
}
