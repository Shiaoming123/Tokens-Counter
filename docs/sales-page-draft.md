# Sales Page Draft: AI Token Counter

> 写给前端落页的中文销售页文案草案。定位重点：AI 成本估算与 Token 审计工作台，而不是普通免费 token counter。

## 页面定位

**产品一句话**

AI Token Counter 是面向 AI 产品、研发与运营团队的成本估算与 Token 审计工作台，帮助你在上线前比较不同模型、输入形态和计费规则下的 Token 使用量、成本区间与估算可信度。

**English fallback**

AI Token Counter is a model-aware cost estimation and token audit workbench for teams building with LLMs.

**核心差异**

这不是一个只返回数字的免费 token counter。它把模型目录、文本/图片/PDF/工具调用输入、价格 profile、官方计数接口、本地 tokenizer、估算可信度、历史记录和外部 API 放在同一个工作台里，服务的是团队级的成本评估、方案对比和上线前审计。

## Hero

**主标题**

把 AI 成本估算和 Token 审计放进同一个工作台

**English fallback**

Estimate AI costs. Audit token usage. Compare models with confidence.

**副标题**

在发起真实 API 调用之前，快速比较 OpenAI、Anthropic、Gemini、DeepSeek、Qwen、GLM、Kimi、Cohere 等模型的文本、图片、PDF 和工具调用成本，并清楚看到每个结果来自官方计数、本地 tokenizer 还是保守估算。

**可信边界短句**

估算结果用于方案设计、预算预估和上线前审计，不替代任何 provider 的最终 invoice、usage dashboard 或合同账单。

**主 CTA**

申请 API / Team Early Access

**Secondary CTA**

查看演示案例

**English CTA fallback**

Request Early Access

View Example Audits

**Hero 支撑点**

- 177+ 模型目录条目，覆盖主流闭源与开源生态。
- 支持文本、图片、PDF、工具调用 schema 的统一估算。
- 每条结果都标记可信度：官方精确、官方估算、本地精确、本地估算或不支持。
- 支持官方价格与代理/编码工具价格 profile 对比。
- 提供外部 API v1，方便接入内部平台、评测系统和成本看板。

## 目标用户

**AI 产品负责人**

在需求评审和模型选型阶段，需要快速回答“这个功能按不同模型跑，大概会花多少钱”。

**AI 工程团队**

在 prompt、RAG、工具调用、图片输入和 PDF 处理上线前，需要比较上下文占用、输入输出成本和不同 provider 的计数差异。

**平台 / Infra 团队**

需要把 token 估算、模型目录和价格 profile 接入内部网关、评测流水线、成本看板或团队预算系统。

**财务、采购与运营团队**

需要在 provider 报价、代理计费、编码工具套餐和真实使用量之间建立可追溯的估算口径。

## 用户痛点

**模型成本不是一个简单数字**

同一段 prompt 在不同模型、不同上下文窗口、不同图片规则、不同缓存策略下，成本可能完全不同。普通 token counter 只告诉你一个 token 数，无法回答团队真正关心的预算问题。

**估算来源经常混在一起**

官方 count API、本地 tokenizer、近似 tokenizer、图片公式和手动价格表的可靠程度不同。如果工具不标明来源，团队很容易把“本地估算”误当成“官方账单口径”。

**多模态和工具调用越来越难审计**

生产请求已经不只是纯文本。图片、PDF、function calling / tool schema、system message、chat template 和缓存策略都会影响最终 usage。

**价格口径经常不止一种**

团队可能同时关注 provider list price、代理商价格、编码工具规则和内部加价口径。没有 profile 化的价格系统，成本讨论很难复现。

**估算能力难以接入内部流程**

Web 工具适合临时查询，但团队还需要 API：在 CI、评测、prompt 审核、工单系统、网关或预算看板里自动生成估算记录。

## 功能模块

### 1. 多模型成本对比

把同一份输入同时发送到多个模型配置，比较 token 数、上下文占用、输入成本、输出成本、缓存价格字段和总成本区间。

前端展示建议：

- 模型选择器
- 成本对比表
- 上下文窗口占用进度条
- 高成本/不支持状态提示

### 2. Token 审计标签

每个估算结果都显示准确性标签，避免团队把不同来源的数字混为一谈。

标签文案：

- `official_exact`：官方精确计数
- `official_estimate`：官方估算
- `local_exact`：本地精确 tokenizer
- `local_estimate`：本地估算
- `unsupported`：该模型不支持当前输入能力

页面短句：

不是所有 token 数都同样可靠。AI Token Counter 会把“怎么算出来的”显示在结果旁边。

### 3. 多输入形态估算

支持团队把真实生产请求拆成可审计的输入组件。

- 普通文本
- Chat messages
- 图片尺寸与图片 payload
- PDF 文本提取
- 工具调用 / function schema
- 预期输出 token
- 缓存输入与缓存写入价格字段

### 4. 价格 Profile 对比

在同一套 token 结果下切换不同计费规则，比较官方目录价格与代理/编码工具规则。

当前可用口径：

- `official`：项目模型目录与 provider 文档价格
- `ccswitch`：类似 CC Switch 的代理/编码工具价格 profile

页面短句：

同一段输入，不同计费口径。让产品、工程和财务在同一张表里讨论。

### 5. 外部 API v1

把成本估算能力接入内部系统，而不只停留在手动网页查询。

可突出端点：

- `GET /api/v1/models`
- `POST /api/v1/estimates`
- `POST /api/v1/tokens/count`

API 能力文案：

用一个稳定的 JSON API 获取模型目录、批量估算结果和 token count 结果。支持 Bearer API key、rate limit headers、标准错误结构和 `Idempotency-Key`，适合接入内部网关、评测流水线和成本看板。

### 6. 团队审计工作流

为上线前检查、prompt 评审和成本复盘保留可分享的证据。

可展示能力：

- 本地历史记录
- Markdown 复制
- CSV 导出
- 模型能力和价格来源提示
- tokenizer / provider license 提示

## Early Access 定价

> 定价用于销售页草案展示，最终金额、配额和 SLA 以正式商业条款为准。

### API Early Access

适合：需要把估算能力接入内部工具、脚本、网关或评测流水线的工程团队。

建议展示价格：

**$49 / month 起**

包含：

- 外部 API v1 访问
- API key 保护
- 模型目录查询
- 批量成本估算
- token count 端点
- 基础 rate limit
- OpenAPI schema
- 邮件 / issue 支持

页面说明：

适合先把 token 估算纳入自动化流程。官方 provider count 调用可能产生上游费用，需使用团队自己的 provider key 或单独约定托管方式。

English fallback:

API Early Access starts at $49/month for teams integrating token and cost estimates into internal workflows.

### Team Early Access

适合：需要多人协作、共享估算口径、沉淀审计记录的产品与研发团队。

建议展示价格：

**$199 / month 起**

包含：

- API Early Access 全部能力
- 团队工作区草案
- 共享价格 profile
- 估算历史导出
- Prompt / 模型选型审计模板
- 月度使用摘要
- 优先支持

页面说明：

适合把成本评估变成团队流程，而不是依赖单个工程师的临时脚本。

English fallback:

Team Early Access starts at $199/month for shared audits, pricing profiles, and model-selection workflows.

### Enterprise Pilot

适合：对私有部署、合规、采购流程、内部门户或大规模调用有要求的组织。

价格文案：

**联系我们**

可讨论：

- 私有部署或专属环境
- SSO / 权限模型
- 共享限流与配额系统
- 自定义 provider / 代理价格 profile
- 成本数据保留策略
- 内部采购与安全评审材料

English fallback:

Enterprise Pilot: private deployment, custom pricing profiles, access control, and procurement support.

## 可信说明

**我们明确区分估算来源**

AI Token Counter 不把所有数字都包装成“准确”。页面和 API 会标记每个结果的计数方式与可信度，让用户知道它来自官方接口、本地 tokenizer、近似规则还是能力不支持。

**我们不替代 provider invoice**

最终计费可能受 chat template、system message、tool schema、缓存、provider 内部优化、图片/PDF 处理规则、四舍五入、价格更新和合同折扣影响。AI Token Counter 的结果适合预算预估、上线前审计和方案比较，不替代 OpenAI、Anthropic、Google、Moonshot 等 provider 的 invoice、usage dashboard 或合同账单。

**默认隐私友好**

本地估算优先在浏览器和服务端逻辑内完成。只有启用官方计数 API 时，请求才会发送给对应 provider。生产部署应使用服务端环境变量保存 provider key，不应把 provider key 暴露到前端。

**价格需要持续校验**

模型价格变化很快。正式采购、客户报价或财务结算前，应以 provider 官方价格页、合同和实际账单为准。

**开源与可审计**

项目保留模型目录、价格 profile、OpenAPI schema、tokenizer 研究记录和 production checklist，方便团队审查估算口径，而不是只相信一个黑盒数字。

## FAQ

### 这是免费 token counter 吗？

不是。AI Token Counter 可以用于单次查询，但产品定位是 AI 成本估算与 Token 审计工作台。它关注模型对比、价格口径、估算来源、团队流程和 API 集成。

### 估算结果有多准？

取决于模型和输入类型。页面会标记结果是官方精确、官方估算、本地精确、本地估算还是不支持。即使是官方计数，也可能与最终账单因缓存、模板、图片处理或 provider 内部规则不同而存在差异。

### 能替代 OpenAI、Anthropic、Google 或其他 provider 的账单吗？

不能。它可以帮助你在调用前做预算和审计，也可以帮助团队复盘成本口径，但最终结算应以 provider invoice、usage dashboard 和合同条款为准。

### 支持哪些输入？

支持文本、chat messages、图片、PDF 文本提取、工具调用 schema、预期输出 token，以及部分缓存价格字段。具体能力取决于模型目录和 provider 支持情况。

### 支持哪些价格口径？

当前支持官方/目录价格 `official`，以及类似 CC Switch 的代理/编码工具价格 profile `ccswitch`。团队版可以继续扩展自定义价格 profile。

### API 可以接入内部系统吗？

可以。外部 API v1 提供模型目录、估算和 token count 端点，适合接入 CI、评测平台、prompt 审核、成本看板、内部网关和运营工具。

### 会上传我的 prompt 吗？

本地估算不会主动上传到第三方 provider。启用官方计数 API 时，请求会发送到对应 provider，因此生产环境需要根据团队的数据安全政策决定哪些场景允许使用官方计数。

### Early Access 适合什么团队？

适合已经在多个模型、多个 provider 或多个价格口径之间做选择的团队。尤其适合正在建设 AI 网关、评测平台、内部 AI 工具、客户报价系统或团队成本看板的组织。

## CTA 区块

**标题**

先审计，再上线

**副标题**

把 prompt、模型、输入形态和价格口径放到同一个工作台里，在真实调用和真实账单出现之前，先把成本风险看清楚。

**主按钮**

申请 Early Access

**副按钮**

查看 API 文档

**辅助链接**

查看示例审计案例

**English fallback**

Audit before you ship.

Request Early Access

Read API Docs

## 案例入口

### 案例 1：Prompt 上线前成本审计

入口标题：

一次性比较 6 个模型的 prompt 成本

入口摘要：

把同一段 system prompt、用户输入和预期输出 token 放进工作台，比较 GPT、Claude、Gemini、Qwen、Kimi 等模型的成本、上下文占用和估算可信度。

适合跳转：

Prompt Cost Audit

### 案例 2：多模态功能预算评估

入口标题：

图片和 PDF 输入到底会贵多少？

入口摘要：

上传图片尺寸或 PDF 文本，查看哪些模型支持该输入、哪些只能估算、哪些会因为能力不支持而被排除。

适合跳转：

Multimodal Cost Review

### 案例 3：内部 API 成本网关

入口标题：

把 Token 估算接入内部系统

入口摘要：

使用 `/api/v1/estimates` 在评测流水线、prompt 审核系统或 AI 网关中自动生成成本估算，并用 `Idempotency-Key` 支持安全重试。

适合跳转：

API Integration Example

### 案例 4：代理/编码工具价格对比

入口标题：

同一份输入，不同价格 profile

入口摘要：

在官方价格和代理/编码工具价格之间切换，帮助团队讨论真实预算、客户报价和内部成本归因。

适合跳转：

Pricing Profile Comparison

## 前端落页组件建议

- Hero：标题、副标题、双 CTA、可信边界短句。
- Audience：4 个目标用户卡片。
- Pain：5 个痛点分栏。
- Features：6 个功能区块，穿插产品截图或简化表格。
- Pricing：3 档 Early Access。
- Trust：准确性标签、隐私、invoice 边界、价格更新说明。
- Case Entries：4 个案例入口卡片。
- FAQ：8 个问题。
- Final CTA：申请 Early Access + 查看 API 文档。

## 页面可复用短句

- “不是每个 token 数都值得同样信任。”
- “把估算来源显示出来，团队才知道该如何使用这个数字。”
- “成本估算不是财务结算，但它应该足够可追溯。”
- “从单次查询，到团队审计，再到内部 API。”
- “Compare before you commit.”
- “Model-aware cost estimates for serious AI teams.”
- “Token counting is easy. Token auditing is the real workflow.”

## Early Access contact implementation note

Use a direct email CTA for the first launch:

`mailto:henshiaoming@gmail.com?subject=[AI%20Token%20Counter]%20Early%20Access%20request`

Recommended button labels:

- Chinese: `邮件申请 Early Access`
- English: `Request Early Access by email`

Ask the user to include:

- their use case,
- whether they need UI or API access,
- expected monthly request volume,
- required models or providers,
- whether inputs may contain sensitive content.
