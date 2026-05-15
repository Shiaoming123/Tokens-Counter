<script setup lang="ts">
import { accuracyBadgeTypes, accuracyLabels } from '../core/accuracy/accuracyLevel'
import type { AccuracyLevel } from '../types/domain'

defineProps<{
  level: AccuracyLevel
}>()
</script>

<template>
  <el-tag :type="accuracyBadgeTypes[level]" effect="light" round>
    {{ accuracyLabels[level] }}
  </el-tag>
</template>
