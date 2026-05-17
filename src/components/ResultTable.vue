<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Copy, Download, Loader2, PanelRightClose, RotateCcw } from 'lucide-vue-next'
import { ElAlert, ElDrawer, ElOption, ElSelect, ElTable, ElTableColumn, ElTag, ElTooltip } from 'element-plus'
import { formatCurrencyValue, convertFromUSD } from '../core/cost/costCalculator'
import { useCurrencyStore, ALL_CURRENCIES } from '../stores/currency'
import { useLocaleStore } from '../stores/locale'
import type { CurrencyCode, TokenCountResult } from '../types/domain'
import AccuracyBadge from './AccuracyBadge.vue'
import ProviderLogo from './ProviderLogo.vue'

const localeStore = useLocaleStore()
const currencyStore = useCurrencyStore()

const props = defineProps<{
  results: TokenCountResult[]
  loading: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  retry: []
  copyMarkdown: []
  exportCsv: []
}>()

const doneCount = computed(() =>
  props.results.filter((r) => r.status !== 'loading').length,
)

const failedResults = computed(() =>
  props.results.filter((r) => r.status === 'error'),
)

const cheapestResult = computed(() => {
  if (!props.results.length) return null
  return props.results.reduce((best, r) =>
    (r.normalizedCostUSD ?? r.totalCost) < (best.normalizedCostUSD ?? best.totalCost) ? r : best
  )
})

const rankedResults = computed(() =>
  [...props.results]
    .filter((r) => r.status === 'complete')
    .sort((a, b) => (a.normalizedCostUSD ?? a.totalCost) - (b.normalizedCostUSD ?? b.totalCost))
    .slice(0, 5)
)

const showFullComparison = ref(false)

// Drawer resize
const drawerWidth = ref(loadDrawerWidth())
const isMobile = ref(window.innerWidth < 768)

function loadDrawerWidth(): number {
  const saved = localStorage.getItem('comparison-drawer-width')
  return saved ? Math.max(400, Math.min(1200, parseInt(saved, 10))) : 600
}

let resizeStartX = 0
let resizeStartWidth = 0

function startDrawerResize(e: PointerEvent) {
  resizeStartX = e.clientX
  resizeStartWidth = drawerWidth.value
  document.addEventListener('pointermove', onDrawerResize)
  document.addEventListener('pointerup', stopDrawerResize)
  e.preventDefault()
}

function onDrawerResize(e: PointerEvent) {
  const delta = resizeStartX - e.clientX
  const newWidth = Math.max(400, Math.min(1200, resizeStartWidth + delta))
  drawerWidth.value = newWidth
}

function stopDrawerResize() {
  localStorage.setItem('comparison-drawer-width', String(drawerWidth.value))
  document.removeEventListener('pointermove', onDrawerResize)
  document.removeEventListener('pointerup', stopDrawerResize)
}

// Summary stats
const avgCost = computed(() => {
  const completeResults = props.results.filter((r) => r.status === 'complete')
  if (!completeResults.length) return '$0.00'
  const totalUsd = completeResults.reduce((sum, r) => sum + (r.normalizedCostUSD ?? r.totalCost), 0)
  const avg = totalUsd / completeResults.length
  return formatCurrencyValue(convertFromUSD(avg, currencyStore.primaryCurrency, currencyStore.exchangeRates), currencyStore.primaryCurrency)
})

function rowClassName({ row }: { row: TokenCountResult }) {
  return row === cheapestResult.value ? 'cheapest-row' : ''
}

function onWindowResize() {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => window.addEventListener('resize', onWindowResize))
onUnmounted(() => window.removeEventListener('resize', onWindowResize))

function shortMethod(method: string) {
  if (method === 'local_tokenizer') return 'local'
  if (method === 'official_count_api') return 'official'
  if (method === 'vision_formula') return 'vision'
  if (method === 'hybrid') return 'hybrid'
  return method
}

const accuracyRank: Record<string, number> = {
  official_exact: 4,
  official_estimate: 3,
  local_exact: 2,
  local_estimate: 1,
  unsupported: 0,
}

function sortByName(a: TokenCountResult, b: TokenCountResult) {
  return a.displayName.localeCompare(b.displayName)
}

function sortByMethod(a: TokenCountResult, b: TokenCountResult) {
  return shortMethod(a.method).localeCompare(shortMethod(b.method))
}

function sortByAccuracy(a: TokenCountResult, b: TokenCountResult) {
  return (accuracyRank[b.accuracy] ?? 0) - (accuracyRank[a.accuracy] ?? 0)
}

function sortByCurrency(_currency: CurrencyCode) {
  return (a: TokenCountResult, b: TokenCountResult) => {
    const aUsd = a.normalizedCostUSD ?? a.totalCost
    const bUsd = b.normalizedCostUSD ?? b.totalCost
    return aUsd - bUsd
  }
}

function formatCostInCurrency(result: TokenCountResult, currency: CurrencyCode): string {
  const usd = result.normalizedCostUSD ?? result.totalCost
  return formatCurrencyValue(convertFromUSD(usd, currency, currencyStore.exchangeRates), currency)
}
</script>

<template>
  <section class="panel results-panel">
    <div class="section-head">
      <div>
        <p class="eyebrow">{{ localeStore.t('results.eyebrow') }}</p>
        <h2>{{ localeStore.t('results.title') }}</h2>
      </div>
      <div class="result-actions">
        <ElTag v-if="loading" type="info" class="pulse-tag">
          <Loader2 :size="12" class="spin" />
          {{ localeStore.t('results.calculating') }}{{ results.length > 0 ? ` (${doneCount}/${results.length})` : '' }}
        </ElTag>
        <ElTooltip :content="localeStore.t('action.copyMarkdown')" placement="top">
          <button class="icon-button" :disabled="!results.length" @click="emit('copyMarkdown')">
            <Copy :size="14" />
          </button>
        </ElTooltip>
        <ElTooltip :content="localeStore.t('action.exportCsv')" placement="top">
          <button class="icon-button" :disabled="!results.length" @click="emit('exportCsv')">
            <Download :size="14" />
          </button>
        </ElTooltip>
      </div>
    </div>

    <ElAlert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      :closable="false"
      class="error-alert"
    >
      <template v-if="failedResults.length" #default>
        <button class="ghost-button retry-button" @click="emit('retry')">
          <RotateCcw :size="14" />
          <span>{{ localeStore.t('results.retryFailed') }} ({{ failedResults.length }})</span>
        </button>
      </template>
    </ElAlert>

    <div v-if="cheapestResult" class="best-result-card">
      <div class="best-label">{{ localeStore.t('results.bestValue') }}</div>
      <div class="best-model-row">
        <ProviderLogo :provider="cheapestResult.provider" :size="26" />
        <div class="best-model">{{ cheapestResult.displayName }}</div>
      </div>
      <div class="best-cost">{{ formatCostInCurrency(cheapestResult, currencyStore.primaryCurrency) }}</div>
      <div class="best-meta">
        {{ cheapestResult.inputTokens.toLocaleString() }} input tokens / {{ cheapestResult.provider }}
      </div>
    </div>

    <!-- Ranked Result Cards -->
    <div v-if="rankedResults.length > 0" class="ranked-cards">
      <div
        v-for="(result, index) in rankedResults"
        :key="result.modelId"
        class="ranked-card"
        :class="{ 'ranked-card-cheapest': index === 0 }"
      >
        <div class="ranked-rank">{{ index + 1 }}</div>
        <ProviderLogo :provider="result.provider" :size="22" />
        <div class="ranked-info">
          <div class="ranked-model">{{ result.displayName }}</div>
          <div class="ranked-meta">
            {{ result.provider }}
            <ElTag size="small" effect="plain" class="method-tag">{{ shortMethod(result.method) }}</ElTag>
            <AccuracyBadge :level="result.accuracy" short />
          </div>
        </div>
        <div class="ranked-cost">{{ formatCostInCurrency(result, currencyStore.primaryCurrency) }}</div>
      </div>
    </div>
    <div v-else-if="!loading" class="empty-zone">{{ localeStore.t('results.noResults') }}</div>

    <!-- Loading/Error states -->
    <div v-if="loading && results.length > 0" class="loading-results">
      <div v-for="r in results.filter(r => r.status === 'loading')" :key="r.modelId" class="ranked-card ranked-card-loading">
        <Loader2 :size="14" class="spin" />
        <div class="ranked-info">
          <div class="ranked-model">{{ r.displayName }}</div>
          <div class="ranked-meta">{{ localeStore.t('action.calculating') }}</div>
        </div>
      </div>
    </div>

    <div class="table-footer">
      <button class="ghost-button" @click="showFullComparison = true">
        {{ localeStore.t('results.viewFull') }}
      </button>
    </div>

    <ElDrawer
      v-model="showFullComparison"
      direction="rtl"
      :size="drawerWidth"
      :class="{ 'comparison-drawer': true, 'drawer-fullscreen': isMobile }"
      modal-class="comparison-drawer-overlay"
      append-to-body
      lock-scroll
      :close-on-click-modal="true"
    >
      <template #header>
        <div class="drawer-header-custom">
          <h3 class="drawer-title">{{ localeStore.t('results.fullComparison') }}</h3>
          <div class="drawer-header-actions">
            <el-select
              v-model="currencyStore.displayCurrencies"
              multiple
              collapse-tags
              collapse-tags-tooltip
              size="small"
              style="min-width: 180px"
              @change="currencyStore.setDisplayCurrencies($event)"
            >
              <el-option
                v-for="c in ALL_CURRENCIES"
                :key="c"
                :label="localeStore.t(`currency.${c}`)"
                :value="c"
              />
            </el-select>
            <ElTooltip :content="localeStore.t('action.copyMarkdown')" placement="top">
              <button class="icon-button" @click="emit('copyMarkdown')">
                <Copy :size="14" />
              </button>
            </ElTooltip>
            <ElTooltip :content="localeStore.t('action.exportCsv')" placement="top">
              <button class="icon-button" @click="emit('exportCsv')">
                <Download :size="14" />
              </button>
            </ElTooltip>
            <ElTooltip :content="localeStore.t('results.collapseDrawer')" placement="top">
              <button class="icon-button" @click="showFullComparison = false">
                <PanelRightClose :size="14" />
              </button>
            </ElTooltip>
          </div>
        </div>
      </template>
      <div class="drawer-drag-handle" @pointerdown="startDrawerResize" />
      <div class="drawer-sticky-header">
        <div class="drawer-summary">
          <span class="drawer-stat">
            <strong>{{ results.length }}</strong> {{ localeStore.t('results.summary.totalModels') }}
          </span>
          <span class="drawer-stat">
            <strong>{{ avgCost }}</strong> {{ localeStore.t('results.summary.avgCost') }}
          </span>
          <span v-if="cheapestResult" class="drawer-stat drawer-stat-cheapest">
            <strong>{{ formatCostInCurrency(cheapestResult, currencyStore.primaryCurrency) }}</strong>
            {{ localeStore.t('results.summary.cheapest') }}
          </span>
        </div>
      </div>

      <!-- Table view for wider screens -->
      <div class="drawer-table-wrapper">
        <ElTable :data="results" :row-class-name="rowClassName" stripe size="small" :row-style="{ height: '44px' }" :cell-style="{ padding: '6px 0' }" :empty-text="localeStore.t('results.noResultsDrawer')">
          <ElTableColumn :label="localeStore.t('col.model')" min-width="140" sortable :sort-method="sortByName">
            <template #default="{ row }">
              <div class="model-cell">
                <ProviderLogo :provider="row.provider" :size="22" />
                <span class="model-cell-copy">
                  <span class="model-cell-name">{{ row.displayName }}</span>
                  <span class="model-cell-provider">{{ row.provider }}</span>
                </span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="inputTokens" :label="localeStore.t('col.input')" min-width="80" align="right" sortable>
            <template #default="{ row }">{{ row.inputTokens?.toLocaleString() }}</template>
          </ElTableColumn>
          <ElTableColumn prop="estimatedOutputTokens" :label="localeStore.t('col.out')" min-width="70" align="right" sortable>
            <template #default="{ row }">{{ row.estimatedOutputTokens?.toLocaleString() }}</template>
          </ElTableColumn>
          <ElTableColumn
            v-for="currency in currencyStore.displayCurrencies"
            :key="currency"
            :label="currency"
            min-width="100"
            align="right"
            sortable
            :sort-method="sortByCurrency(currency)"
          >
            <template #default="{ row }">
              <span class="cost-cell">{{ formatCostInCurrency(row, currency) }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn :label="localeStore.t('col.method')" min-width="90" align="center" sortable :sort-method="sortByMethod">
            <template #default="{ row }">
              <ElTag size="small" effect="plain">{{ shortMethod(row.method) }}</ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn :label="localeStore.t('col.accuracy')" min-width="90" align="center" sortable :sort-method="sortByAccuracy">
            <template #default="{ row }">
              <AccuracyBadge :level="row.accuracy" short />
            </template>
          </ElTableColumn>
        </ElTable>
      </div>

      <!-- Notes section -->
      <div class="drawer-notes">
        <h4>{{ localeStore.t('results.notes') }}</h4>
        <p>{{ localeStore.t('results.notesText') }}</p>
      </div>
    </ElDrawer>
  </section>
</template>

<style scoped>
.result-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ── Ranked Cards ──────────────────────────────────────────────── */
.ranked-cards {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ranked-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  min-height: 52px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--bg-panel);
  transition: background 0.15s;
}

.ranked-card:hover {
  background: var(--bg-elevated);
}

.ranked-card-cheapest {
  border-color: var(--accent);
  background: rgba(37, 99, 235, 0.04);
}

.ranked-card-loading {
  opacity: 0.6;
}

.ranked-rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-elevated);
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
  flex-shrink: 0;
}

.ranked-card-cheapest .ranked-rank {
  background: var(--accent);
  color: #fff;
}

.ranked-info {
  flex: 1;
  min-width: 0;
}

.ranked-model {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ranked-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 11px;
  color: var(--muted);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.method-tag {
  font-size: 10px;
}

.ranked-cost {
  font-size: 16px;
  font-weight: 700;
  color: var(--accent);
  flex-shrink: 0;
  max-width: 44%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ranked-card-cheapest .ranked-cost {
  font-size: 18px;
}

.loading-results {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

/* ── Drawer ─────────────────────────────────────────────────────── */
.drawer-drag-handle {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  z-index: 10;
  transition: background 0.15s;
}

.drawer-drag-handle:hover {
  background: var(--accent);
}

.drawer-sticky-header {
  position: sticky;
  top: 0;
  z-index: 5;
  padding: 8px 0 12px;
  background: var(--bg-panel);
  border-bottom: 1px solid var(--line);
  margin-bottom: 12px;
}

.drawer-summary {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.drawer-stat {
  font-size: 12px;
  color: var(--muted);
}

.drawer-stat strong {
  color: var(--text);
  font-size: 14px;
}

.drawer-stat-cheapest strong {
  color: var(--accent);
}

.drawer-table-wrapper {
  overflow-x: auto;
}

.drawer-notes {
  margin-top: 16px;
  padding: 12px;
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--muted);
}

.drawer-notes h4 {
  margin: 0 0 4px;
  font-size: 13px;
  color: var(--text-secondary);
}

.drawer-notes p {
  margin: 0;
  line-height: 1.6;
}

.drawer-header-custom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  width: 100%;
}

.drawer-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.drawer-header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
  min-width: 0;
}

.cost-cell {
  font-weight: 600;
  color: var(--accent);
}

:deep(.drawer-fullscreen .el-drawer) {
  width: 100vw !important;
}

.model-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.model-cell-copy {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.model-cell-name {
  display: block;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.model-cell-provider {
  font-size: 11px;
  color: var(--muted);
}

.warning-icon {
  color: var(--el-color-warning);
  flex-shrink: 0;
}

.loading-icon {
  color: var(--el-color-primary);
  flex-shrink: 0;
}

.error-icon {
  color: var(--el-color-danger);
  flex-shrink: 0;
}

.calculating-tag {
  animation: pulse 1.5s ease-in-out infinite;
}

.pulse-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.expand-detail {
  padding: 12px 20px;
}

.expand-row {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 13px;
  line-height: 1.6;
}

.expand-label {
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
}

.table-footer {
  display: flex;
  justify-content: center;
  padding: 12px 0 0;
}

.best-result-card {
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.06), rgba(124, 58, 237, 0.06));
  border: 1px solid rgba(37, 99, 235, 0.15);
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
}

.best-model-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.best-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent);
  margin-bottom: 4px;
}

.best-model {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.best-cost {
  font-size: 22px;
  font-weight: 800;
  color: var(--accent);
  margin: 4px 0;
}

.best-meta {
  font-size: 12px;
  color: var(--muted);
}

:deep(.cheapest-row) {
  background: rgba(37, 99, 235, 0.04) !important;
}

:deep(.cheapest-row td) {
  font-weight: 600;
}

:deep(.cheapest-row:hover > td) {
  background: rgba(37, 99, 235, 0.08) !important;
}

.error-alert {
  margin-bottom: 12px;
}

.retry-button {
  margin-top: 6px;
  font-size: 13px;
}
</style>
