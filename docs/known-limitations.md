# Known Limitations

Last updated: 2026-05-22

AI Token Counter is useful for planning, comparison, and audit review, but it is not a full production SaaS billing system yet.

## Not A Provider Invoice

Token and cost estimates do not replace provider invoices, usage dashboards, or contracts. Provider-side billing behavior, model routing, caching, safety layers, and internal optimizations can change final billable usage.

## Early Access API

The hosted API is intentionally conservative:

- API keys are issued manually.
- Rate limits are enforced with in-memory per-key/IP windows.
- Multi-instance shared quota state is not implemented yet.
- Persistent usage ledger and customer billing are not implemented yet.
- Keys may be revoked or rotated during Early Access.

## Privacy Boundaries

Local estimates can stay in the browser or local runtime. Official counting mode may send request content to selected provider APIs. Sensitive workflows should use redacted samples, disable official counting, or use private deployment.

Do not send real API keys, private prompts, customer data, provider account details, screenshots with secrets, raw images, or PDFs through public issues.

## Accuracy Boundaries

Accuracy labels are conservative:

- `official_exact`: official counting path is integrated and treated as exact for the requested shape.
- `official_estimate`: official path exists but is documented or known as an estimate.
- `local_exact`: local tokenizer assets closely match the target model for supported input.
- `local_estimate`: local tokenizer, alias, or formula is useful but incomplete.
- `unsupported`: the project does not provide a trustworthy count for that shape.

Closed-source hosted models, multimodal inputs, chat templates, tool calls, PDFs, and cache behavior can make local estimates differ from provider usage.

## Pricing Boundaries

Pricing data can change quickly. The catalog validator checks shape and coverage, not commercial truth. For procurement, billing, or customer-facing quotations, verify provider pricing pages and contract terms.

## Operational Boundaries

The project does not yet provide:

- self-serve signup,
- team administration,
- paid subscriptions,
- invoices or tax handling,
- enterprise SLA,
- scoped project keys,
- shared durable quotas,
- admin dashboard,
- formal legal compliance certification.

## Current Launch Recommendation

Use the hosted product for Early Access trials, real workflow feedback, and small API pilots. Keep public claims narrow: estimate, compare, pre-check, and audit assumptions.

