import modelsJson from '../../data/models.json' with { type: 'json' }
import pricingJson from '../../data/model-pricing.json' with { type: 'json' }
import licensesJson from '../../data/licenses.json' with { type: 'json' }
import { getProfilePricingByModelId } from '../pricing/pricingProfiles.js'
import type { LicenseNotice, ModelConfig, ModelPricing } from '../../types/domain.js'
import type { PricingProfileId } from '../../types/domain.js'

type PricingMap = Record<string, ModelPricing>

const pricing = pricingJson as PricingMap

export const models = (modelsJson as ModelConfig[]).map((model) => ({
  ...model,
  pricing: pricing[model.id] ?? model.pricing,
}))

export const licenses = licensesJson as LicenseNotice[]

export function getModelById(modelId: string) {
  return models.find((model) => model.id === modelId)
}

export function getPricingByModelId(modelId: string, profileId?: PricingProfileId) {
  return getProfilePricingByModelId(modelId, profileId) ?? pricing[modelId]
}

export function getLicenseById(licenseId: string) {
  return licenses.find((license) => license.id === licenseId)
}

export function getLatestPricingUpdate() {
  const dates = Object.values(pricing)
    .map((item) => item.lastUpdated)
    .filter((date): date is string => Boolean(date))

  dates.sort()
  return dates[dates.length - 1] ?? 'Unknown'
}
