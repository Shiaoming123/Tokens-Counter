import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  countAnthropicOfficial,
  countCohereOfficial,
  countGeminiOfficial,
  countMoonshotOfficial,
  countOpenaiOfficial,
  countStepFunOfficial,
  countZaiOfficial,
} from '../core/api/countApi.js'
import {
  buildLocalResult,
  buildOfficialResult,
  buildUnsupportedOfficialResult,
} from '../core/count/resultBuilder.js'
import { createHistoryEntry } from '../core/history/historyStorage.js'
import { getLatestPricingUpdate, models } from '../core/models/modelRegistry.js'
import { countLocalTextTokens } from '../core/tokenizers/tokenizerClient.js'
import { useHistoryStore } from './history.js'
import { useLocaleStore } from './locale.js'
import { useCurrencyStore } from './currency.js'
import { convertToUSD } from '../core/cost/costCalculator.js'
import { serializeToolsForCounting } from '../core/tools/toolTokenEstimator.js'
import type { CountInput, CountOptions, DocumentMetadata, ImageMetadata, Message, ModelConfig, TokenCountResult, ToolDefinition } from '../types/domain.js'

const DEFAULT_OPTIONS: CountOptions = {
  openaiDetail: 'high',
  estimatedOutputTokens: 1000,
  cachedInputTokens: 0,
  cacheCreationTokens: 0,
  costMultiplier: 1,
  useOfficialApi: true,
  pricingProfile: 'official',
}

const DEFAULT_SELECTED_IDS = [
  'gpt-4o',
  'gpt-5',
  'deepseek-v4-flash',
  'qwen-plus',
  'glm-4.5-air',
  'mimo-v2.5',
  'claude-sonnet-4.5',
  'gemini-2.5-flash',
]

function createPendingResult(model: ModelConfig, status: 'loading' | 'error'): TokenCountResult {
  const localeStore = useLocaleStore()
  return {
    modelId: model.id,
    displayName: model.displayName,
    provider: model.provider,
    textTokens: 0,
    imageTokens: 0,
    inputTokens: 0,
    estimatedOutputTokens: 0,
    totalTokens: 0,
    inputCost: 0,
    outputCost: 0,
    cacheReadCost: 0,
    cacheCreationCost: 0,
    totalCost: 0,
    currency: 'USD',
    billableInputTokens: 0,
    cacheReadTokens: 0,
    cacheCreationTokens: 0,
    costMultiplier: 1,
    accuracy: 'local_estimate',
    method: 'pending',
    licenseRef: '',
    warnings: status === 'error' ? [localeStore.t('error.calculationFailed')] : [],
    status,
  }
}

export const useCounterStore = defineStore('counter', () => {
  const text = ref('Hello, World.\n\nHello world from AI Token Counter.')
  const images = ref<ImageMetadata[]>([])
  const documents = ref<DocumentMetadata[]>([])
  const tools = ref<ToolDefinition[]>([])
  const inputMode = ref<'text' | 'messages'>('text')
  const messages = ref<Message[]>([
    { role: 'system', content: '' },
    { role: 'user', content: '' },
  ])
  const selectedModelIds = ref([...DEFAULT_SELECTED_IDS])
  const options = ref<CountOptions>({ ...DEFAULT_OPTIONS })
  const results = ref<TokenCountResult[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const selectedModels = computed(() =>
    models.filter((model) => selectedModelIds.value.includes(model.id)),
  )

  const totalInputTokens = computed(() =>
    results.value.reduce((sum, item) => sum + item.inputTokens, 0),
  )

  const cheapest = computed(() =>
    [...results.value].sort((a, b) => (a.normalizedCostUSD ?? a.totalCost) - (b.normalizedCostUSD ?? b.totalCost)).at(0),
  )

  const highestInput = computed(() =>
    [...results.value].sort((a, b) => b.inputTokens - a.inputTokens).at(0),
  )

  const latestPricingUpdate = computed(() => getLatestPricingUpdate())

  function buildInput(): CountInput {
    const docText = documents.value.map((d) => d.text).join('\n')
    const toolText = tools.value.length > 0 ? serializeToolsForCounting(tools.value) : ''

    if (inputMode.value === 'messages') {
      const validMessages = messages.value.filter((m) => m.content.trim())
      const combinedText = [validMessages.map((m) => m.content).join('\n'), docText, toolText]
        .filter(Boolean)
        .join('\n')
      return { text: combinedText, images: images.value, documents: documents.value, tools: tools.value, messages: validMessages }
    }

    const combinedText = [text.value, docText, toolText].filter(Boolean).join('\n')
    return { text: combinedText, images: images.value, documents: documents.value, tools: tools.value }
  }

  function clearError() {
    if (error.value) error.value = null
  }

  async function calculate() {
    const localeStore = useLocaleStore()
    error.value = null

    if (selectedModelIds.value.length === 0) {
      const msg = localeStore.t('error.selectModel')
      error.value = msg
      ElMessage.warning(msg)
      return
    }

    const input = buildInput()
    if (!input.text.trim() && images.value.length === 0 && documents.value.length === 0 && !input.messages?.length) {
      const msg = localeStore.t('error.enterInput')
      error.value = msg
      ElMessage.warning(msg)
      return
    }

    if (images.value.length > 0) {
      const imageCapableIds = new Set(models.filter((model) => model.supportsImage).map((model) => model.id))
      const compatibleSelection = selectedModelIds.value.filter((modelId) => imageCapableIds.has(modelId))
      if (compatibleSelection.length !== selectedModelIds.value.length) {
        selectedModelIds.value = compatibleSelection
        ElMessage.info(localeStore.t('models.imageUnsupportedRemoved'))
      }

      if (selectedModelIds.value.length === 0) {
        const msg = localeStore.t('models.noImageModelsSelected')
        error.value = msg
        ElMessage.warning(msg)
        return
      }
    }

    loading.value = true
    try {
      const textTokensByModel = await countLocalTextTokens(
        input.text,
        selectedModels.value.map((model) => model.id),
      )

      results.value = selectedModels.value.map((model) => createPendingResult(model, 'loading'))

      const settled = await Promise.allSettled(
        selectedModels.value.map(async (model, index) => {
          const result = await calculateForModel(model, input, textTokensByModel)
          results.value = results.value.map((r, i) => (i === index ? result : r))
          return result
        }),
      )

      const nextResults = settled.map((r, i) =>
        r.status === 'fulfilled'
          ? r.value
          : createPendingResult(selectedModels.value[i], 'error'),
      )

      const currencyStore = useCurrencyStore()
      for (const result of nextResults) {
        result.normalizedCostUSD = convertToUSD(result.totalCost, result.currency, currencyStore.exchangeRates)
      }
      results.value = nextResults

      const failedCount = settled.filter((r) => r.status === 'rejected').length
      if (failedCount > 0) {
        error.value = `${failedCount} ${localeStore.t('error.modelsFailed')}`
      }

      const historyStore = useHistoryStore()
      const entry = createHistoryEntry(input, options.value, nextResults)
      historyStore.prependEntry(entry)
    } catch (err) {
      const msg = err instanceof Error ? err.message : localeStore.t('error.calculationFailed')
      error.value = msg
      ElMessage.error(msg)
    } finally {
      loading.value = false
    }
  }

  async function calculateForModel(
    model: ModelConfig,
    input: CountInput,
    textTokensByModel: Record<string, number>,
  ): Promise<TokenCountResult> {
    if (model.provider === 'anthropic') {
      if (!options.value.useOfficialApi) {
        return buildUnsupportedOfficialResult(
          model,
          input,
          options.value,
          'Claude requires the official count_tokens API for accurate counting.',
          textTokensByModel,
        )
      }

      try {
        const official = await countAnthropicOfficial({ modelId: model.id, input })
        return buildOfficialResult(model, input, options.value, official, textTokensByModel)
      } catch (error) {
        return buildUnsupportedOfficialResult(
          model,
          input,
          options.value,
          error instanceof Error ? error.message : 'Claude official counting failed',
          textTokensByModel,
        )
      }
    }

    if (model.provider === 'openai' && options.value.useOfficialApi) {
      try {
        const official = await countOpenaiOfficial({ modelId: model.id, input })
        return buildOfficialResult(model, input, options.value, official, textTokensByModel)
      } catch (error) {
        const fallback = buildLocalResult(model, input, options.value, textTokensByModel)
        return {
          ...fallback,
          warnings: [
            error instanceof Error ? error.message : 'OpenAI official counting failed',
            'Fell back to local tiktoken approximation.',
            ...fallback.warnings,
          ],
        }
      }
    }

    if (model.provider === 'google' && options.value.useOfficialApi) {
      try {
        const official = await countGeminiOfficial({ modelId: model.id, input })
        return buildOfficialResult(model, input, options.value, official, textTokensByModel)
      } catch (error) {
        const fallback = buildLocalResult(model, input, options.value, textTokensByModel)
        return {
          ...fallback,
          warnings: [
            error instanceof Error ? error.message : 'Gemini official counting failed',
            'Fell back to local text approximation + image rule estimation.',
            ...fallback.warnings,
          ],
        }
      }
    }

    if (model.provider === 'zhipu' && options.value.useOfficialApi) {
      try {
        const official = await countZaiOfficial({ modelId: model.id, input })
        return buildOfficialResult(model, input, options.value, official, textTokensByModel)
      } catch (error) {
        const fallback = buildLocalResult(model, input, options.value, textTokensByModel)
        return {
          ...fallback,
          warnings: [
            error instanceof Error ? error.message : 'Z.AI official tokenizer failed',
            'Fell back to local approximation. Configure ZAI_API_KEY to use official /tokenizer.',
            ...fallback.warnings,
          ],
        }
      }
    }

    if (model.provider === 'cohere' && options.value.useOfficialApi) {
      try {
        const official = await countCohereOfficial({ modelId: model.id, input })
        return buildOfficialResult(model, input, options.value, official, textTokensByModel)
      } catch (error) {
        const fallback = buildLocalResult(model, input, options.value, textTokensByModel)
        return {
          ...fallback,
          warnings: [
            error instanceof Error ? error.message : 'Cohere official tokenize failed',
            'Fell back to local approximation. Configure COHERE_API_KEY to use official /v1/tokenize.',
            ...fallback.warnings,
          ],
        }
      }
    }

    if (model.provider === 'moonshot' && options.value.useOfficialApi) {
      try {
        const official = await countMoonshotOfficial({ modelId: model.id, input })
        return buildOfficialResult(model, input, options.value, official, textTokensByModel)
      } catch (error) {
        const fallback = buildLocalResult(model, input, options.value, textTokensByModel)
        return {
          ...fallback,
          warnings: [
            error instanceof Error ? error.message : 'Moonshot/Kimi official estimate failed',
            'Fell back to local approximation. Configure MOONSHOT_API_KEY to use estimate-token-count.',
            ...fallback.warnings,
          ],
        }
      }
    }

    if (model.provider === 'stepfun' && options.value.useOfficialApi) {
      try {
        const official = await countStepFunOfficial({ modelId: model.id, input })
        return buildOfficialResult(model, input, options.value, official, textTokensByModel)
      } catch (error) {
        const fallback = buildLocalResult(model, input, options.value, textTokensByModel)
        return {
          ...fallback,
          warnings: [
            error instanceof Error ? error.message : 'StepFun official token count failed',
            'Fell back to local approximation. Configure STEPFUN_API_KEY to use /v1/token/count.',
            ...fallback.warnings,
          ],
        }
      }
    }

    return buildLocalResult(model, input, options.value, textTokensByModel)
  }

  function resetOptions() {
    options.value = { ...DEFAULT_OPTIONS }
  }

  return {
    text,
    images,
    documents,
    tools,
    inputMode,
    messages,
    selectedModelIds,
    options,
    results,
    loading,
    error,
    clearError,
    selectedModels,
    totalInputTokens,
    cheapest,
    highestInput,
    latestPricingUpdate,
    calculate,
    resetOptions,
  }
})
