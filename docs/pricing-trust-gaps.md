# Pricing Trust Gaps

Last reviewed: 2026-05-21
Scope: current catalog validation output, model pricing source-of-truth chain, CC Switch pricing profile risk, and the next pricing provenance model.

## Current Validation Signal

Command used:

```bash
npm run validate:catalog
```

Current result:

- `Catalog OK: 177 models, 177 pricing overrides, 20 license notices.`
- `warning: 56 catalog entries have no pricing source or lastUpdated.`
- The first 10 warnings printed by the validator are `gpt-4.1`, `gpt-4.1-mini`, `gpt-4.1-nano`, `gpt-4o`, `gpt-4o-mini`, `gpt-5`, `gpt-5.4`, `gpt-5.4-mini`, `gpt-5.4-nano`, and `gpt-5.5`; the remaining 46 are omitted by the script.

The 56 warning models are:

```text
gpt-4.1
gpt-4.1-mini
gpt-4.1-nano
gpt-4o
gpt-4o-mini
gpt-5
gpt-5.4
gpt-5.4-mini
gpt-5.4-nano
gpt-5.5
o3-mini
o4-mini
deepseek-r1
deepseek-v3-0324
deepseek-v4-flash
deepseek-v4-pro
qwen-max-latest
qwen-plus
qwen-turbo-latest
qwen-vl-plus
qwen3.6-plus
glm-4-flash
glm-4-plus
glm-4.5
glm-4.5-air
glm-4.5v
mimo-7b-rl
mimo-v2.5
mimo-v2.5-pro
claude-haiku-4.5
claude-opus-4-7
claude-opus-4.5
claude-sonnet-4
claude-sonnet-4-6
claude-sonnet-4.5
gemini-2.0-flash
gemini-2.5-flash
gemini-2.5-flash-lite
gemini-2.5-pro
gemini-2.5-pro-preview
gemini-3-flash-preview
gemini-3-pro-preview
mistral-large-latest
mistral-small-latest
llama-3.1-70b
llama-3.3-70b
llama-4-maverick
llama-4-scout
grok-3
grok-3-mini
grok-4.3
command-r
command-r-plus
ernie-4.5-8k
doubao-pro-256k
moonshot-v1-128k
```

Important nuance: every one of those 56 models has a corresponding `src/data/model-pricing.json` record with `source` or `lastUpdated`. The warning is about the embedded `pricing` object inside `src/data/models.json`, not about the runtime-resolved pricing object.

## Current Pricing Chain

There are three pricing layers in the repo today:

- `src/data/models.json` embeds a required `pricing` object on every model.
- `src/data/model-pricing.json` contains 177 model pricing records, one for each model ID.
- `src/data/pricing-profiles.json` defines profile-level overrides. The `official` profile has no records and therefore falls back to the model's resolved pricing; the `ccswitch` profile has 146 records.

Runtime behavior is not the same as validator warning behavior:

- `scripts/validate-catalog.mjs` validates both `models.json` embedded prices and `model-pricing.json` records.
- The validator only emits source-date warnings for the embedded `models.json` pricing records.
- `src/core/models/modelRegistry.ts` overlays `model-pricing.json` onto each model with `pricing: pricing[model.id] ?? model.pricing`.
- `src/core/pricing/pricingProfiles.ts` returns the model's resolved price for the `official` profile, and only applies profile override records for non-official profiles.

That means `model-pricing.json` is already the effective runtime source of truth, while `models.json` still acts as a schema-required fallback and a separate validator input. This split creates two audit problems:

- Maintainers can update the runtime price while the embedded fallback still looks untrusted.
- A future deletion or partial migration can silently expose stale embedded fallback prices.

Measured drift:

- `177 / 177` model IDs have a matching `model-pricing.json` record.
- `0` model-pricing records point to unknown model IDs.
- `0` models lack a pricing override.
- `69` embedded model prices differ from their `model-pricing.json` override.

## Source Classification Gap

Current `model-pricing.json` source strings are human-readable, but not machine-trustworthy enough. A rough classification of the 177 effective runtime prices is:

| Tier inferred from current source text | Count |
| --- | ---: |
| `proxy` / CC Switch-derived | 145 |
| `provider` / provider official text | 22 |
| `manual` | 5 |
| `other` provider-plan or credit notes | 4 |
| `unavailable/self-hosted` | 1 |

This is useful for a one-time audit, but the app cannot reliably expose it as product behavior because `source` is a free-form string. For example, `manual`, `OpenAI official pricing`, `CC Switch v9 seed pricing`, and `Xiaomi MiMo token plan, credits per token estimate` all share the same `ModelPricing` shape even though they imply different user trust.

The API already exposes `pricing_verified: Boolean(source && lastUpdated)`. That is too weak: a CC Switch seed price with a date becomes "verified" in the API even though it is not provider-official.

## CC Switch Naming Risk

The current docs describe:

- `official` as project catalog / provider documentation pricing.
- `ccswitch` as CC Switch preset pricing.

The data does not fully match that wording:

- `official.models` is empty, so official pricing falls back to the resolved model price.
- The resolved model price comes from `model-pricing.json`.
- `145` `model-pricing.json` records are currently CC Switch-derived.
- `145` `ccswitch` profile records are byte-for-byte identical to the effective catalog price.
- Only one CC Switch profile record currently differs from the effective catalog price: `claude-sonnet-4`, where the CC Switch profile adds cache pricing and uses a CC Switch source while the catalog record uses `Anthropic official pricing`.

So, for most models, selecting `Official / catalog` versus `CC Switch preset` does not currently separate provider pricing from proxy pricing. The UI label is still technically "catalog" because the value comes from the project catalog, but "Official" is risky when the underlying `source` is CC Switch seed data.

Near-term wording should avoid claiming provider-official pricing unless a record is actually in the provider tier. Longer term, the profile resolver should distinguish:

- provider-official catalog prices,
- proxy/coding-tool prices,
- manual estimates,
- unavailable prices.

## Recommended Pricing Layers

Do not blindly rewrite price numbers. First split trust metadata from numeric values.

Add explicit provenance fields to each effective pricing record:

```ts
type PricingTrustTier =
  | 'official'
  | 'provider'
  | 'proxy'
  | 'manual'
  | 'unavailable'

type PricingTrustStatus =
  | 'verified'
  | 'estimated'
  | 'stale'
  | 'unverified'
  | 'unavailable'
```

Suggested meaning:

| Layer | Use when | Required evidence |
| --- | --- | --- |
| `official` | The value is directly from the model provider's canonical published API pricing page or billing docs. | Provider URL, region, currency, last verified date, capture note. |
| `provider` | The value is from a provider-controlled surface but may be plan-specific, region-specific, credit-based, or normalized by us. | Provider URL or provider doc note, normalization rule, last verified date. |
| `proxy` | The value is from CC Switch or another proxy/coding-tool billing table. | Proxy source name, version/commit/date, model ID normalization rule. |
| `manual` | The value is manually entered, inferred, or held as a temporary estimate. | Owner/reviewer note, reason, expiry or recheck date. |
| `unavailable` | Trusted price is unknown, self-hosted, open-weights, free-only, or not meaningful as hosted API pricing. | Reason code, no fake zero-price unless explicitly free or self-hosted. |

Implementation sequence:

1. Make `model-pricing.json` the only runtime source of truth after tests cover all resolved prices.
2. Stop requiring embedded `pricing` in `models.json`, or keep only an explicit `pricingRef`.
3. Add structured fields such as `trustTier`, `trustStatus`, `sourceUrl`, `sourceName`, `lastVerified`, `region`, `normalization`, and `notes`.
4. Rename the UI/API label from `Official / catalog` to `Catalog default` until every default price is provider-official.
5. Keep `ccswitch` as a separate profile only for CC Switch/proxy billing, and fail validation if the official/default profile silently contains proxy-tier records without an explicit exception.
6. Update API semantics so `pricing_verified` means provider/provider-official verified, not just "has any source string and date"; consider returning `pricing.trust_tier` and `pricing.trust_status`.
7. Add a catalog validation summary that counts trust tiers and fails on missing source metadata for the effective runtime price, not only embedded fallback pricing.

## Non-Goals For This Pass

- No JSON price numbers were changed.
- No provider prices were corrected or re-sourced.
- No schema migration was applied.
- No attempt was made to decide whether CC Switch seed values are numerically right; this report only marks the current trust-chain ambiguity.
