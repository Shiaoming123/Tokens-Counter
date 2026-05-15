export type Provider = 'openai' | 'anthropic' | 'google' | 'mistral' | 'meta' | 'huggingface'

export type TokenCountMethod =
  | 'local_tokenizer'
  | 'official_count_api'
  | 'vision_formula'
  | 'hybrid'
  | 'unsupported'

export type AccuracyLevel =
  | 'official_exact'
  | 'official_estimate'
  | 'local_exact'
  | 'local_estimate'
  | 'unsupported'

export type ImageDetail = 'low' | 'high' | 'auto'

export interface ModelPricing {
  inputPer1M: number
  outputPer1M: number
  cachedInputPer1M?: number
  currency: 'USD'
  lastUpdated?: string
  source?: string
}

export interface ModelConfig {
  id: string
  displayName: string
  provider: Provider
  family: string
  supportsText: boolean
  supportsImage: boolean
  supportsPdf?: boolean
  supportsTools?: boolean
  contextWindow?: number
  textCountMethod: TokenCountMethod
  imageCountMethod?: TokenCountMethod
  tokenizer?: {
    type: 'tiktoken' | 'sentencepiece' | 'mistral' | 'llama' | 'huggingface'
    encoding?: 'o200k_base' | 'cl100k_base' | 'p50k_base'
    localModelFile?: string
  }
  vision?: {
    type: 'openai_tile' | 'openai_patch' | 'gemini_tile' | 'official_only'
    detailLevels?: ImageDetail[]
    baseTokens?: number
    tileTokens?: number
    patchSize?: number
    patchBudget?: number
    multiplier?: number
  }
  pricing: ModelPricing
  accuracy: {
    text: AccuracyLevel
    image?: AccuracyLevel
  }
  licenseRef: string
}

export interface ImageMetadata {
  id: string
  name: string
  width: number
  height: number
  mimeType: string
  sizeBytes: number
  base64?: string
}

export interface TokenDebug {
  imageWidth?: number
  imageHeight?: number
  resizedWidth?: number
  resizedHeight?: number
  tiles?: number
  patches?: number
  formula?: string
}

export interface TokenCountResult {
  modelId: string
  displayName: string
  provider: Provider
  textTokens: number
  imageTokens: number
  inputTokens: number
  estimatedOutputTokens: number
  totalTokens: number
  inputCost: number
  outputCost: number
  totalCost: number
  contextWindow?: number
  contextUsage?: number
  accuracy: AccuracyLevel
  method: TokenCountMethod
  licenseRef: string
  warnings: string[]
  debug?: TokenDebug
}

export interface CountOptions {
  openaiDetail: ImageDetail
  estimatedOutputTokens: number
  useOfficialApi: boolean
}

export interface CountInput {
  text: string
  images: ImageMetadata[]
}

export interface LicenseNotice {
  id: string
  name: string
  license: string
  usage: string
  noticeRequired: boolean
  risk?: string
  url?: string
}
