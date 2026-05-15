import { existsSync } from 'node:fs'
import { join } from 'node:path'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenAI } from '@google/genai'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import licenses from '../src/data/licenses.json' with { type: 'json' }
import models from '../src/data/models.json' with { type: 'json' }
import pricing from '../src/data/model-pricing.json' with { type: 'json' }
import type { CountInput } from '../src/types/domain'

interface OfficialRequest {
  modelId: string
  input: CountInput
}

const app = new Hono()
const port = Number(process.env.PORT ?? 8787)

app.use('/api/*', cors())

app.get('/api/models', (context) => context.json({ models, licenses }))
app.get('/api/pricing', (context) => context.json(pricing))

app.post('/api/count/anthropic', async (context) => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return context.json({ error: '缺少 ANTHROPIC_API_KEY，Claude 官方计数不可用。' }, 401)
  }

  const body = await context.req.json<OfficialRequest>()
  const anthropic = new Anthropic({ apiKey })
  const hasImages = body.input.images.length > 0
  const content = hasImages
    ? [
        ...body.input.images.map((image) => ({
          type: 'image',
          source: {
            type: 'base64',
            media_type: image.mimeType,
            data: image.base64 ?? '',
          },
        })),
        {
          type: 'text',
          text: body.input.text || 'Describe this image.',
        },
      ]
    : body.input.text

  const result = await anthropic.messages.countTokens({
    model: body.modelId,
    messages: [
      {
        role: 'user',
        content,
      },
    ],
  } as never)

  return context.json({
    inputTokens: result.input_tokens,
    accuracy: 'official_estimate',
    method: 'official_count_api',
    warnings: ['Claude 计数来自 Anthropic 官方 count_tokens endpoint，实际请求 usage 仍可能有细微差异。'],
  })
})

app.post('/api/count/gemini', async (context) => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return context.json({ error: '缺少 GEMINI_API_KEY，Gemini 已回退本地估算。' }, 401)
  }

  const body = await context.req.json<OfficialRequest>()
  const ai = new GoogleGenAI({ apiKey })
  const parts = [
    ...(body.input.text ? [{ text: body.input.text }] : []),
    ...body.input.images.map((image) => ({
      inlineData: {
        mimeType: image.mimeType,
        data: image.base64 ?? '',
      },
    })),
  ]

  const result = await ai.models.countTokens({
    model: body.modelId,
    contents: [{ role: 'user', parts }],
  } as never)

  return context.json({
    inputTokens: Number(result.totalTokens ?? 0),
    accuracy: 'official_estimate',
    method: 'official_count_api',
    warnings: ['Gemini 计数来自 Google GenAI countTokens。多模态和 thinking/cached usage 以实际调用 metadata 为准。'],
  })
})

const distPath = join(process.cwd(), 'dist')
if (existsSync(distPath)) {
  app.use('/*', serveStatic({ root: distPath }))
  app.get('*', serveStatic({ path: join(distPath, 'index.html') }))
}

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Token counter API listening on http://localhost:${info.port}`)
})
