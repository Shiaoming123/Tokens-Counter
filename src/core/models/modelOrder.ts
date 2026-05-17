import type { ModelConfig, Provider } from '../../types/domain'

export const MODEL_ORDER_STORAGE_KEY = 'tokenCounter.modelOrder.v1'

export type ModelOrderByProvider = Partial<Record<Provider, string[]>>

function uniqueKnownIds(ids: string[] | undefined, knownIds: Set<string>) {
  if (!ids) return []

  const seen = new Set<string>()
  return ids.filter((id) => {
    if (!knownIds.has(id) || seen.has(id)) return false
    seen.add(id)
    return true
  })
}

export function normalizeModelOrder(
  models: ModelConfig[],
  savedOrder: ModelOrderByProvider = {},
): ModelOrderByProvider {
  const providers = new Set(models.map((model) => model.provider))

  return [...providers].reduce<ModelOrderByProvider>((order, provider) => {
    const providerIds = models
      .filter((model) => model.provider === provider)
      .map((model) => model.id)
    const knownIds = new Set(providerIds)
    order[provider] = [
      ...uniqueKnownIds(savedOrder[provider], knownIds),
      ...providerIds.filter((id) => !savedOrder[provider]?.includes(id)),
    ]
    return order
  }, {})
}

export function applyModelOrder(
  models: ModelConfig[],
  savedOrder: ModelOrderByProvider = {},
): ModelConfig[] {
  const normalized = normalizeModelOrder(models, savedOrder)
  const rankByProvider = new Map<Provider, Map<string, number>>()

  for (const [provider, ids] of Object.entries(normalized) as [Provider, string[]][]) {
    rankByProvider.set(provider, new Map(ids.map((id, index) => [id, index])))
  }

  return [...models].sort((a, b) => {
    if (a.provider !== b.provider) return 0
    const rank = rankByProvider.get(a.provider)
    return (rank?.get(a.id) ?? 0) - (rank?.get(b.id) ?? 0)
  })
}

export function moveModelWithinProvider(
  models: ModelConfig[],
  draggedModelId: string,
  targetModelId: string,
): ModelOrderByProvider | undefined {
  if (draggedModelId === targetModelId) return undefined

  const draggedModel = models.find((model) => model.id === draggedModelId)
  const targetModel = models.find((model) => model.id === targetModelId)
  if (!draggedModel || !targetModel || draggedModel.provider !== targetModel.provider) {
    return undefined
  }

  const providerModels = models.filter((model) => model.provider === draggedModel.provider)
  const providerIds = providerModels.map((model) => model.id)
  const fromIndex = providerIds.indexOf(draggedModelId)
  const toIndex = providerIds.indexOf(targetModelId)
  if (fromIndex < 0 || toIndex < 0) return undefined

  const nextIds = [...providerIds]
  const [draggedId] = nextIds.splice(fromIndex, 1)
  nextIds.splice(toIndex, 0, draggedId)

  return { [draggedModel.provider]: nextIds }
}

export function loadModelOrder(storage: Storage | undefined = globalThis.localStorage) {
  if (!storage) return {}

  try {
    const raw = storage.getItem(MODEL_ORDER_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as ModelOrderByProvider) : {}
  } catch {
    return {}
  }
}

export function saveModelOrder(
  order: ModelOrderByProvider,
  storage: Storage | undefined = globalThis.localStorage,
) {
  if (!storage) return

  try {
    storage.setItem(MODEL_ORDER_STORAGE_KEY, JSON.stringify(order))
  } catch {
    // Storage can be unavailable in private modes; ordering should remain usable in memory.
  }
}
