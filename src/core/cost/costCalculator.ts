export interface CostInput {
  inputTokens: number
  estimatedOutputTokens: number
  inputPer1M: number
  outputPer1M: number
}

export function calculateCost({
  inputTokens,
  estimatedOutputTokens,
  inputPer1M,
  outputPer1M,
}: CostInput) {
  const inputCost = (inputTokens / 1_000_000) * inputPer1M
  const outputCost = (estimatedOutputTokens / 1_000_000) * outputPer1M

  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
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
