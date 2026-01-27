# 用户手动操作规范

> 本文档定义 gh-bootstrap 执行完成后，需要用户手动完成的配置项。
>
> **⚠️ CRITICAL**: Phase 5 报告阶段必须生成此验收清单，确保用户知道需要手动配置哪些内容。

## When to Use

- **Phase 5 报告阶段**：生成后续操作指引时必须参考
- **Secrets 配置**：告知用户需要配置哪些 GitHub Secrets
- **仓库设置**：指导用户启用 Pages、Dependabot 等功能
- **验证清单**：提供配置完成后的验证方法

---

## 设计原则

1. **透明性**: 明确告知用户哪些配置无法自动完成
2. **可操作性**: 提供具体的操作步骤和链接
3. **优先级**: 按重要性排序，关键配置优先
4. **验证性**: 提供验证方法确认配置成功

---

## 组件 → 手动操作映射

### 快速索引

| 组件 ID | 需要手动配置 | 优先级 | 说明 |
|---------|-------------|--------|------|
| `ci-release` | NPM_TOKEN / PYPI_TOKEN | 🔴 高 | 发布到包管理器必需 |
| `codecov` | CODECOV_TOKEN | 🟡 中 | 覆盖率报告必需 |
| `docker-publish` | DOCKER_USERNAME, DOCKER_PASSWORD | 🟡 中 | Docker Hub 发布必需 |
| `pages` | 启用 GitHub Pages | 🟡 中 | 需要在仓库设置中启用 |
| `dependabot` | 启用 Dependabot | 🟢 低 | 通常自动启用 |
| `codeql` | 启用 Code scanning | 🟢 低 | 通常自动启用 |
| `branch-protection` | 配置分支保护规则 | 🟡 中 | 需要在仓库设置中配置 |
| `labels` | 同步标签到仓库 | 🟢 低 | 运行 gh label sync |
| `funding` | 验证赞助平台账号 | 🟢 低 | 确认账号正确 |

---

## 详细配置指南

### 1. NPM_TOKEN (ci-release - npm 发布)

**适用组件**: `ci-release` (发布到 npm)

**为什么需要**: GitHub Actions 需要 npm 访问令牌才能发布包到 npm registry。

**配置步骤**:

1. **获取 npm 令牌**:
   - 登录 [npmjs.com](https://www.npmjs.com/)
   - 点击头像 → Access Tokens
   - 点击 "Generate New Token" → "Classic Token"
   - 选择 "Automation" 类型（用于 CI/CD）
   - 复制生成的令牌

2. **添加到 GitHub Secrets**:
   - 打开仓库 → Settings → Secrets and variables → Actions
   - 点击 "New repository secret"
   - Name: `NPM_TOKEN`
   - Secret: 粘贴 npm 令牌
   - 点击 "Add secret"

**验证方法**:
```bash
# 创建一个 Release，检查 Actions 是否成功发布
gh release create v0.0.1-test --notes "Test release"
```

**相关链接**:
- [npm 创建访问令牌](https://docs.npmjs.com/creating-and-viewing-access-tokens)
- [GitHub 加密 Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

### 2. PYPI_TOKEN (ci-release - PyPI 发布)

**适用组件**: `ci-release` (发布到 PyPI)

**为什么需要**: GitHub Actions 需要 PyPI API 令牌才能发布包到 PyPI。

**配置步骤**:

1. **获取 PyPI 令牌**:
   - 登录 [pypi.org](https://pypi.org/)
   - 点击头像 → Account settings
   - 滚动到 "API tokens" 部分
   - 点击 "Add API token"
   - Scope: 选择 "Entire account" 或特定项目
   - 复制生成的令牌（以 `pypi-` 开头）

2. **添加到 GitHub Secrets**:
   - 打开仓库 → Settings → Secrets and variables → Actions
   - 点击 "New repository secret"
   - Name: `PYPI_TOKEN`
   - Secret: 粘贴 PyPI 令牌
   - 点击 "Add secret"

**验证方法**:
```bash
# 创建一个 Release，检查 Actions 是否成功发布
gh release create v0.0.1-test --notes "Test release"
```

**相关链接**:
- [PyPI API 令牌](https://pypi.org/help/#apitoken)

---

### 3. CODECOV_TOKEN (codecov)

**适用组件**: `codecov`

**为什么需要**: Codecov 需要令牌来接收和显示覆盖率报告。

**配置步骤**:

1. **获取 Codecov 令牌**:
   - 登录 [codecov.io](https://codecov.io/)（使用 GitHub 登录）
   - 选择你的仓库
   - 进入 Settings → General
   - 复制 "Repository Upload Token"

2. **添加到 GitHub Secrets**:
   - 打开仓库 → Settings → Secrets and variables → Actions
   - 点击 "New repository secret"
   - Name: `CODECOV_TOKEN`
   - Secret: 粘贴 Codecov 令牌
   - 点击 "Add secret"

**验证方法**:
- 推送代码触发 CI
- 检查 Codecov 是否收到覆盖率报告
- 在 PR 中查看覆盖率评论

**相关链接**:
- [Codecov 快速入门](https://docs.codecov.com/docs/quick-start)

---

### 4. Docker 凭证 (docker-publish)

**适用组件**: `docker-publish`

**为什么需要**: 推送 Docker 镜像到 Docker Hub 需要认证。

> **注意**: 如果使用 GitHub Container Registry (ghcr.io)，则不需要额外配置，GITHUB_TOKEN 已自动可用。

**配置步骤** (Docker Hub):

1. **获取 Docker Hub 令牌**:
   - 登录 [hub.docker.com](https://hub.docker.com/)
   - 点击头像 → Account Settings → Security
   - 点击 "New Access Token"
   - 描述: `GitHub Actions`
   - 权限: Read, Write, Delete
   - 复制生成的令牌

2. **添加到 GitHub Secrets**:
   - `DOCKER_USERNAME`: Docker Hub 用户名
   - `DOCKER_PASSWORD`: Docker Hub 访问令牌

**验证方法**:
```bash
# 推送代码或创建 Release，检查 Docker 镜像是否发布
docker pull your-username/your-repo:latest
```

**相关链接**:
- [Docker Hub 访问令牌](https://docs.docker.com/docker-hub/access-tokens/)

---

### 5. GitHub Pages 启用 (pages)

**适用组件**: `pages`

**为什么需要**: GitHub Pages 需要在仓库设置中手动启用。

**配置步骤**:

1. 打开仓库 → Settings → Pages
2. Source: 选择 "GitHub Actions"
3. 保存设置

**验证方法**:
- 推送代码触发 Pages 工作流
- 访问 `https://{username}.github.io/{repo}/`

**相关链接**:
- [GitHub Pages 文档](https://docs.github.com/en/pages)

---

### 6. 分支保护规则 (branch-protection)

**适用组件**: `branch-protection`

**为什么需要**: 防止直接推送到主分支，要求 PR 审核和 CI 通过。

**配置步骤**:

1. 打开仓库 → Settings → Branches
2. 点击 "Add branch protection rule"
3. Branch name pattern: `main` 或 `master`
4. 推荐启用的选项:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators

**验证方法**:
```bash
# 尝试直接推送到 main，应该被拒绝
git push origin main  # 应该失败
```

**相关链接**:
- [分支保护规则](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)

---

### 7. 标签同步 (labels)

**适用组件**: `labels`

**为什么需要**: `.github/labels.yml` 文件需要同步到仓库的实际标签。

**配置步骤**:

```bash
# 使用 GitHub CLI 同步标签
gh label sync --force

# 或者使用 github-label-sync 工具
npx github-label-sync --access-token $GITHUB_TOKEN --labels .github/labels.yml owner/repo
```

**验证方法**:
- 打开仓库 → Issues → Labels
- 检查标签是否与 `.github/labels.yml` 一致

---

### 8. Dependabot 启用 (dependabot)

**适用组件**: `dependabot`

**为什么需要**: 虽然 `dependabot.yml` 已创建，但可能需要在仓库设置中启用。

**配置步骤**:

1. 打开仓库 → Settings → Code security and analysis
2. 启用 "Dependabot alerts"
3. 启用 "Dependabot security updates"
4. 启用 "Dependabot version updates"

**验证方法**:
- 打开仓库 → Insights → Dependency graph → Dependabot
- 检查是否有待处理的更新

---

### 9. Code Scanning 启用 (codeql)

**适用组件**: `codeql`

**为什么需要**: CodeQL 工作流已创建，但可能需要在仓库设置中启用。

**配置步骤**:

1. 打开仓库 → Settings → Code security and analysis
2. 启用 "Code scanning"
3. 选择 "Set up" → "Advanced"（如果工作流已存在则跳过）

**验证方法**:
- 打开仓库 → Security → Code scanning alerts
- 推送代码后检查是否有扫描结果

---

## 验收清单模板

Phase 5 报告阶段必须生成以下格式的验收清单：

```markdown
## 📋 用户手动操作清单

以下配置需要您手动完成才能使工作流正常运行：

### 🔴 必须配置（否则工作流会失败）

| 配置项 | 操作 | 状态 |
|--------|------|------|
| NPM_TOKEN | [添加到 Secrets](../../settings/secrets/actions/new) | ⬜ 待完成 |
| CODECOV_TOKEN | [添加到 Secrets](../../settings/secrets/actions/new) | ⬜ 待完成 |

### 🟡 推荐配置（提升项目质量）

| 配置项 | 操作 | 状态 |
|--------|------|------|
| 分支保护 | [配置规则](../../settings/branches) | ⬜ 待完成 |
| 标签同步 | 运行 `gh label sync --force` | ⬜ 待完成 |

### 🟢 可选配置

| 配置项 | 操作 | 状态 |
|--------|------|------|
| GitHub Pages | [启用 Pages](../../settings/pages) | ⬜ 待完成 |

---

**完成上述配置后，您的 GitHub 仓库将完全就绪！**
```

---

## 组件 → 必需 Secrets 映射

| 组件 ID | 必需 Secrets | 可选 Secrets |
|---------|-------------|--------------|
| `ci-release` (npm) | `NPM_TOKEN` | - |
| `ci-release` (pypi) | `PYPI_TOKEN` | - |
| `codecov` | `CODECOV_TOKEN` | - |
| `docker-publish` (Docker Hub) | `DOCKER_USERNAME`, `DOCKER_PASSWORD` | - |
| `docker-publish` (ghcr.io) | (无需额外配置) | - |
| `semantic-pr` | (无需额外配置) | - |
| `auto-merge` | (无需额外配置) | - |

---

## 更新记录

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-01-23 | 1.0.0 | 初始版本，定义所有手动操作项 |
