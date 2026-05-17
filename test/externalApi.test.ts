import { describe, expect, it } from 'vitest'
import { app } from '../server/index'

function request(path: string, init?: RequestInit) {
  return app.fetch(new Request(`http://localhost${path}`, init))
}

describe('external token API', () => {
  it('returns exposed models', async () => {
    const response = await request('/api/v1/models')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(response.headers.get('X-RateLimit-Limit')).toBe('120')
    expect(body.data.length).toBeGreaterThan(0)
    expect(body.data[0]).toEqual(
      expect.objectContaining({
        model: expect.any(String),
        provider: expect.any(String),
        display_name: expect.any(String),
        capabilities: expect.any(Object),
        pricing: expect.any(Object),
      }),
    )
  })

  it('creates a text estimate', async () => {
    const response = await request('/api/v1/estimates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        models: ['gpt-4o'],
        input: { text: 'Count this short prompt.' },
        options: { expected_output_tokens: 100 },
      }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.object).toBe('estimate')
    expect(body.request_id).toMatch(/^req_/)
    expect(body.input_summary).toMatchObject({
      message_count: 0,
      image_count: 0,
      redacted: false,
    })
    expect(body.results).toHaveLength(1)
    expect(body.summary).toEqual(
      expect.objectContaining({
        total_input_tokens: expect.any(Number),
        cheapest_model: 'gpt-4o',
        cheapest_cost: expect.any(Number),
        models_compared: 1,
        currency: 'USD',
      }),
    )
    expect(body.results[0]).toEqual(
      expect.objectContaining({
        model: 'gpt-4o',
        provider: 'openai',
        count: expect.objectContaining({
          input_tokens: expect.any(Number),
          text_tokens: expect.any(Number),
          expected_output_tokens: 100,
          total_tokens: expect.any(Number),
        }),
        cost: expect.objectContaining({
          currency: 'USD',
          total: expect.any(Number),
          pricing: expect.any(Object),
        }),
      }),
    )
  })

  it('replays matching estimate requests with the same Idempotency-Key', async () => {
    const payload = {
      models: ['gpt-4o'],
      input: { text: 'Count this once and replay it.' },
      options: { expected_output_tokens: 50 },
    }
    const init = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': 'vitest-replay-001' },
      body: JSON.stringify(payload),
    }

    const first = await request('/api/v1/estimates', init)
    const second = await request('/api/v1/estimates', init)
    const firstBody = await first.json()
    const secondBody = await second.json()

    expect(first.status).toBe(200)
    expect(first.headers.get('Idempotency-Status')).toBe('stored')
    expect(second.status).toBe(200)
    expect(second.headers.get('Idempotency-Status')).toBe('replayed')
    expect(secondBody.id).toBe(firstBody.id)
    expect(secondBody.request_id).toBe(firstBody.request_id)
  })

  it('rejects reused idempotency keys with a different body', async () => {
    const first = await request('/api/v1/estimates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': 'vitest-conflict-001' },
      body: JSON.stringify({
        models: ['gpt-4o'],
        input: { text: 'first body' },
      }),
    })
    const second = await request('/api/v1/estimates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': 'vitest-conflict-001' },
      body: JSON.stringify({
        models: ['gpt-4o'],
        input: { text: 'second body' },
      }),
    })
    const body = await second.json()

    expect(first.status).toBe(200)
    expect(second.status).toBe(409)
    expect(body.error).toEqual(
      expect.objectContaining({
        code: 'invalid_request',
        param: 'Idempotency-Key',
      }),
    )
  })

  it('accepts public option aliases from the API spec', async () => {
    const response = await request('/api/v1/estimates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        models: ['gpt-4o'],
        input: { text: 'Count with documented option names.' },
        options: {
          output_tokens: 123,
          cache_hit_tokens: 10,
          cache_write_tokens: 5,
          image_detail: 'low',
          use_official_api: false,
        },
      }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.results[0].count.expected_output_tokens).toBe(123)
  })

  it('counts text tokens without cost fields', async () => {
    const response = await request('/api/v1/tokens/count', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        models: ['gpt-4o'],
        input: { text: 'Count only this prompt.' },
      }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.object).toBe('token_count')
    expect(body.results).toHaveLength(1)
    expect(body.results[0]).toEqual(
      expect.objectContaining({
        model: 'gpt-4o',
        input_tokens: expect.any(Number),
        text_tokens: expect.any(Number),
        image_tokens: 0,
        total_tokens: expect.any(Number),
        warnings: expect.any(Array),
      }),
    )
    expect(body.results[0].cost).toBeUndefined()
  })

  it('returns a standard error for an invalid model', async () => {
    const response = await request('/api/v1/estimates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        models: ['not-a-model'],
        input: { text: 'hello' },
      }),
    })
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({
      error: expect.objectContaining({
        code: 'model_not_supported',
        message: expect.any(String),
        details: expect.any(Object),
        request_id: expect.stringMatching(/^req_/),
      }),
    })
  })

  it('returns a standard error for empty input', async () => {
    const response = await request('/api/v1/tokens/count', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        models: ['gpt-4o'],
        input: { text: '   ' },
      }),
    })
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toEqual(
      expect.objectContaining({
        code: 'invalid_request',
        param: 'input',
        details: expect.any(Object),
        request_id: expect.stringMatching(/^req_/),
      }),
    )
  })

  it('keeps count field names consistent between estimate and count responses', async () => {
    const payload = {
      models: ['gpt-4o'],
      input: { text: 'The same prompt should produce compatible count fields.' },
    }
    const estimateResponse = await request('/api/v1/estimates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const countResponse = await request('/api/v1/tokens/count', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const estimateBody = await estimateResponse.json()
    const countBody = await countResponse.json()

    const estimateCountKeys = Object.keys(estimateBody.results[0].count).filter(
      (key) => key !== 'expected_output_tokens',
    )
    const countKeys = Object.keys(countBody.results[0]).filter((key) => key !== 'model' && key !== 'provider')

    expect(estimateCountKeys.sort()).toEqual(countKeys.sort())
  })

  it('documents optional official count endpoints as protected server proxies', async () => {
    const response = await request('/api/count/cohere', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelId: 'command-r',
        input: { text: 'hello', images: [] },
      }),
    })
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toContain('COHERE_API_KEY')
  })
})
