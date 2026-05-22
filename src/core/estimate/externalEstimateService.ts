import { buildLocalResult } from '../count/resultBuilder.js'
import { models } from '../models/modelRegistry.js'
import { countLocalTextTokens } from '../tokenizers/tokenizerClient.js'
import type { CountInput, CountOptions, ImageDetail, ImageMetadata, Message, ModelConfig, TokenCountResult } from '../../types/domain.js'

export interface ExternalInputPayload {
  text?: string
  messages?: Array<{ role: string; content: string }>
  images?: Array<{
    mime_type?: string
    mimeType?: string
    width?: number
    height?: number
    base64?: string
  }>
}

export interface ExternalEstimateOptions {
  expected_output_tokens?: number
  output_tokens?: number
  cached_input_tokens?: number
  cache_hit_tokens?: number
  cache_write_tokens?: number
  cost_multiplier?: number
  prefer_official_count?: boolean
  use_official_api?: boolean
  allow_fallback?: boolean
  redact?: boolean
  openai_detail?: ImageDetail
  image_detail?: ImageDetail
  pricing_profile?: CountOptions['pricingProfile']
}

export interface ExternalEstimateRequest {
  modelIds: string[]
  input: ExternalInputPayload
  options?: ExternalEstimateOptions
}

export interface ExternalModelFailure {
  model: string
  error: {
    code: 'model_not_supported'
    message: string
    param: string
  }
}

export interface ExternalEstimateServiceResult {
  results: TokenCountResult[]
  failures: ExternalModelFailure[]
  inputSummary: {
    textBytes: number
    messageCount: number
    imageCount: number
    redacted: boolean
  }
}

export async function estimateExternalTokens({
  modelIds,
  input,
  options,
}: ExternalEstimateRequest): Promise<ExternalEstimateServiceResult> {
  const { resolvedModels, failures } = resolveRequestedModels(modelIds)
  const countInput = toCountInput(input)
  const countOptions = toCountOptions(options)
  const textForTokenizers = countInput.messages?.length ? messagesToText(countInput.messages) : countInput.text
  const textTokensByModel = await countLocalTextTokens(
    textForTokenizers,
    resolvedModels.map((model) => model.id),
  )

  const results = resolvedModels.map((model) =>
    buildLocalResult(model, countInput, countOptions, textTokensByModel),
  )

  return {
    results,
    failures,
    inputSummary: {
      textBytes: new TextEncoder().encode(input.text ?? '').byteLength,
      messageCount: input.messages?.length ?? 0,
      imageCount: input.images?.length ?? 0,
      redacted: options?.redact ?? false,
    },
  }
}

export function resolveRequestedModels(modelIds: string[]) {
  const resolvedModels: ModelConfig[] = []
  const failures: ExternalModelFailure[] = []

  modelIds.forEach((modelId, index) => {
    const model = models.find((candidate) => candidate.id === modelId)
    if (model) {
      resolvedModels.push(model)
      return
    }

    failures.push({
      model: modelId,
      error: {
        code: 'model_not_supported',
        message: 'Model is not supported by this service.',
        param: `models[${index}]`,
      },
    })
  })

  return { resolvedModels, failures }
}

export function toCountInput(input: ExternalInputPayload): CountInput {
  const messages = normalizeMessages(input.messages)
  const text = messages.length ? messagesToText(messages) : input.text ?? ''

  return {
    text,
    messages: messages.length ? messages : undefined,
    images: normalizeImages(input.images),
  }
}

function normalizeMessages(messages?: ExternalInputPayload['messages']): Message[] {
  if (!Array.isArray(messages)) return []

  return messages
    .filter((message): message is { role: string; content: string } =>
      Boolean(message && typeof message.role === 'string' && typeof message.content === 'string'),
    )
    .map((message) => ({
      role: normalizeRole(message.role),
      content: message.content,
    }))
}

function normalizeRole(role: string): Message['role'] {
  return role === 'assistant' || role === 'system' ? role : 'user'
}

function normalizeImages(images?: ExternalInputPayload['images']): ImageMetadata[] {
  if (!Array.isArray(images)) return []

  return images
    .filter((image) => image && typeof image.width === 'number' && typeof image.height === 'number')
    .map((image, index) => ({
      id: `api_image_${index + 1}`,
      name: `image-${index + 1}`,
      width: Number(image.width),
      height: Number(image.height),
      mimeType: image.mimeType ?? image.mime_type ?? 'application/octet-stream',
      sizeBytes: image.base64 ? Math.ceil((image.base64.length * 3) / 4) : 0,
      base64: image.base64,
    }))
}

function messagesToText(messages: Message[]) {
  return messages.map((message) => `${message.role}: ${message.content}`).join('\n')
}

function toCountOptions(options?: ExternalEstimateOptions): CountOptions {
  return {
    openaiDetail: options?.openai_detail ?? options?.image_detail ?? 'auto',
    estimatedOutputTokens: normalizeInteger(options?.expected_output_tokens ?? options?.output_tokens, 0),
    cachedInputTokens: normalizeInteger(options?.cached_input_tokens ?? options?.cache_hit_tokens, 0),
    cacheCreationTokens: normalizeInteger(options?.cache_write_tokens, 0),
    costMultiplier: normalizeNumber(options?.cost_multiplier, 1),
    useOfficialApi: options?.prefer_official_count ?? options?.use_official_api ?? false,
    pricingProfile: normalizePricingProfile(options?.pricing_profile),
  }
}

function normalizePricingProfile(value: unknown): CountOptions['pricingProfile'] {
  return value === 'ccswitch' ? 'ccswitch' : 'official'
}

function normalizeInteger(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(Math.trunc(value), 0) : fallback
}

function normalizeNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}
