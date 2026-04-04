import fs from 'node:fs'
import path from 'node:path'

export const CATEGORY_LABELS_EN: Record<string, string> = {
  'academic-skills': 'Academic',
  'ai-llm-skills': 'AI & LLM',
  'diagram-skills': 'Diagram',
  'document-skills': 'Document',
  'git-github-skills': 'Git & GitHub',
  'learning-skills': 'Learning',
  'media-skills': 'Media',
  'skill-meta-skills': 'Skill Meta',
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
  'skill-meta-skills': 'Skill 元工具',
  'tech-stack-skills': '技术栈',
  'work-skills': '工作总结',
  'workflow-skills': '工作流',
}

export type SidebarByDirOptions = {
  sidebarTitle?: string
  overviewText?: string
  categoryLabels?: Record<string, string>
  collapsed?: boolean
}

export const SIDEBAR_OPTIONS_EN: SidebarByDirOptions = {
  sidebarTitle: 'Skills',
  overviewText: 'Overview',
  categoryLabels: CATEGORY_LABELS_EN,
  collapsed: true,
}

export const SIDEBAR_OPTIONS_ZH: SidebarByDirOptions = {
  sidebarTitle: '技能',
  overviewText: '概览',
  categoryLabels: CATEGORY_LABELS_ZH,
  collapsed: true,
}

function contentSkillsRoot() {
  return path.resolve(process.cwd(), '../content/skills')
}

function readSourceCategories() {
  const root = contentSkillsRoot()
  if (!fs.existsSync(root)) {
    return []
  }

  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort()
}

function readSourceSkills(category: string) {
  const categoryDir = path.join(contentSkillsRoot(), category)
  if (!fs.existsSync(categoryDir)) {
    return new Set<string>()
  }

  return new Set(
    fs
      .readdirSync(categoryDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map((entry) => entry.name),
  )
}

function formatCategory(category: string) {
  return category
}

export function generateSidebarByDir(
  dir: string,
  basePath = '/skills/',
  options: SidebarByDirOptions = {},
) {
  const sidebarTitle = options.sidebarTitle ?? 'Skills'
  const overviewText = options.overviewText ?? 'Overview'
  const categoryLabels = options.categoryLabels ?? CATEGORY_LABELS_EN
  const collapsed = options.collapsed ?? true

  const items: Array<Record<string, unknown>> = []
  const overviewPath = path.join(dir, 'index.md')

  if (fs.existsSync(overviewPath)) {
    items.push({ text: overviewText, link: basePath })
  }

  for (const category of readSourceCategories()) {
    const docsCategoryDir = path.join(dir, category)
    if (!fs.existsSync(docsCategoryDir)) {
      continue
    }

    const sourceSkills = readSourceSkills(category)
    const subItems = fs
      .readdirSync(docsCategoryDir, { withFileTypes: true })
      .filter((entry) => {
        if (!entry.isFile()) {
          return false
        }

        if (!entry.name.endsWith('.md') || entry.name === 'index.md') {
          return false
        }

        const skillName = path.basename(entry.name, '.md')
        return sourceSkills.has(skillName)
      })
      .map((entry) => {
        const skillName = path.basename(entry.name, '.md')
        return {
          text: skillName,
          link: `${basePath}${category}/${skillName}`,
        }
      })
      .sort((left, right) =>
        String(left.text).localeCompare(String(right.text), 'en'),
      )

    if (subItems.length === 0) {
      continue
    }

    items.push({
      text: categoryLabels[category] ?? formatCategory(category),
      collapsed,
      items: subItems,
    })
  }

  return [{ text: sidebarTitle, items }]
}
