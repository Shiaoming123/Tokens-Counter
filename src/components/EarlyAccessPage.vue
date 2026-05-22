<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElDialog, ElMessage } from 'element-plus'
import { ArrowRight, BarChart3, Check, Copy, ExternalLink, FileText, KeyRound, Mail, ShieldCheck } from 'lucide-vue-next'
import { useLocaleStore } from '../stores/locale'

const contactEmail = 'henshiaoming@gmail.com'
const emailDialogOpen = ref(false)
const localeStore = useLocaleStore()

const content = computed(() => {
  if (localeStore.locale === 'zh') {
    return {
      eyebrow: 'Early Access',
      heroTitle: '在上线前，先算清 AI 成本和 Token 风险。',
      heroBody:
        'AI Token Counter 帮助开发者在真实 LLM 输入中对比 Token 用量、预估 API 成本、模型能力和计数可信度，覆盖提示词、对话、图片、PDF 和工具 schema。',
      request: '邮件申请',
      apiDocs: 'API 文档',
      trust: '可信边界',
      contactPrefix: '请把使用场景、预计调用量、需要的模型/供应商、是否包含敏感输入发到',
      proofLabel: '产品可信点',
      proofPoints: [
        '覆盖主流 LLM 供应商的 177 个模型目录项',
        '支持文本、图片、PDF、对话消息和工具 schema 估算',
        '区分官方、本地、估算和不支持路径的可信标签',
        '支持官方目录价和 CC Switch 风格定价配置',
      ],
      audiencesEyebrow: '适合谁',
      audiencesTitle: '为真正会为 Token 付钱的人准备。',
      audiences: [
        {
          title: 'AI 应用开发者',
          body: '在 prompt 进入生产前，对比 GPT、Claude、Gemini、DeepSeek、Qwen、GLM、Kimi 等模型选择。',
        },
        {
          title: 'Agent 和工具调用团队',
          body: '审查 system prompt、多轮消息、工具 schema、预期输出和上下文压力，避免隐藏开销在账单里爆出来。',
        },
        {
          title: 'API 代理和平台运营者',
          body: '用定价配置、缓存字段和倍率，对比供应商目录价、代理规则和内部成本分摊。',
        },
        {
          title: 'RAG 和内容团队',
          body: '估算长文本、PDF 提取和多模态输入，让分块、模型选择和预算假设能一起被 review。',
        },
      ],
      problemEyebrow: '问题',
      problemTitle: 'Token 成本通常不是一个简单数字。',
      problemBody1:
        '普通 Token 计数器往往忽略对话模板、工具 schema、多模态规则、预期输出、缓存价格、供应商优化和代理定价。AI Token Counter 把估算值和可信等级放在一起，让团队知道每个数字应该信到什么程度。',
      problemBody2: '产品会保持诚实：估算用于预算、模型选择和审查，不替代供应商最终账单。',
      capabilitiesEyebrow: '能力',
      capabilitiesTitle: '从一次性检查，到 API 驱动的成本审查流程。',
      features: [
        {
          icon: BarChart3,
          title: '多模型成本对比',
          body: '同一份输入可以横向比较多个供应商，展示输入 Token、预期输出、上下文占用和总成本。',
        },
        {
          icon: ShieldCheck,
          title: '每个结果都有可信标签',
          body: '结果会区分官方精确、官方估算、本地精确、本地估算和不支持，而不是把所有数字都当成同等可信。',
        },
        {
          icon: KeyRound,
          title: '给内部工具用的预览 API',
          body: '开放 /api/v1/models、/api/v1/estimates 和 /api/v1/tokens/count，支持 bearer key、幂等键、限流头、用量摘要和标准错误。',
        },
        {
          icon: FileText,
          title: '方便审计和讨论的导出',
          body: '本地历史、Markdown 复制、CSV 导出、定价来源和许可证说明，让估算结果更容易在 review 中讨论。',
        },
      ],
      modelEyebrow: 'Early Access 模式',
      modelTitle: '先手动发 key，和真实用户一起打磨，再补完整计费。',
      plans: [
        {
          name: '免费工作台',
          price: '免费',
          body: '适合个人 prompt 检查、模型对比和快速成本 review。',
          items: ['网页工作台', '可用时使用本地估算', '可信标签', 'Markdown 和 CSV 导出'],
        },
        {
          name: 'API Early Access',
          price: '人工审核',
          body: '适合想把 Token 和成本估算接入内部工具的开发者。',
          items: ['人工发放 API key', '保守请求限制', 'OpenAPI 契约', '邮件反馈通道'],
        },
        {
          name: '定制 / 私有化',
          price: '邮件沟通',
          body: '适合需要自定义价格表、私有模型目录或部署支持的团队。',
          items: ['自定义价格表', '私有模型目录', '成本审查支持', '部署指导'],
        },
      ],
      trustEyebrow: '可信边界',
      trustTitle: '我们不会把估算伪装成账单真相。',
      trustBody:
        '每个结果都应该结合计数方法、准确性标签、定价来源和定价日期阅读。当未配置供应商 API 时，本地估算会明确标记为本地；当请求 official-only 但官方计数不可用时，API 会返回明确错误，而不是悄悄假装成功。',
      readApi: '查看 API 行为',
      faqEyebrow: 'FAQ',
      faqTitle: '发放 key 前需要讲清楚的问题。',
      faqs: [
        {
          q: '估算可以替代供应商账单吗？',
          a: '不可以。结果用于规划、对比和审查，最终计费仍以供应商账单、用量后台或合同为准。',
        },
        {
          q: '我的 prompt 会发给供应商吗？',
          a: '能本地估算的路径会尽量留在本地。官方计数模式可能会把请求内容发送到对应供应商 API，所以敏感流程应关闭官方模式，或使用私有部署。',
        },
        {
          q: '为什么不是直接注册？',
          a: 'API 已经足够试用，但在真实用量模式跑清楚前，key 管理、长期额度和计费都应先保持人工可控。',
        },
      ],
      finalEyebrow: '准备试用？',
      finalTitle: '点按钮生成邮件模板，说明你的工作流。Key 会人工发放。',
      finalRequest: '申请 Early Access',
      dialogTitle: '邮件申请 Early Access',
      dialogIntro: '已为你准备好邮件内容。优先复制内容发到下面邮箱，避免浏览器没有邮件客户端时打开空白页。',
      copyEmail: '复制邮箱',
      copySubject: '复制标题',
      copyBody: '复制正文',
      openMailClient: '尝试打开邮箱客户端',
      subjectCopied: '邮件标题已复制',
      emailCopied: '邮箱已复制',
      bodyCopied: '邮件正文已复制',
      subject: '[AI Token Counter] Early Access 申请',
      emailBody: [
        '你好，我想申请 AI Token Counter Early Access。',
        '',
        '使用场景：',
        '需要网页还是 API：',
        '预计每月请求量：',
        '需要的模型或供应商：',
        '是否包含敏感输入：',
        '其他说明：',
      ].join('\n'),
    }
  }

  return {
    eyebrow: 'Early Access',
    heroTitle: 'AI cost estimation and token audit, before production.',
    heroBody:
      'AI Token Counter helps builders compare token usage, estimated API cost, model capability, and counting confidence across real LLM inputs: prompts, chat messages, images, PDFs, and tool schemas.',
    request: 'Request by email',
    apiDocs: 'API Docs',
    trust: 'Trust Center',
    contactPrefix: 'Send use case, expected volume, required providers, and sensitivity notes to',
    proofLabel: 'Product proof points',
    proofPoints: [
      '177 model catalog entries across mainstream LLM providers',
      'Text, image, PDF, chat message, and tool schema estimates',
      'Accuracy labels for official, local, estimated, and unsupported paths',
      'Official/catalog and CC Switch-style pricing profiles',
    ],
    audiencesEyebrow: 'Who it is for',
    audiencesTitle: 'Built for people who actually pay for tokens.',
    audiences: [
      {
        title: 'AI application builders',
        body: 'Compare GPT, Claude, Gemini, DeepSeek, Qwen, GLM, Kimi, and other model choices before a prompt reaches production.',
      },
      {
        title: 'Agent and tool-calling teams',
        body: 'Audit system prompts, multi-turn messages, tool schemas, expected output, and context pressure before the hidden overhead becomes a bill.',
      },
      {
        title: 'API proxy and platform operators',
        body: 'Use pricing profiles, cache fields, and multipliers to compare provider list prices, proxy rules, and internal cost allocation.',
      },
      {
        title: 'RAG and content teams',
        body: 'Estimate long text, PDF extraction, and multimodal inputs so chunking, model choice, and budget assumptions can be reviewed together.',
      },
    ],
    problemEyebrow: 'The problem',
    problemTitle: 'Token cost is rarely just one number.',
    problemBody1:
      'Simple token counters usually ignore chat templates, tool schemas, multimodal rules, expected output, cache pricing, provider-side optimizations, and proxy pricing. AI Token Counter shows the estimate and the confidence level together, so teams can decide how much to trust each number.',
    problemBody2:
      'The product is intentionally honest: estimates help with budgeting and model selection, but they do not replace provider invoices.',
    capabilitiesEyebrow: 'Capabilities',
    capabilitiesTitle: 'From one-off checks to API-powered audit workflows.',
    features: [
      {
        icon: BarChart3,
        title: 'Multi-model cost comparison',
        body: 'One input can be compared across providers with input tokens, expected output, context usage, and total cost shown side by side.',
      },
      {
        icon: ShieldCheck,
        title: 'Trust labels on every result',
        body: 'Results distinguish official exact, official estimate, local exact, local estimate, and unsupported instead of flattening every number into the same confidence level.',
      },
      {
        icon: KeyRound,
        title: 'Preview API for internal tools',
        body: 'Use /api/v1/models, /api/v1/estimates, and /api/v1/tokens/count with bearer keys, idempotency, rate-limit headers, usage summaries, and standard errors.',
      },
      {
        icon: FileText,
        title: 'Audit-friendly exports',
        body: 'Local history, Markdown copy, CSV export, pricing source notes, and license notices make the estimate easier to discuss in reviews.',
      },
    ],
    modelEyebrow: 'Early Access model',
    modelTitle: 'Start manually, learn from real users, then harden billing.',
    plans: [
      {
        name: 'Free Workbench',
        price: 'Free',
        body: 'For personal prompt checks, model comparison, and quick cost review.',
        items: ['Web workbench', 'Local estimates where available', 'Accuracy labels', 'Markdown and CSV export'],
      },
      {
        name: 'API Early Access',
        price: 'Manual approval',
        body: 'For developers who want token and cost estimates inside internal tools.',
        items: ['Manual API key', 'Conservative request limits', 'OpenAPI contract', 'Email feedback channel'],
      },
      {
        name: 'Custom / Private',
        price: 'Discuss by email',
        body: 'For teams that need custom pricing profiles, private catalogs, or deployment support.',
        items: ['Custom price tables', 'Private model catalog', 'Cost-audit support', 'Deployment guidance'],
      },
    ],
    trustEyebrow: 'Trust boundary',
    trustTitle: 'We do not disguise estimates as invoice truth.',
    trustBody:
      'Every result should be read with its count method, accuracy label, pricing source, and pricing date. When a provider API is not configured, local estimates are clearly marked as local. When official-only behavior is requested and unavailable, the API returns an explicit error instead of silently pretending.',
    readApi: 'Read API behavior',
    faqEyebrow: 'FAQ',
    faqTitle: 'Questions to answer before issuing keys.',
    faqs: [
      {
        q: 'Can the estimate replace my provider bill?',
        a: 'No. Results are for planning, comparison, and audit review. Final billed usage remains subject to the provider invoice, usage dashboard, or contract.',
      },
      {
        q: 'Will my prompt be sent to a provider?',
        a: 'Local estimates stay local where possible. Official counting mode may send request content to the selected provider API, so sensitive workflows should keep official mode off or use a private deployment.',
      },
      {
        q: 'Why use Early Access instead of instant signup?',
        a: 'The API is useful enough to test, but key management, persistent quota, and billing should stay controlled until real usage patterns are understood.',
      },
    ],
    finalEyebrow: 'Ready to test it?',
    finalTitle: 'Send one email with your workflow. Keys are issued manually.',
    finalRequest: 'Request Early Access',
    dialogTitle: 'Request Early Access by email',
    dialogIntro:
      'The email is prepared below. Copy it into your mail app first; the mail-client button is secondary because some browsers open a blank page when no mail handler is configured.',
    copyEmail: 'Copy email',
    copySubject: 'Copy subject',
    copyBody: 'Copy body',
    openMailClient: 'Try mail client',
    subjectCopied: 'Subject copied',
    emailCopied: 'Email copied',
    bodyCopied: 'Email body copied',
    subject: '[AI Token Counter] Early Access request',
    emailBody: [
      'Hi, I would like to try AI Token Counter Early Access.',
      '',
      'Use case:',
      'Need UI or API:',
      'Expected monthly requests:',
      'Required models or providers:',
      'Sensitive inputs:',
      'Other notes:',
    ].join('\n'),
  }
})

const mailto = computed(
  () =>
    `mailto:${contactEmail}?subject=${encodeURIComponent(content.value.subject)}&body=${encodeURIComponent(
      content.value.emailBody,
    )}`,
)

async function copyText(text: string, successMessage: string) {
  await navigator.clipboard.writeText(text)
  ElMessage.success(successMessage)
}

function openEmailDialog() {
  emailDialogOpen.value = true
}

function openMailClient() {
  window.location.href = mailto.value
}
</script>

<template>
  <section class="early-page">
    <div class="early-hero">
      <div class="early-hero-copy">
        <p class="eyebrow">{{ content.eyebrow }}</p>
        <h1>{{ content.heroTitle }}</h1>
        <p>{{ content.heroBody }}</p>
        <div class="early-actions">
          <button class="primary-action early-mail-link" type="button" @click="openEmailDialog">
            <Mail :size="18" aria-hidden="true" />
            {{ content.request }}
          </button>
          <button class="ghost-button early-doc-button" type="button" @click="$emit('navigate', '/api-docs')">
            {{ content.apiDocs }}
            <ArrowRight :size="16" aria-hidden="true" />
          </button>
          <button class="ghost-button early-doc-button" type="button" @click="$emit('navigate', '/trust')">
            {{ content.trust }}
            <ShieldCheck :size="16" aria-hidden="true" />
          </button>
        </div>
        <p class="early-contact">
          {{ content.contactPrefix }}
          <button class="early-email-button" type="button" @click="openEmailDialog">{{ contactEmail }}</button>.
        </p>
      </div>
      <div class="early-visual" aria-label="AI Token Counter product preview">
        <img src="/screenshot.png" alt="AI Token Counter workbench screenshot" />
      </div>
    </div>

    <div class="early-proof-grid" :aria-label="content.proofLabel">
      <div v-for="point in content.proofPoints" :key="point" class="early-proof-item">
        <Check :size="17" aria-hidden="true" />
        <span>{{ point }}</span>
      </div>
    </div>

    <section class="early-section">
      <div class="early-section-head">
        <p class="eyebrow">{{ content.audiencesEyebrow }}</p>
        <h2>{{ content.audiencesTitle }}</h2>
      </div>
      <div class="early-card-grid audience-grid">
        <article v-for="item in content.audiences" :key="item.title" class="early-card">
          <h3>{{ item.title }}</h3>
          <p>{{ item.body }}</p>
        </article>
      </div>
    </section>

    <section class="early-section early-split">
      <div>
        <p class="eyebrow">{{ content.problemEyebrow }}</p>
        <h2>{{ content.problemTitle }}</h2>
      </div>
      <div class="early-rich-text">
        <p>{{ content.problemBody1 }}</p>
        <p>{{ content.problemBody2 }}</p>
      </div>
    </section>

    <section class="early-section">
      <div class="early-section-head">
        <p class="eyebrow">{{ content.capabilitiesEyebrow }}</p>
        <h2>{{ content.capabilitiesTitle }}</h2>
      </div>
      <div class="early-card-grid feature-grid">
        <article v-for="item in content.features" :key="item.title" class="early-card feature-card">
          <component :is="item.icon" :size="22" aria-hidden="true" />
          <h3>{{ item.title }}</h3>
          <p>{{ item.body }}</p>
        </article>
      </div>
    </section>

    <section class="early-section">
      <div class="early-section-head">
        <p class="eyebrow">{{ content.modelEyebrow }}</p>
        <h2>{{ content.modelTitle }}</h2>
      </div>
      <div class="early-card-grid pricing-grid">
        <article v-for="plan in content.plans" :key="plan.name" class="early-card pricing-card">
          <span>{{ plan.name }}</span>
          <strong>{{ plan.price }}</strong>
          <p>{{ plan.body }}</p>
          <ul>
            <li v-for="item in plan.items" :key="item">
              <Check :size="15" aria-hidden="true" />
              {{ item }}
            </li>
          </ul>
        </article>
      </div>
    </section>

    <section class="early-section early-split trust-band">
      <div>
        <p class="eyebrow">{{ content.trustEyebrow }}</p>
        <h2>{{ content.trustTitle }}</h2>
      </div>
      <div class="early-rich-text">
        <p>{{ content.trustBody }}</p>
        <button class="early-inline-link" type="button" @click="$emit('navigate', '/api-docs')">
          {{ content.readApi }}
          <ExternalLink :size="15" aria-hidden="true" />
        </button>
      </div>
    </section>

    <section class="early-section">
      <div class="early-section-head">
        <p class="eyebrow">{{ content.faqEyebrow }}</p>
        <h2>{{ content.faqTitle }}</h2>
      </div>
      <div class="early-faq-list">
        <article v-for="item in content.faqs" :key="item.q" class="early-faq">
          <h3>{{ item.q }}</h3>
          <p>{{ item.a }}</p>
        </article>
      </div>
    </section>

    <section class="early-final-cta">
      <div>
        <p class="eyebrow">{{ content.finalEyebrow }}</p>
        <h2>{{ content.finalTitle }}</h2>
      </div>
      <button class="primary-action early-mail-link" type="button" @click="openEmailDialog">
        <Mail :size="18" aria-hidden="true" />
        {{ content.finalRequest }}
      </button>
    </section>

    <ElDialog
      v-model="emailDialogOpen"
      class="email-request-dialog"
      width="min(640px, calc(100vw - 32px))"
      align-center
    >
      <template #header>
        <div class="email-request-title">
          <Mail :size="19" aria-hidden="true" />
          <span>{{ content.dialogTitle }}</span>
        </div>
      </template>

      <div class="email-request-content">
        <p>{{ content.dialogIntro }}</p>
        <div class="email-request-field">
          <span>Email</span>
          <strong>{{ contactEmail }}</strong>
          <button type="button" @click="copyText(contactEmail, content.emailCopied)">
            <Copy :size="15" aria-hidden="true" />
            {{ content.copyEmail }}
          </button>
        </div>
        <div class="email-request-field">
          <span>Subject</span>
          <strong>{{ content.subject }}</strong>
          <button type="button" @click="copyText(content.subject, content.subjectCopied)">
            <Copy :size="15" aria-hidden="true" />
            {{ content.copySubject }}
          </button>
        </div>
        <textarea class="email-request-body" :value="content.emailBody" readonly />
      </div>

      <template #footer>
        <button class="ghost-button" type="button" @click="copyText(content.emailBody, content.bodyCopied)">
          <Copy :size="15" aria-hidden="true" />
          {{ content.copyBody }}
        </button>
        <button class="primary-action" type="button" @click="openMailClient">
          <Mail :size="17" aria-hidden="true" />
          {{ content.openMailClient }}
        </button>
      </template>
    </ElDialog>
  </section>
</template>
