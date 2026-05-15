<script setup lang="ts">
import { computed } from 'vue'
import { CheckSquare, Square } from 'lucide-vue-next'
import { providerAccents, providerLabels, providerMarks, providerOrder } from '../core/models/providerLabels'
import type { ModelConfig } from '../types/domain'

const props = defineProps<{
  models: ModelConfig[]
}>()

const selected = defineModel<string[]>({ required: true })

const groupedModels = computed(() =>
  providerOrder
    .map((provider) => ({
      provider,
      label: providerLabels[provider],
      mark: providerMarks[provider],
      accent: providerAccents[provider],
      models: props.models.filter((model) => model.provider === provider),
    }))
    .filter((group) => group.models.length > 0),
)

function selectProvider(modelIds: string[]) {
  selected.value = Array.from(new Set([...selected.value, ...modelIds]))
}

function clearProvider(modelIds: string[]) {
  const ids = new Set(modelIds)
  selected.value = selected.value.filter((id) => !ids.has(id))
}

function providerSelectedCount(modelIds: string[]) {
  const selectedIds = new Set(selected.value)
  return modelIds.filter((id) => selectedIds.has(id)).length
}
</script>

<template>
  <section class="panel">
    <div class="section-head">
      <div>
        <p class="eyebrow">Models</p>
        <h2>模型选择</h2>
      </div>
      <span class="muted">{{ selected.length }} selected</span>
    </div>
    <el-checkbox-group v-model="selected" class="provider-stack">
      <section v-for="group in groupedModels" :key="group.provider" class="provider-group">
        <div class="provider-head" :style="{ '--provider-accent': group.accent }">
          <div>
            <span class="provider-mark">{{ group.mark }}</span>
            <strong>{{ group.label }}</strong>
            <span>{{ providerSelectedCount(group.models.map((model) => model.id)) }}/{{ group.models.length }}</span>
          </div>
          <div class="provider-actions">
            <button
              type="button"
              class="tiny-icon-button"
              title="选择该厂商全部模型"
              @click="selectProvider(group.models.map((model) => model.id))"
            >
              <CheckSquare :size="14" />
            </button>
            <button
              type="button"
              class="tiny-icon-button"
              title="清空该厂商模型"
              @click="clearProvider(group.models.map((model) => model.id))"
            >
              <Square :size="14" />
            </button>
          </div>
        </div>
        <div class="model-grid">
          <label v-for="model in group.models" :key="model.id" class="model-option" :style="{ '--provider-accent': group.accent }">
            <el-checkbox :value="model.id">
              <span class="model-name">{{ model.displayName }}</span>
              <span class="model-meta">
                {{ model.family }} · {{ model.contextWindow?.toLocaleString() ?? '未知' }}
                <span v-if="model.supportsImage"> · Vision</span>
              </span>
            </el-checkbox>
          </label>
        </div>
      </section>
    </el-checkbox-group>
  </section>
</template>
