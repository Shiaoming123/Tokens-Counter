/**
 * Lightweight HuggingFace tokenizer.json loader and BPE runtime.
 * Supports byte-level BPE (GPT-2/DeepSeek/Qwen/MiMo style) and SentencePiece BPE (Mistral/Llama).
 * No external dependencies -- parses tokenizer.json directly.
 */

// ---------------------------------------------------------------------------
// Configuration types
// ---------------------------------------------------------------------------

export interface HfTokenizerConfig {
  model: {
    type: string
    vocab: Record<string, number>
    merges?: Array<string | [string, string]>
    byte_fallback?: boolean
    fuse_unk?: boolean
  }
  added_tokens?: Array<{
    id: number
    content: string
    special: boolean
  }>
  normalizer?: {
    type: string
    precompiled_charsmap?: string
    add_prefix_space?: boolean
    prepend_scheme?: string
  }
  pre_tokenizer?: {
    type: string
    pattern?: { String?: string; Regex?: string }
    prepend_scheme?: string
  }
  decoder?: {
    type: string
  }
}

interface TokenizerInstance {
  encode(text: string): number[]
  decode(ids: number[]): string
}

const BPE_CACHE = new Map<HfTokenizerConfig, TokenizerInstance>()

// Cached lookup tables — built once, reused across all tokenizers
let _gpt2ByteTable: string[] | undefined
let _gpt2ReverseTable: Map<string, number> | undefined

function getGpt2ByteTable(): string[] {
  if (!_gpt2ByteTable) {
    _gpt2ByteTable = buildGpt2ByteTable()
  }
  return _gpt2ByteTable
}

function getGpt2ReverseTable(): Map<string, number> {
  if (!_gpt2ReverseTable) {
    _gpt2ReverseTable = buildGpt2ReverseTable()
  }
  return _gpt2ReverseTable
}

// ---------------------------------------------------------------------------
// Byte-to-character mapping tables
// ---------------------------------------------------------------------------

/**
 * GPT-2 printable byte characters.
 * Printable ASCII (33-126), Latin-1 supplement (161-172, 174-255).
 */
const printable: string[] = (() => {
  const s = new Set<string>()
  for (let i = 33; i <= 126; i++) s.add(String.fromCharCode(i))
  for (let i = 161; i <= 172; i++) s.add(String.fromCharCode(i))
  for (let i = 174; i <= 255; i++) s.add(String.fromCharCode(i))
  return [...s]
})()

function buildGpt2ByteTable(): string[] {
  const table: string[] = new Array(256)
  for (let i = 0; i < 256; i++) {
    table[i] = String.fromCharCode(i)
  }
  let offset = 0
  for (let i = 0; i < 256; i++) {
    if (!printable.includes(String.fromCharCode(i))) {
      table[i] = String.fromCharCode(256 + offset)
      offset++
    }
  }
  return table
}


// ---------------------------------------------------------------------------
// Reverse mapping tables
// ---------------------------------------------------------------------------

function buildGpt2ReverseTable(): Map<string, number> {
  const table = buildGpt2ByteTable()
  const reverse = new Map<string, number>()
  for (let b = 0; b < 256; b++) {
    reverse.set(table[b], b)
  }
  return reverse
}

// ---------------------------------------------------------------------------
// Pre-tokenizer splitting
// ---------------------------------------------------------------------------

const GPT2_SPLIT_RE = /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu

function splitByPreTokenizer(text: string, config: HfTokenizerConfig): string[] {
  const pt = config.pre_tokenizer
  if (!pt) return [text]

  if (pt.type === 'ByteLevel') {
    if (pt.pattern?.Regex) {
      return text.match(new RegExp(pt.pattern.Regex, 'gu')) ?? [text]
    }
    return text.match(GPT2_SPLIT_RE) ?? [text]
  }

  if (pt.type === 'Metaspace') {
    // SentencePiece: replace spaces with ▁ (U+2581) and return as single segment.
    // The ▁ prefix is part of tokens (e.g., vocab contains '▁world'), so we must NOT split on it.
    const addPrefixSpace = pt.prepend_scheme === 'always' || pt.prepend_scheme === 'first'
    let replaced = text.replace(/ /g, '▁')
    if (addPrefixSpace && !replaced.startsWith('▁')) {
      replaced = '▁' + replaced
    }
    return [replaced]
  }

  return [text]
}

// ---------------------------------------------------------------------------
// SentencePiece detection
// ---------------------------------------------------------------------------

function isSentencePiece(config: HfTokenizerConfig): boolean {
  return config.pre_tokenizer?.type === 'Metaspace' ||
    (config.model.byte_fallback === true && config.pre_tokenizer?.type !== 'ByteLevel')
}

// ---------------------------------------------------------------------------
// BPE algorithm
// ---------------------------------------------------------------------------

function buildMergeRankMap(merges: Array<string | [string, string]>): Map<string, number> {
  const map = new Map<string, number>()
  for (let i = 0; i < merges.length; i++) {
    const merge = merges[i]
    map.set(Array.isArray(merge) ? `${merge[0]} ${merge[1]}` : merge, i)
  }
  return map
}

function applyBpeMerges(chars: string[], mergeRankMap: Map<string, number>): string[] {
  if (chars.length < 2) return chars

  let tokens = [...chars]
  while (tokens.length > 1) {
    let bestRank = Infinity
    let bestIdx = -1

    for (let i = 0; i < tokens.length - 1; i++) {
      const key = tokens[i] + ' ' + tokens[i + 1]
      const rank = mergeRankMap.get(key) ?? Infinity
      if (rank < bestRank) {
        bestRank = rank
        bestIdx = i
      }
    }

    if (bestIdx === -1) break

    const merged = tokens[bestIdx] + tokens[bestIdx + 1]
    tokens = [
      ...tokens.slice(0, bestIdx),
      merged,
      ...tokens.slice(bestIdx + 2),
    ]
  }

  return tokens
}

// ---------------------------------------------------------------------------
// Text conversion
// ---------------------------------------------------------------------------

function textToGpt2Chars(text: string): string[] {
  const table = getGpt2ByteTable()
  const encoder = new TextEncoder()
  const bytes = encoder.encode(text)
  const chars: string[] = []
  for (let i = 0; i < bytes.length; i++) {
    chars.push(table[bytes[i]])
  }
  return chars
}


function spByteFallbackToByte(token: string): number | null {
  const match = token.match(/^(<0x([0-9A-Fa-f]{2})>)$/)
  if (!match) return null
  return parseInt(match[2], 16)
}

// ---------------------------------------------------------------------------
// NFKC normalization
// ---------------------------------------------------------------------------

function normalizeNfkc(text: string): string {
  return text.normalize('NFKC')
}

// ---------------------------------------------------------------------------
// Tokenizer factory
// ---------------------------------------------------------------------------

function createTokenizer(config: HfTokenizerConfig): TokenizerInstance {
  const { vocab, merges = [], byte_fallback } = config.model
  const sp = isSentencePiece(config)
  const useNfkc = sp && (!config.normalizer || config.normalizer.type === 'NFKC')

  const vocabByToken = new Map<string, number>()
  const idToToken = new Map<number, string>()
  for (const [token, id] of Object.entries(vocab)) {
    vocabByToken.set(token, id)
    idToToken.set(id, token)
  }

  const mergeRankMap = buildMergeRankMap(merges)
  const reverse = getGpt2ReverseTable()

  function encode(text: string): number[] {
    if (text.length === 0) return []

    let processed = text
    if (useNfkc) processed = normalizeNfkc(processed)

    const segments = splitByPreTokenizer(processed, config)
    const allIds: number[] = []

    for (const segment of segments) {
      if (sp) {
        const chars = [...segment]
        const merged = applyBpeMerges(chars, mergeRankMap)
        for (const token of merged) {
          const id = vocabByToken.get(token)
          if (id !== undefined) {
            allIds.push(id)
          } else if (byte_fallback) {
            const encoder = new TextEncoder()
            const bytes = encoder.encode(token)
            for (const b of bytes) {
              const hex = b.toString(16).toUpperCase().padStart(2, '0')
              const fallbackId = vocabByToken.get('<0x' + hex + '>')
              if (fallbackId !== undefined) allIds.push(fallbackId)
            }
          }
        }
      } else {
        const chars = textToGpt2Chars(segment)
        const merged = applyBpeMerges(chars, mergeRankMap)
        for (const token of merged) {
          const id = vocabByToken.get(token)
          if (id !== undefined) {
            allIds.push(id)
          } else if (byte_fallback) {
            for (const ch of token) {
              const b = reverse.get(ch)
              if (b !== undefined) {
                const hex = b.toString(16).toUpperCase().padStart(2, '0')
                const fallbackId = vocabByToken.get('<0x' + hex + '>')
                if (fallbackId !== undefined) allIds.push(fallbackId)
              }
            }
          }
        }
      }
    }

    return allIds
  }

  function decode(ids: number[]): string {
    if (ids.length === 0) return ''

    const tokens: string[] = []
    for (const id of ids) {
      const token = idToToken.get(id)
      if (token !== undefined) tokens.push(token)
    }

    if (sp) {
      let result = ''
      const pendingBytes: number[] = []
      for (const token of tokens) {
        const fb = spByteFallbackToByte(token)
        if (fb !== null) {
          pendingBytes.push(fb)
        } else {
          if (pendingBytes.length > 0) {
            result += new TextDecoder().decode(new Uint8Array(pendingBytes))
            pendingBytes.length = 0
          }
          result += token.replace(/▁/g, ' ')
        }
      }
      if (pendingBytes.length > 0) {
        result += new TextDecoder().decode(new Uint8Array(pendingBytes))
      }
      return result
    }

    const bytes: number[] = []
    for (const token of tokens) {
      const fb = spByteFallbackToByte(token)
      if (fb !== null) {
        bytes.push(fb)
      } else {
        for (const ch of token) {
          const b = reverse.get(ch)
          if (b !== undefined) {
            bytes.push(b)
          } else {
            bytes.push(ch.charCodeAt(0) & 0xff)
          }
        }
      }
    }
    return new TextDecoder().decode(new Uint8Array(bytes))
  }

  return { encode, decode }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function loadHfTokenizer(config: HfTokenizerConfig): Promise<TokenizerInstance> {
  const cached = BPE_CACHE.get(config)
  if (cached) return cached

  const instance = createTokenizer(config)
  BPE_CACHE.set(config, instance)
  return instance
}

export function countHfTokens(text: string, tokenizer: TokenizerInstance): number {
  return tokenizer.encode(text).length
}
