import { describe, expect, it } from 'vitest'
import { countApproxTokens } from '../src/core/tokenizers/approxTokenizer'

describe('countApproxTokens', () => {
  it('returns 0 for empty or whitespace-only text', () => {
    expect(countApproxTokens('')).toBe(0)
    expect(countApproxTokens('   ')).toBe(0)
    expect(countApproxTokens('\n\t')).toBe(0)
  })

  it('counts Latin words with ~1.25 multiplier', () => {
    // 4 words * 1.25 = 5
    expect(countApproxTokens('hello world foo bar')).toBe(5)
  })

  it('counts CJK characters with ~1.15 multiplier', () => {
    // 4 CJK * 1.15 = 4.6, ceil = 5
    expect(countApproxTokens('你好世界')).toBe(5)
  })

  it('counts mixed Latin and CJK text', () => {
    // 2 latin words * 1.25 + 4 CJK * 1.15 = 2.5 + 4.6 = 7.1, ceil = 8
    expect(countApproxTokens('hello 你好 world 世界')).toBe(8)
  })

  it('counts emoji-like characters with ~2 multiplier', () => {
    // 2 emoji * 2 + 2 punctuation(emoji also matches punct regex) * 0.4 = 4.8, ceil = 5
    expect(countApproxTokens('🎉🎊')).toBe(5)
  })

  it('counts punctuation with ~0.4 multiplier', () => {
    // 3 punctuation * 0.4 = 1.2, ceil = 2
    expect(countApproxTokens('!@#')).toBe(2)
  })

  it('returns at least 1 for non-empty text', () => {
    // single punctuation: 1 * 0.4 = 0.4, ceil = 1
    expect(countApproxTokens('.')).toBe(1)
  })

  it('handles real-world English sentence', () => {
    const text = 'The quick brown fox jumps over the lazy dog.'
    const tokens = countApproxTokens(text)
    expect(tokens).toBeGreaterThan(0)
    expect(tokens).toBeLessThan(20)
  })

  it('handles real-world Chinese sentence', () => {
    const text = '今天天气真好，我们一起去公园散步吧。'
    const tokens = countApproxTokens(text)
    expect(tokens).toBeGreaterThan(0)
    expect(tokens).toBeLessThan(30)
  })

  it('handles mixed content with code-like text', () => {
    const text = 'const x = 42; // 注释'
    const tokens = countApproxTokens(text)
    expect(tokens).toBeGreaterThan(0)
  })
})
