export function countApproxTokens(text: string) {
  const normalized = text.trim()
  if (!normalized) return 0

  const latinWords = normalized.match(/[A-Za-z0-9_]+(?:[-'][A-Za-z0-9_]+)*/g)?.length ?? 0
  const cjkChars = normalized.match(/[\u3400-\u9fff]/g)?.length ?? 0
  const emojiLike = normalized.match(/[\u{1f300}-\u{1faff}]/gu)?.length ?? 0
  const punctuation = normalized.match(/[^\sA-Za-z0-9_\u3400-\u9fff]/gu)?.length ?? 0

  return Math.max(1, Math.ceil(latinWords * 1.25 + cjkChars * 1.15 + emojiLike * 2 + punctuation * 0.4))
}
