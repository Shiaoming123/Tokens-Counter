<script setup lang="ts">
import { ArrowRight, BarChart3, Check, ExternalLink, FileText, KeyRound, Mail, ShieldCheck } from 'lucide-vue-next'

const contactEmail = 'henshiaoming@gmail.com'
const mailto =
  'mailto:henshiaoming@gmail.com?subject=[AI%20Token%20Counter]%20Early%20Access%20request&body=Hi%2C%20I%20would%20like%20to%20try%20AI%20Token%20Counter%20Early%20Access.%0A%0AUse%20case%3A%0ANeed%20UI%20or%20API%3A%0AExpected%20monthly%20requests%3A%0ARequired%20models%20or%20providers%3A%0ASensitive%20inputs%3A%0A'

const proofPoints = [
  '177 model catalog entries across mainstream LLM providers',
  'Text, image, PDF, chat message, and tool schema estimates',
  'Accuracy labels for official, local, estimated, and unsupported paths',
  'Official/catalog and CC Switch-style pricing profiles',
]

const audiences = [
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
]

const features = [
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
]

const plans = [
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
]

const faqs = [
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
]
</script>

<template>
  <section class="early-page">
    <div class="early-hero">
      <div class="early-hero-copy">
        <p class="eyebrow">Early Access</p>
        <h1>AI cost estimation and token audit, before production.</h1>
        <p>
          AI Token Counter helps builders compare token usage, estimated API cost, model capability, and counting
          confidence across real LLM inputs: prompts, chat messages, images, PDFs, and tool schemas.
        </p>
        <div class="early-actions">
          <a class="primary-action early-mail-link" :href="mailto">
            <Mail :size="18" aria-hidden="true" />
            Request by email
          </a>
          <button class="ghost-button early-doc-button" type="button" @click="$emit('navigate', '/api-docs')">
            API Docs
            <ArrowRight :size="16" aria-hidden="true" />
          </button>
        </div>
        <p class="early-contact">
          Send use case, expected volume, required providers, and sensitivity notes to
          <a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>.
        </p>
      </div>
      <div class="early-visual" aria-label="AI Token Counter product preview">
        <img src="/screenshot.png" alt="AI Token Counter workbench screenshot" />
      </div>
    </div>

    <div class="early-proof-grid" aria-label="Product proof points">
      <div v-for="point in proofPoints" :key="point" class="early-proof-item">
        <Check :size="17" aria-hidden="true" />
        <span>{{ point }}</span>
      </div>
    </div>

    <section class="early-section">
      <div class="early-section-head">
        <p class="eyebrow">Who it is for</p>
        <h2>Built for people who actually pay for tokens.</h2>
      </div>
      <div class="early-card-grid audience-grid">
        <article v-for="item in audiences" :key="item.title" class="early-card">
          <h3>{{ item.title }}</h3>
          <p>{{ item.body }}</p>
        </article>
      </div>
    </section>

    <section class="early-section early-split">
      <div>
        <p class="eyebrow">The problem</p>
        <h2>Token cost is rarely just one number.</h2>
      </div>
      <div class="early-rich-text">
        <p>
          Simple token counters usually ignore chat templates, tool schemas, multimodal rules, expected output,
          cache pricing, provider-side optimizations, and proxy pricing. AI Token Counter shows the estimate and the
          confidence level together, so teams can decide how much to trust each number.
        </p>
        <p>
          The product is intentionally honest: estimates help with budgeting and model selection, but they do not
          replace provider invoices.
        </p>
      </div>
    </section>

    <section class="early-section">
      <div class="early-section-head">
        <p class="eyebrow">Capabilities</p>
        <h2>From one-off checks to API-powered audit workflows.</h2>
      </div>
      <div class="early-card-grid feature-grid">
        <article v-for="item in features" :key="item.title" class="early-card feature-card">
          <component :is="item.icon" :size="22" aria-hidden="true" />
          <h3>{{ item.title }}</h3>
          <p>{{ item.body }}</p>
        </article>
      </div>
    </section>

    <section class="early-section">
      <div class="early-section-head">
        <p class="eyebrow">Early Access model</p>
        <h2>Start manually, learn from real users, then harden billing.</h2>
      </div>
      <div class="early-card-grid pricing-grid">
        <article v-for="plan in plans" :key="plan.name" class="early-card pricing-card">
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
        <p class="eyebrow">Trust boundary</p>
        <h2>We do not disguise estimates as invoice truth.</h2>
      </div>
      <div class="early-rich-text">
        <p>
          Every result should be read with its count method, accuracy label, pricing source, and pricing date. When a
          provider API is not configured, local estimates are clearly marked as local. When official-only behavior is
          requested and unavailable, the API returns an explicit error instead of silently pretending.
        </p>
        <a class="early-inline-link" href="/api-docs">
          Read API behavior
          <ExternalLink :size="15" aria-hidden="true" />
        </a>
      </div>
    </section>

    <section class="early-section">
      <div class="early-section-head">
        <p class="eyebrow">FAQ</p>
        <h2>Questions to answer before issuing keys.</h2>
      </div>
      <div class="early-faq-list">
        <article v-for="item in faqs" :key="item.q" class="early-faq">
          <h3>{{ item.q }}</h3>
          <p>{{ item.a }}</p>
        </article>
      </div>
    </section>

    <section class="early-final-cta">
      <div>
        <p class="eyebrow">Ready to test it?</p>
        <h2>Send one email with your workflow. Keys are issued manually.</h2>
      </div>
      <a class="primary-action early-mail-link" :href="mailto">
        <Mail :size="18" aria-hidden="true" />
        Request Early Access
      </a>
    </section>
  </section>
</template>
