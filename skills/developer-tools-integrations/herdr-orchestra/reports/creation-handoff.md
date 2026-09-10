# Creation handoff

`herdr-orchestra` **0.2.0**：在 Herdr 内委派有范围的 worker 任务，分开回传 lifecycle、响应和验收证据；本迭代收紧 surface 选择与未登记 identity 的 incomplete 契约。源码位于 `skills/developer-tools-integrations/herdr-orchestra/`；本次未发布，也未修改已安装 skill、官方 Herdr skill 或本机 herdr 集成。

## 0.2.0 契约收紧

根 Compact Workflow 在创建 sibling 与 `agent start` 之前选择 pane 或 agent surface。用户明确要求交互 TUI/Agent 则 agent；否则 kind 原生非交互命令能满足验收则 pane；其余 agent。规则真源是 `references/delegation.md`；POSIX/PowerShell 示例在 `references/patterns-and-recovery.md`。

产品决定 Q1（2026-09-08）：`agent start` 超时、TUI 可见、Herdr 未登记 identity 时，只检查同一 pane 并 incomplete。禁止 CLI 回退、raw pane 输入、`report-agent` 冒充、自动第二 worker。

qiaomu 泛化：omp / `bun.exe` / 谷歌模型表不得升为核心规则，只作为 `evals/evals.json` fixture。升为核心规则的是 start 前选择 surface、未登记 identity 不得 prompt、检查已创建 pane（name 可已丢失）、wait 完成标记不得出现在已发送命令文本。新增 H13–H15；H01–H12 断言未改。

Live Herdr 检测、provider/model 执行、runtime argv、new-session discovery 仍为 **missing evidence**。本包不补 README/manifest。

## 参考学习与取舍

- [inbeomheo/herdr-orchestra](https://github.com/inbeomheo/herdr-orchestra)：学习 conductor 的分工/依赖；落到 patterns。拒绝 focus-as-caller、自动 trust、旧版轮询与强制 commit。
- [Official Herdr skill](https://github.com/herdrdev/herdr/blob/v0.8.2/skills/herdr/SKILL.md)：学习 caller、返回 ID、agent 生命周期与 ownership；落到 delegation。结合最新文档限制隐式滚屏，保持只读 fallback 权限。
- 仓库 `codex-bridge`：学习显式请求、父 Agent 核验及避免递归；只取语义机制，不引入 bundle/model 表。
- 已安装第三方 `codex-review` stub：仅用作相邻路由与同名加载风险证据，不归因未研读上游能力，不改写其安装。

详细日期、来源、指标解释与 keep/adapt/reject/invent 见 [调研报告](prior-art-research.md)。原创连接是一处文本 handoff，让 Codex consumer 声明 native argv、leaf、范围和只读完整响应约束，由 orchestra 统一负责 transport。

## 优势与验证边界

- **design advantage**：唯一 delegation contract，调用者/transport/review 责任明确；显式防止旧输出、替换 occupant 和未经授权的 trust 被当成成功。
- **validated advantage**：仅限 [output-eval](output-eval.md) 中 29 条 source-guided 候选 trace 与 assertions 的手工一致性；不是与其他工具的效果比较，也不是 live Herdr 证明。
- **hypothesis**：no-alt-screen 和分段重述有望提高只读审查结果完整性；实际 detection、输出恢复、成本与跨平台模型表现是 **missing evidence**。

## 本地检查

以下命令从仓库运行，以已解析 meta package 的绝对脚本路径与本包绝对路径为参数；报告只保存可移植路径。`evals/evals.json` 是手工行为 fixtures；`trigger_cases.json` 是不同格式的 qiaomu 词法 smoke，不能代替 provider 路由评估。

- `trigger_eval.py <skill-dir> --cases <absolute-cases> --output reports/trigger-eval.json`：16 条中 13 条词法通过，0 false negative、3 false positive，工具报告 `ok: false`。三个误报分别是只研究文档、已是 leaf、显式 outside Herdr；计分器只看两个概念族，不理解否定/角色。description 和 Router Rules 均明确排除三者；手工语义判定应不触发。保留失败原样，不加针对案例措辞的 veto 来刷分；provider 路由仍未验证。
- `validate_skill.py <skill-dir>`：实际报告 `ok: false`，仅缺少 `README.md` 和 `manifest.json` 两项批准 schema 差异，`warnings: []`。
- `export_skill_ir.py <skill-dir> --output reports/skill-ir.json`：退出 0，已生成原始 IR；字段缺省限制见下文。0.2.0 重跑同一命令，`compact_workflow` 与根 `SKILL.md` 对齐；`package.version` 仍为 null。
- `just docs-sync`：catalog 中文/英文页版本列为 `0.2.0`。
- `just skills-check`：退出 0，本包 OK。0.2.0 未重跑 `trigger_eval.py`。

本仓库明确用顶层 metadata、neutral interface 和 generated catalog，故不添加 per-package README/manifest 来迎合 qiaomu schema。qiaomu exporter 的部分字段只从 manifest 取值；生成 IR 的 version/owner 等 null 和默认 target_users 不代表本包声明这些值，`SKILL.md` 的 `version: 0.2.0` 才是仓库事实。保留原始生成报告，不手改成假的完整导出。

父任务已完成独立 child/跨包检查、docs-sync 和最终 `just ci`（43 skills；Node 419 pass / 4 既有 skip / 0 fail）。隔离临时项目 installer 退出 0，本包 junction、根入口与 delegation 引用均可解析，原有第三方 review 入口 hash 未变；这只证明安装路径，未证明新会话加载。临时 junction 清理被自动审批以 `blocked by policy` 拒绝，目录保留，位置与完整记录见仓库父任务 `research/verification.md`。

真实 Herdr 会话/model run、runtime argv/错误组合、effective sandbox、new-session discovery、人工盲评和 telemetry 仍为 **missing evidence**。未发布或提交。
