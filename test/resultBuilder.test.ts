import { describe, expect, it } from 'vitest'
import {
  buildLocalResult,
  buildUnsupportedOfficialResult,
} from '../src/core/count/resultBuilder'
import type { CountInput, CountOptions, ModelConfig } from '../src/types/domain'

const mockModel: ModelConfig = {
  id: 'gpt-4o',
  displayName: 'GPT-4o',
  provider: 'openai',
  family: 'gpt',
  supportsText: true,
  supportsImage: true,
  textCountMethod: 'local_tokenizer',
  tokenizer: { type: 'tiktoken', encoding: 'o200k_base' },
  vision: { type: 'openai_tile', detailLevels: ['low', 'high', 'auto'] },
  pricing: { inputPer1M: 2.5, outputPer1M: 10, currency: 'USD' },
  accuracy: { text: 'local_exact', image: 'local_estimate' },
  contextWindow: 128000,
  licenseRef: 'openai-tos',
}

const mockOptions: CountOptions = {
  openaiDetail: 'high',
  estimatedOutputTokens: 1000,
  cachedInputTokens: 0,
  cacheCreationTokens: 0,
  costMultiplier: 1,
  useOfficialApi: true,
  pricingProfile: 'official',
}

const mockInput: CountInput = { text: 'hello world', images: [] }

describe('buildLocalResult', () => {
  it('builds result with correct model info', () => {
    const result = buildLocalResult(mockModel, mockInput, mockOptions, { 'gpt-4o': 2 })

    expect(result.modelId).toBe('gpt-4o')
    expect(result.displayName).toBe('GPT-4o')
    expect(result.provider).toBe('openai')
    expect(result.method).toBe('local_tokenizer')
  })

  it('uses provided text token count', () => {
    const result = buildLocalResult(mockModel, mockInput, mockOptions, { 'gpt-4o': 42 })

    expect(result.textTokens).toBe(42)
    expect(result.inputTokens).toBe(42)
  })

  it('falls back to approxTokenizer when token count missing', () => {
    const result = buildLocalResult(mockModel, mockInput, mockOptions, {})

    // "hello world" has 2 Latin words → ceil(2 * 1.25) = 3
    expect(result.textTokens).toBe(3)
    expect(result.inputTokens).toBe(3)
  })

  it('calculates cost correctly', () => {
    const result = buildLocalResult(mockModel, mockInput, mockOptions, { 'gpt-4o': 1_000_000 })

    expect(result.inputCost).toBe(2.5)
    // estimatedOutputTokens=1000, outputPer1M=10 → 1000/1M * 10 = 0.01
    expect(result.outputCost).toBeCloseTo(0.01)
    expect(result.totalCost).toBeCloseTo(2.51)
  })

  it('applies cost multiplier', () => {
    const optionsWithMultiplier: CountOptions = { ...mockOptions, costMultiplier: 2 }
    const result = buildLocalResult(mockModel, mockInput, optionsWithMultiplier, { 'gpt-4o': 1_000_000 })

    expect(result.totalCost).toBeCloseTo(2.51 * 2)
  })

  it('uses selected pricing profile overrides when available', () => {
    const model: ModelConfig = {
      ...mockModel,
      id: 'gpt-5',
      displayName: 'GPT-5',
      pricing: { inputPer1M: 99, outputPer1M: 99, currency: 'USD' },
    }
    const result = buildLocalResult(
      model,
      mockInput,
      { ...mockOptions, pricingProfile: 'ccswitch' },
      { 'gpt-5': 1_000_000 },
    )

    expect(result.inputCost).toBeCloseTo(1.25)
    expect(result.outputCost).toBeCloseTo(0.01)
  })
})

describe('buildUnsupportedOfficialResult', () => {
  it('builds result with warning message', () => {
    const result = buildUnsupportedOfficialResult(
      mockModel,
      mockInput,
      mockOptions,
      'API key missing',
      { 'gpt-4o': 5 },
    )

    expect(result.modelId).toBe('gpt-4o')
    expect(result.warnings.length).toBeGreaterThan(0)
    expect(result.warnings.some((w) => w.includes('API key missing'))).toBe(true)
  })

  it('uses local token count as fallback', () => {
    const result = buildUnsupportedOfficialResult(
      mockModel,
      mockInput,
      mockOptions,
      'error',
      { 'gpt-4o': 10 },
    )

    expect(result.textTokens).toBe(10)
  })
})
