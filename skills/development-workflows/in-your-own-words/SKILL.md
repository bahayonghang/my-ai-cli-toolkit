---
name: in-your-own-words
description: |
  Restate in your own words what you think the user's goals are, what underlying problem they are trying to solve, what observable success looks like, and any high-leverage assumptions or open forks, then stop for confirmation before editing files or acting. Use for /in-your-own-words or when the user asks to restate or play back goals, problem, and understanding before starting or coding (用你自己的话复述目标和要解决的问题、动手前先对齐需求理解、先确认理解再开工). Excludes multi-round design-tree interrogation (grilling, laoyeye), authoring full specs or tickets (/to-spec, /to-tickets), compiling execution prompts (matt-implement-prompt) or /goal directives (goal-meta-skill), paraphrasing or rewriting prose (write, renhua), translating or summarizing documents, and well-specified routine tasks unless explicitly invoked.
category: development-workflows
tags:
  - alignment
  - goal-playback
  - requirements
  - pre-execution
  - workflow
  - pstack
version: 0.1.0
argument-hint: "[optional-focus-or-brief]"
allowed-tools: Read, Glob, Grep
---

# In Your Own Words

动手前用自己的话对齐「目标、根因问题、成功标准与关键假设/分叉」，然后硬停止等用户确认或纠偏，用一句话的成本挡掉整段跑偏施工。核心流：`ground (read-only if needed) → playback → drift-check → stop`。

## Authority Boundary（权威边界）

- **Playback-not-Execution（只复述不施工）**：本次回复严格只读——**严禁**修改文件、写实现代码、运行变更型命令、建分支/提交、开 PR 或「顺手先做第一步」。即使任务看起来可逆或很简单，只要调用了本技能，也必须在复述后停下来等用户确认。
- **Paraphrase-not-Echo（真消化不复读）**：必须用自己的话提炼目标与问题，不得照抄或机械同义词替换用户原句；如果只能复读原话，说明还没理解，需先查清上下文或点出真正卡住理解的缺口。
- **Single-Shot-not-Interrogation（单轮对齐不拷问）**：本技能不是多轮追问或需求访谈；仅在存在真实分叉或隐含前提时列出至多 3 条关键假设/分叉，绝不发长问卷。

## Workflow

1. **S0 — Route & Scope Lock**
   - 确认请求是「动手前对齐目标与问题理解」（含 `/in-your-own-words` 或自然语言要求先复述理解再开工）。
   - 明确排除并路由出去：多轮设计树拷问（`grilling`、`laoyeye`）、撰写完整 Spec 或拆票（`/to-spec`、`/to-tickets`）、编译跨会话执行提示词（`matt-implement-prompt`）或 `/goal` 指令（`goal-meta-skill`）、普通文本改写润色（`write`、`renhua`），以及文章摘要或翻译任务。

2. **S1 — Minimal Read-Only Grounding（按需极简查证）**
   - 若用户提到了具体文件、符号、报错或仓库现状，仅用只读工具（`Read` / `Glob` / `Grep`）快速核查相关事实——**绝不向用户反问自己能直接查到的仓库事实**。
   - 若对话上下文已自洽或未涉及本地文件，直接跳过工具调用进入 S2。

3. **S2 — Synthesize Playback（四段式复述，跟用户语言走）**
   - 用平实、自己的话输出四段式复述（默认与用户当前语言一致，中文或英文自适应），细则与反复读准则见 [Playback Contract](references/playback-contract.md)：
     1. **目标（Goal）**：完成后用户会得到什么结果、系统或流程变成什么样（描述结果，不罗列操作步骤）。
     2. **要解决的问题（Problem）**：当前真正卡住、出错、高成本或有风险的根因是什么（区分症状与根问题；若无故障则说明要消除的摩擦或机会缺口）。
     3. **成功标准（Success Check）**：怎样算做对、做到位（可观察的行为、产物或验收信号）。
     4. **关键假设与分叉（Assumptions & Open Forks）**（按需，至多 3 条；无分叉时简写「暂无未决分叉」）：直白点出默认采纳的前提、明确不做的范围边界，以及若选错会返工的分叉点——**把理解分歧摊在桌面上，不要偷偷抹平**。

4. **S3 — Drift Check & Hard Stop（纠偏收口并硬停止）**
   - 用一句直接收口结束（中文示例：「我理解得对吗？哪里有偏差或漏掉的约束请直接纠正，确认后再动手。」；英文示例：`"Did I get that right? Correct me anywhere I drifted before I start."`）。
   - **立即停止**，不附带代码补丁、长篇实施方案或自行启动后续工作流。

## Resource Map

- 复述质量标准、反复读对照与邻近技能边界：[Playback Contract](references/playback-contract.md)
- 离线/自检确定性校验器：[Playback Checker](scripts/check_playback.py)
- 评测集：[Behavior Evals](evals/evals.json)、[Trigger Cases](evals/trigger_cases.json)
- 证据产物：[Prior-Art Research](reports/prior-art-research.md)、[Creation Handoff](reports/creation-handoff.md)
