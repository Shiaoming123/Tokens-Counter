<script setup lang="ts">
import { computed } from 'vue'
import {
  siAlibabacloud,
  siAnthropic,
  siBaidu,
  siBytedance,
  siClaude,
  siDeepseek,
  siGooglegemini,
  siHuggingface,
  siMeta,
  siMinimax,
  siMistralai,
  siMoonshotai,
  siQwen,
  siX,
  siXiaomi,
  type SimpleIcon,
} from 'simple-icons'
import { providerAccents, providerLabels, providerMarks } from '../core/models/providerLabels'
import type { Provider } from '../types/domain'

const props = withDefaults(defineProps<{
  provider: Provider
  size?: number
}>(), {
  size: 22,
})

const providerIcons: Partial<Record<Provider, SimpleIcon>> = {
  anthropic: siClaude ?? siAnthropic,
  google: siGooglegemini,
  deepseek: siDeepseek,
  alibaba: siQwen ?? siAlibabacloud,
  xiaomi: siXiaomi,
  mistral: siMistralai,
  meta: siMeta,
  huggingface: siHuggingface,
  xai: siX,
  baidu: siBaidu,
  bytedance: siBytedance,
  moonshot: siMoonshotai,
  minimax: siMinimax,
}

const label = computed(() => providerLabels[props.provider])
const accent = computed(() => providerAccents[props.provider])
const mark = computed(() => providerMarks[props.provider])
const icon = computed(() => providerIcons[props.provider])
const sizePx = computed(() => `${props.size}px`)
</script>

<template>
  <span
    class="provider-logo"
    :style="{ '--logo-accent': accent, width: sizePx, height: sizePx }"
    :title="label"
    :aria-label="label"
    role="img"
  >
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect class="logo-bg" x="1" y="1" width="30" height="30" rx="8" />

      <g v-if="icon" class="brand-icon" transform="translate(6 6) scale(0.833333)">
        <path :d="icon.path" />
      </g>

      <g v-else-if="provider === 'openai'" class="logo-stroke">
        <path d="M16 6.2c2.3 0 4.1 1.2 5.2 3.1 2.2.1 4.1 1.4 5.1 3.3 1.1 2 .9 4.3-.2 6.1 1 2 .7 4.4-.7 6.1-1.4 1.8-3.6 2.5-5.7 2.1-1.2 1.8-3.2 2.9-5.5 2.7-2.2-.1-4.1-1.4-5.1-3.3-2.2-.2-4-1.5-5.1-3.4-1-2-.8-4.2.3-6-1-2-.8-4.4.6-6.2 1.4-1.7 3.6-2.5 5.7-2 1.2-1.6 3.1-2.5 5.4-2.5Z" />
        <path d="M10.5 8.9 21.3 15M26 18.7 15.8 24.8M21.2 9.3l-.1 12.4M10.7 22.8l10.6-6.1M6 13.1l10.3 6.1M15.8 7.2v12.1" />
      </g>

      <text v-else x="16" y="20.5" text-anchor="middle">{{ mark }}</text>
    </svg>
  </span>
</template>

<style scoped>
.provider-logo {
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  color: var(--logo-accent);
}

.provider-logo svg {
  width: 100%;
  height: 100%;
  display: block;
}

.logo-bg {
  fill: color-mix(in srgb, var(--logo-accent), white 88%);
  stroke: color-mix(in srgb, var(--logo-accent), white 46%);
  stroke-width: 1.2;
}

.brand-icon {
  fill: color-mix(in srgb, var(--logo-accent), #0f172a 16%);
}

.logo-stroke {
  fill: none;
  stroke: color-mix(in srgb, var(--logo-accent), #0f172a 16%);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

text {
  fill: color-mix(in srgb, var(--logo-accent), #0f172a 20%);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0;
}

[data-theme="dark"] .logo-bg {
  fill: color-mix(in srgb, var(--logo-accent), #111827 74%);
  stroke: color-mix(in srgb, var(--logo-accent), #111827 35%);
}

[data-theme="dark"] .brand-icon {
  fill: color-mix(in srgb, var(--logo-accent), white 12%);
}

[data-theme="dark"] .logo-stroke {
  stroke: color-mix(in srgb, var(--logo-accent), white 12%);
}

[data-theme="dark"] text {
  fill: color-mix(in srgb, var(--logo-accent), white 12%);
}
</style>
