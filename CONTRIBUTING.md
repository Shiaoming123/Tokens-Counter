# Contributing

Thanks for helping improve AI Token Counter. The project values source-backed model metadata, clear accuracy labels, and privacy-safe reports.

## Before Opening An Issue

- Remove API keys, provider credentials, private prompts, customer data, screenshots with secrets, and account details.
- Use the Early Access page for hosted API key requests.
- Email `henshiaoming@gmail.com` for leaked keys, vulnerabilities, or privacy concerns.

## Good Contributions

- Model metadata updates with official source links.
- Pricing updates with provider or proxy source links and effective dates.
- Tokenizer mapping improvements with license and model-card references.
- Reproducible bugs with minimal non-sensitive examples.
- Documentation fixes that clarify accuracy, privacy, or API behavior.

## Model And Pricing Changes

When adding or changing model support, include:

- provider and model ID,
- public source URL,
- context window and modality support,
- pricing fields and date,
- tokenizer or official count method,
- accuracy label and why it is correct,
- license or terms caveat if relevant.

Run these checks before submitting:

```bash
npm run validate:catalog
npm test -- --run
npm run build
```

## Accuracy Labels

Use accuracy labels conservatively:

- `official_exact`: provider official count path is integrated and treated as exact for the requested shape.
- `official_estimate`: provider official path exists but is documented or known as an estimate.
- `local_exact`: local tokenizer assets match the model path closely enough for plain text counting.
- `local_estimate`: local tokenizer, rule, or alias is useful but not exact for all hosted behavior.
- `unsupported`: the project cannot provide a trustworthy count for that shape.

Do not mark third-party approximations for closed-source hosted models as official.

## Pull Request Notes

- Keep changes scoped.
- Do not mix model catalog updates, UI refactors, and marketing copy in one PR unless they are tightly related.
- Add or update tests when behavior changes.
- Do not commit real API keys, provider credentials, raw prompts, screenshots with secrets, or private ledgers.

