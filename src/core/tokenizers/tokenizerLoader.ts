import type { HfTokenizerConfig } from './huggingfaceTokenizer.js'

const TOKENIZER_CACHE = new Map<string, HfTokenizerConfig>()

const MODEL_TO_HF_REPO: Record<string, string> = {
  'deepseek-chat': 'deepseek-ai/DeepSeek-V3.2',
  'deepseek-reasoner': 'deepseek-ai/DeepSeek-R1',
  'deepseek-r1': 'deepseek-ai/DeepSeek-R1',
  'deepseek-v3': 'deepseek-ai/DeepSeek-V3',
  'deepseek-v3-0324': 'deepseek-ai/DeepSeek-V3-0324',
  'deepseek-v3.1': 'deepseek-ai/DeepSeek-V3.1',
  'deepseek-v3.2': 'deepseek-ai/DeepSeek-V3.2',
  'deepseek-v4-flash': 'deepseek-ai/DeepSeek-V4-Flash',
  'deepseek-v4-pro': 'deepseek-ai/DeepSeek-V4-Pro',
  'qwen-max-latest': 'Qwen/Qwen2.5-72B-Instruct',
  'qwen-plus': 'Qwen/Qwen2.5-72B-Instruct',
  'qwen-turbo-latest': 'Qwen/Qwen2.5-72B-Instruct',
  'qwen-vl-plus': 'Qwen/Qwen2.5-VL-72B-Instruct',
  'qwen3-235b-a22b': 'Qwen/Qwen3-235B-A22B',
  'qwen3-32b': 'Qwen/Qwen3-32B',
  'qwen3-coder-flash': 'Qwen/Qwen3-Coder-30B-A3B-Instruct',
  'qwen3-coder-next': 'Qwen/Qwen3-Coder-30B-A3B-Instruct',
  'qwen3-coder-plus': 'Qwen/Qwen3-Coder-30B-A3B-Instruct',
  'qwen3.6-plus': 'Qwen/Qwen3-32B',
  'qwen3.7-max': 'Qwen/Qwen3-32B',
  'qwen3.7-max-2026-05-20': 'Qwen/Qwen3-32B',
  'qwq-32b': 'Qwen/QwQ-32B',
  'mimo-v2.5-pro': 'XiaomiMiMo/MiMo-7B-RL',
  'mimo-v2.5': 'XiaomiMiMo/MiMo-7B-RL',
  'mimo-7b-rl': 'XiaomiMiMo/MiMo-7B-RL',
  'mistral-large-latest': 'mistralai/Mistral-Large-Instruct-2411',
  'mistral-small-latest': 'mistralai/Mistral-Small-Instruct-2503',
  'llama-3.1-70b': 'meta-llama/Llama-3.1-70B-Instruct',
  'llama-3.3-70b': 'meta-llama/Llama-3.3-70B-Instruct',
  'llama-4-scout': 'meta-llama/Llama-4-Scout-17B-16E-Instruct',
  'llama-4-maverick': 'meta-llama/Llama-4-Maverick-17B-128E-Instruct',
  'ernie-4.5-8k': 'baidu/ERNIE-4.5-0.3B-PT',
}

export function getTokenizerRepoMap() {
  return { ...MODEL_TO_HF_REPO }
}

export function getHfRepoForModel(modelId: string): string | undefined {
  return MODEL_TO_HF_REPO[modelId]
}

export async function loadTokenizerConfig(repo: string): Promise<HfTokenizerConfig> {
  const cached = TOKENIZER_CACHE.get(repo)
  if (cached) return cached

  const [org, repoName] = repo.split('/')
  const tokenizerUrl =
    typeof window === 'undefined'
      ? `https://huggingface.co/${repo}/resolve/main/tokenizer.json`
      : `/api/tokenizer/${org}/${repoName}`

  const response = await fetch(tokenizerUrl)
  if (!response.ok) {
    throw new Error(`Failed to load tokenizer for ${repo}: ${response.status}`)
  }

  const config: HfTokenizerConfig = await response.json()
  TOKENIZER_CACHE.set(repo, config)
  return config
}
