import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'AI Skills Hub',
  description: '跨平台 AI CLI 技能与命令管理工具',

  // Ignore dead links in code block examples (document-writer template samples)
  ignoreDeadLinks: [
    /^\.\/docs\//,
    /^\.\/CONTRIBUTING/,
    /^docs\//,
    /^CONTRIBUTING/
  ],

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
                { text: 'TUI Guide', link: '/guide/tui' },
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
            }
          ],
          '/skills/': [
            {
              text: 'Skills',
              items: [
                { text: 'Overview', link: '/skills/' }
              ]
            },
            {
              text: 'Design',
              collapsed: false,
              items: [
                { text: 'article-cover', link: '/skills/article-cover' },
                { text: 'drawio', link: '/skills/drawio' },
                { text: 'excalidraw', link: '/skills/excalidraw' },
                { text: 'frontend-engineer', link: '/skills/frontend-engineer' },
                { text: 'gemini-image', link: '/skills/gemini-image' }
              ]
            },
            {
              text: 'Development',
              collapsed: false,
              items: [
                { text: 'codex', link: '/skills/codex' },
                { text: 'gemini', link: '/skills/gemini' },
                { text: 'gh-address-comments', link: '/skills/gh-address-comments' },
                { text: 'gh-bootstrap', link: '/skills/gh-bootstrap' },
                { text: 'gh-fix-ci', link: '/skills/gh-fix-ci' },
                { text: 'git-commit-cn', link: '/skills/git-commit-cn' },
                { text: 'karpathy-guidelines', link: '/skills/karpathy-guidelines' },
                { text: 'lib-slint-expert', link: '/skills/lib-slint-expert' },
                { text: 'lsp-manager', link: '/skills/lsp-manager' },
                { text: 'review-code', link: '/skills/review-code' },
                { text: 'rust-cli-tui-developer', link: '/skills/rust-cli-tui-developer' },
                { text: 'uv-expert', link: '/skills/uv-expert' },
                { text: 'vue-best-practices', link: '/skills/vue-best-practices' }
              ]
            },
            {
              text: 'Research',
              collapsed: false,
              items: [
                { text: 'paper-check', link: '/skills/paper-check' },
                { text: 'research', link: '/skills/research' },
                { text: 'xray-paper-skill', link: '/skills/xray-paper-skill' },
                { text: 'zoterosynth', link: '/skills/zoterosynth' }
              ]
            },
            {
              text: 'Documentation',
              collapsed: false,
              items: [
                { text: 'document-writer', link: '/skills/document-writer' },
                { text: 'docx', link: '/skills/docx' },
                { text: 'mermaid_expert', link: '/skills/mermaid_expert' },
                { text: 'pdf', link: '/skills/pdf' },
                { text: 'pptx', link: '/skills/pptx' },
                { text: 'spec-interview', link: '/skills/spec-interview' },
                { text: 'tech-blog', link: '/skills/tech-blog' },
                { text: 'tech-design-doc', link: '/skills/tech-design-doc' },
                { text: 'xlsx', link: '/skills/xlsx' }
              ]
            },
            {
              text: 'Academic',
              collapsed: false,
              items: [
                { text: 'academic-slides', link: '/skills/academic-slides' },
                { text: 'IEEE-writing-skills', link: '/skills/IEEE-writing-skills' },
                { text: 'latex-paper-en', link: '/skills/latex-paper-en' },
                { text: 'latex-thesis-zh', link: '/skills/latex-thesis-zh' },
                { text: 'typst-paper', link: '/skills/typst-paper' }
              ]
            },
            {
              text: 'Skill Development',
              collapsed: false,
              items: [
                { text: 'claude-expert-skill-creator', link: '/skills/claude-expert-skill-creator' },
                { text: 'github-to-skills', link: '/skills/github-to-skills' },
                { text: 'mcp-to-skill', link: '/skills/mcp-to-skill' },
                { text: 'skill-evolution-manager', link: '/skills/skill-evolution-manager' },
                { text: 'skill-manager', link: '/skills/skill-manager' },
                { text: 'skill-seekers', link: '/skills/skill-seekers' },
                { text: 'skill_optimizer', link: '/skills/skill_optimizer' }
              ]
            },
            {
              text: 'Utilities',
              collapsed: false,
              items: [
                { text: 'external-skills-tui', link: '/skills/external-skills-tui' },
                { text: 'memory-system', link: '/skills/memory-system' },
                { text: 'planning-with-files', link: '/skills/planning-with-files' },
                { text: 'yt-dlp', link: '/skills/yt-dlp' }
              ]
            }
          ],
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
                { text: 'TUI 指南', link: '/zh/guide/tui' },
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
          '/zh/skills/': [
            {
              text: '技能列表',
              items: [
                { text: '概览', link: '/zh/skills/' }
              ]
            },
            {
              text: '设计',
              collapsed: false,
              items: [
                { text: 'article-cover', link: '/zh/skills/article-cover' },
                { text: 'drawio', link: '/zh/skills/drawio' },
                { text: 'excalidraw', link: '/zh/skills/excalidraw' },
                { text: 'frontend-engineer', link: '/zh/skills/frontend-engineer' },
                { text: 'gemini-image', link: '/zh/skills/gemini-image' }
              ]
            },
            {
              text: '开发',
              collapsed: false,
              items: [
                { text: 'codex', link: '/zh/skills/codex' },
                { text: 'gemini', link: '/zh/skills/gemini' },
                { text: 'gh-address-comments', link: '/zh/skills/gh-address-comments' },
                { text: 'gh-bootstrap', link: '/zh/skills/gh-bootstrap' },
                { text: 'gh-fix-ci', link: '/zh/skills/gh-fix-ci' },
                { text: 'git-commit-cn', link: '/zh/skills/git-commit-cn' },
                { text: 'karpathy-guidelines', link: '/zh/skills/karpathy-guidelines' },
                { text: 'lib-slint-expert', link: '/zh/skills/lib-slint-expert' },
                { text: 'lsp-manager', link: '/zh/skills/lsp-manager' },
                { text: 'review-code', link: '/zh/skills/review-code' },
                { text: 'rust-cli-tui-developer', link: '/zh/skills/rust-cli-tui-developer' },
                { text: 'uv-expert', link: '/zh/skills/uv-expert' },
                { text: 'vue-best-practices', link: '/zh/skills/vue-best-practices' }
              ]
            },
            {
              text: '研究',
              collapsed: false,
              items: [
                { text: 'paper-check', link: '/zh/skills/paper-check' },
                { text: 'research', link: '/zh/skills/research' },
                { text: 'xray-paper-skill', link: '/zh/skills/xray-paper-skill' },
                { text: 'zoterosynth', link: '/zh/skills/zoterosynth' }
              ]
            },
            {
              text: '文档',
              collapsed: false,
              items: [
                { text: 'document-writer', link: '/zh/skills/document-writer' },
                { text: 'docx', link: '/zh/skills/docx' },
                { text: 'mermaid_expert', link: '/zh/skills/mermaid_expert' },
                { text: 'pdf', link: '/zh/skills/pdf' },
                { text: 'pptx', link: '/zh/skills/pptx' },
                { text: 'spec-interview', link: '/zh/skills/spec-interview' },
                { text: 'tech-blog', link: '/zh/skills/tech-blog' },
                { text: 'tech-design-doc', link: '/zh/skills/tech-design-doc' },
                { text: 'xlsx', link: '/zh/skills/xlsx' }
              ]
            },
            {
              text: '学术',
              collapsed: false,
              items: [
                { text: 'academic-slides', link: '/zh/skills/academic-slides' },
                { text: 'IEEE-writing-skills', link: '/zh/skills/IEEE-writing-skills' },
                { text: 'latex-paper-en', link: '/zh/skills/latex-paper-en' },
                { text: 'latex-thesis-zh', link: '/zh/skills/latex-thesis-zh' },
                { text: 'typst-paper', link: '/zh/skills/typst-paper' }
              ]
            },
            {
              text: '技能开发',
              collapsed: false,
              items: [
                { text: 'claude-expert-skill-creator', link: '/zh/skills/claude-expert-skill-creator' },
                { text: 'github-to-skills', link: '/zh/skills/github-to-skills' },
                { text: 'mcp-to-skill', link: '/zh/skills/mcp-to-skill' },
                { text: 'skill-evolution-manager', link: '/zh/skills/skill-evolution-manager' },
                { text: 'skill-manager', link: '/zh/skills/skill-manager' },
                { text: 'skill-seekers', link: '/zh/skills/skill-seekers' },
                { text: 'skill_optimizer', link: '/zh/skills/skill_optimizer' }
              ]
            },
            {
              text: '工具',
              collapsed: false,
              items: [
                { text: 'external-skills-tui', link: '/zh/skills/external-skills-tui' },
                { text: 'memory-system', link: '/zh/skills/memory-system' },
                { text: 'planning-with-files', link: '/zh/skills/planning-with-files' },
                { text: 'yt-dlp', link: '/zh/skills/yt-dlp' }
              ]
            }
          ],
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
