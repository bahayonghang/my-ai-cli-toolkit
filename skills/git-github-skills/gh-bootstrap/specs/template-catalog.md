# gh-bootstrap 模板目录

> 本文档汇总了 gh-bootstrap Skill 所引用的所有 GitHub 仓库，并提供**精确的文件路径映射**。
>
> **⚠️ CRITICAL**: Claude 必须根据此文档下载和读取模板文件，禁止凭记忆生成配置。

## When to Use

- **Phase 4 执行阶段**：下载模板前必须先读取此文档
- **组件映射**：查找组件 ID 对应的仓库和文件路径
- **Clone 命令**：获取正确的 git clone 命令
- **文件路径**：确定需要读取的模板文件精确路径
- **语言映射**：根据检测到的语言选择对应的模板文件

---

## ⚠️ CRITICAL: 模板使用规则

**禁止自行编写工作流！必须遵循以下规则：**

1. **直接复制模板**: 从下载的模板文件中**原样复制**内容，仅替换变量占位符
2. **禁止重新编写**: 不允许"参考模板后重新编写"，必须基于模板原文修改
3. **最小化修改**: 只修改必要的项目特定变量（如项目名、Node 版本等）
4. **保留模板结构**: 不得删除、重排或"优化"模板中的步骤

**正确做法**:
```
Read 模板文件 → 复制全部内容 → 仅替换 {{变量}} → Write 到目标
```

**错误做法**:
```
Read 模板文件 → 理解意图 → 自己重新编写 → Write 到目标  ❌
```

---

## 组件 → 仓库 → 文件路径映射

### 快速索引

| 组件 ID | 仓库 | 主要文件 | 优势 |
|---------|------|----------|------|
| `ci-workflow` | actions/starter-workflows | `ci/{language}.yml` | GitHub 官方，最新最全 |
| `issue-templates` | stevemao/github-issue-templates | `{style}/ISSUE_TEMPLATE.md` | 8 种风格可选 |
| `issue-config` | dec0dOS/amazing-github-template | `.github/ISSUE_TEMPLATE/config.yml` | 配置外部链接 |
| `pr-template` | stevemao/github-issue-templates | `{style}/PULL_REQUEST_TEMPLATE.md` | 配套 Issue 模板 |
| `discussion-templates` | (内置) | 无需下载 | YAML 表单格式 |
| `dependabot` | (内置) | 无需下载 | 简单配置 |
| `release-drafter` | release-drafter/release-drafter | `.github/release-drafter.yml` | 官方示例 |
| `codeql` | actions/starter-workflows | `code-scanning/codeql.yml` | GitHub 官方 |
| `dependency-review` | actions/starter-workflows | `code-scanning/dependency-review.yml` | GitHub 官方 |
| `readme` | othneildrew/Best-README-Template | `README.md` | 结构完整，设计美观 |
| `contributing` | nayafia/contributing-template | `CONTRIBUTING-template.md` | 简洁实用，广泛采用 |
| `code-of-conduct` | EthicalSource/contributor_covenant | `content/version/2/1/code_of_conduct.md` | 行业标准 |
| `security-policy` | (内置) | 无需下载 | 简单模板 |
| `support` | (内置) | 无需下载 | 简单模板 |
| `governance` | (内置) | 无需下载 | 简单模板 |
| `funding` | (内置) | 无需下载 | 简单 YAML |
| `labels` | dec0dOS/amazing-github-template | `.github/labels.yml` | 设计精美 |
| `labeler` | actions/labeler | `.github/labeler.yml` | GitHub 官方 |
| `stale` | actions/starter-workflows | `automation/stale.yml` | GitHub 官方 |
| `greetings` | actions/starter-workflows | `automation/greetings.yml` | GitHub 官方 |
| `auto-merge` | (内置) | 无需下载 | 简单工作流 |
| `lock` | dec0dOS/amazing-github-template | `.github/workflows/lock.yml` | 锁定旧 Issue |
| `auto-assign` | (内置) | 无需下载 | 简单工作流 |
| `pr-labeler` | dec0dOS/amazing-github-template | `.github/workflows/pr-labels.yml` | PR 自动标签 |
| `pages` | actions/starter-workflows | `pages/{framework}.yml` | GitHub 官方 |
| `docker-publish` | actions/starter-workflows | `ci/docker-publish.yml` | GitHub 官方 |
| `codecov` | (内置) | 无需下载 | 简单配置 |
| `semantic-pr` | amannn/action-semantic-pull-request | `action.yml` | 语义化 PR |
| `commitlint` | conventional-changelog/commitlint | `.commitlintrc.js` | Commit 检查 |
| `gitattributes` | gitattributes/gitattributes | `*.gitattributes` | 按语言选择 |
| `auto-changelog` | (内置) | 无需下载 | 简单工作流 |
| `all-in-one` | dec0dOS/amazing-github-template | `.github/**/*` | 一站式解决方案 |

---

## 1. CI/CD 工作流 (ci-workflow)

### 仓库: [actions/starter-workflows](https://github.com/actions/starter-workflows)

**⭐ 为什么选择这个仓库？**
- **GitHub 官方维护**: 由 GitHub Actions 团队维护，保证与 GitHub 平台的最佳兼容性
- **覆盖全面**: 支持 50+ 种语言和框架的 CI/CD 工作流
- **持续更新**: 紧跟最新的 GitHub Actions 功能和最佳实践
- **生产就绪**: 被数百万仓库使用，经过充分验证

**ℹ️ CI/CD 是什么？**
> CI (持续集成) 是一种软件开发实践，每次代码推送时自动运行测试和构建，确保新代码不会破坏现有功能。CD (持续部署) 则是自动将通过测试的代码部署到生产环境。

**Clone 命令**:
```bash
git clone --depth 1 https://github.com/actions/starter-workflows .gh-bootstrap-cache/ci-workflow
```

**目录结构**:
```
ci/                          # CI 工作流
├── node.js.yml              # Node.js
├── python-app.yml           # Python
├── go.yml                   # Go
├── rust.yml                 # Rust
├── java-with-maven.yml      # Java (Maven)
├── java-with-gradle.yml     # Java (Gradle)
├── dotnet.yml               # .NET
├── ruby.yml                 # Ruby
├── php.yml                  # PHP
├── swift.yml                # Swift
├── cmake-*.yml              # C/C++ (CMake)
└── ...

automation/                  # 自动化工作流
├── greetings.yml            # 首次贡献欢迎
├── label.yml                # 自动标签
├── stale.yml                # 过期 Issue 管理
├── manual.yml               # 手动触发
└── summary.yml              # 摘要生成

code-scanning/               # 安全扫描
├── codeql.yml               # CodeQL 分析
├── eslint.yml               # ESLint
├── bandit.yml               # Python 安全
├── trivy.yml                # 容器扫描
├── dependency-review.yml    # 依赖审查
└── ...

deployments/                 # 部署工作流
├── aws.yml                  # AWS
├── azure-*.yml              # Azure 系列
├── google-*.yml             # Google Cloud
├── terraform.yml            # Terraform
└── ...

pages/                       # GitHub Pages
├── nextjs.yml               # Next.js
├── nuxtjs.yml               # Nuxt.js
├── astro.yml                # Astro
├── gatsby.yml               # Gatsby
├── hugo.yml                 # Hugo
├── jekyll.yml               # Jekyll
└── static.yml               # 静态站点
```

**语言 → 文件映射**:
| 检测到的语言 | 读取文件 |
|-------------|----------|
| JavaScript/TypeScript | `ci/node.js.yml` |
| Python | `ci/python-app.yml` |
| Go | `ci/go.yml` |
| Rust | `ci/rust.yml` |
| Java (Maven) | `ci/java-with-maven.yml` |
| Java (Gradle) | `ci/java-with-gradle.yml` |
| .NET/C# | `ci/dotnet.yml` |
| Ruby | `ci/ruby.yml` |
| PHP | `ci/php.yml` |

---

## 2. Issue 模板 (issue-templates)

### 仓库: [stevemao/github-issue-templates](https://github.com/stevemao/github-issue-templates)

**⭐ 为什么选择这个仓库？**
- **8 种风格可选**: 从简洁到详细，满足不同项目需求
- **配套 PR 模板**: 每种风格都有对应的 PR 模板
- **广泛采用**: 被众多知名开源项目使用
- **易于定制**: 结构清晰，方便根据项目需求修改

**ℹ️ Issue 模板是什么？**
> 当用户在你的仓库创建 Issue 时，会看到预设的表单，引导他们提供环境信息、复现步骤等结构化信息。这能大大减少来回沟通的时间，提高问题解决效率。

**Clone 命令**:
```bash
git clone --depth 1 https://github.com/stevemao/github-issue-templates .gh-bootstrap-cache/issue-templates
```

**目录结构**:
```
simple/                      # 简洁风格
├── ISSUE_TEMPLATE.md
└── PULL_REQUEST_TEMPLATE.md

checklist/                   # 清单风格
├── ISSUE_TEMPLATE.md
└── PULL_REQUEST_TEMPLATE.md

bugs-only/                   # 仅 Bug 报告
├── ISSUE_TEMPLATE.md
└── PULL_REQUEST_TEMPLATE.md

conversational/              # 对话风格
├── ISSUE_TEMPLATE.md
└── PULL_REQUEST_TEMPLATE.md

emoji-guide/                 # Emoji 指南
├── ISSUE_TEMPLATE.md
└── PULL_REQUEST_TEMPLATE.md

no-duplicates/               # 防重复
├── ISSUE_TEMPLATE.md
└── PULL_REQUEST_TEMPLATE.md

questions-answers/           # Q&A 风格
├── ISSUE_TEMPLATE.md
└── PULL_REQUEST_TEMPLATE.md

system/                      # 系统信息
├── ISSUE_TEMPLATE.md
└── PULL_REQUEST_TEMPLATE.md
```

**风格选择建议**:
| 项目类型 | 推荐风格 | 读取目录 | 说明 |
|---------|---------|----------|------|
| 开源库 | checklist | `checklist/` | 清单式引导，确保信息完整 |
| 应用程序 | bugs-only | `bugs-only/` | 专注 Bug 报告，简化流程 |
| 简单项目 | simple | `simple/` | 最少干扰，快速提交 |
| 社区项目 | conversational | `conversational/` | 友好语气，降低门槛 |

---

## 3. 一站式模板 (all-in-one)

### 仓库: [dec0dOS/amazing-github-template](https://github.com/dec0dOS/amazing-github-template)

**⭐ 为什么选择这个仓库？**
- **一站式解决方案**: 包含 Issue 模板、PR 模板、Labels、工作流等全套配置
- **设计精美**: 视觉效果出色，专业感强
- **开箱即用**: 无需逐个配置，一次性获得完整配置
- **持续维护**: 活跃更新，跟进最新实践

**ℹ️ 适用场景**
> 如果你想快速获得一套完整的 GitHub 仓库配置，而不想逐个选择每个组件，这个仓库是最佳选择。特别适合新建的开源项目。

**Clone 命令**:
```bash
git clone --depth 1 https://github.com/dec0dOS/amazing-github-template .gh-bootstrap-cache/all-in-one
```

**目录结构**:
```
.github/
├── ISSUE_TEMPLATE/
│   ├── 01_BUG_REPORT.md
│   ├── 02_FEATURE_REQUEST.md
│   ├── 03_CODEBASE_IMPROVEMENT.md
│   └── config.yml
├── workflows/
│   ├── build.yml
│   ├── labels.yml
│   ├── lint.yml
│   ├── lock.yml
│   ├── pr-labels.yml
│   └── stale.yml
├── PULL_REQUEST_TEMPLATE.md
└── labels.yml
```

**组件 → 文件映射**:
| 组件 | 读取文件 |
|------|----------|
| Issue 模板 | `.github/ISSUE_TEMPLATE/*.md` |
| PR 模板 | `.github/PULL_REQUEST_TEMPLATE.md` |
| 标签配置 | `.github/labels.yml` |
| 工作流 | `.github/workflows/*.yml` |

---

## 4. Release 管理 (release-drafter)

### 仓库: [release-drafter/release-drafter](https://github.com/release-drafter/release-drafter)

**⭐ 为什么选择这个仓库？**
- **官方仓库**: 由 release-drafter 维护者提供的官方配置示例
- **自动化发布说明**: 根据 PR 标签自动生成分类的发布说明
- **高度可定制**: 支持自定义分类、版本号规则、模板格式
- **广泛采用**: 被 GitHub、Microsoft 等大型组织使用

**ℹ️ Release Drafter 是什么？**
> 每次合并 PR 时，release-drafter 会自动更新草稿发布说明。当你准备发布新版本时，发布说明已经自动生成好了，包含所有新功能、Bug 修复等分类信息。

**Clone 命令**:
```bash
git clone --depth 1 https://github.com/release-drafter/release-drafter .gh-bootstrap-cache/release-drafter
```

**关键文件**:
```
.github/
├── release-drafter.yml      # ⭐ 配置示例
├── dependabot.yml           # Dependabot 配置示例
└── workflows/
    └── release-drafter.yml  # 工作流示例

action.yml                   # Action 定义
```

**必读文件**: `.github/release-drafter.yml`

---

## 5. README 模板 (readme)

### 仓库: [othneildrew/Best-README-Template](https://github.com/othneildrew/Best-README-Template)

**⭐ 为什么选择这个仓库？**
- **结构完整**: 包含项目介绍、安装、使用、贡献等所有必要章节
- **设计美观**: 使用徽章、截图、表格等元素，视觉效果专业
- **GitHub 高星**: 10k+ stars，被广泛认可
- **易于定制**: 清晰的占位符，方便替换为项目信息

**ℹ️ 为什么 README 很重要？**
> README 是访问者看到的第一个文件，决定了他们对项目的第一印象。好的 README 能让人快速了解项目是什么、怎么用、如何贡献。

**Clone 命令**:
```bash
git clone --depth 1 https://github.com/othneildrew/Best-README-Template .gh-bootstrap-cache/readme
```

**关键文件**:
```
README.md                    # ⭐ 完整模板
BLANK_README.md              # 空白模板
.github/
└── ISSUE_TEMPLATE/
    ├── bug-report---.md
    └── feature-request---.md
images/                      # 示例图片
```

**必读文件**: `README.md` 或 `BLANK_README.md`

---

## 6. CONTRIBUTING 模板 (contributing)

### 仓库: [nayafia/contributing-template](https://github.com/nayafia/contributing-template)

**⭐ 为什么选择这个仓库？**
- **简洁实用**: 不冗长，覆盖所有必要信息
- **广泛采用**: 被众多知名开源项目使用
- **CC0 许可**: 可自由使用和修改
- **作者权威**: 由 GitHub 开源社区专家 Nadia Eghbal 创建

**ℹ️ CONTRIBUTING.md 是什么？**
> 贡献指南告诉潜在贡献者如何参与项目：如何设置开发环境、代码风格要求、PR 流程等。好的贡献指南能降低贡献门槛，吸引更多贡献者。

**Clone 命令**:
```bash
git clone --depth 1 https://github.com/nayafia/contributing-template .gh-bootstrap-cache/contributing
```

**关键文件**:
```
CONTRIBUTING-template.md     # ⭐ 主模板
LICENSE                      # CC0 许可证
README.md                    # 说明文档
```

**必读文件**: `CONTRIBUTING-template.md`

---

## 7. Code of Conduct (code-of-conduct)

### 仓库: [EthicalSource/contributor_covenant](https://github.com/EthicalSource/contributor_covenant)

**⭐ 为什么选择这个仓库？**
- **行业标准**: 被 Linux、Ruby、Rails 等顶级项目采用
- **多语言支持**: 提供 40+ 种语言翻译
- **版本化管理**: 清晰的版本历史，方便引用
- **法律审查**: 经过法律专家审查，措辞严谨

**ℹ️ 行为准则是什么？**
> 行为准则定义了社区成员应该如何互动，什么行为是可接受的，什么是不可接受的。它帮助营造友好、包容的社区氛围，让所有人都感到受欢迎。

**Clone 命令**:
```bash
git clone --depth 1 https://github.com/EthicalSource/contributor_covenant .gh-bootstrap-cache/code-of-conduct
```

**关键文件**:
```
content/
├── version/                 # 版本化的行为准则
│   ├── 2/
│   │   ├── 1/
│   │   │   └── code_of_conduct.md  # ⭐ 最新版本 2.1
│   │   └── 0/
│   │       └── code_of_conduct.md
│   └── 1/
│       └── 4/
│           └── code_of_conduct.md
└── translations.html        # 翻译列表
```

**必读文件**: `content/version/2/1/code_of_conduct.md`

---

## 8. Super Linter (super-linter)

### 仓库: [super-linter/super-linter](https://github.com/super-linter/super-linter)

**⭐ 为什么选择这个仓库？**
- **GitHub 官方**: 由 GitHub 维护的官方 Linter 工具
- **支持 50+ 语言**: 一个 Action 检查所有语言
- **开箱即用**: 自动检测项目语言，无需配置
- **可定制**: 支持自定义规则和配置文件

**ℹ️ Linter 是什么？**
> Linter 是代码静态分析工具，检查代码风格、潜在错误、最佳实践等。Super-Linter 能一次性检查项目中所有语言的代码，确保代码质量一致。

**Clone 命令**:
```bash
git clone --depth 1 https://github.com/super-linter/super-linter .gh-bootstrap-cache/super-linter
```

**关键文件**:
```
action.yml                   # ⭐ Action 定义
TEMPLATES/                   # Linter 配置模板
├── .eslintrc.yml
├── .prettierrc.json
├── .stylelintrc.json
└── ...
```

**必读文件**: `action.yml`, `TEMPLATES/` 目录

---

## 9. Renovate (renovate)

### 仓库: [renovatebot/renovate](https://github.com/renovatebot/renovate)

**⭐ 为什么选择这个仓库？**
- **功能强大**: 比 Dependabot 更灵活的依赖更新工具
- **高度可定制**: 支持复杂的更新策略和分组规则
- **多平台支持**: 支持 GitHub、GitLab、Bitbucket 等
- **自动合并**: 支持自动合并低风险更新

**ℹ️ Renovate vs Dependabot**
> Renovate 是 Dependabot 的替代品，提供更多定制选项。如果你需要更精细的控制（如更新分组、自定义时间表），Renovate 是更好的选择。

**Clone 命令**:
```bash
git clone --depth 1 https://github.com/renovatebot/renovate .gh-bootstrap-cache/renovate
```

**关键文件**:
```
renovate.json                # ⭐ 自身配置示例
docs/                        # 文档
```

**必读文件**: `renovate.json`

---

## 10. 内置配置 (无需下载)

以下组件使用内置配置，无需下载外部仓库：

### Dependabot

**ℹ️ Dependabot 是什么？**
> GitHub 内置的依赖更新工具，自动扫描项目依赖，发现有安全漏洞或新版本时创建 PR 更新。

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"  # 根据检测到的语言调整
    directory: "/"
    schedule:
      interval: "weekly"
```

### .gitignore

使用 [gitignore.io](https://gitignore.io) API 或 GitHub 内置模板。

### Security Policy (security-policy)

**ℹ️ SECURITY.md 是什么？**
> 告诉安全研究人员如何负责任地报告漏洞，而不是公开披露。

**内置模板** (直接复制使用):
```markdown
# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| x.x.x   | :white_check_mark: |
| < x.x   | :x:                |

## Reporting a Vulnerability

Please report security vulnerabilities to [security@example.com](mailto:security@example.com).

We will respond within 48 hours and work with you to understand and address the issue.

Please do not disclose the vulnerability publicly until we have had a chance to address it.
```

### Support (support)

**ℹ️ SUPPORT.md 是什么？**
> 告诉用户在哪里获取帮助：Issue、Discussions、Stack Overflow、Discord 等。

**内置模板** (直接复制使用):
```markdown
# Support

## How to Get Help

- **Bug Reports**: [Open an issue](../../issues/new?template=bug_report.md)
- **Feature Requests**: [Open an issue](../../issues/new?template=feature_request.md)
- **Questions**: [Start a discussion](../../discussions/new?category=q-a)
- **Documentation**: [Read the docs](./docs/)

## Community

- [Discord](https://discord.gg/xxx)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/xxx)
```

### Governance (governance)

**ℹ️ GOVERNANCE.md 是什么？**
> 说明项目如何做决策、谁有什么权限、如何成为维护者等。

**内置模板** (直接复制使用):
```markdown
# Governance

## Project Roles

### Maintainers
- Review and merge pull requests
- Manage releases
- Make architectural decisions

### Contributors
- Submit pull requests
- Report issues
- Participate in discussions

## Decision Making

Major decisions are made through:
1. Discussion in GitHub Issues/Discussions
2. RFC process for significant changes
3. Maintainer consensus

## Becoming a Maintainer

Contributors who have made significant contributions may be invited to become maintainers.
```

### Funding (funding)

**ℹ️ FUNDING.yml 是什么？**
> 在仓库页面显示 "Sponsor" 按钮，支持 GitHub Sponsors、Open Collective、Patreon 等。

**内置模板** (直接复制使用):
```yaml
# .github/FUNDING.yml
github: [username]
# patreon: username
# open_collective: project-name
# ko_fi: username
# custom: ["https://example.com/donate"]
```

### Discussion Templates (discussion-templates)

**ℹ️ Discussion 模板是什么？**
> 为 GitHub Discussions 提供结构化模板，如 Q&A、Ideas 等。

**内置模板** (直接复制使用):

Q&A 模板 (`.github/DISCUSSION_TEMPLATE/q-a.yml`):
```yaml
title: "[Q&A] "
labels: ["question"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for asking a question!
  - type: textarea
    id: question
    attributes:
      label: Question
      description: What would you like to know?
    validations:
      required: true
  - type: textarea
    id: context
    attributes:
      label: Additional context
      description: Any additional information that might help us answer your question.
```

Ideas 模板 (`.github/DISCUSSION_TEMPLATE/ideas.yml`):
```yaml
title: "[Idea] "
labels: ["enhancement"]
body:
  - type: textarea
    id: idea
    attributes:
      label: Idea Description
      description: Describe your idea
    validations:
      required: true
  - type: textarea
    id: motivation
    attributes:
      label: Motivation
      description: Why would this be useful?
```

### Auto-merge (auto-merge)

**ℹ️ Auto-merge 是什么？**
> Dependabot 的安全更新 PR 通过 CI 后自动合并，减少手动操作。

**内置模板** (直接复制使用):
```yaml
# .github/workflows/auto-merge.yml
name: Auto-merge Dependabot PRs

on: pull_request

permissions:
  contents: write
  pull-requests: write

jobs:
  dependabot:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - name: Dependabot metadata
        id: metadata
        uses: dependabot/fetch-metadata@v2
        with:
          github-token: "${{ secrets.GITHUB_TOKEN }}"

      - name: Enable auto-merge for Dependabot PRs
        if: steps.metadata.outputs.update-type == 'version-update:semver-patch' || steps.metadata.outputs.update-type == 'version-update:semver-minor'
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Auto-assign (auto-assign)

**ℹ️ Auto-assign 是什么？**
> 根据 CODEOWNERS 或配置自动分配 PR 审核人。

**内置模板** (直接复制使用):
```yaml
# .github/workflows/auto-assign.yml
name: Auto Assign

on:
  pull_request:
    types: [opened, ready_for_review]

permissions:
  pull-requests: write

jobs:
  assign:
    runs-on: ubuntu-latest
    steps:
      - uses: kentaro-m/auto-assign-action@v2.0.0
        with:
          configuration-path: '.github/auto-assign.yml'
```

配置文件 (`.github/auto-assign.yml`):
```yaml
addReviewers: true
addAssignees: author
reviewers:
  - reviewer1
  - reviewer2
numberOfReviewers: 1
```

### Auto-changelog (auto-changelog)

**ℹ️ Auto-changelog 是什么？**
> 根据 Conventional Commits 自动生成 CHANGELOG.md。

**内置模板** (直接复制使用):
```yaml
# .github/workflows/changelog.yml
name: Changelog

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write

jobs:
  changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate changelog
        uses: orhun/git-cliff-action@v3
        with:
          config: cliff.toml
          args: --verbose
        env:
          OUTPUT: CHANGELOG.md

      - name: Commit changelog
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "docs: update changelog"
          file_pattern: CHANGELOG.md
```

### Codecov (codecov)

**ℹ️ Codecov 是什么？**
> 在 PR 中显示测试覆盖率变化，防止覆盖率下降。

**内置模板** (直接复制使用):

工作流 (添加到 CI 工作流中):
```yaml
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
          fail_ci_if_error: true
```

配置文件 (`codecov.yml`):
```yaml
coverage:
  status:
    project:
      default:
        target: auto
        threshold: 1%
    patch:
      default:
        target: auto
        threshold: 1%

comment:
  layout: "reach,diff,flags,files"
  behavior: default
  require_changes: true
```

---

## 11. GitHub Pages (pages)

### 仓库: [actions/starter-workflows](https://github.com/actions/starter-workflows) - pages/ 目录

**⭐ 为什么选择这个仓库？**
- **GitHub 官方维护**: 与 GitHub Pages 服务完美集成
- **框架覆盖全面**: 支持 Next.js、Nuxt、Astro、Hugo、Jekyll 等主流框架
- **开箱即用**: 自动检测框架，无需手动配置

**ℹ️ GitHub Pages 是什么？**
> 免费的静态站点托管服务，自动将你的文档或网站部署到 `username.github.io/repo`。

**Clone 命令**:
```bash
git clone --depth 1 https://github.com/actions/starter-workflows .gh-bootstrap-cache/pages
```

**目录结构**:
```
pages/
├── nextjs.yml               # Next.js
├── nuxtjs.yml               # Nuxt.js
├── astro.yml                # Astro
├── gatsby.yml               # Gatsby
├── hugo.yml                 # Hugo
├── jekyll.yml               # Jekyll
├── mdbook.yml               # mdBook (Rust)
├── static.yml               # 纯静态站点
└── ...
```

**框架 → 文件映射**:
| 检测到的框架 | 读取文件 |
|-------------|----------|
| Next.js | `pages/nextjs.yml` |
| Nuxt.js | `pages/nuxtjs.yml` |
| Astro | `pages/astro.yml` |
| Gatsby | `pages/gatsby.yml` |
| Hugo | `pages/hugo.yml` |
| Jekyll | `pages/jekyll.yml` |
| 纯静态 | `pages/static.yml` |

**必读文件**: 根据检测到的框架选择对应的 `.yml` 文件

---

## 12. Docker Publish (docker-publish)

### 仓库: [actions/starter-workflows](https://github.com/actions/starter-workflows) - ci/docker-publish.yml

**⭐ 为什么选择这个仓库？**
- **GitHub 官方维护**: 与 GitHub Container Registry 完美集成
- **安全最佳实践**: 使用 GITHUB_TOKEN，无需额外配置密钥
- **多平台支持**: 支持构建 linux/amd64、linux/arm64 等多架构镜像

**ℹ️ Docker Publish 是什么？**
> 自动构建 Docker 镜像并推送到 GitHub Container Registry 或 Docker Hub。

**Clone 命令**:
```bash
git clone --depth 1 https://github.com/actions/starter-workflows .gh-bootstrap-cache/docker-publish
```

**必读文件**: `ci/docker-publish.yml`

---

## 13. Labeler (labeler)

### 仓库: [actions/labeler](https://github.com/actions/labeler)

**⭐ 为什么选择这个仓库？**
- **GitHub 官方维护**: 由 GitHub Actions 团队维护
- **简单易用**: 基于文件路径自动添加标签
- **高度可定制**: 支持复杂的匹配规则

**ℹ️ Labeler 是什么？**
> 当 PR 修改 `src/` 目录时自动添加 `area/core` 标签，修改 `docs/` 时添加 `documentation` 标签。

**Clone 命令**:
```bash
git clone --depth 1 https://github.com/actions/labeler .gh-bootstrap-cache/labeler
```

**关键文件**:
```
.github/
├── labeler.yml              # ⭐ 配置示例
└── workflows/
    └── labeler.yml          # 工作流示例
```

**必读文件**: `.github/labeler.yml`

**配置示例** (直接复制使用):
```yaml
# .github/labeler.yml
documentation:
  - changed-files:
      - any-glob-to-any-file: 'docs/**'

core:
  - changed-files:
      - any-glob-to-any-file: 'src/**'

tests:
  - changed-files:
      - any-glob-to-any-file: 'tests/**'

dependencies:
  - changed-files:
      - any-glob-to-any-file:
          - 'package.json'
          - 'package-lock.json'
          - 'yarn.lock'
          - 'pnpm-lock.yaml'
```

---

## 14. Stale (stale)

### 仓库: [actions/starter-workflows](https://github.com/actions/starter-workflows) - automation/stale.yml

**⭐ 为什么选择这个仓库？**
- **GitHub 官方维护**: 使用官方 actions/stale action
- **可定制**: 支持自定义过期时间、标签、消息

**ℹ️ Stale 是什么？**
> 对 60 天无活动的 Issue 添加 "stale" 标签，再过 7 天自动关闭，保持 Issue 列表整洁。

**Clone 命令**:
```bash
git clone --depth 1 https://github.com/actions/starter-workflows .gh-bootstrap-cache/stale
```

**必读文件**: `automation/stale.yml`

---

## 15. Greetings (greetings)

### 仓库: [actions/starter-workflows](https://github.com/actions/starter-workflows) - automation/greetings.yml

**⭐ 为什么选择这个仓库？**
- **GitHub 官方维护**: 使用官方 actions/first-interaction action
- **社区友好**: 欢迎首次贡献者，营造友好氛围

**ℹ️ Greetings 是什么？**
> 当有人首次提交 Issue 或 PR 时，自动发送欢迎消息。

**Clone 命令**:
```bash
git clone --depth 1 https://github.com/actions/starter-workflows .gh-bootstrap-cache/greetings
```

**必读文件**: `automation/greetings.yml`

---

## 16. Lock (lock)

### 仓库: [dec0dOS/amazing-github-template](https://github.com/dec0dOS/amazing-github-template)

**⭐ 为什么选择这个仓库？**
- **实用功能**: 自动锁定已关闭的旧 Issue，防止无意义的讨论
- **可定制**: 支持自定义锁定时间和消息

**ℹ️ Lock 是什么？**
> 自动锁定已关闭超过一定时间的 Issue 和 PR，防止在旧讨论中继续评论。

**Clone 命令**:
```bash
git clone --depth 1 https://github.com/dec0dOS/amazing-github-template .gh-bootstrap-cache/lock
```

**必读文件**: `.github/workflows/lock.yml`

---

## 17. PR Labeler (pr-labeler)

### 仓库: [dec0dOS/amazing-github-template](https://github.com/dec0dOS/amazing-github-template)

**⭐ 为什么选择这个仓库？**
- **基于分支名**: 根据分支名（如 `feature/*`、`fix/*`）自动添加标签
- **与 release-drafter 配合**: 标签用于自动生成发布说明

**ℹ️ PR Labeler 是什么？**
> 根据 PR 的分支名自动添加标签，如 `feature/xxx` 分支自动添加 `feature` 标签。

**Clone 命令**:
```bash
git clone --depth 1 https://github.com/dec0dOS/amazing-github-template .gh-bootstrap-cache/pr-labeler
```

**必读文件**: `.github/workflows/pr-labels.yml`

---

## 18. Issue Config (issue-config)

### 仓库: [dec0dOS/amazing-github-template](https://github.com/dec0dOS/amazing-github-template)

**⭐ 为什么选择这个仓库？**
- **外部链接**: 可以添加指向 Stack Overflow、Discord 等的链接
- **空白 Issue 控制**: 可以禁用空白 Issue，强制使用模板

**ℹ️ Issue Config 是什么？**
> 配置 Issue 创建页面，添加外部链接、禁用空白 Issue 等。

**Clone 命令**:
```bash
git clone --depth 1 https://github.com/dec0dOS/amazing-github-template .gh-bootstrap-cache/issue-config
```

**必读文件**: `.github/ISSUE_TEMPLATE/config.yml`

**配置示例** (直接复制使用):
```yaml
# .github/ISSUE_TEMPLATE/config.yml
blank_issues_enabled: false
contact_links:
  - name: Question
    url: https://github.com/owner/repo/discussions/new?category=q-a
    about: Ask questions in GitHub Discussions
  - name: Stack Overflow
    url: https://stackoverflow.com/questions/tagged/your-tag
    about: Ask questions on Stack Overflow
```

---

## 19. Dependency Review (dependency-review)

### 仓库: [actions/starter-workflows](https://github.com/actions/starter-workflows) - code-scanning/dependency-review.yml

**⭐ 为什么选择这个仓库？**
- **GitHub 官方维护**: 使用官方 actions/dependency-review-action
- **PR 级别检查**: 在 PR 中检查新添加的依赖是否有已知漏洞

**ℹ️ Dependency Review 是什么？**
> 在 PR 中自动检查新添加的依赖是否有已知漏洞，阻止引入不安全的依赖。

**Clone 命令**:
```bash
git clone --depth 1 https://github.com/actions/starter-workflows .gh-bootstrap-cache/dependency-review
```

**必读文件**: `code-scanning/dependency-review.yml`

---

## 20. Semantic PR (semantic-pr)

### 仓库: [amannn/action-semantic-pull-request](https://github.com/amannn/action-semantic-pull-request)

**⭐ 为什么选择这个仓库？**
- **广泛采用**: 被众多知名项目使用
- **高度可定制**: 支持自定义类型、范围、规则

**ℹ️ Semantic PR 是什么？**
> 确保 PR 标题符合 Conventional Commits 规范（如 `feat:`, `fix:`, `docs:`），便于自动生成 changelog。

**Clone 命令**:
```bash
git clone --depth 1 https://github.com/amannn/action-semantic-pull-request .gh-bootstrap-cache/semantic-pr
```

**必读文件**: `action.yml`, `.github/workflows/semantic-pr.yml` (如果存在)

**工作流示例** (直接复制使用):
```yaml
# .github/workflows/semantic-pr.yml
name: Semantic PR

on:
  pull_request_target:
    types: [opened, edited, synchronize]

permissions:
  pull-requests: read

jobs:
  main:
    runs-on: ubuntu-latest
    steps:
      - uses: amannn/action-semantic-pull-request@v5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          types: |
            feat
            fix
            docs
            style
            refactor
            perf
            test
            build
            ci
            chore
            revert
          requireScope: false
```

---

## 21. Commitlint (commitlint)

### 仓库: [conventional-changelog/commitlint](https://github.com/conventional-changelog/commitlint)

**⭐ 为什么选择这个仓库？**
- **行业标准**: Conventional Commits 规范的官方实现
- **生态完善**: 与 husky、lint-staged 等工具完美配合

**ℹ️ Commitlint 是什么？**
> 检查 commit 消息是否符合规范（如 `feat:`, `fix:`, `docs:` 等），确保 commit 历史整洁。

**Clone 命令**:
```bash
git clone --depth 1 https://github.com/conventional-changelog/commitlint .gh-bootstrap-cache/commitlint
```

**必读文件**: `@commitlint/config-conventional` 包的配置

**配置示例** (直接复制使用):

配置文件 (`commitlint.config.js`):
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert']
    ]
  }
};
```

工作流 (`.github/workflows/commitlint.yml`):
```yaml
name: Commitlint

on: [push, pull_request]

jobs:
  commitlint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install commitlint
        run: npm install --save-dev @commitlint/cli @commitlint/config-conventional

      - name: Validate commits
        run: npx commitlint --from ${{ github.event.pull_request.base.sha || 'HEAD~1' }} --to HEAD --verbose
```

---

## 22. Gitattributes (gitattributes)

### 仓库: [gitattributes/gitattributes](https://github.com/gitattributes/gitattributes)

**⭐ 为什么选择这个仓库？**
- **按语言分类**: 提供各种语言的最佳 .gitattributes 配置
- **社区维护**: 持续更新，覆盖新的文件类型

**ℹ️ .gitattributes 是什么？**
> 定义文件的行尾处理、二进制文件识别、语言统计等。确保跨平台协作时文件格式一致。

**Clone 命令**:
```bash
git clone --depth 1 https://github.com/gitattributes/gitattributes .gh-bootstrap-cache/gitattributes
```

**目录结构**:
```
*.gitattributes              # 通用配置
Web.gitattributes            # Web 项目
Python.gitattributes         # Python 项目
Java.gitattributes           # Java 项目
...
```

**语言 → 文件映射**:
| 检测到的语言 | 读取文件 |
|-------------|----------|
| JavaScript/TypeScript | `Web.gitattributes` |
| Python | `Python.gitattributes` |
| Java | `Java.gitattributes` |
| Go | `Go.gitattributes` |
| 通用 | `Common.gitattributes` |

**必读文件**: 根据检测到的语言选择对应的 `.gitattributes` 文件

---

## 执行流程示例

### ⚠️ 正确的执行流程（直接复制）

```
用户选择: ci-workflow + issue-templates + readme

Phase 4 执行:
1. git clone actions/starter-workflows → .gh-bootstrap-cache/ci-workflow/
2. git clone stevemao/github-issue-templates → .gh-bootstrap-cache/issue-templates/
3. git clone othneildrew/Best-README-Template → .gh-bootstrap-cache/readme/

4. Read .gh-bootstrap-cache/ci-workflow/ci/node.js.yml
   → 获取完整的工作流 YAML 内容

5. 【直接复制】将读取的内容原样复制
   → 仅替换变量: ${{ github.repository }} 等保持不变
   → 仅调整: node-version 根据检测结果设置
   → 禁止: 重新编写、优化、简化、重构

6. Write .github/workflows/ci.yml
   → 内容 = 模板原文 + 变量替换

7. 对其他组件重复步骤 4-6

8. 清理 .gh-bootstrap-cache/
```

### ❌ 错误的执行流程（禁止）

```
Phase 4 执行:
1. git clone actions/starter-workflows → .gh-bootstrap-cache/ci-workflow/
2. Read .gh-bootstrap-cache/ci-workflow/ci/node.js.yml
3. 【错误】"理解模板意图后重新生成" ← 禁止！
4. 【错误】"根据最佳实践优化" ← 禁止！
5. 【错误】"简化不必要的步骤" ← 禁止！
6. Write 自己编写的内容 ← 这会导致工作流失效！
```

### 变量替换规则

在复制模板时，**仅**替换以下变量：

| 变量 | 替换为 | 示例 |
|------|--------|------|
| `{{projectName}}` | 项目名称 | `my-project` |
| `{{description}}` | 项目描述 | `A cool project` |
| `{{author}}` | 作者名称 | `John Doe` |
| `{{email}}` | 作者邮箱 | `john@example.com` |
| `{{year}}` | 当前年份 | `2026` |
| `{{license}}` | 许可证类型 | `MIT` |
| `node-version: [...]` | 检测到的版本 | `node-version: [20]` |
| `python-version: [...]` | 检测到的版本 | `python-version: ['3.11']` |

**不要替换**:
- `${{ secrets.* }}` - GitHub 密钥引用
- `${{ github.* }}` - GitHub 上下文变量
- `${{ steps.* }}` - 步骤输出引用
- Action 版本号 - 如 `actions/checkout@v4`

---

## 用户交互时的说明模板

在 Phase 2 询问用户选择参考仓库时，使用以下格式：

### Issue 模板选择

```
选择 Issue 模板的参考仓库

ℹ️ Issue 模板是什么？
当用户在你的仓库创建 Issue 时，会看到预设表单，帮助他们提供结构化的 Bug 报告或功能请求。

推荐选项：
○ stevemao/github-issue-templates (推荐)
  └─ 8 种风格可选：简洁、清单、对话式等，适合各类项目
○ dec0dOS/amazing-github-template
  └─ 一站式模板，包含 Bug/Feature/Improvement，设计精美
○ 让 Claude 智能生成
  └─ 根据项目特点定制生成，不使用现有模板
```

### CI 工作流选择

```
选择 CI 工作流的参考仓库

ℹ️ CI (持续集成) 是什么？
每次推送代码时，GitHub 会自动运行测试，确保新代码没有破坏现有功能。

推荐选项：
○ actions/starter-workflows (推荐)
  └─ GitHub 官方维护，支持 50+ 种语言，持续更新
```

---

## 更新记录

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-01-23 | 3.0.0 | 添加仓库优势说明和用户教育内容 |
| 2026-01-23 | 2.0.0 | 添加精确文件路径映射，重构为组件导向 |
| 2026-01-23 | 1.0.0 | 初始版本，包含 48+ 仓库引用 |
