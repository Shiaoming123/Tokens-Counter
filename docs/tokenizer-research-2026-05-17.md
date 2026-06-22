# Tokenizer Mapping And License Audit

Date: 2026-05-17

This audit separates token counting into three accuracy tiers:

- `local_exact`: the app has a specific local tokenizer implementation or an explicit Hugging Face tokenizer repo mapping for the model.
- `official_estimate`: the vendor exposes an official counting/tokenizer API, but the count may still be an estimate or requires an API key.
- `local_estimate`: the app uses the local heuristic or a family tokenizer approximation because the exact vendor path is not integrated.

## Provider Findings

| Provider | Current app stance | Source basis |
| --- | --- | --- |
| OpenAI | `local_exact` for text through `tiktoken`/`js-tiktoken`; image counts remain formula-based where applicable. | OpenAI documents tokenization and tiktoken for programmatic text counts. |
| Anthropic | `official_estimate`; exact local tokenizer is not public/integrated. | Claude `count_tokens` supports messages, tools, images, PDFs, and notes counts are estimates. |
| Google Gemini | `official_estimate`; local multimodal rules remain estimates. | Gemini `models.countTokens` runs the model tokenizer on content and returns token counts. |
| DeepSeek | `local_exact` only for explicit open model IDs mapped to DeepSeek tokenizer files; hosted aliases are `local_estimate`. | DeepSeek documents offline tokenizer zip and publishes tokenizer files on Hugging Face for V3/V3.2/V4/R1. |
| Qwen / Alibaba | `local_exact` only for mapped open Qwen/QwQ/Qwen3-Coder IDs; hosted aliases are `local_estimate`. | Qwen model cards load `AutoTokenizer` from Hugging Face; chat templates and hosted aliases can add overhead. |
| Z.AI / GLM | `official_estimate`; local GLM tokenizer is not integrated. | Z.AI provides `/api/paas/v4/tokenizer`. |
| Xiaomi MiMo | `local_exact` only for `mimo-7b-rl`; newer hosted variants are `local_estimate`. | Open checkpoints expose tokenizer assets; hosted plan behavior can differ. |
| Mistral | `local_estimate` until `mistral-common` is integrated. | Mistral points to `mistral-common`, which covers tokenization of text, images, tools, and message normalization. |
| Meta Llama | `local_estimate` in this app. | Tokenizer assets are model-license governed and can require gated access. |
| xAI | `local_estimate`; official endpoint not integrated. | xAI documents console tokenizer/Tokenize Text endpoint and actual usage in API responses. |
| Cohere | `official_estimate` when `COHERE_API_KEY` is configured; otherwise `local_estimate`. | Cohere `/v1/tokenize` tokenizes with the selected model tokenizer. |
| Baidu ERNIE | `local_exact` for ERNIE 4.5 mapped to Baidu tokenizer files; complex chat/tools still need chat template handling. | Baidu Qianfan documents downloading ERNIE tokenizer files and using tokenizer.json/tokenizer_config.json. |
| ByteDance / Volcano Ark | `local_estimate`; official calculator not integrated. | Volcano Ark Token Calculator applies model-specific tokenizer and calculation logic. |
| Moonshot / Kimi | `official_estimate` when `MOONSHOT_API_KEY` is configured; otherwise `local_estimate`. | Kimi provides `/v1/tokenizers/estimate-token-count`. |
| StepFun | `official_estimate` when `STEPFUN_API_KEY` is configured; otherwise `local_estimate`. | StepFun provides `POST /v1/token/count`. |
| MiniMax | `local_estimate`. | MiniMax documents hosted model usage and billing, but no standalone tokenizer endpoint is integrated here. |

## Implementation Notes

- `src/core/tokenizers/tokenizerLoader.ts` now contains explicit model-to-tokenizer repository mappings for all `local_exact` Hugging Face-style tokenizers.
- `server/index.ts` allowlists only the tokenizer repositories that the browser worker may fetch through `/api/tokenizer/:org/:repo`.
- `test/modelRegistry.test.ts` fails if a model claims `local_exact` with a Hugging Face-style tokenizer but has no explicit repo mapping.
- Licenses now describe the actual integrated state instead of implying unavailable local exact support.

## Follow-Up Candidates

- Add xAI gRPC TokenizeText and a production Mistral `mistral-common` sidecar when the deployment target supports them.
- Replace generic Mistral Hugging Face parsing with `mistral-common` for message/tool/image-accurate counts.
- Add chat template application for Qwen, DeepSeek V3.2, ERNIE, and other open models when counting structured messages/tools.
- Add a provider-facing accuracy matrix in the UI so users can see why a result is exact, official estimate, or local estimate.

## 2026-06-22 Official Source Refresh

This refresh updates the active catalog with provider-confirmed model and pricing changes that fit the current flat schema.

- OpenAI `gpt-5.5` context is recorded as 1M tokens, with official pricing for standard processing under 270K context. The server still falls back to usage from a minimal Chat Completions request when official counting is enabled; integrating the newer input-token counting endpoint remains a follow-up.
- DeepSeek V4 Flash/Pro now use official cache-hit, cache-miss input, and output rates. `deepseek-chat` and `deepseek-reasoner` are retained as compatibility aliases that route to V4 Flash until the official 2026-07-24 retirement date.
- Alibaba Model Studio adds `qwen3.7-max-2026-06-08`, `qwen3.7-plus`, and `qwen3.7-plus-2026-05-26`. `qwen3.7-plus` has tiered pricing; the current flat catalog stores the 0-256K tier and notes the 256K-1M tier in the pricing source.
- Z.AI adds `glm-5.2`; GLM-4.7/5/5.1 pricing is updated to the official Z.AI table. GLM official token counting remains through `/api/paas/v4/tokenizer`.
- Moonshot adds `kimi-k2.7-code` and `kimi-k2.7-code-highspeed`, using the official K2.7 Code token rates and local fallback counting until the estimate API is configured.
- StepFun `step-3.5-flash` is upgraded to official-count capable, and `step-3.7-flash` is added with official CNY pricing.
- Xiaomi MiMo V2.5 and V2.5 Pro now use the official 1M context and USD cache-hit/cache-miss/output rates. V2 Flash is retained with a source note about the 2026-06-18 auto-forward and 2026-06-30 V2-family retirement.
- MiniMax M2.1/M2.5/M2.7 context windows are updated to 204,800 tokens, and `minimax-m3` is added as a 1M-context multimodal model. M3 has input-length pricing tiers; the current flat catalog stores the discounted standard <=512K tier and records the >512K tier in `pricing.source`. Image token counting is marked official-only because no standalone MiniMax image token formula is integrated.
- Cohere Command A+ is marked official-count capable for text via Cohere's tokenizer API, while local fallback remains approximate.

Current schema gaps: model deprecation, aliases, max output tokens, regional pricing, processing tiers, and input-length pricing tiers are not first-class fields. Until the schema grows, these rules are documented in `pricing.source` and should not be treated as automatically computed behavior.
