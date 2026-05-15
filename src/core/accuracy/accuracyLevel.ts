import type { AccuracyLevel } from '../../types/domain'

export const accuracyLabels: Record<AccuracyLevel, string> = {
  official_exact: '官方精确',
  official_estimate: '官方估算',
  local_exact: '本地精确',
  local_estimate: '本地近似',
  unsupported: '不支持',
}

export const accuracyBadgeTypes: Record<AccuracyLevel, 'success' | 'primary' | 'warning' | 'danger' | 'info'> = {
  official_exact: 'success',
  official_estimate: 'success',
  local_exact: 'primary',
  local_estimate: 'warning',
  unsupported: 'danger',
}
