# 30-Day Go-To-Market Plan

Audience: Chinese employed solo developers, indie hackers, AI app builders, prompt engineers, and small teams who need a practical token and cost estimation workbench.

Positioning: AI Token Counter helps developers compare prompt token usage, estimated API cost, model capability, and tokenizer accuracy across providers before they ship or budget an AI feature.

Launch mode: run an Early Access program first. Collect requests by email at `henshiaoming@gmail.com`, manually review each user, and manually issue API keys. Do not start with a heavy payment system unless there is clear repeated demand and a tested compliance path.

Compliance note: sections marked `[Legal / manual review required]` are operational risk notes, not legal advice. Review current law, platform rules, privacy requirements, employment obligations, and advertising claims with a qualified person before public launch.

## Goals

### Primary goals

- Recruit 30-80 relevant Early Access users in 30 days.
- Get 10-20 usable interviews or async feedback threads from Chinese developers building with LLM APIs.
- Validate which use case has strongest pull: prompt cost comparison, model selection, tokenizer accuracy audit, internal API integration, or billing pre-check.
- Keep operational scope small: manual API keys, no stored raw prompts by default, no paid plan until demand and compliance are clearer.

### Non-goals

- Do not optimize for vanity traffic before the product has clear retention.
- Do not promise exact billing replacement across all providers.
- Do not scrape or spam developer communities.
- Do not build complex subscription, invoice, refund, and tax flows in the first 30 days.

## Core Message

### One-line pitch

Compare LLM token usage, cost estimates, model capabilities, and counting accuracy before sending prompts to production.

### Short Chinese pitch

AI Token Counter 是一个面向 AI 开发者的 Token 与成本估算工作台：把文本、图片、PDF、工具调用等输入放进去，对比不同模型的 token、价格、能力和估算可信度，避免上线前才发现成本和 tokenizer 假设不可靠。

### Proof points to use

- Covers mainstream providers and models in one comparison surface.
- Labels accuracy explicitly: official exact, official estimate, local exact, local estimate, or unsupported.
- Supports text, image, PDF, and tool-call style inputs.
- Keeps local estimates in the browser by default unless official provider counting APIs are enabled.
- Provides an external API path for internal tools and automation.

### Claim boundaries

- Say "estimate", "compare", "pre-check", "audit assumptions", and "reduce surprises".
- Do not say "guaranteed exact bill", "official for every model", "100% accurate", or "replace provider billing records".

## Early Access Operating Model

### Recommended flow

1. Landing page or README call-to-action asks users to email `henshiaoming@gmail.com`.
2. The email should include: name or handle, GitHub profile if available, use case, provider stack, expected usage volume, whether they need UI or API, and consent to receive product emails.
3. Manually review each request within 24-48 hours.
4. Send a short welcome email or DM with an API key, usage limits, privacy note, and feedback link.
5. Track each key in a simple table before adding a full billing system.
6. Schedule feedback at day 3 and day 10 after key issuance.

### Why manual keys first

- Reduces abuse risk while the API limit model is still young.
- Lets the maintainer learn user segments before pricing.
- Avoids early payment complexity: refunds, invoices, tax, chargebacks, app store/platform fee rules, and paid support expectations.
- Gives employed solo developers more control over workload and support volume.

### Suggested Early Access limits

- 50-100 users maximum in the first wave.
- Per-key request quota and model fan-out quota.
- No raw prompt logging by default.
- Manual revocation path for abuse or leaked keys.
- Clear "beta / Early Access" label on product pages and API docs.

## Required Pages Before Public Promotion

These pages can be lightweight Markdown or static routes at first.

| Page | Required before | Purpose |
| --- | --- | --- |
| Product landing page | Day 1 | Explain use case, screenshots, Early Access CTA, claim boundaries. |
| Privacy note | Day 1 | Explain what is processed locally, what may be sent to provider count APIs, logs, retention, and contact channel. `[Legal / manual review required]` |
| Terms or acceptable use note | Day 7 | API key rules, abuse limits, no resale, no illegal use, no benchmark misrepresentation. `[Legal / manual review required]` |
| Accuracy methodology | Day 7 | Explain official exact / official estimate / local exact / local estimate / unsupported. |
| Pricing status note | Day 7 | Say pricing changes frequently and estimates must be checked with providers for billing decisions. |
| API quickstart | Day 14 | Curl example, auth header, rate limit behavior, error shape. |
| Changelog | Day 14 | Show active maintenance and model catalog updates. |
| Security contact | Day 14 | Email or issue template for leaked key, vulnerability, privacy concern. |
| FAQ | Day 21 | Answer accuracy, privacy, provider support, self-hosting, commercial usage, and Early Access questions. |

## Channel Strategy

### Domestic developer channels

Use domestic channels for trust, Chinese-language explanations, and use-case discovery.

| Channel | Specific actions | Post angle | Risk controls |
| --- | --- | --- | --- |
| V2EX | Post in `分享创造` or relevant AI/programming nodes after landing page is ready. Reply calmly to accuracy questions. | "我做了一个多模型 Token / 成本估算工作台，想找 AI 应用开发者试用" | Do not astroturf, bump aggressively, or hide commercial intent. |
| 掘金 | Publish one technical article with screenshots and implementation notes. | "为什么 Token 估算不能只看字符数：一个多模型计数工作台的实现记录" | Avoid exaggerated benchmark claims. Label beta status. |
| 知乎 | Answer targeted questions about LLM API cost estimation and tokenizer differences. | "做 AI 应用前，怎样预估不同模型的成本？" | Avoid link-only answers; disclose affiliation. |
| 小红书 / 即刻 | Share concise build-in-public updates and screenshots. | "下班后做的 AI Token 成本对比工具，找 30 个开发者试用" | Do not use wealth/fear-based claims. |
| 微信群 / 飞书群 | Ask group owners before posting. Offer limited Early Access. | "可以帮大家测一下 prompt 在不同模型下的大概成本" | No unsolicited mass posting; avoid collecting unnecessary personal data. |
| 公众号 / 个人博客 | Longer product story and tutorial. | "从一次 API 成本失控开始，我做了一个 Token 估算工作台" | Keep claims specific and verifiable. |

### Overseas channels

Use overseas channels for open-source credibility, GitHub traffic, and broader AI-builder discovery.

| Channel | Specific actions | Post angle | Risk controls |
| --- | --- | --- | --- |
| Hacker News `Show HN` | Launch only after demo, README, privacy note, and screenshot are solid. | "Show HN: AI Token Counter - compare LLM token usage and cost estimates" | Be ready for accuracy and privacy scrutiny. |
| Reddit | Use relevant subreddits such as r/LocalLLaMA, r/OpenAI, r/SaaS, r/SideProject only where rules allow. | "I built a model-aware token and cost estimator; looking for feedback from AI app builders" | Read each subreddit rule; do not cross-post the same text everywhere. |
| Product Hunt | Prepare visuals, maker comment, FAQ, and feedback link. Do not ask directly for upvotes. | "A workbench for comparing LLM token usage, price, and accuracy labels" | Follow Product Hunt launch guidance and featuring rules. |
| Indie Hackers / dev.to | Write a build log. | "What I learned building a tokenizer-aware cost estimator for LLM apps" | Keep it educational, not pure promotion. |
| X / LinkedIn | Short threads with screenshots and concrete examples. | "Same prompt, different model, different token and cost assumptions" | Avoid cold tagging large accounts repeatedly. |

### SEO

SEO should start with useful pages, not keyword stuffing.

| Asset | Target query | Content angle | Timing |
| --- | --- | --- | --- |
| `/token-cost-calculator` | AI token cost calculator, LLM token calculator | Interactive calculator with model comparison and caveats. | Week 2 |
| `/openai-token-calculator` | OpenAI token calculator | Explain tiktoken, image/PDF caveats, official count API fallback. | Week 2 |
| `/claude-token-calculator` | Claude token calculator | Explain message/tool counting differences and official count behavior. | Week 3 |
| `/gemini-token-calculator` | Gemini token calculator | Explain multimodal counting and estimate boundaries. | Week 3 |
| `/tokenizer-accuracy` | tokenizer accuracy, token count accuracy | Methodology page, labels, limitations, examples. | Week 3 |
| `/api-token-cost-estimator` | token cost API, LLM cost API | API quickstart and use cases for internal tools. | Week 4 |

SEO rules:

- Create pages that solve one real query each.
- Include screenshots, examples, and caveats.
- Link back to methodology and privacy notes.
- Do not mass-generate thin provider pages.
- Do not hide text, repeat keywords unnaturally, buy spam links, or create doorway pages. `[Platform / manual review required]`

### GitHub

GitHub should be the trust surface.

| Area | Action |
| --- | --- |
| README | Add clear screenshots, feature bullets, accuracy labels, privacy-first note, Early Access CTA, and API quickstart. |
| Topics | Add relevant topics such as `tokenizer`, `llm`, `token-counter`, `cost-estimator`, `vue`, `hono`, `openai`, `anthropic`, `gemini`. |
| Releases | Create a tagged pre-release for Early Access with changelog and known limitations. |
| Issues | Add templates for bug report, model request, pricing update, and tokenizer accuracy report. |
| Discussions | Open "Early Access feedback", "Provider/model requests", and "Accuracy questions". |
| Examples | Add sample curl requests and screenshots for typical workflows. |
| Stars | Ask users to star only if they find it useful; do not trade stars or incentivize fake engagement. |

### Direct messages

Use direct messages sparingly and only to relevant people.

Good targets:

- Developers who recently posted about LLM API cost, prompt cost, tokenizer differences, or model selection.
- Existing GitHub users who opened related issues or starred similar tools.
- Friends, past coworkers, and small teams where there is a real relationship.

Do not target:

- Random scraped email lists.
- Users whose platform profiles prohibit DMs.
- People with no visible connection to AI development.
- Competitor users with misleading claims.

DM template in Chinese:

```text
你好，我看到你最近在做 AI 应用 / LLM API 成本相关的东西。

我在做一个小工具 AI Token Counter，可以把同一段输入放到不同模型下比较 token、估算成本、模型能力和计数可信度。现在还在 Early Access，我想找一些真实开发者试用，重点收集准确性和工作流反馈。

如果你愿意试一下，我可以手动发一个 key。没有强销售，也不会默认记录你的原始 prompt。你更关心 UI 对比，还是想接 API 到自己的工具里？
```

DM template in English:

```text
Hi, I noticed your recent work around LLM apps / API cost estimation.

I'm building AI Token Counter, a small workbench for comparing token usage, estimated cost, model capability, and counting accuracy across providers. It is in Early Access, and I'm looking for practical feedback from people shipping AI features.

If useful, I can send you a manual access key. No hard sell, and raw prompts are not logged by default. Would you care more about the UI workflow or the API?
```

Follow-up rule:

- One follow-up after 5-7 days is acceptable.
- No third message unless they replied.
- Stop immediately if they decline or do not want contact.

### Content marketing

Publish useful material that naturally leads to the product.

| Content type | Title angle | CTA |
| --- | --- | --- |
| Technical post | "Token 估算为什么会错：chat template、图片、PDF、tool schema 的坑" | Try Early Access and report a mismatch. |
| Case study | "同一个客服 prompt 放到 8 个模型里，成本差多少？" | Open the calculator and compare your own prompt. |
| Build log | "下班时间做 AI Token Counter 的 30 天记录" | Join Early Access. |
| API tutorial | "给内部 AI 网关加一个成本预估接口" | Request API key. |
| Accuracy audit | "什么时候应该相信本地 tokenizer，什么时候必须调官方 count API？" | Read methodology and submit provider requests. |
| Comparison article | "Token 计算器、价格表、官方 API：三种成本预估方式怎么选" | Use the workbench. |

## 30-Day Schedule

### Week 1: Prepare the trust surface

| Day | Action | Output |
| ---: | --- | --- |
| 1 | Finalize one-line pitch, Chinese pitch, screenshots, Early Access form fields. | Landing CTA draft. |
| 2 | Publish privacy note and accuracy methodology draft. | Required pages v0. |
| 3 | Prepare README launch section and GitHub issue templates. | GitHub trust surface. |
| 4 | Create 20-person warm outreach list from existing network and relevant public posts. | Outreach sheet. |
| 5 | Send 10 warm DMs and ask for 15-minute feedback or async trial. | First feedback invites. |
| 6 | Publish first Chinese build log on personal blog or 掘金. | Technical credibility post. |
| 7 | Review replies, issue 5-10 manual keys, document common questions. | Early Access wave 1. |

### Week 2: Domestic validation

| Day | Action | Output |
| ---: | --- | --- |
| 8 | Post to V2EX or a similar developer community. | First public Chinese launch thread. |
| 9 | Turn questions into FAQ entries. | FAQ v0. |
| 10 | Ship small copy or onboarding fixes from first users. | Feedback-driven update. |
| 11 | Publish tokenizer accuracy article. | Education content. |
| 12 | Send 10 targeted DMs to relevant AI builders. | Early Access wave 2. |
| 13 | Add SEO page draft for generic token cost calculator query. | SEO page v0. |
| 14 | Create pre-release changelog and ask active users for testimonials or quotes with consent. | Week 2 recap. |

### Week 3: Overseas and GitHub launch

| Day | Action | Output |
| ---: | --- | --- |
| 15 | Polish English README, screenshots, and demo examples. | English launch readiness. |
| 16 | Publish dev.to or Indie Hackers build log. | Overseas education post. |
| 17 | Post in one relevant Reddit community after checking rules. | Focused overseas feedback. |
| 18 | Open GitHub Discussions and label model requests. | Community structure. |
| 19 | Prepare Product Hunt assets but do not launch if onboarding is weak. | PH launch kit. |
| 20 | Send feedback survey to users who received keys 7+ days ago. | Retention and pain data. |
| 21 | Publish provider-specific SEO page with clear caveats. | SEO page v1. |

### Week 4: Convert learning into a repeatable loop

| Day | Action | Output |
| ---: | --- | --- |
| 22 | Segment users by use case: UI, API, tokenizer accuracy, model catalog, pricing. | User segment table. |
| 23 | Decide one primary ICP for next month. | Positioning update. |
| 24 | Publish "what changed from user feedback" post. | Trust and momentum. |
| 25 | Add API quickstart and quota explanation if API demand is real. | Better activation. |
| 26 | Launch on Product Hunt only if assets, support time, and onboarding are ready. | Optional PH launch. |
| 27 | Revisit domestic channels with a progress update, not a duplicate post. | Second-touch launch. |
| 28 | Review privacy, logging, ad claim, and platform compliance checklist. | Risk register update. |
| 29 | Decide whether to extend Early Access, add light paid manual invoicing, or stay free beta. | Monetization decision. |
| 30 | Publish 30-day recap: users, learnings, roadmap, and next access wave. | Public credibility artifact. |

## Post Angles

### Chinese launch thread

```text
我做了一个 AI Token Counter，想找正在做 AI 应用的开发者试用。

它解决的问题很具体：同一段输入发给不同模型，token 数、估算成本、是否支持图片/PDF/tool call、计数方式到底是官方还是本地估算，都可能不一样。

现在功能还在 Early Access，我会手动发 key，先收集真实工作流反馈，不急着做复杂付费。适合：

- 上线前想估算 prompt 成本；
- 要比较 OpenAI / Claude / Gemini / DeepSeek / Qwen 等模型；
- 想知道一个 token 数是官方精确、本地 tokenizer，还是粗略估算；
- 想把成本预估接到内部工具里。

边界也说清楚：它不是账单系统，不能保证替代 provider 最终账单；价格和模型规则会变化，生产采购前仍要核对官方信息。

如果你愿意试用，可以留言你的场景，或者填 Early Access 表单。我会优先发给正在做真实 AI 功能的人。
```

### English launch thread

```text
I built AI Token Counter, a model-aware workbench for comparing LLM token usage, estimated cost, model capability, and counting accuracy.

The pain point is simple: the same input can produce different counts and cost assumptions across providers, especially with chat templates, images, PDFs, and tool schemas.

It labels each result as official exact, official estimate, local exact, local estimate, or unsupported, so you can see how much to trust the number.

I'm running a small Early Access program first. Keys are issued manually, and I am looking for feedback from people building real AI features.

This is not a billing replacement. It is a pre-flight check for cost and tokenizer assumptions.
```

### GitHub release note angle

```text
Early Access pre-release: model-aware token and cost estimation for AI builders.

This release focuses on practical comparison, explicit accuracy labels, and a small protected API surface. Known limitations remain around provider-specific billing behavior, fast-changing prices, and unsupported official count APIs.
```

## Risk Register

### Legal and regulatory risks `[Legal / manual review required]`

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Personal information collection | Waitlist, emails, GitHub handles, and support messages may contain personal information. | Collect minimum data, disclose purpose, retention, contact channel, deletion path, and consent. |
| Cross-border data transfer | Overseas hosting, analytics, email tools, or provider APIs may move personal data or prompt content outside China. | Avoid sending raw prompts unless required and disclosed; review hosting and analytics setup. |
| Internet advertising compliance | Public posts, sponsored posts, affiliate links, or paid recommendations may be treated as advertising. | Make ads identifiable, avoid false or misleading claims, keep evidence for claims. |
| Employment/IP conflict | The founder is an employed developer and may have employer contract, non-compete, moonlighting, or IP assignment constraints. | Review employment agreement before commercial launch, using employer devices, or reusing work-related code/knowledge. |
| Provider trademark and API terms | Provider names/logos, tokenizer assets, model prices, and official count APIs may have license or usage limits. | Use factual references, respect trademarks, cite sources, follow provider terms, and keep license audit updated. |
| Paid plan obligations | Payments introduce consumer protection, refund, invoice, tax, and support expectations. | Delay heavy payment; start with manual Early Access and optionally manual invoicing only after review. |

### Platform risks `[Platform / manual review required]`

| Platform | Risk | Mitigation |
| --- | --- | --- |
| GitHub | Spam, fake stars, private information misuse, excessive automation, or misleading repo metadata. | Organic stars only, no scraped spam, respect acceptable use policies. |
| Product Hunt | Asking directly for upvotes, launching vaporware, or manipulating ranking. | Ask for feedback, visits, and comments; do not ask for upvotes. |
| Reddit / V2EX / communities | Duplicate promotional posts, rule violations, aggressive bumps. | Read rules, write community-specific posts, answer questions, do not mass repost. |
| SEO / Google | Thin pages, doorway pages, hidden text, keyword stuffing, link schemes, scaled low-value content. | Publish useful, original pages with examples and caveats. |
| Email / DM | Unsolicited bulk outreach or failure to honor opt-out. | Target only relevant users, send one follow-up max, stop on no/ignore. |

### Privacy and security risks `[Legal / manual review required]`

| Risk | Mitigation |
| --- | --- |
| Raw prompt leakage | Do not log raw prompts by default; redact diagnostics; warn before sending to official count APIs. |
| API key leakage | Manual key issuance, quotas, revocation, scoped keys, never expose provider keys client-side. |
| Sensitive user uploads | Avoid storing images/PDFs; disclose processing path; set size limits. |
| Analytics over-collection | Use minimal analytics; avoid collecting prompt content or unnecessary identifiers. |
| Feedback screenshots | Ask users to remove secrets before sharing; do not publish screenshots without consent. |

### Advertising and claim risks `[Legal / manual review required]`

| Risk | Mitigation |
| --- | --- |
| Absolute accuracy claims | Use "estimate" and explain accuracy labels. |
| Provider endorsement implication | Say "supports / compares provider models" only when accurate; do not imply official partnership. |
| Misleading savings claims | Avoid unverified percentage savings; use example scenarios with assumptions. |
| Hidden sponsored content | Mark sponsored, affiliate, or paid placements clearly. |
| Competitor disparagement | Compare capabilities factually; avoid insulting competing tools or providers. |

## Forbidden Wording

Do not use these phrases in public copy, ads, README badges, landing pages, DMs, or SEO pages unless legal and factual review later approves a narrower version.

| Forbidden wording | Safer alternative |
| --- | --- |
| "100% accurate token count" | "Accuracy label shown for each result" |
| "Guaranteed same as your final bill" | "Estimate for pre-flight cost comparison" |
| "Official for all models" | "Official count where provider API is supported; otherwise labeled fallback" |
| "Save 90% API cost" | "Compare model cost assumptions before choosing a model" |
| "The cheapest AI model selector" | "Cost and capability comparison for model selection" |
| "No privacy risk" | "Privacy-first defaults; review data flow before production use" |
| "Enterprise-grade compliance" | "Early Access; compliance items require manual review" |
| "Unlimited free API" | "Manual Early Access keys with quotas" |
| "Provider-approved / certified" | "Uses provider documentation and public APIs where available" |
| "Replace billing and observability" | "Complements billing and observability with pre-send estimates" |

## Metrics

### Daily metrics

- New Early Access requests.
- Accepted users and keys issued.
- Activated users: first successful UI run or API request.
- Feedback conversations started.
- Error reports or accuracy mismatch reports.
- Time spent on support.

### Weekly metrics

- Top 5 requested providers/models.
- Most common use cases.
- Drop-off reason before first success.
- Pages/posts that produced qualified users.
- Percentage of users asking for API access.
- Percentage of users asking for paid plan or team features.

### Decision thresholds

| Signal | Decision |
| --- | --- |
| 10+ users ask for the same provider/model | Prioritize catalog/tokenizer work. |
| 5+ users ask for API access and use it repeatedly | Improve API docs, quotas, and key management. |
| 3+ users ask whether results are bill-accurate | Improve accuracy methodology and warning copy. |
| 5+ users ask to pay | Consider light paid pilot after legal/payment review. |
| Support exceeds available personal time | Cap Early Access and improve onboarding. |

## Source Links For Manual Review

Use these as starting points, not final legal approval.

- Personal Information Protection Law of the PRC: https://www.cac.gov.cn/2021-08/20/c_1631050028355286.htm
- Measures for the Administration of Internet Advertising: https://www.gov.cn/zhengce/202305/content_6858084.htm
- GitHub Acceptable Use Policies: https://docs.github.com/site-policy/acceptable-use-policies/github-acceptable-use-policies
- Google Search Essentials: https://developers.google.com/search/docs/essentials
- Product Hunt Launch Guide: https://www.producthunt.com/launch/

## Final Checklist Before Launch Post

- Landing page has screenshot, Early Access CTA, privacy note, and accuracy caveat.
- README clearly states beta status and claim boundaries.
- Manual key issuance and revocation process is ready.
- API limits are configured for Early Access.
- Privacy/logging behavior is documented.
- At least one feedback channel is monitored daily.
- Legal/platform/privacy/advertising risk notes have been manually reviewed.
- No public copy uses forbidden wording.
