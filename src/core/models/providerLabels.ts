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

export const providerMarks: Record<Provider, string> = {
  openai: 'O',
  anthropic: 'C',
  google: 'G',
  deepseek: 'D',
  alibaba: 'Q',
  zhipu: 'Z',
  xiaomi: 'M',
  mistral: 'Mi',
  meta: 'L',
  huggingface: 'HF',
}

export const providerAccents: Record<Provider, string> = {
  openai: '#8bf9d4',
  anthropic: '#ffcf99',
  google: '#8eb7ff',
  deepseek: '#67e8f9',
  alibaba: '#ff8a3d',
  zhipu: '#a78bfa',
  xiaomi: '#ffb86b',
  mistral: '#ffdb6e',
  meta: '#8ab4ff',
  huggingface: '#ffd166',
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
