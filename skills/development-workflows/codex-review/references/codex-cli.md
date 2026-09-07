# Codex CLI 与 transport 边界

Last verified: 2026-09-08，父任务本机 `codex-cli 0.153.4` 的 `--version`、root/review/exec/exec-review help，及当日读取的官方资料。该日期是核验日期，不是文档发布时间。执行新任务时按当前安装的 `codex --help` 重核参数；help 不能证明模型、sandbox、Herdr detection 或完整输出已实际运行。

## 本包只选择交互路径

无 subcommand 的 Codex 是交互 CLI。本包交给 orchestra 的 native argv 是：

```text
--sandbox read-only --ask-for-approval never --no-alt-screen
```

orchestra 按它自己的 delegation 契约将这些参数逐项放在原生参数分隔符之后，负责 cwd、分配、启动、readiness 和任务投送。本包不复制控制命令。用户指定模型时增加 `--model` 与其实际值，否则不覆盖配置；不硬编码模型名称。

`read-only` 表达命令访问限制，`never` 是独立的审批策略，不是自动批准或权限放宽。`--no-alt-screen` 在本机 help 中表示保留普通 scrollback；它与 Herdr 的检测/读取配合仍需真实运行。进程可能写自身 session metadata，外部工具的 enforcement 也不能由 sandbox 参数推定；语义 assignment 始终禁止范围外操作。模式无法生效时返回限制，不加 full-access、bypass、add-dir、config override 或自动 trust 回答。

完整审查任务通过交互 prompt 提交。它是自然语言审查，不能宣称已执行专用 `/review` preset，也不驱动选择框。启动未 ready、blocked 或 timeout 都交回 orchestra 的既有身份处理，不静默切换 transport。

## 相邻接口事实（不提供执行 fallback）

| 接口 | 已核验边界 |
| --- | --- |
| `codex review` | 非交互；目标 `--uncommitted`、`--base`、`--commit` 与自定义 PROMPT 互斥，`--title` 依赖 `--commit`。本机其 help 不列 `--json` 或 `--output-last-message`。 |
| `codex exec` / `exec review` | 非 TUI，一次性任务。exec help 有 sandbox/cd；approval 是 root 选项；exec-review help 有输出/JSON/model 等选项。目标与 prompt 的运行拒绝矩阵未实测。 |
| 交互 `/review` | 官方专用审查入口含 preset 选择；本包采用普通交互任务文本，未调用该入口。 |

这些 one-shot 子命令不能作为等待交互 readiness 的启动参数。本 MVP 不实现第二条 runner。`--uncommitted` 涵盖 staged、unstaged、untracked，不是 staged-only；本包在 prompt 明确自己的目标，不拼接 native review 目标参数和自定义 PROMPT。

## 来源与缺口

- [Developer commands](https://learn.chatgpt.com/docs/developer-commands?surface=cli)：目标参数与 PROMPT 限制。
- [Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode)：一次性 exec 与输出语义。
- [Code review](https://learn.chatgpt.com/docs/code-review)：专用交互审查与 presets。
- [Sandbox](https://learn.chatgpt.com/docs/sandboxing)：sandbox 与 approval 的不同职责。
- [Herdr Agent automation](https://herdr.dev/docs/agent-automation/)：某些 deep recent 读取可隐式滚屏，不能把名称为 read 的调用一概当作被动操作；执行路径遵循 orchestra 的访问边界。

父任务保存的 local help 与实际打开的网页构成本引用依据；未重复进行账户、模型或 pane 操作。认证、effective sandbox、真实参数组合、no-alt-screen readiness、完整检索、截断恢复、跨宿主加载和同名入口解析均为 **missing evidence**。
