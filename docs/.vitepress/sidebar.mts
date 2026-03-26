import fs from 'node:fs'
import path from 'node:path'

const CATEGORY_LABELS: Record<string, string> = {
  'academic-skills': 'Academic',
  'ai-llm-skills': 'AI & LLM',
  'diagram-skills': 'Diagram',
  'document-skills': 'Document',
  'git-github-skills': 'Git & GitHub',
  'learning-skills': 'Learning',
  'media-skills': 'Media',
  'skill-meta-skills': 'Skill Meta',
  'tech-stack-skills': 'Tech Stack',
  'workflow-skills': 'Workflow',
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
  return CATEGORY_LABELS[category] ?? category
}

export function generateSidebarByDir(dir: string, basePath = '/skills/') {
  const items: Array<Record<string, unknown>> = []
  const overviewPath = path.join(dir, 'index.md')

  if (fs.existsSync(overviewPath)) {
    items.push({ text: 'Overview', link: basePath })
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
      text: formatCategory(category),
      collapsed: false,
      items: subItems,
    })
  }

  return [{ text: 'Skills', items }]
}
