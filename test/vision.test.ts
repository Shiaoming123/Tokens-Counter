import { describe, expect, it } from 'vitest'
import { calculateCost } from '../src/core/cost/costCalculator'
import { countGeminiImageTokensEstimate } from '../src/core/vision/geminiImageTokens'
import { countOpenAITileImageTokens } from '../src/core/vision/openaiImageTokens'

describe('vision token estimates', () => {
  it('counts OpenAI 512x512 high-detail tile image', () => {
    const result = countOpenAITileImageTokens(512, 512, 'high', { baseTokens: 85, tileTokens: 170 })
    expect(result.tokens).toBe(255)
    expect(result.debug.tiles).toBe(1)
  })

  it('resizes OpenAI 2048x2048 to short side 768 before tiling', () => {
    const result = countOpenAITileImageTokens(2048, 2048, 'high', { baseTokens: 85, tileTokens: 170 })
    expect(result.debug.resizedWidth).toBe(768)
    expect(result.debug.resizedHeight).toBe(768)
    expect(result.debug.tiles).toBe(4)
    expect(result.tokens).toBe(765)
  })

  it('counts small Gemini images as 258 tokens', () => {
    const result = countGeminiImageTokensEstimate(300, 300)
    expect(result.tokens).toBe(258)
  })

  it('counts large Gemini images by 768 tiles', () => {
    const result = countGeminiImageTokensEstimate(1000, 1000)
    expect(result.tokens).toBe(4 * 258)
  })
})

describe('cost calculator', () => {
  it('calculates input and output cost per million tokens', () => {
    const result = calculateCost({
      inputTokens: 500_000,
      estimatedOutputTokens: 100_000,
      inputPer1M: 2,
      outputPer1M: 10,
    })

    expect(result.inputCost).toBe(1)
    expect(result.outputCost).toBe(1)
    expect(result.totalCost).toBe(2)
  })
})
