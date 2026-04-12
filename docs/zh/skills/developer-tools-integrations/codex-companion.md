# Codex Companion

当你希望在 Codex 里获得接近 `codex-plugin-cc` 的工作流时，使用这个 skill：本机检查、后台任务、可恢复的 Codex 委派，以及 `status / result / cancel` 这类任务生命周期管理。

这个 skill 是直接 [codex](./codex.md) skill 的 plugin-style 兄弟版本。

| Skill | 定位 | 最适合的场景 |
|---|---|---|
| `codex` | 直接 Codex CLI 包装 | 一次性 `codex review` / `codex exec` |
| `codex-companion` | companion runtime | 持久化后台任务、follow-up task 线程、plugin 风格的 review / task 编排 |

## 命令面

这个 skill 统一驱动：

```bash
node "$SKILL_DIR/scripts/codex-companion.mjs" <subcommand> [...]
```

| 子命令 | 作用 | 常见参数 | 示例 |
|---|---|---|---|
| `setup` | 检查 Codex CLI 就绪状态、登录态、npm、app-server 能力 | `--json` | `node "$SKILL_DIR/scripts/codex-companion.mjs" setup` |
| `review` | 对当前仓库或某个 base 分支做只读 review | `--base <ref>` `--scope ...` | `node "$SKILL_DIR/scripts/codex-companion.mjs" review --base main` |
| `adversarial-review` | 做攻击视角的 review，找隐藏回归、边界条件、竞态、缺失测试 | `--base <ref>` `--scope ...` `[focus text]` | `node "$SKILL_DIR/scripts/codex-companion.mjs" adversarial-review --base main` |
| `task` | 把诊断、研究或实现任务委派给持久化 task 线程 | `--write` `--background` `--resume-last` `--model` `--effort` | `node "$SKILL_DIR/scripts/codex-companion.mjs" task --background --write "implement the approved refactor"` |
| `status` | 查看运行中和最近任务 | `[job-id]` `--wait` `--json` | `node "$SKILL_DIR/scripts/codex-companion.mjs" status` |
| `result` | 读取已完成任务的持久化输出 | `[job-id]` `--json` | `node "$SKILL_DIR/scripts/codex-companion.mjs" result <job-id>` |
| `cancel` | 取消活动任务 | `[job-id]` `--json` | `node "$SKILL_DIR/scripts/codex-companion.mjs" cancel <job-id>` |

## 它相比 `codex` 多了什么

| 新增能力 | 为什么重要 |
|---|---|
| 后台任务 | 当前 turn 结束后任务还能继续跑 |
| `task --resume-last` | 可以继续同一条 Codex task 线程 |
| 按 workspace 持久化 job state | 后续可以按 job 查状态和结果 |
| `status / result / cancel` | 提供接近插件的生命周期操作面 |

## 用法总表

| 调用层 | 写法 | 示例 | 适用场景 |
|---|---|---|---|
| Skill | 在对话里显式点名 skill | ``$codex-companion 对当前仓库做 adversarial-review，重点看隐藏回归、竞态和缺失测试`` | 强制让 Codex 走这个 skill |
| Runtime | 直接调用脚本 | ``node "$SKILL_DIR/scripts/codex-companion.mjs" adversarial-review --base main`` | 最稳定、最接近底层命令 |
| Prompt command | 安装到 Codex 后的 slash-like 调用 | `/codex-companion:adversarial-review --base main` | 最接近 Claude Code 插件的 UX |

## 在 Codex 对话里怎么调它

| 目标 | 对话示例 |
|---|---|
| 对抗式 review | ``$codex-companion 对当前仓库做 adversarial-review，重点看隐藏回归、竞态和缺失测试`` |
| 后台委派任务 | ``$codex-companion 把这个修复任务交给后台 Codex task，并保留 job id 供我后续查看 status 和 result`` |
| 继续上次任务 | ``$codex-companion 继续上一次 Codex task，完成下一步最高价值动作`` |

## 说明

| 边界 | 含义 |
|---|---|
| `review` / `adversarial-review` | 保持只读，不自动修复 |
| `task --write` | 只有在用户明确要求 Codex 改文件时才使用 |
| Job state | 默认按 workspace 持久化到系统临时目录 |
| 非目标范围 | 不包含 Claude 专属 hooks 和 stop-time review gate |
