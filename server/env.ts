import 'dotenv/config'

interface EnvConfig {
  readonly PORT: number
  readonly OPENAI_API_KEY?: string
  readonly ANTHROPIC_API_KEY?: string
  readonly GEMINI_API_KEY?: string
  readonly ZAI_API_KEY?: string
  readonly ZHIPU_API_KEY?: string
  readonly COHERE_API_KEY?: string
  readonly MOONSHOT_API_KEY?: string
  readonly STEPFUN_API_KEY?: string
  readonly XAI_API_KEY?: string
  readonly TOKEN_COUNTER_API_KEY?: string
  readonly TOKEN_COUNTER_API_KEYS?: string
  readonly TOKEN_COUNTER_RATE_LIMIT_MAX: number
  readonly TOKEN_COUNTER_RATE_LIMIT_WINDOW_MS: number
  readonly TOKEN_COUNTER_MAX_BODY_BYTES: number
  readonly TOKEN_COUNTER_MAX_MODELS_PER_REQUEST: number
  readonly TOKEN_COUNTER_MAX_TEXT_BYTES: number
  readonly TOKEN_COUNTER_MAX_MESSAGES: number
  readonly TOKEN_COUNTER_MAX_IMAGES: number
  readonly TOKEN_COUNTER_MAX_IMAGE_BYTES: number
}

function validateEnv(): EnvConfig {
  const port = Number(process.env.PORT ?? 8787)

  const optionalKeys = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'GEMINI_API_KEY',
    'ZAI_API_KEY',
    'ZHIPU_API_KEY',
    'COHERE_API_KEY',
    'MOONSHOT_API_KEY',
    'STEPFUN_API_KEY',
    'XAI_API_KEY',
  ] as const
  for (const key of optionalKeys) {
    if (!process.env[key]) {
      process.stderr.write(`[env] ${key} not set - related features will be unavailable.\n`)
    }
  }

  return Object.freeze({
    PORT: port,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    ZAI_API_KEY: process.env.ZAI_API_KEY,
    ZHIPU_API_KEY: process.env.ZHIPU_API_KEY,
    COHERE_API_KEY: process.env.COHERE_API_KEY,
    MOONSHOT_API_KEY: process.env.MOONSHOT_API_KEY,
    STEPFUN_API_KEY: process.env.STEPFUN_API_KEY,
    XAI_API_KEY: process.env.XAI_API_KEY,
    TOKEN_COUNTER_API_KEY: process.env.TOKEN_COUNTER_API_KEY,
    TOKEN_COUNTER_API_KEYS: process.env.TOKEN_COUNTER_API_KEYS,
    TOKEN_COUNTER_RATE_LIMIT_MAX: Number(process.env.TOKEN_COUNTER_RATE_LIMIT_MAX ?? 120),
    TOKEN_COUNTER_RATE_LIMIT_WINDOW_MS: Number(process.env.TOKEN_COUNTER_RATE_LIMIT_WINDOW_MS ?? 60 * 60 * 1000),
    TOKEN_COUNTER_MAX_BODY_BYTES: Number(process.env.TOKEN_COUNTER_MAX_BODY_BYTES ?? 256 * 1024),
    TOKEN_COUNTER_MAX_MODELS_PER_REQUEST: Number(process.env.TOKEN_COUNTER_MAX_MODELS_PER_REQUEST ?? 20),
    TOKEN_COUNTER_MAX_TEXT_BYTES: Number(process.env.TOKEN_COUNTER_MAX_TEXT_BYTES ?? 128 * 1024),
    TOKEN_COUNTER_MAX_MESSAGES: Number(process.env.TOKEN_COUNTER_MAX_MESSAGES ?? 100),
    TOKEN_COUNTER_MAX_IMAGES: Number(process.env.TOKEN_COUNTER_MAX_IMAGES ?? 8),
    TOKEN_COUNTER_MAX_IMAGE_BYTES: Number(process.env.TOKEN_COUNTER_MAX_IMAGE_BYTES ?? 2 * 1024 * 1024),
  })
}

export const env = validateEnv()
