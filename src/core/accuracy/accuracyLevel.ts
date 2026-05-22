import type { AccuracyLevel } from '../../types/domain.js'

export const accuracyLabels: Record<AccuracyLevel, string> = {
  official_exact: 'Official Exact',
  official_estimate: 'Official Est.',
  local_exact: 'Local Exact',
  local_estimate: 'Local Est.',
  unsupported: 'Unsupported',
}

export const accuracyShortLabels: Record<AccuracyLevel, string> = {
  official_exact: 'Official',
  official_estimate: 'Official',
  local_exact: 'Local',
  local_estimate: 'Local',
  unsupported: 'N/A',
}

export const accuracyBadgeTypes: Record<AccuracyLevel, 'success' | 'primary' | 'warning' | 'danger' | 'info'> = {
  official_exact: 'success',
  official_estimate: 'success',
  local_exact: 'primary',
  local_estimate: 'warning',
  unsupported: 'danger',
}

export const accuracyTooltips: Record<AccuracyLevel, string> = {
  official_exact: 'Official API returns exact token count',
  official_estimate: 'Official API, some features (images) are estimated',
  local_exact: 'Local exact tokenizer (e.g. tiktoken)',
  local_estimate: 'Local approximate tokenizer, results may vary',
  unsupported: 'This model does not support token counting',
}
