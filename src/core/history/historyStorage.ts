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
    textPreview: input.text.slice(0, 80) || '(无文本)',
    imageCount: input.images.length,
    options,
    results,
  }
}

export function resultsToMarkdown(results: TokenCountResult[]) {
  const rows = [
    '| 模型 | 文本 Tokens | 图片 Tokens | 总输入 Tokens | 预估输出 | 预估费用 | 准确度 | 方法 |',
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
    'inputCost',
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
      item.inputCost,
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
