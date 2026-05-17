# AI Token Counter

<p align="center">
  <img src="./public/og-image.svg" alt="AI Token Counter 预览图" width="820" />
</p>

<p align="center">
  <a href="https://github.com/Shiaoming123/Tokens-Counter"><img alt="Repository" src="https://img.shields.io/badge/GitHub-Tokens--Counter-111827?logo=github" /></a>
  <img alt="Vue" src="https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=white" />
  <img alt="API" src="https://img.shields.io/badge/API-Hono-ff5b11" />
  <img alt="Tests" src="https://img.shields.io/badge/tests-78%20passing-30a46c" />
</p>

<p align="center">
  <a href="./README.md">
    <img alt="Read the English README" src="https://img.shields.io/badge/README-English-111827" />
  </a>
  ·
  <strong>简体中文</strong>
</p>

AI Token Counter，也就是这个项目里的「Token 点钞机」，是一个面向多模型 Token 计算和 API 成本估算的工作台。它可以把文本、图片、PDF、工具调用、模型价格、分词器准确度和许可证提示放在同一个页面里对比。

它解决的核心问题很简单：

> 如果我把这段输入发给不同 AI 模型，会消耗多少 Token，大概多少钱，这个估算到底有多可信？

## 目录

- [功能亮点](#功能亮点)
- [截图](#截图)
- [适合场景](#适合场景)
- [准确度模型](#准确度模型)
- [支持的模型厂商](#支持的模型厂商)
- [快速开始](#快速开始)
- [环境变量](#环境变量)
- [外部 API](#外部-api)
- [项目结构](#项目结构)
- [新增模型](#新增模型)
- [隐私与安全](#隐私与安全)
- [路线图](#路线图)
- [贡献](#贡献)
- [商业化](#商业化)
- [许可证](#许可证)

## 功能亮点

- **177 个模型目录条目**，覆盖 OpenAI、Anthropic、Google、DeepSeek、Qwen、GLM/Z.AI、Mistral、Meta Llama、xAI、Cohere、Baidu ERNIE、Doubao、Moonshot/Kimi、StepFun、MiniMax 和 Xiaomi MiMo。
- **文本、图片、PDF、工具调用** 都可以放进同一个工作台估算。
- **每条结果都显示准确度**：官方精确、官方估算、本地精确、本地估算或不支持。
- **按模型能力处理图片输入**：上传图片后，左侧不支持视觉输入的模型会自动置灰，无法选择。
- **多套计费规则**：支持官方/目录价格，也支持类似 CC Switch 的代理或 coding-tool 计费规则。
- **外部 API v1**：提供 `/api/v1/models`、`/api/v1/estimates` 和 `/api/v1/tokens/count`。
- **Apple 风格界面**：支持明暗模式、模型 Logo、完整对比抽屉、本地历史、Markdown 复制和 CSV 导出。
- **默认隐私友好**：本地估算不会上传输入；只有启用官方计数 API 时才会把请求发给对应厂商。

## 截图

<p align="center">
  <img src="./screenshot.png" alt="AI Token Counter 应用截图" width="920" />
</p>

如果 UI 后续更新，请在公开仓库前替换 `screenshot.png`。

## 适合场景

- 写 prompt 前估算不同模型的成本。
- 比较文本、图片、PDF、工具调用的 Token 用量。
- 判断某个模型是否支持当前输入能力，比如图片或 PDF。
- 对比官方价格和代理/编码工具价格。
- 把 Token 计算和成本估算能力开放给内部系统或外部客户。
- 审计分词器映射，避免把估算结果误当成官方账单。

## 准确度模型

Token 计算不是一个统一问题。项目里明确区分以下几类：

| 准确度 | 含义 |
| --- | --- |
| `official_exact` | 厂商 API 对当前 payload 返回精确计数。 |
| `official_estimate` | 厂商 API 返回官方估算，或最终账单可能略有差异。 |
| `local_exact` | 项目中有明确本地 tokenizer 或明确映射的 tokenizer 资源。 |
| `local_estimate` | 使用同族 tokenizer、本地启发式算法或公式估算。 |
| `unsupported` | 该模型不支持当前输入能力。 |

注意：

- Chat template、工具调用、系统消息、缓存、厂商内部优化都可能改变最终 API usage。
- 图片、视频、PDF 的计数尤其依赖厂商规则。
- 价格变化很快，商业使用前请以厂商官方价格页为准。

更多调研见：[Tokenizer Mapping And License Audit](./docs/tokenizer-research-2026-05-17.md)。

## 支持的模型厂商

| 厂商 | 模型条目 | 当前计数方式 |
| --- | ---: | --- |
| OpenAI | 60 | `js-tiktoken`、官方计数 API fallback、图片公式 |
| Anthropic Claude | 23 | 官方 `count_tokens` API |
| Google Gemini | 9 | 官方 `countTokens` API 和本地图片 fallback |
| DeepSeek | 9 | 可用时映射 Hugging Face tokenizer 资源 |
| Alibaba Qwen | 14 | 开源模型映射 Qwen tokenizer；托管别名保守标注 |
| Z.AI / GLM | 9 | 官方 tokenizer API |
| Xiaomi MiMo | 5 | 可用时映射开源 checkpoint tokenizer |
| Mistral | 10 | 接入 `mistral-common` 前先标为本地估算 |
| Meta Llama | 4 | 本地估算，并提示模型许可证风险 |
| xAI Grok | 9 | 接入官方 tokenize API 前先本地估算 |
| Cohere | 3 | 接入官方 tokenize API 前先本地估算 |
| Baidu ERNIE | 1 | 映射 ERNIE tokenizer 资源 |
| ByteDance / Doubao | 6 | 接入官方 calculator 前先本地估算 |
| Moonshot / Kimi | 7 | 接入官方 estimate API 前先本地估算 |
| StepFun | 1 | 接入官方 token-count API 前先本地估算 |
| MiniMax | 7 | 本地估算 |

## 快速开始

推荐使用 Node.js 24 或更新版本。

```bash
git clone git@github.com:Shiaoming123/Tokens-Counter.git
cd Tokens-Counter
npm install
cp .env.example .env
npm run dev
```

默认本地地址：

- Web: `http://localhost:5173`
- API: `http://localhost:8787`

Vite 开发服务会把 `/api/*` 代理到本地 Hono 服务。

## 环境变量

```bash
# Server
PORT=8787
TOKEN_COUNTER_API_KEY=

# Links 页面使用的公开链接
VITE_APP_PUBLIC_URL=https://your-domain.example
VITE_APP_GITHUB_URL=https://github.com/Shiaoming123/Tokens-Counter

# 官方计数 API
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
ZAI_API_KEY=
ZHIPU_API_KEY=
```

说明：

- API key 必须只放在服务端环境变量里，不要写进前端代码。
- 没有官方 provider key 时，项目会尽量使用本地计数，并在结果中标明准确度。
- 配置 `TOKEN_COUNTER_API_KEY` 后，外部 `/api/v1/*` API 会要求 Bearer token。

## 常用命令

```bash
# 同时启动前端和 API
npm run dev

# 只启动前端
npm run dev:web

# 只启动 Hono API
npm run dev:api

# 运行测试
npm test

# 类型检查并构建
npm run build

# 用 dist/ 静态文件启动生产服务
npm start
```

## 外部 API

外部 API 使用 `/api/v1` 作为版本前缀。

```bash
curl "$BASE_URL/api/v1/models" \
  -H "Authorization: Bearer $TOKEN_COUNTER_API_KEY"
```

```bash
curl "$BASE_URL/api/v1/estimates" \
  -H "Authorization: Bearer $TOKEN_COUNTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "models": ["gpt-4o", "claude-sonnet-4.5", "gemini-2.5-flash"],
    "input": {
      "type": "text",
      "text": "Compare the API cost of this prompt."
    },
    "options": {
      "output_tokens": 1000,
      "pricing_profile": "official"
    }
  }'
```

端点：

- `GET /api/v1/models`
- `POST /api/v1/estimates`
- `POST /api/v1/tokens/count`

完整说明见：[External Token API Specification](./docs/external-token-api.md)

生产检查清单见：[External API Production Checklist](./docs/external-api-production-checklist.md)

## 项目结构

```text
server/
  index.ts                    # Hono API server 和官方计数代理
  env.ts                      # 服务端环境变量解析

src/
  components/                 # Vue UI 组件
  core/
    accuracy/                 # 准确度标签和 UI 元数据
    api/                      # 前端 API client
    cost/                     # 成本计算和汇率换算
    count/                    # 结果组装和计数方式合并
    document/                 # PDF 文本提取
    estimate/                 # 外部 API 估算服务
    history/                  # LocalStorage 历史和导出
    models/                   # 模型 registry、厂商标签、排序
    pricing/                  # 计费规则 profile
    tokenizers/               # tiktoken、Hugging Face loader、近似算法
    tools/                    # 工具调用 schema token 估算
    vision/                   # 图片 token 公式
  data/
    models.json               # 模型能力目录
    model-pricing.json        # 官方/目录价格
    pricing-profiles.json     # 替代计费规则
    licenses.json             # tokenizer/provider license notices
  stores/                     # Pinia stores
  types/                      # 领域类型
  workers/                    # 浏览器 tokenizer worker

docs/
  external-token-api.md
  external-api-production-checklist.md
  tokenizer-research-2026-05-17.md
  launch-and-monetization-plan.md

test/
  *.test.ts                   # Vitest 测试
```

## 新增模型

新增或修正模型时，优先改数据文件：

1. 在 `src/data/models.json` 添加或更新模型。
2. 在 `src/data/model-pricing.json` 或 `src/data/pricing-profiles.json` 添加价格。
3. 在 `src/data/licenses.json` 添加或更新来源/许可证说明。
4. 如果模型声明 `local_exact`，并使用 Hugging Face 类 tokenizer，需要在 `src/core/tokenizers/tokenizerLoader.ts` 添加明确 repo 映射。
5. 运行：

```bash
npm test
npm run build
```

registry 测试会阻止没有明确 tokenizer repo 映射的 `local_exact` 声明。

## 隐私与安全

- 本地文本、图片、PDF 估算会尽量在浏览器内完成。
- 官方计数模式会通过服务端把 payload 发给对应厂商 API。
- 本地历史保存在浏览器 LocalStorage。
- Provider API key 只从服务端环境变量读取。
- 公开 API 上线前应配置 `TOKEN_COUNTER_API_KEY` 和真正的限流。
- 生产环境默认不应记录完整 prompt、图片、PDF 或工具 payload。

## 路线图

- 接入 Cohere、xAI、Moonshot/Kimi、StepFun、Volcano Ark 的官方计数 API。
- 用 `mistral-common` 替换 Mistral 的通用 fallback。
- 为结构化 messages 和 tools 添加 chat-template-aware 计数。
- 添加账号/API key 管理、真实限流和 usage analytics。
- 补充 Vercel、Cloudflare Pages、单 Node 服务部署文档。
- 添加团队自定义计费规则编辑器。
- 增加 tokenizer license 和 pricing source 新鲜度自动检查。

## 贡献

仓库公开后欢迎贡献。

适合 first contribution 的方向：

- 根据官方来源修正模型价格。
- 添加缺失模型。
- 改进 tokenizer 映射准确度。
- 添加厂商 Logo 或能力标记。
- 改进文档和 API 示例。
- 为 tokenizer 或成本公式添加测试。

提交 PR 前请运行：

```bash
npm test
npm run build
```

价格和 tokenizer 相关变更请附上官方文档、model card、价格页或 API 文档链接。

## 商业化

项目适合走开源 + 商业服务路线：

- 免费公开 UI。
- 付费 hosted API key。
- 团队共享计费规则。
- 私有部署。
- 自定义模型目录维护。
- LLM 成本估算工作流咨询。

分阶段计划见：[Launch And Monetization Plan](./docs/launch-and-monetization-plan.md)。

## 许可证

当前仓库还没有根目录 `LICENSE` 文件。设为公开开源前建议选择：

- **MIT**：最简单，最利于传播。
- **Apache-2.0**：宽松许可证，并包含明确专利条款。
- **Open-core / 双许可证**：公开基础工具，把 hosted/team/enterprise 能力保留给付费版本。

第三方 tokenizer、模型、provider API 和价格来源声明见 [LICENSES.md](./LICENSES.md) 和 `src/data/licenses.json`。

## 致谢

本项目基于许多开源与厂商生态构建，包括 Vue、Vite、Hono、Element Plus、js-tiktoken、pdf.js、Simple Icons、Hugging Face tokenizer assets，以及各模型厂商官方 API。
