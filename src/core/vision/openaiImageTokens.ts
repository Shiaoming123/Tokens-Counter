import type { ImageDetail, TokenDebug } from '../../types/domain'

export interface OpenAITileConfig {
  baseTokens: number
  tileTokens: number
}

export interface OpenAIPatchConfig {
  patchSize: 32
  patchBudget: number
  multiplier: number
}

export function countOpenAITileImageTokens(
  width: number,
  height: number,
  detail: ImageDetail,
  config: OpenAITileConfig,
) {
  if (detail === 'low') {
    return {
      tokens: config.baseTokens,
      debug: {
        imageWidth: width,
        imageHeight: height,
        formula: 'low detail = baseTokens',
      } satisfies TokenDebug,
    }
  }

  let resizedWidth = width
  let resizedHeight = height

  const maxSide = 2048
  if (resizedWidth > maxSide || resizedHeight > maxSide) {
    const scale = Math.min(maxSide / resizedWidth, maxSide / resizedHeight)
    resizedWidth = Math.floor(resizedWidth * scale)
    resizedHeight = Math.floor(resizedHeight * scale)
  }

  const shortSide = Math.min(resizedWidth, resizedHeight)
  if (shortSide > 768) {
    const scale = 768 / shortSide
    resizedWidth = Math.floor(resizedWidth * scale)
    resizedHeight = Math.floor(resizedHeight * scale)
  }

  const tilesX = Math.ceil(resizedWidth / 512)
  const tilesY = Math.ceil(resizedHeight / 512)
  const tiles = tilesX * tilesY

  return {
    tokens: config.baseTokens + tiles * config.tileTokens,
    debug: {
      imageWidth: width,
      imageHeight: height,
      resizedWidth,
      resizedHeight,
      tiles,
      formula: `${config.baseTokens} + ${tiles} * ${config.tileTokens}`,
    } satisfies TokenDebug,
  }
}

export function countOpenAIPatchImageTokens(width: number, height: number, config: OpenAIPatchConfig) {
  const patchSize = config.patchSize
  const originalPatchCount = Math.ceil(width / patchSize) * Math.ceil(height / patchSize)

  let resizedWidth = width
  let resizedHeight = height
  let patchCount = originalPatchCount

  if (originalPatchCount > config.patchBudget) {
    const shrinkFactor = Math.sqrt((patchSize ** 2 * config.patchBudget) / (width * height))
    const widthRatio = (width * shrinkFactor) / patchSize
    const heightRatio = (height * shrinkFactor) / patchSize
    const adjustedShrinkFactor =
      shrinkFactor *
      Math.min(Math.floor(widthRatio) / widthRatio, Math.floor(heightRatio) / heightRatio)

    resizedWidth = Math.floor(width * adjustedShrinkFactor)
    resizedHeight = Math.floor(height * adjustedShrinkFactor)
    patchCount = Math.ceil(resizedWidth / patchSize) * Math.ceil(resizedHeight / patchSize)
  }

  return {
    tokens: Math.ceil(patchCount * config.multiplier),
    debug: {
      imageWidth: width,
      imageHeight: height,
      resizedWidth,
      resizedHeight,
      patches: patchCount,
      formula: `ceil(${patchCount} * ${config.multiplier})`,
    } satisfies TokenDebug,
  }
}
