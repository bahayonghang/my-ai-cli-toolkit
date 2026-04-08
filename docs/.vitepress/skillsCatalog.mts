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
  'academic-skills': 'Academic',
  'ai-llm-skills': 'AI & LLM',
  'diagram-skills': 'Diagram',
  'document-skills': 'Document',
  'git-github-skills': 'Git & GitHub',
  'learning-skills': 'Learning',
  'media-skills': 'Media',
  'meta-skills': 'Meta',
  'tech-stack-skills': 'Tech Stack',
  'work-skills': 'Work',
  'workflow-skills': 'Workflow',
}

export const CATEGORY_LABELS_ZH: Record<string, string> = {
  'academic-skills': '学术',
  'ai-llm-skills': 'AI & LLM',
  'diagram-skills': '图表',
  'document-skills': '文档',
  'git-github-skills': 'Git & GitHub',
  'learning-skills': '学习',
  'media-skills': '媒体',
  'meta-skills': '元工具',
  'tech-stack-skills': '技术栈',
  'work-skills': '工作总结',
  'workflow-skills': '工作流',
}

export const CATEGORY_DESCRIPTIONS_EN: Record<string, string> = {
  'academic-skills':
    'Paper lookup, paper-workbench, bibliography search, slides, replication, and paper analysis workflows.',
  'ai-llm-skills':
    'Codex CLI, Codex companion runtime, Gemini CLI, and Gemini image workflows.',
  'diagram-skills':
    'Excalidraw and Mermaid diagram authoring.',
  'document-skills':
    'Bid writing, visual cards, document generation, Typst, Touying, screenshots, and themed artifacts.',
  'git-github-skills':
    'GitHub review, CI, comments, commit composition, and repository workflows.',
  'learning-skills':
    'Concept anatomy, plain rewriting, rank reduction, roundtables, and word-study workflows.',
  'media-skills':
    'Article covers and media download.',
  'meta-skills':
    'MCP-to-skill conversion and skill catalog mapping.',
  'tech-stack-skills':
    'Slint, LSP, Rust CLI/TUI, and uv.',
  'work-skills':
    'Daily reports, project rollups, and end-of-session wrap-ups.',
  'workflow-skills':
    'Planning interviews, architecture improvement, memory, and code auditing.',
}

export const CATEGORY_DESCRIPTIONS_ZH: Record<string, string> = {
  'academic-skills':
    '论文检索、paper-workbench、书目搜索、幻灯片、复现与论文分析工作流。',
  'ai-llm-skills':
    'Codex CLI、Codex companion runtime、Gemini CLI 与 Gemini 图像能力。',
  'diagram-skills': 'Excalidraw 与 Mermaid 图表编写。',
  'document-skills':
    '标书、视觉卡片、文档生成、Typst、Touying、截图与主题套用。',
  'git-github-skills': 'GitHub 审查、CI、评论处理、提交组织与仓库工作流。',
  'learning-skills': '概念解剖、白话改写、秩约简、圆桌讨论与单词学习。',
  'media-skills': '文章封面与媒体下载。',
  'meta-skills': 'MCP 转换与 skill 目录映射。',
  'tech-stack-skills': 'Slint、LSP、Rust CLI/TUI 与 uv。',
  'work-skills': '日报、跨项目汇总与会话收尾。',
  'workflow-skills': '计划访谈、架构改进、memory 与代码审计。',
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
