export type Provider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'deepseek'
  | 'alibaba'
  | 'zhipu'
  | 'xiaomi'
  | 'mistral'
  | 'meta'
  | 'huggingface'
  | 'xai'
  | 'cohere'
  | 'baidu'
  | 'bytedance'
  | 'moonshot'
  | 'stepfun'
  | 'minimax'

export type TokenCountMethod =
  | 'local_tokenizer'
  | 'official_count_api'
  | 'vision_formula'
  | 'hybrid'
  | 'unsupported'
  | 'pending'

export type AccuracyLevel =
  | 'official_exact'
  | 'official_estimate'
  | 'local_exact'
  | 'local_estimate'
  | 'unsupported'

export type ImageDetail = 'low' | 'high' | 'auto'

export type CurrencyCode = 'USD' | 'CNY' | 'EUR' | 'JPY' | 'GBP' | 'KRW' | 'CREDITS'
export type PricingProfileId = 'official' | 'ccswitch'

export interface ModelPricing {
  inputPer1M: number
  outputPer1M: number
  cachedInputPer1M?: number
  cacheCreationInputPer1M?: number
  currency: 'USD' | 'CNY' | 'CREDITS'
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
  supportsCoding?: boolean
  contextWindow?: number
  textCountMethod: TokenCountMethod
  imageCountMethod?: TokenCountMethod
  tokenizer?: {
    type: 'tiktoken' | 'sentencepiece' | 'mistral' | 'llama' | 'huggingface' | 'deepseek' | 'qwen' | 'glm' | 'mimo' | 'approx'
    encoding?: 'o200k_base' | 'cl100k_base' | 'p50k_base'
    localModelFile?: string
  }
  vision?: {
    type: 'openai_tile' | 'openai_patch' | 'gemini_tile' | 'qwen_vl_tile' | 'official_only'
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

export interface DocumentMetadata {
  id: string
  name: string
  mimeType: string
  sizeBytes: number
  pageCount: number
  text: string
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

export type ResultStatus = 'pending' | 'loading' | 'complete' | 'error'

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
  cacheReadCost: number
  cacheCreationCost: number
  totalCost: number
  currency: ModelPricing['currency']
  pricing?: ModelPricing
  billableInputTokens: number
  cacheReadTokens: number
  cacheCreationTokens: number
  costMultiplier: number
  contextWindow?: number
  contextUsage?: number
  accuracy: AccuracyLevel
  method: TokenCountMethod
  licenseRef: string
  warnings: string[]
  debug?: TokenDebug
  normalizedCostUSD?: number
  status?: ResultStatus
}

export interface CountOptions {
  openaiDetail: ImageDetail
  estimatedOutputTokens: number
  cachedInputTokens: number
  cacheCreationTokens: number
  costMultiplier: number
  useOfficialApi: boolean
  pricingProfile: PricingProfileId
}

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ToolDefinition {
  name: string
  description: string
  parameters: Record<string, unknown>
}

export interface CountInput {
  text: string
  images: ImageMetadata[]
  documents?: DocumentMetadata[]
  tools?: ToolDefinition[]
  messages?: Message[]
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
