import {
  getCategoryLabels,
  getSkillsCatalog,
  type SkillsCatalogLocale,
} from './skillsCatalog.mts'

export type SidebarByDirOptions = {
  sidebarTitle?: string
  overviewText?: string
  collapsed?: boolean
}

export const SIDEBAR_OPTIONS_EN: SidebarByDirOptions = {
  sidebarTitle: 'Skills',
  overviewText: 'Overview',
  collapsed: true,
}

export const SIDEBAR_OPTIONS_ZH: SidebarByDirOptions = {
  sidebarTitle: '技能',
  overviewText: '概览',
  collapsed: true,
}

export function generateSkillsSidebar(
  locale: SkillsCatalogLocale,
  basePath = '/skills/',
  options: SidebarByDirOptions = {},
) {
  const sidebarTitle = options.sidebarTitle ?? 'Skills'
  const overviewText = options.overviewText ?? 'Overview'
  const collapsed = options.collapsed ?? true
  const categoryLabels = getCategoryLabels(locale)
  const catalog = getSkillsCatalog(locale)

  const items: Array<Record<string, unknown>> = []
  items.push({ text: overviewText, link: basePath })

  for (const category of catalog) {
    const subItems = category.skills.map((skill) => ({
      text: skill.title,
      link: skill.path,
    }))

    if (subItems.length === 0) {
      continue
    }

    items.push({
      text: categoryLabels[category.slug] ?? category.slug,
      collapsed,
      items: subItems,
    })
  }

  return [{ text: sidebarTitle, items }]
}
