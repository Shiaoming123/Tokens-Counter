import type { TokenDebug } from '../../types/domain'

const patchArea = 32 * 32

export function countQwenVlImageTokensEstimate(
  width: number,
  height: number,
  config: { minPixels?: number; maxPixels?: number } = {},
) {
  const minPixels = config.minPixels ?? 4 * patchArea
  const maxPixels = config.maxPixels ?? 16384 * patchArea
  const originalPixels = width * height
  const targetPixels = Math.min(Math.max(originalPixels, minPixels), maxPixels)
  const scale = Math.sqrt(targetPixels / originalPixels)
  const resizedWidth = Math.max(1, Math.floor(width * scale))
  const resizedHeight = Math.max(1, Math.floor(height * scale))
  const patches = Math.ceil((resizedWidth * resizedHeight) / patchArea)

  return {
    tokens: patches,
    debug: {
      imageWidth: width,
      imageHeight: height,
      resizedWidth,
      resizedHeight,
      patches,
      formula: `ceil(resizedPixels / 32 / 32), maxPixels=${maxPixels}`,
    } satisfies TokenDebug,
  }
}
