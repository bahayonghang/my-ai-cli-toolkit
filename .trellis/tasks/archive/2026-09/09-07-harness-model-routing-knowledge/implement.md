# Implementation plan

1. 获批后读取父任务、三项结果与现有 spec；核每个建议的批准范围（R3）。
2. 建立唯一 acceptance-ledger，仅记录已批准项的文件、命令、结果、适用工具及落点。
3. 写分工指南，链接 docs/harnesses 和既有 goal-meta/codex-bridge 专属事实，不复制模型或平台 registry（R1/R2）。
4. 更新 spec 索引、quality、authoring 和 error-handling，限本次观察到的失败模式（R4）。核旧规范 `.trellis/spec/backend/error-handling.md:28`、第 29/41 行，修正宿主协议例外及阻断例，确保与 C1 已验证行为一致。
5. 强模型独立走读 AC1—AC3，确认无把推论写成平台保证；便宜模型可整理链接与英文措辞，不裁定证据。
6. `git diff --check`；父任务协调 `just ci`。若任一必须行为无直接证据，标 UNVERIFIED 并保留完成缺口，不新增未经授权的部署/全局写入。

## Verification scope

适用所有五工具的部分：批准边界、文件归属、强审查/窄执行、证据层次。
Claude 专属：stdin/退出码/hook 会话教训。
Codex 专属：AGENTS 与原生代理/共享 skills。
Grok/Kimi/OMP：仅保留本次核实的本产品机制，未核实项引用事实表状态。

## Delivery

用户批准项在本仓库的项目说明或 spec 完成回写即满足知识落点要求；不自动复制到外部知识库。最终结论明确四子项和父项状态。
