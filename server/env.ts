import 'dotenv/config'

interface EnvConfig {
  readonly PORT: number
  readonly OPENAI_API_KEY?: string
  readonly ANTHROPIC_API_KEY?: string
  readonly GEMINI_API_KEY?: string
  readonly ZAI_API_KEY?: string
  readonly ZHIPU_API_KEY?: string
  readonly TOKEN_COUNTER_API_KEY?: string
}

function validateEnv(): EnvConfig {
  const port = Number(process.env.PORT ?? 8787)

  const optionalKeys = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GEMINI_API_KEY', 'ZAI_API_KEY', 'ZHIPU_API_KEY'] as const
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
    TOKEN_COUNTER_API_KEY: process.env.TOKEN_COUNTER_API_KEY,
  })
}

export const env = validateEnv()
