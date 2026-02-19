# 项目检测规则

本文档定义 gh-bootstrap 的智能项目检测规则，用于 Phase 1 检测阶段。

## When to Use

- **Phase 1 检测阶段**：执行项目环境检测时必须参考
- **语言识别**：确定项目主要编程语言
- **包管理器识别**：确定依赖管理工具
- **框架检测**：识别使用的框架以选择合适的 CI 模板
- **版本检测**：获取运行时版本用于工作流配置

---

## 语言检测规则

通过检测项目根目录中的特征文件来识别编程语言。

| 特征文件 | 语言 | 置信度 |
|----------|------|--------|
| `package.json` | Node.js/JavaScript | high |
| `tsconfig.json` | TypeScript | high |
| `pyproject.toml` | Python | high |
| `requirements.txt` | Python | medium |
| `setup.py` | Python | medium |
| `Pipfile` | Python | high |
| `Cargo.toml` | Rust | high |
| `go.mod` | Go | high |
| `pom.xml` | Java (Maven) | high |
| `build.gradle` | Java/Kotlin (Gradle) | high |
| `build.gradle.kts` | Kotlin (Gradle) | high |
| `Gemfile` | Ruby | high |
| `composer.json` | PHP | high |
| `*.csproj` | .NET/C# | high |
| `*.fsproj` | .NET/F# | high |
| `mix.exs` | Elixir | high |
| `pubspec.yaml` | Dart/Flutter | high |
| `Makefile` | C/C++ | low |
| `CMakeLists.txt` | C/C++ | medium |

### 多语言项目处理

当检测到多个语言特征文件时：
1. 优先选择置信度最高的语言
2. 如果置信度相同，按以下优先级排序：TypeScript > JavaScript > Python > Go > Rust > Java
3. 记录所有检测到的语言，供用户确认

## 包管理器检测规则

通过检测锁文件来识别包管理器。

| 锁文件 | 包管理器 | 语言 |
|--------|----------|------|
| `package-lock.json` | npm | Node.js |
| `yarn.lock` | yarn | Node.js |
| `pnpm-lock.yaml` | pnpm | Node.js |
| `bun.lockb` | bun | Node.js |
| `Pipfile.lock` | pipenv | Python |
| `poetry.lock` | poetry | Python |
| `uv.lock` | uv | Python |
| `Cargo.lock` | cargo | Rust |
| `go.sum` | go mod | Go |
| `Gemfile.lock` | bundler | Ruby |
| `composer.lock` | composer | PHP |
| `packages.lock.json` | NuGet | .NET |

### 无锁文件时的推断

如果没有锁文件，根据配置文件推断：
- `package.json` 存在 → 默认 npm
- `pyproject.toml` 存在且包含 `[tool.poetry]` → poetry
- `pyproject.toml` 存在且包含 `[project]` → pip/uv

## 框架检测规则

### Node.js/TypeScript 框架

| 检测条件 | 框架 |
|----------|------|
| `package.json` 包含 `next` 依赖 | Next.js |
| `package.json` 包含 `nuxt` 依赖 | Nuxt.js |
| `package.json` 包含 `@angular/core` 依赖 | Angular |
| `package.json` 包含 `vue` 依赖 | Vue.js |
| `package.json` 包含 `react` 依赖 | React |
| `package.json` 包含 `svelte` 依赖 | Svelte |
| `package.json` 包含 `express` 依赖 | Express.js |
| `package.json` 包含 `fastify` 依赖 | Fastify |
| `package.json` 包含 `nestjs` 依赖 | NestJS |
| `package.json` 包含 `hono` 依赖 | Hono |
| `astro.config.*` 存在 | Astro |
| `vite.config.*` 存在 | Vite |

### Python 框架

| 检测条件 | 框架 |
|----------|------|
| `pyproject.toml` 包含 `django` 依赖 | Django |
| `pyproject.toml` 包含 `flask` 依赖 | Flask |
| `pyproject.toml` 包含 `fastapi` 依赖 | FastAPI |
| `pyproject.toml` 包含 `starlette` 依赖 | Starlette |
| `manage.py` 存在 | Django |
| `app.py` + Flask 导入 | Flask |

### Go 框架

| 检测条件 | 框架 |
|----------|------|
| `go.mod` 包含 `gin-gonic/gin` | Gin |
| `go.mod` 包含 `labstack/echo` | Echo |
| `go.mod` 包含 `gofiber/fiber` | Fiber |

### Rust 框架

| 检测条件 | 框架 |
|----------|------|
| `Cargo.toml` 包含 `actix-web` | Actix Web |
| `Cargo.toml` 包含 `axum` | Axum |
| `Cargo.toml` 包含 `rocket` | Rocket |

## Monorepo 检测规则

| 检测条件 | Monorepo 工具 |
|----------|---------------|
| `turbo.json` 存在 | Turborepo |
| `nx.json` 存在 | Nx |
| `lerna.json` 存在 | Lerna |
| `pnpm-workspace.yaml` 存在 | pnpm workspaces |
| `package.json` 包含 `workspaces` 字段 | npm/yarn workspaces |

## GitHub 配置检测规则

### 目录结构检测

```
.github/
├── workflows/           # GitHub Actions 工作流
│   └── *.yml
├── ISSUE_TEMPLATE/      # Issue 模板
│   ├── *.md
│   └── config.yml
├── PULL_REQUEST_TEMPLATE.md  # PR 模板
├── CODEOWNERS           # 代码所有者
├── dependabot.yml       # Dependabot 配置
├── renovate.json        # Renovate 配置
├── FUNDING.yml          # 赞助配置
└── SECURITY.md          # 安全策略
```

### 检测项目

| 检测项 | 路径 | 说明 |
|--------|------|------|
| 工作流 | `.github/workflows/*.yml` | CI/CD 配置 |
| Issue 模板 | `.github/ISSUE_TEMPLATE/` | Issue 模板目录 |
| PR 模板 | `.github/PULL_REQUEST_TEMPLATE.md` 或 `.github/pull_request_template.md` | PR 模板 |
| 代码所有者 | `.github/CODEOWNERS` 或 `CODEOWNERS` | 代码审查分配 |
| Dependabot | `.github/dependabot.yml` | 依赖更新 |
| Renovate | `renovate.json` 或 `.github/renovate.json` | 依赖更新 |
| 标签配置 | `.github/labels.yml` | 标签定义 |

## 架构文档检测规则

### 常见位置

按优先级排序：
1. `ARCHITECTURE.md` (项目根目录)
2. `architecture.md` (项目根目录)
3. `docs/architecture.md`
4. `docs/ARCHITECTURE.md`
5. `docs/architecture/` (目录)
6. `.github/ARCHITECTURE.md`
7. `doc/architecture.md`

### 相关文档

| 文档类型 | 常见位置 |
|----------|----------|
| 设计文档 | `docs/design/`, `DESIGN.md` |
| API 文档 | `docs/api/`, `API.md` |
| 贡献指南 | `CONTRIBUTING.md` |
| 变更日志 | `CHANGELOG.md`, `HISTORY.md` |

## 检测结果数据结构

```json
{
  "detected": {
    "language": "typescript",
    "languages": ["typescript", "javascript"],
    "framework": "next.js",
    "frameworks": ["next.js", "react"],
    "packageManager": "pnpm",
    "monorepo": "turborepo",
    "hasGitHub": true,
    "existingConfigs": {
      "workflows": ["ci.yml", "release.yml"],
      "issueTemplates": ["bug_report.md", "feature_request.md"],
      "prTemplate": true,
      "codeowners": false,
      "dependabot": true,
      "renovate": false
    },
    "hasArchDocs": true,
    "archDocPath": "docs/architecture.md"
  },
  "confidence": {
    "language": "high",
    "framework": "high",
    "packageManager": "high"
  },
  "needsUserInput": [
    "projectName",
    "authorName",
    "license"
  ]
}
```

## 检测流程

1. **扫描项目根目录**
   - 列出所有文件和目录
   - 识别特征文件

2. **语言检测**
   - 匹配语言特征文件
   - 确定主要语言和次要语言

3. **包管理器检测**
   - 检查锁文件
   - 推断包管理器

4. **框架检测**
   - 解析依赖文件
   - 匹配框架特征

5. **Monorepo 检测**
   - 检查 monorepo 配置文件
   - 识别工作区结构

6. **GitHub 配置检测**
   - 扫描 .github/ 目录
   - 记录现有配置

7. **架构文档检测**
   - 搜索架构文档
   - 提取关键信息

8. **生成检测报告**
   - 汇总检测结果
   - 标记需要用户确认的项目
