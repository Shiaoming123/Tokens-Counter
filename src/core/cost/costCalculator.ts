import type { CurrencyCode } from '../../types/domain'

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

export function formatCost(value: number, currency: string = 'USD') {
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

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  CNY: '¥',
  EUR: '€',
  JPY: '¥',
  GBP: '£',
  KRW: '₩',
  CREDITS: '',
}

const CREDITS_PER_USD = 1000

export function convertFromUSD(amountUSD: number, target: CurrencyCode, rates: Record<string, number>): number {
  if (target === 'CREDITS') return amountUSD * CREDITS_PER_USD
  return amountUSD * (rates[target] ?? 1)
}

export function convertToUSD(amount: number, source: CurrencyCode, rates: Record<string, number>): number {
  if (source === 'CREDITS') return amount / CREDITS_PER_USD
  const rate = rates[source]
  if (!rate || rate === 0) return amount
  return amount / rate
}

export function formatCurrencyValue(value: number, currency: CurrencyCode): string {
  if (currency === 'CREDITS') {
    return `${value.toFixed(value < 1 ? 4 : 2)} credits`
  }
  const symbol = CURRENCY_SYMBOLS[currency] ?? ''
  const decimals = value < 0.01 ? 6 : value < 1 ? 4 : 2
  return `${symbol}${value.toFixed(decimals)}`
}
