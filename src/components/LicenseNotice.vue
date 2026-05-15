<script setup lang="ts">
import type { LicenseNotice } from '../types/domain'

defineProps<{
  licenses: LicenseNotice[]
}>()
</script>

<template>
  <section class="licenses-layout">
    <div class="license-hero">
      <p class="eyebrow">Compliance</p>
      <h1>许可证与计数方式说明</h1>
      <p>
        本工具不会把闭源模型的第三方 tokenizer 标成官方。官方 API、开源 tokenizer、图片规则估算会在结果里明确显示准确度和方法。
      </p>
    </div>

    <div class="license-list">
      <article v-for="item in licenses" :key="item.id" class="license-item">
        <div>
          <h2>{{ item.name }}</h2>
          <p>{{ item.usage }}</p>
          <p v-if="item.risk" class="risk">{{ item.risk }}</p>
        </div>
        <div class="license-meta">
          <el-tag>{{ item.license }}</el-tag>
          <el-tag :type="item.noticeRequired ? 'warning' : 'info'">
            {{ item.noticeRequired ? '需保留声明' : '无需本地声明' }}
          </el-tag>
          <a v-if="item.url" :href="item.url" target="_blank" rel="noreferrer">查看</a>
        </div>
      </article>
    </div>
  </section>
</template>
