# Project Maintenance Review

Last reviewed: 2026-05-17
Scope: project structure, model catalog evolution, tokenizer architecture, API/UI counting reuse, i18n/theme/docs/tests. This document is implementation-ready guidance only; no code changes are required by this review.

## Executive Summary

The project already has a useful separation between UI state (`src/stores`), reusable counting/cost logic (`src/core`), model metadata (`src/data`), a worker-based tokenizer path (`src/workers`), and server routes (`server`). That is the right direction for a token/cost estimator that must evolve quickly as providers release new models.

The main maintenance risk is that "model support" is not yet a single product surface. A new model can require edits in `src/data/models.json`, `src/data/model-pricing.json`, `src/types/domain.ts`, `src/core/models/providerLabels.ts`, `src/core/tokenizers/tokenizerLoader.ts`, `server/index.ts`, `src/workers/tokenizer.worker.ts`, tests, docs, and UI labels. This makes additions fragile and encourages inconsistent accuracy, pricing, logo, capability, and tokenizer behavior.

The second major risk is duplicate estimate orchestration. The UI store (`src/stores/counter.ts`) has provider-specific official API/fallback logic, while the public API service (`src/core/estimate/externalEstimateService.ts`) normalizes input and builds local results only. The shared `resultBuilder` is good, but the decision engine above it should also be shared so UI and API return the same behavior for official count APIs, local tokenizer fallback, warnings, and accuracy.

## Current Structure

### Strengths

- `src/core` contains domain logic that can be tested without Vue components: result building, cost calculation, model registry, tokenizers, vision formulas, document extraction, history, and external estimates.
- `src/data/models.json`, `src/data/model-pricing.json`, and `src/data/licenses.json` make the model catalog inspectable without digging through UI code.
- `modelRegistry.ts` already overlays pricing from `model-pricing.json`, which is a good stepping stone toward separating catalog identity from fast-changing price metadata.
- `tokenizerClient.ts` splits tiktoken work from worker-based Hugging Face tokenizers, reducing UI thread risk for heavier tokenization.
- `server/index.ts` already exposes both UI-facing official count endpoints and `/api/v1` external API endpoints.
- Tests cover cost calculation, approximate token counting, model registry, model ordering, result building, Hugging Face tokenizer primitives, external API shape, and history.

### Risks

- Model metadata is duplicated and partially divergent. `models.json` embeds `pricing`, while `model-pricing.json` overrides it. A future maintainer may update one and miss the other.
- Provider metadata is code-defined in `providerLabels.ts`, while capabilities are split across booleans on `ModelConfig`, route-specific `modelHasCapability`, and UI assumptions.
- Provider logo handling is centralized in `ProviderLogo.vue`, but brand mark, color, label, and provider order are not part of a unified provider catalog.
- Tokenizer capability is encoded in several places: `ModelConfig.tokenizer.type`, `tokenizerLoader.ts` model-to-repo map, `tokenizer.worker.ts` `HF_TOKENIZER_TYPES`, and `server/index.ts` `ALLOWED_HF_REPOS`.
- Official count API support is route-specific and provider-specific in `counter.ts` and `server/index.ts`; external API estimates do not share that path.
- Warning text is hardcoded in result-building and store code, not represented as structured warning codes. This makes i18n, API stability, and regression tests harder.
- Several source/test strings appear vulnerable to encoding corruption in terminal output. Confirm files are UTF-8 and add checks before expanding Chinese copy or docs.
- `server/index.ts` has many responsibilities: external API validation/serialization, official provider count calls, tokenizer proxying, static serving, auth headers, and model projection.

## Catalog Evolution

### Target Shape

Treat the model catalog as layered metadata:

- `providers`: provider identity, display labels, official website/docs URLs, brand color, logo strategy, default order, API support flags.
- `models`: stable model identity, aliases, provider, family, lifecycle status, context window, modality support, tokenizer profile ID, vision profile ID, official count profile ID, license references.
- `pricing`: model ID, region, currency, price dimensions, source URL, last verified date, confidence/status.
- `tokenizerProfiles`: reusable tokenizer config, algorithm, encoding/repo/files, runtime, license, accuracy baseline.
- `visionProfiles`: reusable image/video/PDF formulas or official-only profile.
- `capabilities`: derived from model fields and profiles, not hand-coded per route.

Implementation-ready directory proposal:

```text
src/data/catalog/
  providers.json
  models.json
  pricing.json
  tokenizer-profiles.json
  vision-profiles.json
  licenses.json
src/core/catalog/
  catalogRegistry.ts
  catalogValidation.ts
  capabilities.ts
  pricingResolver.ts
```

### Migration From Current Files

1. Keep the current public imports from `src/core/models/modelRegistry.ts` stable, but internally delegate to a new `catalogRegistry`.
2. Move provider labels, marks, accents, and order from `providerLabels.ts` into `providers.json`; keep `providerLabels.ts` as a compatibility adapter until UI imports are migrated.
3. Make `model-pricing.json` the source of truth for prices. Remove embedded `pricing` from `models.json` only after tests assert every priced model resolves through `pricingResolver`.
4. Add `pricing.status`: `verified`, `manual`, `stale`, `unavailable`, or `estimated`. Avoid zero-price placeholders for models whose price is unknown unless explicitly `self_hosted` or `free`.
5. Add aliases as catalog data. `/api/v1/models` currently returns `aliases: []`; aliases should be first-class to keep external integrations stable.
6. Add `lastVerified` and `sourceUrl` consistently to pricing and tokenizer profile metadata. Free-form `source` strings are useful for humans but not enough for maintenance.

### Capability Rules

Replace route-local capability logic with a shared function:

```ts
deriveCapabilities(model, profiles) => {
  text: boolean
  messages: boolean
  image: boolean
  pdf: boolean
  tools: boolean
  localCount: boolean
  officialCount: boolean
  localTokenizer: boolean
  visionFormula: boolean
  costEstimate: boolean
}
```

The API, UI filters, model selector badges, and tests should all read from the same derived capabilities. This prevents a model from showing as "official_count" in one place and local-only elsewhere.

## Tokenizer Architecture

### Current State

- OpenAI tiktoken encodings are handled in `openaiTokenizer.ts` with dynamic imports.
- Hugging Face `tokenizer.json` support is implemented in `huggingfaceTokenizer.ts`, loaded through `tokenizerLoader.ts`, and executed in `tokenizer.worker.ts`.
- Unknown or unsupported tokenizers fall back to `approxTokenizer.ts`.
- Provider/model-specific warnings are currently emitted in `resultBuilder.ts`.

### Target Abstraction

Introduce a tokenizer adapter interface that hides where the count came from:

```ts
interface TokenizerAdapter {
  id: string
  kind: 'tiktoken' | 'huggingface_tokenizer_json' | 'sentencepiece' | 'official_api' | 'approx'
  runtime: 'main_thread' | 'worker' | 'server' | 'remote'
  supports(model: ModelConfig): boolean
  count(input: TokenizerTextInput, context: CountContext): Promise<TokenCountOutcome>
}
```

`TokenCountOutcome` should include:

- `tokens`
- `accuracy`
- `method`
- `adapterId`
- `warnings: WarningCode[]`
- `debug` metadata, optional
- `fallbackFrom`, optional

Recommended files:

```text
src/core/tokenizers/
  adapters/
    approxAdapter.ts
    tiktokenAdapter.ts
    hfTokenizerJsonAdapter.ts
    officialCountAdapter.ts
  tokenizerRegistry.ts
  tokenizerProfiles.ts
  tokenizerTypes.ts
```

### Worker Boundary

Keep the worker, but make it profile-based instead of model-ID based. The UI should ask for a tokenizer profile such as `qwen2_5_byte_bpe`, not require the worker to know every model ID.

Low-risk change:

- Add `tokenizerProfileId` to each model.
- Keep `getHfRepoForModel(modelId)` while adding `getTokenizerProfile(model.tokenizerProfileId)`.
- Move `HF_TOKENIZER_TYPES`, `MODEL_TO_HF_REPO`, and `ALLOWED_HF_REPOS` into the profile catalog.
- Worker request becomes `{ requestId, text, jobs: [{ modelId, tokenizerProfileId }] }`.

### Fixtures And Accuracy Baselines

Add fixtures per tokenizer family, not only synthetic tokenizer configs:

```text
test/fixtures/tokenizers/
  tiktoken-o200k.json
  qwen2_5.json
  deepseek-v3.json
  mistral-large.json
  llama-3_1.json
```

Each fixture should define:

- tokenizer profile ID
- source URL and retrieval date
- input text
- expected token count
- expected official count, if available
- tolerance, if only approximate

This lets maintainers add a model by proving either exact local parity or explicitly documented approximation.

## Worker, Fallback, Official APIs, And Local Tokenizers

### Desired Count Strategy

Every model should resolve to an ordered plan:

1. Official count API, if requested and configured.
2. Local exact tokenizer, if available.
3. Local estimate tokenizer or vision formula.
4. Unsupported result with clear warning.

Represent this as data:

```ts
countPlan: [
  { method: 'official_count_api', adapter: 'anthropic_messages_count_tokens', requiresApiKey: 'ANTHROPIC_API_KEY' },
  { method: 'local_tokenizer', adapter: 'hf_tokenizer_json', tokenizerProfileId: 'claude_sentencepiece_estimate' },
  { method: 'local_tokenizer', adapter: 'approx' }
]
```

The engine should produce structured fallback traces, for example:

```json
{
  "method": "local_tokenizer",
  "accuracy": "local_estimate",
  "warnings": [
    { "code": "official_count_unavailable", "provider": "anthropic" },
    { "code": "fallback_used", "from": "official_count_api", "to": "local_tokenizer" }
  ]
}
```

### Official Count API Layer

Move provider calls out of `server/index.ts` into:

```text
server/providers/
  anthropicCount.ts
  googleCount.ts
  openaiCount.ts
  zaiCount.ts
server/providerCountRegistry.ts
```

Then expose a single server handler that calls `countOfficial(provider, request)`. The UI-facing `/api/count/:provider` routes can remain as compatibility routes, but should share the same provider adapters used by `/api/v1`.

Important behavior to standardize:

- `allow_fallback=false` should return an official-count failure instead of silently using local estimates.
- `prefer_official_count=true` should affect both UI and external API paths.
- Missing API keys should be warning + fallback when fallback is allowed, and a safe error when it is not.
- Official APIs that return only total input tokens should mark text/image split as estimated.

## API/UI Estimate Service Deduplication

### Current Duplication

- `src/stores/counter.ts` owns model loop, official API attempts, fallback warnings, pending/error results, history insertion, and currency normalization.
- `src/core/estimate/externalEstimateService.ts` owns external input normalization, model resolution, local token pre-counting, and local result building.
- Both use `buildLocalResult`, but only UI uses `buildOfficialResult` and provider official APIs.

### Recommended Shared Engine

Create a pure estimate engine:

```text
src/core/estimate/
  estimateEngine.ts
  inputNormalizer.ts
  countPlanner.ts
  resultSerializers.ts
```

Engine input:

```ts
estimateModels({
  modelIds,
  input,
  options,
  officialCounter,
  localTokenizer,
  now,
})
```

Engine output:

- `results`
- `failures`
- `inputSummary`
- `events` or structured warnings

UI responsibilities should shrink to:

- collect local form state into `CountInput`
- call shared engine through a browser-compatible official counter client
- update loading state/history/currency display

External API responsibilities should shrink to:

- validate HTTP body
- call the same engine with server official counter adapters
- serialize results into snake_case response shape

This keeps estimate behavior identical while letting UI and API keep different presentation needs.

## i18n, Theme, And Document Pages

### i18n

Current `locales.ts` is simple and works, but it will become hard to maintain as warnings and docs grow.

Recommended steps:

1. Split translations by namespace:

```text
src/i18n/
  en.json
  zh.json
  keys.ts
  format.ts
```

2. Add a test that every key exists in every locale.
3. Convert warning strings into stable warning codes and localize in UI only.
4. Keep API warning messages stable in English, but include warning codes so clients can localize.
5. Add an encoding/UTF-8 sanity test for translation files and common Chinese strings.

### Theme

Current theme store supports `light`, `dark`, and `system`, with a fixed `apple` style. This is enough for now.

Recommended next step:

- Move design tokens into CSS variables grouped by semantic purpose: surface, text, border, accent, danger, warning, success, chart/provider colors.
- Keep provider colors catalog-driven, but avoid treating provider color as a theme token.
- Add visual regression screenshots for light/dark if UI maintenance continues.

### Document Pages

The app currently has a simple navigation store and a `/licenses` page. Documentation lives in `docs/` and `doc/`, outside the app.

Recommended approach:

- Keep product/engineering docs in `docs/`.
- Keep research artifacts in `doc/tokenizer-research/`.
- Add a lightweight in-app docs route only for user-facing material: API quickstart, licenses, accuracy labels, privacy notes.
- Avoid duplicating API contract examples in both app copy and `docs/external-token-api.md`; import or generate examples from a shared source later if the API becomes public.

## Test Strategy

### Keep

- Unit tests for cost, tokenizer primitives, result builder, registry, model ordering, and external API response shape.

### Add Soon

- Catalog validation tests:
  - every model has a provider
  - every provider has label/color/order/logo metadata
  - every model has pricing status
  - every `licenseRef` exists
  - every tokenizer profile referenced by a model exists
  - every official count profile references a supported provider adapter
- Pricing consistency tests:
  - no embedded pricing drift after migration
  - `lastUpdated` or `lastVerified` format is valid
  - unknown prices are `unavailable`, not silently `0`
- Count strategy tests:
  - official success
  - missing API key fallback allowed
  - missing API key fallback disallowed
  - local tokenizer timeout fallback to approx
  - image/text split when official API returns only total input tokens
- Worker tests:
  - known profile loads correct repo
  - disallowed repo cannot be fetched
  - worker returns structured errors and fallback results
- API/UI parity tests:
  - same input/model/options produce same internal `TokenCountResult` from UI engine and API engine
  - `/api/v1/estimates` and `/api/v1/tokens/count` serialize the same count fields
- i18n tests:
  - all translation keys complete
  - no replacement placeholders are missing per locale

### Later

- Golden tokenizer fixture tests against provider official examples.
- Contract tests from an OpenAPI schema.
- Browser smoke tests for model selection, text/image/PDF/tool input, history restore, theme, locale, and licenses page.

## Recent Priorities

1. Extract shared estimate engine from `counter.ts` and `externalEstimateService.ts`.
2. Add catalog validation tests before further model additions.
3. Move provider metadata into data and derive capabilities from shared catalog logic.
4. Add tokenizer profile IDs and move model-to-repo/allowed-repo mappings into tokenizer profiles.
5. Standardize fallback behavior with `preferOfficialCount` and `allowFallback`.
6. Convert warning strings to warning codes plus UI localization.
7. Split official count provider adapters out of `server/index.ts`.
8. Add first real tokenizer fixture set for OpenAI o200k, Qwen, DeepSeek, Mistral, and Llama.

## Low-Risk Migration Route

### Phase 1: Guardrails

- Add catalog validation tests against the current files.
- Add tests for UI/API estimate parity around local-only counting.
- Add a small warning-code type while keeping existing warning strings.

### Phase 2: Shared Engine

- Move input normalization from `externalEstimateService.ts` into reusable `inputNormalizer.ts`.
- Move provider count orchestration from `counter.ts` into `estimateEngine.ts`.
- Let `counter.ts` call the engine and keep only UI state/history responsibilities.
- Let `/api/v1` call the same engine and keep only HTTP validation/serialization.

### Phase 3: Catalog Profiles

- Add `providers.json` and adapt `providerLabels.ts` to read it.
- Add `tokenizer-profiles.json` while keeping `tokenizerLoader.ts` model map as fallback.
- Add `vision-profiles.json` after tokenizer profiles stabilize.
- Convert `modelHasCapability` to shared `deriveCapabilities`.

### Phase 4: Server Decomposition

- Move official provider count calls into `server/providers/*`.
- Move tokenizer proxy allowlist to catalog/profile data.
- Keep existing route paths stable.

### Phase 5: Metadata Cleanup

- Remove embedded `pricing` from models once `pricingResolver` has complete test coverage.
- Replace free-form source strings with `sourceUrl`, `sourceLabel`, `lastVerified`, and `status`.
- Add alias support to model resolution and external API responses.

## Definition Of Done For Adding A Model

A new model should require a checklist, not code archaeology:

- Add or update provider metadata only if provider is new.
- Add model record with provider, family, aliases, context, modality support, lifecycle status, license refs.
- Attach tokenizer profile, vision profile, official count profile, and pricing record.
- Add or update tokenizer fixture or mark profile as approximate with documented reason.
- Add pricing source URL and verification date.
- Run catalog validation tests.
- Run tokenizer/result/API tests relevant to the model.
- Confirm UI model selector displays label, logo/mark, capability badges, price, and accuracy correctly.
