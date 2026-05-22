# Early Access API Key And Feedback Ledger Template

Last updated: 2026-05-22

This template is a commit-safe operating aid for manually issuing Tokens Counter Early Access API keys and collecting feedback from the first testers.

Do not put real API keys, provider credentials, raw prompts, customer secrets, or private contact details in this file. Keep the live copy in a private operator workspace such as `private/`, a password manager, or a restricted spreadsheet.

## Operating Rules

- Treat this document as the public-safe template only.
- Store real key material outside git.
- Record only key labels or irreversible key fingerprints in shared docs.
- Ask users whether their inputs may contain sensitive data before approving access.
- Revoke or rotate a key immediately if it appears in a public issue, chat transcript, screenshot, or repo commit.
- Review outstanding feedback and active key status at least once per week during Early Access.

## API Key Issuance Workflow

1. Receive an Early Access request through email, GitHub, or a direct maintainer channel.
2. Capture the request in the application intake table below.
3. Approve only if the use case fits the current API risk profile and volume limit.
4. Generate a key in the private operator workspace.
5. Store the real key only in the private ledger or deployment secret manager.
6. Send the user their key, the usage limit, the API docs link, the accuracy disclaimer, and the feedback channel.
7. Add the user-facing key label or fingerprint to the active key register.
8. Review usage, issues, and feedback weekly.

## Application Intake

Use this table before issuing a key. Keep the public/template copy empty or filled with placeholders only.

| request_id | requested_at | requester | channel | intended_use | expected_monthly_requests | required_models_or_profiles | sensitive_inputs | official_count_required | decision | decision_reason | owner |
| --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- | --- |
| ea-request-YYYYMMDD-001 | YYYY-MM-DD | Example user or company | email/github/direct | Cost audit for prompt tests | 1000 | openai:gpt-4.1-mini, cc-switch | no/yes/unknown | no/yes | approved/rejected/pending | Placeholder rationale | maintainer |

## Active Key Register

Never commit the actual `key` value. Use a private ledger for the full secret and place only a label, last-four marker, or hash here if a shared record is needed.

| key_label | key_fingerprint | status | issued_to | issued_at | expires_at | monthly_request_limit | scopes | delivery_channel | rotation_reason | notes |
| --- | --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- |
| ea-YYYYMMDD-001 | sha256:first12...last12 | active | Example user | YYYY-MM-DD | YYYY-MM-DD | 1000 | estimates,tokens-count | email | initial issue | Placeholder only, no secret |

Suggested statuses:

- `pending`: approved but not delivered yet.
- `available`: generated and ready to issue, but not assigned yet.
- `used`: delivered, deployed, or assigned to a real user.
- `active`: delivered and allowed to call the API when using a richer key store.
- `paused`: temporarily disabled while investigating usage, billing, or support issues.
- `revoked`: no longer valid and should not be re-enabled.
- `expired`: intentionally ended after the Early Access window.

## User Delivery Checklist

Send only the relevant details to the approved user.

- API key from the private secret store.
- Allowed endpoint set.
- Monthly request limit and expected fair-use behavior.
- Link to the API docs or OpenAPI file.
- Accuracy disclaimer: estimates may differ from provider invoices.
- Privacy note: official counting mode may send content to the selected provider.
- Feedback channel and expected response time.
- Revocation note for leaked or abused keys.

## Feedback Ledger

Capture feedback without raw prompts or private payloads. Summarize examples in neutral terms instead of copying sensitive text.

| feedback_id | received_at | source_key_label | channel | category | severity | summary | user_impact | follow_up_owner | status | linked_issue_or_doc |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ea-feedback-YYYYMMDD-001 | YYYY-MM-DD | ea-YYYYMMDD-001 | email/github/direct | accuracy/pricing/docs/api/privacy | low/medium/high | Placeholder summary without raw payload | Placeholder impact | maintainer | open/triaged/fixed/declined | docs/example.md |

## Weekly Review Checklist

- Confirm every active key still has an owner, limit, and status.
- Check for leaked keys in issues, public chats, and recent commits if there was any copy/paste risk.
- Review rate-limit errors, failed auth attempts, and repeated expensive official count calls.
- Triage open feedback into docs fixes, pricing/profile updates, API behavior fixes, or product backlog.
- Update users whose feedback changed behavior or documentation.
- Revoke expired or inactive keys that no longer need access.

## Incident Notes Template

Use this section in a private incident note, not in the public template, if a key is leaked or abused.

```text
incident_id: ea-incident-YYYYMMDD-001
detected_at: YYYY-MM-DD HH:mm timezone
detected_by: maintainer/system/user
affected_key_label: ea-YYYYMMDD-001
real_key_location: private secret store reference only
impact_summary: no raw payloads
actions_taken:
  - revoked old key
  - issued replacement key if appropriate
  - notified user
follow_up:
  - update docs/runbook
  - tighten delivery or storage process
```
