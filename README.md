# AI Token 点钞机

AI Token 点钞机是一个面向多模型输入成本估算的 Web 工具。它把文本 token、图片/视觉 token、官方计数 API、成本估算、准确度等级和许可证提示放在同一个工作台里，适合在写 prompt、评估多模态任务成本、比较模型预算时快速使用。

当前 v1 的核心原则是：

- 本地能相对可靠计算的，优先本地计算。
- 闭源模型需要官方计数的，走服务端 API 代理。
- 图片 token 独立按厂商规则估算或官方 API 计数。
- 每一条结果都显示准确度、计数方式、许可证引用和 warning。
- 用户输入与图片默认不上传到第三方，除非启用 Claude/Gemini 官方计数 API。

## 功能特性

- 文本 token 计数：支持中文、英文、emoji 和长文本。
- 图片 token 估算：读取图片尺寸、MIME type、文件大小，并按模型规则估算视觉 token。
- 多模型对比表：横向比较文本 tokens、图片 tokens、总 input tokens、预估 output tokens、费用、上下文占用比例和准确度。
- 官方计数模式：通过服务端代理调用 Anthropic Claude `messages.countTokens`、Google Gemini `countTokens` 和 Z.AI/GLM `/tokenizer`。
- 成本估算：基于 `src/data/model-pricing.json` 的手动价格表计算 input/output/total cost。
- 准确度标签：区分官方估算、本地精确、本地近似、不支持。
- 历史记录：最近 20 次结果仅保存到浏览器 LocalStorage。
- 导出能力：支持复制 Markdown 表格和导出 CSV。
- 许可证页面：展示 tokenizer、官方 API、开源模型相关许可证和商用风险提示。

## 支持矩阵

| 模型 | 文本计数 | 图片计数 | 准确度 | 实现方式 |
| --- | --- | --- | --- | --- |
| GPT-4o | 支持 | 支持 | 文本本地，图片估算 | `js-tiktoken` + OpenAI tile 规则 |
| GPT-4.1 | 支持 | 支持 | 文本本地，图片估算 | `js-tiktoken` + OpenAI tile 规则 |
| GPT-5 | 支持 | 支持 | 文本本地，图片估算 | `js-tiktoken` + OpenAI tile 规则 |
| DeepSeek-V4 Flash / Pro | 支持 | 暂不支持 | 本地近似 | 官方 tokenizer 包待接入，v1 先 fallback |
| Qwen / Qwen3.6 | 支持 | 暂不支持 | 本地近似 | byte-level BPE/tiktoken 路线，v1 未内置模型专属 tokenizer |
| Qwen-VL Plus | 支持 | 支持 | 本地近似 | 文本近似 + Qwen-VL 像素预算估算 |
| GLM-4.5 / Air | 支持 | 暂不支持 | 官方估算 / 本地近似 | Z.AI `/tokenizer`，无 Key 时 fallback |
| GLM-4.5V | 支持 | 支持 | 官方估算 / 本地近似 | Z.AI `/tokenizer` |
| Xiaomi MiMo | 支持 | 暂不支持 | 本地近似 | MiMo/HF/ModelScope tokenizer 资源待接入 |
| Claude Opus / Sonnet | 支持 | 支持 | 官方估算 | Anthropic `messages.countTokens` |
| Gemini Flash / Pro | 支持 | 支持 | 官方估算 / 本地估算 | Google GenAI `countTokens` + 本地图片规则 |
| Mistral | 支持 | 暂不支持 | 本地近似 | v1 fallback tokenizer |
| Llama | 支持 | 暂不支持 | 本地近似 | v1 fallback tokenizer + license warning |

## 技术栈

- 前端：Vite, Vue 3, TypeScript, Element Plus, Pinia, Lucide Icons
- 本地 tokenizer：`js-tiktoken`
- 后端：Hono, `@hono/node-server`
- 官方计数 SDK：`@anthropic-ai/sdk`, `@google/genai`
- 测试：Vitest

## 快速开始

```bash
npm install
npm run dev
```

默认地址：

- Web: `http://localhost:5173/`
- API: `http://localhost:8787/`

Vite 会把 `/api` 代理到本地 Hono API。

## 环境变量

复制 `.env.example` 后配置：

```bash
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
OPENAI_API_KEY=
ZAI_API_KEY=
ZHIPU_API_KEY=
PORT=8787
```

说明：

- `ANTHROPIC_API_KEY`：启用 Claude 官方 `messages.countTokens`。
- `GEMINI_API_KEY`：启用 Gemini 官方 `countTokens`。
- `OPENAI_API_KEY`：预留字段，v1 暂未调用 OpenAI 官方 API。
- `ZAI_API_KEY` / `ZHIPU_API_KEY`：启用 GLM 官方 `/tokenizer`。
- `PORT`：Hono API 服务端口，默认 `8787`。

如果没有配置官方 API Key：

- Claude 会显示“需要 API Key”，不会使用第三方 tokenizer 冒充官方计数。
- Gemini 会回退到本地文本近似和图片规则估算，并显示 warning。
- GLM 会回退到本地近似，并提示配置 Z.AI API Key。

## 常用命令

```bash
# 同时启动前端和 API
npm run dev

# 只启动前端
npm run dev:web

# 只启动 API
npm run dev:api

# 单元测试
npm run test

# 生产构建
npm run build

# 启动 Hono API，并在 dist 存在时托管构建后的前端
npm start
```

## 项目结构

```text
server/
  index.ts                  # Hono API: models, pricing, Claude/Gemini count endpoints

src/
  components/               # Vue UI components
  core/
    accuracy/               # 准确度标签映射
    api/                    # 前端 API client
    cost/                   # 成本计算
    count/                  # 结果组装与官方/本地计数合并
    history/                # LocalStorage 历史和导出
    models/                 # 模型、价格、许可证 registry
    tokenizers/             # tiktoken 和 fallback tokenizer
    vision/                 # OpenAI/Gemini 图片 token 规则
  data/
    licenses.json           # 许可证声明数据
    model-pricing.json      # 模型价格表
    models.json             # 模型能力与计数配置
  types/
    domain.ts               # 领域类型定义
  workers/
    tokenizer.worker.ts     # 本地 tokenizer worker

test/
  vision.test.ts            # 图片公式和成本计算测试
```

## API

### `GET /api/models`

返回模型配置和许可证配置。

### `GET /api/pricing`

返回 `model-pricing.json` 价格表。

### `POST /api/count/anthropic`

通过 Anthropic 官方 `messages.countTokens` 计算 Claude 输入 tokens。

请求：

```json
{
  "modelId": "claude-sonnet-4.5",
  "input": {
    "text": "请总结这段文字",
    "images": []
  }
}
```

### `POST /api/count/gemini`

通过 Google GenAI `countTokens` 计算 Gemini 输入 tokens。图片会以 inline base64 形式发给官方 API，仅在用户启用官方计数并配置 `GEMINI_API_KEY` 时发生。

### `POST /api/count/zai`

通过 Z.AI 官方 `/api/paas/v4/tokenizer` 计算 GLM 输入 tokens。

请求：

```json
{
  "modelId": "glm-4.5",
  "input": {
    "text": "请总结这段文字",
    "images": []
  }
}
```

## 计数规则说明

### OpenAI 文本

OpenAI 文本使用 `js-tiktoken` 本地计数。GPT-4o、GPT-4.1、GPT-5 系列默认使用 `o200k_base`。

### OpenAI 图片

OpenAI 图片使用 tile-based 规则估算：

1. 高精度模式先缩放到 `2048 x 2048` 内。
2. 再把短边缩放到 `768px`。
3. 按 `512 x 512` tile 计数。
4. 公式为 `baseTokens + tiles * tileTokens`。

### Gemini 图片

Gemini 本地估算规则：

- 两边都不超过 `384px`：`258 tokens`
- 更大图片：按 `768 x 768` tile 估算，每个 tile `258 tokens`

有 `GEMINI_API_KEY` 时优先使用官方 `countTokens`。

### Claude 图片

Claude 不做本地图片公式。需要 `ANTHROPIC_API_KEY` 走官方 `messages.countTokens`。

### DeepSeek

DeepSeek 官方文档提供离线 tokenizer 下载，用于在本地计算 token 用量。v1 已在模型配置中加入 DeepSeek-V4 Flash / Pro，但还没有把官方 tokenizer zip 打包进浏览器 worker，因此文本结果标为本地近似。

### Qwen

Qwen 开源文档说明 tokenizer 使用 byte-level BPE，早期 Qwen 系列基于 tiktoken 并带模型专属词表和控制 token。v1 已加入 Qwen Plus、Qwen3.6 Plus 和 Qwen-VL Plus；后续可从 Hugging Face 或 ModelScope 拉取模型专属 `tokenizer.json`、`tokenizer_config.json`、`special_tokens_map.json` 或 `qwen.tiktoken` 来做精确本地计数。

Qwen-VL 图片估算当前按 28×28 patch 和像素预算做本地近似，实际以百炼/DashScope usage 为准。

### GLM / Z.AI

Z.AI 提供官方 tokenizer endpoint：`/api/paas/v4/tokenizer`。配置 `ZAI_API_KEY` 或 `ZHIPU_API_KEY` 后，GLM 模型会优先走官方计数；无 Key 时显示本地近似 warning。

### Xiaomi MiMo

MiMo 官方平台提供 hosted 模型和 token/credit 计费说明；开源 MiMo checkpoints 可以从 Hugging Face 和 ModelScope 获取。v1 已加入 MiMo-V2.5、MiMo-V2.5-Pro 和 MiMo-7B-RL，当前使用本地近似，后续应加载对应 checkpoint 的 tokenizer 文件。

## Hugging Face 与 ModelScope 可用资源

这两个平台对本项目最有价值的是 tokenizer 资源，而不是网页展示本身：

- Hugging Face Hub：可用 `hf_hub_download` 或 Transformers `AutoTokenizer.from_pretrained()` 获取 tokenizer 文件。
- ModelScope Hub：可用 `snapshot_download` 或 `AutoTokenizer.from_pretrained()` 获取国内镜像/社区模型资源。
- 重点文件：`tokenizer.json`、`tokenizer.model`、`tokenizer_config.json`、`special_tokens_map.json`、`vocab.json`、`merges.txt`、`qwen.tiktoken`。
- 合规注意：平台本身不是许可证来源，必须读取每个模型的 model card/license 字段。

## 数据配置

新增模型时优先改这三个文件：

- `src/data/models.json`：模型能力、context window、tokenizer、vision 规则、licenseRef。
- `src/data/model-pricing.json`：input/output 每百万 token 价格。
- `src/data/licenses.json`：tokenizer 或模型许可证说明。

价格变化频繁，本项目价格只用于估算，请以模型厂商官方价格页为准。

## 测试

```bash
npm run test
npm run build
```

当前测试覆盖：

- OpenAI 512×512 high detail tile 计算
- OpenAI 2048×2048 缩放后 tile 计算
- Gemini 小图 258 tokens
- Gemini 大图 768 tile 估算
- input/output 成本计算

## 部署

### 单 Node 服务

```bash
npm install
npm run build
npm start
```

构建后 `server/index.ts` 会在 `dist/` 存在时托管前端静态文件，同时提供 `/api/*`。

### Vercel / Netlify / Cloudflare

也可以把前端静态部署，API 单独部署为 Node/Worker 服务。注意官方 API Key 必须只放在服务端环境变量中，不要暴露到前端。

## 隐私与合规

- 本地模式下，文本与图片只在浏览器内处理。
- 开启 Claude/Gemini 官方计数时，请求内容会发送给对应厂商 API。
- 历史记录默认只保存在浏览器 LocalStorage 最近 20 次。
- 不缓存用户上传图片和文本到服务端。
- 不把 Claude/Gemini 的第三方 tokenizer 标成官方。
- 不把 Llama tokenizer 或模型许可证标成 MIT/Apache。
- 商业使用前请核对模型厂商文档、价格页和许可证。

## 已知限制

- Mistral/Llama v1 使用 fallback tokenizer，结果标为本地近似。
- DeepSeek/Qwen/MiMo v1 尚未内置模型专属 tokenizer 文件，结果标为本地近似。
- GLM 官方 tokenizer 需要服务端 `ZAI_API_KEY` 或 `ZHIPU_API_KEY`。
- OpenAI 图片 token 为规则估算，实际费用以 API usage 为准。
- 多轮消息、tools/function calling、PDF token 计数尚未做完整 UI。
- 生产包里 tokenizer worker 较大，后续可按模型懒加载优化。

## 许可证

项目内第三方 tokenizer、官方 API 和模型许可证说明见 [LICENSES.md](./LICENSES.md)。
