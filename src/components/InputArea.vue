<script setup lang="ts">
import { ref, computed } from 'vue'
import { Calculator, FileText, ImagePlus, RefreshCw, Settings, Trash2, Upload, Wrench } from 'lucide-vue-next'
import {
  ElAlert,
  ElInput,
  ElInputNumber,
  ElOption,
  ElPopover,
  ElSegmented,
  ElSelect,
  ElSwitch,
  ElTabs,
  ElTabPane,
  ElTooltip,
  ElMessage,
} from 'element-plus'
import { extractPdfMetadata } from '../core/document/pdfExtractor'
import { getPricingProfileOptions } from '../core/pricing/pricingProfiles'
import { getImageMetadata } from '../core/vision/imageMetadata'
import { useLocaleStore } from '../stores/locale'
import { useCurrencyStore, ALL_CURRENCIES } from '../stores/currency'
import type { CountOptions, Message, ImageMetadata, DocumentMetadata, ToolDefinition } from '../types/domain'

const localeStore = useLocaleStore()
const currencyStore = useCurrencyStore()

// ── Active tab state ──────────────────────────────────────────────
const activeTab = ref('text')

// ── Text panel state ──────────────────────────────────────────────
const MAX_TEXT_LENGTH = 1_000_000

const text = defineModel<string>('text', { required: true })

const props = defineProps<{
  inputMode: 'text' | 'messages'
  messages: Message[]
  images: ImageMetadata[]
  documents: DocumentMetadata[]
  tools: ToolDefinition[]
  options: CountOptions
  loading: boolean
}>()

const emit = defineEmits<{
  'update:inputMode': [value: 'text' | 'messages']
  'update:messages': [value: Message[]]
  addMessage: []
  removeMessage: [index: number]
  'update:images': [value: ImageMetadata[]]
  'update:documents': [value: DocumentMetadata[]]
  'update:tools': [value: ToolDefinition[]]
  'update:options': [value: CountOptions]
  estimate: []
}>()

function updateOption<K extends keyof CountOptions>(key: K, value: CountOptions[K]) {
  emit('update:options', { ...props.options, [key]: value })
}

const imageDetailOptions = computed(() => [
  { label: 'low', value: 'low' },
  { label: 'auto', value: 'auto' },
  { label: 'high', value: 'high' },
])

const pricingProfileOptions = computed(() =>
  getPricingProfileOptions().map((profile) => ({
    label: profile.id === 'ccswitch' ? localeStore.t('pricing.ccswitch') : localeStore.t('pricing.official'),
    value: profile.id,
    source: profile.source,
  })),
)

const selectedPricingProfile = computed(() =>
  pricingProfileOptions.value.find((profile) => profile.value === props.options.pricingProfile) ?? pricingProfileOptions.value[0],
)

// ── Text computed / helpers ────────────────────────────────────────
const stats = computed(() => {
  if (props.inputMode === 'messages') {
    const allText = props.messages.map((m) => m.content).join('\n')
    const cjk = allText.match(/[㐀-鿿]/g)?.length ?? 0
    const words = allText.match(/[A-Za-z0-9_]+(?:[-'][A-Za-z0-9_]+)*/g)?.length ?? 0
    return { chars: allText.length, cjk, words }
  }
  const value = text.value
  const cjk = value.match(/[㐀-鿿]/g)?.length ?? 0
  const words = value.match(/[A-Za-z0-9_]+(?:[-'][A-Za-z0-9_]+)*/g)?.length ?? 0
  return { chars: value.length, cjk, words }
})

const lengthWarning = computed(() => {
  if (stats.value.chars > MAX_TEXT_LENGTH) {
    return localeStore.t('warning.textTooLong', { limit: MAX_TEXT_LENGTH.toLocaleString(), current: stats.value.chars.toLocaleString() })
  }
  return null
})

const emptyWarning = computed(() => {
  if (props.inputMode === 'text' && !text.value.trim()) {
    return localeStore.t('warning.enterText')
  }
  if (props.inputMode === 'messages' && !props.messages.some((m) => m.content.trim())) {
    return localeStore.t('warning.enterMessage')
  }
  return null
})

const roleOptions = computed(() => [
  { label: localeStore.t('text.role.system'), value: 'system' },
  { label: localeStore.t('text.role.user'), value: 'user' },
  { label: localeStore.t('text.role.assistant'), value: 'assistant' },
])

function updateMessageRole(index: number, role: string) {
  const next = [...props.messages]
  next[index] = { ...next[index], role: role as Message['role'] }
  emit('update:messages', next)
}

function updateMessageContent(index: number, content: string) {
  const next = [...props.messages]
  next[index] = { ...next[index], content }
  emit('update:messages', next)
}

// ── Image panel state / helpers ────────────────────────────────────
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_IMAGE_COUNT = 20
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])

const imageInlineError = ref<string | null>(null)

function dismissImageError() {
  imageInlineError.value = null
}

async function handleImageFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])

  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      imageInlineError.value = localeStore.t('error.unsupportedImage', { type: file.type || file.name })
      ElMessage.error(imageInlineError.value)
      continue
    }

    if (file.size > MAX_IMAGE_SIZE) {
      imageInlineError.value = localeStore.t('error.imageTooLarge', { name: file.name, size: (file.size / 1024 / 1024).toFixed(1) })
      ElMessage.error(imageInlineError.value)
      continue
    }

    if (props.images.length >= MAX_IMAGE_COUNT) {
      imageInlineError.value = localeStore.t('error.maxImages', { max: MAX_IMAGE_COUNT })
      ElMessage.error(imageInlineError.value)
      break
    }

    try {
      const metadata = await getImageMetadata(file)
      emit('update:images', [...props.images, metadata])
    } catch (error) {
      imageInlineError.value = error instanceof Error ? error.message : localeStore.t('error.readImage')
      ElMessage.error(imageInlineError.value)
    }
  }

  input.value = ''
}

function removeImage(id: string) {
  emit('update:images', props.images.filter((image) => image.id !== id))
}

// ── Document panel state / helpers ─────────────────────────────────
const docInlineError = ref<string | null>(null)
const extracting = ref(false)

function dismissDocError() {
  docInlineError.value = null
}

async function handleDocFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])

  for (const file of files) {
    if (file.type !== 'application/pdf') {
      docInlineError.value = localeStore.t('error.unsupportedPdf', { type: file.type || file.name })
      ElMessage.error(docInlineError.value)
      continue
    }

    try {
      extracting.value = true
      docInlineError.value = null
      const metadata = await extractPdfMetadata(file)
      emit('update:documents', [...props.documents, metadata])
    } catch (error) {
      docInlineError.value = error instanceof Error ? error.message : localeStore.t('error.pdfExtract')
      ElMessage.error(docInlineError.value)
    } finally {
      extracting.value = false
    }
  }

  input.value = ''
}

function removeDocument(id: string) {
  emit('update:documents', props.documents.filter((doc) => doc.id !== id))
}

// ── Tools panel state / helpers ────────────────────────────────────
const showAddForm = ref(false)
const newName = ref('')
const newDescription = ref('')
const newParameters = ref('{\n  "type": "object",\n  "properties": {},\n  "required": []\n}')
const editingIndex = ref<number | null>(null)

function resetToolForm() {
  newName.value = ''
  newDescription.value = ''
  newParameters.value = '{\n  "type": "object",\n  "properties": {},\n  "required": []\n}'
  editingIndex.value = null
}

function startAdd() {
  resetToolForm()
  showAddForm.value = true
}

function startEdit(index: number) {
  const tool = props.tools[index]
  newName.value = tool.name
  newDescription.value = tool.description
  newParameters.value = JSON.stringify(tool.parameters, null, 2)
  editingIndex.value = index
  showAddForm.value = true
}

function saveTool() {
  if (!newName.value.trim()) {
    ElMessage.warning(localeStore.t('error.toolNameEmpty'))
    return
  }

  let parameters: Record<string, unknown>
  try {
    parameters = JSON.parse(newParameters.value)
  } catch {
    ElMessage.error(localeStore.t('error.invalidJson'))
    return
  }

  const tool: ToolDefinition = {
    name: newName.value.trim(),
    description: newDescription.value.trim(),
    parameters,
  }

  if (editingIndex.value !== null) {
    const next = [...props.tools]
    next[editingIndex.value] = tool
    emit('update:tools', next)
  } else {
    emit('update:tools', [...props.tools, tool])
  }

  showAddForm.value = false
  resetToolForm()
}

function removeTool(index: number) {
  emit('update:tools', props.tools.filter((_, i) => i !== index))
}

function cancelToolForm() {
  showAddForm.value = false
  resetToolForm()
}

// ── Shared helpers ─────────────────────────────────────────────────
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}
</script>

<template>
  <section class="panel input-area">
    <!-- Action Bar: Settings + Estimate Button -->
    <div class="action-bar">
      <div class="settings-group">
        <label class="qs-item">
          <span class="qs-label">{{ localeStore.t('pricing.profile') }}</span>
          <ElSelect
            :model-value="options.pricingProfile"
            size="small"
            style="min-width: 138px"
            @update:model-value="updateOption('pricingProfile', $event as CountOptions['pricingProfile'])"
          >
            <ElOption
              v-for="profile in pricingProfileOptions"
              :key="profile.value"
              :label="profile.label"
              :value="profile.value"
            />
          </ElSelect>
        </label>
        <label class="qs-item">
          <span class="qs-label">{{ localeStore.t('settings.outputTokens') }}</span>
          <ElInputNumber
            :model-value="options.estimatedOutputTokens"
            :min="0"
            :step="250"
            :max="200000"
            size="small"
            controls-position="right"
            @update:model-value="updateOption('estimatedOutputTokens', $event ?? 0)"
          />
        </label>
        <label class="qs-item">
          <span class="qs-label">{{ localeStore.t('settings.imageDetail') }}</span>
          <ElSegmented
            :model-value="options.openaiDetail"
            :options="imageDetailOptions"
            size="small"
            @update:model-value="updateOption('openaiDetail', $event as CountOptions['openaiDetail'])"
          />
        </label>
        <label class="qs-item">
          <span class="qs-label">{{ localeStore.t('settings.officialApi') }}</span>
          <ElSwitch
            :model-value="options.useOfficialApi"
            size="small"
            @update:model-value="updateOption('useOfficialApi', $event as boolean)"
          />
        </label>
        <label class="qs-item">
          <span class="qs-label">{{ localeStore.t('settings.costMultiplier') }}</span>
          <ElInputNumber
            :model-value="options.costMultiplier"
            :min="0"
            :step="0.1"
            :max="100"
            size="small"
            controls-position="right"
            @update:model-value="updateOption('costMultiplier', $event ?? 1)"
          />
        </label>
        <label class="qs-item">
          <span class="qs-label">{{ localeStore.t('currency.selector') }}</span>
          <div class="qs-currency-row">
            <ElSelect
              :model-value="currencyStore.displayCurrencies"
              multiple
              collapse-tags
              collapse-tags-tooltip
              size="small"
              style="min-width: 140px"
              @update:model-value="currencyStore.setDisplayCurrencies($event)"
            >
              <ElOption
                v-for="c in ALL_CURRENCIES"
                :key="c"
                :label="localeStore.t(`currency.${c}`)"
                :value="c"
              />
            </ElSelect>
            <ElTooltip :content="localeStore.t('currency.refresh')" placement="top">
              <button
                class="icon-button"
                :class="{ 'spin-slow': currencyStore.fetching }"
                :disabled="currencyStore.fetching"
                @click="currencyStore.fetchRates()"
              >
                <RefreshCw :size="12" />
              </button>
            </ElTooltip>
          </div>
        </label>
        <ElPopover trigger="click" placement="bottom-end" :width="340">
          <template #reference>
            <button class="icon-button qs-more" :title="localeStore.t('settings.moreSettings')">
              <Settings :size="16" />
            </button>
          </template>
          <div class="qs-popover">
            <div class="pricing-breakdown">
              <div class="pricing-breakdown-head">
                <span>{{ localeStore.t('pricing.profile') }}</span>
                <strong>{{ selectedPricingProfile?.label }}</strong>
              </div>
              <p>{{ localeStore.t('pricing.profileHelp') }}</p>
              <dl class="pricing-split-list">
                <div class="pricing-split-row">
                  <dt>{{ localeStore.t('pricing.inputRate') }}</dt>
                  <dd>{{ localeStore.t('pricing.inputRateHelp') }}</dd>
                </div>
                <div class="pricing-split-row">
                  <dt>{{ localeStore.t('pricing.outputRate') }}</dt>
                  <dd>{{ localeStore.t('pricing.outputRateHelp') }}</dd>
                </div>
                <div class="pricing-split-row">
                  <dt>{{ localeStore.t('pricing.cacheRate') }}</dt>
                  <dd>{{ localeStore.t('pricing.cacheRateHelp') }}</dd>
                </div>
              </dl>
              <small>{{ selectedPricingProfile?.source }}</small>
            </div>
            <label class="qs-popover-item">
              <span>{{ localeStore.t('settings.cacheHit') }}</span>
              <ElInputNumber
                class="cache-token-input"
                :model-value="options.cachedInputTokens"
                :min="0"
                :step="1000"
                :max="10000000"
                size="small"
                controls-position="right"
                @update:model-value="updateOption('cachedInputTokens', $event ?? 0)"
              />
            </label>
            <label class="qs-popover-item">
              <span>{{ localeStore.t('settings.cacheWrite') }}</span>
              <ElInputNumber
                class="cache-token-input"
                :model-value="options.cacheCreationTokens"
                :min="0"
                :step="1000"
                :max="10000000"
                size="small"
                controls-position="right"
                @update:model-value="updateOption('cacheCreationTokens', $event ?? 0)"
              />
            </label>
          </div>
        </ElPopover>
      </div>
      <button class="estimate-btn" :disabled="loading" @click="emit('estimate')">
        <Calculator :size="16" />
        <span>{{ loading ? localeStore.t('action.calculating') : localeStore.t('action.estimate') }}</span>
      </button>
    </div>

    <!-- Tabs -->
    <ElTabs v-model="activeTab" type="border-card" class="input-tabs">
      <ElTabPane name="text">
        <template #label>
          <span class="tab-label">
            <FileText :size="14" />
            <span>{{ localeStore.t('tab.text') }}</span>
          </span>
        </template>
      </ElTabPane>
      <ElTabPane name="image">
        <template #label>
          <span class="tab-label">
            <ImagePlus :size="14" />
            <span>{{ localeStore.t('tab.image') }}</span>
          </span>
        </template>
      </ElTabPane>
      <ElTabPane name="pdf">
        <template #label>
          <span class="tab-label">
            <FileText :size="14" />
            <span>{{ localeStore.t('tab.pdf') }}</span>
          </span>
        </template>
      </ElTabPane>
      <ElTabPane name="tools">
        <template #label>
          <span class="tab-label">
            <Wrench :size="14" />
            <span>{{ localeStore.t('tab.tools') }}</span>
          </span>
        </template>
      </ElTabPane>
    </ElTabs>

    <!-- Tab Content Panels -->
    <div class="tab-content-body">
      <!-- ═══════════════ TEXT TAB ═══════════════ -->
      <div v-show="activeTab === 'text'" class="tab-panel">
        <div class="tab-header-row">
          <div class="mode-toggle">
            <ElSegmented
              :model-value="inputMode"
              :options="[
                { label: localeStore.t('text.plainText'), value: 'text' },
                { label: localeStore.t('text.multiTurn'), value: 'messages' },
              ]"
              aria-label="Input mode toggle"
              @update:model-value="emit('update:inputMode', $event as 'text' | 'messages')"
            />
          </div>
        </div>

        <ElAlert
          v-if="lengthWarning"
          :title="lengthWarning"
          type="warning"
          show-icon
          :closable="false"
          class="inline-alert"
        />
        <ElAlert
          v-if="emptyWarning"
          :title="emptyWarning"
          type="info"
          show-icon
          :closable="false"
          class="inline-alert"
        />

        <div v-if="inputMode === 'text'">
          <ElInput
            v-model="text"
            type="textarea"
            :autosize="{ minRows: 8 }"
            resize="vertical"
            class="text-editor"
            :placeholder="localeStore.t('text.placeholder')"
          />
        </div>

        <div v-else class="messages-editor">
          <div v-for="(msg, index) in messages" :key="index" class="message-row">
            <ElSelect
              :model-value="msg.role"
              class="role-select"
              @update:model-value="updateMessageRole(index, $event as string)"
            >
              <ElOption
                v-for="opt in roleOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </ElSelect>
            <ElInput
              :model-value="msg.content"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 6 }"
              resize="none"
              :placeholder="msg.role === 'system' ? localeStore.t('text.systemPlaceholder') : localeStore.t('text.messagePlaceholder')"
              class="message-input"
              @update:model-value="updateMessageContent(index, $event as string)"
            />
            <button
              v-if="messages.length > 1"
              class="icon-button remove-msg"
              :title="localeStore.t('text.removeMessage')"
              :aria-label="`${localeStore.t('text.removeMessage')} ${index + 1}`"
              @click="emit('removeMessage', index)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button class="ghost-button add-msg" @click="emit('addMessage')">{{ localeStore.t('text.addMessage') }}</button>
        </div>

        <div class="input-stats-bar">
          <span>{{ stats.chars }} {{ localeStore.t('text.chars') }}</span>
          <span>{{ stats.cjk }} {{ localeStore.t('text.cjk') }}</span>
          <span>{{ stats.words }} {{ localeStore.t('text.words') }}</span>
          <span v-if="lengthWarning" class="stat-warning">{{ localeStore.t('text.longTextWarning') }}</span>
        </div>
      </div>

      <!-- ═══════════════ IMAGE TAB ═══════════════ -->
      <div v-show="activeTab === 'image'" class="tab-panel">
        <label class="dropzone">
          <Upload :size="20" />
          <span>{{ localeStore.t('image.dropzone') }}</span>
          <input type="file" accept="image/*" multiple hidden @change="handleImageFiles" />
        </label>

        <div v-if="images.length === 0" class="empty-zone">
          {{ localeStore.t('image.empty') }}
        </div>

        <el-alert
          v-if="imageInlineError"
          :title="imageInlineError"
          type="error"
          show-icon
          :closable="true"
          class="inline-alert"
          @close="dismissImageError"
        />

        <div v-if="images.length > 0" class="image-list">
          <div v-for="image in images" :key="image.id" class="image-row">
            <img
              v-if="image.base64"
              :src="`data:${image.mimeType};base64,${image.base64}`"
              :alt="image.name"
              class="image-thumb"
            />
            <div>
              <strong>{{ image.name }}</strong>
              <span>{{ image.width }}×{{ image.height }} · {{ image.mimeType }} · {{ formatBytes(image.sizeBytes) }}</span>
            </div>
            <button class="icon-button" :title="localeStore.t('image.remove')" :aria-label="`${localeStore.t('image.remove')} ${image.name}`" @click="removeImage(image.id)">
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
      </div>

      <!-- ═══════════════ PDF TAB ═══════════════ -->
      <div v-show="activeTab === 'pdf'" class="tab-panel">
        <label class="dropzone">
          <Upload :size="20" />
          <span>{{ localeStore.t('pdf.dropzone') }}</span>
          <input type="file" accept="application/pdf" multiple hidden @change="handleDocFiles" />
        </label>

        <div v-if="documents.length === 0" class="empty-zone">
          {{ localeStore.t('pdf.empty') }}
        </div>

        <el-alert
          v-if="docInlineError"
          :title="docInlineError"
          type="error"
          show-icon
          :closable="true"
          class="inline-alert"
          @close="dismissDocError"
        />

        <el-alert
          v-if="extracting"
          :title="localeStore.t('pdf.extracting')"
          type="info"
          show-icon
          :closable="false"
          class="inline-alert"
        />

        <div v-if="documents.length > 0" class="document-list">
          <div v-for="doc in documents" :key="doc.id" class="document-row">
            <div>
              <strong>{{ doc.name }}</strong>
              <span>{{ doc.pageCount }} pages · {{ formatBytes(doc.sizeBytes) }} · {{ doc.text.length }} chars</span>
            </div>
            <button class="icon-button" :title="localeStore.t('pdf.remove')" :aria-label="`${localeStore.t('pdf.remove')} ${doc.name}`" @click="removeDocument(doc.id)">
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
      </div>

      <!-- ═══════════════ TOOLS TAB ═══════════════ -->
      <div v-show="activeTab === 'tools'" class="tab-panel">
        <div class="tab-header-row">
          <div />
          <button class="icon-button" :title="localeStore.t('tools.add')" :aria-label="localeStore.t('tools.add')" @click="startAdd">
            <Wrench :size="18" />
          </button>
        </div>

        <div v-if="tools.length === 0 && !showAddForm" class="empty-zone">
          {{ localeStore.t('tools.empty') }}
        </div>

        <div v-if="tools.length > 0" class="tool-list">
          <div v-for="(tool, index) in tools" :key="index" class="tool-row">
            <div class="tool-info">
              <strong>{{ tool.name }}</strong>
              <span>{{ tool.description || localeStore.t('tools.noDescription') }}</span>
            </div>
            <div class="tool-actions">
              <button class="icon-button" :title="localeStore.t('tools.edit')" :aria-label="`${localeStore.t('tools.edit')} ${tool.name}`" @click="startEdit(index)">
                <Wrench :size="14" />
              </button>
              <button class="icon-button" :title="localeStore.t('tools.delete')" :aria-label="`${localeStore.t('tools.delete')} ${tool.name}`" @click="removeTool(index)">
                <Trash2 :size="14" />
              </button>
            </div>
          </div>
        </div>

        <div v-if="showAddForm" class="tool-form">
          <input
            v-model="newName"
            type="text"
            :placeholder="localeStore.t('tools.namePlaceholder')"
            class="tool-input"
          />
          <input
            v-model="newDescription"
            type="text"
            :placeholder="localeStore.t('tools.descPlaceholder')"
            class="tool-input"
          />
          <textarea
            v-model="newParameters"
            :placeholder="localeStore.t('tools.paramsPlaceholder')"
            class="tools-textarea"
            spellcheck="false"
            rows="6"
          />
          <div class="form-actions">
            <button class="ghost-button" @click="saveTool">
              {{ editingIndex !== null ? localeStore.t('tools.update') : localeStore.t('tools.add') }}
            </button>
            <button class="ghost-button" @click="cancelToolForm">{{ localeStore.t('tools.cancel') }}</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ── Layout ─────────────────────────────────────────────────────── */
.input-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── Action Bar (Settings + Estimate) ─────────────────────────── */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px 16px;
  flex-wrap: wrap;
}

.settings-group {
  display: flex;
  align-items: center;
  gap: 12px 16px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

.estimate-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 18px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563EB, #7C3AED);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.estimate-btn:hover {
  opacity: 0.9;
}

.estimate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Input Tabs ──────────────────────────────────────────────── */
.input-tabs {
  border-radius: var(--radius, 10px);
}

.input-tabs :deep(.el-tabs__header) {
  margin: 0;
}

.input-tabs :deep(.el-tabs__content) {
  padding: 0;
}

/* ── Tab Content Body ─────────────────────────────────────────── */
.tab-content-body {
  padding: 16px;
}

.tab-panel {
  /* panels are toggled via v-show */
}

/* ── Settings items ──────────────────────────────────────────── */
.qs-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.qs-label {
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
}

.qs-currency-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.spin-slow {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.qs-more {
  /* no-op, kept for template reference */
}

.qs-popover {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pricing-breakdown {
  display: grid;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--bg-elevated);
}

.pricing-breakdown-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.pricing-breakdown span,
.pricing-breakdown dt {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
}

.pricing-breakdown strong {
  color: var(--accent);
  font-size: 12px;
}

.pricing-breakdown p,
.pricing-breakdown dd,
.pricing-breakdown small {
  margin: 0;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.35;
}

.pricing-breakdown dl {
  display: grid;
  gap: 8px;
  margin: 0;
}

.pricing-split-row {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  padding-top: 7px;
  border-top: 1px solid var(--line);
}

.qs-popover-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 124px;
  align-items: center;
  gap: 12px;
  min-height: 34px;
}

.qs-popover-item span {
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.cache-token-input {
  width: 124px;
}

.qs-popover-item small {
  flex-basis: 100%;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.4;
}

/* ── Tab label icon+text ────────────────────────────────────────── */
.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* ── Shared header row ──────────────────────────────────────────── */
.tab-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 10px;
}

/* ── Text tab ───────────────────────────────────────────────────── */
.mode-toggle {
  display: flex;
  align-items: center;
}

.messages-editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.role-select {
  width: 110px;
  flex-shrink: 0;
}

.message-input {
  flex: 1;
}

.remove-msg {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  margin-top: 4px;
}

.add-msg {
  align-self: flex-start;
  margin-top: 4px;
}

/* ── Image tab ──────────────────────────────────────────────────── */
.image-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.image-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
}

.image-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.image-row div {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.image-row strong {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-row span {
  font-size: 11px;
  color: var(--muted);
}

/* ── Document tab ───────────────────────────────────────────────── */
.document-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.document-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
  gap: 10px;
}

.document-row div {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.document-row strong {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.document-row span {
  font-size: 11px;
  color: var(--muted);
}

/* ── Tools tab ──────────────────────────────────────────────────── */
.tool-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tool-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
  gap: 10px;
}

.tool-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.tool-info strong {
  font-size: 13px;
  font-family: monospace;
}

.tool-info span {
  font-size: 11px;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tool-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.tool-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.tool-input {
  padding: 6px 10px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--bg-panel);
  color: var(--text);
  font-size: 13px;
  font-family: monospace;
}

.form-actions {
  display: flex;
  gap: 8px;
}

/* ── Shared ─────────────────────────────────────────────────────── */
.inline-alert {
  margin-bottom: 10px;
}

/* ── Stats bar (bottom toolbar) ─────────────────────────────────── */
.input-stats-bar {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--muted);
  padding: 8px 0 0;
  border-top: 1px solid var(--line);
  margin-top: 10px;
}

.stat-warning {
  color: var(--el-color-warning, #e6a23c);
}

/* ── Dropzone ───────────────────────────────────────────────────── */
.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 24px;
  border: 2px dashed var(--line);
  border-radius: var(--radius, 10px);
  background: var(--bg-elevated);
  color: var(--muted);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  text-align: center;
  font-size: 13px;
  margin-bottom: 10px;
}

.dropzone:hover {
  border-color: var(--el-color-primary, #409eff);
  background: var(--bg-panel);
}

/* ── Tools textarea (monospace JSON editor) ─────────────────────── */
.tools-textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--bg-panel);
  color: var(--text);
  font-size: 12px;
  font-family: monospace;
  resize: vertical;
}

/* ── Text editor min height ────────────────────────────────────── */
.text-editor :deep(textarea) {
  min-height: 220px !important;
  max-height: calc(100vh - 360px) !important;
  resize: vertical !important;
}

/* ── Responsive ─────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .settings-group {
    justify-content: center;
  }

  .estimate-btn {
    width: 100%;
    justify-content: center;
    position: sticky;
    bottom: 0;
    z-index: 10;
    border-radius: 12px;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  }

  .mode-toggle {
    width: 100%;
  }

  .message-row {
    flex-wrap: wrap;
  }

  .role-select {
    width: 100%;
  }

  .message-input {
    width: 100%;
  }

  .image-thumb {
    width: 32px;
    height: 32px;
  }

  .image-row {
    padding: 6px 8px;
  }

  .image-row strong {
    font-size: 12px;
  }

  .image-row span {
    font-size: 10px;
  }

  .document-row {
    padding: 6px 8px;
  }

  .document-row strong {
    font-size: 12px;
  }

  .document-row span {
    font-size: 10px;
  }
}
</style>
