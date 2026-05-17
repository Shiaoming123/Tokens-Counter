# Official Token Counting Endpoint Notes

Last updated: 2026-05-17

This note records the provider endpoints wired or intentionally deferred for Token Counter official-count mode.

## Implemented In This Project

| Provider | Endpoint | Local integration | Notes |
| --- | --- | --- | --- |
| Cohere | `POST https://api.cohere.com/v1/tokenize` | `/api/count/cohere` with `COHERE_API_KEY` | Returns a token array. The app counts `tokens.length`. Cohere documents the endpoint as BPE tokenization and requires `text` and `model`. |
| Moonshot / Kimi | `POST https://api.moonshot.ai/v1/tokenizers/estimate-token-count` | `/api/count/moonshot` with `MOONSHOT_API_KEY` | Returns `data.total_tokens`. Supports chat-style messages and Kimi vision payloads. |
| StepFun | `POST https://api.stepfun.ai/v1/token/count` | `/api/count/stepfun` with `STEPFUN_API_KEY` | Returns `data.total_tokens`. Request shape follows chat-completion style messages and supports multimodal user content. |

Existing official-count integrations remain:

- Anthropic `messages.countTokens` through the official SDK.
- Google Gemini `models.countTokens` through the official SDK.
- Z.AI / GLM `/api/paas/v4/tokenizer`.
- OpenAI usage-based estimate through a minimal completion request.

## Deferred

| Provider | Reason |
| --- | --- |
| xAI | xAI documents `xai_api.Tokenize/TokenizeText`, but it is exposed as a gRPC service. A Node integration needs a small gRPC/protobuf client or a documented REST bridge before it should be enabled in the web server. |
| Mistral | Mistral publishes `mistral-common` as the official tokenizer/pre-processing library. It is a Python package, not a native TypeScript runtime. A production integration should run it as a sidecar/service or use a validated JS port if one becomes available. |
| Volcano Ark / Doubao | The project still needs a reliable public API surface for token calculator calls before implementation. |

## Sources

- Cohere tokenization docs: https://docs.cohere.com/reference/tokenize
- Kimi estimate-token-count docs: https://platform.kimi.ai/docs/api/estimate
- StepFun token count docs: https://platform.stepfun.ai/docs/en/api-reference/token-count
- xAI gRPC TokenizeText docs: https://docs.x.ai/developers/grpc-api-reference
- Mistral official tokenizer library: https://github.com/mistralai/mistral-common
