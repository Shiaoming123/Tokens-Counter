import type { Tiktoken } from 'js-tiktoken/lite'

export type SupportedEncoding = 'o200k_base' | 'cl100k_base' | 'p50k_base'

const encoderCache = new Map<SupportedEncoding, Tiktoken>()

type TiktokenBPE = { pat_str: string; special_tokens: Record<string, number>; bpe_ranks: string }

async function loadRankData(encoding: SupportedEncoding): Promise<TiktokenBPE> {
  switch (encoding) {
    case 'o200k_base':
      return (await import('js-tiktoken/ranks/o200k_base')).default
    case 'cl100k_base':
      return (await import('js-tiktoken/ranks/cl100k_base')).default
    case 'p50k_base':
      return (await import('js-tiktoken/ranks/p50k_base')).default
  }
}

export async function countTextTokens(text: string, encoding: SupportedEncoding = 'o200k_base') {
  const encoder = await getCachedEncoding(encoding)
  return encoder.encode(text).length
}

async function getCachedEncoding(encoding: SupportedEncoding): Promise<Tiktoken> {
  const cached = encoderCache.get(encoding)
  if (cached) return cached

  const [{ Tiktoken: TiktokenClass }, rankData] = await Promise.all([
    import('js-tiktoken/lite'),
    loadRankData(encoding),
  ])
  const encoder = new TiktokenClass(rankData)
  encoderCache.set(encoding, encoder)
  return encoder
}
