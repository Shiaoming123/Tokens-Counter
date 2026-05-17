import { describe, expect, it } from 'vitest'
import { calculateCost, formatCost } from '../src/core/cost/costCalculator'

describe('calculateCost', () => {
  it('calculates basic input and output cost', () => {
    const result = calculateCost({
      inputTokens: 1_000_000,
      estimatedOutputTokens: 500_000,
      inputPer1M: 2,
      outputPer1M: 10,
    })
    expect(result.inputCost).toBe(2)
    expect(result.outputCost).toBe(5)
    expect(result.totalCost).toBe(7)
  })

  it('applies cost multiplier', () => {
    const result = calculateCost({
      inputTokens: 1_000_000,
      estimatedOutputTokens: 0,
      inputPer1M: 2,
      outputPer1M: 10,
      costMultiplier: 2,
    })
    expect(result.totalCost).toBe(4)
  })

  it('handles zero tokens', () => {
    const result = calculateCost({
      inputTokens: 0,
      estimatedOutputTokens: 0,
      inputPer1M: 5,
      outputPer1M: 15,
    })
    expect(result.totalCost).toBe(0)
    expect(result.inputCost).toBe(0)
    expect(result.outputCost).toBe(0)
  })

  it('handles negative cached tokens gracefully', () => {
    const result = calculateCost({
      inputTokens: 1000,
      estimatedOutputTokens: 0,
      inputPer1M: 1,
      outputPer1M: 0,
      cachedInputTokens: -500,
    })
    expect(result.cacheReadTokens).toBe(0)
    expect(result.billableInputTokens).toBe(1000)
  })

  it('caps cached tokens at input tokens', () => {
    const result = calculateCost({
      inputTokens: 1000,
      estimatedOutputTokens: 0,
      inputPer1M: 1,
      outputPer1M: 0,
      cachedInputTokens: 5000,
    })
    expect(result.cacheReadTokens).toBe(1000)
    expect(result.billableInputTokens).toBe(0)
  })

  it('uses default cache pricing when not specified', () => {
    const result = calculateCost({
      inputTokens: 1_000_000,
      estimatedOutputTokens: 0,
      inputPer1M: 10,
      outputPer1M: 0,
      cachedInputTokens: 500_000,
      cacheCreationTokens: 200_000,
    })
    // cache read: 500k / 1M * 10 (falls back to inputPer1M) = 5
    expect(result.cacheReadCost).toBe(5)
    // cache creation: 200k / 1M * 10 (falls back to inputPer1M) = 2
    expect(result.cacheCreationCost).toBe(2)
  })
})

describe('formatCost', () => {
  it('formats zero USD', () => {
    expect(formatCost(0, 'USD')).toBe('$0.000000')
  })

  it('formats zero CNY', () => {
    expect(formatCost(0, 'CNY')).toBe('¥0.000000')
  })

  it('formats small values with 6 decimal places', () => {
    const result = formatCost(0.001, 'USD')
    expect(result).toContain('0.001000')
  })

  it('formats larger values with 4 decimal places', () => {
    const result = formatCost(1.5, 'USD')
    expect(result).toContain('1.5000')
  })

  it('formats CREDITS without currency symbol', () => {
    expect(formatCost(42, 'CREDITS')).toBe('42.0000 credits')
  })

  it('formats small CREDITS with 6 decimals', () => {
    expect(formatCost(0.001, 'CREDITS')).toBe('0.001000 credits')
  })
})
