# Gumroad Package Manifest

Product: Tokens Counter Pro: AI Cost Audit Toolkit

This manifest defines the first safe Gumroad delivery package.

## Include

Buyer-facing files:

- `README.md` from `docs/gumroad/buyer-readme.md`
- `license-activation.md`
- `api-early-access-request.md`
- `templates/ai-cost-audit-template.md`
- `templates/prompt-review-checklist.md`
- `templates/pricing-profile-template.csv`

Reference docs:

- `README.md`
- `README.zh-CN.md`
- `LICENSE`
- `LICENSES.md`
- `SECURITY.md`
- `docs/early-access-operating-model.md`
- `docs/external-token-api.md`
- `docs/openapi.json`
- `docs/known-limitations.md`
- `docs/pricing-profiles.md`
- `docs/anonymized-case-studies.md`
- `docs/vercel-deployment-env.md`

Optional generated build:

- `dist/` copied as `web-dist/` after `npm run build`.

## Exclude

Never include:

- `.env`
- `.env.*`
- `private/`
- `.git/`
- `node_modules/`
- `.vercel/`
- `.agents/`
- `.claude/`
- raw API keys
- raw Gumroad license keys
- buyer emails
- PayPal or payout records
- private support notes
- provider API keys

## Package Output

The generated zip should be:

```text
artifacts/gumroad/tokens-counter-pro-gumroad.zip
```

The expanded staging directory should be:

```text
artifacts/gumroad/tokens-counter-pro-gumroad/
```

`artifacts/gumroad/` is a generated delivery area and should not be treated as source.

## Pre-Upload Checklist

- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] Package script succeeds.
- [ ] Zip contains buyer docs and templates.
- [ ] Zip does not contain `.env`, `private/`, `.git/`, or `node_modules/`.
- [ ] No real API keys, Gumroad license keys, buyer emails, or payout records are present.
- [ ] Gumroad product page uses `docs/gumroad/product-page.md` claims and avoids invoice-replacement language.
