<script setup lang="ts">
import { ref } from 'vue'
import { FileText, Trash2 } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import { extractPdfMetadata } from '../core/document/pdfExtractor'
import { useLocaleStore } from '../stores/locale'
import type { DocumentMetadata } from '../types/domain'

const localeStore = useLocaleStore()

const documents = defineModel<DocumentMetadata[]>({ required: true })
const inlineError = ref<string | null>(null)
const extracting = ref(false)

function dismissError() {
  inlineError.value = null
}

async function handleFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])

  for (const file of files) {
    if (file.type !== 'application/pdf') {
      inlineError.value = localeStore.t('error.unsupportedPdf', { type: file.type || file.name })
      ElMessage.error(inlineError.value)
      continue
    }

    try {
      extracting.value = true
      inlineError.value = null
      const metadata = await extractPdfMetadata(file)
      documents.value = [...documents.value, metadata]
    } catch (error) {
      inlineError.value = error instanceof Error ? error.message : localeStore.t('error.pdfExtract')
      ElMessage.error(inlineError.value)
    } finally {
      extracting.value = false
    }
  }

  input.value = ''
}

function removeDocument(id: string) {
  documents.value = documents.value.filter((doc) => doc.id !== id)
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}
</script>

<template>
  <section class="panel">
    <div class="section-head">
      <div>
        <p class="eyebrow">{{ localeStore.t('pdf.eyebrow') }}</p>
        <h2>{{ localeStore.t('pdf.title') }}</h2>
      </div>
      <label class="icon-button upload-button" :title="localeStore.t('pdf.upload')" :aria-label="localeStore.t('pdf.upload')">
        <FileText :size="18" />
        <input type="file" accept="application/pdf" multiple aria-label="Select PDF files" @change="handleFiles" />
      </label>
    </div>

    <div v-if="documents.length === 0" class="empty-zone">
      {{ localeStore.t('pdf.empty') }}
    </div>

    <el-alert
      v-if="inlineError"
      :title="inlineError"
      type="error"
      show-icon
      :closable="true"
      class="inline-alert"
      @close="dismissError"
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
  </section>
</template>

<style scoped>
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

.inline-alert {
  margin-bottom: 10px;
}

@media (max-width: 768px) {
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
