import { getEncoding } from 'js-tiktoken'

export type SupportedEncoding = 'o200k_base' | 'cl100k_base' | 'p50k_base'

const encoderCache = new Map<SupportedEncoding, ReturnType<typeof getEncoding>>()

export function countTextTokens(text: string, encoding: SupportedEncoding = 'o200k_base') {
  const encoder = getCachedEncoding(encoding)
  return encoder.encode(text).length
}

function getCachedEncoding(encoding: SupportedEncoding) {
  const cached = encoderCache.get(encoding)
  if (cached) return cached

  const encoder = getEncoding(encoding)
  encoderCache.set(encoding, encoder)
  return encoder
}
