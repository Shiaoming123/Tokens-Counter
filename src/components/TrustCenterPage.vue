<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, ArrowRight, ClipboardCheck, KeyRound, Mail, ShieldCheck } from 'lucide-vue-next'
import { useLocaleStore } from '../stores/locale'

const contactEmail = 'henshiaoming@gmail.com'
const localeStore = useLocaleStore()

const content = computed(() => {
  if (localeStore.locale === 'zh') {
    return {
      eyebrow: 'Trust Center',
      title: '隐私、准确性和 Early Access 边界',
      subtitle:
        'AI Token Counter 用于上线前的成本预估、模型对比和 token 审计。它会清楚标注估算来源，但不替代供应商账单、合同用量或法律合规审查。',
      cta: '申请 API Key',
      api: '查看 API 文档',
      sections: [
        {
          icon: ShieldCheck,
          title: '隐私与数据流',
          body:
            '浏览器工作台优先使用本地估算。启用官方计数模式时，请求内容可能会发送到对应供应商 API。不要在公开 issue、截图或前端代码中暴露 API key、客户 prompt、图片、PDF 或账号信息。',
          points: [
            '默认不需要保存原始 prompt 才能完成本地估算。',
            '官方计数模式可能涉及第三方供应商数据处理。',
            '敏感业务建议关闭官方模式，或使用私有部署。',
          ],
        },
        {
          icon: ClipboardCheck,
          title: '准确性方法',
          body:
            '每个结果都应该结合 count method、accuracy label、pricing source 和 pricing date 阅读。价格和模型规则会变动，商业决策前仍需核对供应商官方文档。',
          points: [
            'official_exact / official_estimate 表示调用或依据官方路径。',
            'local_exact / local_estimate 表示本地 tokenizer 或规则估算。',
            'unsupported 会明确显示，不会伪装成可用估算。',
          ],
        },
        {
          icon: KeyRound,
          title: 'API key 与 Early Access',
          body:
            'Hosted API key 当前人工发放，适合真实工作流试用。生产级自助注册、持久化配额、付费账单和企业权限还没有开放。',
          points: [
            '每个 key 使用保守请求限制和窗口限流。',
            '不要把长期 key 写进浏览器代码或公开仓库。',
            '如发现泄露、滥用或误用，应立即邮件联系吊销。',
          ],
        },
        {
          icon: AlertTriangle,
          title: '法律、宣传和雇佣风险',
          body:
            '以下内容不是法律意见。公开推广、收费、企业采购、广告投放或在职副业商业化前，需要自行核对所在地法律、平台规则、劳动合同和知识产权约束。',
          points: [
            '不要宣传 100% 准确、官方认证、无隐私风险或企业级合规。',
            '社区发帖要披露作者身份，避免刷帖、诱导投票和重复推广。',
            '如涉及付费、发票、税务、退款或 SLA，应先做人工审核。',
          ],
        },
      ],
      faqTitle: '公开前先讲清楚',
      faqs: [
        ['这能当最终账单吗？', '不能。它是上线前估算和审计工具，最终费用以供应商账单、用量后台或合同为准。'],
        ['会不会保存我的 prompt？', '当前产品定位是不默认保存原始 prompt。若未来加入持久化用量账本，也应只保存必要统计信息，并提前说明。'],
        ['为什么现在不直接收费？', '你当前更适合低维护 Early Access：手动发 key、收集真实反馈，等需求和合规路径更清楚后再考虑轻量付费试点。'],
        ['发现错误或模型缺失怎么办？', '公开问题可以发 GitHub issue；涉及密钥、客户数据或安全隐私，请直接发邮件。'],
      ],
      emailLabel: '安全/隐私联系邮箱',
    }
  }

  return {
    eyebrow: 'Trust Center',
    title: 'Privacy, accuracy, and Early Access boundaries',
    subtitle:
      'AI Token Counter is for pre-flight cost estimation, model comparison, and token audits. It labels estimate provenance, but it does not replace provider invoices, contract usage, or legal compliance review.',
    cta: 'Request API Key',
    api: 'Read API Docs',
    sections: [
      {
        icon: ShieldCheck,
        title: 'Privacy and data flow',
        body:
          'The web workbench prefers local estimates. When official counting is enabled, request content may be sent to the selected provider API. Do not expose API keys, customer prompts, images, PDFs, or account details in public issues, screenshots, or frontend code.',
        points: [
          'Raw prompts do not need to be stored for local estimates.',
          'Official counting mode can involve third-party provider processing.',
          'Sensitive workflows should keep official mode off or use private deployment.',
        ],
      },
      {
        icon: ClipboardCheck,
        title: 'Accuracy method',
        body:
          'Every result should be read with its count method, accuracy label, pricing source, and pricing date. Prices and model behavior change, so commercial decisions should still verify provider documentation.',
        points: [
          'official_exact / official_estimate means an official path is used or followed.',
          'local_exact / local_estimate means local tokenizer or rule-based estimation.',
          'unsupported stays explicit instead of pretending an estimate exists.',
        ],
      },
      {
        icon: KeyRound,
        title: 'API keys and Early Access',
        body:
          'Hosted API keys are currently issued manually for real workflow trials. Self-serve signup, persistent quotas, paid billing, and enterprise permissions are not open yet.',
        points: [
          'Each key starts with conservative request limits and window rate limiting.',
          'Never put long-lived keys in browser code or public repositories.',
          'Email immediately if a key is leaked, abused, or assigned to the wrong use case.',
        ],
      },
      {
        icon: AlertTriangle,
        title: 'Legal, promotion, and employment risk',
        body:
          'This is not legal advice. Before public promotion, paid plans, enterprise procurement, ads, or commercial side-project use, review local law, platform rules, employment agreements, and IP constraints.',
        points: [
          'Do not claim 100% accuracy, official certification, zero privacy risk, or enterprise compliance.',
          'Community posts should disclose affiliation and avoid spam, vote manipulation, or duplicate promotion.',
          'Payments, invoices, tax, refunds, and SLA promises need manual review first.',
        ],
      },
    ],
    faqTitle: 'Set expectations before launch',
    faqs: [
      ['Can this be the final bill?', 'No. It is a pre-flight estimate and audit tool. Final usage is subject to provider invoices, dashboards, or contracts.'],
      ['Will my prompt be stored?', 'The current product position is not to store raw prompts by default. If a persistent usage ledger is added later, it should store only necessary telemetry and disclose that clearly.'],
      ['Why not charge immediately?', 'The lowest-maintenance path is manual Early Access: issue keys by hand, learn from real workflows, then consider a light paid pilot when demand and compliance are clearer.'],
      ['How should I report issues?', 'Use GitHub issues for public bugs or model requests. Email directly for keys, customer data, security, or privacy concerns.'],
    ],
    emailLabel: 'Security / privacy contact',
  }
})
</script>

<template>
  <section class="trust-center-layout">
    <div class="trust-center-hero">
      <div>
        <p class="eyebrow">{{ content.eyebrow }}</p>
        <h1>{{ content.title }}</h1>
        <p>{{ content.subtitle }}</p>
        <div class="trust-center-actions">
          <a class="primary-action" href="/early-access">
            {{ content.cta }}
            <ArrowRight :size="16" aria-hidden="true" />
          </a>
          <a class="ghost-button" href="/api-docs">{{ content.api }}</a>
        </div>
      </div>
      <div class="trust-contact-panel">
        <Mail :size="18" aria-hidden="true" />
        <span>{{ content.emailLabel }}</span>
        <a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
      </div>
    </div>

    <div class="trust-section-grid">
      <article v-for="section in content.sections" :key="section.title" class="trust-section-card">
        <component :is="section.icon" :size="22" aria-hidden="true" />
        <h2>{{ section.title }}</h2>
        <p>{{ section.body }}</p>
        <ul>
          <li v-for="point in section.points" :key="point">{{ point }}</li>
        </ul>
      </article>
    </div>

    <section class="trust-faq-section">
      <div class="trust-section-head">
        <ClipboardCheck :size="20" aria-hidden="true" />
        <h2>{{ content.faqTitle }}</h2>
      </div>
      <div class="trust-faq-list">
        <article v-for="[question, answer] in content.faqs" :key="question">
          <h3>{{ question }}</h3>
          <p>{{ answer }}</p>
        </article>
      </div>
    </section>
  </section>
</template>

<style scoped>
.trust-center-layout {
  max-width: 1120px;
  margin: 0 auto;
  padding: 42px 28px 72px;
}

.trust-center-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 24px;
  align-items: end;
  padding-bottom: 24px;
}

.trust-center-hero h1 {
  max-width: 780px;
  margin: 0;
  color: var(--text);
  font-size: clamp(30px, 4vw, 52px);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: 0;
}

.trust-center-hero p:not(.eyebrow) {
  max-width: 780px;
  margin: 14px 0 0;
  color: var(--muted);
  font-size: 17px;
  line-height: 1.55;
}

.trust-center-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 18px;
}

.trust-center-actions a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.trust-contact-panel,
.trust-section-card,
.trust-faq-section,
.trust-faq-list article {
  border: 1px solid var(--line);
  background: var(--bg-panel);
  box-shadow: var(--shadow-sm);
}

.trust-contact-panel {
  display: grid;
  gap: 8px;
  padding: 16px;
  border-radius: var(--radius);
  color: var(--muted);
  font-size: 13px;
}

.trust-contact-panel svg,
.trust-section-card svg,
.trust-section-head svg {
  color: var(--accent);
}

.trust-contact-panel a {
  color: var(--text-secondary);
  font-weight: 650;
  text-decoration: none;
  overflow-wrap: anywhere;
}

.trust-section-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.trust-section-card {
  padding: 18px;
  border-radius: var(--radius);
}

.trust-section-card h2,
.trust-faq-section h2,
.trust-faq-list h3 {
  margin: 12px 0 0;
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.25;
}

.trust-section-card p,
.trust-section-card li,
.trust-faq-list p {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.65;
}

.trust-section-card p {
  margin: 10px 0 0;
}

.trust-section-card ul {
  display: grid;
  gap: 7px;
  margin: 14px 0 0;
  padding-left: 18px;
}

.trust-faq-section {
  margin-top: 16px;
  padding: 18px;
  border-radius: var(--radius);
}

.trust-section-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.trust-section-head h2 {
  margin: 0;
}

.trust-faq-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.trust-faq-list article {
  padding: 14px;
  border-radius: var(--radius-sm);
}

.trust-faq-list h3 {
  margin: 0;
}

.trust-faq-list p {
  margin: 8px 0 0;
}

@media (max-width: 980px) {
  .trust-center-hero,
  .trust-section-grid,
  .trust-faq-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .trust-center-layout {
    padding: 28px 16px 52px;
  }

  .trust-center-actions,
  .trust-center-actions a {
    width: 100%;
  }

  .trust-center-actions a {
    justify-content: center;
  }
}
</style>
