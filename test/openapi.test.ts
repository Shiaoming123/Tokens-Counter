import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('OpenAPI schema', () => {
  it('publishes the public v1 endpoint contract', () => {
    const spec = JSON.parse(readFileSync('docs/openapi.json', 'utf8'))

    expect(spec.openapi).toMatch(/^3\./)
    expect(spec.paths['/models'].get).toBeTruthy()
    expect(spec.paths['/estimates'].post).toBeTruthy()
    expect(spec.paths['/tokens/count'].post).toBeTruthy()
    expect(spec.components.securitySchemes.bearerAuth).toMatchObject({
      type: 'http',
      scheme: 'bearer',
    })
  })
})
