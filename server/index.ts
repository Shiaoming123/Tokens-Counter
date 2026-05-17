import { existsSync } from 'node:fs'
import { join } from 'node:path'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenAI } from '@google/genai'
import OpenAI from 'openai'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { cors } from 'hono/cors'
import licenses from '../src/data/licenses.json' with { type: 'json' }
import rawModels from '../src/data/models.json' with { type: 'json' }
import pricing from '../src/data/model-pricing.json' with { type: 'json' }
import {
  estimateExternalTokens,
  resolveRequestedModels,
  type ExternalEstimateOptions,
  type ExternalInputPayload,
} from '../src/core/estimate/externalEstimateService'
import { models as registryModels } from '../src/core/models/modelRegistry'
import type { CountInput, ModelConfig, ModelPricing, TokenCountResult } from '../src/types/domain'
import { env } from './env'

interface OfficialRequest {
  modelId: string
  input: CountInput
}

interface ExternalRequestBody {
  models?: unknown
  input?: unknown
  options?: unknown
}

type ValidationResult =
  | {
      ok: true
      value: {
        models: string[]
        input: ExternalInputPayload
        options?: ExternalEstimateOptions
      }
    }
  | {
      ok: false
      message: string
      param?: string
      details?: Record<string, unknown>
    }

function createRequestId() {
  return `req_${crypto.randomUUID().replaceAll('-', '')}`
}

function applyRateLimitHeaders(context: Context) {
  const reset = Math.floor(Date.now() / 1000) + 3600
  context.header('X-RateLimit-Limit', '120')
  context.header('X-RateLimit-Remaining', '119')
  context.header('X-RateLimit-Reset', String(reset))
}

function externalError(
  context: Context,
  status: ContentfulStatusCode,
  code: string,
  message: string,
  requestId = createRequestId(),
  param?: string,
  details?: Record<string, unknown>,
) {
  return context.json(
    {
      error: {
        code,
        message,
        ...(param ? { param } : {}),
        details: details ?? {},
        request_id: requestId,
      },
    },
    status,
  )
}

async function readExternalJson(context: Context, requestId: string) {
  try {
    return { ok: true as const, value: (await context.req.json()) as ExternalRequestBody }
  } catch {
    return {
      ok: false as const,
      response: externalError(context, 400, 'invalid_request', 'Request body must be valid JSON.', requestId, 'body'),
    }
  }
}

function validateEstimateBody(body: ExternalRequestBody): ValidationResult {
  if (!Array.isArray(body.models) || body.models.length === 0) {
    return {
      ok: false,
      message: 'models must contain at least one model id',
      param: 'models',
      details: { minimum: 1 },
    }
  }

  if (!body.models.every((modelId) => typeof modelId === 'string' && modelId.trim())) {
    return {
      ok: false,
      message: 'models must contain only non-empty model ids',
      param: 'models',
    }
  }

  if (!isRecord(body.input)) {
    return {
      ok: false,
      message: 'input is required',
      param: 'input',
    }
  }

  const input = body.input as ExternalInputPayload
  if (!hasCountableInput(input)) {
    return {
      ok: false,
      message: 'input must include non-empty text, messages, or images',
      param: 'input',
    }
  }

  return {
    ok: true,
    value: {
      models: body.models.map((modelId) => modelId.trim()),
      input,
      options: isRecord(body.options) ? (body.options as ExternalEstimateOptions) : undefined,
    },
  }
}

function hasCountableInput(input: ExternalInputPayload) {
  const hasText = typeof input.text === 'string' && input.text.trim().length > 0
  const hasMessages =
    Array.isArray(input.messages) &&
    input.messages.some((message) => typeof message?.content === 'string' && message.content.trim().length > 0)
  const hasImages = Array.isArray(input.images) && input.images.length > 0

  return hasText || hasMessages || hasImages
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function modelHasCapability(model: ModelConfig, capability: string) {
  const capabilities: Record<string, boolean> = {
    text: model.supportsText,
    image: model.supportsImage,
    coding: model.supportsCoding ?? false,
    messages: model.supportsText,
    cost_estimate: Boolean(model.pricing),
    official_count: model.textCountMethod === 'official_count_api',
    local_count: model.textCountMethod === 'local_tokenizer' || Boolean(model.tokenizer),
  }

  return capabilities[capability] ?? false
}

function toApiPricing(pricingInfo: ModelPricing) {
  return {
    currency: pricingInfo.currency,
    input_per_1m: pricingInfo.inputPer1M,
    output_per_1m: pricingInfo.outputPer1M,
    cached_input_per_1m: pricingInfo.cachedInputPer1M ?? null,
    cache_write_per_1m: pricingInfo.cacheCreationInputPer1M ?? null,
    source: pricingInfo.source ?? null,
    last_updated: pricingInfo.lastUpdated ?? null,
  }
}

function toApiCountResult(result: TokenCountResult) {
  return {
    model: result.modelId,
    provider: result.provider,
    input_tokens: result.inputTokens,
    text_tokens: result.textTokens,
    image_tokens: result.imageTokens,
    total_tokens: result.totalTokens,
    context_window: result.contextWindow ?? null,
    context_usage_ratio: result.contextUsage ?? null,
    accuracy: {
      text: result.accuracy,
      image: result.imageTokens > 0 ? result.accuracy : 'unsupported',
      overall: result.accuracy,
    },
    count_methods: {
      text: result.method,
      image: result.imageTokens > 0 ? result.method : 'unsupported',
    },
    warnings: result.warnings,
  }
}

function toApiEstimateResult(result: TokenCountResult) {
  const model = registryModels.find((item) => item.id === result.modelId)
  return {
    model: result.modelId,
    provider: result.provider,
    count: {
      input_tokens: result.inputTokens,
      text_tokens: result.textTokens,
      image_tokens: result.imageTokens,
      expected_output_tokens: result.estimatedOutputTokens,
      total_tokens: result.totalTokens,
      context_window: result.contextWindow ?? null,
      context_usage_ratio: result.contextUsage ?? null,
      accuracy: {
        text: result.accuracy,
        image: result.imageTokens > 0 ? result.accuracy : 'unsupported',
        overall: result.accuracy,
      },
      count_methods: {
        text: result.method,
        image: result.imageTokens > 0 ? result.method : 'unsupported',
      },
      warnings: result.warnings,
    },
    cost: {
      currency: result.currency,
      input: result.inputCost,
      cached_input: result.cacheReadCost,
      cache_write: result.cacheCreationCost,
      output: result.outputCost,
      total: result.totalCost,
      pricing: result.pricing ? toApiPricing(result.pricing) : model ? toApiPricing(model.pricing) : null,
      multiplier: result.costMultiplier,
    },
    warnings: result.warnings,
  }
}

function toApiEstimateSummary(results: TokenCountResult[]) {
  const completeResults = results.filter((result) => result.status !== 'error')
  const cheapest = completeResults.reduce<TokenCountResult | null>((best, result) => {
    if (!best) return result
    return result.totalCost < best.totalCost ? result : best
  }, null)

  return {
    total_input_tokens: completeResults.reduce((sum, result) => sum + result.inputTokens, 0),
    cheapest_model: cheapest?.modelId ?? null,
    cheapest_cost: cheapest?.totalCost ?? null,
    models_compared: completeResults.length,
    currency: cheapest?.currency ?? null,
  }
}

const app = new Hono()
const port = env.PORT

app.use('/api/*', cors())
app.use('/api/v1/*', async (context, next) => {
  applyRateLimitHeaders(context)

  const configuredApiKey = env.TOKEN_COUNTER_API_KEY
  if (configuredApiKey) {
    const authorization = context.req.header('Authorization')
    if (authorization !== `Bearer ${configuredApiKey}`) {
      return externalError(context, 401, 'unauthorized', 'Missing or invalid API key.')
    }
  }

  await next()
})

app.get('/api/models', (context) => context.json({ models: rawModels, licenses }))
app.get('/api/pricing', (context) => context.json(pricing))

app.get('/api/v1/models', (context) => {
  const provider = context.req.query('provider')
  const capability = context.req.query('capability')
  const data = registryModels
    .filter((model) => !provider || model.provider === provider)
    .filter((model) => !capability || modelHasCapability(model, capability))
    .map((model) => ({
      model: model.id,
      provider: model.provider,
      display_name: model.displayName,
      aliases: [],
      context_window: model.contextWindow ?? null,
      capabilities: {
        text: model.supportsText,
        image: model.supportsImage,
        coding: model.supportsCoding ?? false,
        messages: model.supportsText,
        cost_estimate: Boolean(model.pricing),
        official_count: model.textCountMethod === 'official_count_api',
        local_count: model.textCountMethod === 'local_tokenizer' || Boolean(model.tokenizer),
      },
      pricing: toApiPricing(model.pricing),
      count_methods: {
        text: model.textCountMethod,
        image: model.imageCountMethod ?? (model.supportsImage ? 'vision_formula' : 'unsupported'),
        tokenizer: model.tokenizer
          ? {
              type: model.tokenizer.type,
              encoding: model.tokenizer.encoding ?? null,
            }
          : null,
        vision: model.vision
          ? {
              type: model.vision.type,
              detail_levels: model.vision.detailLevels ?? [],
            }
          : null,
      },
    }))

  return context.json({ data })
})

app.post('/api/v1/estimates', async (context) => {
  const requestId = createRequestId()
  const body = await readExternalJson(context, requestId)
  if (!body.ok) return body.response

  const validation = validateEstimateBody(body.value)
  if (!validation.ok) return externalError(context, 400, 'invalid_request', validation.message, requestId, validation.param, validation.details)

  const modelValidation = resolveRequestedModels(validation.value.models)
  if (modelValidation.resolvedModels.length === 0) {
    return externalError(context, 400, 'model_not_supported', 'No requested models are supported by this service.', requestId, 'models', {
      failures: modelValidation.failures,
    })
  }

  const serviceResult = await estimateExternalTokens({
    modelIds: validation.value.models,
    input: validation.value.input,
    options: validation.value.options,
  })

  return context.json({
    id: `est_${requestId.slice(4)}`,
    object: 'estimate',
    created_at: new Date().toISOString(),
    request_id: requestId,
    input_summary: {
      text_bytes: serviceResult.inputSummary.textBytes,
      message_count: serviceResult.inputSummary.messageCount,
      image_count: serviceResult.inputSummary.imageCount,
      redacted: serviceResult.inputSummary.redacted,
    },
    summary: toApiEstimateSummary(serviceResult.results),
    results: serviceResult.results.map(toApiEstimateResult),
    ...(serviceResult.failures.length ? { failures: serviceResult.failures } : {}),
  })
})

app.post('/api/v1/tokens/count', async (context) => {
  const requestId = createRequestId()
  const body = await readExternalJson(context, requestId)
  if (!body.ok) return body.response

  const validation = validateEstimateBody(body.value)
  if (!validation.ok) return externalError(context, 400, 'invalid_request', validation.message, requestId, validation.param, validation.details)

  const modelValidation = resolveRequestedModels(validation.value.models)
  if (modelValidation.resolvedModels.length === 0) {
    return externalError(context, 400, 'model_not_supported', 'No requested models are supported by this service.', requestId, 'models', {
      failures: modelValidation.failures,
    })
  }

  const serviceResult = await estimateExternalTokens({
    modelIds: validation.value.models,
    input: validation.value.input,
    options: validation.value.options,
  })

  return context.json({
    object: 'token_count',
    created_at: new Date().toISOString(),
    request_id: requestId,
    results: serviceResult.results.map(toApiCountResult),
    ...(serviceResult.failures.length ? { failures: serviceResult.failures } : {}),
  })
})

app.post('/api/count/anthropic', async (context) => {
  const apiKey = env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return context.json({ error: '缺少 ANTHROPIC_API_KEY，Claude 官方计数不可用。' }, 401)
  }

  const body = await context.req.json<OfficialRequest>()
  const anthropic = new Anthropic({ apiKey })
  const hasImages = body.input.images.length > 0
  const content: string | Anthropic.ContentBlockParam[] = hasImages
    ? [
        ...body.input.images.map((image) => ({
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: image.mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: image.base64 ?? '',
          },
        })),
        {
          type: 'text' as const,
          text: body.input.text || 'Describe this image.',
        },
      ]
    : body.input.text

  const systemMessages = body.input.messages?.filter((m) => m.role === 'system') ?? []
  const nonSystemMessages = body.input.messages?.filter((m) => m.role !== 'system') ?? []

  const result = await anthropic.messages.countTokens({
    model: body.modelId,
    ...(systemMessages.length > 0 ? { system: systemMessages.map((m) => m.content).join('\n') } : {}),
    messages:
      nonSystemMessages.length > 0
        ? nonSystemMessages.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }))
        : [{ role: 'user' as const, content }],
  })

  return context.json({
    inputTokens: result.input_tokens,
    accuracy: 'official_estimate',
    method: 'official_count_api',
    warnings: ['Claude 计数来自 Anthropic 官方 count_tokens endpoint，实际请求 usage 仍可能有细微差异。'],
  })
})

app.post('/api/count/openai', async (context) => {
  const apiKey = env.OPENAI_API_KEY
  if (!apiKey) {
    return context.json({ error: '缺少 OPENAI_API_KEY，OpenAI 官方计数不可用。' }, 401)
  }

  const body = await context.req.json<OfficialRequest>()
  const openai = new OpenAI({ apiKey })

  const hasImages = body.input.images.length > 0
  const content: string | OpenAI.ChatCompletionContentPart[] = hasImages
    ? [
        ...body.input.images.map((image) => ({
          type: 'image_url' as const,
          image_url: {
            url: `data:${image.mimeType};base64,${image.base64 ?? ''}`,
          },
        })),
        {
          type: 'text' as const,
          text: body.input.text || 'Describe this image.',
        },
      ]
    : body.input.text

  const systemMessages = body.input.messages?.filter((m) => m.role === 'system') ?? []
  const nonSystemMessages = body.input.messages?.filter((m) => m.role !== 'system') ?? []

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    ...(systemMessages.length > 0
      ? [{ role: 'system' as const, content: systemMessages.map((m) => m.content).join('\n') }]
      : []),
    ...(nonSystemMessages.length > 0
      ? nonSystemMessages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))
      : [{ role: 'user' as const, content }]),
  ]

  try {
    const result = await openai.chat.completions.create({
      model: body.modelId,
      messages,
      max_tokens: 1,
    })

    return context.json({
      inputTokens: result.usage?.prompt_tokens ?? 0,
      accuracy: 'official_estimate',
      method: 'official_count_api',
      warnings: [
        'OpenAI 计数通过实际创建 completion (max_tokens=1) 获取 usage.prompt_tokens。cached_tokens 来自 usage.prompt_tokens_details。',
      ],
    })
  } catch (error) {
    return context.json(
      { error: `OpenAI API 请求失败：${error instanceof Error ? error.message : 'Unknown'}` },
      502 as ContentfulStatusCode,
    )
  }
})
app.post('/api/count/gemini', async (context) => {
  const apiKey = env.GEMINI_API_KEY
  if (!apiKey) {
    return context.json({ error: '缺少 GEMINI_API_KEY，Gemini 已回退本地估算。' }, 401)
  }

  const body = await context.req.json<OfficialRequest>()
  const ai = new GoogleGenAI({ apiKey })
  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    ...(body.input.text ? [{ text: body.input.text }] : []),
    ...body.input.images.map((image) => ({
      inlineData: {
        mimeType: image.mimeType,
        data: image.base64 ?? '',
      },
    })),
  ]

  try {
    const result = await ai.models.countTokens({
      model: body.modelId,
      contents:
        body.input.messages?.length
          ? body.input.messages.map((m) => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }],
            }))
          : [{ role: 'user', parts }],
    })

    return context.json({
      inputTokens: Number(result.totalTokens ?? 0),
      accuracy: 'official_estimate',
      method: 'official_count_api',
      warnings: ['Gemini 计数来自 Google GenAI countTokens。多模态和 thinking/cached usage 以实际调用 metadata 为准。'],
    })
  } catch (error) {
    return context.json(
      { error: `Gemini API 请求失败：${error instanceof Error ? error.message : 'Unknown'}` },
      502 as ContentfulStatusCode,
    )
  }
})

app.post('/api/count/zai', async (context) => {
  const apiKey = env.ZAI_API_KEY ?? env.ZHIPU_API_KEY
  if (!apiKey) {
    return context.json({ error: '缺少 ZAI_API_KEY 或 ZHIPU_API_KEY，GLM 官方 tokenizer 不可用。' }, 401)
  }

  const body = await context.req.json<OfficialRequest>()
  const content = body.input.images.length
    ? [
        ...body.input.images.map((image) => ({
          type: 'image_url',
          image_url: {
            url: `data:${image.mimeType};base64,${image.base64 ?? ''}`,
          },
        })),
        {
          type: 'text',
          text: body.input.text || 'Describe this image.',
        },
      ]
    : body.input.text

  const response = await fetch('https://api.z.ai/api/paas/v4/tokenizer', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: body.modelId,
      messages:
        body.input.messages?.length
          ? body.input.messages.map((m) => ({ role: m.role, content: m.content }))
          : [{ role: 'user', content }],
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    return context.json({ error: `Z.AI tokenizer 请求失败：${text || response.status}` }, response.status as ContentfulStatusCode)
  }

  const result = (await response.json()) as {
    usage?: { prompt_tokens?: number; image_tokens?: number; total_tokens?: number }
  }

  return context.json({
    inputTokens: Number(result.usage?.total_tokens ?? result.usage?.prompt_tokens ?? 0),
    accuracy: 'official_estimate',
    method: 'official_count_api',
    warnings: ['GLM 计数来自 Z.AI 官方 /api/paas/v4/tokenizer。多模态 token 以 usage.total_tokens 为准。'],
  })
})

const HF_TOKENIZER_CACHE = new Map<string, { data: unknown; fetchedAt: number }>()
const HF_CACHE_TTL = 3600_000 // 1 hour

const ALLOWED_HF_REPOS = new Set([
  'deepseek-ai/DeepSeek-V3',
  'deepseek-ai/DeepSeek-V3-0324',
  'deepseek-ai/DeepSeek-V3.1',
  'deepseek-ai/DeepSeek-V3.2',
  'deepseek-ai/DeepSeek-V4',
  'deepseek-ai/DeepSeek-V4-Flash',
  'deepseek-ai/DeepSeek-V4-Pro',
  'deepseek-ai/DeepSeek-R1',
  'Qwen/Qwen2.5-72B-Instruct',
  'Qwen/Qwen2.5-VL-72B-Instruct',
  'Qwen/Qwen3-72B',
  'Qwen/Qwen3-32B',
  'Qwen/Qwen3-235B-A22B',
  'Qwen/Qwen3-Coder-30B-A3B-Instruct',
  'Qwen/QwQ-32B',
  'XiaomiMiMo/MiMo-7B-RL',
  'mistralai/Mistral-Large-Instruct-2411',
  'mistralai/Mistral-Small-Instruct-2503',
  'mistralai/Mistral-7B-Instruct-v0.3',
  'baidu/ERNIE-4.5-0.3B-PT',
  'meta-llama/Llama-3.1-70B-Instruct',
  'meta-llama/Llama-3.1-8B-Instruct',
  'meta-llama/Llama-3.3-70B-Instruct',
  'meta-llama/Llama-4-Scout-17B-16E-Instruct',
  'meta-llama/Llama-4-Maverick-17B-128E-Instruct',
])

app.get('/api/tokenizer/:org/:repo', async (context) => {
  const { org, repo } = context.req.param()
  const fullName = `${org}/${repo}`

  if (!ALLOWED_HF_REPOS.has(fullName)) {
    return context.json({ error: `Repository ${fullName} is not in the allowed list.` }, 403 as ContentfulStatusCode)
  }

  const url = `https://huggingface.co/${fullName}/resolve/main/tokenizer.json`
  const cached = HF_TOKENIZER_CACHE.get(url)
  if (cached && Date.now() - cached.fetchedAt < HF_CACHE_TTL) {
    return context.json(cached.data)
  }

  try {
    const response = await fetch(url)
    if (!response.ok) {
      return context.json(
        { error: `Failed to fetch tokenizer: ${response.status}` },
        response.status as ContentfulStatusCode,
      )
    }
    const data = await response.json()
    HF_TOKENIZER_CACHE.set(url, { data, fetchedAt: Date.now() })
    return context.json(data)
  } catch (error) {
    return context.json(
      { error: `Network error fetching tokenizer: ${error instanceof Error ? error.message : 'Unknown'}` },
      502 as ContentfulStatusCode,
    )
  }
})

const distPath = join(process.cwd(), 'dist')
if (existsSync(distPath)) {
  app.use('/*', serveStatic({ root: distPath }))
  app.get('*', serveStatic({ path: join(distPath, 'index.html') }))
}

if (process.env.NODE_ENV !== 'test') {
  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`Token counter API listening on http://localhost:${info.port}`)
  })
}

export { app }
