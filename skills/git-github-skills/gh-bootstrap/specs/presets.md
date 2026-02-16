# 预设配置定义

本文档定义 gh-bootstrap 支持的预设配置方案和组件分类。

> **设计原则**: gh-bootstrap 专注于 GitHub 生态系统（`.github/` 文件夹），不涉及项目级工具（如 ESLint、Jest、Husky 等）。

## When to Use

- **Phase 2 配置收集阶段**：展示组件选项和预设方案时参考
- **模式选择**：确定用户使用快速/自定义/全量模式
- **组件分类**：了解各组件的功能和适用场景
- **默认配置**：获取各模式下的默认组件列表
- **用户教育**：向用户解释各组件的作用

---

## ⚠️ CRITICAL: 模板使用规则

**所有组件配置必须基于模板直接复制，禁止自行编写！**

1. **直接复制**: 从 template-catalog.md 指定的仓库下载模板，原样复制内容
2. **仅替换变量**: 只修改 `{{projectName}}`、`node-version` 等明确的变量占位符
3. **禁止重写**: 不允许"参考模板后重新编写"或"根据最佳实践优化"
4. **保留结构**: 不得删除、重排或"简化"模板中的步骤

**详细规则请参考**: [template-catalog.md](template-catalog.md) 和 [04-execution.md](../phases/04-execution.md)

## 配置模式

gh-bootstrap 提供 3 种配置模式：

| 模式 | 适用场景 | 交互程度 |
|------|---------|----------|
| **🚀 快速模式** | 新手用户、快速启动 | 最少交互，智能推荐 |
| **🎯 自定义模式** | 有经验用户、特定需求 | 详细交互，逐项选择 |
| **📦 全量模式** | 企业项目、完整配置 | 确认即可，全部启用 |

---

## 组件分类

### 📁 基础设施 (Infrastructure)

> 每个项目都应该有的基础文件，帮助他人了解和使用你的项目。

| 组件 ID | 文件 | 说明 | Quick | Full |
|---------|------|------|:-----:|:----:|
| `readme` | README.md | 项目说明文档，第一印象 | ✅ | ✅ |
| `license` | LICENSE | 开源许可证，定义使用权限 | ✅ | ✅ |
| `gitignore` | .gitignore | Git 忽略规则，避免提交不必要文件 | ✅ | ✅ |
| `changelog` | CHANGELOG.md | 版本变更记录 | ⬜ | ✅ |

**教育说明**:
- **README.md**: 当别人访问你的 GitHub 仓库时，首先看到的就是这个文件。好的 README 能让人快速了解项目是什么、怎么用。
- **LICENSE**: 没有许可证的代码默认是"保留所有权利"，别人不能合法使用。MIT 是最宽松的选择。
- **.gitignore**: 防止 node_modules、.env 等文件被提交到仓库，保持仓库整洁。
- **CHANGELOG.md**: 记录每个版本的变更内容，帮助用户了解更新了什么。

---

### 🔄 CI/CD 工作流 (Workflows)

> 自动化测试、构建、部署流程，确保代码质量。

| 组件 ID | 文件 | 说明 | Quick | Full |
|---------|------|------|:-----:|:----:|
| `ci-basic` | .github/workflows/ci.yml | 基础 CI - 自动运行测试和构建 | ✅ | ✅ |
| `ci-release` | .github/workflows/release.yml | 发布工作流 - 自动发布到 npm/PyPI | ⬜ | ✅ |
| `ci-matrix` | .github/workflows/ci.yml | 多平台测试 - Windows/macOS/Linux | ⬜ | ✅ |
| `ci-deploy` | .github/workflows/deploy.yml | 部署工作流 - 自动部署到服务器/云平台 | ⬜ | ✅ |
| `pages` | .github/workflows/pages.yml | GitHub Pages - 静态站点自动部署 | ⬜ | ✅ |
| `docker-publish` | .github/workflows/docker-publish.yml | Docker 镜像 - 自动构建并推送到 Registry | ⬜ | ✅ |

**教育说明**:
- **CI (持续集成)**: 每次推送代码时，GitHub 会自动运行测试，确保新代码没有破坏现有功能。
- **发布工作流**: 当你创建 Release 时，自动将包发布到 npm 或 PyPI。
- **多平台测试**: 同时在 Windows、macOS、Linux 上测试，确保跨平台兼容性。
- **GitHub Pages**: 自动将文档或静态站点部署到 `username.github.io/repo`。
- **Docker 发布**: 自动构建 Docker 镜像并推送到 GitHub Container Registry 或 Docker Hub。

---

### 📝 协作模板 (Collaboration)

> 规范化 Issue 和 PR 提交，提高协作效率。

| 组件 ID | 文件 | 说明 | Quick | Full |
|---------|------|------|:-----:|:----:|
| `issue-templates` | .github/ISSUE_TEMPLATE/*.md | Issue 模板 - 帮助用户提交结构化问题 | ✅ | ✅ |
| `issue-config` | .github/ISSUE_TEMPLATE/config.yml | Issue 配置 - 外部链接、空白 Issue 控制 | ⬜ | ✅ |
| `pr-template` | .github/PULL_REQUEST_TEMPLATE.md | PR 模板 - 规范 Pull Request 格式 | ✅ | ✅ |
| `discussion-templates` | .github/DISCUSSION_TEMPLATE/*.yml | Discussion 模板 - 规范讨论格式 | ⬜ | ✅ |
| `labels` | .github/labels.yml | 标签系统 - 分类管理 Issue 和 PR | ✅ | ✅ |
| `labeler` | .github/labeler.yml | 自动标签 - 根据文件路径自动添加标签 | ⬜ | ✅ |
| `codeowners` | .github/CODEOWNERS | 代码所有者 - 自动分配 PR 审核人 | ⬜ | ✅ |

**教育说明**:
- **Issue 模板**: 当用户报告 Bug 时，模板会引导他们提供环境信息、复现步骤等，减少来回沟通。
- **Issue 配置**: 可以添加外部链接（如 Stack Overflow）、禁用空白 Issue 等。
- **PR 模板**: 提醒贡献者描述改动内容、关联 Issue、添加测试等。
- **Discussion 模板**: 为 GitHub Discussions 提供结构化模板，如 Q&A、Ideas 等。
- **Labels**: 用颜色标签分类 Issue（如 bug、enhancement、help wanted），方便筛选和管理。
- **Labeler**: 当 PR 修改 `src/` 目录时自动添加 `area/core` 标签，修改 `docs/` 时添加 `documentation` 标签。
- **CODEOWNERS**: 定义哪些人负责哪些目录，PR 修改相关文件时自动请求他们审核。

---

### 🔒 安全 (Security)

> 保护项目免受安全漏洞威胁。

| 组件 ID | 文件 | 说明 | Quick | Full |
|---------|------|------|:-----:|:----:|
| `dependabot` | .github/dependabot.yml | 依赖更新 - 自动检测并更新有漏洞的依赖 | ✅ | ✅ |
| `renovate` | renovate.json | Renovate - 更灵活的依赖更新工具 | ⬜ | ⬜ |
| `codeql` | .github/workflows/codeql.yml | CodeQL - GitHub 官方代码安全扫描 | ⬜ | ✅ |
| `dependency-review` | .github/workflows/dependency-review.yml | 依赖审查 - PR 中检查新依赖的安全性 | ⬜ | ✅ |
| `security-policy` | SECURITY.md | 安全政策 - 告诉用户如何报告安全漏洞 | ⬜ | ✅ |
| `secret-scanning` | (GitHub 设置) | 密钥扫描 - 检测意外提交的密钥 | ⬜ | ✅ |

**教育说明**:
- **Dependabot**: GitHub 会自动扫描你的依赖，发现有安全漏洞时创建 PR 更新到安全版本。
- **Renovate**: Dependabot 的替代品，提供更多定制选项，如更新分组、自定义时间表。
- **CodeQL**: GitHub 的代码分析引擎，能检测 SQL 注入、XSS 等常见安全漏洞。
- **依赖审查**: 在 PR 中自动检查新添加的依赖是否有已知漏洞。
- **SECURITY.md**: 告诉安全研究人员如何负责任地报告漏洞，而不是公开披露。

---

### 👥 社区健康文件 (Community Health)

> GitHub 官方支持的社区健康文件，建设健康的开源社区。

| 组件 ID | 文件 | 说明 | Quick | Full |
|---------|------|------|:-----:|:----:|
| `contributing` | CONTRIBUTING.md | 贡献指南 - 告诉贡献者如何参与项目 | ⬜ | ✅ |
| `code-of-conduct` | CODE_OF_CONDUCT.md | 行为准则 - 定义社区行为规范 | ⬜ | ✅ |
| `support` | SUPPORT.md | 支持文档 - 告诉用户如何获取帮助 | ⬜ | ✅ |
| `governance` | GOVERNANCE.md | 治理文档 - 项目决策流程和角色定义 | ⬜ | ✅ |
| `funding` | .github/FUNDING.yml | 赞助链接 - 在仓库显示赞助按钮 | ⬜ | ✅ |

**教育说明**:
- **CONTRIBUTING.md**: 说明如何设置开发环境、代码风格要求、PR 流程等，降低贡献门槛。
- **CODE_OF_CONDUCT.md**: 定义社区行为准则，营造友好包容的氛围。Contributor Covenant 是最流行的选择。
- **SUPPORT.md**: 告诉用户在哪里获取帮助：Issue、Discussions、Stack Overflow、Discord 等。
- **GOVERNANCE.md**: 说明项目如何做决策、谁有什么权限、如何成为维护者等。
- **FUNDING.yml**: 在仓库页面显示 "Sponsor" 按钮，支持 GitHub Sponsors、Open Collective、Patreon 等。

---

### 🤖 自动化 (Automation)

> 减少重复性工作，提高维护效率。

| 组件 ID | 文件 | 说明 | Quick | Full |
|---------|------|------|:-----:|:----:|
| `release-drafter` | .github/release-drafter.yml | 发布说明 - 自动生成 Release Notes | ⬜ | ✅ |
| `auto-changelog` | .github/workflows/changelog.yml | 自动变更日志 - 根据 commit 生成 CHANGELOG | ⬜ | ✅ |
| `stale` | .github/workflows/stale.yml | 过期管理 - 自动关闭长期无响应的 Issue | ⬜ | ✅ |
| `greetings` | .github/workflows/greetings.yml | 欢迎消息 - 欢迎首次贡献者 | ⬜ | ✅ |
| `auto-merge` | .github/workflows/auto-merge.yml | 自动合并 - Dependabot PR 自动合并 | ⬜ | ✅ |
| `lock` | .github/workflows/lock.yml | 锁定讨论 - 自动锁定已关闭的旧 Issue | ⬜ | ✅ |
| `auto-assign` | .github/workflows/auto-assign.yml | 自动分配 - 自动分配 PR 审核人 | ⬜ | ✅ |
| `pr-labeler` | .github/workflows/pr-labeler.yml | PR 标签 - 根据分支名/文件自动打标签 | ⬜ | ✅ |

**教育说明**:
- **release-drafter**: 根据 PR 标签自动生成发布说明，如 "### 🚀 Features" "### 🐛 Bug Fixes"。
- **auto-changelog**: 根据 Conventional Commits 自动生成 CHANGELOG.md。
- **stale**: 对 60 天无活动的 Issue 添加 "stale" 标签，再过 7 天自动关闭，保持 Issue 列表整洁。
- **greetings**: 当有人首次提交 Issue 或 PR 时，自动发送欢迎消息。
- **auto-merge**: Dependabot 的安全更新 PR 通过 CI 后自动合并，减少手动操作。
- **auto-assign**: 根据 CODEOWNERS 或配置自动分配 PR 审核人。
- **pr-labeler**: 根据分支名（如 `feature/*`）或修改的文件自动添加标签。

---

### 🔧 代码质量 (Quality)

> 保持代码风格一致，提高代码质量。

| 组件 ID | 文件 | 说明 | Quick | Full |
|---------|------|------|:-----:|:----:|
| `super-linter` | .github/workflows/lint.yml | 超级 Linter - 一次性检查多种语言 | ⬜ | ✅ |
| `codecov` | .github/workflows/codecov.yml | 测试覆盖率 - 追踪代码覆盖率变化 | ⬜ | ✅ |
| `semantic-pr` | .github/workflows/semantic-pr.yml | 语义化 PR - 检查 PR 标题是否符合规范 | ⬜ | ✅ |
| `commitlint` | .github/workflows/commitlint.yml | Commit 检查 - 检查 commit 消息格式 | ⬜ | ✅ |

**教育说明**:
- **Super-Linter**: GitHub 官方的多语言 Linter，支持 50+ 种语言和格式，一个 Action 搞定所有检查。
- **Codecov**: 在 PR 中显示测试覆盖率变化，防止覆盖率下降。
- **语义化 PR**: 确保 PR 标题符合 Conventional Commits 规范，便于自动生成 changelog。
- **Commitlint**: 检查 commit 消息是否符合规范（如 `feat:`, `fix:`, `docs:` 等）。

---

### 📊 仓库配置 (Repository Settings)

> GitHub 仓库级别的配置文件。

| 组件 ID | 文件 | 说明 | Quick | Full |
|---------|------|------|:-----:|:----:|
| `branch-protection` | (GitHub API) | 分支保护 - 要求 PR 审核、CI 通过才能合并 | ⬜ | ✅ |
| `repo-settings` | .github/settings.yml | 仓库设置 - 通过代码管理仓库配置 | ⬜ | ✅ |
| `gitattributes` | .gitattributes | Git 属性 - 定义文件处理方式 | ⬜ | ✅ |

**教育说明**:
- **分支保护**: 防止直接推送到 main 分支，要求 PR 审核和 CI 通过。
- **仓库设置**: 使用 probot/settings 应用，通过 YAML 文件管理仓库设置。
- **.gitattributes**: 定义行尾处理、二进制文件识别、语言统计等。

---

## 预设定义

### 🚀 快速模式 (Quick)

智能推荐配置，适合快速启动。

**包含组件** (共 8 个):
- 基础设施: `readme`, `license`, `gitignore`
- CI/CD: `ci-basic`
- 协作: `issue-templates`, `pr-template`, `labels`
- 安全: `dependabot`

**交互流程**:
1. 展示检测结果
2. 确认推荐配置
3. 收集必要变量（项目名、描述、作者等）
4. 执行

---

### 🎯 自定义模式 (Custom)

逐项选择，完全控制。

**交互流程**:
1. 展示检测结果
2. 分类展示所有组件（带教育说明）
3. 用户逐类选择
4. 对于选中的组件，选择参考仓库/风格
5. 收集必要变量
6. 确认并执行

---

### 📦 全量模式 (Full)

启用所有组件，适合企业级项目。

**包含组件** (共 40+ 个):

| 分类 | 组件 |
|------|------|
| 基础设施 | `readme`, `license`, `gitignore`, `changelog` |
| CI/CD | `ci-basic`, `ci-release`, `ci-matrix`, `ci-deploy`, `pages`, `docker-publish` |
| 协作 | `issue-templates`, `issue-config`, `pr-template`, `discussion-templates`, `labels`, `labeler`, `codeowners` |
| 安全 | `dependabot`, `codeql`, `dependency-review`, `security-policy` |
| 社区 | `contributing`, `code-of-conduct`, `support`, `governance`, `funding` |
| 自动化 | `release-drafter`, `auto-changelog`, `stale`, `greetings`, `auto-merge`, `lock`, `auto-assign`, `pr-labeler` |
| 代码质量 | `super-linter`, `codecov`, `semantic-pr`, `commitlint` |
| 仓库配置 | `gitattributes` |

**交互流程**:
1. 展示检测结果
2. 展示将生成的完整文件列表（40+ 个文件）
3. 收集必要变量
4. 确认执行

---

## 模板变量定义

> **重要**: 所有模板变量必须在 Phase 2 收集阶段确定，不允许留空。

### 必需变量 (Required)

| 变量名 | 说明 | 自动检测来源 | 交互收集 |
|--------|------|--------------|----------|
| `projectName` | 项目名称 | package.json > name, Cargo.toml > name | 检测失败时询问 |
| `description` | 项目描述 | package.json > description | 检测失败时询问 |
| `authorName` | 作者名称 | git config user.name | 检测失败时询问 |
| `authorEmail` | 作者邮箱 | git config user.email | 检测失败时询问 |
| `license` | 许可证类型 | package.json > license | 默认 MIT，可选择 |
| `year` | 当前年份 | 系统时间 | 自动获取 |

### 可选变量 (Optional)

| 变量名 | 说明 | 默认值 | 适用组件 |
|--------|------|--------|----------|
| `repoOwner` | 仓库所有者 | git remote 解析 | README badges |
| `repoName` | 仓库名称 | 目录名或 git remote | README badges |
| `nodeVersion` | Node.js 版本 | .nvmrc, package.json > engines | CI workflows |
| `pythonVersion` | Python 版本 | .python-version, pyproject.toml | CI workflows |
| `packageManager` | 包管理器 | 检测 lock 文件 | CI workflows |
| `mainBranch` | 主分支名 | git 检测 | 分支保护 |
| `fundingPlatforms` | 赞助平台 | 无 | FUNDING.yml |
| `socialLinks` | 社交链接 | 无 | README |

### 变量收集规则

1. **优先自动检测**: 尽可能从项目文件和 git 配置中自动获取
2. **检测失败时询问**: 无法自动检测的必需变量，通过 AskUserQuestion 收集
3. **提供默认值**: 可选变量提供合理默认值，用户可选择修改
4. **验证格式**: 对邮箱、URL 等进行格式验证

---

## 组件 → 参考仓库映射

每个组件可以有多个参考仓库供用户选择：

### issue-templates

| 仓库 | 优势 | 适用场景 |
|------|------|----------|
| stevemao/github-issue-templates | 8 种风格可选，覆盖各类需求 | 通用 |
| dec0dOS/amazing-github-template | 一站式模板，设计精美 | 开源项目 |

### ci-workflow

| 仓库 | 优势 | 适用场景 |
|------|------|----------|
| actions/starter-workflows | GitHub 官方，最新最全 | 所有项目 |

### release-drafter

| 仓库 | 优势 | 适用场景 |
|------|------|----------|
| release-drafter/release-drafter | 官方仓库，配置示例完整 | 需要自动发布说明 |

### readme

| 仓库 | 优势 | 适用场景 |
|------|------|----------|
| othneildrew/Best-README-Template | 结构完整，设计美观 | 开源项目 |

### contributing

| 仓库 | 优势 | 适用场景 |
|------|------|----------|
| nayafia/contributing-template | 简洁实用，广泛采用 | 开源项目 |

### code-of-conduct

| 仓库 | 优势 | 适用场景 |
|------|------|----------|
| EthicalSource/contributor_covenant | 行业标准，多语言支持 | 开源社区 |

### labels

| 仓库 | 优势 | 适用场景 |
|------|------|----------|
| dec0dOS/amazing-github-template | 设计精美，分类合理 | 开源项目 |

### labeler

| 仓库 | 优势 | 适用场景 |
|------|------|----------|
| actions/labeler | GitHub 官方，简单易用 | 所有项目 |

---

## AskUserQuestion 模板

### 模式选择

```json
{
  "question": "请选择配置模式",
  "header": "配置模式",
  "options": [
    {
      "label": "🚀 快速模式 (推荐新手)",
      "description": "智能推荐 8 个核心组件，只需确认即可"
    },
    {
      "label": "🎯 自定义模式",
      "description": "从 40+ 组件中逐个选择，了解每个功能的作用"
    },
    {
      "label": "📦 全量模式",
      "description": "启用所有 40+ 组件，适合企业级项目"
    }
  ],
  "multiSelect": false
}
```

### 分类组件选择（自定义模式）

```json
{
  "question": "选择 CI/CD 工作流组件\n\nℹ️ CI (持续集成) 是什么？\n每次推送代码时，GitHub 会自动运行测试，确保新代码没有破坏现有功能。",
  "header": "🔄 CI/CD",
  "options": [
    {
      "label": "基础 CI (推荐)",
      "description": "自动运行测试和构建，每次推送都会检查"
    },
    {
      "label": "发布工作流",
      "description": "创建 Release 时自动发布到 npm/PyPI"
    },
    {
      "label": "多平台测试",
      "description": "同时在 Windows/macOS/Linux 上测试"
    },
    {
      "label": "GitHub Pages",
      "description": "自动部署静态站点到 GitHub Pages"
    }
  ],
  "multiSelect": true
}
```

### 参考仓库选择

```json
{
  "question": "选择 Issue 模板的参考仓库\n\nℹ️ Issue 模板是什么？\n当用户在你的仓库创建 Issue 时，会看到预设表单，帮助他们提供结构化的 Bug 报告或功能请求。",
  "header": "📝 Issue 模板",
  "options": [
    {
      "label": "stevemao/github-issue-templates (推荐)",
      "description": "8 种风格可选：简洁、清单、对话式等，适合各类项目"
    },
    {
      "label": "dec0dOS/amazing-github-template",
      "description": "一站式模板，包含 Bug/Feature/Improvement，设计精美"
    },
    {
      "label": "使用内置默认模板",
      "description": "使用 gh-bootstrap 内置的通用模板（基于官方模板精简）"
    }
  ],
  "multiSelect": false
}
```

### 许可证选择

```json
{
  "question": "选择开源许可证\n\nℹ️ 许可证决定了别人可以如何使用你的代码。",
  "header": "📜 许可证",
  "options": [
    {
      "label": "MIT (推荐)",
      "description": "最宽松，允许任何用途，只需保留版权声明"
    },
    {
      "label": "Apache 2.0",
      "description": "类似 MIT，但包含专利授权条款"
    },
    {
      "label": "GPL 3.0",
      "description": "要求衍生作品也必须开源"
    },
    {
      "label": "BSD 3-Clause",
      "description": "类似 MIT，禁止使用作者名字做推广"
    }
  ],
  "multiSelect": false
}
```

### 赞助平台选择

```json
{
  "question": "选择赞助平台（可多选）\n\nℹ️ 在仓库页面显示 Sponsor 按钮，让支持者可以赞助你的项目。",
  "header": "💰 赞助平台",
  "options": [
    {
      "label": "GitHub Sponsors",
      "description": "GitHub 官方赞助平台，无手续费"
    },
    {
      "label": "Open Collective",
      "description": "适合团队/组织，财务透明"
    },
    {
      "label": "Patreon",
      "description": "按月订阅模式"
    },
    {
      "label": "Buy Me a Coffee",
      "description": "一次性小额赞助"
    }
  ],
  "multiSelect": true
}
```
