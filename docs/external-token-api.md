# External Token API Specification

Status: implemented v1 preview
Base path: `/api/v1`  
Content type: `application/json; charset=utf-8`

This document defines the public API contract for the Token Counter service. It is intentionally separate from the internal UI routes so the external API can stay stable while the workbench evolves.

Current implementation notes:

- `GET /api/v1/models`, `POST /api/v1/estimates`, and `POST /api/v1/tokens/count` are implemented.
- `GET /api/v1/estimates/:id` is reserved for future persisted estimates and is not implemented yet.
- Bearer authentication is enforced when `TOKEN_COUNTER_API_KEY` or comma-separated `TOKEN_COUNTER_API_KEYS` is configured. Public deployments should always configure an API key source.
- Rate-limit headers are backed by an in-memory per-key/IP limiter. Production deployments should persist quotas in shared storage when running multiple instances.
- A machine-readable OpenAPI 3.1 schema is published at [`docs/openapi.json`](./openapi.json).
- Cost estimates support `official` and `ccswitch` pricing profiles, with input/output/cache prices split in the response.
- Usage summaries and `X-TokenCounter-*` response headers are request telemetry for the current response. They are not a promise that persisted usage records, paid billing, or durable customer quota accounting are enabled.

## Conventions

- All request and response bodies are JSON.
- All authenticated requests use `Authorization: Bearer <api_key>`.
- Future multi-tenant routing may accept `project_id` or `workspace_id` in request bodies or headers, but clients should not depend on either field being required in v1.
- Estimate creation endpoints accept `Idempotency-Key` to safely retry requests.
- All successful responses include rate limit headers:
  - `X-RateLimit-Limit`: total allowed requests in the current window.
  - `X-RateLimit-Remaining`: requests remaining in the current window.
  - `X-RateLimit-Reset`: Unix timestamp in seconds when the current window resets.
- Successful counting and estimate responses include request usage headers derived from the response `usage` object:
  - `X-TokenCounter-Model-Count`: number of models successfully counted.
  - `X-TokenCounter-Input-Tokens`: aggregate input tokens across successful model results.
  - `X-TokenCounter-Official-Calls`: number of provider official count calls made for this request.
- Timestamps are ISO 8601 strings unless otherwise noted.
- Model identifiers use the service registry IDs, such as `gpt-4o`, `claude-sonnet-4.5`, or `glm-4.5`.

## Authentication

Clients must send an API key with every external API request:

```http
Authorization: Bearer tc_live_...
Content-Type: application/json
```

Missing, malformed, expired, or revoked API keys return `401 unauthorized`. Valid keys without access to a requested project, workspace, model, or feature return `403 forbidden`.

## Standard Error Shape

All non-2xx responses use this shape:

```json
{
  "error": {
    "code": "invalid_request",
    "message": "models must contain at least one model id",
    "param": "models",
    "request_id": "req_01JZ9Y8R5VJ4B6W1K3Q6N6P6P5",
    "details": {
      "minimum": 1
    }
  }
}
```

Error fields:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `error.code` | string | yes | Stable machine-readable error code. |
| `error.message` | string | yes | Human-readable summary. Do not parse this field. |
| `error.param` | string or null | no | Request field associated with validation failures. |
| `error.request_id` | string | yes | Request identifier for logs and support. |
| `error.details` | object | no | Additional structured context safe to expose to clients. |

Standard error codes:

| Code | HTTP status | Meaning |
| --- | ---: | --- |
| `invalid_request` | 400 | JSON is malformed, required fields are missing, fields are invalid, or an unsupported parameter combination was requested. |
| `unauthorized` | 401 | API key is missing, malformed, expired, or revoked. |
| `forbidden` | 403 | API key is valid but not allowed to access the requested resource. |
| `rate_limited` | 429 | Client exceeded the configured request limit. |
| `model_not_supported` | 400 | Requested model is unknown or unsupported for the requested operation. |
| `pricing_unavailable` | 422 | Token count succeeded but cost cannot be estimated because pricing data is unavailable. |
| `payload_too_large` | 413 | Request body, text, messages, or image payloads exceed configured limits. |
| `official_count_failed` | 502 | Upstream official count API failed and no acceptable fallback was requested or available. |
| `internal_error` | 500 | Unexpected server error. |

### Payload Limits

Preview deployments enforce configurable payload ceilings before any provider official count call is attempted. Defaults are:

| Limit | Default | Applies to |
| --- | ---: | --- |
| `TOKEN_COUNTER_MAX_BODY_BYTES` | 262144 | Raw JSON request body. |
| `TOKEN_COUNTER_MAX_MODELS_PER_REQUEST` | 20 | Length of `models`. |
| `TOKEN_COUNTER_MAX_TEXT_BYTES` | 131072 | Combined `input.text` and message content bytes. |
| `TOKEN_COUNTER_MAX_MESSAGES` | 100 | Length of `input.messages`. |
| `TOKEN_COUNTER_MAX_IMAGES` | 8 | Length of `input.images`. |
| `TOKEN_COUNTER_MAX_IMAGE_BYTES` | 2097152 | Combined decoded bytes estimated from inline image base64. |

When a limit is exceeded, the API returns `413 payload_too_large` with `error.param` pointing to the rejected field and safe numeric details such as `maximum_bytes`, `actual_bytes`, `maximum_text_bytes`, or `actual_image_bytes`. The service should reject these requests before forwarding text, messages, or image payloads to provider APIs.

## Shared Types

### InputPayload

`input` accepts one or more of `text`, `messages`, and `images`. At least one content field must be present.

```json
{
  "text": "Summarize this release note.",
  "messages": [
    { "role": "system", "content": "You are concise." },
    { "role": "user", "content": "Summarize this release note." }
  ],
  "images": [
    {
      "mime_type": "image/png",
      "width": 1280,
      "height": 720,
      "base64": "iVBORw0KGgo..."
    }
  ]
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `text` | string | no | Plain input text. Used when `messages` is omitted. |
| `messages` | array | no | Chat-style messages. Takes precedence over `text` for models counted through message APIs. |
| `messages[].role` | `system`, `user`, `assistant`, `tool` | yes | Message role. Providers that do not support a role must map or reject during validation. |
| `messages[].content` | string | yes | Message content. |
| `images` | array | no | Image metadata and optional inline data for vision token counting. |
| `images[].mime_type` | string | yes | Supported MIME type, for example `image/png`, `image/jpeg`, `image/webp`, or `image/gif`. |
| `images[].width` | integer | recommended | Pixel width. Required for local vision formulas when `base64` is omitted. |
| `images[].height` | integer | recommended | Pixel height. Required for local vision formulas when `base64` is omitted. |
| `images[].base64` | string | no | Base64 image bytes. Required only for official provider count APIs that need image content. |

### CountResult

```json
{
  "model": "gpt-4o",
  "provider": "openai",
  "input_tokens": 518,
  "text_tokens": 178,
  "image_tokens": 340,
  "total_tokens": 1218,
  "context_window": 128000,
  "context_usage_ratio": 0.009516,
  "accuracy": {
    "text": "local_exact",
    "image": "local_estimate",
    "overall": "local_estimate"
  },
  "count_methods": {
    "text": "local_tokenizer",
    "image": "vision_formula"
  },
  "warnings": [],
  "trust": {
    "count_accuracy": "local_estimate",
    "count_method": "local_tokenizer",
    "pricing_source": "manual",
    "pricing_last_updated": "2026-05-15",
    "pricing_verified": true,
    "billable_usage_note": "Provider invoice usage remains the source of truth; local estimates and pricing profiles are for planning and comparison."
  }
}
```

Accuracy labels should reuse existing engine labels where possible: `official_estimate`, `local_exact`, `local_estimate`, `unsupported`, and `unavailable`.

### TrustMetadata

Every count result includes `trust` metadata so clients can display caveats without parsing warning text:

| Field | Type | Meaning |
| --- | --- | --- |
| `count_accuracy` | string | Overall accuracy label, for example `official_estimate`, `local_exact`, or `local_estimate`. |
| `count_method` | string | Counting path used, for example `official_count_api`, `local_tokenizer`, or `vision_formula`. |
| `pricing_source` | string or null | Pricing data source label. |
| `pricing_last_updated` | string or null | Last update date known for the pricing metadata. |
| `pricing_verified` | boolean | True when pricing metadata has both a source and update date. |
| `billable_usage_note` | string | Reminder that provider invoices remain the source of truth for billable usage. |

Trust metadata is descriptive. It does not certify provider billing, paid-plan entitlement, persistent quota, or durable usage ledger state.

### UsageSummary

Estimate and count responses include a per-request usage summary:

```json
{
  "request_count": 1,
  "model_count": 2,
  "input_tokens": 1036,
  "official_count_calls": 0,
  "estimated_cost": 0.02618
}
```

`usage` is scoped to the current API response. It is useful for client-side dashboards, logging, and retry accounting, but it is not a persisted billing or quota record unless a deployment separately documents that capability.

### CostEstimate

```json
{
  "currency": "USD",
  "input": 0.00259,
  "cached_input": 0,
  "cache_write": 0,
  "output": 0.0105,
  "total": 0.01309,
  "pricing": {
    "input_per_1m": 5,
    "output_per_1m": 15,
    "cached_input_per_1m": null,
    "cache_write_per_1m": null,
    "source": "manual",
    "last_updated": "2026-05-15"
  },
  "multiplier": 1
}
```

## GET `/api/v1/models`

Returns the model registry exposed to external clients.

### Query Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `provider` | string | no | Filter by provider, for example `openai`, `anthropic`, `google`, `zai`, `deepseek`, `qwen`, `mistral`, or `meta`. |
| `capability` | string | no | Filter by capability, for example `text`, `image`, `official_count`, `local_count`, or `cost_estimate`. |

### Response

```json
{
  "data": [
    {
      "model": "gpt-4o",
      "provider": "openai",
      "display_name": "GPT-4o",
      "aliases": ["gpt-4o-latest"],
      "context_window": 128000,
      "capabilities": {
        "text": true,
        "image": true,
        "messages": true,
        "cost_estimate": true,
        "official_count": false,
        "local_count": true
      },
      "pricing": {
        "currency": "USD",
        "input_per_1m": 5,
        "output_per_1m": 15,
        "cached_input_per_1m": null,
        "cache_write_per_1m": null,
        "source": "manual",
        "last_updated": "2026-05-15"
      },
      "count_methods": {
        "text": "local_tokenizer",
        "image": "vision_formula",
        "tokenizer": {
          "type": "tiktoken",
          "encoding": "o200k_base"
        },
        "vision": {
          "type": "openai_tile",
          "detail_levels": ["low", "high", "auto"]
        }
      }
    }
  ]
}
```

### Example

```bash
curl -sS "https://tokens.example.com/api/v1/models?capability=image" \
  -H "Authorization: Bearer $TOKEN_COUNTER_API_KEY"
```

## POST `/api/v1/estimates`

Creates a token and cost estimate for one or more models. Implementations may compute synchronously without storing the estimate. If persistence is not enabled, return an `id` that is a request-scoped identifier and document that `GET /api/v1/estimates/:id` is unavailable.

`Idempotency-Key` is required for clients that retry estimate creation. The server should return the same response for repeated requests with the same API key and idempotency key while the idempotency record is retained.

### Headers

| Header | Required | Description |
| --- | --- | --- |
| `Authorization` | yes | `Bearer <api_key>`. |
| `Content-Type` | yes | `application/json`. |
| `Idempotency-Key` | strongly recommended | Unique client-generated key for retry safety. Required when persistence or billing is enabled. |

### Request

```json
{
  "models": ["gpt-4o", "claude-sonnet-4.5"],
  "input": {
    "messages": [
      { "role": "system", "content": "You are concise." },
      { "role": "user", "content": "Summarize the attached project brief." }
    ],
    "images": [
      {
        "mime_type": "image/png",
        "width": 1280,
        "height": 720,
        "base64": "iVBORw0KGgo..."
      }
    ]
  },
  "options": {
    "expected_output_tokens": 700,
    "cached_input_tokens": 0,
    "cache_write_tokens": 0,
    "cost_multiplier": 1,
    "pricing_profile": "ccswitch",
    "prefer_official_count": true,
    "allow_fallback": true,
    "redact": false
  },
  "project_id": "proj_123",
  "workspace_id": "ws_123"
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `models` | string array | yes | One or more model IDs or aliases. |
| `input` | `InputPayload` | yes | Text, messages, and image inputs to count. |
| `options.expected_output_tokens` | integer | no | Expected output tokens used only for cost estimation. Defaults to `0`. |
| `options.cached_input_tokens` | integer | no | Tokens expected to be billed at cached input rate. Defaults to `0`. |
| `options.cache_write_tokens` | integer | no | Tokens expected to be billed at cache write rate. Defaults to `0`. |
| `options.cost_multiplier` | number | no | Explicit multiplier for proxy markup, discounts, or credit conversion. Defaults to `1`. |
| `options.pricing_profile` | string | no | Pricing table to use for cost estimation. Supported values: `official`, `ccswitch`. Defaults to `official`. |
| `options.prefer_official_count` | boolean | no | Prefer provider official count APIs when configured and supported. This can send request text, messages, images, and tool-shaped content to the provider selected by each model. Defaults to service policy. |
| `options.allow_fallback` | boolean | no | Allow local estimate when official counting fails or is unavailable. Defaults to `true`. When `prefer_official_count` or `use_official_api` is true and `allow_fallback` is false, official-count failure or unavailability returns `502 official_count_failed` instead of silently using local estimates. |
| `options.redact` | boolean | no | Redact prompt and image payloads from request logs and persisted records. Defaults to service policy, recommended `true` for sensitive workloads. Redaction does not prevent provider official count APIs from receiving content when official counting is requested. |
| `project_id` | string | no | Future project scope. |
| `workspace_id` | string | no | Future workspace scope. |

Supported compatibility aliases:

| Canonical field | Alias |
| --- | --- |
| `options.expected_output_tokens` | `options.output_tokens` |
| `options.cached_input_tokens` | `options.cache_hit_tokens` |
| `options.use_official_api` | `options.prefer_official_count` |

### Response

```json
{
  "id": "est_01JZ9YK3Z1CV3P6WZA8VH2TBZ7",
  "object": "estimate",
  "created_at": "2026-05-17T06:45:12.000Z",
  "request_id": "req_01JZ9YK3Z0NVR1M2N1ZKMS0SQ2",
  "input_summary": {
    "text_bytes": 0,
    "message_count": 2,
    "image_count": 1,
    "redacted": false
  },
  "usage": {
    "request_count": 1,
    "model_count": 1,
    "input_tokens": 518,
    "official_count_calls": 0,
    "estimated_cost": 0.01309
  },
  "results": [
    {
      "model": "gpt-4o",
      "provider": "openai",
      "count": {
        "input_tokens": 518,
        "text_tokens": 178,
        "image_tokens": 340,
        "expected_output_tokens": 700,
        "total_tokens": 1218,
        "context_window": 128000,
        "context_usage_ratio": 0.009516,
        "accuracy": {
          "text": "local_exact",
          "image": "local_estimate",
          "overall": "local_estimate"
        },
        "count_methods": {
          "text": "local_tokenizer",
          "image": "vision_formula"
        },
        "warnings": [],
        "trust": {
          "count_accuracy": "local_estimate",
          "count_method": "local_tokenizer",
          "pricing_source": "manual",
          "pricing_last_updated": "2026-05-15",
          "pricing_verified": true,
          "billable_usage_note": "Provider invoice usage remains the source of truth; local estimates and pricing profiles are for planning and comparison."
        }
      },
      "cost": {
        "currency": "USD",
        "input": 0.00259,
        "cached_input": 0,
        "cache_write": 0,
        "output": 0.0105,
        "total": 0.01309,
        "pricing": {
          "input_per_1m": 5,
          "output_per_1m": 15,
          "cached_input_per_1m": null,
          "cache_write_per_1m": null,
          "source": "manual",
          "last_updated": "2026-05-15"
        },
        "multiplier": 1
      },
      "warnings": [],
      "trust": {
        "count_accuracy": "local_estimate",
        "count_method": "local_tokenizer",
        "pricing_source": "manual",
        "pricing_last_updated": "2026-05-15",
        "pricing_verified": true,
        "billable_usage_note": "Provider invoice usage remains the source of truth; local estimates and pricing profiles are for planning and comparison."
      }
    }
  ]
}
```

`cost.input`, `cost.output`, `cost.cached_input`, and `cost.cache_write` are reported separately because provider and proxy billing tables usually price them differently. `cost.total` is the sum after applying `options.cost_multiplier`.

If at least one requested model succeeds and another fails, return `200` with per-model failures:

```json
{
  "id": "est_01JZ9YK3Z1CV3P6WZA8VH2TBZ7",
  "object": "estimate",
  "created_at": "2026-05-17T06:45:12.000Z",
  "request_id": "req_01JZ9YK3Z0NVR1M2N1ZKMS0SQ2",
  "results": [],
  "failures": [
    {
      "model": "unknown-model",
      "error": {
        "code": "model_not_supported",
        "message": "Model is not supported by this service.",
        "param": "models[0]"
      }
    }
  ]
}
```

If all requested models fail for the same request-level reason, return the appropriate non-2xx standard error.

### Example

```bash
curl -sS https://tokens.example.com/api/v1/estimates \
  -H "Authorization: Bearer $TOKEN_COUNTER_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: estimate-20260517-001" \
  -d '{
    "models": ["gpt-4o", "glm-4.5"],
    "input": {
      "text": "Write a concise product announcement for the new token estimator API.",
      "images": []
    },
    "options": {
      "expected_output_tokens": 500,
      "pricing_profile": "ccswitch",
      "allow_fallback": true,
      "redact": true
    }
  }'
```

## POST `/api/v1/tokens/count`

Counts tokens only. This endpoint is for clients that need token usage and context fit without price calculations.

### Request

```json
{
  "models": ["gpt-4o"],
  "input": {
    "text": "Count only this prompt.",
    "images": []
  },
  "options": {
    "prefer_official_count": false,
    "allow_fallback": true,
    "redact": true
  },
  "project_id": "proj_123"
}
```

Fields match `POST /api/v1/estimates`, except cost-only options are ignored.

### Response

```json
{
  "object": "token_count",
  "created_at": "2026-05-17T06:46:00.000Z",
  "request_id": "req_01JZ9YMJ9AM4E8XVRJR50P8HCK",
  "usage": {
    "request_count": 1,
    "model_count": 1,
    "input_tokens": 178,
    "official_count_calls": 0,
    "estimated_cost": 0
  },
  "results": [
    {
      "model": "gpt-4o",
      "provider": "openai",
      "input_tokens": 178,
      "text_tokens": 178,
      "image_tokens": 0,
      "total_tokens": 178,
      "context_window": 128000,
      "context_usage_ratio": 0.001391,
      "accuracy": {
        "text": "local_exact",
        "image": "unsupported",
        "overall": "local_exact"
      },
      "count_methods": {
        "text": "local_tokenizer",
        "image": "unsupported"
      },
      "warnings": [],
      "trust": {
        "count_accuracy": "local_exact",
        "count_method": "local_tokenizer",
        "pricing_source": "manual",
        "pricing_last_updated": "2026-05-15",
        "pricing_verified": true,
        "billable_usage_note": "Provider invoice usage remains the source of truth; local estimates and pricing profiles are for planning and comparison."
      }
    }
  ]
}
```

### Example

```bash
curl -sS https://tokens.example.com/api/v1/tokens/count \
  -H "Authorization: Bearer $TOKEN_COUNTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "models": ["gpt-4o"],
    "input": {
      "text": "Count only this prompt."
    }
  }'
```

## GET `/api/v1/estimates/:id`

Optional future endpoint. Implement only if estimates are persisted beyond the immediate request.

### Response

Return the same shape as `POST /api/v1/estimates`.

If persistence is unsupported, implementations should return:

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Estimate persistence is not enabled.",
    "param": "id",
    "request_id": "req_01JZ9YQ0ZPXGBZ47PAX9G0D3TF"
  }
}
```

Recommended HTTP status: `404` if estimate persistence exists but the ID is not found; `501` may be used during preview environments where the endpoint is advertised but intentionally disabled.

### Example

```bash
curl -sS https://tokens.example.com/api/v1/estimates/est_01JZ9YK3Z1CV3P6WZA8VH2TBZ7 \
  -H "Authorization: Bearer $TOKEN_COUNTER_API_KEY"
```

## Example Error Response

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json; charset=utf-8
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1778997600
```

```json
{
  "error": {
    "code": "rate_limited",
    "message": "Rate limit exceeded. Retry after the reset time.",
    "request_id": "req_01JZ9YRQ2K8YQ9F1WK2Q9Z2V7X",
    "details": {
      "retry_after_seconds": 42
    }
  }
}
```

### Payload Too Large Example

```http
HTTP/1.1 413 Payload Too Large
Content-Type: application/json; charset=utf-8
```

```json
{
  "error": {
    "code": "payload_too_large",
    "message": "input text exceeds the maximum allowed bytes",
    "param": "input",
    "request_id": "req_01JZ9YV61G7Y1CJQY1NE1Q4KSP",
    "details": {
      "maximum_text_bytes": 131072,
      "actual_text_bytes": 196608
    }
  }
}
```

### Official Count Failure Example

```http
HTTP/1.1 502 Bad Gateway
Content-Type: application/json; charset=utf-8
```

```json
{
  "error": {
    "code": "official_count_failed",
    "message": "External API official counting is not available yet; allow fallback or use local estimates.",
    "param": "options.allow_fallback",
    "request_id": "req_01JZ9YW7B07R8N8DPZB0KJQEFM",
    "details": {
      "prefer_official_count": true,
      "allow_fallback": false
    }
  }
}
```

## Security and Privacy Notes

- Enforce payload limits for total JSON body size, text bytes, message count, image count, base64 image bytes, and per-image dimensions. Return `payload_too_large` before forwarding content to provider APIs.
- Do not log sensitive prompt text, chat messages, image bytes, or raw base64 by default. Logs should keep request IDs, API key IDs, model IDs, byte counts, token counts, status codes, latency, and safe error codes.
- Support `options.redact`; when true, omit or hash prompt content in any persisted estimate records, traces, or analytics events.
- API keys should be hashed at rest, scoped to optional projects/workspaces, rotatable without downtime, and revocable immediately.
- Provider official counting can send user content to third-party APIs. When `prefer_official_count` or `use_official_api` is enabled, the service may forward prompt text, chat messages, image metadata, inline image base64, and other countable content to the provider endpoint for each selected model. `options.redact` only controls local logging/persistence behavior; it is not a provider-call privacy boundary.
- `prefer_official_count` should be explicit in externally documented examples, and responses should include warnings when upstream official APIs were used.
- CORS for external API keys should be restrictive. Browser clients should use short-lived project-scoped keys or a backend proxy instead of embedding long-lived secret keys.

## Implementation Notes

- Reuse the existing estimate engine and model registry data rather than duplicating tokenizer, vision, pricing, and accuracy logic in route handlers.
- Split a pure estimate service from UI state and browser-only history/export code. The external routes should call a deterministic service that accepts typed input and returns serializable count/cost results.
- Keep external response naming stable and API-oriented (`display_name`, `context_window`, `input_tokens`) even if internal TypeScript uses camelCase.
- Normalize model aliases before validation and include the canonical model ID in responses.
- Apply schema validation at route boundaries for headers, query parameters, and JSON bodies. Tests should cover missing auth, invalid JSON, unsupported models, payload limits, and mixed per-model success/failure.
- Add response consistency tests so `/api/v1/estimates` and `/api/v1/tokens/count` share the same count result fields and standard error shape.
- Add idempotency tests for repeated `POST /api/v1/estimates` requests with the same API key and `Idempotency-Key`.
- Keep official provider errors behind `official_count_failed` and expose only safe details. Preserve the upstream provider name and request status in server logs for debugging.
