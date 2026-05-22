# Early Access Launch Kit

Last updated: 2026-05-22

This launch kit is for the first Chinese Early Access wave. The goal is not broad traffic. The goal is to find real AI builders who can test whether AI Token Counter is useful inside prompt review, model selection, API cost estimation, and internal tooling workflows.

## Launch Order

1. Warm outreach to 20-30 known or reachable AI builders.
2. Small-group posts in approved WeChat, Feishu, or developer groups.
3. One V2EX post after the Trust Center and Early Access page are live.
4. One technical article on Juejin or a personal blog.
5. Overseas channels only after feedback, FAQ, and one anonymized case study are ready.

Do not launch Product Hunt, Hacker News, or broad Reddit promotion in the first wave unless support time, onboarding, and risk review are ready.

## Link Targets

- Demo: https://tokens-counter.vercel.app
- Early Access: https://tokens-counter.vercel.app/early-access
- Trust Center: https://tokens-counter.vercel.app/trust
- Case Studies: https://tokens-counter.vercel.app/case-studies
- API Docs: https://tokens-counter.vercel.app/api-docs
- GitHub: https://github.com/Shiaoming123/Tokens-Counter

## Core Claims

Use:

- Estimate token usage and API cost before production.
- Compare models, pricing profiles, and accuracy labels.
- Audit assumptions for prompts, images, PDFs, and tool schemas.
- Early Access keys are issued manually with conservative limits.

Avoid:

- 100% accurate.
- Replaces provider bills.
- Officially certified by providers.
- No privacy risk.
- Unlimited free API.
- Enterprise-grade compliance.

## Warm Outreach DM

```text
我最近在做一个 AI Token Counter，想找正在做 AI 应用的人小范围试用。

它不是普通 token counter，而是把同一段输入放到不同模型下，对比 token 数、预估 API 成本、模型能力和计数可信度。现在支持文本、图片、PDF、对话消息和 tool schema，也有一个受保护的 /api/v1 接口，适合接到内部工具或评测流程里。

现在还是 Early Access，我会人工发 API key，先收真实工作流反馈，不急着做复杂付费。边界也说清楚：它是上线前估算和审计工具，不替代 provider 最终账单；官方计数模式可能会把内容发到对应供应商 API，敏感内容建议用脱敏样例。

如果你最近正好在做 AI 功能、RAG、Agent、内部网关或成本看板，我想请你试一下。你更想测网页，还是 API？

Demo: https://tokens-counter.vercel.app
Early Access: https://tokens-counter.vercel.app/early-access
Trust Center: https://tokens-counter.vercel.app/trust
```

## Group Post Short Version

```text
我做了一个 AI Token Counter，想找正在做 AI 应用的开发者小范围试用。

它可以把同一段 prompt / 对话 / 图片 / PDF / tool schema 放到不同模型下，对比 token 数、预估 API 成本、模型能力和计数可信度。目标是上线前先看清成本和 tokenizer 假设，不是替代最终账单。

现在是 Early Access，API key 人工发放，限额保守，主要想收真实工作流反馈。敏感数据建议用脱敏样例；官方计数模式可能会调用对应供应商 API。

Demo: https://tokens-counter.vercel.app
申请: https://tokens-counter.vercel.app/early-access
可信边界: https://tokens-counter.vercel.app/trust
```

Ask group owners before posting in private communities.

## V2EX Draft

Title:

```text
做了一个多模型 Token / API 成本估算工具，想找正在做 AI 应用的开发者试用
```

Body:

```text
我最近做了一个 AI Token Counter，想找一些正在做 AI 应用、RAG、Agent 或内部工具的开发者试用。

它解决的问题比较具体：同一段输入发给不同模型，token 数、预估 API 成本、是否支持图片/PDF/tool call、计数方式到底是官方还是本地估算，都可能不一样。

目前支持：

- 多模型 token 和成本对比
- 文本、对话消息、图片、PDF、tool schema
- 每个结果标注 official_exact / official_estimate / local_exact / local_estimate / unsupported
- pricing profile，用来区分 provider 目录价和代理/内部计费规则
- 受保护的 /api/v1/models、/api/v1/estimates、/api/v1/tokens/count

边界也提前说清楚：

- 这是上线前估算和审计工具，不替代 provider 最终账单
- 价格和模型规则会变，商业决策前仍要核对官方文档
- 本地估算优先留在本地；启用官方计数时，请求内容可能会发送到对应供应商 API
- 现在是 Early Access，API key 人工发放，限额保守，不是无限免费 API

我比较想听到真实工作流反馈，比如：

- 你会不会在 prompt review / CI / 内部网关里用这个？
- 哪个模型或供应商最缺？
- 准确性标签是否足够清楚？
- API 返回结构是否适合接入你现有系统？

Demo: https://tokens-counter.vercel.app
Early Access: https://tokens-counter.vercel.app/early-access
Trust Center: https://tokens-counter.vercel.app/trust
GitHub: https://github.com/Shiaoming123/Tokens-Counter
```

## Juejin / Blog Outline

Title:

```text
为什么 Token 估算不能只看字符数：我做了一个多模型成本审计工具
```

Outline:

1. Problem: AI feature cost is hard to predict before launch.
2. Why simple token counters are not enough:
   - chat templates,
   - tool schemas,
   - images,
   - PDFs,
   - expected output,
   - cache pricing,
   - proxy billing.
3. Accuracy labels:
   - official exact,
   - official estimate,
   - local exact,
   - local estimate,
   - unsupported.
4. Pricing profile design:
   - provider catalog,
   - proxy or coding-tool pricing,
   - custom multiplier.
5. API design:
   - bearer key,
   - idempotency key,
   - rate limit headers,
   - usage summary,
   - standard error shape.
6. Privacy and trust boundaries:
   - local estimates,
   - official counting provider calls,
   - no raw prompt logging by default,
   - not a billing replacement.
7. Early Access invitation.

## First Feedback Questions

Send these after a user tries the product:

1. What workflow did you test: web UI, API, pricing profile, model comparison, or tokenizer accuracy?
2. Did the result help you make a decision?
3. Which number or label felt unclear?
4. What model/provider was missing or wrong?
5. Would you use this again in a real review flow?
6. What would make it worth paying for later?

## Risk Checklist Before Each Public Post

- No absolute accuracy claim.
- No provider endorsement claim.
- No promise of final bill replacement.
- No pressure to upload sensitive company data.
- No paid plan promise unless payment, tax, refund, and support path are reviewed.
- Link to Trust Center whenever API keys or official counting are mentioned.
- Do not ask for upvotes, stars, or artificial engagement.
