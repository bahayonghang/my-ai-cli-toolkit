# 修复 Claude Hook 协议与运行契约

## Goal

让仓库导出的 Claude hook 在官方事件输入下执行其声明的阻断和会话隔离行为。

## Confirmed facts

- `platforms/claude/hooks/pre-bash.py:19` 只读 argv；第 24 行返回非阻断码 1。父任务 `research/test-baseline.md` 已记录安全复现。
- `platforms/claude/hooks/log-prompt.py:17` 依赖 SSE port，两个官方 session_id 的事件落入同一 default 日志。
- `platforms/claude/hooks/hooks.json:12` 仍调度已废弃的 no-op；第 2 行声明不存在的 session review。

## Requirements

- R1：仅适用于 Claude Code，按官方 stdin 事件接收命令；命中既有规则时返回阻断决定。
- R2：日志按官方 session_id 分离；不存在 Stop 处理时，不宣传自动 session review。
- R3：明确源目录、解释器与含空格路径语义；废弃 no-op 不再调度。
- R4：离线回归覆盖输入、退出码、会话隔离；命令文本始终为数据。

## Acceptance Criteria

- [x] AC1（R1）：stdin JSON 命中既有规则返回 2；安全命令返回 0；坏事件返回可诊断的阻断结果，不因异常退出 1 被宿主视为非阻断。
- [x] AC2（R2）：两个不同 session_id 生成两个日志；同一 session_id 追加自身文件；测试不接触真实会话日志。
- [x] AC3（R2、R3）：配置不依赖 CLAUDE_TOOL_INPUT；含空格路径可解析；无 no-op 接线与未实现的 Stop/session review 声明；配置 JSON 与声明的源部署布局一致。
- [ ] AC4（R4）：hook 回归、JSON parse、`just python-check` 通过（16 tests OK；json.tool 0；python-check 0）。`just ci` 由父项在 C2 docs-sync 后作为发布门运行。真实 Claude 接线 UNVERIFIED。

## Dependencies and scope

用户批准后实施，无前置子项。测试总门由 `09-07-harness-verification-coverage` 接入，公开说明由 `09-07-harness-guidance-alignment` 同步。

不扩充危险命令规则、不构建 shell 安全解释器、不移植到另四工具、不安装插件或修改全局 settings、不恢复 Stop 自动审查。批准包含删除废弃 no-op 源文件，不保留旧 argv 兼容层。
