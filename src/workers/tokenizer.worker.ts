import { countApproxTokens } from '../core/tokenizers/approxTokenizer.js'
import { countHfTokens, loadHfTokenizer } from '../core/tokenizers/huggingfaceTokenizer.js'
import { getHfRepoForModel, loadTokenizerConfig } from '../core/tokenizers/tokenizerLoader.js'
import { models } from '../core/models/modelRegistry.js'

export interface TokenizerWorkerRequest {
  requestId: string
  text: string
  modelIds: string[]
}

export interface TokenizerWorkerResponse {
  requestId: string
  results: Record<string, number>
  errors: Record<string, string>
}

const HF_TOKENIZER_TYPES = new Set(['deepseek', 'qwen', 'mimo', 'mistral', 'llama', 'huggingface'])

async function countForModel(modelId: string, text: string): Promise<number> {
  const model = models.find((item) => item.id === modelId)
  if (!model) throw new Error('Unknown model')

  const tokenizerType = model.tokenizer?.type

  if (tokenizerType && HF_TOKENIZER_TYPES.has(tokenizerType)) {
    const repo = getHfRepoForModel(modelId)
    if (repo) {
      const config = await loadTokenizerConfig(repo)
      const tokenizer = await loadHfTokenizer(config)
      return countHfTokens(text, tokenizer)
    }
  }

  return countApproxTokens(text)
}

self.onmessage = async (event: MessageEvent<TokenizerWorkerRequest>) => {
  const { requestId, text, modelIds } = event.data
  const results: Record<string, number> = {}
  const errors: Record<string, string> = {}

  const entries = await Promise.allSettled(
    modelIds.map(async (modelId) => {
      const count = await countForModel(modelId, text)
      return { modelId, count }
    }),
  )

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    const modelId = modelIds[i]
    if (entry.status === 'fulfilled') {
      results[modelId] = entry.value.count
    } else {
      errors[modelId] = entry.reason instanceof Error ? entry.reason.message : 'Tokenizer failed'
      results[modelId] = countApproxTokens(text)
    }
  }

  const response: TokenizerWorkerResponse = { requestId, results, errors }
  self.postMessage(response)
}
