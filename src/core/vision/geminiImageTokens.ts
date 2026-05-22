import type { TokenDebug } from '../../types/domain.js'

export function countGeminiImageTokensEstimate(width: number, height: number) {
  if (width <= 384 && height <= 384) {
    return {
      tokens: 258,
      debug: {
        imageWidth: width,
        imageHeight: height,
        formula: 'small image <=384x384 = 258',
      } satisfies TokenDebug,
    }
  }

  const tilesX = Math.ceil(width / 768)
  const tilesY = Math.ceil(height / 768)
  const tiles = tilesX * tilesY

  return {
    tokens: tiles * 258,
    debug: {
      imageWidth: width,
      imageHeight: height,
      tiles,
      formula: `${tiles} * 258`,
    } satisfies TokenDebug,
  }
}
