import { describe, expect, it } from 'vitest'
import {
  createHistoryEntry,
  resultsToCsv,
  resultsToMarkdown,
} from '../src/core/history/historyStorage'
import type { CountInput, CountOptions, TokenCountResult } from '../src/types/domain'

const mockOptions: CountOptions = {
  openaiDetail: 'high',
  estimatedOutputTokens: 1000,
  cachedInputTokens: 0,
  cacheCreationTokens: 0,
  costMultiplier: 1,
  useOfficialApi: true,
  pricingProfile: 'official',
}

const mockResult: TokenCountResult = {
  modelId: 'gpt-4o',
  displayName: 'GPT-4o',
  provider: 'openai',
  textTokens: 100,
  imageTokens: 0,
  inputTokens: 100,
  estimatedOutputTokens: 1000,
  billableInputTokens: 100,
  cacheReadTokens: 0,
  cacheCreationTokens: 0,
  inputCost: 0.0005,
  cacheReadCost: 0,
  cacheCreationCost: 0,
  outputCost: 0.01,
  totalCost: 0.0105,
  currency: 'USD',
  accuracy: 'local_exact',
  method: 'local_tiktoken',
  warnings: [],
}

describe('createHistoryEntry', () => {
  it('creates entry with correct fields', () => {
    const input: CountInput = { text: 'hello world', images: [] }
    const entry = createHistoryEntry(input, mockOptions, [mockResult])

    expect(entry.id).toBeTruthy()
    expect(entry.createdAt).toBeTruthy()
    expect(entry.textPreview).toBe('hello world')
    expect(entry.imageCount).toBe(0)
    expect(entry.options).toEqual(mockOptions)
    expect(entry.results).toEqual([mockResult])
  })

  it('truncates long text preview to 80 chars', () => {
    const longText = 'a'.repeat(200)
    const input: CountInput = { text: longText, images: [] }
    const entry = createHistoryEntry(input, mockOptions, [mockResult])

    expect(entry.textPreview.length).toBe(80)
  })

  it('uses placeholder for empty text', () => {
    const input: CountInput = { text: '', images: [] }
    const entry = createHistoryEntry(input, mockOptions, [mockResult])

    expect(entry.textPreview).toBe('(no text)')
  })

  it('counts images correctly', () => {
    const input: CountInput = {
      text: 'test',
      images: [
        { mimeType: 'image/png', width: 100, height: 100 },
        { mimeType: 'image/jpeg', width: 200, height: 200 },
      ],
    }
    const entry = createHistoryEntry(input, mockOptions, [mockResult])

    expect(entry.imageCount).toBe(2)
  })
})

describe('resultsToMarkdown', () => {
  it('generates markdown table with header and data rows', () => {
    const md = resultsToMarkdown([mockResult])
    const lines = md.split('\n')

    expect(lines[0]).toContain('Model')
    expect(lines[0]).toContain('Text Tokens')
    expect(lines[1]).toContain('---')
    expect(lines[2]).toContain('GPT-4o')
    expect(lines[2]).toContain('100')
  })

  it('handles empty results', () => {
    const md = resultsToMarkdown([])
    const lines = md.split('\n')
    expect(lines.length).toBe(2) // header + separator only
  })
})

describe('resultsToCsv', () => {
  it('generates CSV with header and data rows', () => {
    const csv = resultsToCsv([mockResult])
    const lines = csv.split('\n')

    expect(lines[0]).toContain('model')
    expect(lines[0]).toContain('textTokens')
    expect(lines[1]).toContain('GPT-4o')
    expect(lines[1]).toContain('100')
  })

  it('handles empty results', () => {
    const csv = resultsToCsv([])
    const lines = csv.split('\n')
    expect(lines.length).toBe(1) // header only
  })

  it('escapes quotes in values', () => {
    const resultWithQuote: TokenCountResult = {
      ...mockResult,
      displayName: 'Model "Test"',
    }
    const csv = resultsToCsv([resultWithQuote])
    expect(csv).toContain('"Model ""Test"""')
  })
})
