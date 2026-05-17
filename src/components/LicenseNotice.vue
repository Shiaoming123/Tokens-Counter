<script setup lang="ts">
import { ElTag } from 'element-plus'
import { useLocaleStore } from '../stores/locale'
import type { LicenseNotice } from '../types/domain'

const localeStore = useLocaleStore()

defineProps<{
  licenses: LicenseNotice[]
}>()
</script>

<template>
  <section class="licenses-layout">
    <div class="license-hero">
      <p class="eyebrow">{{ localeStore.t('license.eyebrow') }}</p>
      <h1>{{ localeStore.t('license.title') }}</h1>
      <p>{{ localeStore.t('license.description') }}</p>
    </div>

    <div class="license-list">
      <article v-for="item in licenses" :key="item.id" class="license-item">
        <div>
          <h2>{{ item.name }}</h2>
          <p>{{ item.usage }}</p>
          <p v-if="item.risk" class="risk">{{ item.risk }}</p>
        </div>
        <div class="license-meta">
          <ElTag>{{ item.license }}</ElTag>
          <ElTag :type="item.noticeRequired ? 'warning' : 'info'">
            {{ item.noticeRequired ? localeStore.t('license.noticeRequired') : localeStore.t('license.noNotice') }}
          </ElTag>
          <a v-if="item.url" :href="item.url" target="_blank" rel="noreferrer">{{ localeStore.t('license.view') }}</a>
        </div>
      </article>
    </div>
  </section>
</template>
