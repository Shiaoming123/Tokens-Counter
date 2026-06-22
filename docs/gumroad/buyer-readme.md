# Tokens Counter Pro: AI Cost Audit Toolkit

Thanks for buying the first paid Tokens Counter toolkit.

This package is designed to help you review token usage and AI API cost assumptions before a prompt, agent, RAG workflow, or internal AI tool reaches production.

## Start Here

1. Open the hosted workbench: https://tokens-counter.vercel.app
2. Pick one real workflow you want to review.
3. Redact sensitive customer data before pasting samples.
4. Use `templates/ai-cost-audit-template.md` to record model choices, token estimates, cost estimates, accuracy labels, and open questions.
5. If you bought a Pro package with a Gumroad license key, follow `license-activation.md`.
6. If you need hosted API access, fill `api-early-access-request.md` and send it to `henshiaoming@gmail.com`.

## Optional Local Web Build

If this package includes `web-dist/`, you can serve it locally with any static file server.

Example:

```bash
npx serve web-dist
```

The static build is useful for local exploration. Hosted API access, protected `/api/v1` endpoints, quota, and provider official counting still require a deployed backend and API keys.

## Package Contents

- `README.md`: this buyer guide.
- `license-activation.md`: Gumroad license and Pro access notes.
- `api-early-access-request.md`: template for requesting hosted API access.
- `templates/`: audit and review templates.
- `reference/`: selected public docs from the project.
- `web-dist/`: optional production web build when generated before packaging.

## Important Boundary

Tokens Counter is an estimation, audit, and planning tool. Provider invoices, usage dashboards, contracts, and official billing exports remain the source of truth for final billable usage.

Accuracy depends on model support and input type. Results may use official provider counting, local exact tokenizers, local estimates, vision formulas, or unsupported paths. Always read the accuracy label and count method before using a number in a decision.

## Privacy Boundary

Local estimates should avoid sending content to third-party model providers. Official counting modes may send text, messages, images, or other countable content to the selected provider API. Do not upload confidential data unless you understand and accept that route.

## Support

For license, Early Access, pricing corrections, model support, or privacy questions:

- Email: `henshiaoming@gmail.com`
- Subject: `[AI Token Counter] Gumroad support`
