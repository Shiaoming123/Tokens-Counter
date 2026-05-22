# Security Policy

AI Token Counter is in Early Access. Please report security and privacy issues privately instead of opening a public issue.

## Report Privately

Email: `henshiaoming@gmail.com`

Use this path for:

- leaked API keys or provider credentials,
- vulnerabilities in the hosted API or deployment,
- privacy concerns involving prompts, images, PDFs, or customer data,
- abuse reports for Early Access keys,
- accidental exposure of sensitive data in issues, screenshots, or logs.

## What To Include

- A short summary of the issue.
- Affected URL, endpoint, file, or key label if known.
- Reproduction steps that do not include secrets or private payloads.
- Impact and whether the issue is already public.

Do not send real provider keys, raw customer prompts, private images, PDFs, or account credentials unless explicitly requested through a safer channel.

## Early Access Key Handling

- API keys are issued manually and may be revoked or rotated at any time during Early Access.
- Long-lived keys must stay server-side. Do not embed them in browser code, mobile apps, public repos, screenshots, or shared issue text.
- If a key is leaked, email the maintainer immediately with the key label or safe fingerprint, not the full key.

## Scope

In scope:

- `https://tokens-counter.vercel.app`
- Public `/api/v1/*` API behavior
- Repository code, docs, and model/pricing metadata

Out of scope:

- Provider platforms such as OpenAI, Anthropic, Google, Moonshot, or other third-party APIs
- Social engineering or phishing
- Denial-of-service testing without prior permission
- Attempts to access data that is not yours

## No Legal Advice

This policy is operational guidance for the project. It is not legal advice or a formal bug bounty program.

