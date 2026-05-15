<script setup lang="ts">
import type { ModelConfig } from '../types/domain'

defineProps<{
  models: ModelConfig[]
}>()

const selected = defineModel<string[]>({ required: true })
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
    <el-checkbox-group v-model="selected" class="model-grid">
      <label v-for="model in models" :key="model.id" class="model-option">
        <el-checkbox :value="model.id">
          <span class="model-name">{{ model.displayName }}</span>
          <span class="model-meta">{{ model.provider }} · {{ model.contextWindow?.toLocaleString() ?? '未知' }}</span>
        </el-checkbox>
      </label>
    </el-checkbox-group>
  </section>
</template>
