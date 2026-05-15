export interface CostInput {
  inputTokens: number
  estimatedOutputTokens: number
  inputPer1M: number
  outputPer1M: number
  cachedInputPer1M?: number
  cacheCreationInputPer1M?: number
  cachedInputTokens?: number
  cacheCreationTokens?: number
  costMultiplier?: number
}

export function calculateCost({
  inputTokens,
  estimatedOutputTokens,
  inputPer1M,
  outputPer1M,
  cachedInputPer1M,
  cacheCreationInputPer1M,
  cachedInputTokens = 0,
  cacheCreationTokens = 0,
  costMultiplier = 1,
}: CostInput) {
  const cacheReadTokens = Math.min(Math.max(cachedInputTokens, 0), Math.max(inputTokens, 0))
  const billableInputTokens = Math.max(inputTokens - cacheReadTokens, 0)
  const inputCost = (billableInputTokens / 1_000_000) * inputPer1M
  const cacheReadCost = (cacheReadTokens / 1_000_000) * (cachedInputPer1M ?? inputPer1M)
  const cacheCreationCost =
    (Math.max(cacheCreationTokens, 0) / 1_000_000) * (cacheCreationInputPer1M ?? inputPer1M)
  const outputCost = (estimatedOutputTokens / 1_000_000) * outputPer1M
  const totalCost = (inputCost + cacheReadCost + cacheCreationCost + outputCost) * costMultiplier

  return {
    billableInputTokens,
    cacheReadTokens,
    inputCost,
    cacheReadCost,
    cacheCreationCost,
    outputCost,
    totalCost,
  }
}

export function formatCost(value: number, currency: 'USD' | 'CNY' | 'CREDITS' = 'USD') {
  if (currency === 'CREDITS') {
    return `${value.toFixed(value < 0.01 ? 6 : 4)} credits`
  }

  if (value === 0) return currency === 'CNY' ? '¥0.000000' : '$0.000000'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: value < 0.01 ? 6 : 4,
    maximumFractionDigits: value < 0.01 ? 6 : 4,
  }).format(value)
}

export const formatUsd = formatCost
