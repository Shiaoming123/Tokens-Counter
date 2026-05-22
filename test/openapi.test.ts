import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('OpenAPI schema', () => {
  it('publishes the public v1 endpoint contract', () => {
    const spec = JSON.parse(readFileSync('docs/openapi.json', 'utf8'))

    expect(spec.openapi).toMatch(/^3\./)
    expect(spec.paths['/models'].get).toBeTruthy()
    expect(spec.paths['/estimates'].post).toBeTruthy()
    expect(spec.paths['/tokens/count'].post).toBeTruthy()
    expect(spec.paths['/estimates'].post.responses['413']).toBeTruthy()
    expect(spec.paths['/estimates'].post.responses['502']).toBeTruthy()
    expect(spec.paths['/tokens/count'].post.responses['413']).toBeTruthy()
    expect(spec.paths['/tokens/count'].post.responses['502']).toBeTruthy()
    expect(spec.components.securitySchemes.bearerAuth).toMatchObject({
      type: 'http',
      scheme: 'bearer',
    })

    const estimateHeaders = spec.paths['/estimates'].post.responses['200'].headers
    expect(estimateHeaders['X-TokenCounter-Model-Count']).toBeTruthy()
    expect(estimateHeaders['X-TokenCounter-Input-Tokens']).toBeTruthy()
    expect(estimateHeaders['X-TokenCounter-Official-Calls']).toBeTruthy()

    expect(spec.components.schemas.EstimateResponse.required).toEqual(
      expect.arrayContaining(['input_summary', 'summary', 'usage', 'results']),
    )
    expect(spec.components.schemas.TokenCountResponse.required).toEqual(expect.arrayContaining(['usage', 'results']))
    expect(spec.components.schemas.UsageSummary.description).toContain('not a persisted billing record')
    expect(spec.components.schemas.TrustMetadata.properties.billable_usage_note.description).toContain('Provider invoice')
    expect(spec.components.schemas.EstimateOptions.properties.allow_fallback.description).toContain('official_count_failed')
    expect(spec.components.schemas.EstimateOptions.properties.prefer_official_count.description).toContain('send')
    expect(spec.components.schemas.ErrorResponse.properties.error.properties.code.enum).toEqual(
      expect.arrayContaining(['payload_too_large', 'official_count_failed']),
    )
  })
})
