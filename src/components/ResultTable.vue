<script setup lang="ts">
import { formatCost } from '../core/cost/costCalculator'
import type { TokenCountResult } from '../types/domain'
import AccuracyBadge from './AccuracyBadge.vue'

defineProps<{
  results: TokenCountResult[]
  loading: boolean
}>()

function percent(value?: number) {
  if (value === undefined) return '—'
  return `${Math.min(value * 100, 999).toFixed(2)}%`
}
</script>

<template>
  <section class="panel results-panel">
    <div class="section-head">
      <div>
        <p class="eyebrow">Results</p>
        <h2>多模型对比</h2>
      </div>
      <el-tag v-if="loading" type="info">计算中</el-tag>
    </div>

    <el-table :data="results" stripe height="460" empty-text="输入文本或图片后点击计算">
      <el-table-column prop="displayName" label="模型" min-width="170" fixed />
      <el-table-column prop="provider" label="厂商" width="100" />
      <el-table-column prop="textTokens" label="文本 Tokens" width="120" align="right" />
      <el-table-column prop="imageTokens" label="图片 Tokens" width="120" align="right" />
      <el-table-column prop="inputTokens" label="总输入" width="110" align="right" />
      <el-table-column prop="estimatedOutputTokens" label="预估输出" width="110" align="right" />
      <el-table-column label="上下文" width="110" align="right">
        <template #default="{ row }">
          {{ percent(row.contextUsage) }}
        </template>
      </el-table-column>
      <el-table-column label="费用" width="130" align="right">
        <template #default="{ row }">
          {{ formatCost(row.totalCost, row.currency) }}
        </template>
      </el-table-column>
      <el-table-column label="准确度" width="120">
        <template #default="{ row }">
          <AccuracyBadge :level="row.accuracy" />
        </template>
      </el-table-column>
      <el-table-column prop="method" label="计数方式" min-width="150" />
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="debug-block">
            <div>
              <strong>费用拆分</strong>
              <p>
                Input {{ formatCost(row.inputCost, row.currency) }} · Cache read
                {{ formatCost(row.cacheReadCost, row.currency) }} · Cache write
                {{ formatCost(row.cacheCreationCost, row.currency) }} · Output
                {{ formatCost(row.outputCost, row.currency) }}
              </p>
              <p>
                Billable input {{ row.billableInputTokens.toLocaleString() }} · Cache read
                {{ row.cacheReadTokens.toLocaleString() }} · Cache write
                {{ row.cacheCreationTokens.toLocaleString() }} · Multiplier ×{{ row.costMultiplier }}
              </p>
            </div>
            <div v-if="row.debug">
              <strong>图片 debug</strong>
              <p>
                原图 {{ row.debug.imageWidth ?? '—' }}×{{ row.debug.imageHeight ?? '—' }} · 缩放
                {{ row.debug.resizedWidth ?? '—' }}×{{ row.debug.resizedHeight ?? '—' }} · tiles
                {{ row.debug.tiles ?? '—' }} · patches {{ row.debug.patches ?? '—' }}
              </p>
              <p>{{ row.debug.formula }}</p>
            </div>
            <div v-if="row.warnings.length">
              <strong>备注</strong>
              <p v-for="warning in row.warnings" :key="warning">{{ warning }}</p>
            </div>
            <div>
              <strong>License Ref</strong>
              <p>{{ row.licenseRef }}</p>
            </div>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </section>
</template>
