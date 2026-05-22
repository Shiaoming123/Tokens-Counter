import pricingProfilesJson from '../../data/pricing-profiles.json' with { type: 'json' }
import type { ModelConfig, ModelPricing, PricingProfileId } from '../../types/domain.js'

type PricingProfileConfig = {
  label: string
  source: string
  models: Record<string, ModelPricing>
}

const pricingProfiles = pricingProfilesJson as Record<PricingProfileId, PricingProfileConfig>

export const pricingProfileIds = Object.keys(pricingProfiles) as PricingProfileId[]

export function getPricingProfile(profileId?: PricingProfileId) {
  return pricingProfiles[profileId ?? 'official'] ?? pricingProfiles.official
}

export function getPricingProfileOptions() {
  return pricingProfileIds.map((id) => ({
    id,
    label: pricingProfiles[id].label,
    source: pricingProfiles[id].source,
  }))
}

export function resolveModelPricing(model: ModelConfig, profileId?: PricingProfileId): ModelPricing {
  if (!profileId || profileId === 'official') return model.pricing
  return pricingProfiles[profileId]?.models[model.id] ?? model.pricing
}

export function getProfilePricingByModelId(modelId: string, profileId?: PricingProfileId) {
  return getPricingProfile(profileId).models[modelId]
}
