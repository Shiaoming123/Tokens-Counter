<script setup lang="ts">
import { computed } from 'vue'
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  FileText,
  Gauge,
  ShieldCheck,
  TerminalSquare,
} from 'lucide-vue-next'

const emit = defineEmits<{
  navigate: [path: string]
}>()

const launchCases = [
  {
    id: 'agent-support-review',
    label: 'Workbench case',
    title: 'Agent support flow before launch',
    summary:
      'A small AI app team used the web workbench to review a support-agent prompt pack before shipping it to beta users.',
    context: [
      'Multi-turn system, user, and assistant examples were pasted into the workbench.',
      'Tool schemas were added to expose function-call overhead that a plain text counter would miss.',
      'The team compared mainstream chat models with expected output tokens and provider/catalog pricing.',
    ],
    evidence: [
      'The largest change came from tool schema and expected output assumptions, not only prompt length.',
      'Results were read with local_estimate, local_exact, official_estimate, and unsupported labels.',
      'The team used the result to shortlist models for testing, then verified production usage with provider dashboards.',
    ],
    safeguards: [
      'Customer names, prompt text, account IDs, and exact cost figures were removed.',
      'All counts in this case are directional and rounded for public discussion.',
      'The case is a pre-flight estimate, not a replacement for provider invoices.',
    ],
    useCaseTags: ['Workbench', 'Tool schemas', 'Model shortlist', 'Accuracy labels'],
    outcome:
      'The review turned a vague cost concern into a concrete launch checklist: compare model candidates, inspect confidence labels, and re-check official billing after live traffic starts.',
  },
  {
    id: 'internal-api-audit',
    label: 'API case',
    title: 'Internal prompt review via API',
    summary:
      'A platform-style workflow tested the protected API as a lightweight estimate step before prompts were merged into an internal tool.',
    context: [
      'A CI-style script called /api/v1/estimates with a bearer key and Idempotency-Key.',
      'Requests included pricing_profile, expected_output_tokens, cache fields, and redact=true.',
      'The response was stored as a review artifact with model, method, accuracy, pricing source, and timestamp.',
    ],
    evidence: [
      'Unsupported or low-confidence paths stayed visible instead of being flattened into one number.',
      'Reviewers could see when a result depended on local estimation instead of official counting.',
      'Large estimate changes triggered a human review before a prompt change was accepted.',
    ],
    safeguards: [
      'No raw prompt text, API key, private endpoint, or customer identifier is included here.',
      'The workflow used estimates for review gates only, not for customer billing.',
      'Final commercial decisions still require provider documentation and invoice verification.',
    ],
    useCaseTags: ['API', 'CI review', 'Pricing profiles', 'Estimate gates'],
    outcome:
      'The API made token and cost assumptions reviewable in the same place as code changes, while preserving the boundary between planning estimates and final billed usage.',
  },
]

const principles = [
  {
    icon: ShieldCheck,
    title: 'Safe by default',
    body: 'These examples are anonymized, rounded, and stripped of prompts, customer data, API keys, and provider account details.',
  },
  {
    icon: Gauge,
    title: 'Estimate, not invoice',
    body: 'AI Token Counter supports planning and review. Provider dashboards, invoices, and contracts remain the final billing source.',
  },
  {
    icon: BadgeCheck,
    title: 'Confidence is visible',
    body: 'Accuracy labels such as official_estimate, local_exact, local_estimate, and unsupported travel with each result.',
  },
]

const apiExample = `curl -sS "$BASE_URL/api/v1/estimates" \\
  -H "Authorization: Bearer $TOKEN_COUNTER_API_KEY" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: prompt-review-001" \\
  -d '{
    "models": ["gpt-4o", "claude-3-5-sonnet-latest"],
    "input": {"text": "Redacted launch prompt sample"},
    "options": {
      "expected_output_tokens": 900,
      "pricing_profile": "official",
      "use_official_api": false,
      "redact": true
    }
  }'`

const reviewChecklist = computed(() => [
  'Use synthetic or redacted inputs for public screenshots and demos.',
  'Export or cite accuracy labels next to every estimate.',
  'Separate workbench exploration from API automation in launch copy.',
  'Avoid claims such as exact bill, certified by provider, or zero privacy risk.',
])

function go(path: string) {
  emit('navigate', path)
}
</script>

<template>
  <section class="case-page">
    <div class="case-hero">
      <div>
        <p class="eyebrow">Case Studies</p>
        <h1>Public-safe examples for launch conversations.</h1>
        <p>
          Two anonymized stories show how AI Token Counter can support model comparison, cost planning,
          accuracy review, and API-driven prompt audits without exposing private customer data.
        </p>
        <div class="case-actions">
          <button class="primary-action" type="button" @click="go('/early-access')">
            Request Early Access
            <ArrowRight :size="16" aria-hidden="true" />
          </button>
          <button class="ghost-button" type="button" @click="go('/api-docs')">
            Read API Docs
          </button>
        </div>
      </div>
      <aside class="case-hero-panel" aria-label="Launch-safe claim boundary">
        <FileText :size="20" aria-hidden="true" />
        <strong>Positioning line</strong>
        <p>
          Estimate token usage and API cost before production. Compare models and confidence labels.
          Do not treat the output as a provider invoice.
        </p>
      </aside>
    </div>

    <div class="case-principles">
      <article v-for="principle in principles" :key="principle.title" class="case-principle">
        <component :is="principle.icon" :size="21" aria-hidden="true" />
        <h2>{{ principle.title }}</h2>
        <p>{{ principle.body }}</p>
      </article>
    </div>

    <section class="case-section">
      <div class="case-section-head">
        <ClipboardList :size="20" aria-hidden="true" />
        <h2>Launch-ready anonymized cases</h2>
      </div>

      <div class="case-study-list">
        <article v-for="item in launchCases" :key="item.id" class="case-study">
          <div class="case-study-head">
            <span>{{ item.label }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.summary }}</p>
          </div>

          <div class="case-study-grid">
            <div>
              <h4>How it was used</h4>
              <ul>
                <li v-for="point in item.context" :key="point">{{ point }}</li>
              </ul>
            </div>
            <div>
              <h4>What changed</h4>
              <ul>
                <li v-for="point in item.evidence" :key="point">{{ point }}</li>
              </ul>
            </div>
            <div>
              <h4>Public-safety notes</h4>
              <ul>
                <li v-for="point in item.safeguards" :key="point">{{ point }}</li>
              </ul>
            </div>
          </div>

          <div class="case-study-footer">
            <div class="case-tags" aria-label="Use case tags">
              <span v-for="tag in item.useCaseTags" :key="tag">{{ tag }}</span>
            </div>
            <p>{{ item.outcome }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="case-section case-api-section">
      <div>
        <div class="case-section-head">
          <TerminalSquare :size="20" aria-hidden="true" />
          <h2>API/workbench split for promotion</h2>
        </div>
        <p class="case-copy">
          Use the workbench story when talking to builders who want an immediate visual review.
          Use the API story when talking to teams that need estimates inside prompt review, CI,
          internal gateways, or cost dashboards.
        </p>
        <ul class="case-checklist">
          <li v-for="item in reviewChecklist" :key="item">
            <BadgeCheck :size="16" aria-hidden="true" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
      <figure class="case-code">
        <figcaption>Redacted API estimate example</figcaption>
        <pre><code>{{ apiExample }}</code></pre>
      </figure>
    </section>

    <section class="case-final">
      <div>
        <p class="eyebrow">Trust boundary</p>
        <h2>Keep the promise narrow and credible.</h2>
        <p>
          The strongest launch message is not that every number is perfect. It is that every number
          carries its method, confidence label, pricing source, and a clear reminder to verify final
          billed usage with the provider.
        </p>
      </div>
      <button class="ghost-button" type="button" @click="go('/trust')">
        Read Trust Center
        <ShieldCheck :size="16" aria-hidden="true" />
      </button>
    </section>
  </section>
</template>

<style scoped>
.case-page {
  width: min(1180px, calc(100vw - 32px));
  margin: 0 auto;
  padding: 36px 0 64px;
  color: var(--text);
}

.case-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 28px;
  align-items: end;
  padding: 28px 0 24px;
}

.case-hero h1,
.case-section h2,
.case-final h2 {
  margin: 0;
  color: var(--text);
  line-height: 1.05;
  letter-spacing: 0;
}

.case-hero h1 {
  max-width: 820px;
  font-size: clamp(36px, 5vw, 64px);
}

.case-hero p:not(.eyebrow),
.case-copy,
.case-final p {
  color: var(--text-secondary);
  line-height: 1.65;
}

.case-hero p:not(.eyebrow) {
  max-width: 760px;
  margin: 18px 0 0;
  font-size: 17px;
}

.case-actions,
.case-final,
.case-section-head,
.case-checklist li,
.case-final .ghost-button {
  display: flex;
  align-items: center;
}

.case-actions {
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}

.case-actions button,
.case-final button {
  gap: 8px;
}

.case-hero-panel,
.case-principle,
.case-study,
.case-code,
.case-final {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--bg-panel);
  box-shadow: var(--shadow-sm);
}

.case-hero-panel {
  display: grid;
  gap: 9px;
  padding: 18px;
}

.case-hero-panel svg,
.case-principle svg,
.case-section-head svg,
.case-checklist svg,
.case-final svg {
  color: var(--accent);
}

.case-hero-panel strong {
  color: var(--text);
  font-size: 15px;
}

.case-hero-panel p {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.6;
}

.case-principles {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 12px 0 34px;
}

.case-principle {
  padding: 18px;
}

.case-principle h2,
.case-study h3,
.case-study h4 {
  margin: 10px 0 0;
  color: var(--text);
  letter-spacing: 0;
}

.case-principle h2 {
  font-size: 16px;
}

.case-principle p {
  margin: 8px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.65;
}

.case-section {
  padding: 36px 0;
  border-top: 1px solid var(--line);
}

.case-section-head {
  gap: 10px;
  margin-bottom: 18px;
}

.case-section h2,
.case-final h2 {
  font-size: clamp(26px, 3.6vw, 40px);
}

.case-study-list {
  display: grid;
  gap: 16px;
}

.case-study {
  padding: 20px;
}

.case-study-head span,
.case-tags span {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  color: var(--accent);
  background: rgba(37, 99, 235, 0.08);
  font-size: 11px;
  font-weight: 750;
}

.case-study h3 {
  font-size: 22px;
}

.case-study-head p {
  max-width: 900px;
  margin: 10px 0 0;
  color: var(--text-secondary);
  line-height: 1.65;
}

.case-study-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.case-study h4 {
  font-size: 13px;
  text-transform: uppercase;
}

.case-study ul,
.case-checklist {
  display: grid;
  gap: 8px;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}

.case-study li {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.6;
}

.case-study li::before {
  content: "";
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 8px;
  border-radius: 999px;
  background: var(--accent);
  vertical-align: 2px;
}

.case-study-footer {
  display: grid;
  gap: 12px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}

.case-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.case-study-footer p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.65;
}

.case-api-section {
  display: grid;
  grid-template-columns: minmax(0, 0.86fr) minmax(360px, 1fr);
  gap: 20px;
  align-items: start;
}

.case-copy {
  margin: 0;
}

.case-checklist {
  margin-top: 16px;
}

.case-checklist li {
  gap: 9px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.45;
}

.case-checklist svg {
  flex: 0 0 auto;
}

.case-code {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  background: var(--code-bg, rgba(15, 23, 42, 0.04));
}

.case-code figcaption {
  padding: 11px 13px;
  border-bottom: 1px solid var(--line);
  color: var(--muted);
  font-size: 12px;
  font-weight: 750;
}

.case-code pre {
  margin: 0;
  padding: 14px;
  overflow-x: auto;
  color: var(--text-secondary);
  font-family: "SF Mono", ui-monospace, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.6;
}

.case-final {
  justify-content: space-between;
  gap: 24px;
  padding: 24px;
}

.case-final p:not(.eyebrow) {
  max-width: 820px;
  margin: 12px 0 0;
}

@media (max-width: 980px) {
  .case-hero,
  .case-principles,
  .case-study-grid,
  .case-api-section {
    grid-template-columns: 1fr;
  }

  .case-final {
    display: grid;
    justify-items: start;
  }
}

@media (max-width: 640px) {
  .case-page {
    width: min(100vw - 20px, 1180px);
    padding-top: 22px;
  }

  .case-hero h1 {
    font-size: 40px;
  }

  .case-actions,
  .case-actions button,
  .case-final button {
    width: 100%;
  }

  .case-actions button,
  .case-final button {
    justify-content: center;
  }

  .case-study,
  .case-final {
    padding: 18px;
  }
}
</style>
