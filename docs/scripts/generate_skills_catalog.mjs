import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')
const contentSkillsRoot = path.join(repoRoot, 'content', 'skills')
const docsRoot = path.join(repoRoot, 'docs')
const generatedDir = path.join(docsRoot, '.vitepress', 'generated')
const generatedFile = path.join(generatedDir, 'skills-catalog.mts')
const extraSkillDocs = [
  {
    category: 'visual-media-design',
    slug: 'gemini-image',
  },
]

function listDirectories(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, 'en'))
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

function extractTitle(markdown, fallback) {
  const match = markdown.match(/^#\s+(.+)$/m)
  return match?.[1]?.trim() || fallback
}

function formatSlugTitle(slug) {
  const tokenMap = new Map([
    ['ai', 'AI'],
    ['llm', 'LLM'],
    ['mcp', 'MCP'],
    ['lsp', 'LSP'],
    ['uv', 'uv'],
    ['cli', 'CLI'],
    ['tui', 'TUI'],
    ['typst', 'Typst'],
    ['latex', 'LaTeX'],
    ['github', 'GitHub'],
  ])

  return slug
    .split('-')
    .map((token) => {
      if (tokenMap.has(token)) {
        return tokenMap.get(token)
      }

      return token.charAt(0).toUpperCase() + token.slice(1)
    })
    .join(' ')
}

function extractFirstParagraph(markdown) {
  const lines = markdown.split(/\r?\n/)
  const paragraph = []
  let sawTitle = false
  let inCode = false

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (line.startsWith('```')) {
      inCode = !inCode
      continue
    }

    if (inCode) {
      continue
    }

    if (!sawTitle) {
      if (line.startsWith('# ')) {
        sawTitle = true
      }
      continue
    }

    if (!line) {
      if (paragraph.length > 0) {
        break
      }
      continue
    }

    if (
      line.startsWith('#') ||
      line.startsWith('|') ||
      line.startsWith('>') ||
      line.startsWith('- ') ||
      line.startsWith('* ') ||
      /^\d+\.\s/.test(line) ||
      line.startsWith('<')
    ) {
      break
    }

    paragraph.push(line)
  }

  return paragraph.join(' ').replace(/\s+/g, ' ').trim()
}

function extractFrontmatterDescription(markdown) {
  const quoted = markdown.match(/^description:\s*["'](.+?)["']\s*$/m)
  if (quoted?.[1]) {
    return quoted[1].trim()
  }

  const plain = markdown.match(/^description:\s*(.+)\s*$/m)
  if (plain?.[1] && plain[1] !== '|' && plain[1] !== '>') {
    return plain[1].trim()
  }

  return ''
}

function buildCatalog(localePrefix = '') {
  const docsSkillsRoot = path.join(docsRoot, localePrefix, 'skills')
  const extraDocsByCategory = new Map()

  for (const entry of extraSkillDocs) {
    const values = extraDocsByCategory.get(entry.category) ?? []
    values.push(entry.slug)
    extraDocsByCategory.set(entry.category, values)
  }

  return listDirectories(contentSkillsRoot)
    .map((category) => {
      const categoryDir = path.join(contentSkillsRoot, category)
      const sourceSkills = listDirectories(categoryDir)
        .filter((skill) =>
          fs.existsSync(path.join(categoryDir, skill, 'SKILL.md')),
        )
      const extraDocs = (extraDocsByCategory.get(category) ?? []).filter(
        (skill) =>
          fs.existsSync(path.join(docsSkillsRoot, category, `${skill}.md`)),
      )
      const skills = [...new Set([...sourceSkills, ...extraDocs])]
        .map((skill) => {
          const docPath = path.join(docsSkillsRoot, category, `${skill}.md`)
          const skillPath = path.join(categoryDir, skill, 'SKILL.md')
          const docMarkdown = fs.existsSync(docPath) ? readText(docPath) : ''
          const skillMarkdown = fs.existsSync(skillPath) ? readText(skillPath) : ''
          const extractedTitle = extractTitle(docMarkdown, skill)
          const title =
            extractedTitle === skill ? formatSlugTitle(skill) : extractedTitle
          const summary =
            extractFirstParagraph(docMarkdown) ||
            extractFrontmatterDescription(skillMarkdown) ||
            title

          return {
            slug: skill,
            title,
            summary,
            path: `${localePrefix ? `/${localePrefix}` : ''}/skills/${category}/${skill}`,
          }
        })
        .sort((left, right) => left.title.localeCompare(right.title, 'en'))

      if (skills.length === 0) {
        return null
      }

      return {
        slug: category,
        skills,
      }
    })
    .filter(Boolean)
}

function writeGeneratedCatalog() {
  const enCatalog = buildCatalog('')
  const zhCatalog = buildCatalog('zh')

  fs.mkdirSync(generatedDir, { recursive: true })

  const output = `import type { SkillsCatalogCategory } from '../skillsCatalog.mts'

// This file is generated by docs/scripts/generate_skills_catalog.mjs.
// Do not edit it by hand.

export const SKILLS_CATALOG_EN = ${JSON.stringify(enCatalog, null, 2)} satisfies SkillsCatalogCategory[]

export const SKILLS_CATALOG_ZH = ${JSON.stringify(zhCatalog, null, 2)} satisfies SkillsCatalogCategory[]
`

  fs.writeFileSync(generatedFile, output, 'utf8')
  console.log(`Generated ${path.relative(repoRoot, generatedFile)}`)
}

writeGeneratedCatalog()
