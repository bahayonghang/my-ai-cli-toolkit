# 优化 goal-meta-skill：Trellis 提交归档节奏与终稿展示

## Goal

让 `goal-meta-skill` 在用户要把「实施 Trellis 任务或子任务」写成 `/goal` 时，产出可执行、可验证的合同：每完成一个 Trellis 任务先提交该任务相关改动，再归档；父任务归档推迟到发布门之后。同时让终稿 `/goal` 便于人阅读和改稿。

用户价值：用 `/goal` 跑 Trellis 实施时，不会把产品提交和归档提交搅在一起，也不会中途归档父任务弄断子任务链接；人改终稿时能按字段定位，而不是对着一整块密文猜。

## Background

- 包路径：`skills/developer-tools-integrations/goal-meta-skill/`，当前 `version: 0.3.0`，自称为 production-lite。
- 权威输出形状：`推荐执行版（中文，可直接复制）` → `默认选择理由` → `可选调整` → `你可以直接回复` → `Goal Draft (English-compatible)`。`scripts/lint_goal_command.py` 按该顺序硬校验。
- 终稿规则现状：`references/default-goal-strategy.md` 的 Finalization Rule 要求用户确认后输出 `最终可复制 /goal`，回复几乎只留一个 code block。
- `/goal` 长度测量：linter 从 `/goal` 行读到下一个空行。可复制正文内部若插入空行，长度检查与粘贴块会截断。
- 现有 evals：`evals/evals.json` 共 14 条。CI 不执行该文件；回归靠手审 + `tests/lint-goal-command.test.mjs`。
- 本任务是既有包的增量完善，不是新 skill，也不是公开发布。qiaomu-meta 的 prior-art 全量检索对本增量不适用。
- Trellis 归档语义见 `research/trellis-archive-semantics.md`。`task.py archive` 会移动任务目录并自动提交；归档仍带 `children` 的父任务时，会把仍找得到的子任务 `parent` 写成 `null`。

## Requirements

### R1 Trellis 实施合同注入（条件触发）

当本次 `/goal` 的工作是实施 Trellis 任务或子任务时，生成的合同必须写入下列节奏：

1. 每完成一个可独立验收的 Trellis 任务（叶任务或子任务）：先提交该任务相关产品改动，再运行 `python ./.trellis/scripts/task.py archive <task-dir>`。
2. 归档发生在产品提交之后。归档由 `task.py archive` 移动目录并自带一次归档提交；产品改动不得混进这次归档提交。
3. 父任务归档显式推迟到发布门之后。发布门通过之前，禁止归档父任务。

触发条件（满足任一即可）：

- 用户写明要实施 Trellis 任务、子任务、或 named `.trellis/tasks/<dir>`。
- 只读侦察发现 `.trellis/tasks/`，且本次 outcome 就是执行该任务树。

仅仓库里存在 `.trellis/`、但本次 outcome 是普通修 bug / 写文档 / 非任务实施，不注入本规则。

### R2 提交与归档顺序

产品提交（对应 Trellis Phase 3.4 的工作提交）必须先于 `task.py archive`。

生成的 `/goal` 须写明：

- 提交范围限于该任务相关改动；不 push。
- 任务范围外的脏文件：写入暂停条件（Codex）或停止并报告（Claude Code）。
- 禁止 `git add -f .trellis/`。
- 归档提交由 `task.py archive` 产生，执行方不得把产品文件塞进归档提交。

### R3 父任务与发布门

父任务归档同时满足：

1. 全部子任务已各自归档。
2. 父任务自身直接改动（若有）已提交。
3. 发布门已通过，或缺失检查已明确报告并进入暂停 / 停止-报告。

发布门：goal 里命名的父级验证或发布检查。命令来自侦察；用户点名的检查优先。本仓库无额外点名时，默认 `just ci`。发布门不是「子任务一完成就归档父任务」，也不是「必须等到 GitHub Release」，除非本次 goal 本身就是发布任务。

### R4 终稿展示（人读改稿）

S6 终稿必须同时提供：

1. 可复制层：一个 `text` 围栏，内含完整 `/goal` 正文。围栏内字段分行、无空行，以保持粘贴块与 linter 测量完整。
2. 人读层：紧挨围栏的 `字段一览`，按 Outcome / 验证 / 约束 / 边界 / 迭代策略 / 完成条件 / 暂停条件（及 Trellis 节奏，若已注入）列出摘要，便于人按字段改稿。

S4 草案同样把 `/goal` 正文放进 `text` 围栏。companion 标题字面量不得改。可执行草案不得出现 `[占位符]`、`<占位符>`、`待定`、`TBD`。

`字段一览` 只活在围栏外，不计入 `/goal` 4,000 字符。

### R5 资产同步

- 判断下沉到 references；`SKILL.md` 只保留触发、最短流程、输出约束。
- 新增或更新 `evals/evals.json` 行为夹具，覆盖：Trellis 子任务提交后归档、父任务推迟到发布门、非 Trellis 实施不注入、终稿围栏 + 字段一览。
- 现有 14 条 eval 断言不回退。
- `version` 0.3.0 → 0.4.0。frontmatter 或 catalog 可见元数据变更后跑 `just docs-sync`。
- 保持现有 `allowed-tools` 只读白名单。本 skill 仍然只起草 `/goal`，不代跑 `git commit` 或 `task.py archive`。

## Constraints

- 不回退：懒人快路径、双语契约、平台事实单源、stop-and-report、4k / file-pointer、风险分级、侦察只读。
- Trellis 节奏是可选适配器，不是所有 `/goal` 的核心规则。
- 不新增 README.md / manifest.json（本仓库 catalog skill 的既有偏差）。
- 不公开发布、不改 Trellis 运行时脚本。
- 遵守 `.trellis/spec/guides/skill-authoring-conventions.md` 与 `skills/developer-tools-integrations/AGENTS.md`。

## Out of Scope

- 修改 `.trellis/scripts/task.py` 或其归档实现。
- 让 goal-meta-skill 自己执行提交或归档。
- 把 git-commit skill 写进每条 `/goal`。
- 父/子任务依赖调度系统（Trellis 树不是依赖系统；顺序写在合同正文）。
- 为展示效果改 `/goal` 字段集合或平台管理命令。
- qiaomu 发布、Skill IR 导出、trigger_eval 全量重跑（description 路由面不因本增量改变；若 description 必须补中文触发词，另记验证命令）。

## Acceptance Criteria

- [ ] A1 对「实施 Trellis 子任务」类请求，推荐 `/goal` 的迭代策略或完成条件写明：每完成一个任务先提交相关改动，再 `task.py archive`。
- [ ] A2 同一 `/goal` 写明父任务归档推迟到发布门之后；发布门用侦察到的或用户点名的父级检查命名。
- [ ] A3 对普通非 Trellis 实施请求，即使侦察到 `.trellis/`，也不注入归档节奏。
- [ ] A4 S6 终稿含 `最终可复制 /goal`、完整 `text` 围栏、围栏外 `字段一览`；围栏内 `/goal` 无空行。
- [ ] A5 companion 标题顺序与 linter 硬校验保持一致；`--require-chinese-companion` 旧夹具仍通过。
- [ ] A6 `evals/evals.json` 新增覆盖 A1–A4 的夹具；既有 id 1–14 断言不删不弱化。
- [ ] A7 `version` 为 0.4.0；`just skills-check`、`just node-test`、`just python-check`、`just ci` 通过。
- [ ] A8 自 lint 至少覆盖 Codex 与 Claude 各一份 Trellis 实施样例（Claude 样例含轮次边界与停止-报告）。

## Decisions

1. Trellis 节奏仅在「实施 Trellis 任务或子任务」时注入。
2. 归档在产品提交之后，因为 `task.py archive` 会移目录并自带提交。
3. 父任务归档推迟到发布门之后，避免中途归档清空子任务 `parent` 并移动父目录。
4. 终稿采用双层展示：围栏可复制 + 围栏外字段一览。不在 `/goal` 正文内插空行。
5. 发布门 = goal 中命名的父级验证/发布检查；本仓库默认 `just ci`。

## Notes

复杂任务：本文件只含需求与验收。技术边界见 `design.md`，执行清单见 `implement.md`。
