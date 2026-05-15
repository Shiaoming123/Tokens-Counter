<script setup lang="ts">
import { computed } from 'vue'

const text = defineModel<string>({ required: true })

const stats = computed(() => {
  const value = text.value
  const cjk = value.match(/[\u3400-\u9fff]/g)?.length ?? 0
  const words = value.match(/[A-Za-z0-9_]+(?:[-'][A-Za-z0-9_]+)*/g)?.length ?? 0
  return { chars: value.length, cjk, words }
})
</script>

<template>
  <section class="panel input-panel">
    <div class="section-head">
      <div>
        <p class="eyebrow">Text</p>
        <h2>文本输入</h2>
      </div>
      <div class="micro-stats">
        <span>{{ stats.chars }} 字符</span>
        <span>{{ stats.cjk }} 中文字</span>
        <span>{{ stats.words }} 英文词</span>
      </div>
    </div>
    <el-input
      v-model="text"
      type="textarea"
      :autosize="{ minRows: 12, maxRows: 18 }"
      resize="none"
      placeholder="粘贴 prompt、文章、代码或多轮对话内容..."
    />
  </section>
</template>
