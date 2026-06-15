# 提交拆分策略

## 目标

在真正提交前，先判断当前活动变更集合是否代表一个原子提交。
如果不能安全判断，就先给拆分方案，不要硬提交。

活动变更集合取决于当前模式：

- `staged-only`：只把 staged changes 当作可提交集合
- `all-changes`：把 staged、unstaged、untracked 的非忽略改动都当作候选集合，但仅在用户明确要求“包含所有改动”时使用

## 可以直接视为单个提交的常见情况

- 同一模块内的代码、测试、文档围绕同一功能或缺陷变化
- 一次纯文档更新
- 一次纯测试补充
- 一次明确的重构，影响多个文件但目标单一

## 应优先拆分的常见情况

- 新功能代码和无关文档混在一起
- 两个不同模块的独立修复一起进入 staged
- 格式化/重命名/大规模清理与功能改动混在一起
- 生成文件、锁文件、配置变更与核心逻辑改动没有同一原因

## 必须停止而不是盲目提交的情况

- 仅通过 diff 看不出 staged 集合的意图边界
- `staged-only` 下 staged 和 unstaged 交错，无法判断是否误暂存
- 一个文件同时承载两个独立目的，且需要 hunk 级拆分
- 你需要执行高风险重暂存动作才能得到原子提交
- `all-changes` 下只有通过猜测用户意图才能决定哪些未跟踪文件应该纳入哪个 commit
- 活动变更里有未确认的大文件、二进制产物、缓存、录屏、模型权重、打包输出或下载文件；必须先逐项确认是提交、忽略、留在本地，还是迁移到 Git LFS / 外部产物存储

## 输出拆分计划时应包含

1. 建议拆成几个 commit
2. 每个 commit 的文件边界或变更主题
3. 每个 commit 的候选 `type(scope): subject`
4. 为什么当前活动变更集合不适合直接提交
5. 对大文件或生成产物，列出每个风险路径、建议处理方式，以及候选 `.gitignore` pattern（如果应忽略）

## Atomic 校验三问

每个候选 commit 在提交前用三问自检，三者皆 yes 才放行：

1. **能否独立编译？** 该 commit 节点上代码可编译、测试可通过。
2. **能否独立 revert？** `git revert <sha>` 撤回该 commit 不会让仓库进入不一致状态。
3. **能否独立解释意图？** 一行 subject + 一行 Why 足够说清该 commit 干什么、为什么。

任何一问答 no，回到拆分计划层。

## Checkpoint vs Atomic

两者互补，关注点不同：

| 维度 | Checkpoint Commit | Atomic Commit |
|------|-------------------|---------------|
| 关注点 | 进度记录 | 语义边界 |
| 触发时机 | 长任务的阶段性存档 | 单个完整变更 |
| 是否要求可编译 | 不强制 | 必须 |
| 是否进入最终历史 | 否（合并前 squash） | 是 |
| Header 形式 | `chore(wip): [AI] 🔧 [WIP] <subject>` | `<type>(<scope>): [AI?] <emoji?> <subject>` |
| Why 强制 | 否 | feat/fix/refactor/perf 强制 |

checkpoint 在任务进行中保存现场，最终通过 interactive rebase 整理为一组语义清晰的 atomic commit 再合并到主干。本 skill 不直接执行 rebase，但会在 verify 阶段提示用户「该分支含 N 个 [WIP] commit，合并前需 squash」。

## 经验规则

- 原子性优先于“提交数量少”
- 功能变更和机械性改动优先拆开
- docs/test 可以跟随功能提交，但前提是它们直接服务于该功能
- `all-changes` 模式可以覆盖当前 index，但不能覆盖不清晰的意图边界
- `all-changes` 模式也不能覆盖大文件安全门；不要因为用户说“所有改动”就默认提交全部大文件
- 大型生成产物通常先考虑 `.gitignore`、Git LFS 或 release/artifact 存储，只有用户逐项确认后才进入 commit
- 当不确定时，先停在计划层
- checkpoint 不需要 atomic，但**最终留在历史里的 commit 必须 atomic**
