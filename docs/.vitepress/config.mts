import { defineConfig } from 'vitepress'
import { generateSidebarByDir } from './sidebar'

export default defineConfig({
  title: 'AI Skills Hub',
  description: '跨平台 AI CLI 技能与命令管理工具',

  // Ignore dead links since the documentation contains many GitHub-style relative links 
  // to reference files and external/deleted skills that aren't hosted locally in the docs
  ignoreDeadLinks: true,

  vite: {
    server: {
      fs: {
        allow: ['../..']
      }
    }
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/guide/' },
          { text: 'Skills', link: '/skills/' },
          { text: 'Agents', link: '/agents/' },
          { text: 'Commands', link: '/commands/' },
          { text: 'GitHub', link: 'https://github.com/anthropics/my-claude-skills' }
        ],
        sidebar: {
          '/guide/': [
            {
              text: 'Getting Started',
              items: [
                { text: 'Introduction', link: '/guide/' },
                { text: 'Installation', link: '/guide/installation' },
                { text: 'MCS Guide', link: '/guide/mcs' },
                { text: 'Commands', link: '/guide/commands' }
              ]
            },
            {
              text: 'Advanced',
              items: [
                { text: 'Creating Skills', link: '/guide/creating-skills' },
                { text: 'Prompts', link: '/guide/prompts' },
                { text: 'Plugins', link: '/guide/plugins' },
                { text: 'OMO Agents Tutorial', link: '/guide/omo-agents-tutorial' }
              ]
            },
          ],
          '/skills/': generateSidebarByDir('./docs/skills', '/skills/'),
          '/agents/': [
            {
              text: 'Agents',
              items: [
                { text: 'Overview', link: '/agents/' },
                { text: 'omo-agents', link: '/agents/omo-agents' },
                { text: 'sisyphus', link: '/agents/sisyphus' },
                { text: 'oracle', link: '/agents/oracle' },
                { text: 'explore', link: '/agents/explore' },
                { text: 'librarian', link: '/agents/librarian' },
                { text: 'frontend-engineer', link: '/agents/frontend-engineer' },
                { text: 'document-writer', link: '/agents/document-writer' },
                { text: 'multimodal-looker', link: '/agents/multimodal-looker' }
              ]
            }
          ],
          '/commands/': [
            {
              text: 'Commands',
              items: [
                { text: 'Overview', link: '/commands/' },
                { text: 'export-summary', link: '/commands/export-summary' },
                { text: 'import-summary', link: '/commands/import-summary' },
                { text: 'git-commit', link: '/commands/git-commit' }
              ]
            }
          ]
        }
      }
    },
    zh: {
      label: '中文',
      lang: 'zh-CN',
      link: '/zh/',
      themeConfig: {
        nav: [
          { text: '指南', link: '/zh/guide/' },
          { text: '技能', link: '/zh/skills/' },
          { text: '代理', link: '/zh/agents/' },
          { text: '命令', link: '/zh/commands/' },
          { text: 'GitHub', link: 'https://github.com/anthropics/my-claude-skills' }
        ],
        sidebar: {
          '/zh/guide/': [
            {
              text: '快速开始',
              items: [
                { text: '简介', link: '/zh/guide/' },
                { text: '安装', link: '/zh/guide/installation' },
                { text: 'MCS 指南', link: '/zh/guide/mcs' },
                { text: '命令', link: '/zh/guide/commands' }
              ]
            },
            {
              text: '进阶',
              items: [
                { text: '创建技能', link: '/zh/guide/creating-skills' },
                { text: '提示词', link: '/zh/guide/prompts' },
                { text: '插件', link: '/zh/guide/plugins' },
                { text: 'OMO Agents 教程', link: '/zh/guide/omo-agents-tutorial' }
              ]
            }
          ],
          '/zh/skills/': generateSidebarByDir('./docs/zh/skills', '/zh/skills/'),
          '/zh/agents/': [
            {
              text: '代理列表',
              items: [
                { text: '概览', link: '/zh/agents/' },
                { text: 'omo-agents', link: '/zh/agents/omo-agents' },
                { text: 'sisyphus', link: '/zh/agents/sisyphus' },
                { text: 'oracle', link: '/zh/agents/oracle' },
                { text: 'explore', link: '/zh/agents/explore' },
                { text: 'librarian', link: '/zh/agents/librarian' },
                { text: 'frontend-engineer', link: '/zh/agents/frontend-engineer' },
                { text: 'document-writer', link: '/zh/agents/document-writer' },
                { text: 'multimodal-looker', link: '/zh/agents/multimodal-looker' }
              ]
            }
          ],
          '/zh/commands/': [
            {
              text: '命令列表',
              items: [
                { text: '概览', link: '/zh/commands/' },
                { text: 'export-summary', link: '/zh/commands/export-summary' },
                { text: 'import-summary', link: '/zh/commands/import-summary' },
                { text: 'git-commit', link: '/zh/commands/git-commit' }
              ]
            }
          ]
        }
      }
    }
  },

  themeConfig: {
    logo: '/logo.svg',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/anthropics/my-claude-skills' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present'
    },
    search: {
      provider: 'local'
    }
  }
})
