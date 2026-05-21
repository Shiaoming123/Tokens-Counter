# Early Access Operating Model

Last updated: 2026-05-21

This document defines the lightest practical commercial path for Tokens Counter while it is still run by an individual developer.

## Positioning

Do not launch the first paid version as a full self-serve SaaS with subscriptions, invoices, team admin, and automated quota billing.

Launch it as an Early Access API and cost-audit workflow:

- free web workbench for public discovery,
- manually approved API keys for selected users,
- clear usage limits,
- explicit accuracy and pricing disclaimers,
- direct feedback loop with early users,
- optional paid custom pricing profiles or private deployment support.

This keeps operational risk low while validating whether developers and small teams will pay for AI cost estimation and token audit workflows.

## Recommended First Commercial Flow

1. User finds the web app, GitHub repo, article, or community post.
2. User tests the free workbench.
3. User clicks "Apply for Early Access API" or emails the maintainer at `henshiaoming@gmail.com`.
4. Maintainer asks for:
   - intended use case,
   - estimated monthly request volume,
   - required models or pricing profiles,
   - whether inputs contain sensitive data,
   - whether official provider counting is required.
5. Maintainer manually approves or rejects.
6. Maintainer creates an API key through environment configuration or a simple key store.
7. User receives:
   - API key,
   - usage limit,
   - API docs,
   - accuracy disclaimer,
   - feedback/contact channel.
8. Maintainer reviews usage and feedback weekly.

## Initial Offers

### Free

- Web workbench.
- Local estimates where possible.
- Public docs and examples.
- Best for personal prompt checks and model comparison.

### Pro API Early Access

Suggested first price: CNY 49-99 per month, or free for the first 5-10 serious testers.

Includes:

- one API key,
- basic monthly request limit,
- access to `/api/v1/models`, `/api/v1/estimates`, and `/api/v1/tokens/count`,
- official/catalog and CC Switch pricing profiles,
- usage summary in API responses,
- direct feedback channel.

### Team / Studio Early Access

Suggested first price: CNY 199-499 per month, or custom quote.

Includes:

- multiple API keys or named projects when key storage is ready,
- custom pricing profile support,
- usage export,
- priority model/pricing corrections,
- private onboarding call.

### Custom / Private

Suggested first price: CNY 1000+ one-time or monthly retainer.

Includes:

- private deployment support,
- custom model catalog,
- custom pricing table,
- cost-audit report for a real Agent/RAG/API workload.

## What To Avoid For Now

- Do not build a full subscription platform before there is demand.
- Do not promise automatic billing, enterprise SLA, or guaranteed invoice accuracy.
- Do not store raw prompts, images, PDFs, or tool schemas by default.
- Do not advertise "official" pricing unless the source is actually the provider.
- Do not imply partnership with OpenAI, Anthropic, Google, DeepSeek, Qwen, or other providers.
- Do not run broad automated cold outreach.

## Manual API Key Policy

For the first Early Access users, a simple manual policy is acceptable:

- use `TOKEN_COUNTER_API_KEYS` for a small number of approved testers,
- rotate keys if they leak,
- keep per-key names in a private operator note,
- keep default rate limits conservative,
- review server logs only for metadata, not raw user content.

Before opening the API to unknown public users, add persistent key storage, quota checks, shared rate limits, and usage metering.

## Data Handling Policy

Default posture:

- local browser estimates should stay local where possible,
- official counting mode may send content to the selected provider,
- external API requests should not be logged with raw text, images, PDFs, or tool schemas,
- usage events should store metadata only: request id, key id/hash, model count, input token count, status, latency, and estimated cost.

Suggested retention:

- request metadata: 30 days during beta,
- API key records: until revoked,
- raw payloads: do not store by default,
- support/debug payloads: only with explicit user permission.

## Minimum Pages Before Public Promotion

- Accuracy disclaimer.
- Pricing source and freshness notes.
- Privacy policy.
- Terms of use.
- Security/contact page.
- Early Access application instructions.

## Current Next Step

Finish the v1 preview hardening first:

- payload limits,
- official-only fallback behavior,
- usage response fields and headers,
- trust metadata,
- OpenAPI and docs alignment,
- pricing trust gap report.

Then publish a small Early Access page and start with 10-20 hand-picked testers.

## Contact Channel

Use the same email already shown in the welcome dialog:

- Early Access requests: `henshiaoming@gmail.com`
- Security, pricing correction, or model support requests: `henshiaoming@gmail.com`

Suggested subject lines:

- `[AI Token Counter] Early Access request`
- `[AI Token Counter] Pricing correction`
- `[AI Token Counter] Security or privacy concern`
