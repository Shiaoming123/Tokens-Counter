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
