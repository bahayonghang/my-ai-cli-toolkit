import { defineConfig } from 'vitepress'
import {
  enCommandsSidebar,
  enHooksSidebar,
  enSkillsSidebar,
  zhCommandsSidebar,
  zhHooksSidebar,
  zhSkillsSidebar
} from './generated/catalog.mjs'

const zhNav = [
  { text: '首页', link: '/' },
  { text: 'Hooks', link: '/hooks' },
  { text: 'Commands', link: '/commands' },
  { text: 'Skills', link: '/skills' }
]

const enNav = [
  { text: 'Home', link: '/en/' },
  { text: 'Hooks', link: '/en/hooks' },
  { text: 'Commands', link: '/en/commands' },
  { text: 'Skills', link: '/en/skills' }
]

const zhGuideSidebar = [
  {
    text: '内容指南',
    items: [
      { text: '概览', link: '/' },
      { text: 'Hooks', link: '/hooks' },
      { text: 'Commands', link: '/commands' },
      { text: 'Skills', link: '/skills' }
    ]
  }
]

const enGuideSidebar = [
  {
    text: 'Content Guide',
    items: [
      { text: 'Overview', link: '/en/' },
      { text: 'Hooks', link: '/en/hooks' },
      { text: 'Commands', link: '/en/commands' },
      { text: 'Skills', link: '/en/skills' }
    ]
  }
]

const zhSidebar = {
  '/skills/': zhSkillsSidebar,
  '/skills': zhSkillsSidebar,
  '/hooks': zhHooksSidebar,
  '/commands': zhCommandsSidebar,
  '/': zhGuideSidebar
}

const enSidebar = {
  '/en/skills/': enSkillsSidebar,
  '/en/skills': enSkillsSidebar,
  '/en/hooks': enHooksSidebar,
  '/en/commands': enCommandsSidebar,
  '/en/': enGuideSidebar
}

export default defineConfig({
  title: 'My Claude Code Settings',
  description: 'Installable skills, platform prompts, commands, agents, rules, and runtime hooks.',
  cleanUrls: true,
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      description: '跨平台 AI 内容仓库：skills、平台提示和运行时 hooks。',
      themeConfig: {
        nav: zhNav,
        sidebar: zhSidebar,
        outline: { label: '本页目录' },
        docFooter: { prev: '上一页', next: '下一页' },
        darkModeSwitchLabel: '外观',
        sidebarMenuLabel: '菜单',
        returnToTopLabel: '返回顶部',
        langMenuLabel: '切换语言'
      }
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      description: 'Cross-platform AI content repository for skills, platform prompts, and runtime hooks.',
      themeConfig: {
        nav: enNav,
        sidebar: enSidebar
      }
    }
  },
  themeConfig: {
    search: {
      provider: 'local'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/bahayonghang/my-claude-code-settings' }
    ]
  }
})
