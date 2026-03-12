# zcf

Git 工具集，提供分支清理、版本回滚、Worktree 管理和项目初始化能力。

## 概述

`zcf` 家族包含四个面向 Git 日常运维的命令，覆盖分支生命周期管理、安全回滚、多工作树并行开发以及项目 AI 上下文初始化。

| 命令 | 用途 |
|------|------|
| `git-cleanBranches` | 安全清理已合并或过期的 Git 分支 |
| `git-rollback` | 交互式回滚分支到历史版本 |
| `git-worktree` | 管理 Git worktree，支持 IDE 集成与内容迁移 |
| `init-project` | 初始化项目 AI 上下文，生成多级 `CLAUDE.md` |

---

## git-cleanBranches

安全查找并清理已合并或过期的 Git 分支，支持 dry-run 模式与自定义基准/保护分支。

### 使用方法

```bash
/zcf:git-cleanBranches --dry-run                              # 预览将要清理的分支
/zcf:git-cleanBranches --stale 90                             # 清理超过 90 天未更新的已合并分支
/zcf:git-cleanBranches --base release/v2.1 --remote --yes     # 清理已合并到指定分支的本地与远程分支
/zcf:git-cleanBranches --force outdated-feature               # 强制删除未合并的本地分支
```

### 选项

| 选项 | 描述 |
|------|------|
| `--base <branch>` | 指定清理的基准分支（默认 `main`/`master`） |
| `--stale <days>` | 清理超过指定天数未提交的分支 |
| `--remote` | 同时清理远程已合并/过期分支 |
| `--dry-run` | 默认行为，仅列出将要删除的分支 |
| `--yes` | 跳过逐一确认，直接删除（适合 CI/CD） |
| `--force` | 使用 `-D` 强制删除本地分支（即使未合并） |

### 工作原理

1. **安全预检** - 执行 `git fetch --all --prune`，读取保护分支配置
2. **分析识别** - 找出已合并分支和过期分支，排除保护分支
3. **报告预览** - 列出待删除分支，等待用户确认
4. **执行清理** - 仅在确认后逐一删除（本地 `git branch -d`，远程 `git push origin --delete`）

### 保护分支配置

```bash
# 保护 develop 分支
git config --add branch.cleanup.protected develop

# 保护所有 release/ 开头的分支（通配符）
git config --add branch.cleanup.protected 'release/*'

# 查看所有已配置的保护分支
git config --get-all branch.cleanup.protected
```

### 最佳实践

- 养成先 `--dry-run` 预览再执行的习惯
- 维护长期 `release` 分支时，用 `--base` 清理已合并的 `feature`/`hotfix` 分支
- 除非确定某个未合并分支无用，否则不要使用 `--force`
- 清理共享远程分支前，先在团队频道通知
- 建议每月或每季度定期运行

---

## git-rollback

交互式回滚 Git 分支到历史版本，支持 `reset`（硬回滚）和 `revert`（反向提交）两种模式。默认以只读预览运行。

### 使用方法

```bash
/zcf:git-rollback                                                          # 全交互模式
/zcf:git-rollback --branch feature/calculator                              # 指定分支
/zcf:git-rollback --branch main --target 1a2b3c4d --mode reset --yes      # 一键硬回滚
/zcf:git-rollback --branch release/v2.1 --target v2.0.5 --mode revert     # 反向提交预览
```

### 选项

| 选项 | 描述 |
|------|------|
| `--branch <branch>` | 要回滚的分支，缺省时交互选择 |
| `--target <rev>` | 目标版本（commit hash、tag、reflog 引用） |
| `--mode reset\|revert` | `reset` 硬回滚历史；`revert` 生成反向提交 |
| `--depth <n>` | 交互模式下列出最近 n 个版本（默认 20） |
| `--dry-run` | 默认开启，只预览即将执行的命令 |
| `--yes` | 跳过所有确认直接执行 |

### 交互流程

1. 同步远端 → 列出分支 → 选择分支
2. 列出近期版本（commit + tag + reflog）→ 选择目标
3. 选择模式（reset / revert）→ 最终确认 → 执行回滚
4. 推送建议：`reset` 提示 `--force-with-lease`，`revert` 提示普通 `push`

### 安全护栏

- 执行前自动在 reflog 中记录当前 HEAD
- 保护分支（`main`/`master`/`production`）使用 `reset` 时要求额外确认
- 不提供 `--force` 选项，强推需手动执行

### reset 与 revert 对比

| 特性 | reset | revert |
|------|-------|--------|
| 历史记录 | 改写历史 | 保留历史，生成新提交 |
| 协作影响 | 需要强推，影响其他协作者 | 安全推送，不影响他人 |
| 适用场景 | 个人分支、本地回滚 | 共享分支、生产环境 |

---

## git-worktree

管理 Git worktree，在项目平级的 `../.zcf/项目名/` 目录下创建工作树，支持智能默认、IDE 集成和内容迁移。

### 使用方法

```bash
# 基本操作
/zcf:git-worktree add feature-ui                        # 从 main/master 创建新分支
/zcf:git-worktree add feature-ui -o                     # 创建并用 IDE 打开
/zcf:git-worktree add hotfix -b fix/login -o            # 指定分支名
/zcf:git-worktree list                                  # 列出所有 worktree
/zcf:git-worktree remove feature-ui                     # 删除 worktree
/zcf:git-worktree prune                                 # 清理无效引用

# 内容迁移
/zcf:git-worktree migrate feature-ui --from main        # 迁移未提交内容
/zcf:git-worktree migrate feature-ui --stash            # 迁移 stash 内容
```

### 选项

| 选项 | 描述 |
|------|------|
| `add [<path>]` | 在 `../.zcf/项目名/<path>` 添加新 worktree |
| `migrate <target>` | 迁移内容到指定 worktree |
| `list` | 列出所有 worktree 及状态 |
| `remove <path>` | 删除指定 worktree |
| `prune` | 清理无效的 worktree 引用 |
| `-b <branch>` | 创建新分支并检出到 worktree |
| `-o, --open` | 创建后直接用 IDE 打开 |
| `--from <source>` | 指定迁移源路径（migrate 专用） |
| `--stash` | 迁移当前 stash 内容（migrate 专用） |
| `--track` | 设置新分支跟踪远程分支 |
| `--detach` | 创建分离 HEAD 的 worktree |
| `--lock` | 创建后锁定 worktree |

### 核心特性

- **智能路径管理**：自动计算项目名，在 `../.zcf/项目名/` 下创建结构化目录
- **IDE 集成**：自动检测 VS Code / Cursor / WebStorm / Sublime Text / Vim
- **内容迁移**：在 worktree 之间迁移未提交改动或 stash 内容
- **环境文件处理**：自动复制 `.gitignore` 中列出的 `.env` 文件到新 worktree
- **安全特性**：路径冲突防护、分支检出验证、绝对路径强制

### 目录结构

```
parent-directory/
├── your-project/            # 主项目
│   ├── .git/
│   └── src/
└── .zcf/                    # worktree 管理
    └── your-project/
        ├── feature-ui/      # 功能分支
        ├── hotfix/          # 修复分支
        └── debug/           # 调试 worktree
```

---

## init-project

初始化项目 AI 上下文，以"根级简明 + 模块级详尽"的混合策略生成/更新 `CLAUDE.md` 索引。

### 使用方法

```bash
/zcf:init-project <项目摘要或名称>
```

### 工作原理

1. **全仓清点** - 快速统计文件与目录，识别模块根（`package.json`、`pyproject.toml`、`go.mod` 等）
2. **模块扫描** - 对每个模块做入口/接口/依赖/测试的定点读取与样本抽取
3. **深度补捞** - 按需对高风险/高价值路径追加扫描
4. **输出生成** - 在仓库根生成 `CLAUDE.md`（含 Mermaid 结构图），在各模块目录生成本地 `CLAUDE.md`（含导航面包屑）

### 特性

- 只读/写文档与索引，不改源代码
- 支持增量更新与断点续扫
- 输出覆盖率度量与建议下一步深挖的子路径

---

## 相关链接

- [命令目录](/zh/commands/catalog)
- [git-commit](/zh/commands/git-commit)
