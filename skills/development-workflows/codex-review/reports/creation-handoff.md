# Creation handoff

`codex-review` **0.1.0** 源码位于 `skills/development-workflows/codex-review/`。通过已加载 `herdr-orchestra` 的单一 delegation 契约启动一个交互 Codex reviewer，本包负责范围、只读 leaf、findings 和父核验。未发布，未修改第三方同名安装。

## 学习与贡献

- [inbeomheo/herdr-orchestra](https://github.com/inbeomheo/herdr-orchestra)：保留 conductor 的明确 assignment，拒绝旧轮询、focus-as-caller、自动 trust、固定模型及强制 commit。
- [Official Herdr skill](https://github.com/herdrdev/herdr/blob/v0.8.2/skills/herdr/SKILL.md)：使用 native identity/readiness/receipt 语义，统一交给 orchestra；只读特化为同 worker 编号重述，不扩大 sandbox 写文件。
- 仓库 `codex-bridge`：采用显式意图、父核验与防递归；保留其非 Herdr bundle 路由，不复制持久 bundle 或实现轮次。
- 已安装第三方 `codex-review` stub：识别同名 discovery 冲突及广告中的 CHANGELOG 行为；不推断未读上游，不修改激活。

来源、日期、指标边界与 keep/adapt/reject/invent 见 [prior-art](prior-art-research.md)。原创连接是让六字段 handoff 承载固定 scope、只读 leaf 和完整报告验收，同时 orchestra 独占进程控制。

## 优势与证据

- **design advantage**：current/staged-only/base/commit/files/plan 语义明确，父 Agent 比较内容证据以发现 HEAD 不变时的范围漂移；lifecycle 与 findings 验收分开。
- **validated advantage**：仅限 [output-eval](output-eval.md) 中 27 个 source-guided 候选 trace 与契约的手工一致性，不是与竞品的公平效果比较。
- **hypothesis**：no-alt-screen 与同 reviewer 编号重述提高结果完整性；Herdr detection、实际恢复和模型质量仍是 missing evidence。

## 实际本地检查

以下实际命令使用已解析 qiaomu 脚本绝对路径、本包绝对路径和 cases 绝对路径，报告保存于本包；占位路径是复现说明，不是安装位置假定。

- `validate_skill.py <skill-dir>`：退出 1，`ok: false`；仅缺 `README.md` 与 `manifest.json`，`warnings: []`。这是已批准的两项仓库 schema 差异，不是完整 qiaomu package pass。
- `trigger_eval.py <skill-dir> --cases <absolute-cases> --output <absolute-report>`：退出 1，17 条中 13 条通过，0 false negative、4 false positive，`ok: false`；原始 [trigger report](trigger-eval.json) 保留失败。
- `export_skill_ir.py <skill-dir> --output <absolute-report>`：退出 0，生成原始 [Skill IR](skill-ir.json)。
- `rtk proxy just skills-check`：退出 0，本包与当前仓库技能 metadata 通过。

触发 scorer 使用 Herdr 上下文、Codex reviewer、review 动作三个领域概念，threshold=1 要求三者同时命中，不用 qiaomu 创作默认词库或按个案增加 veto。它仍不能理解否定、角色和权限；四个误报的手工语义判定如下，均未运行 provider：

| 误报 family | 手工候选动作及判定 |
| --- | --- |
| research | “仅研究工作原理，读取资料，不启动 worker。”应不触发执行路线，PASS（手工） |
| leaf | “已是 reviewer，自己审查分配 patch，不再次调用技能。”应不触发编排，PASS（手工） |
| outside | “用户要求在 Herdr 外使用 Codex，保留非 Herdr workflow。”应不触发，PASS（手工） |
| auto-fix | “该请求含自动修复/CHANGELOG，交给相应有写权限的工作流，不将其塞入本只读 adapter。”应不按本包执行，PASS（手工） |

本仓库顶层 metadata、neutral interface 和 generated catalog 是权威；刻意不添加 per-package README/manifest 迎合 qiaomu schema。`evals/evals.json` 是手工行为 fixtures，`trigger_cases.json` 是不同格式的词法 smoke，二者都不是 provider 路由证明。

qiaomu exporter 从 manifest 读取 version/owner 等部分字段；保留生成 IR 的原始 null/default 值，`SKILL.md` 的 `version: 0.1.0` 才是本包版本事实。默认 target_users 也不是本包真实用户声明，不手改 raw IR 制造完整元数据。

父任务已完成独立 child/跨包检查、docs-sync 和最终 `just ci`（43 skills；Node 419 pass / 4 既有 skip / 0 fail）。隔离临时项目 installer 退出 0，两个新包 junction、根入口和 orchestra delegation 均可解析；原有第三方 review 入口 hash 未变。这只证明安装路径，未证明新会话 discovery。临时 junction 清理被自动审批以 `blocked by policy` 拒绝，目录保留，位置与完整记录见仓库父任务 `research/verification.md`。

真实 Herdr 控制/model run、认证、effective sandbox、实际 argv/失败组合、no-alt-screen readiness、完整检索与恢复、跨宿主加载、人工盲评和 telemetry 仍为 **missing evidence**。第三方同名入口仍需明确来源核验，本包不解决安装替换。未发布或提交。
