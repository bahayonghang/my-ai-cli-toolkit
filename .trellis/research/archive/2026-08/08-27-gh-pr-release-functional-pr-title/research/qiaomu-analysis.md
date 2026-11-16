# qiaomu-meta-skill 分析：gh-pr-release 标题与完成回报

Date: 2026-08-27
Mode: Governed SkillOps（已有包，输出质量回归；不是新 skill）
Source sample: `bahayonghang/my-ai-cli-toolkit` PR #30（2026-08-27）

## Job restatement

这个 skill 接收仓库、base/head、纳入提交与用户授权，用于创建或合并 GitHub PR，输出可发布的 PR 标题/正文、逐项授权的写操作，以及完成后的标识符回报。它不处理代码审查分析、本地提交拆分、registry 发布。

## SkillOps signal

用户明确指出一次真实输出不可用：PR 标题写成 `feat: merge dev into main`，对话回报写成操作清单（状态、SHA、操作者、纳入提交全表、CI 作业名、未执行项）。同类请求会重复出现（长期集成分支合入默认分支）。默认动作：改参考规则 + 补 output eval，不扩路由、不加脚本。

## Generalization gate

| 步骤 | 结果 |
| --- | --- |
| 领域中立失效 | Agent 把**分支拓扑动作**写成 PR 主语，并用**操作流水**充当完成后的用户回报 |
| 分类 | **核心机制**：标题必须描述 `base...HEAD` 的功能变化；完成后回报只报标识符。**可选适配**：长期集成分支（`dev`/`release` → 默认分支）的标题形态。**eval fixture**：PR #30 原文作为负例 |
| 是否升为核心 | 升。该失效不依赖某一个仓库：凡是集成 PR、`--fill`、或“按仓库既有标题惯例”复制历史机械标题，都会复现 |
| 不升格的细节 | 四个具体 commit subject、三个 CI job 名、操作者登录名、UTC 时间戳 |

## Current-package facts

- `references/create.md:25`：标题优先“仓库既有 PR 标题规则”，否则 Conventional Commit。历史里若全是 `feat: merge dev into main`，规则会复制造句。
- `SKILL.md` Completion：只写 `report identifiers, edits, writes, and missing evidence`，没有长度与禁止项。
- `reports/artifact-design-profile.md`：禁止在 PR **正文**里罗列每个文件或堆砌仪式章节；未覆盖 **标题** 与 **对话完成回报**。
- `evals/evals.json` / `evals/output/cases.jsonl`：没有集成 PR 标题用例，也没有完成回报紧凑性用例。
- 邻近 `git-commit` 已拥有 commit subject 规则。本 skill 只消费 `base...HEAD` 的 log/diff 作为标题证据，不复制 commit 编排。

## Sample-driven expected behavior

用户请求：把 `dev` 合入 `main`（操作名可以是 merge-dev-into-main）。

纳入提交：

- `fix(goal-meta-skill): 完善 Trellis Prompt 派发与归档闭环`
- `chore(trellis): 记录 Goal Prompt 收尾契约任务`
- `chore(task): 归档 08-27-goal-prompt-submit-plan-archive`
- `chore: record journal`

禁止复现的完成回报形态：以 `已创建并合并 PR` 开头，随后列出 MERGED、merge commit 方式、head/merge SHA、合并时间、操作者、纳入提交全表、CI 作业 SUCCESS、未执行项。

## Keep / adapt / reject / invent

见 `prior-art-research.md`。
