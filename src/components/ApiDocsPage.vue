<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, ArrowRight, Braces, Gauge, KeyRound, Server, ShieldCheck, Terminal } from 'lucide-vue-next'
import { useLocaleStore } from '../stores/locale'

const localeStore = useLocaleStore()

type Localized = {
  en: string
  zh: string
}

const endpointRows: Array<{
  method: string
  path: string
  auth: string
  description: Localized
}> = [
  {
    method: 'GET',
    path: '/api/v1/models',
    auth: 'Bearer',
    description: {
      en: 'Lists model metadata, pricing, capabilities, tokenizer methods, and vision counting support.',
      zh: '返回模型元数据、价格、能力、分词方式和视觉计数支持信息。',
    },
  },
  {
    method: 'POST',
    path: '/api/v1/estimates',
    auth: 'Bearer',
    description: {
      en: 'Returns token counts plus cost estimates for one or more models. Supports Idempotency-Key for retry-safe clients.',
      zh: '为一个或多个模型返回 Token 计数和费用估算，并支持 Idempotency-Key 保障重试安全。',
    },
  },
  {
    method: 'POST',
    path: '/api/v1/tokens/count',
    auth: 'Bearer',
    description: {
      en: 'Returns token usage and context-fit data without price calculation.',
      zh: '只返回 Token 用量和上下文占用，不计算价格。',
    },
  },
]

const errorRows: Array<[string, string, Localized]> = [
  ['invalid_request', '400', { en: 'Malformed JSON, missing fields, or unsupported parameters.', zh: 'JSON 格式错误、缺少字段或参数组合不受支持。' }],
  ['unauthorized', '401', { en: 'API key is missing or invalid.', zh: 'API Key 缺失或无效。' }],
  ['forbidden', '403', { en: 'The key is valid but not permitted for the resource.', zh: 'Key 有效，但没有目标资源权限。' }],
  ['payload_too_large', '413', { en: 'Text, image, PDF, or tool payload exceeds limits.', zh: '文本、图片、PDF 或工具负载超过限制。' }],
  ['rate_limited', '429', { en: 'Client exceeded the request window.', zh: '客户端超过当前请求窗口限制。' }],
  ['model_not_supported', '400', { en: 'Requested model is unknown or unsupported.', zh: '请求的模型未知或不受支持。' }],
  ['pricing_unavailable', '422', { en: 'Counting succeeded but trusted pricing is unavailable.', zh: '计数成功，但缺少可信价格数据。' }],
  ['official_count_failed', '502', { en: 'Provider official count failed and fallback was unavailable.', zh: '供应商官方计数失败，且无法回退。' }],
  ['internal_error', '500', { en: 'Unexpected server error.', zh: '非预期服务端错误。' }],
]

const optionRows: Array<{
  name: string
  values: string
  description: Localized
}> = [
  {
    name: 'options.pricing_profile',
    values: 'official | ccswitch',
    description: {
      en: 'Selects provider list pricing or the CC Switch proxy/coding-tool preset. Missing profile prices fall back to catalog pricing.',
      zh: '选择官方目录价格或 CC Switch 代理/编码工具预设价格；预设缺失时回退到模型目录价格。',
    },
  },
  {
    name: 'options.expected_output_tokens',
    values: 'integer',
    description: {
      en: 'Estimates output-side billing separately from input tokens.',
      zh: '单独估算输出侧计费，不再把输入和输出 Token 混在同一价格里。',
    },
  },
  {
    name: 'options.cached_input_tokens',
    values: 'integer',
    description: {
      en: 'Counts the portion billed at the cache-hit rate. Alias: cache_hit_tokens.',
      zh: '按缓存命中价格计费的输入 Token 数；也兼容 cache_hit_tokens。',
    },
  },
  {
    name: 'options.cache_write_tokens',
    values: 'integer',
    description: {
      en: 'Counts the portion billed at cache-write/create rate when the provider or proxy exposes one.',
      zh: '按缓存写入/创建价格计费的 Token 数，适用于供应商或代理支持该价格时。',
    },
  },
  {
    name: 'options.use_official_api',
    values: 'boolean',
    description: {
      en: 'Requests official provider counting where configured. Alias: prefer_official_count.',
      zh: '在已配置时优先调用供应商官方计数；也兼容 prefer_official_count。',
    },
  },
  {
    name: 'options.cost_multiplier',
    values: 'number',
    description: {
      en: 'Applies explicit markup, discount, or credit conversion after the selected pricing profile.',
      zh: '在选定计费规则之后叠加倍率，可用于代理加价、折扣或 credits 换算。',
    },
  },
]

const productionNotes = computed(() => [
  {
    title: localeStore.locale === 'zh' ? '密钥与权限' : 'Keys and access',
    body:
      localeStore.locale === 'zh'
        ? '生产环境应启用真实 API Key 表、轮换、吊销、scope 和按 key 归因；浏览器端不要嵌入长期密钥。'
        : 'Use real API key storage with rotation, revocation, scopes, and per-key attribution. Do not embed long-lived keys in browsers.',
  },
  {
    title: localeStore.locale === 'zh' ? '限流与配额' : 'Rate limits and quotas',
    body:
      localeStore.locale === 'zh'
        ? '当前实现会返回 rate-limit headers；公开服务前应替换为按 key/IP 强制执行的窗口、并发和用量配额。'
        : 'The current implementation returns rate-limit headers. Before public launch, enforce per-key/IP windows, concurrency limits, and quotas.',
  },
  {
    title: localeStore.locale === 'zh' ? '隐私与日志' : 'Privacy and logs',
    body:
      localeStore.locale === 'zh'
        ? '默认不要记录 prompt、消息、图片、PDF 或工具原文；日志只保留 request_id、模型、用量、状态码、延迟和安全错误码。'
        : 'Avoid logging prompts, messages, images, PDFs, or tool payloads by default. Keep request IDs, models, usage, status, latency, and safe error codes.',
  },
  {
    title: localeStore.locale === 'zh' ? '正确性与运维' : 'Correctness and ops',
    body:
      localeStore.locale === 'zh'
        ? '版本化模型别名和价格数据，发布 OpenAPI schema，并在 TLS、反向代理、超时、指标和告警就绪后再提高限制。'
        : 'Version aliases and pricing, publish an OpenAPI schema, and raise limits only after TLS, proxy timeouts, metrics, and alerting are in place.',
  },
])

const copy = computed(() => {
  if (localeStore.locale === 'zh') {
    return {
      eyebrow: 'Developer API',
      title: 'API 文档',
      subtitle: '面向外部集成的 Token Counter v1 接口，基于当前 /api/v1 服务端实现和生产化检查清单整理。',
      baseUrl: 'Base path',
      contentType: 'Content-Type',
      status: '当前状态',
      statusText: 'v1 可同步返回结果；生产环境仍需启用强制限流、密钥表、配额和 OpenAPI schema。',
      getKey: '申请 API Key',
      getKeyText: 'Hosted API Key 目前通过 Early Access 人工发放，适合内部工具、成本审计和 API 集成试用。',
      endpoints: '端点',
      method: '方法',
      path: '路径',
      auth: '认证',
      description: '说明',
      authTitle: '认证',
      authText: '所有外部 API 请求使用 Authorization: Bearer <api_key>。当前服务仅在配置 TOKEN_COUNTER_API_KEY 时强制校验；公开环境应始终开启。',
      headersTitle: '响应头',
      headersText: '所有 /api/v1 响应会包含窗口型 rate limit headers。当前实现为静态预览值，生产环境应改为真实剩余额度。',
      examples: '调用示例',
      schema: 'Request / Response Schema',
      inputPayload: 'InputPayload 至少包含 text、messages 或 images 之一。POST /api/v1/estimates 会额外返回 cost 和 summary；POST /api/v1/tokens/count 只返回 count 字段。',
      errors: '错误码',
      production: '生产建议',
      note: '官方计数可能把内容发送到供应商 API。敏感场景建议设置 options.redact=true，并在服务端开启更严格日志策略。',
    }
  }

  return {
    eyebrow: 'Developer API',
    title: 'API Docs',
    subtitle: 'External Token Counter v1 endpoints, aligned with the current /api/v1 server implementation and production hardening checklist.',
    baseUrl: 'Base path',
    contentType: 'Content-Type',
    status: 'Current status',
    statusText: 'v1 returns synchronous results. Public production use still needs enforced limits, key storage, quotas, and an OpenAPI schema.',
    getKey: 'Request API Key',
    getKeyText: 'Hosted API keys are issued manually through Early Access for internal tools, cost audits, and API integration pilots.',
    endpoints: 'Endpoints',
    method: 'Method',
    path: 'Path',
    auth: 'Auth',
    description: 'Description',
    authTitle: 'Authentication',
    authText: 'External API requests use Authorization: Bearer <api_key>. The current server enforces this only when TOKEN_COUNTER_API_KEY is configured; public environments should always require it.',
    headersTitle: 'Response headers',
    headersText: 'Every /api/v1 response includes window-style rate limit headers. The current implementation returns preview static values; production should return real remaining quota.',
    examples: 'Live request examples',
    schema: 'Request / Response Schema',
    inputPayload: 'InputPayload must include at least one of text, messages, or images. POST /api/v1/estimates adds cost and summary; POST /api/v1/tokens/count returns count data only.',
    errors: 'Error codes',
    production: 'Production advice',
    note: 'Official counting may send content to provider APIs. For sensitive workloads, set options.redact=true and enforce stricter server-side logging policy.',
  }
})

const modelsCurl = `curl -sS "$BASE_URL/api/v1/models?capability=image" \\
  -H "Authorization: Bearer $TOKEN_COUNTER_API_KEY"`

const estimateCurl = `curl -sS "$BASE_URL/api/v1/estimates" \\
  -H "Authorization: Bearer $TOKEN_COUNTER_API_KEY" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: estimate-001" \\
  -d '{"models":["gpt-4o"],"input":{"text":"Count this."},"options":{"expected_output_tokens":700,"cached_input_tokens":0,"cache_write_tokens":0,"pricing_profile":"ccswitch","use_official_api":false,"redact":true}}'`

const countCurl = `curl -sS "$BASE_URL/api/v1/tokens/count" \\
  -H "Authorization: Bearer $TOKEN_COUNTER_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"models":["gpt-4o"],"input":{"text":"Count only."}}'`

const requestSchema = `{
  "models": ["gpt-4o"],
  "input": {
    "text": "Prompt text",
    "messages": [{"role": "user", "content": "Hello"}],
    "images": [{"mime_type": "image/png", "width": 1280, "height": 720}]
  },
  "options": {
    "expected_output_tokens": 700,
    "cached_input_tokens": 0,
    "cache_write_tokens": 0,
    "cost_multiplier": 1,
    "pricing_profile": "official | ccswitch",
    "use_official_api": false,
    "allow_fallback": true,
    "redact": true
  }
}`

const responseSchema = `{
  "object": "estimate | token_count",
  "request_id": "req_...",
  "results": [{
    "model": "gpt-4o",
    "provider": "openai",
    "count": {
      "input_tokens": 178,
      "expected_output_tokens": 700,
      "total_tokens": 878,
      "accuracy": {"overall": "local_exact"}
    },
    "cost": {
      "currency": "USD",
      "input": 0.000445,
      "cached_input": 0,
      "cache_write": 0,
      "output": 0.007,
      "total": 0.007445,
      "pricing": {
        "input_per_1m": 2.5,
        "output_per_1m": 10,
        "cached_input_per_1m": null,
        "cache_write_per_1m": null,
        "source": "official",
        "last_updated": "2026-05-17"
      },
      "multiplier": 1
    }
  }]
}`
</script>

<template>
  <section class="api-docs-layout">
    <div class="api-docs-hero">
      <div>
        <p class="eyebrow">{{ copy.eyebrow }}</p>
        <h1>{{ copy.title }}</h1>
        <p>{{ copy.subtitle }}</p>
        <div class="api-docs-actions">
          <a class="primary-action" href="/early-access">
            {{ copy.getKey }}
            <ArrowRight :size="16" aria-hidden="true" />
          </a>
        </div>
      </div>
      <div class="api-docs-meta" aria-label="API metadata">
        <span>{{ copy.baseUrl }} <strong>/api/v1</strong></span>
        <span>{{ copy.contentType }} <strong>application/json</strong></span>
      </div>
    </div>

    <div class="api-docs-grid">
      <article class="api-docs-panel api-docs-status">
        <Server :size="20" />
        <div>
          <h2>{{ copy.status }}</h2>
          <p>{{ copy.statusText }}</p>
        </div>
      </article>

      <article class="api-docs-panel">
        <KeyRound :size="20" />
        <div>
          <h2>{{ copy.authTitle }}</h2>
          <p>{{ copy.authText }}</p>
          <p>{{ copy.getKeyText }}</p>
          <code>Authorization: Bearer tc_live_...</code>
        </div>
      </article>

      <article class="api-docs-panel">
        <Gauge :size="20" />
        <div>
          <h2>{{ copy.headersTitle }}</h2>
          <p>{{ copy.headersText }}</p>
          <ul class="api-docs-chips">
            <li>X-RateLimit-Limit</li>
            <li>X-RateLimit-Remaining</li>
            <li>X-RateLimit-Reset</li>
          </ul>
        </div>
      </article>
    </div>

    <section class="api-docs-section api-docs-options">
      <div class="api-docs-section-head">
        <Gauge :size="20" />
        <h2>{{ localeStore.locale === 'zh' ? '计费与计数选项' : 'Billing and counting options' }}</h2>
      </div>
      <p class="api-docs-copy">
        {{
          localeStore.locale === 'zh'
            ? '这些字段决定 API 如何区分输入、输出、缓存和官方计数，适合直接暴露给外部调用者。'
            : 'These fields control input, output, cache, pricing profile, and official-count behavior for external clients.'
        }}
      </p>
      <div class="api-docs-table-wrap compact">
        <table class="api-docs-table">
          <thead>
            <tr>
              <th>{{ localeStore.locale === 'zh' ? '字段' : 'Field' }}</th>
              <th>{{ localeStore.locale === 'zh' ? '值' : 'Values' }}</th>
              <th>{{ copy.description }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="option in optionRows" :key="option.name">
              <td><code>{{ option.name }}</code></td>
              <td><span class="api-option-value">{{ option.values }}</span></td>
              <td>{{ option.description[localeStore.locale] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="api-docs-section">
      <div class="api-docs-section-head">
        <Braces :size="20" />
        <h2>{{ copy.endpoints }}</h2>
      </div>
      <div class="api-docs-table-wrap">
        <table class="api-docs-table">
          <thead>
            <tr>
              <th>{{ copy.method }}</th>
              <th>{{ copy.path }}</th>
              <th>{{ copy.auth }}</th>
              <th>{{ copy.description }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="endpoint in endpointRows" :key="endpoint.path">
              <td><span class="api-method">{{ endpoint.method }}</span></td>
              <td><code>{{ endpoint.path }}</code></td>
              <td>{{ endpoint.auth }}</td>
              <td>{{ endpoint.description[localeStore.locale] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="api-docs-section">
      <div class="api-docs-section-head">
        <Terminal :size="20" />
        <h2>{{ copy.examples }}</h2>
      </div>
      <div class="api-code-grid">
        <figure>
          <figcaption>GET /models</figcaption>
          <pre><code>{{ modelsCurl }}</code></pre>
        </figure>
        <figure>
          <figcaption>POST /estimates</figcaption>
          <pre><code>{{ estimateCurl }}</code></pre>
        </figure>
        <figure>
          <figcaption>POST /tokens/count</figcaption>
          <pre><code>{{ countCurl }}</code></pre>
        </figure>
      </div>
    </section>

    <section class="api-docs-section">
      <div class="api-docs-section-head">
        <Braces :size="20" />
        <h2>{{ copy.schema }}</h2>
      </div>
      <p class="api-docs-copy">{{ copy.inputPayload }}</p>
      <div class="api-code-grid two">
        <figure>
          <figcaption>Request</figcaption>
          <pre><code>{{ requestSchema }}</code></pre>
        </figure>
        <figure>
          <figcaption>Response</figcaption>
          <pre><code>{{ responseSchema }}</code></pre>
        </figure>
      </div>
    </section>

    <section class="api-docs-section">
      <div class="api-docs-section-head">
        <AlertTriangle :size="20" />
        <h2>{{ copy.errors }}</h2>
      </div>
      <div class="api-docs-table-wrap compact">
        <table class="api-docs-table">
          <tbody>
            <tr v-for="[code, status, message] in errorRows" :key="code">
              <td><code>{{ code }}</code></td>
              <td>{{ status }}</td>
              <td>{{ message[localeStore.locale] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="api-docs-section">
      <div class="api-docs-section-head">
        <ShieldCheck :size="20" />
        <h2>{{ copy.production }}</h2>
      </div>
      <div class="api-advice-grid">
        <article v-for="note in productionNotes" :key="note.title">
          <h3>{{ note.title }}</h3>
          <p>{{ note.body }}</p>
        </article>
      </div>
      <p class="api-docs-note">{{ copy.note }}</p>
    </section>
  </section>
</template>

<style scoped>
.api-docs-layout {
  max-width: 1120px;
  margin: 0 auto;
  padding: 42px 28px 72px;
}

.api-docs-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: end;
  padding-bottom: 28px;
}

.api-docs-hero h1 {
  max-width: 760px;
  margin: 0;
  color: var(--text);
  font-size: clamp(30px, 4vw, 52px);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: 0;
}

.api-docs-hero p:not(.eyebrow) {
  max-width: 760px;
  margin: 14px 0 0;
  color: var(--muted);
  font-size: 17px;
  line-height: 1.55;
}

.api-docs-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 18px;
}

.api-docs-actions .primary-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.api-docs-meta {
  display: grid;
  gap: 8px;
  min-width: 260px;
}

.api-docs-meta span,
.api-docs-panel,
.api-docs-section,
.api-advice-grid article {
  border: 1px solid var(--line);
  background: var(--bg-panel);
  box-shadow: var(--shadow-sm);
}

.api-docs-meta span {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--muted);
  font-size: 12px;
}

.api-docs-meta strong {
  color: var(--text-secondary);
  font-weight: 650;
}

.api-docs-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.api-docs-panel {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 12px;
  padding: 18px;
  border-radius: var(--radius);
}

.api-docs-panel svg,
.api-docs-section-head svg {
  color: var(--accent);
}

.api-docs-panel h2,
.api-docs-section h2,
.api-advice-grid h3 {
  margin: 0;
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.25;
}

.api-docs-panel p,
.api-docs-copy,
.api-docs-note,
.api-advice-grid p {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.65;
}

.api-docs-panel code,
.api-docs-table code {
  color: var(--accent);
  font-family: "SF Mono", ui-monospace, Menlo, Consolas, monospace;
  font-size: 12px;
}

.api-docs-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.api-docs-chips li,
.api-method {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  color: var(--accent);
  background: rgba(37, 99, 235, 0.08);
  font-size: 11px;
  font-weight: 650;
}

.api-docs-section {
  margin-top: 16px;
  padding: 18px;
  border-radius: var(--radius);
}

.api-docs-section-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.api-docs-table-wrap {
  overflow-x: auto;
}

.api-docs-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
}

.api-docs-table th,
.api-docs-table td {
  padding: 12px 10px;
  border-bottom: 1px solid var(--line);
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.45;
  text-align: left;
  vertical-align: top;
}

.api-docs-table th {
  color: var(--muted);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.api-docs-table tr:last-child td {
  border-bottom: 0;
}

.api-docs-table td:nth-child(2) {
  white-space: nowrap;
}

.api-docs-table-wrap.compact .api-docs-table {
  min-width: 620px;
}

.api-option-value {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.05);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
}

.api-code-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.api-code-grid.two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 12px;
}

.api-code-grid figure {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--code-bg, rgba(15, 23, 42, 0.04));
}

.api-code-grid figcaption {
  padding: 10px 12px;
  border-bottom: 1px solid var(--line);
  color: var(--muted);
  font-size: 12px;
  font-weight: 650;
}

.api-code-grid pre {
  margin: 0;
  padding: 14px;
  overflow-x: auto;
  color: var(--text-secondary);
  font-family: "SF Mono", ui-monospace, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.6;
}

.api-advice-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.api-advice-grid article {
  padding: 14px;
  border-radius: var(--radius-sm);
}

.api-docs-note {
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: rgba(245, 158, 11, 0.08);
}

@media (max-width: 980px) {
  .api-docs-hero,
  .api-docs-grid,
  .api-code-grid,
  .api-code-grid.two,
  .api-advice-grid {
    grid-template-columns: 1fr;
  }

  .api-docs-meta {
    min-width: 0;
  }
}

@media (max-width: 640px) {
  .api-docs-layout {
    padding: 28px 16px 52px;
  }

  .api-docs-actions,
  .api-docs-actions .primary-action {
    width: 100%;
  }

  .api-docs-actions .primary-action {
    justify-content: center;
  }
}
</style>
