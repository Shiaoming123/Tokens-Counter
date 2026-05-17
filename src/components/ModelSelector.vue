<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ChevronDown, GripVertical, RotateCcw } from 'lucide-vue-next'
import { providerAccents, providerLabels, providerOrder } from '../core/models/providerLabels'
import { accuracyLabels, accuracyShortLabels } from '../core/accuracy/accuracyLevel'
import {
  applyModelOrder,
  loadModelOrder,
  moveModelWithinProvider,
  normalizeModelOrder,
  saveModelOrder,
  type ModelOrderByProvider,
} from '../core/models/modelOrder'
import { useLocaleStore } from '../stores/locale'
import type { ModelConfig } from '../types/domain'
import ProviderLogo from './ProviderLogo.vue'

const localeStore = useLocaleStore()

const props = defineProps<{
  models: ModelConfig[]
  hasImageInput?: boolean
}>()

const selected = defineModel<string[]>({ required: true })

const searchQuery = ref('')

const collapsedGroups = ref(new Set<string>())
const modelOrder = ref<ModelOrderByProvider>(loadModelOrder())
const draggedModelId = ref<string | null>(null)
const dropTargetModelId = ref<string | null>(null)

function toggleGroup(provider: string) {
  const next = new Set(collapsedGroups.value)
  if (next.has(provider)) {
    next.delete(provider)
  } else {
    next.add(provider)
  }
  collapsedGroups.value = next
}

const orderedModels = computed(() => applyModelOrder(props.models, modelOrder.value))

const groupedModels = computed(() =>
  providerOrder
    .map((provider) => ({
      id: provider,
      label: providerLabels[provider],
      accent: providerAccents[provider],
      models: orderedModels.value.filter((model) => model.provider === provider),
    }))
    .filter((group) => group.models.length > 0),
)

const filteredProviders = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return groupedModels.value
  return groupedModels.value
    .map((group) => ({
      ...group,
      models: group.models.filter(
        (model) =>
          model.displayName.toLowerCase().includes(query) ||
          group.label.toLowerCase().includes(query),
      ),
    }))
    .filter((group) => group.models.length > 0)
})

function isSelected(modelId: string): boolean {
  return selected.value.includes(modelId)
}

function toggle(modelId: string) {
  if (isModelDisabled(modelId)) return

  if (isSelected(modelId)) {
    selected.value = selected.value.filter((id) => id !== modelId)
  } else {
    selected.value = [...selected.value, modelId]
  }
}

function selectedCount(group: { models: ModelConfig[] }): number {
  const selectedIds = new Set(selected.value)
  return group.models.filter((m) => selectedIds.has(m.id)).length
}

function selectAll() {
  selected.value = props.models.filter((model) => !isModelDisabled(model.id)).map((model) => model.id)
}

function clearAll() {
  selected.value = []
}

function startDrag(event: DragEvent, modelId: string) {
  draggedModelId.value = modelId
  event.dataTransfer?.setData('text/plain', modelId)
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function handleDragOver(event: DragEvent, targetModelId: string) {
  if (!draggedModelId.value || draggedModelId.value === targetModelId) return

  const draggedModel = orderedModels.value.find((model) => model.id === draggedModelId.value)
  const targetModel = orderedModels.value.find((model) => model.id === targetModelId)
  if (!draggedModel || !targetModel || draggedModel.provider !== targetModel.provider) return

  event.preventDefault()
  dropTargetModelId.value = targetModelId
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

function finishDrop(targetModelId: string) {
  if (!draggedModelId.value) return

  const movedOrder = moveModelWithinProvider(
    orderedModels.value,
    draggedModelId.value,
    targetModelId,
  )
  if (movedOrder) {
    modelOrder.value = normalizeModelOrder(props.models, {
      ...modelOrder.value,
      ...movedOrder,
    })
    saveModelOrder(modelOrder.value)
  }

  draggedModelId.value = null
  dropTargetModelId.value = null
}

function endDrag() {
  draggedModelId.value = null
  dropTargetModelId.value = null
}

function resetOrder() {
  modelOrder.value = {}
  saveModelOrder(modelOrder.value)
}

function isModelDisabled(modelId: string): boolean {
  const model = props.models.find((item) => item.id === modelId)
  return Boolean(props.hasImageInput && model && !model.supportsImage)
}

function disabledReason(model: ModelConfig) {
  if (props.hasImageInput && !model.supportsImage) {
    return localeStore.t('models.imageUnsupported')
  }
  return ''
}

watch(
  () => [props.hasImageInput, props.models] as const,
  () => {
    if (!props.hasImageInput) return
    const imageCapableIds = new Set(props.models.filter((model) => model.supportsImage).map((model) => model.id))
    selected.value = selected.value.filter((modelId) => imageCapableIds.has(modelId))
  },
  { immediate: true },
)
</script>

<template>
  <div class="model-sidebar">
    <div class="model-sidebar-top">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="localeStore.t('models.search')"
        class="model-search"
      />
      <div class="model-sidebar-actions">
        <button class="tiny-text-button" @click="selectAll">{{ localeStore.t('models.selectAll') }}</button>
        <button class="tiny-text-button" @click="clearAll">{{ localeStore.t('models.clear') }}</button>
        <button
          class="tiny-icon-button"
          type="button"
          :title="localeStore.t('models.resetOrder')"
          :aria-label="localeStore.t('models.resetOrder')"
          @click="resetOrder"
        >
          <RotateCcw :size="13" />
        </button>
      </div>
      <div v-if="hasImageInput" class="capability-filter-note" role="status">
        {{ localeStore.t('models.imageOnlyMode') }}
      </div>
    </div>

    <div class="model-sidebar-list">
      <div
        v-for="provider in filteredProviders"
        :key="provider.id"
        class="provider-group"
      >
        <button
          class="provider-head"
          :aria-expanded="!collapsedGroups.has(provider.id)"
          :aria-label="`${provider.label}, ${selectedCount(provider)} selected of ${provider.models.length}`"
          @click="toggleGroup(provider.id)"
        >
          <ProviderLogo :provider="provider.id" :size="22" />
          <span class="provider-name" :title="provider.label">{{ provider.label }}</span>
          <span class="provider-count" aria-live="polite">
            {{ selectedCount(provider) }}/{{ provider.models.length }}
          </span>
          <ChevronDown
            :size="14"
            class="chevron"
            :class="{ collapsed: collapsedGroups.has(provider.id) }"
          />
        </button>

      <div
        v-show="!collapsedGroups.has(provider.id)"
        class="provider-models"
      >
        <label
          v-for="model in provider.models"
          :key="model.id"
          class="model-option"
          :title="disabledReason(model) || `${model.displayName} (${provider.label}, ${model.tokenizer?.type ?? 'unknown'})`"
          :class="{
            selected: isSelected(model.id),
            disabled: isModelDisabled(model.id),
            dragging: draggedModelId === model.id,
            'drop-target': dropTargetModelId === model.id,
          }"
          @dragover="handleDragOver($event, model.id)"
          @dragleave="dropTargetModelId = null"
          @drop.prevent="finishDrop(model.id)"
        >
          <button
            class="drag-handle"
            type="button"
            draggable="true"
            :disabled="isModelDisabled(model.id)"
            :title="localeStore.t('models.dragHandle')"
            :aria-label="localeStore.t('models.dragHandle')"
            @click.stop.prevent
            @mousedown.stop
            @dragstart.stop="startDrag($event, model.id)"
            @dragend="endDrag"
          >
            <GripVertical :size="14" />
          </button>
          <input
            type="checkbox"
            :checked="isSelected(model.id)"
            :disabled="isModelDisabled(model.id)"
            :aria-label="model.displayName"
            class="model-checkbox"
            @change="toggle(model.id)"
          />
          <ProviderLogo class="model-provider-logo" :provider="model.provider" :size="20" />
          <div class="model-info">
            <span class="model-name" :title="model.displayName">{{ model.displayName }}</span>
            <span class="model-meta">
              {{ provider.label }} · {{ model.tokenizer?.type ?? 'unknown' }}
            </span>
          </div>
          <span
            v-if="model.accuracy?.text"
            class="model-badge"
            :class="model.accuracy.text"
            :title="accuracyLabels[model.accuracy.text]"
          >
            {{ accuracyShortLabels[model.accuracy.text] }}
          </span>
        </label>
      </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ---- Sidebar Container ---- */

.model-sidebar {
  position: sticky;
  top: 68px;
  max-height: calc(100vh - 84px);
  overflow: hidden;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--bg-panel);
  box-shadow: var(--shadow-md);
}

/* ---- Top Bar ---- */

.model-sidebar-top {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 14px 10px;
  border-bottom: 1px solid var(--line);
  background: var(--bg-elevated);
  z-index: 2;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
}

.model-sidebar-list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

.model-search {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--bg-elevated);
  color: var(--text);
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s;
}

.model-search::placeholder {
  color: var(--muted);
}

.model-search:focus {
  border-color: var(--accent);
}

.model-sidebar-actions {
  display: flex;
  gap: 4px;
}

.capability-filter-note {
  padding: 7px 9px;
  border: 1px solid rgba(0, 122, 255, 0.18);
  border-radius: 10px;
  background: rgba(0, 122, 255, 0.08);
  color: var(--text-secondary);
  font-size: 11px;
  line-height: 1.35;
}

.tiny-text-button {
  flex: 1;
  height: 28px;
  border: 1px solid var(--line);
  border-radius: var(--radius-xs);
  background: transparent;
  color: var(--muted);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.tiny-text-button:hover {
  color: var(--accent);
  border-color: rgba(99, 102, 241, 0.2);
  background: rgba(99, 102, 241, 0.04);
}

.tiny-text-button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}

.tiny-icon-button {
  display: inline-grid;
  place-items: center;
  width: 30px;
  height: 28px;
  border: 1px solid var(--line);
  border-radius: var(--radius-xs);
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  flex-shrink: 0;
}

.tiny-icon-button:hover {
  color: var(--accent);
  border-color: rgba(99, 102, 241, 0.2);
  background: rgba(99, 102, 241, 0.04);
}

.tiny-icon-button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}

/* ---- Provider Accordion ---- */

.provider-group {
  display: flex;
  flex-direction: column;
}

.provider-head {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 0;
  background: var(--bg-elevated);
  cursor: pointer;
  position: sticky;
  top: 0;
  z-index: 3;
  transition: background 0.15s;
  text-align: left;
  box-shadow: 0 1px 0 var(--line);
}

.provider-head:hover {
  background: rgba(99, 102, 241, 0.03);
}

.provider-head:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}

.provider-mark {
  display: inline-grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 5px;
  color: color-mix(in srgb, var(--provider-accent), #0f172a 15%);
  background: color-mix(in srgb, var(--provider-accent), white 88%);
  font-size: 10px;
  font-weight: 800;
  flex-shrink: 0;
}

.provider-name {
  min-width: 0;
  flex: 1 1 auto;
  font-size: 12px;
  font-weight: 660;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.provider-count {
  margin-left: auto;
  color: var(--muted);
  font-size: 11px;
  flex-shrink: 0;
}

.chevron {
  flex-shrink: 0;
  color: var(--muted);
  opacity: 0.5;
  transition: transform 0.2s ease;
}

.chevron.collapsed {
  transform: rotate(-90deg);
}

/* ---- Accordion Content ---- */

.provider-models {
  display: flex;
  flex-direction: column;
}

/* ---- Model Rows ---- */

.model-option {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 54px;
  height: auto;
  padding: 8px 12px 8px 14px;
  border-left: 2px solid transparent;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.model-option:hover {
  background: rgba(99, 102, 241, 0.03);
}

.model-option.selected {
  border-left-color: var(--accent);
  background: rgba(99, 102, 241, 0.05);
}

.model-option.disabled {
  cursor: not-allowed;
  opacity: 0.44;
  filter: grayscale(0.25);
}

.model-option.disabled:hover {
  background: transparent;
}

.model-option.dragging {
  opacity: 0.55;
}

.model-option.drop-target {
  box-shadow: inset 0 2px 0 var(--accent);
}

.drag-handle {
  display: inline-grid;
  place-items: center;
  flex: 0 0 22px;
  width: 20px;
  height: 28px;
  border: 0;
  border-radius: var(--radius-xs);
  background: transparent;
  color: var(--muted);
  cursor: grab;
}

.drag-handle:hover,
.drag-handle:focus-visible {
  color: var(--accent);
  background: rgba(99, 102, 241, 0.06);
  outline: none;
}

.drag-handle:active {
  cursor: grabbing;
}

.model-checkbox {
  flex: 0 0 16px;
  width: 16px;
  height: 16px;
  accent-color: var(--accent);
  cursor: pointer;
}

.model-provider-logo {
  flex: 0 0 20px;
}

.model-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1 1 auto;
}

.model-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  line-height: 1.28;
  display: -webkit-box;
  white-space: normal;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.model-meta {
  font-size: 11px;
  color: var(--muted);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---- Accuracy Badge ---- */

.model-badge {
  flex: 0 0 62px;
  min-width: 62px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.4;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.model-badge.official_exact,
.model-badge.official_estimate {
  color: #065f46;
  background: rgba(16, 185, 129, 0.12);
}

.model-badge.local_exact {
  color: #1e40af;
  background: rgba(99, 102, 241, 0.12);
}

.model-badge.local_estimate {
  color: #92400e;
  background: rgba(245, 158, 11, 0.12);
}

.model-badge.unsupported {
  color: #991b1b;
  background: rgba(239, 68, 68, 0.12);
}

/* ---- Responsive ---- */

@media (max-width: 768px) {
  .model-sidebar {
    position: static;
    max-height: none;
  }

  .model-sidebar-list {
    overflow: visible;
  }

  .model-option {
    min-height: 56px;
  }
}
</style>
