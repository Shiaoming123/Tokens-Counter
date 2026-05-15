import type { TokenizerWorkerRequest, TokenizerWorkerResponse } from '../../workers/tokenizer.worker'

let worker: Worker | undefined

export function countLocalTextTokens(text: string, modelIds: string[]) {
  if (typeof Worker === 'undefined') {
    return Promise.resolve<Record<string, number>>({})
  }

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
