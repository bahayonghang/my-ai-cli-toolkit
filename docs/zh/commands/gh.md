# Git 与 GitHub 命令

> 历史 / 已下线说明：本页记录的是已经移除的命令家族。当前 `content/platforms/*/commands/` 中没有对应源树，因此本页只作为兼容参考保留，不进入 live sidebar。


用于提交、修复 Issue 和审查 Pull Request 的 Git 操作与 GitHub 集成。

## 命令

### `commit`

**描述**: 分析 Git 改动并自动生成 Conventional Commits 风格的提交信息。
**用法**: `/gh:commit [选项]`

#### 选项

| 选项 | 描述 |
|------|------|
| `--no-verify` | 跳过本地 Git 钩子（`pre-commit`/`commit-msg`） |
| `--all` | 暂存区为空时自动 `git add -A` |
| `--amend` | 修补上一次提交 |
| `--signoff` | 添加 `Signed-off-by` 行（DCO 合规） |
| `--emoji` | 在提交信息中包含 emoji 前缀 |
| `--scope <scope>` | 指定提交作用域（如 `ui`、`docs`、`api`） |
| `--type <type>` | 强制提交类型（如 `feat`、`fix`、`docs`） |

#### 工作原理

1. **仓库校验** - 检查 Git 仓库和分支状态
2. **改动检测** - 通过 `git status --porcelain` 和 `git diff` 分析改动
3. **拆分建议** - 基于不同关注点、类型、文件模式或规模（>300 行）建议拆分提交
4. **信息生成** - 创建 Conventional Commits 格式：`[<emoji>] <type>(<scope>)?: <subject>`（标题 <=72 字符），正文使用要点列表，脚注包含破坏性变更和 issue 引用
5. **执行提交** - 使用生成的信息运行 `git commit`

#### 提交类型

| Emoji | 类型 | 描述 |
|-------|------|------|
| ✨ | `feat` | 新功能 |
| 🐛 | `fix` | 缺陷修复 |
| 📝 | `docs` | 文档 |
| 🎨 | `style` | 代码风格/格式 |
| ♻️ | `refactor` | 代码重构 |
| ⚡️ | `perf` | 性能优化 |
| ✅ | `test` | 测试 |
| 🔧 | `chore` | 构建/工具 |
| 👷 | `ci` | CI/CD |
| ⏪️ | `revert` | 回滚提交 |

#### 提交信息示例

**使用 emoji：**
```
✨ feat(ui): add user authentication flow
🐛 fix(api): handle token refresh race condition
📝 docs: update API usage examples
```

**不使用 emoji：**
```
feat(ui): add user authentication flow
fix(api): handle token refresh race condition
docs: update API usage examples
```

**包含正文：**
```
feat(auth): add OAuth2 login flow

- implement Google and GitHub third-party login
- add user authorization callback handling
- improve login state persistence logic

Closes #42
```

**破坏性变更：**
```
feat(api)!: redesign authentication API

- migrate from session-based to JWT authentication
- update all endpoint signatures
- remove deprecated login methods

BREAKING CHANGE: authentication API has been completely redesigned
```

#### 校验与工具

- **commitlint**: 根据 Conventional Commits 规则验证提交信息（type-enum、subject-case、header-max-length 等）
- **Husky**: Git 钩子集成，提交时自动验证
- **Commitizen**: 交互式提交工具，引导选择类型/作用域/主题

### `fix-issue`

**描述**: 通过结构化的 计划-开发-测试-PR 工作流分析并修复 GitHub Issue。
**用法**: `/gh:fix-issue [issue-number]`

#### 工作流程

1. **计划** - 通过 `gh issue view` 获取 issue 详情，搜索相关 PR 和历史记录，分解为可管理的任务，在便笺中记录计划
2. **开发** - 创建新分支，以小步骤实现修复，每步完成后提交
3. **测试** - 编写单元测试，运行完整测试套件，在继续前修复所有失败
4. **提交 PR** - 提交 Pull Request 并请求审查

所有 GitHub 操作使用 `gh` CLI。

### `review-pr`

**描述**: 对 GitHub Pull Request 进行专家级代码审查，提供详细分析。
**用法**: `/gh:review-pr [pr-number]`

#### 工作流程

1. 如未提供 PR 编号，通过 `gh pr list` 列出未关闭的 PR
2. 通过 `gh pr view` 获取 PR 详情
3. 通过 `gh pr diff` 获取代码差异
4. 分析更改并通过 `gh api repos/OWNER/REPO/pulls/PR_NUMBER/comments` 发布审查评论

#### 审查重点

- 代码正确性
- 是否遵循项目规范
- 性能影响
- 测试覆盖率
- 安全考量

审查评论仅关注建议和必要更改，不总结 PR 内容。

## 示例

```bash
# 分析当前改动并提交
/gh:commit

# 暂存所有改动并使用 emoji 提交
/gh:commit --all --emoji

# 指定作用域和类型
/gh:commit --scope ui --type feat

# 修补上次提交并签名
/gh:commit --amend --signoff

# 修复特定 GitHub issue
/gh:fix-issue 42

# 审查 Pull Request
/gh:review-pr 78

# 列出未关闭的 PR 后审查
/gh:review-pr
```

## 注意事项

- `commit` 仅使用 Git：不使用包管理器或构建命令
- `commit` 默认运行本地 Git 钩子；使用 `--no-verify` 跳过
- `commit` 非破坏性：只写入 `.git/COMMIT_EDITMSG` 和暂存区
- `commit` 在 rebase/merge 冲突或 detached HEAD 状态下会提示确认
- `fix-issue` 和 `review-pr` 需要安装并认证 `gh` CLI
