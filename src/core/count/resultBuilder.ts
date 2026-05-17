import { calculateCost } from '../cost/costCalculator'
import { resolveModelPricing } from '../pricing/pricingProfiles'
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
    warnings.push('Mistral publishes official tokenization through mistral-common; this app currently uses a local tokenizer/approximation and does not apply the full Mistral message template.')
  }

  if (model.provider === 'deepseek') {
    warnings.push(model.accuracy.text === 'local_exact'
      ? 'DeepSeek text count uses the mapped Hugging Face tokenizer file; hosted aliases can still differ from API usage when the vendor changes the served model.'
      : 'DeepSeek hosted alias is counted with a mapped/local tokenizer estimate; check API usage for the billable count.')
  }

  if (model.provider === 'alibaba') {
    warnings.push(model.accuracy.text === 'local_exact'
      ? 'Qwen open model text count uses the mapped Hugging Face tokenizer file; chat template/tool overhead is not fully modeled.'
      : 'Qwen hosted model is counted with a family tokenizer estimate; official DashScope usage may differ.')
  }

  if (model.provider === 'zhipu') {
    warnings.push('GLM officially provides /tokenizer endpoint; currently no Z.AI API Key configured, showing local approximation.')
  }

  if (model.provider === 'xiaomi') {
    warnings.push(model.accuracy.text === 'local_exact'
      ? 'MiMo open checkpoint text count uses the mapped Hugging Face tokenizer file.'
      : 'MiMo hosted/newer model is counted with a local approximation until a matching tokenizer or official count endpoint is integrated.')
  }

  if (model.provider === 'meta') {
    warnings.push('Llama tokenizer files are model-license governed and may require gated access; this app marks local counts as estimates unless exact assets are available.')
  }

  if (model.provider === 'xai') {
    warnings.push('xAI Grok series has no public tokenizer file, currently using local approximation.')
  }

  if (model.provider === 'cohere') {
    warnings.push('Cohere provides an official Tokenize API, but this app has not integrated it yet; local counts are approximate.')
  }

  if (model.provider === 'baidu') {
    warnings.push(model.accuracy.text === 'local_exact'
      ? 'Baidu documents ERNIE tokenizer.json usage for local counts; complex chat/tools still require applying the model chat template.'
      : 'Baidu ERNIE count is approximate until the matching tokenizer files or official calculator are configured.')
  }

  if (model.provider === 'bytedance') {
    warnings.push('Volcano Ark provides a Token Calculator, but this app has not integrated it yet; Doubao local counts are approximate.')
  }

  if (model.provider === 'moonshot') {
    warnings.push('Moonshot/Kimi provides an estimate-token-count API, but this app has not integrated it yet; local counts are approximate.')
  }

  if (model.provider === 'stepfun') {
    warnings.push('StepFun provides a token/count API, but this app has not integrated it yet; local counts are approximate.')
  }

  if (model.provider === 'minimax') {
    warnings.push('MiniMax returns billable usage through hosted APIs/plans; local tokenizer counts are approximate.')
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
    cachedInputTokens: options.cachedInputTokens,
    cacheCreationTokens: options.cacheCreationTokens,
    costMultiplier: options.costMultiplier,
    pricingProfile: options.pricingProfile,
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
      ...(input.images.length > 0 ? ['Official API returns total input tokens, image/text split is locally estimated.'] : []),
    ],
    debug: estimatedImage.debug,
    overrideInputTokens: inputTokens,
    cachedInputTokens: options.cachedInputTokens,
    cacheCreationTokens: options.cacheCreationTokens,
    costMultiplier: options.costMultiplier,
    pricingProfile: options.pricingProfile,
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
    warnings.push('This model does not declare image input support, image tokens are counted as 0.')
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
      warnings.push('Gemini image tokens are currently estimated by local rules; configure GEMINI_API_KEY to use official countTokens.')
    } else if (model.vision?.type === 'qwen_vl_tile') {
      const result = countQwenVlImageTokensEstimate(image.width, image.height, {
        minPixels: model.vision.baseTokens,
        maxPixels: model.vision.patchBudget,
      })
      tokens += result.tokens
      debug = result.debug
      warnings.push('Qwen-VL image tokens are estimated based on DashScope/OpenAI-compatible pixel budget rules; actual usage may vary.')
    } else if (model.vision?.type === 'official_only') {
      warnings.push('This model requires official API for image counting; no local image estimation without API Key.')
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
  cachedInputTokens,
  cacheCreationTokens,
  costMultiplier,
  pricingProfile,
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
  cachedInputTokens: number
  cacheCreationTokens: number
  costMultiplier: number
  pricingProfile: CountOptions['pricingProfile']
}): TokenCountResult {
  const inputTokens = overrideInputTokens ?? textTokens + imageTokens
  const pricing = resolveModelPricing(model, pricingProfile)
  const cost = calculateCost({
    inputTokens,
    estimatedOutputTokens,
    inputPer1M: pricing.inputPer1M,
    outputPer1M: pricing.outputPer1M,
    cachedInputPer1M: pricing.cachedInputPer1M,
    cacheCreationInputPer1M: pricing.cacheCreationInputPer1M,
    cachedInputTokens,
    cacheCreationTokens,
    costMultiplier,
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
    currency: pricing.currency,
    pricing,
    cacheCreationTokens,
    costMultiplier,
    contextWindow: model.contextWindow,
    contextUsage: model.contextWindow ? inputTokens / model.contextWindow : undefined,
    accuracy,
    method,
    licenseRef: model.licenseRef,
    warnings,
    debug,
    status: 'complete' as const,
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
