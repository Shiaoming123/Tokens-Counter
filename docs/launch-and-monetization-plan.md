# Launch And Monetization Plan

Date: 2026-05-17

## Recommended Launch Path

1. Open source the repository on GitHub.
   - Keep `.env`, API keys, local screenshots, and generated temp folders out of the repository.
   - Add `README.md`, `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`, and a short roadmap.
   - Use MIT if you want adoption and commercial reuse; use Apache-2.0 if you want explicit patent language; use AGPL only if you intentionally want network-use source-sharing obligations.

2. Deploy the public app.
   - Fastest international route: Vercel or Cloudflare Pages for the frontend.
   - Current project also has a Node/Hono API server, so either deploy the API on a Node-friendly host or adapt it to serverless/Workers later.
   - Start with one production URL, then attach a custom domain.

3. Buy and connect a domain.
   - Buy from Cloudflare Registrar, Namecheap, Porkbun, Alibaba Cloud, Tencent Cloud, or another registrar.
   - Prefer a short `.ai`, `.dev`, `.app`, `.tools`, `.com`, or `.cn` only if available and reasonably priced.
   - Set `VITE_APP_PUBLIC_URL` and `VITE_APP_GITHUB_URL` in production so the Links page points to the real project.

4. China access strategy.
   - Without ICP filing: deploy in Hong Kong, Singapore, Tokyo, or US West and use a global CDN. This is the fastest path, but mainland China access is not guaranteed.
   - With ICP filing: use Alibaba Cloud/Tencent Cloud/Huawei Cloud mainland hosting or a mainland CDN. This is the stable/compliant mainland path.
   - Cloudflare China Network is enterprise-oriented and requires a valid ICP filing for the apex domain.

5. Publish the first public announcement.
   - Launch on GitHub README, Product Hunt, X/Twitter, V2EX, 掘金, 即刻, 少数派, Reddit, Hacker News "Show HN", and AI builder communities.
   - Ask for concrete feedback: missing model, wrong pricing, token mismatch, API need, enterprise workflow.

## First Revenue Plan

Stage 1: no-login revenue

- Add GitHub Sponsors / custom funding links.
- Add a "Support this project" link to the Links page.
- Offer one-time paid setup: "I will configure your team's model pricing/token catalog" for a fixed price.
- Offer paid spreadsheet/API export templates for teams that compare many models.

Stage 2: lightweight paid API

- Free public UI remains open.
- Paid API key unlocks higher request limits, API docs support, saved estimates, batch estimates, and CSV/JSON exports.
- Start with simple tiers:
  - Free: UI + low API limit.
  - Pro: $9-$19/month for higher API limits and saved history.
  - Team: $49-$99/month for shared pricing profiles, custom model catalog, and priority updates.
  - Enterprise/custom: private deployment, internal pricing rules, SSO, invoice billing.

Stage 3: commercial partnerships

- Sell custom model catalog maintenance to AI agencies and companies using many providers.
- Partner with proxy/API gateway providers who need transparent model pricing pages.
- Provide private deployment for teams that cannot upload prompts to a public tool.

## Payment Options

- GitHub Sponsors: best for open-source goodwill.
- Stripe Payment Links: easiest no-code international payment link for products, subscriptions, or donations.
- Lemon Squeezy or Paddle: merchant-of-record style checkout can reduce tax/VAT operational work in many countries.
- China-focused payments: later consider WeChat Pay/Alipay via Stripe/Adyen/local provider or a Chinese company account.

## Immediate Checklist

- Add production `VITE_APP_PUBLIC_URL` and `VITE_APP_GITHUB_URL`.
- Add README screenshots and a 60-second demo GIF.
- Add GitHub topics: `tokenizer`, `llm`, `ai`, `cost-estimator`, `openai`, `claude`, `gemini`, `vue`.
- Add issue templates for model/pricing/tokenizer corrections.
- Add a funding link once payment account is ready.
- Add rate limiting, API keys, and privacy logging controls before publicly selling API access.

