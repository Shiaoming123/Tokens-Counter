# External API Production Checklist

Before opening the Token Counter API to external users, keep the current v1 endpoints but harden the runtime around them.

## Access Control

- Require `TOKEN_COUNTER_API_KEY` or a real API key table in every non-local environment.
- Support API key rotation, revocation, scopes, and per-key usage attribution.
- Restrict CORS to known origins for browser clients.
- Keep admin/debug endpoints off the public API surface.

## Abuse Protection

- Replace static rate-limit headers with enforced per-key and per-IP limits.
- Add request body size limits for text, multimodal payloads, PDFs, and tool schemas.
- Add concurrency limits for expensive official count calls.
- Persist idempotency keys for estimate requests that clients may retry.

## Privacy And Logging

- Do not log raw prompts, messages, images, PDFs, or tool payloads by default.
- Add a request `redact` option or server-side redaction policy for diagnostics.
- Store usage metadata separately from sensitive input content.
- Define retention windows for request records and estimate history.

## Billing And Quotas

- Track request count, model count, input tokens, official counting calls, and estimated cost per API key.
- Return quota-specific errors before doing expensive work.
- Add daily/monthly usage exports for operators and customers.

## Correctness

- Version model aliases and pricing metadata so old integrations remain reproducible.
- Return `pricing.status: unavailable` instead of zero-price fallbacks when a model has no trusted pricing.
- Add official count API integration per provider behind a capability flag.
- Publish an OpenAPI schema and keep tests aligned with the schema examples.

## Operations

- Run behind TLS and a reverse proxy with timeout limits.
- Add structured request IDs, metrics, and alerting for error rate, latency, and rate-limit events.
- Add SDK or curl examples for auth, retries, idempotency, and error handling.
- Run load tests for large text payloads and high model fan-out before raising limits.
