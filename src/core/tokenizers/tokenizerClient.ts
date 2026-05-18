import type { TokenizerWorkerRequest, TokenizerWorkerResponse } from '../../workers/tokenizer.worker.js'
import { countTextTokens, type SupportedEncoding } from './openaiTokenizer.js'
import { models } from '../models/modelRegistry.js'

let worker: Worker | undefined

export function countLocalTextTokens(text: string, modelIds: string[]) {
  const tiktokenModels: { id: string; encoding: SupportedEncoding }[] = []
  const workerModelIds: string[] = []

  for (const id of modelIds) {
    const model = models.find((m) => m.id === id)
    if (model?.tokenizer?.type === 'tiktoken' && model.tokenizer.encoding) {
      tiktokenModels.push({ id, encoding: model.tokenizer.encoding as SupportedEncoding })
    } else {
      workerModelIds.push(id)
    }
  }

  const tiktokenPromise =
    tiktokenModels.length > 0
      ? countTiktokenBatch(text, tiktokenModels)
      : Promise.resolve<Record<string, number>>({})

  const workerPromise =
    workerModelIds.length > 0
      ? typeof Worker === 'undefined'
        ? countServerHfBatch(text, workerModelIds)
        : countWorkerBatch(text, workerModelIds)
      : Promise.resolve<Record<string, number>>({})

  return Promise.all([tiktokenPromise, workerPromise]).then(([a, b]) => ({ ...a, ...b }))
}

async function countTiktokenBatch(
  text: string,
  models: { id: string; encoding: SupportedEncoding }[],
): Promise<Record<string, number>> {
  const results: Record<string, number> = {}
  for (const { id, encoding } of models) {
    results[id] = await countTextTokens(text, encoding)
  }
  return results
}

function countWorkerBatch(text: string, modelIds: string[]) {
  worker ??= new Worker(new URL('../../workers/tokenizer.worker.ts', import.meta.url), { type: 'module' })
  const activeWorker = worker
  const requestId = crypto.randomUUID()

  return new Promise<Record<string, number>>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup()
      reject(new Error('Tokenizer worker timed out'))
    }, 12_000)

    const handleMessage = (event: MessageEvent<TokenizerWorkerResponse>) => {
      if (event.data.requestId !== requestId) return
      cleanup()
      resolve(event.data.results)
    }

    const cleanup = () => {
      window.clearTimeout(timeout)
      activeWorker.removeEventListener('message', handleMessage)
    }

    activeWorker.addEventListener('message', handleMessage)
    const message: TokenizerWorkerRequest = { requestId, text, modelIds }
    activeWorker.postMessage(message)
  })
}

async function countServerHfBatch(text: string, modelIds: string[]) {
  const [{ getHfRepoForModel, loadTokenizerConfig }, { countHfTokens, loadHfTokenizer }] =
    await Promise.all([
      import('./tokenizerLoader.js'),
      import('./huggingfaceTokenizer.js'),
    ])

  const results: Record<string, number> = {}
  await Promise.all(
    modelIds.map(async (modelId) => {
      const repo = getHfRepoForModel(modelId)
      if (!repo) return

      const config = await loadTokenizerConfig(repo)
      const tokenizer = await loadHfTokenizer(config)
      results[modelId] = countHfTokens(text, tokenizer)
    }),
  )

  return results
}
