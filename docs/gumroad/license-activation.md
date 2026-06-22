# Gumroad License Activation

This first Gumroad package uses Gumroad for purchase records and license key distribution. Tokens Counter still handles product behavior, API limits, and Early Access approval separately.

## For Buyers

1. Keep the Gumroad receipt email.
2. Copy your Gumroad license key.
3. If the hosted app has an activation field, paste the key there.
4. If the activation field is not live yet, email the key to `henshiaoming@gmail.com` with your use case and requested access.

Suggested email subject:

```text
[AI Token Counter] Gumroad license activation
```

## What A License Can Unlock

Depending on the package and rollout stage, a license may unlock:

- priority API Early Access review,
- Pro templates and workflow updates,
- private pricing profile review,
- manual API key issuance,
- buyer-only update emails.

It does not automatically guarantee unlimited API access, custom support, or enterprise SLA unless the Gumroad product explicitly says so.

## Operator Notes

Before automatic activation is implemented, handle licenses manually:

1. Verify the purchase/license in Gumroad.
2. Check refund or chargeback status.
3. Record the buyer, product tier, license key fingerprint, quota, and expiration in private operator storage.
4. Generate or assign an API key with `npm run ea:keys`.
5. Send the API key and usage boundary by email.

Do not commit Gumroad buyer emails, raw license keys, API keys, payment records, or private support notes to git.
