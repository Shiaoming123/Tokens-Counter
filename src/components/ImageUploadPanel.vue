<script setup lang="ts">
import { ref } from 'vue'
import { ImagePlus, Trash2 } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import { getImageMetadata } from '../core/vision/imageMetadata'
import { useLocaleStore } from '../stores/locale'
import type { ImageMetadata } from '../types/domain'

const localeStore = useLocaleStore()

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_IMAGE_COUNT = 20
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])

const images = defineModel<ImageMetadata[]>({ required: true })
const inlineError = ref<string | null>(null)

function dismissError() {
  inlineError.value = null
}

async function handleFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])

  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      inlineError.value = localeStore.t('error.unsupportedImage', { type: file.type || file.name })
      ElMessage.error(inlineError.value)
      continue
    }

    if (file.size > MAX_IMAGE_SIZE) {
      inlineError.value = localeStore.t('error.imageTooLarge', { name: file.name, size: (file.size / 1024 / 1024).toFixed(1) })
      ElMessage.error(inlineError.value)
      continue
    }

    if (images.value.length >= MAX_IMAGE_COUNT) {
      inlineError.value = localeStore.t('error.maxImages', { max: MAX_IMAGE_COUNT })
      ElMessage.error(inlineError.value)
      break
    }

    try {
      const metadata = await getImageMetadata(file)
      images.value = [...images.value, metadata]
    } catch (error) {
      inlineError.value = error instanceof Error ? error.message : localeStore.t('error.readImage')
      ElMessage.error(inlineError.value)
    }
  }

  input.value = ''
}

function removeImage(id: string) {
  images.value = images.value.filter((image) => image.id !== id)
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
        <p class="eyebrow">{{ localeStore.t('tab.image') }}</p>
        <h2>{{ localeStore.t('image.upload') }}</h2>
      </div>
      <label class="icon-button upload-button" :title="localeStore.t('image.upload')" :aria-label="localeStore.t('image.upload')">
        <ImagePlus :size="18" />
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple aria-label="Select image files" @change="handleFiles" />
      </label>
    </div>

    <div v-if="images.length === 0" class="empty-zone">
      {{ localeStore.t('image.empty') }}
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
  </section>
</template>

<style scoped>
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

.inline-alert {
  margin-bottom: 10px;
}

@media (max-width: 768px) {
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
}
</style>
