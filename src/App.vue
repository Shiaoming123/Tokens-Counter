<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { siGithub } from 'simple-icons'
import { Info, RotateCcw, Trash2 } from 'lucide-vue-next'
import { ElDialog, ElDrawer, ElMessage, ElSegmented } from 'element-plus'
import InputArea from './components/InputArea.vue'
import ModelSelector from './components/ModelSelector.vue'
import ResultTable from './components/ResultTable.vue'
import LicenseNotice from './components/LicenseNotice.vue'
import ApiDocsPage from './components/ApiDocsPage.vue'
import CaseStudiesPage from './components/CaseStudiesPage.vue'
import EarlyAccessPage from './components/EarlyAccessPage.vue'
import TrustCenterPage from './components/TrustCenterPage.vue'
import { formatCost } from './core/cost/costCalculator'
import { licenses, models } from './core/models/modelRegistry'
import { useCounterStore } from './stores/counter'
import { useHistoryStore } from './stores/history'
import { useNavigationStore } from './stores/navigation'
import { useThemeStore } from './stores/theme'
import { useLocaleStore } from './stores/locale'
import type { HistoryEntry } from './core/history/historyStorage'

const counter = useCounterStore()
const history = useHistoryStore()
const navigation = useNavigationStore()
const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const historyDrawerOpen = ref(false)
const welcomeDialogOpen = ref(false)
const welcomeSeenKey = 'token-counter-welcome-seen-v1'
const githubUrl = import.meta.env.VITE_APP_GITHUB_URL || 'https://github.com/Shiaoming123/Tokens-Counter'

const themeOptions = computed(() => [
  { label: localeStore.t('theme.light'), value: 'light' },
  { label: localeStore.t('theme.dark'), value: 'dark' },
  { label: localeStore.t('theme.system'), value: 'system' },
])

const localeOptions = computed(() => [
  { label: localeStore.t('locale.en'), value: 'en' },
  { label: localeStore.t('locale.zh'), value: 'zh' },
])

onMounted(() => {
  history.load()
  navigation.initListener()

  if (window.localStorage.getItem(welcomeSeenKey) !== 'true') {
    welcomeDialogOpen.value = true
  }
})

async function handleCalculate() {
  await counter.calculate()
}

async function copyMarkdown() {
  const md = await history.copyMarkdown(counter.results)
  if (md) {
    await navigator.clipboard.writeText(md)
    ElMessage.success(localeStore.t('action.markdownCopied'))
  }
}

function exportCsv() {
  history.exportCsv(counter.results)
}

function restoreHistory(entry: HistoryEntry) {
  counter.options = { ...counter.options, ...entry.options }
  counter.results = entry.results
}

function rememberWelcomeDialog() {
  window.localStorage.setItem(welcomeSeenKey, 'true')
}

function closeWelcomeDialog() {
  rememberWelcomeDialog()
  welcomeDialogOpen.value = false
}

function openWelcomeDialog() {
  welcomeDialogOpen.value = true
}
</script>

<template>
  <main>
    <header class="app-header">
      <button class="brand" @click="navigation.navigate('/')">
        <img class="brand-logo" src="/logo.svg" alt="" />
        <span>{{ localeStore.t('app.title') }}</span>
      </button>
      <div class="header-right">
        <nav aria-label="Main Navigation">
          <button :class="{ active: navigation.route === '/' }" @click="navigation.navigate('/')">
            {{ localeStore.t('nav.workbench') }}
          </button>
          <button
            :class="{ active: navigation.route === '/licenses' }"
            @click="navigation.navigate('/licenses')"
          >
            {{ localeStore.t('nav.licenses') }}
          </button>
          <button
            :class="{ active: navigation.route === '/api-docs' }"
            @click="navigation.navigate('/api-docs')"
          >
            {{ localeStore.t('nav.apiDocs') }}
          </button>
          <button
            :class="{ active: navigation.route === '/trust' }"
            @click="navigation.navigate('/trust')"
          >
            {{ localeStore.t('nav.trust') }}
          </button>
          <button
            :class="{ active: navigation.route === '/case-studies' }"
            @click="navigation.navigate('/case-studies')"
          >
            {{ localeStore.t('nav.caseStudies') }}
          </button>
          <button
            :class="{ active: navigation.route === '/early-access' }"
            @click="navigation.navigate('/early-access')"
          >
            {{ localeStore.t('nav.earlyAccess') }}
          </button>
        </nav>
        <div class="header-icon-group">
          <a
            class="header-icon-link"
            :href="githubUrl"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
            title="GitHub repository"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path :d="siGithub.path" />
            </svg>
          </a>
          <button
            class="header-icon-link header-info-button"
            type="button"
            :aria-label="localeStore.t('welcome.reopen')"
            :title="localeStore.t('welcome.reopen')"
            @click="openWelcomeDialog"
          >
            <Info :size="18" aria-hidden="true" />
          </button>
        </div>
        <div class="header-controls">
          <ElSegmented v-model="themeStore.theme" :options="themeOptions" size="small" />
          <ElSegmented v-model="localeStore.locale" :options="localeOptions" size="small" />
        </div>
      </div>
    </header>

    <LicenseNotice v-if="navigation.route === '/licenses'" :licenses="licenses" />
    <ApiDocsPage v-else-if="navigation.route === '/api-docs'" />
    <TrustCenterPage v-else-if="navigation.route === '/trust'" />
    <CaseStudiesPage v-else-if="navigation.route === '/case-studies'" @navigate="navigation.navigate" />
    <EarlyAccessPage v-else-if="navigation.route === '/early-access'" @navigate="navigation.navigate" />

    <div v-else class="workspace">
      <section class="hero">
        <div class="hero-left">
          <h1>{{ localeStore.t('hero.title') }}</h1>
          <p class="hero-subtitle">{{ localeStore.t('hero.subtitle') }}</p>
        </div>
        <div class="hero-right">
          <span class="hero-badge">{{ counter.latestPricingUpdate }}</span>
        </div>
      </section>

      <section class="summary-cards" aria-label="Overview stats">
        <div class="summary-card">
          <span>{{ localeStore.t('summary.totalInput') }}</span>
          <strong>{{ counter.totalInputTokens.toLocaleString() }}</strong>
        </div>
        <div class="summary-card">
          <span>{{ localeStore.t('summary.lowestEstimate') }}</span>
          <strong>
            {{
              counter.cheapest
                ? formatCost(counter.cheapest.totalCost, counter.cheapest.currency)
                : '$0.000000'
            }}
          </strong>
        </div>
        <div class="summary-card">
          <span>{{ localeStore.t('summary.highestModel') }}</span>
          <strong>{{ counter.highestInput?.displayName ?? '—' }}</strong>
        </div>
        <div class="summary-card">
          <span>{{ localeStore.t('summary.modelsSelected') }}</span>
          <strong>{{ counter.selectedModelIds.length }}</strong>
        </div>
      </section>

      <div class="app-grid">
        <aside>
          <ModelSelector
            v-model="counter.selectedModelIds"
            :models="models"
            :has-image-input="counter.images.length > 0"
          />
        </aside>

        <section class="main-workspace">
          <InputArea
            v-model:text="counter.text"
            :input-mode="counter.inputMode"
            :messages="counter.messages"
            :images="counter.images"
            :documents="counter.documents"
            :tools="counter.tools"
            :options="counter.options"
            :loading="counter.loading"
            @update:input-mode="counter.inputMode = $event"
            @update:messages="counter.messages = $event"
            @add-message="counter.messages = [...counter.messages, { role: 'user', content: '' }]"
            @remove-message="(i) => counter.messages = counter.messages.filter((_, idx) => idx !== i)"
            @update:images="counter.images = $event"
            @update:documents="counter.documents = $event"
            @update:tools="counter.tools = $event"
            @update:options="counter.options = $event"
            @estimate="handleCalculate"
          />
        </section>

        <aside class="result-panel">
          <div :aria-busy="counter.loading" aria-live="polite">
            <ResultTable
              :results="counter.results"
              :loading="counter.loading"
              :error="counter.error"
              @retry="handleCalculate"
              @copy-markdown="copyMarkdown"
              @export-csv="exportCsv"
            />
          </div>

          <section class="panel history-panel">
            <div class="section-head">
              <div>
                <p class="eyebrow">{{ localeStore.t('history.eyebrow') }}</p>
                <h2>{{ localeStore.t('history.title') }}</h2>
              </div>
              <div class="history-actions">
                <button v-if="history.entries.length > 3" class="ghost-button" @click="historyDrawerOpen = true">
                  {{ localeStore.t('history.viewAll') }}
                </button>
                <button class="icon-button" :title="localeStore.t('history.clear')" :aria-label="localeStore.t('history.clear')" @click="history.clearAll">
                  <Trash2 :size="16" />
                </button>
              </div>
            </div>
            <div v-if="history.entries.length === 0" class="empty-zone">{{ localeStore.t('history.empty') }}</div>
            <div v-else class="history-list">
              <button
                v-for="entry in history.entries.slice(0, 3)"
                :key="entry.id"
                class="history-item"
                @click="restoreHistory(entry)"
              >
                <RotateCcw :size="14" />
                <span>{{ new Date(entry.createdAt).toLocaleDateString() }}</span>
                <strong>{{ entry.textPreview }}</strong>
                <em>{{ entry.results.length }} {{ localeStore.t('history.models') }}</em>
              </button>
            </div>
          </section>

          <ElDrawer v-model="historyDrawerOpen" :title="localeStore.t('history.allEstimates')" direction="rtl" size="400px">
            <div class="history-list">
              <button
                v-for="entry in history.entries"
                :key="entry.id"
                class="history-item"
                @click="restoreHistory(entry); historyDrawerOpen = false"
              >
                <RotateCcw :size="14" />
                <span>{{ new Date(entry.createdAt).toLocaleString() }}</span>
                <strong>{{ entry.textPreview }}</strong>
                <em>{{ entry.results.length }} {{ localeStore.t('history.models') }} · {{ entry.imageCount }} {{ localeStore.t('history.images') }}</em>
              </button>
            </div>
          </ElDrawer>

          <p class="disclaimer">{{ localeStore.t('disclaimer') }}</p>
        </aside>
      </div>
    </div>

    <ElDialog
      v-model="welcomeDialogOpen"
      class="welcome-dialog"
      modal-class="welcome-dialog-overlay"
      width="min(560px, calc(100vw - 32px))"
      align-center
      @closed="rememberWelcomeDialog"
    >
      <template #header>
        <div class="welcome-title">
          <span>{{ localeStore.t('welcome.title') }}</span>
          <small>{{ localeStore.t('welcome.kaomoji') }}</small>
        </div>
      </template>

      <div class="welcome-content">
        <p>{{ localeStore.t('welcome.intro') }}</p>
        <ol class="welcome-steps">
          <li>{{ localeStore.t('welcome.stepModels') }}</li>
          <li>{{ localeStore.t('welcome.stepInput') }}</li>
          <li>{{ localeStore.t('welcome.stepEstimate') }}</li>
        </ol>

        <div class="welcome-divider" aria-hidden="true"></div>

        <div class="welcome-link-block">
          <strong>{{ localeStore.t('welcome.githubLabel') }}</strong>
          <a :href="githubUrl" target="_blank" rel="noreferrer">{{ githubUrl }}</a>
          <p>{{ localeStore.t('welcome.star') }}</p>
        </div>

        <div class="welcome-link-block">
          <strong>{{ localeStore.t('welcome.emailLabel') }}</strong>
          <a href="mailto:henshiaoming@gmail.com">henshiaoming@gmail.com</a>
          <p>{{ localeStore.t('welcome.emailNote') }}</p>
        </div>
      </div>

      <template #footer>
        <button class="primary-action welcome-close" type="button" @click="closeWelcomeDialog">
          {{ localeStore.t('welcome.close') }}
        </button>
      </template>
    </ElDialog>
  </main>
</template>
