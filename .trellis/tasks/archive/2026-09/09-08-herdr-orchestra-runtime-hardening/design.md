# Design: herdr-orchestra 运行时路由与检测恢复

## Boundaries

只改 `skills/developer-tools-integrations/herdr-orchestra/` 的指令契约、evals 与报告。不新增 scripts、不改官方 Herdr skill、不改本机 integration 文件。

事实归属：

| 事实 | 唯一位置 |
| --- | --- |
| Surface 选择规则、start 失败检查、未登记 identity 禁止项、wait 标记不变量 | `references/delegation.md` |
| 根路径顺序（先选 surface 再执行） | `SKILL.md` Compact Workflow，指向 delegation，不复述长规则 |
| POSIX/PowerShell 示例、标记构造、超时后检查命令 | `references/patterns-and-recovery.md` |
| omp/`bun.exe`/谷歌模型 | 仅 `evals/evals.json` fixture 与本任务 research |

## Surface selection

在确认 `HERDR_ENV` 和 caller 之后、`agent start` 之前判定：

1. 用户明确要求启动该 kind 的交互 TUI/Agent → **agent surface**。
2. 否则阅读该 kind 当前 `--help`。若存在已文档化的非交互调用（子命令或 `-p`/`--print`/`exec` 等），其 stdout/exit 能满足本任务验收 → **pane surface**。
3. 其余 → **agent surface**。

不在 skill 正文枚举 kind 子命令表。`omp models` 只作为 AC1 fixture。

Pane surface 仍用本任务 sibling pane：`--current`、显式 cwd、`--no-focus`、确认前台 shell。执行 `pane run`，用退出后的输出和完成标记收集结果。不得用 agent idle/done 代替命令结束。

Agent surface 保持现有 `agent start` + 确认 ready identity + 一次 `agent prompt --wait`。

## Unregistered identity

`agent start` 返回 timeout / not-ready / 非零，或 name 随后 `agent_not_found` 时：

1. 只检查本任务创建的 pane：`pane get`、`process-info`、passive `visible`/`detection`、`agent get`、`herdr integration status`。
2. 子进程可能是 bun/node/python shim，而标题/TUI 显示 kind。这是诊断，不是换 transport 的授权。
3. 预期 kind 未成为 Herdr 可寻址 identity（unique live name 或已宿主该 agent 的 pane）时停止输入。
4. 禁止：`agent prompt`、raw `pane send-text`/`send-keys`/`pane run` 把 assignment 打进该 TUI、`pane report-agent` 冒充集成、再 split 第二个 worker、超时后再跑 kind CLI。
5. receipt：lifecycle 与可见证据分开；任务状态 incomplete。保留该 pane。

`H07-unknown` 仍适用于已登记但 state=unknown 的 worker。本设计覆盖 **name 从未登记或已被 timeout 丢掉** 的启动失败。

## Wait marker

`pane wait-output --match TEXT` 在 TEXT 已出现于刚发送的命令行时会立即命中。不变量：wait needle 不得作为子串出现在已发送命令文本中。

允许：对 needle 做运行时拼接，使命令源码不含完整连续 needle；或等待该命令自身的最后一行/回到 prompt，且该行不是命令原文。示例只放 patterns。

## Compatibility

- 保留 H01–H12 与四个 routing-negative。新案例 H13–H15 只加不改旧断言。
- `codex-review` 仍走 agent surface + 既有 native argv；本任务不改其 handoff 语义。
- description 不扩大到「列出当前 pane」类官方 herdr 查询，避免 route-pane 误伤。
- version `0.1.0` → `0.2.0`。docs catalog 的版本列由 `just docs-sync` 再生，禁止手改 `docs/`。
- 不补 README/manifest。qiaomu `validate_skill.py` 缺这两项保持为已知 schema 偏差。
- 不重跑 prior-art 目录。`reports/creation-handoff.md` 增加本迭代说明，并保留 live Herdr 为 missing evidence。

## Data flow

```
assignment
  → env/caller
  → surface = pane | agent
  → one owned sibling
  → pane: run + non-colliding wait + output
  → agent: start + ready identity + prompt
  → start/identity fail: inspect same pane → incomplete
  → receipt (identity, lifecycle, response, coverage)
```

## Rollback

丢弃本包 diff 即回 `0.1.0` 行为。无数据迁移。不回滚本机 Herdr 集成（本任务不改它）。
