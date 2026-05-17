# Pricing Profiles

The app supports multiple pricing profiles so users can compare provider list prices against proxy or coding-tool billing rules.

## Profiles

| id | Purpose | Source |
| --- | --- | --- |
| `official` | Project catalog / provider documentation pricing. | `src/data/model-pricing.json` |
| `ccswitch` | CC Switch preset pricing, including Claude, OpenAI/Codex, Gemini, Grok, Qwen, Mistral, MiniMax, Doubao, GLM, and selected Chinese provider models. | CC Switch main-branch `model_pricing` seed plus documented v3.13 normalization rules |

## Usage

- In the UI, open the advanced settings popover and choose **Pricing Rule**.
- In the external API, pass `options.pricing_profile`.
- If a selected profile does not define a model, the app falls back to the official/catalog price for that model.

## Model ID Normalization

CC Switch normalizes model IDs before matching:

- Provider prefixes are removed.
- Suffixes after `:` are removed.
- `@` is replaced with `-`, for example `gpt-5.2-codex@low` becomes `gpt-5.2-codex-low`.

Keep that normalization in mind when adding proxy-specific pricing presets.
