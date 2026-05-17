import { describe, expect, it } from 'vitest'
import {
  applyModelOrder,
  loadModelOrder,
  MODEL_ORDER_STORAGE_KEY,
  moveModelWithinProvider,
  normalizeModelOrder,
  saveModelOrder,
} from '../src/core/models/modelOrder'
import type { ModelConfig } from '../src/types/domain'

const baseModel = {
  family: 'test',
  supportsText: true,
  supportsImage: false,
  textCountMethod: 'local_tokenizer',
  imageCountMethod: 'unsupported',
  pricing: { inputPer1M: 1, outputPer1M: 1, currency: 'USD' },
  accuracy: { text: 'local_estimate', image: 'unsupported' },
  licenseRef: 'test',
} satisfies Omit<ModelConfig, 'id' | 'displayName' | 'provider'>

const models: ModelConfig[] = [
  { ...baseModel, id: 'gpt-4o', displayName: 'GPT-4o', provider: 'openai' },
  { ...baseModel, id: 'gpt-5', displayName: 'GPT-5', provider: 'openai' },
  { ...baseModel, id: 'claude-sonnet', displayName: 'Claude Sonnet', provider: 'anthropic' },
]

class MemoryStorage implements Storage {
  private values = new Map<string, string>()

  get length() {
    return this.values.size
  }

  clear() {
    this.values.clear()
  }

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

describe('model order helpers', () => {
  it('normalizes saved order by dropping unknown ids and appending new models', () => {
    const order = normalizeModelOrder(models, {
      openai: ['missing-model', 'gpt-5'],
    })

    expect(order.openai).toEqual(['gpt-5', 'gpt-4o'])
    expect(order.anthropic).toEqual(['claude-sonnet'])
  })

  it('applies order within a provider without crossing provider groups', () => {
    const ordered = applyModelOrder(models, {
      openai: ['gpt-5', 'gpt-4o'],
    })

    expect(ordered.map((model) => model.id)).toEqual([
      'gpt-5',
      'gpt-4o',
      'claude-sonnet',
    ])
  })

  it('moves a model only within its provider', () => {
    expect(moveModelWithinProvider(models, 'gpt-5', 'gpt-4o')).toEqual({
      openai: ['gpt-5', 'gpt-4o'],
    })
    expect(moveModelWithinProvider(models, 'gpt-5', 'claude-sonnet')).toBeUndefined()
  })

  it('persists order in localStorage-compatible storage', () => {
    const storage = new MemoryStorage()
    saveModelOrder({ openai: ['gpt-5', 'gpt-4o'] }, storage)

    expect(storage.getItem(MODEL_ORDER_STORAGE_KEY)).toBe(
      '{"openai":["gpt-5","gpt-4o"]}',
    )
    expect(loadModelOrder(storage)).toEqual({ openai: ['gpt-5', 'gpt-4o'] })
  })
})
