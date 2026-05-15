<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Calculator, Copy, Download, RotateCcw, Scale, Trash2 } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import TextInputPanel from './components/TextInputPanel.vue'
import ImageUploadPanel from './components/ImageUploadPanel.vue'
import ModelSelector from './components/ModelSelector.vue'
import ResultTable from './components/ResultTable.vue'
import LicenseNotice from './components/LicenseNotice.vue'
import { countAnthropicOfficial, countGeminiOfficial, countZaiOfficial } from './core/api/countApi'
import {
  buildLocalResult,
  buildOfficialResult,
  buildUnsupportedOfficialResult,
} from './core/count/resultBuilder'
import { formatCost } from './core/cost/costCalculator'
import {
  createHistoryEntry,
  loadHistory,
  resultsToCsv,
  resultsToMarkdown,
  saveHistory,
  type HistoryEntry,
} from './core/history/historyStorage'
import { getLatestPricingUpdate, licenses, models } from './core/models/modelRegistry'
import { countLocalTextTokens } from './core/tokenizers/tokenizerClient'
import type { CountInput, CountOptions, ImageMetadata, ModelConfig, TokenCountResult } from './types/domain'

const text = ref('你好，世界。\n\nHello world from AI Token 点钞机。')
const images = ref<ImageMetadata[]>([])
const selectedModelIds = ref([
  'gpt-4o',
  'gpt-5',
  'deepseek-v4-flash',
  'qwen-plus',
  'glm-4.5-air',
  'mimo-v2.5',
  'claude-sonnet-4.5',
  'gemini-2.5-flash',
])
const defaultOptions: CountOptions = {
  openaiDetail: 'high',
  estimatedOutputTokens: 1000,
  cachedInputTokens: 0,
  cacheCreationTokens: 0,
  costMultiplier: 1,
  useOfficialApi: true,
}
const options = ref<CountOptions>({ ...defaultOptions })
const results = ref<TokenCountResult[]>([])
const history = ref<HistoryEntry[]>([])
const loading = ref(false)
const route = ref(window.location.pathname)

const selectedModels = computed(() => models.filter((model) => selectedModelIds.value.includes(model.id)))
const latestPricingUpdate = computed(() => getLatestPricingUpdate())
const totalInputTokens = computed(() => results.value.reduce((sum, item) => sum + item.inputTokens, 0))
const cheapest = computed(() => [...results.value].sort((a, b) => a.totalCost - b.totalCost).at(0))
const highestInput = computed(() => [...results.value].sort((a, b) => b.inputTokens - a.inputTokens).at(0))

onMounted(() => {
  history.value = loadHistory()
  window.addEventListener('popstate', () => {
    route.value = window.location.pathname
  })
})

async function calculate() {
  if (!text.value.trim() && images.value.length === 0) {
    ElMessage.warning('先输入文本或上传图片')
    return
  }

  loading.value = true
  try {
    const input: CountInput = { text: text.value, images: images.value }
    const textTokensByModel = await countLocalTextTokens(
      input.text,
      selectedModels.value.map((model) => model.id),
    )

    const nextResults = await Promise.all(
      selectedModels.value.map((model) => calculateForModel(model, input, textTokensByModel)),
    )

    results.value = nextResults
    const entry = createHistoryEntry(input, options.value, nextResults)
    history.value = [entry, ...history.value].slice(0, 20)
    saveHistory(history.value)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '计算失败')
  } finally {
    loading.value = false
  }
}

async function calculateForModel(
  model: ModelConfig,
  input: CountInput,
  textTokensByModel: Record<string, number>,
) {
  if (model.provider === 'anthropic') {
    if (!options.value.useOfficialApi) {
      return buildUnsupportedOfficialResult(model, input, options.value, 'Claude 需要官方 count_tokens API 精确计数。', textTokensByModel)
    }

    try {
      const official = await countAnthropicOfficial({ modelId: model.id, input })
      return buildOfficialResult(model, input, options.value, official, textTokensByModel)
    } catch (error) {
      return buildUnsupportedOfficialResult(
        model,
        input,
        options.value,
        error instanceof Error ? error.message : 'Claude 官方计数失败',
        textTokensByModel,
      )
    }
  }

  if (model.provider === 'google' && options.value.useOfficialApi) {
    try {
      const official = await countGeminiOfficial({ modelId: model.id, input })
      return buildOfficialResult(model, input, options.value, official, textTokensByModel)
    } catch (error) {
      const fallback = buildLocalResult(model, input, options.value, textTokensByModel)
      return {
        ...fallback,
        warnings: [
          error instanceof Error ? error.message : 'Gemini 官方计数失败',
          '已回退到本地文本近似 + 图片规则估算。',
          ...fallback.warnings,
        ],
      }
    }
  }

  if (model.provider === 'zhipu' && options.value.useOfficialApi) {
    try {
      const official = await countZaiOfficial({ modelId: model.id, input })
      return buildOfficialResult(model, input, options.value, official, textTokensByModel)
    } catch (error) {
      const fallback = buildLocalResult(model, input, options.value, textTokensByModel)
      return {
        ...fallback,
        warnings: [
          error instanceof Error ? error.message : 'Z.AI 官方 tokenizer 失败',
          '已回退到本地近似。配置 ZAI_API_KEY 后可走官方 /tokenizer。',
          ...fallback.warnings,
        ],
      }
    }
  }

  return buildLocalResult(model, input, options.value, textTokensByModel)
}

function navigate(path: string) {
  window.history.pushState({}, '', path)
  route.value = path
}

async function copyMarkdown() {
  if (!results.value.length) return
  await navigator.clipboard.writeText(resultsToMarkdown(results.value))
  ElMessage.success('已复制 Markdown 表格')
}

function exportCsv() {
  if (!results.value.length) return
  const blob = new Blob([resultsToCsv(results.value)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `token-count-${new Date().toISOString().slice(0, 10)}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}

function clearHistory() {
  history.value = []
  saveHistory([])
}

function restoreHistory(entry: HistoryEntry) {
  options.value = { ...defaultOptions, ...entry.options }
  results.value = entry.results
}
</script>

<template>
  <main>
    <header class="app-header">
      <button class="brand" @click="navigate('/')">
        <Scale :size="22" />
        <span>AI Token 点钞机</span>
      </button>
      <nav>
        <button :class="{ active: route === '/' }" @click="navigate('/')">工作台</button>
        <button :class="{ active: route === '/licenses' }" @click="navigate('/licenses')">许可证</button>
      </nav>
    </header>

    <LicenseNotice v-if="route === '/licenses'" :licenses="licenses" />

    <div v-else class="workspace">
      <section class="top-strip">
        <div>
          <p class="eyebrow">Multi-model Token Counter</p>
          <h1>文本、图片、官方计数 API 与成本估算，一张表跑完。</h1>
        </div>
        <div class="top-meta">
          <span>价格更新时间 {{ latestPricingUpdate }}</span>
          <span>历史默认仅 LocalStorage</span>
        </div>
      </section>

      <section class="overview">
        <div>
          <span>总输入 Tokens</span>
          <strong>{{ totalInputTokens.toLocaleString() }}</strong>
        </div>
        <div>
          <span>最低预估费用</span>
          <strong>{{ cheapest ? formatCost(cheapest.totalCost, cheapest.currency) : '$0.000000' }}</strong>
        </div>
        <div>
          <span>最高输入模型</span>
          <strong>{{ highestInput?.displayName ?? '—' }}</strong>
        </div>
      </section>

      <div class="app-grid">
        <aside class="left-rail">
          <TextInputPanel v-model="text" />
          <ImageUploadPanel v-model="images" />
          <ModelSelector v-model="selectedModelIds" :models="models" />

          <section class="panel controls-panel">
            <div class="section-head">
              <div>
                <p class="eyebrow">Options</p>
                <h2>估算参数</h2>
              </div>
            </div>
            <label class="control-line">
              <span>OpenAI 图片 detail</span>
              <el-segmented v-model="options.openaiDetail" :options="['low', 'high', 'auto']" />
            </label>
            <label class="control-line">
              <span>预估输出 Tokens</span>
              <el-input-number v-model="options.estimatedOutputTokens" :min="0" :step="250" :max="200000" />
            </label>
            <label class="control-line">
              <span>官方计数 API</span>
              <el-switch v-model="options.useOfficialApi" />
            </label>
            <div class="cost-grid">
              <label>
                <span>缓存命中 Tokens</span>
                <el-input-number v-model="options.cachedInputTokens" :min="0" :step="1000" :max="10000000" />
              </label>
              <label>
                <span>缓存写入 Tokens</span>
                <el-input-number v-model="options.cacheCreationTokens" :min="0" :step="1000" :max="10000000" />
              </label>
              <label>
                <span>成本倍率</span>
                <el-input-number v-model="options.costMultiplier" :min="0" :step="0.1" :max="100" />
              </label>
            </div>
            <button class="primary-action" :disabled="loading" @click="calculate">
              <Calculator :size="18" />
              <span>{{ loading ? '计算中...' : '开始点钞' }}</span>
            </button>
          </section>
        </aside>

        <section class="right-stage">
          <div class="table-actions">
            <button class="ghost-button" :disabled="!results.length" @click="copyMarkdown">
              <Copy :size="16" />
              <span>复制 Markdown</span>
            </button>
            <button class="ghost-button" :disabled="!results.length" @click="exportCsv">
              <Download :size="16" />
              <span>导出 CSV</span>
            </button>
          </div>
          <ResultTable :results="results" :loading="loading" />

          <section class="panel history-panel">
            <div class="section-head">
              <div>
                <p class="eyebrow">History</p>
                <h2>最近 20 次</h2>
              </div>
              <button class="icon-button" title="清空历史" @click="clearHistory">
                <Trash2 :size="16" />
              </button>
            </div>
            <div v-if="history.length === 0" class="empty-zone">暂无历史记录</div>
            <div v-else class="history-list">
              <button v-for="entry in history" :key="entry.id" class="history-item" @click="restoreHistory(entry)">
                <RotateCcw :size="15" />
                <span>{{ new Date(entry.createdAt).toLocaleString() }}</span>
                <strong>{{ entry.textPreview }}</strong>
                <em>{{ entry.results.length }} models · {{ entry.imageCount }} images</em>
              </button>
            </div>
          </section>

          <p class="disclaimer">
            Token 和费用为估算值。闭源模型、多模态输入、工具调用、PDF、缓存和系统优化 token 可能导致实际 API usage
            与本工具结果存在差异。商业使用前请核对模型厂商官方文档、价格页和许可证。
          </p>
        </section>
      </div>
    </div>
  </main>
</template>
