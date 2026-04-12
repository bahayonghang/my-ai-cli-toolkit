import {
  SKILLS_CATALOG_EN,
  SKILLS_CATALOG_ZH,
} from './generated/skills-catalog.mts'

export type SkillsCatalogLocale = 'en' | 'zh'

export type SkillsCatalogSkill = {
  slug: string
  title: string
  summary: string
  path: string
}

export type SkillsCatalogCategory = {
  slug: string
  skills: SkillsCatalogSkill[]
}

export const CATEGORY_LABELS_EN: Record<string, string> = {
  'development-workflows': 'Development Workflows',
  'developer-tools-integrations': 'Developer Tools & Integrations',
  'git-github-collaboration': 'Git & GitHub Collaboration',
  'docs-writing-publishing': 'Docs, Writing & Publishing',
  'research-learning-knowledge': 'Research, Learning & Knowledge',
  'visual-media-design': 'Visual, Media & Design',
}

export const CATEGORY_LABELS_ZH: Record<string, string> = {
  'development-workflows': '开发工作流',
  'developer-tools-integrations': '开发者工具与集成',
  'git-github-collaboration': 'Git 与 GitHub 协作',
  'docs-writing-publishing': '文档写作与发布',
  'research-learning-knowledge': '研究学习与知识',
  'visual-media-design': '视觉媒体与设计',
}

export const CATEGORY_DESCRIPTIONS_EN: Record<string, string> = {
  'development-workflows':
    'Planning, implementation, architecture, memory, auditing, and project execution workflows.',
  'developer-tools-integrations':
    'AI coding CLIs, developer tool integrations, MCP helpers, and technical stack workflows.',
  'git-github-collaboration':
    'GitHub review, CI, comments, commit composition, and repository collaboration workflows.',
  'docs-writing-publishing':
    'Bid writing, visual cards, document generation, Typst, Touying, screenshots, and publishing artifacts.',
  'research-learning-knowledge':
    'Paper lookup, slides, replication, bibliography, concept learning, roundtables, and knowledge workflows.',
  'visual-media-design':
    'Diagram authoring, article covers, media download, and visual design workflows.',
}

export const CATEGORY_DESCRIPTIONS_ZH: Record<string, string> = {
  'development-workflows':
    '规划、实现、架构、memory、审计与项目执行相关工作流。',
  'developer-tools-integrations':
    'AI 编码 CLI、开发者工具集成、MCP 辅助能力与技术栈工作流。',
  'git-github-collaboration':
    'GitHub 审查、CI、评论处理、提交组织与仓库协作工作流。',
  'docs-writing-publishing':
    '标书、视觉卡片、文档生成、Typst、Touying、截图与发布产物。',
  'research-learning-knowledge':
    '论文检索、幻灯片、复现、书目、概念学习、圆桌讨论与知识工作流。',
  'visual-media-design':
    '图表编写、文章封面、媒体下载与视觉设计工作流。',
}

export function getSkillsCatalog(
  locale: SkillsCatalogLocale,
): SkillsCatalogCategory[] {
  return locale === 'zh' ? SKILLS_CATALOG_ZH : SKILLS_CATALOG_EN
}

export function getCategoryLabels(
  locale: SkillsCatalogLocale,
): Record<string, string> {
  return locale === 'zh' ? CATEGORY_LABELS_ZH : CATEGORY_LABELS_EN
}

export function getCategoryDescriptions(
  locale: SkillsCatalogLocale,
): Record<string, string> {
  return locale === 'zh'
    ? CATEGORY_DESCRIPTIONS_ZH
    : CATEGORY_DESCRIPTIONS_EN
}
