import { countApproxTokens } from '../core/tokenizers/approxTokenizer'
import { countTextTokens, type SupportedEncoding } from '../core/tokenizers/openaiTokenizer'
import { models } from '../core/models/modelRegistry'

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

self.onmessage = (event: MessageEvent<TokenizerWorkerRequest>) => {
  const { requestId, text, modelIds } = event.data
  const results: Record<string, number> = {}
  const errors: Record<string, string> = {}

  for (const modelId of modelIds) {
    const model = models.find((item) => item.id === modelId)
    if (!model) {
      errors[modelId] = 'Unknown model'
      continue
    }

    try {
      const encoding = model.tokenizer?.encoding as SupportedEncoding | undefined
      if (encoding) {
        results[modelId] = countTextTokens(text, encoding)
      } else {
        results[modelId] = countApproxTokens(text)
      }
    } catch (error) {
      errors[modelId] = error instanceof Error ? error.message : 'Tokenizer failed'
      results[modelId] = countApproxTokens(text)
    }
  }

  const response: TokenizerWorkerResponse = { requestId, results, errors }
  self.postMessage(response)
}
