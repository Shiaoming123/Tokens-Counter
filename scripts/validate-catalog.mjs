import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const models = readJson('src/data/models.json')
const pricing = readJson('src/data/model-pricing.json')
const licenses = readJson('src/data/licenses.json')

const errors = []
const warnings = []

const licenseIds = new Set(licenses.map((item) => item.id))
const modelIds = new Set()

for (const model of models) {
  if (!model.id) errors.push('Model entry is missing id.')
  if (modelIds.has(model.id)) errors.push(`Duplicate model id: ${model.id}`)
  modelIds.add(model.id)

  for (const field of ['displayName', 'provider', 'supportsText', 'textCountMethod', 'pricing', 'accuracy', 'licenseRef']) {
    if (model[field] === undefined) errors.push(`${model.id} is missing ${field}.`)
  }

  if (!licenseIds.has(model.licenseRef)) {
    errors.push(`${model.id} references missing licenseRef: ${model.licenseRef}`)
  }

  const effectivePricing = pricing[model.id] ?? model.pricing
  validatePricing(model.pricing, `${model.id}.pricing`)
  validatePricing(effectivePricing, `${model.id}.effectivePricing`)

  if (model.supportsImage && model.imageCountMethod === 'unsupported') {
    errors.push(`${model.id} supports images but imageCountMethod is unsupported.`)
  }

  if (!model.supportsImage && model.imageCountMethod && model.imageCountMethod !== 'unsupported') {
    errors.push(`${model.id} does not support images but imageCountMethod is ${model.imageCountMethod}.`)
  }

  if (model.accuracy?.text === 'local_exact' && model.tokenizer?.type === 'approx') {
    errors.push(`${model.id} is local_exact but uses approx tokenizer.`)
  }

  if (!effectivePricing.source && !effectivePricing.lastUpdated) {
    warnings.push(`${model.id} effective pricing has no source or lastUpdated.`)
  }
}

for (const [modelId, price] of Object.entries(pricing)) {
  if (!modelIds.has(modelId)) {
    errors.push(`model-pricing.json contains unknown model id: ${modelId}`)
  }
  validatePricing(price, `model-pricing.${modelId}`)
}

if (warnings.length) {
  console.warn(`warning: ${warnings.length} catalog entries have no pricing source or lastUpdated.`)
  for (const warning of warnings.slice(0, 10)) {
    console.warn(`warning: ${warning}`)
  }
  if (warnings.length > 10) {
    console.warn(`warning: ${warnings.length - 10} additional pricing-source warnings omitted.`)
  }
}

if (errors.length) {
  console.error(errors.map((error) => `error: ${error}`).join('\n'))
  process.exit(1)
}

console.log(`Catalog OK: ${models.length} models, ${Object.keys(pricing).length} pricing overrides, ${licenses.length} license notices.`)

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), 'utf8'))
}

function validatePricing(value, label) {
  if (!value || typeof value !== 'object') {
    errors.push(`${label} must be an object.`)
    return
  }

  if (!value.currency) errors.push(`${label} is missing currency.`)
  for (const field of ['inputPer1M', 'outputPer1M']) {
    if (typeof value[field] !== 'number' || value[field] < 0) {
      errors.push(`${label}.${field} must be a non-negative number.`)
    }
  }

  for (const field of ['cachedInputPer1M', 'cacheCreationInputPer1M']) {
    if (value[field] !== undefined && (typeof value[field] !== 'number' || value[field] < 0)) {
      errors.push(`${label}.${field} must be a non-negative number when present.`)
    }
  }
}
