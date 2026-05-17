<script setup lang="ts">
import { ElTag, ElTooltip } from 'element-plus'
import { accuracyBadgeTypes, accuracyLabels, accuracyShortLabels, accuracyTooltips } from '../core/accuracy/accuracyLevel'
import type { AccuracyLevel } from '../types/domain'

defineProps<{
  level: AccuracyLevel
  short?: boolean
}>()
</script>

<template>
  <ElTooltip :content="accuracyTooltips[level]" placement="top">
    <ElTag :type="accuracyBadgeTypes[level]" effect="light" :size="short ? 'small' : 'default'" round>
      {{ short ? accuracyShortLabels[level] : accuracyLabels[level] }}
    </ElTag>
  </ElTooltip>
</template>
