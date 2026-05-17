import type { CountInput, TokenCountResult } from '../../types/domain'

export interface OfficialCountRequest {
  modelId: string
  input: CountInput
}

export async function countOpenaiOfficial(request: OfficialCountRequest) {
  return postOfficial('/api/count/openai', request)
}

export async function countAnthropicOfficial(request: OfficialCountRequest) {
  return postOfficial('/api/count/anthropic', request)
}

export async function countGeminiOfficial(request: OfficialCountRequest) {
  return postOfficial('/api/count/gemini', request)
}

export async function countZaiOfficial(request: OfficialCountRequest) {
  return postOfficial('/api/count/zai', request)
}

async function postOfficial(url: string, request: OfficialCountRequest) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => undefined)) as { error?: string } | undefined
    throw new Error(errorBody?.error ?? `Request failed: ${response.status}`)
  }

  return (await response.json()) as Pick<TokenCountResult, 'inputTokens' | 'accuracy' | 'method' | 'warnings'>
}
