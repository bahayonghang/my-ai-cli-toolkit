# Codex Companion

`codex-companion` 是给 Codex 使用的 companion runtime skill，用来在 Codex 会话里提供更接近 `codex-plugin-cc` 的运行能力，而不是单次 `codex review` / `codex exec` 包装。

它和同目录下的相关 skill 分工不同：

| Skill | 定位 | 适合场景 |
|---|---|---|
| `codex` | 一次性 Codex CLI 包装 | 直接跑 `codex review` / `codex exec` |
| `codex-companion` | companion runtime | 后台任务、可恢复 task 线程、job 生命周期管理、结构化对抗审查 |
| `claude-code-companion` | Claude Code companion workflow | 在 Claude Code 内做分阶段 review / 实现 / 续接 |
| `gemini-companion` | Gemini companion workflow | 在 Gemini CLI 内做 review-first 与 bounded follow-up |
| `qwen-companion` | Qwen companion workflow | 在 Qwen CLI 内做分阶段执行与显式续接 |

## 快速开始

```bash
node "$SKILL_DIR/scripts/codex-companion.mjs" review --base main       # 1. 审查变更
node "$SKILL_DIR/scripts/codex-companion.mjs" task "fix the bug"       # 2. 委派任务
node "$SKILL_DIR/scripts/codex-companion.mjs" status                   # 3. 查看进度
node "$SKILL_DIR/scripts/codex-companion.mjs" result <job-id>          # 4. 获取输出
```

## 功能说明

核心能力由 `scripts/codex-companion.mjs` 提供：

| 子命令 | 作用 | 只读？ | 常见参数 |
|---|---|---|---|
| `review` | 对当前工作区或 `--base <ref>` 做内置只读 review | 是 | `--base <ref>` `--scope ...` |
| `adversarial-review` | findings-first 的对抗式 review，找隐藏回归、竞态、边界条件、缺失测试 | 是 | `--base <ref>` `--scope ...` `[focus text]` |
| `task` | 把诊断、研究或实现任务委派给持久化 Codex 线程 | 可配置 | `--write` `--background` `--resume-last` `--model` `--effort` |
| `status` | 查看当前 workspace 的运行中和最近任务 | 是 | `[job-id]` `--wait` `--json` |
| `result` | 读取已完成任务的持久化输出 | 是 | `[job-id]` `--json` |
| `cancel` | 中断并取消运行中的任务 | N/A | `[job-id]` `--json` |

## 结构化输出

所有命令都支持 `--json` 以获得机器可读输出。对抗审查返回匹配 `schemas/review-output.schema.json` 的结构化结果：

- **verdict**: `approve` 或 `needs-attention`
- **findings[]**: 包含 `severity`、`title`、`body`、`file`、`line_start`、`line_end`、`confidence`、`recommendation`
- **summary**: 简洁的 ship/no-ship 评估
- **next_steps**: 建议后续操作

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

## 错误恢复

| 问题 | 解决方案 |
|---|---|
| Codex 未安装 | 运行 `npm install -g @openai/codex` |
| Codex 未认证 | 运行 `codex login`（浏览器被阻止时用 `codex login --device-auth`） |
| 任务执行中失败 | 用 `status <job-id>` 查看错误详情；用 `task --resume-last` 从上次线程重试 |
| `state.json` 损坏或丢失 | runtime 会自动从独立 job 文件恢复；若全部丢失，开始新的 `task` |
| Broker 进程无响应 | 终止残留进程后重试，broker 会自动重启 |

## 设计边界

| 边界 | 说明 |
|---|---|
| `review` / `adversarial-review` | 始终保持只读 |
| `task --write` | 只在用户明确要求 Codex 改文件时使用 |
| Job state | 默认按 workspace 存在系统临时目录，最多保留 50 个 job |
| 非目标范围 | 不包含 Claude 专属 `.claude-plugin`、hooks、stop-time review gate |
| 调试模式 | 设置 `DEBUG=1` 环境变量可在错误时输出完整堆栈跟踪 |
