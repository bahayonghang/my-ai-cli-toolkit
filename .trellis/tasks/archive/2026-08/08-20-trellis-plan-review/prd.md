# 创建 Trellis 规划审阅 skill

## Goal

在 `skills/development-workflows/` 下新增一个 skill：给定一个 `.trellis/tasks/<task>/` 目录，
对其中的规划产物做独立审阅，输出带仓库证据的问题清单与结论行，不改写规划、不改代码、不启动任务。

## Background

用户的固定用法是让一个 agent 审阅另一个 agent 写的 Trellis 任务规划。这类审阅目前每次都靠临时
prompt 完成，规则不固定，覆盖面取决于当次发挥。

本次审阅 `clash-verge-ai-residential` 的 `08-20-settings-font-picker-repaint` 得到 7 条问题，
其中 3 条在实现阶段被实现者自行补救、补救内容不在规划里。这 3 条的共同形态是：
**验收标准写了规划正文没有给出机制的内容**。

- AC2 要求「字体列表滚动位置不被重置」，R3 只覆盖 `.workspace.scrollTop`，design.md 两处明确
  否认需要保留列表滚动；实现阶段自行加了 `data-report-scroll`。
- AC3 要求「中文输入法组合输入不被打断」，三处修复都不保护组合态。
- PRD 的 Confirmed facts 里「跳过推送不会让设置页任何可见内容滞后」是错的：设置页的「采集器」
  字段由 `refreshLivePage()` 内的 tray 拉取驱动，跳过后停止更新；实现阶段自行补了两处刷新。

另外发现的形态：design.md 的像素预算算式忽略 `box-sizing: border-box` 与随字号档变化的 `rem`，
结论靠 flex 收缩另一个机制成立；R1 有一句要求被 design.md 的「已考虑不做」直接否决；有一条 AC
的判据取决于验收时的滚动位置，不确定。

同时确认了一个应保留的做法：该规划 15 处以上 `path:line` 引用全部与改动前文件一致。这说明引用
核对是低成本高信号的机械检查。

## Confirmed facts

- 本仓库 skill 目录结构为 `skills/<category>/<skill-name>/SKILL.md`，类别目录固定，新增类别需
  同步四处（`.trellis/spec/guides/skill-authoring-conventions.md`）。审阅类 skill 归入
  `development-workflows`，该目录已有 `code-auditor`、`code-quality-review`、`unknowns-first`。
- `scripts/check.py` 只校验 SKILL.md frontmatter；`evals/evals.json` 不被 CI 执行，是人工评审资产。
- SKILL.md 中调用自带脚本必须用 `<skill-dir>` 占位路径；`$SKILL_DIR` 运行时未设置。
- `allowed-tools` 写成逗号分隔字符串；不得整体授予 `Bash(git *)`，只白名单只读子命令。
- 脚本产出文件必须由脚本自己以 `encoding="utf-8", newline="\n"` 写出，不依赖调用方 `>` 重定向。
- Windows 上 Python 读 UTF-8 文件需显式 `encoding="utf-8"`，否则按 GBK 解码报错。
- 编辑后的格式化钩子会重排 Markdown 表格与代码栅栏；含 ``` 的示例块需要 4 反引号外层栅栏。
- 目录检索（skillsmp，2026-08-20）显示 `mindfold-ai/trellis` 已发布 trellis-continue /
  trellis-brainstorm / trellis-before-dev / trellis-check 等 skill，其中没有规划产物审阅 skill。
- 先行研究已采集 10 个同类审阅 skill / agent 与 2 篇方法文章（见 `research/`）。

## Requirements

- R1：skill 落在 `skills/development-workflows/trellis-plan-review/`，入口 `SKILL.md`，frontmatter
  含 `name`、`description`、`category`、`tags`、`version`，`category` 与目录名一致。
- R2：审阅方法固定为分级 pass，每个 pass 有明确判据，覆盖以下七类检查：
  产物与占位残留、`path:line` 引用可解析、代码断言核对、事实与推论分离、
  AC 子句到需求与机制的追溯、量化论证复核、内部矛盾与判据确定性。
- R3：任务状态不是 `planning` 时，追加实现漂移检查：把实际改动与 design.md 的改动清单对比，
  标出计划外文件与计划外机制。
- R4：可机械判定的部分由自带脚本完成，输出 JSON；脚本自己写文件，不依赖 shell 重定向。
  脚本至少覆盖：产物存在性、模板占位残留、`path:line` 引用解析、`R\d+` / `AC\d+` 交叉引用。
- R5：输出契约固定：一行结论（`可执行` / `可执行但需修订` / `需返回规划`）、编号问题清单
  （位置、证据、影响、建议）、未能核实清单、可靠部分清单。
- R6：硬门：不改写规划产物、不改代码、不执行 `task.py start`。`allowed-tools` 不含写文件工具，
  只白名单只读 git 子命令。
- R7：无证据的条目不进问题清单；无法在本地核实的断言进「未能核实」清单，不按已确认陈述。
  输出中说明本 skill 与规划作者共享盲区，结论是待分诊列表而非批准。
- R8：路由边界写进 `description`：只审规划产物；纯 diff 审查交 `code-auditor` /
  `code-quality-review`；不承担写规划、修规划、执行任务。含中英文触发语。
- R9：不新增 skill 类别目录，不改动其他 skill，不引入仓库外的硬依赖。

## Acceptance Criteria

- [ ] AC1（R1）：`just skills-check` 通过，`category` 为 `development-workflows`，`description`
      无尖括号且不超过 1024 字符。
- [ ] AC2（R2）：`references/` 中每个 pass 都有判据与至少一个来自 font-picker 案例的具体例子；
      七类检查逐条可在 `SKILL.md` 与 `references/` 中定位。
- [ ] AC3（R3）：漂移检查有独立小节，写明触发条件（任务状态非 `planning`）与对比数据来源
      （design.md 改动清单 vs 只读 git 检查）。
- [ ] AC4（R4）：脚本对 font-picker 任务目录实测，能报出该任务 `implement.jsonl` /
      `check.jsonl` 的 `_example` 占位行，并解析出该任务的 `path:line` 引用与 R / AC 编号；
      `just python-check` 通过。
- [ ] AC5（R4）：脚本用 `--output` 自己写 JSON 文件，文件为 UTF-8、LF 换行；不用 `>` 重定向。
- [ ] AC6（R5, R7）：`references/` 中有输出契约文件，含结论行取值、问题条目字段、
      未能核实清单、可靠部分清单、反通胀规则、盲区声明。
- [ ] AC7（R6）：`allowed-tools` 为逗号分隔字符串，不含 `Write` / `Edit`，git 授权只到
      `git diff` / `git log` / `git show` / `git status` 形状，无 `Bash(git *)`。
- [ ] AC8（R8）：`evals/evals.json` 采用本仓库 schema，含至少 2 条近邻路由否定用例
      （纯 diff 审查 → `code-auditor` 或 `code-quality-review`；写规划 → 非本 skill）。
- [ ] AC9（R9）：`just ci` 通过；`git status --porcelain -uall` 显示的改动只在本任务目录、
      新 skill 目录，以及 frontmatter 变更引起的 `docs/` 再生成文件之内。

## Out of scope

- 修改 Trellis 自身的 `.trellis/workflow.md`、脚本或内置 agent。
- 审阅规划以外的 Trellis 环节（brainstorm、implement、check、spec 更新）。
- 自动修复被审出的规划缺陷，或自动改写 prd / design / implement。
- 跨任务的批量审阅与统计报表。
- 对 `08-20-settings-font-picker-repaint` 做任何补救改动（该任务已提交并归档）。

## Key decisions

- 放 `development-workflows` 而不是新类别：新增类别要同步四处，且该目录已是审阅类 skill 的归属地。
- 只读 skill：`allowed-tools` 不含写文件工具。脚本的 JSON 由脚本自身写出，叙述报告只进对话。
  理由是审阅 skill 的硬门是不改写被审对象，授予写工具会削弱该门。
- 机械检查与判断检查分层：脚本先跑，结构性失败先报出来再进判断 pass。
  来源是 claude-caliper 的两段式（schema 校验 → LLM 评审）。
- AC 追溯做到子句级而不是 AC 级：font-picker 的 AC2 与 AC3 各含两个子句，每条都是一个有机制、
  一个没有机制。按 AC 级检查会全部判为已覆盖。
- 案例作为标定资产随 skill 发布：`references/case-study-font-picker.md` 记录七类问题的原始形态，
  供审阅者对齐严重度尺度。

## Planning status

- artifacts: `prd.md` `design.md` `implement.md`
- 阻塞项：无
- implementation waits for the user to approve this planning summary, then `task.py start`
