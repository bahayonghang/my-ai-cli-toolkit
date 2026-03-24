import { defineConfig } from 'vitepress'
import { generateSidebarByDir } from './sidebar'

export default defineConfig({
  title: 'My Claude Code Settings',
  description: 'Cross-platform AI skills, commands, runtime files, and MCS documentation.',
  ignoreDeadLinks: true,

  vite: {
    server: {
      fs: {
        allow: ['../..'],
      },
    },
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
          { text: 'GitHub', link: 'https://github.com/bahayonghang/my-claude-code-settings' },
        ],
        sidebar: {
          '/guide/': [
            {
              text: 'Getting Started',
              items: [
                { text: 'Introduction', link: '/guide/' },
                { text: 'Installation', link: '/guide/installation' },
                { text: 'MCS TUI', link: '/guide/mcs' },
                { text: 'MCS Web', link: '/guide/mcs-web' },
                { text: 'MCS Architecture', link: '/guide/mcs-architecture' },
              ],
            },
            {
              text: 'Repository Content',
              items: [
                { text: 'Commands', link: '/guide/commands' },
                { text: 'Runtime Files', link: '/guide/runtime-files' },
                { text: 'External Skills', link: '/guide/community-skills-registry' },
              ],
            },
            {
              text: 'Authoring',
              items: [
                { text: 'Creating Skills', link: '/guide/creating-skills' },
              ],
            },
            {
              text: 'Legacy',
              items: [
                { text: 'TUI Alias', link: '/guide/tui' },
                { text: 'Prompts (Legacy)', link: '/guide/prompts' },
                { text: 'Plugins (Legacy)', link: '/guide/plugins' },
                { text: 'OMO Agents Tutorial (Legacy)', link: '/guide/omo-agents-tutorial' },
              ],
            },
          ],
          '/skills/': generateSidebarByDir('docs/skills', '/skills/'),
          '/agents/': [
            {
              text: 'Agents',
              items: [
                { text: 'Overview', link: '/agents/' },
                { text: 'CCW Family', link: '/agents/ccw' },
                { text: 'Specialist Family', link: '/agents/specialist' },
              ],
            },
          ],
          '/commands/': [
            {
              text: 'Commands',
              items: [
                { text: 'Overview', link: '/commands/' },
                { text: 'Catalog', link: '/commands/catalog' },
              ],
            },
            {
              text: 'Command Families',
              items: [
                { text: 'cc (Authoring)', link: '/commands/cc' },
                { text: 'cli (CLI Tools)', link: '/commands/cli' },
                { text: 'gh (Git & GitHub)', link: '/commands/gh' },
                { text: 'issue (Issue Management)', link: '/commands/issue' },
                { text: 'kiro (Kiro Integration)', link: '/commands/kiro' },
                { text: 'memory (Memory System)', link: '/commands/memory' },
                { text: 'task (Task Management)', link: '/commands/task' },
                { text: 'workflow (Workflows)', link: '/commands/workflow' },
                { text: 'zcf (Git Utilities)', link: '/commands/zcf' },
                { text: 'Utilities', link: '/commands/utilities' },
              ],
            },
            {
              text: 'Standalone',
              items: [
                { text: 'export-summary', link: '/commands/export-summary' },
                { text: 'import-summary', link: '/commands/import-summary' },
              ],
            },
          ],
        },
      },
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
          { text: 'GitHub', link: 'https://github.com/bahayonghang/my-claude-code-settings' },
        ],
        sidebar: {
          '/zh/guide/': [
            {
              text: '快速开始',
              items: [
                { text: '简介', link: '/zh/guide/' },
                { text: '安装', link: '/zh/guide/installation' },
                { text: 'MCS TUI', link: '/zh/guide/mcs' },
                { text: 'MCS Web', link: '/zh/guide/mcs-web' },
                { text: 'MCS 架构', link: '/zh/guide/mcs-architecture' },
              ],
            },
            {
              text: '仓库内容',
              items: [
                { text: '命令系统', link: '/zh/guide/commands' },
                { text: '运行时文件', link: '/zh/guide/runtime-files' },
                { text: '外部技能', link: '/zh/guide/community-skills-registry' },
              ],
            },
            {
              text: '作者指南',
              items: [
                { text: '创建技能', link: '/zh/guide/creating-skills' },
              ],
            },
            {
              text: '兼容与历史',
              items: [
                { text: 'TUI 别名', link: '/zh/guide/tui' },
                { text: '提示词（旧说明）', link: '/zh/guide/prompts' },
                { text: '插件（旧说明）', link: '/zh/guide/plugins' },
                { text: 'OMO Agents 教程（旧说明）', link: '/zh/guide/omo-agents-tutorial' },
              ],
            },
          ],
          '/zh/skills/': generateSidebarByDir('docs/zh/skills', '/zh/skills/'),
          '/zh/agents/': [
            {
              text: '代理',
              items: [
                { text: '概览', link: '/zh/agents/' },
                { text: 'CCW 家族', link: '/zh/agents/ccw' },
                { text: 'Specialist 家族', link: '/zh/agents/specialist' },
              ],
            },
          ],
          '/zh/commands/': [
            {
              text: '命令',
              items: [
                { text: '概览', link: '/zh/commands/' },
                { text: '目录', link: '/zh/commands/catalog' },
              ],
            },
            {
              text: '命令家族',
              items: [
                { text: 'cc（命令创建）', link: '/zh/commands/cc' },
                { text: 'cli（CLI 工具）', link: '/zh/commands/cli' },
                { text: 'gh（Git & GitHub）', link: '/zh/commands/gh' },
                { text: 'issue（Issue 管理）', link: '/zh/commands/issue' },
                { text: 'kiro（Kiro 集成）', link: '/zh/commands/kiro' },
                { text: 'memory（记忆系统）', link: '/zh/commands/memory' },
                { text: 'task（任务管理）', link: '/zh/commands/task' },
                { text: 'workflow（工作流）', link: '/zh/commands/workflow' },
                { text: 'zcf（Git 工具集）', link: '/zh/commands/zcf' },
                { text: '工具命令', link: '/zh/commands/utilities' },
              ],
            },
            {
              text: '独立命令',
              items: [
                { text: 'export-summary', link: '/zh/commands/export-summary' },
                { text: 'import-summary', link: '/zh/commands/import-summary' },
              ],
            },
          ],
        },
      },
    },
  },

  themeConfig: {
    logo: '/logo.svg',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/bahayonghang/my-claude-code-settings' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present',
    },
    search: {
      provider: 'local',
    },
  },
})
