import { calculateCost } from '../cost/costCalculator'
import { countApproxTokens } from '../tokenizers/approxTokenizer'
import { countGeminiImageTokensEstimate } from '../vision/geminiImageTokens'
import { countQwenVlImageTokensEstimate } from '../vision/qwenImageTokens'
import { countOpenAIPatchImageTokens, countOpenAITileImageTokens } from '../vision/openaiImageTokens'
import type {
  AccuracyLevel,
  CountInput,
  CountOptions,
  ModelConfig,
  TokenCountMethod,
  TokenCountResult,
  TokenDebug,
} from '../../types/domain'

export interface OfficialCountPayload {
  inputTokens?: number
  accuracy?: AccuracyLevel
  method?: TokenCountMethod
  warnings?: string[]
}

export function buildLocalResult(
  model: ModelConfig,
  input: CountInput,
  options: CountOptions,
  textTokensByModel: Record<string, number>,
): TokenCountResult {
  const warnings: string[] = []
  let method: TokenCountMethod = model.textCountMethod
  let accuracy = model.accuracy.text

  const textTokens =
    textTokensByModel[model.id] ?? (input.text ? countApproxTokens(input.text) : 0)

  const imageResult = countImagesForModel(model, input, options)
  warnings.push(...imageResult.warnings)

  if (imageResult.tokens > 0) {
    method = model.imageCountMethod ?? method
    accuracy = mergeAccuracy(accuracy, model.accuracy.image ?? accuracy)
  }

  if (model.provider === 'mistral') {
    warnings.push('Mistral v1 使用本地 fallback tokenizer，接入官方 tokenizer 前请视为近似。')
  }

  if (model.provider === 'deepseek') {
    warnings.push('DeepSeek 官方提供离线 tokenizer 包；当前浏览器端先使用本地近似，后续可接入 deepseek_tokenizer.zip 或 Hugging Face tokenizer 文件。')
  }

  if (model.provider === 'alibaba') {
    warnings.push('Qwen 开源模型使用 byte-level BPE/tiktoken 路线；当前浏览器端未加载模型专属 tokenizer 文件，计数标为近似。')
  }

  if (model.provider === 'zhipu') {
    warnings.push('GLM 官方提供 /tokenizer 接口；当前前端未配置 Z.AI API Key，先显示本地近似。')
  }

  if (model.provider === 'xiaomi') {
    warnings.push('MiMo 可从官方平台、Hugging Face/ModelScope 获取模型与 tokenizer 资源；当前浏览器端未加载模型专属 tokenizer，计数标为近似。')
  }

  if (model.provider === 'meta') {
    warnings.push('Llama tokenizer 和模型权重受 Meta Llama Community License 约束，商用前请核对具体模型许可证。')
  }

  return finalizeResult({
    model,
    textTokens,
    imageTokens: imageResult.tokens,
    estimatedOutputTokens: options.estimatedOutputTokens,
    accuracy,
    method,
    warnings,
    debug: imageResult.debug,
  })
}

export function buildOfficialResult(
  model: ModelConfig,
  input: CountInput,
  options: CountOptions,
  official: OfficialCountPayload,
  textTokensByModel: Record<string, number>,
): TokenCountResult {
  const inputTokens = official.inputTokens ?? 0
  const estimatedImage = countImagesForModel(model, input, options)
  const localTextEstimate = textTokensByModel[model.id] ?? countApproxTokens(input.text)
  const imageTokens = input.images.length > 0 ? Math.max(inputTokens - localTextEstimate, 0) : 0
  const textTokens = input.images.length > 0 ? Math.min(localTextEstimate, inputTokens) : inputTokens

  return finalizeResult({
    model,
    textTokens,
    imageTokens,
    estimatedOutputTokens: options.estimatedOutputTokens,
    accuracy: official.accuracy ?? model.accuracy.text,
    method: official.method ?? 'official_count_api',
    warnings: [
      ...(official.warnings ?? []),
      ...(input.images.length > 0 ? ['官方 API 返回总 input tokens，图片/文本拆分为本地辅助估算。'] : []),
    ],
    debug: estimatedImage.debug,
    overrideInputTokens: inputTokens,
  })
}

export function buildUnsupportedOfficialResult(
  model: ModelConfig,
  input: CountInput,
  options: CountOptions,
  warning: string,
  textTokensByModel: Record<string, number>,
) {
  const local = buildLocalResult(model, input, options, textTokensByModel)
  return {
    ...local,
    accuracy: 'unsupported' as const,
    method: 'official_count_api' as const,
    warnings: [warning, ...local.warnings],
  }
}

function countImagesForModel(model: ModelConfig, input: CountInput, options: CountOptions) {
  let tokens = 0
  let debug: TokenDebug | undefined
  const warnings: string[] = []

  if (input.images.length === 0) return { tokens, debug, warnings }

  if (!model.supportsImage) {
    warnings.push('该模型未声明支持图片输入，图片 tokens 记为 0。')
    return { tokens, debug, warnings }
  }

  for (const image of input.images) {
    if (model.vision?.type === 'openai_tile') {
      const result = countOpenAITileImageTokens(image.width, image.height, options.openaiDetail, {
        baseTokens: model.vision.baseTokens ?? 85,
        tileTokens: model.vision.tileTokens ?? 170,
      })
      tokens += result.tokens
      debug = result.debug
    } else if (model.vision?.type === 'openai_patch') {
      const result = countOpenAIPatchImageTokens(image.width, image.height, {
        patchSize: 32,
        patchBudget: model.vision.patchBudget ?? 1536,
        multiplier: model.vision.multiplier ?? 1,
      })
      tokens += result.tokens
      debug = result.debug
    } else if (model.vision?.type === 'gemini_tile') {
      const result = countGeminiImageTokensEstimate(image.width, image.height)
      tokens += result.tokens
      debug = result.debug
      warnings.push('Gemini 图片 tokens 当前为本地规则估算；配置 GEMINI_API_KEY 可走官方 countTokens。')
    } else if (model.vision?.type === 'qwen_vl_tile') {
      const result = countQwenVlImageTokensEstimate(image.width, image.height, {
        minPixels: model.vision.baseTokens,
        maxPixels: model.vision.patchBudget,
      })
      tokens += result.tokens
      debug = result.debug
      warnings.push('Qwen-VL 图片 tokens 基于百炼/OpenAI 兼容接口的像素预算规则估算；实际以 API usage 为准。')
    } else if (model.vision?.type === 'official_only') {
      warnings.push('该模型图片计数需要官方 API；无 API Key 时不做本地图片公式。')
    }
  }

  return { tokens, debug, warnings }
}

function finalizeResult({
  model,
  textTokens,
  imageTokens,
  estimatedOutputTokens,
  accuracy,
  method,
  warnings,
  debug,
  overrideInputTokens,
}: {
  model: ModelConfig
  textTokens: number
  imageTokens: number
  estimatedOutputTokens: number
  accuracy: AccuracyLevel
  method: TokenCountMethod
  warnings: string[]
  debug?: TokenDebug
  overrideInputTokens?: number
}): TokenCountResult {
  const inputTokens = overrideInputTokens ?? textTokens + imageTokens
  const cost = calculateCost({
    inputTokens,
    estimatedOutputTokens,
    inputPer1M: model.pricing.inputPer1M,
    outputPer1M: model.pricing.outputPer1M,
  })

  return {
    modelId: model.id,
    displayName: model.displayName,
    provider: model.provider,
    textTokens,
    imageTokens,
    inputTokens,
    estimatedOutputTokens,
    totalTokens: inputTokens + estimatedOutputTokens,
    ...cost,
    currency: model.pricing.currency,
    contextWindow: model.contextWindow,
    contextUsage: model.contextWindow ? inputTokens / model.contextWindow : undefined,
    accuracy,
    method,
    licenseRef: model.licenseRef,
    warnings,
    debug,
  }
}

function mergeAccuracy(text: AccuracyLevel, image: AccuracyLevel): AccuracyLevel {
  const rank: Record<AccuracyLevel, number> = {
    official_exact: 4,
    official_estimate: 3,
    local_exact: 2,
    local_estimate: 1,
    unsupported: 0,
  }

  return rank[image] < rank[text] ? image : text
}
