import { describe, expect, it } from 'vitest'
import { getHfRepoForModel } from '../src/core/tokenizers/tokenizerLoader'
import { getModelById, getPricingByModelId, licenses, models } from '../src/core/models/modelRegistry'

describe('model registry', () => {
  it('includes GPT-5.5 with supported catalog fields and official pricing', () => {
    const model = getModelById('gpt-5.5')
    const pricing = getPricingByModelId('gpt-5.5')

    expect(model?.displayName).toBe('GPT-5.5')
    expect(model?.provider).toBe('openai')
    expect(model?.supportsImage).toBe(true)
    expect(model?.contextWindow).toBe(1_050_000)
    expect(pricing).toMatchObject({
      inputPer1M: 5,
      cachedInputPer1M: 0.5,
      outputPer1M: 30,
      currency: 'USD',
    })
  })

  it('keeps local exact Hugging Face tokenizer claims backed by an explicit repo mapping', () => {
    const hfTokenizerTypes = new Set(['deepseek', 'qwen', 'mimo', 'mistral', 'llama', 'huggingface'])
    const exactModels = models.filter(
      (model) =>
        model.accuracy.text === 'local_exact' &&
        model.tokenizer?.type &&
        hfTokenizerTypes.has(model.tokenizer.type),
    )

    expect(exactModels.length).toBeGreaterThan(0)
    for (const model of exactModels) {
      expect(getHfRepoForModel(model.id), `${model.id} should map to an approved tokenizer repo`).toBeTruthy()
    }
  })

  it('does not label approximate tokenizers as local exact', () => {
    const approximateModels = models.filter((model) => model.tokenizer?.type === 'approx')

    expect(approximateModels.length).toBeGreaterThan(0)
    for (const model of approximateModels) {
      expect(model.accuracy.text, `${model.id} uses the approximate tokenizer`).toBe('local_estimate')
    }
  })

  it('has a license notice for every catalog license reference', () => {
    const licenseIds = new Set(licenses.map((license) => license.id))

    for (const model of models) {
      expect(licenseIds.has(model.licenseRef), `${model.id} references ${model.licenseRef}`).toBe(true)
    }
  })
})
