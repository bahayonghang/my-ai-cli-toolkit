# 按纳入提交写功能性 PR 标题，替代 merge-dev-into-main 机械标题

## Goal

优化 `skills/git-github-collaboration/gh-pr-release`：创建或合并 PR 时，GitHub 标题只写 `base...HEAD` 的功能主语；完成后的对话回报只报标识符。用户说“merge dev into main”是操作名，不进入标题。

用户价值：集成 PR 在 GitHub 上可扫读真实改动；对话里不再出现 PR #30 那种操作清单。

## Background

- 负例：`bahayonghang/my-ai-cli-toolkit` PR #30，标题 `feat: merge dev into main`，对话回报含 MERGED、merge commit 方式、head/merge SHA、UTC 时间、操作者、四条纳入提交、三个 CI job SUCCESS、未执行项。
- 纳入提交的功能主语：`goal-meta-skill` 的 Trellis Prompt 派发与归档闭环。journal 与 task 归档是附属 chore。
- `references/create.md:25` 优先“仓库既有 PR 标题规则”。该仓历史标题是机械 merge 句，Agent 会复制。
- `SKILL.md` Completion 只要求 report identifiers，没有禁止操作流水。
- `reports/artifact-design-profile.md` 已禁止 PR 正文堆砌文件清单，未覆盖标题与对话完成回报。
- 评测夹具没有集成 PR 标题用例，也没有完成回报紧凑性用例。
- 邻近 `git-commit` 拥有 commit subject 规则。本任务不改 `git-commit`。
- 包已是 Governed 3.0.0。本任务是 SkillOps 输出质量修复：不新增路由、不发布、不加 helper 脚本、不重跑全部 Governed 门。
- 2026-08-27 决定：集成 PR 的 GitHub 标题只写功能主语。`merge <head> into <base>` 可写在正文一行或对话里，不进标题。

## Requirements

- R1. Create 模式起草标题时，证据是相对拟定 base 的 `git log` / `git diff`（`base...HEAD`），以及用户明确给出的标题。标题主语是功能变化。type、scope、语言、emoji 仍服从该仓 Conventional Commit / PR 标题惯例。
- R2. `merge <head> into <base>`、`合并 x 到 y`、仅复述分支名的句子，以及把这些短语当作前缀或后缀的组合标题，均不得写入 GitHub 标题。用户指定了完整标题原文时，原文优先。
- R3. 禁止用 `gh pr create --fill` 或等价方式把 commit 列表倒进标题或正文。正文继续走仓库模板；无模板时走现有 What / Why / How to test / Out of scope。无模板正文可用一行写 `Merges <head> into <base>` 作为拓扑，不重复标题，不罗列每条 commit。
- R4. 完成后对话回报只含：PR 编号与 URL、state、标题、base/head、授权过的写操作结果、fresh-read 的 head 或 merge commit SHA、以及 missing evidence。不写操作者、墙钟时间、纳入提交全表、CI 作业花名册、未执行项清单，除非用户要这些字段。
- R5. 已存在、尚未合并、且标题为机械 merge 句的 PR：merge 模式在合并前提出功能标题，并单独授权 `gh pr edit --title`。不在未授权时改标题。已合并的 PR 不改写。
- R6. 在 `evals/evals.json` 与 `evals/output/cases.jsonl` 增加回归夹具：至少 1 条集成 PR 功能标题正例（merge-dev-into-main + PR #30 类提交为脱敏输入）、1 条用户指定机械标题的覆盖例、1 条已开 PR 机械标题需授权改标题的 merge 例、1 条完成回报负例（禁止 PR #30 操作清单）。断言用短语义锚点，禁止要求背诵长句。
- R7. 标题算法只写在 `references/create.md`。`references/merge.md` 只写机械标题的改标题授权，并指向 create.md。`SKILL.md` Completion 只写完成回报边界。`reports/artifact-design-profile.md` 对标题与完成回报各留一条指针，不复制细则。
- R8. 不改安全契约、合并方法选择、token 回退、release 拓扑。版本号按 Governed 包约定上调补丁号（3.0.0 → 3.0.1）。`just ci` 与现有 Python 测试保持通过。

## Acceptance Criteria

- AC1. 给定与 PR #30 同类的 `dev → main` 请求与四条纳入提交，起草的 GitHub 标题含功能主语（Prompt 派发/归档闭环或等价概括），且不含 `merge dev into main` / `合并 dev` 及其组合前缀。
- AC2. 用户给出完整标题原文时，create 模式使用该原文，即使原文是机械 merge 句。
- AC3. 参考文档与夹具禁止 `--fill` 生成标题或正文。
- AC4. 合并或创建完成后的对话回报不含操作者、墙钟时间、纳入提交全表、CI 作业花名册；含 PR URL/编号、state、标题、已授权写操作、SHA。
- AC5. 已开 PR 的标题为机械 merge 句时，merge 模式先展示功能标题并请求单独的 `gh pr edit` 授权，再进入既有合并授权。
- AC6. 新增 eval 夹具覆盖 AC1–AC5；`just ci` 通过。
- AC7. 标题细则只在 `references/create.md` 展开。

## Out of scope

- 修改 `git-commit` 的 subject 规则或 compose 脚本。
- 新增 PR 标题 helper 脚本。
- 改变 merge commit / squash / rebase 的仓库策略选择。
- 默认删除 `dev`、打 tag、发 GitHub Release、在其它仓库创建 Trellis 任务。
- 公开发布该 skill。
- 重跑全部 Governed 门或补齐 provider-backed / 人工盲评（仍标 `missing evidence`）。
- 改写 Grok 原生 memory 里其它仓库的“典型标题”记录。
- 改写已经 MERGED 的历史 PR 标题。
