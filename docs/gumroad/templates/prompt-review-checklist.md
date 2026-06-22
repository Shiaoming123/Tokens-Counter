# Prompt Cost Review Checklist

Use this before merging a prompt, agent, tool schema, or RAG workflow change.

- [ ] Prompt samples are synthetic or redacted.
- [ ] Expected output token range is documented.
- [ ] Tool schema overhead is included.
- [ ] Images or PDFs are represented with realistic sizes.
- [ ] At least two model candidates are compared.
- [ ] Accuracy labels are reviewed, not only total token numbers.
- [ ] Pricing profile is explicit.
- [ ] Pricing source and freshness are checked.
- [ ] Local estimate vs official count route is clear.
- [ ] Sensitive data policy is documented for official provider calls.
- [ ] A human reviewed unsupported or low-confidence paths.
- [ ] Final billing verification plan is documented.
