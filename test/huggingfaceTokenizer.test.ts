import { describe, expect, it } from 'vitest';
import {
  loadHfTokenizer,
  countHfTokens,
  type HfTokenizerConfig,
} from '../src/core/tokenizers/huggingfaceTokenizer';

// GPT-2 style (ByteLevel) test config
function createGpt2TestConfig(): HfTokenizerConfig {
  const vocab: Record<string, number> = {}
  for (let i = 0; i < 256; i++) {
    vocab[String.fromCharCode(i)] = i
  }
  for (let i = 0; i < 256; i++) {
    vocab[`<0x${i.toString(16).toUpperCase().padStart(2, '0')}>`] = 512 + i
  }
  vocab['he'] = 256
  vocab['ll'] = 257
  vocab['llo'] = 258
  vocab['hello'] = 259
  vocab[' w'] = 260
  vocab[' wo'] = 261
  vocab[' wor'] = 262
  vocab[' worl'] = 263
  vocab[' world'] = 264
  vocab['hello world'] = 265

  return {
    model: {
      type: 'BPE',
      vocab,
      merges: [
        'h e',
        'l l',
        'll o',
        'he llo',
        ' w',
        ' w o',
        ' wo r',
        ' wor l',
        ' worl d',
        'hello  world',
      ],
      byte_fallback: true,
    },
    pre_tokenizer: {
      type: 'ByteLevel',
      prepend_scheme: 'never',
    },
  }
}

// SentencePiece (Metaspace) test config
function createSentencePieceTestConfig(): HfTokenizerConfig {
  const vocab: Record<string, number> = {}
  for (let i = 0; i < 256; i++) {
    vocab[String.fromCharCode(i)] = i
  }
  for (let i = 0; i < 256; i++) {
    vocab[`<0x${i.toString(16).toUpperCase().padStart(2, '0')}>`] = 512 + i
  }
  vocab['lo'] = 256
  vocab['lo '] = 257
  vocab['lo w'] = 258
  vocab['lo wo'] = 259
  vocab['lo wor'] = 260
  vocab['lo worl'] = 261
  vocab['lo world'] = 262
  vocab['he'] = 263
  vocab['hello world'] = 264

  return {
    model: {
      type: 'BPE',
      vocab,
      merges: [
        'l o',
        'lo  ',
        'lo  w',
        'lo w o',
        'lo wo r',
        'lo wor l',
        'lo worl d',
        'h e',
        'he lo world',
      ],
      byte_fallback: true,
    },
    pre_tokenizer: {
      type: 'Metaspace',
      prepend_scheme: 'never',
    },
  }
}

describe('huggingfaceTokenizer - GPT-2 ByteLevel', () => {
  it('encodes hello as a single token', async () => {
    const tokenizer = await loadHfTokenizer(createGpt2TestConfig())
    const ids = tokenizer.encode('hello')
    expect(ids).toEqual([259])
  })

  it('counts tokens correctly', async () => {
    const tokenizer = await loadHfTokenizer(createGpt2TestConfig())
    expect(countHfTokens('hello', tokenizer)).toBe(1)
  })

  it('decodes token back to text', async () => {
    const tokenizer = await loadHfTokenizer(createGpt2TestConfig())
    const text = tokenizer.decode([259])
    expect(text).toBe('hello')
  })

  it('encodes empty string as empty array', async () => {
    const tokenizer = await loadHfTokenizer(createGpt2TestConfig())
    expect(tokenizer.encode('')).toEqual([])
  })

  it('handles unknown characters with byte fallback', async () => {
    const tokenizer = await loadHfTokenizer(createGpt2TestConfig())
    const ids = tokenizer.encode('A')
    expect(ids.length).toBeGreaterThan(0)
  })

  it('returns same instance for same config (caching)', async () => {
    const config = createGpt2TestConfig()
    const t1 = await loadHfTokenizer(config)
    const t2 = await loadHfTokenizer(config)
    expect(t1).toBe(t2)
  })

  it('handles CJK characters with byte fallback', async () => {
    const tokenizer = await loadHfTokenizer(createGpt2TestConfig())
    const ids = tokenizer.encode('你好')
    expect(ids.length).toBeGreaterThan(0)
  })

  it('roundtrips mixed ASCII and CJK text', async () => {
    const tokenizer = await loadHfTokenizer(createGpt2TestConfig())
    const ids = tokenizer.encode('hi你好')
    const decoded = tokenizer.decode(ids)
    expect(decoded).toBe('hi你好')
  })
})
describe('huggingfaceTokenizer - SentencePiece Metaspace', () => {
  it('encodes and merges characters via BPE', async () => {
    const tokenizer = await loadHfTokenizer(createSentencePieceTestConfig())
    const ids = tokenizer.encode('he')
    // 'h' + 'e' merge to 'he' (vocab ID 263) via BPE
    expect(ids).toEqual([263])
  })

  it('applies BPE merges to produce merged tokens', async () => {
    const tokenizer = await loadHfTokenizer(createSentencePieceTestConfig())
    const ids = tokenizer.encode('lo')
    expect(ids).toEqual([256])
  })

  it('handles space as Metaspace separator', async () => {
    const tokenizer = await loadHfTokenizer(createSentencePieceTestConfig())
    const ids = tokenizer.encode('hi world')
    // 'hi▁world': h(104) i(105) ▁→byte-fallback(738,662,641) w(119) o(111) r(114) l(108) d(100)
    // ▁ (U+2581) is not in test vocab, falls back to <0xE2><0x96><0x81>
    expect(ids).toEqual([104, 105, 738, 662, 641, 119, 111, 114, 108, 100])
  })

  it('uses byte fallback for Chinese characters', async () => {
    const tokenizer = await loadHfTokenizer(createSentencePieceTestConfig())
    const ids = tokenizer.encode('你好')
    expect(ids).toEqual([512 + 0xe4, 512 + 0xbd, 512 + 0xa0, 512 + 0xe5, 512 + 0xa5, 512 + 0xbd])
  })

  it('counts tokens with byte fallback', async () => {
    const tokenizer = await loadHfTokenizer(createSentencePieceTestConfig())
    expect(countHfTokens('你', tokenizer)).toBe(3)
    expect(countHfTokens('你好', tokenizer)).toBe(6)
  })

  it('roundtrips ASCII text through encode/decode', async () => {
    const tokenizer = await loadHfTokenizer(createSentencePieceTestConfig())
    const ids = tokenizer.encode('hello')
    const decoded = tokenizer.decode(ids)
    expect(decoded).toBe('hello')
  })

  it('roundtrips Chinese text through encode/decode', async () => {
    const tokenizer = await loadHfTokenizer(createSentencePieceTestConfig())
    const ids = tokenizer.encode('你好世界')
    const decoded = tokenizer.decode(ids)
    expect(decoded).toBe('你好世界')
  })

  it('roundtrips mixed ASCII and Chinese text', async () => {
    const tokenizer = await loadHfTokenizer(createSentencePieceTestConfig())
    const ids = tokenizer.encode('hi你好world')
    const decoded = tokenizer.decode(ids)
    expect(decoded).toBe('hi你好world')
  })

  it('returns same instance for same config (caching)', async () => {
    const config = createSentencePieceTestConfig()
    const t1 = await loadHfTokenizer(config)
    const t2 = await loadHfTokenizer(config)
    expect(t1).toBe(t2)
  })
})
