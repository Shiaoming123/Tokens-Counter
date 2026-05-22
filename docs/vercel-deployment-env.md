# Vercel Deployment And Environment Variables

Last updated: 2026-05-21

This project should start with the simplest deployment path:

- Vercel deployment,
- manual Early Access API keys,
- email-based approval through `henshiaoming@gmail.com`,
- no payment integration until real demand is proven.

## Vercel Setup

1. Push the repository to GitHub.
2. In Vercel, choose **Add New Project**.
3. Import the GitHub repository.
4. Keep the default build command from `package.json`: `npm run build`.
5. Set the production environment variables below.
6. Deploy.

The app exposes both the Vite frontend and API routes through the Vercel entry files in `api/`.

## Required For Public Early Access

These variables should be set before sharing the API with anyone outside your own machine.

| Variable | Recommended value | How to get it |
| --- | --- | --- |
| `VITE_APP_GITHUB_URL` | `https://github.com/Shiaoming123/Tokens-Counter` | Use your public GitHub repository URL. |
| `TOKEN_COUNTER_API_KEY` | A long random key | Generate locally with PowerShell, see below. |
| `TOKEN_COUNTER_API_KEYS` | Optional comma-separated keys | Use when issuing multiple manual Early Access keys. |
| `TOKEN_COUNTER_RATE_LIMIT_MAX` | `120` to start | Keep conservative for manual beta. |
| `TOKEN_COUNTER_RATE_LIMIT_WINDOW_MS` | `3600000` | One-hour window. |
| `TOKEN_COUNTER_MAX_BODY_BYTES` | `262144` | 256 KB request body limit. |
| `TOKEN_COUNTER_MAX_MODELS_PER_REQUEST` | `20` | Keeps model fan-out controlled. |
| `TOKEN_COUNTER_MAX_TEXT_BYTES` | `131072` | 128 KB text/messages limit. |
| `TOKEN_COUNTER_MAX_MESSAGES` | `100` | Conservative chat message limit. |
| `TOKEN_COUNTER_MAX_IMAGES` | `8` | Conservative multimodal beta limit. |
| `TOKEN_COUNTER_MAX_IMAGE_BYTES` | `2097152` | 2 MB inline image payload limit. |

Generate an API key locally:

```powershell
$rng = New-Object System.Security.Cryptography.RNGCryptoServiceProvider
$bytes = New-Object byte[] 32
$rng.GetBytes($bytes)
'tc_live_' + ([System.BitConverter]::ToString($bytes)).Replace('-', '').ToLowerInvariant()
```

Recommended key naming convention for manual notes:

```text
tc_live_<date>_<short-user-label>_<random>
```

Do not publish API keys in GitHub, README, screenshots, or frontend code.

## Optional Provider Count API Keys

These enable official provider counting paths. They are optional because the app can still return local estimates where available.

| Variable | Provider | How to get it | Notes |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | OpenAI | Create an API key in the OpenAI Platform dashboard. | May incur provider cost when official count mode calls provider APIs. |
| `ANTHROPIC_API_KEY` | Anthropic Claude | Create an API key in the Anthropic Console. | Used for Claude count_tokens style calls. |
| `GEMINI_API_KEY` | Google Gemini | Create an API key in Google AI Studio or Google Cloud. | Used for Gemini countTokens calls. |
| `ZAI_API_KEY` | Z.AI / GLM | Create an API key in the Z.AI / Zhipu developer console. | Preferred modern variable. |
| `ZHIPU_API_KEY` | Z.AI / GLM legacy alias | Same provider account as above. | Keep only if using older naming. |
| `COHERE_API_KEY` | Cohere | Create an API key in Cohere dashboard. | Optional official tokenize path. |
| `MOONSHOT_API_KEY` | Moonshot / Kimi | Create an API key in Moonshot platform. | Optional official estimate-token-count path. |
| `STEPFUN_API_KEY` | StepFun | Create an API key in StepFun platform. | Optional official token count path. |
| `XAI_API_KEY` | xAI | Create an API key in xAI console. | Reserved for supported official integrations. |

Set only the provider keys you actually plan to use. If a key is missing, related official-count features stay unavailable and the service should clearly fall back or return an official-count error depending on request options.

## Vercel Environment Variable Steps

1. Open the Vercel project.
2. Go to **Settings** -> **Environment Variables**.
3. Add variables for **Production** first.
4. Add the same variables to **Preview** only if you need preview deployments to call APIs.
5. Redeploy after changing variables.

For the first public beta, start with:

```text
VITE_APP_GITHUB_URL=https://github.com/Shiaoming123/Tokens-Counter
TOKEN_COUNTER_API_KEY=<your first private test key>
TOKEN_COUNTER_API_KEYS=<comma-separated early access keys, optional>
TOKEN_COUNTER_RATE_LIMIT_MAX=120
TOKEN_COUNTER_RATE_LIMIT_WINDOW_MS=3600000
TOKEN_COUNTER_MAX_BODY_BYTES=262144
TOKEN_COUNTER_MAX_MODELS_PER_REQUEST=20
TOKEN_COUNTER_MAX_TEXT_BYTES=131072
TOKEN_COUNTER_MAX_MESSAGES=100
TOKEN_COUNTER_MAX_IMAGES=8
TOKEN_COUNTER_MAX_IMAGE_BYTES=2097152
```

Then add provider keys one by one only after testing that each official path behaves correctly.

## Manual Early Access Key Flow

1. User emails `henshiaoming@gmail.com`.
2. Ask for use case, expected volume, required models, and whether sensitive content is involved.
3. Generate a key.
4. Add it to `TOKEN_COUNTER_API_KEYS`.
5. Redeploy Vercel.
6. Reply with API docs, key, usage limit, and disclaimer.

Example welcome email:

```text
Subject: AI Token Counter Early Access API key

Thanks for trying AI Token Counter.

Your API key:
<key>

Current beta limits:
- 120 requests per hour
- up to 20 models per request
- no raw prompt logging by default

Docs:
<deployment-url>/api-docs or the repository external API document

Important:
Token and cost results are estimates for planning and audit. Final billed usage remains subject to the provider invoice or usage dashboard.
```

## What Not To Do Yet

- Do not enable self-serve payment before usage and support demand are clear.
- Do not promise unlimited API access.
- Do not store raw prompts by default.
- Do not present provider keys or Early Access keys in frontend code.
- Do not call missing provider APIs silently when `allow_fallback=false`.
