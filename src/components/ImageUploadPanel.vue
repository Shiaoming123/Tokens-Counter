<script setup lang="ts">
import { ImagePlus, Trash2 } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import { getImageMetadata } from '../core/vision/imageMetadata'
import type { ImageMetadata } from '../types/domain'

const images = defineModel<ImageMetadata[]>({ required: true })

async function handleFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])

  for (const file of files) {
    try {
      const metadata = await getImageMetadata(file)
      images.value = [...images.value, metadata]
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '图片读取失败')
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
        <p class="eyebrow">Vision</p>
        <h2>图片输入</h2>
      </div>
      <label class="icon-button upload-button" title="上传图片">
        <ImagePlus :size="18" />
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple @change="handleFiles" />
      </label>
    </div>

    <div v-if="images.length === 0" class="empty-zone">
      上传 JPG、PNG、WEBP 或 GIF，系统只读取尺寸和 base64 供官方计数模式使用。
    </div>

    <div v-else class="image-list">
      <div v-for="image in images" :key="image.id" class="image-row">
        <div>
          <strong>{{ image.name }}</strong>
          <span>{{ image.width }}×{{ image.height }} · {{ image.mimeType }} · {{ formatBytes(image.sizeBytes) }}</span>
        </div>
        <button class="icon-button" title="移除图片" @click="removeImage(image.id)">
          <Trash2 :size="16" />
        </button>
      </div>
    </div>
  </section>
</template>
