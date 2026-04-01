# Codex Companion

`codex-companion` 是给 Codex 使用的 companion runtime skill，用来在 Codex 会话里提供更接近 `codex-plugin-cc` 的运行能力，而不是单次 `codex review` / `codex exec` 包装。

它和同目录下的 `codex` skill 分工不同：

| Skill | 定位 | 适合场景 |
|---|---|---|
| `codex` | 一次性 Codex CLI 包装 | 直接跑 `codex review` / `codex exec` |
| `codex-companion` | companion runtime | 后台任务、可恢复 task 线程、job 生命周期管理 |

## 功能说明

核心能力由 `scripts/codex-companion.mjs` 提供：

| 子命令 | 作用 | 常见参数 | 典型用法 |
|---|---|---|---|
| `setup` | 检查本机 `codex` CLI、登录状态、`npm`、app-server 能力 | `--json` | `node "$SKILL_DIR/scripts/codex-companion.mjs" setup` |
| `review` | 对当前工作区或 `--base <ref>` 做内置只读 review | `--base <ref>` `--scope ...` | `node "$SKILL_DIR/scripts/codex-companion.mjs" review --base main` |
| `adversarial-review` | findings-first 的对抗式 review，找隐藏回归、竞态、边界条件、缺失测试 | `--base <ref>` `--scope ...` `[focus text]` | `node "$SKILL_DIR/scripts/codex-companion.mjs" adversarial-review --base main` |
| `task` | 把诊断、研究或实现任务委派给持久化 Codex 线程 | `--write` `--background` `--resume-last` `--model` `--effort` | `node "$SKILL_DIR/scripts/codex-companion.mjs" task --background --write "implement the approved refactor"` |
| `status` | 查看当前 workspace 的运行中和最近任务 | `[job-id]` `--wait` `--json` | `node "$SKILL_DIR/scripts/codex-companion.mjs" status` |
| `result` | 读取已完成任务的持久化输出 | `[job-id]` `--json` | `node "$SKILL_DIR/scripts/codex-companion.mjs" result <job-id>` |
| `cancel` | 中断并取消运行中的任务 | `[job-id]` `--json` | `node "$SKILL_DIR/scripts/codex-companion.mjs" cancel <job-id>` |

## 调用方式表

| 调用层 | 写法 | 适用场景 |
|---|---|---|
| 显式 skill 调用 | ``$codex-companion 对当前仓库做 adversarial-review，重点看隐藏回归、竞态和缺失测试`` | 想强制走这个 skill |
| 直接 runtime 调用 | ``node "$SKILL_DIR/scripts/codex-companion.mjs" adversarial-review --base main`` | 需要最稳定、最接近底层命令的方式 |
| Codex prompt/slash 调用 | `/codex-companion:adversarial-review --base main` | 安装了 prompt commands 后，想要接近 Claude Code 的 UX |

## 在 Codex 对话里如何调用

| 目标 | 对话写法示例 |
|---|---|
| 对抗式 review | ``$codex-companion 对当前仓库做 adversarial-review，重点看隐藏回归、竞态和缺失测试`` |
| 后台任务 | ``$codex-companion 把这个修复任务交给 Codex 后台执行，之后我要能看 status 和 result`` |
| 继续任务 | ``$codex-companion 继续上一次 Codex task，完成下一步最高价值动作`` |

## 设计边界

| 边界 | 说明 |
|---|---|
| `review` / `adversarial-review` | 始终保持只读 |
| `task --write` | 只在用户明确要求 Codex 改文件时使用 |
| Job state | 默认按 workspace 存在系统临时目录 |
| 非目标范围 | 不包含 Claude 专属 `.claude-plugin`、hooks、stop-time review gate |
