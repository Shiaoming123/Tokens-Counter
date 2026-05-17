# OpenAI GPT-5.5 and Codex Tokenizer Research
*Last updated: 2026-05-17*

## Scope

Concise integration note for OpenAI GPT-5.5 and current Codex-family model catalog/token-counting work. OpenAI claims below use OpenAI docs only.

## Models

| Model ID | Role | Context | Max output | Modalities | Reasoning | Notes |
| --- | --- | ---: | ---: | --- | --- | --- |
| `gpt-5.5` | Frontier model for complex reasoning, coding, and professional work | 1,050,000 tokens | 128,000 tokens | text/image input, text output | `none`, `low`, `medium` default, `high`, `xhigh`; reasoning tokens supported | Snapshot alias includes `gpt-5.5-2026-04-23`. |
| `gpt-5.3-codex` | Specialized agentic coding model for Codex-like environments | 400,000 tokens | 128,000 tokens | text/image input, text output | `low`, `medium`, `high`, `xhigh`; reasoning tokens supported | Current OpenAI pricing page lists this as the Codex specialized model. |
| `gpt-5-codex` | Earlier GPT-5 Codex model | 400,000 tokens | 128,000 tokens | text/image input, text output | reasoning tokens supported | OpenAI notes the underlying snapshot is regularly updated and Responses API only. Keep only if backward compatibility is needed. |

## Pricing and Counting Caveats

- `gpt-5.5` standard short-context text pricing: $5.00 input / $0.50 cached input / $30.00 output per 1M tokens.
- `gpt-5.5` long-context caveat: prompts over 272K input tokens are priced at 2x input and 1.5x output for the full session for standard, batch, and flex.
- `gpt-5.5` regional processing endpoints carry a 10% uplift.
- `gpt-5.3-codex` standard pricing: $1.75 input / $0.175 cached input / $14.00 output per 1M tokens; priority pricing is $3.50 / $0.35 / $28.00.
- OpenAI pricing docs state tool-specific models/tools can add per-tool fees, and tokens used for built-in tools are billed at the chosen model token rates.
- Reasoning tokens are supported for these models. Treat visible text token estimates as lower-bound cost/context estimates when reasoning is enabled because the docs expose reasoning-token support but not a local preflight formula for hidden reasoning token usage.

## Tokenizer Implications

- OpenAI's tokenizer page says OpenAI models process text as tokens and recommends the Tokenizer UI for inspection plus `tiktoken` for programmatic tokenization.
- No official GPT-5.5-specific downloadable tokenizer file, vocabulary size, or encoding name was found in the checked OpenAI docs.
- Do not hard-code an unverified encoding name for `gpt-5.5` or Codex variants. If the app uses `tiktoken`, prefer model-based lookup where available and surface an "estimated" status when a model is newer than the local tokenizer package.
- For exact billing/accounting, prefer API `usage` fields after requests. For preflight UX, use local tokenizer estimates plus model context/max-output metadata and clearly flag caveats for reasoning tokens, images, tools, cached input, and long-context pricing.

## Recommended Integration Approach

1. Add/maintain catalog entries for `gpt-5.5`, `gpt-5.5-2026-04-23`, `gpt-5.3-codex`, and legacy `gpt-5-codex` only if current code already exposes older Codex IDs.
2. Store pricing as tiered metadata, not a single flat rate: standard short context, standard long-context surcharge threshold for `gpt-5.5`, cached input, batch/flex/priority where supported, and regional uplift as a caveat.
3. Keep tokenizer mapping conservative: use official OpenAI tokenizer/tiktoken support when available, otherwise mark counts as estimates.
4. Add UI/docs wording that output bills may include reasoning tokens and tool usage may add token and/or tool-call charges.
5. For Codex, prefer `gpt-5.3-codex` as the current specialized Codex model from the pricing/model pages; keep `gpt-5-codex` as a compatibility alias only.

## Sources

- OpenAI Models: https://platform.openai.com/docs/models
- OpenAI GPT-5.5 model page: https://platform.openai.com/docs/models/gpt-5.5
- OpenAI GPT-5.3-Codex model page: https://platform.openai.com/docs/models/gpt-5.3-codex
- OpenAI GPT-5-Codex model page: https://platform.openai.com/docs/models/gpt-5-codex
- OpenAI Pricing: https://platform.openai.com/docs/pricing/
- OpenAI Tokenizer: https://platform.openai.com/tokenizer
