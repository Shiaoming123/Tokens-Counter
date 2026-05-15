import type { Provider } from '../../types/domain'

export const providerLabels: Record<Provider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic Claude',
  google: 'Google Gemini',
  deepseek: 'DeepSeek',
  alibaba: '阿里云 Qwen',
  zhipu: '智谱 GLM / Z.AI',
  xiaomi: '小米 MiMo',
  mistral: 'Mistral',
  meta: 'Meta Llama',
  huggingface: 'Hugging Face',
}

export const providerOrder: Provider[] = [
  'openai',
  'deepseek',
  'alibaba',
  'zhipu',
  'xiaomi',
  'anthropic',
  'google',
  'mistral',
  'meta',
  'huggingface',
]
