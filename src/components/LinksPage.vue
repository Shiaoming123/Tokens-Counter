<script setup lang="ts">
import { ArrowUpRight, BookOpen, Code2, FileText, Globe2, ShieldCheck } from 'lucide-vue-next'
import { useLocaleStore } from '../stores/locale'

const localeStore = useLocaleStore()

const githubUrl = import.meta.env.VITE_APP_GITHUB_URL || 'https://github.com/'
const publicUrl = import.meta.env.VITE_APP_PUBLIC_URL || window.location.origin

const links = [
  {
    title: 'GitHub Repository',
    description: {
      en: 'Source code, issues, releases, and contribution discussions.',
      zh: '源码、Issue、Release 和贡献讨论。',
    },
    href: githubUrl,
    icon: Code2,
  },
  {
    title: 'Public App',
    description: {
      en: 'The production website for users to compare model token and cost estimates.',
      zh: '面向用户的正式站点，用于对比模型 Token 与费用估算。',
    },
    href: publicUrl,
    icon: Globe2,
  },
  {
    title: 'External API Docs',
    description: {
      en: 'HTTP API for model catalog, token counting, and cost estimates.',
      zh: '模型目录、Token 计算和费用估算的 HTTP API 文档。',
    },
    href: '/api-docs',
    icon: BookOpen,
    internal: true,
  },
  {
    title: 'Licenses',
    description: {
      en: 'Tokenizer, pricing, provider, and counting-method notices.',
      zh: '分词器、计费、供应商和计算方式声明。',
    },
    href: '/licenses',
    icon: ShieldCheck,
    internal: true,
  },
  {
    title: 'Tokenizer Audit',
    description: {
      en: 'Research notes for official tokenizer mappings and estimate accuracy.',
      zh: '官方分词器映射和估算精度的调研记录。',
    },
    href: `${githubUrl.replace(/\/$/, '')}/blob/main/docs/tokenizer-research-2026-05-17.md`,
    icon: FileText,
  },
  {
    title: 'Launch Plan',
    description: {
      en: 'Open-source launch, deployment, domain, and first-revenue playbook.',
      zh: '开源上线、部署域名和第一笔收入的执行方案。',
    },
    href: `${githubUrl.replace(/\/$/, '')}/blob/main/docs/launch-and-monetization-plan.md`,
    icon: FileText,
  },
]
</script>

<template>
  <section class="links-page">
    <div class="links-hero">
      <p class="eyebrow">{{ localeStore.locale === 'zh' ? '项目入口' : 'Project Links' }}</p>
      <h1>{{ localeStore.locale === 'zh' ? 'AI Token Counter 友链' : 'AI Token Counter Links' }}</h1>
      <p>
        {{
          localeStore.locale === 'zh'
            ? '这里集中放置项目源码、线上站点、API 文档和合规说明，后续也可以继续接入合作伙伴、教程和模型厂商页面。'
            : 'A compact hub for the source code, public app, API docs, compliance notes, and future partner resources.'
        }}
      </p>
    </div>

    <div class="links-grid">
      <a
        v-for="link in links"
        :key="link.title"
        class="link-card"
        :href="link.href"
        :target="link.internal ? undefined : '_blank'"
        :rel="link.internal ? undefined : 'noreferrer'"
      >
        <span class="link-icon">
          <component :is="link.icon" :size="22" />
        </span>
        <span class="link-copy">
          <strong>{{ link.title }}</strong>
          <span>{{ localeStore.locale === 'zh' ? link.description.zh : link.description.en }}</span>
        </span>
        <ArrowUpRight :size="18" class="link-arrow" />
      </a>
    </div>
  </section>
</template>

<style scoped>
.links-page {
  width: min(1120px, calc(100vw - 40px));
  margin: 0 auto;
  padding: 42px 0 72px;
}

.links-hero {
  max-width: 760px;
  margin-bottom: 24px;
}

.links-hero h1 {
  margin: 6px 0 10px;
  font-size: clamp(32px, 5vw, 52px);
  line-height: 1.04;
  letter-spacing: 0;
}

.links-hero p {
  color: var(--muted);
  font-size: 15px;
  line-height: 1.75;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.link-card {
  display: grid;
  grid-template-columns: 44px 1fr 22px;
  align-items: center;
  gap: 14px;
  min-height: 110px;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--bg-panel);
  color: var(--text);
  text-decoration: none;
  box-shadow: var(--shadow-sm);
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.link-card:hover {
  transform: translateY(-2px);
  border-color: rgba(0, 122, 255, 0.28);
  box-shadow: var(--shadow-md);
}

.link-icon {
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 13px;
  color: #0a84ff;
  background: rgba(10, 132, 255, 0.1);
}

.link-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
}

.link-copy strong {
  font-size: 15px;
}

.link-copy span {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.45;
}

.link-arrow {
  color: var(--muted);
}

@media (max-width: 760px) {
  .links-page {
    width: min(100% - 24px, 1120px);
    padding-top: 24px;
  }

  .links-grid {
    grid-template-columns: 1fr;
  }
}
</style>
