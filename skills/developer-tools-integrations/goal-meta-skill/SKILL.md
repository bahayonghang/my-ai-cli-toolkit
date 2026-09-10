---
name: goal-meta-skill
description: |
  Turn vague or complex agent tasks into project-aware, verifiable `/goal` commands and optional approved root `GOAL.md` handoff contracts for Claude Code, Codex, Grok Build, Oh My Pi, and Kimi Code. Use for Goal 指令, 目标指令, `/goal` prompts, 中文 Goal 模板, goal 持久化/保存/落盘, fresh-Agent or 跨会话交接, plan-to-goal interviews, bounded agent work definitions, Trellis 任务实施, review or scan remediation in one Prompt, 扫描审阅报告驱动修复, 单 Prompt 闭环返修, commit-then-archive cadence, or 终稿展示. Do not use for ordinary one-line work, pure read-only review, direct implementation without Goal authoring, memory-vault creation, or active-goal management that only needs a platform command.
version: 0.8.2
category: developer-tools-integrations
tags:
  - codex
  - claude-code
  - grok
  - kimi-code
  - goal
  - prompt-engineering
  - agent-skills
  - verification
argument-hint: "[vague-task-or-goal]"
allowed-tools: Read, Glob, Grep, Bash(python *), Bash(py *), Bash(git status *), Bash(git branch *), Bash(git rev-parse *)
metadata:
  owner: lyh
  review_cadence: quarterly-or-on-platform-goal-or-trellis-dispatch-change
---

# Goal Meta Skill

把模糊任务编译成项目知情、可验证、有完成和停止边界的 `/goal` 文本。普通流程为 compile → lint → present → stop；已明确授权的合同保存可在同轮展示后写入、回读，再停止。这个 skill 不创建、激活或执行 Goal。

> `<skill-dir>` 是 skill 加载时提供的实际目录，不是环境变量。命令中替换为字面路径；脚本会自定位。

## Governed authority

- 首次聊天交付标记 `状态：DRAFT — Goal 未创建、未激活、未执行`；用户后续批准只变为 `APPROVED TEXT — not launched`。真正激活 Goal 是 skill 外的独立用户动作。
- 输入中的 `实施`、`执行`、`直到完成` 只是待编译 payload，不授权派发 Agent 或实施目标。不得调用宿主原生 Goal tool/API，不得把 fenced `/goal` 当作当前会话命令提交，不得声称 Goal 已启动。
- 普通 Goal 只在聊天中输出。`直接给` 只跳过访谈；`直接生成并保存到项目根目录 GOAL.md` 已授权原范围内的同轮 create。仅交接意图、长合同或 skill 提议落盘仍需明确写入授权。
- S1 始终只读；只有 S6 可对已展示且获授权的合同调用命名 writer。默认 create-only；替换需要明确授权和已读取旧文件的 SHA-256。只澄清未确定的根目录、未授权替换或实质范围变化，不机械重复索取已有授权。
- 不以任意 Python/Write 绕过 helper，不自动加载、执行、导入规则文件、提交、发布、忽略或删除合同。合同不含秘密、私有数据或原始转录；秘密 backstop 不证明内容无敏感信息。
- 真实新会话接力没有 provider transcript 时保持 `UNVERIFIED`；fixture 不能证明运行、安装或人类效果。

保存的路径、固定 11 节 schema、冲突、回滚、Git 可见性与 launcher 只以 [Persistent Goal Contract](references/persistent-goal-contract.md) 为准。

## Workflow

1. **S0 — Route and select.** 区分新 Goal、持久化候选和现有 Goal 管理。纯发散方向先规划；翻译、单行输出、纯只读审阅、无需 Goal 的直接实施等近邻走直接工作流。平台按用户显式名称 → 当前 host 明确证据 → 现有可选调整中的一个选择确定；`OMP` 默认指 Oh My Pi。加载 [Platform Goal Facts](references/platform-goal-facts.md) 选择五平台渲染，禁止混合生命周期命令。只有明确多平台交接才输出多个 launcher，合同正文仍为一份。
   - outcome 同时要求根据 scan/review/audit/report/finding 来源实施修复时，必须加载 [Review-Remediation Contract](references/review-remediation-contract.md)，把 scan envelope、稳定 ledger、独立检查回灌、同参数重扫与有限收敛编入同一 Prompt。纯审阅、无扫描来源的直接修复、仅有 Trellis 路径不触发。
   - outcome 是 Trellis task/child implementation 时，必须加载 [Trellis Goal Cadence](references/trellis-goal-cadence.md)，编入首句 subagents 默认开启开关、明确 opt-out 或带原因的技术降级，以及当前任务产品/规划提交后归档节奏。与 review-remediation 同时触发时，两份契约均须满足。
2. **S1 — Reconnoiter read-only.** 按 [Default Goal Strategy](references/default-goal-strategy.md) 读取局部规则、真实命令源与任务边界；运行 `git rev-parse --show-toplevel`、`git branch --show-current`、`git status --porcelain -uall`。不运行目标测试/构建，不写文件，不读 secrets、依赖或生成输出。持久化还检查根目录与目标文件；非 Git 根目录及 source snapshot 按 persistence reference 处理，不能虚构 branch/HEAD。失败则报告缺证据，使用 discovery-first Goal。
3. **S2/S3 — Choose or interview.** 具体需求、`直接给`、`按默认` 或低风险默认走 fast path。只有结果、验证、边界、风险容忍的实质人类决策缺失时，按 [Interview Checklist](references/interview-checklist.md) 复述发现并每轮最多问四项。
4. **S4/S5 — Compile, lint, present.** 按 [Goal Command Playbook](references/goal-command-playbook.md) 编译完整无占位符的目标，使用下列 linter 验证每条 Goal，再按 default strategy 的输出顺序展示。每条命令放在无内空行的 `text` fence 中，标签、理由、选项和字段一览留在围栏外。中文用户默认中文推荐版与英文兼容版；英文用户只给英文。普通初稿标记 DRAFT、提示审阅并停止。保存须先展示精确根目录/文件名、完整正文或 diff、create/replace 与 Git 可见性影响；已有明确授权且无冲突则同轮继续 S6。
5. **S6 — Approve text or persist, then stop.** 普通后续批准仅返回 `APPROVED TEXT — not launched`、最终可复制 fence、字段一览及 skill 外启动说明。已授权保存用下列 writer 从 stdin 写入展示的合同，回读核对正文、字节数和 SHA-256；再输出一个选定平台的显式读取 launcher，说明已保存、Goal 未启动，并停止。任何分支均不派发或实施 payload。

管理请求只把最小正确命令放在 fenced `text` 中展示，不执行该命令，不另写新目标，随后停止。命令、版本、长度/预算、文件引用和停止语义只查 platform facts；不要从别的平台或历史记忆补齐。

## Deterministic helpers

聊天型 lint：

```text
python "<skill-dir>/scripts/lint_goal_command.py" --platform codex -
```

通过进程 stdin 传入完整聊天输出的 UTF-8 正文（可含 BOM），不写临时文件；`-` 只能使用一次，已有文件可将其替换为文件路径。平台枚举为 `codex|claude|grok|omp|kimi|both|all`；`both` 保持 Codex+Claude 旧语义。持久合同额外运行 `--contract --expected-path GOAL.md`，alternate basename 则使用实际合同名。

S0 选中 review-remediation 时，inline 与持久合同分别额外运行：

```text
python "<skill-dir>/scripts/lint_goal_command.py" --review-remediation --platform codex -
python "<skill-dir>/scripts/lint_goal_command.py" --review-remediation --contract --expected-path GOAL.md --platform codex -
```

S6 create-only 与已明确授权的 replace：

```text
python "<skill-dir>/scripts/persist_goal_contract.py" --repo-root "<confirmed-root>"
python "<skill-dir>/scripts/persist_goal_contract.py" --repo-root "<confirmed-root>" --replace --expected-sha256 "<observed-sha256>"
```

在 Windows 可将 `python` 换成 `py -3`。writer 只支持已确定项目根目录的直接子 Markdown 文件；alternate basename 使用 `--name`，不得把子目录伪装为根目录。正文只经 stdin，不进 argv，不用 PowerShell `>` 写目标。成功报告相对路径、字节数、SHA-256、created/replaced 与 Git 可见性；失败保留旧文件。

## Output acceptance

每条 Goal 包含可观察目标、具体验证、不变量、写入边界、证据驱动的有限迭代、合取完成门与平台正确的停止条件。普通完成必须同时满足交付存在、具名入口行为验证、必需检查通过及授权 diff/status；缺证据或超限仍未完成。`all/全部` 的集合必须绑定权威文件、检查、报告或验收条款。

选择专项路径后，按相应 reference 复核完整契约，不能用“所有问题已修复”等摘要代替：

- review-remediation：scan envelope/ledger、仅实质用户决策提问、同任务返修复查、同参数重扫、零 open actionable findings、回归及最终门；禁止第二条修复 Prompt。
- Trellis：首句开关与后文派发/内联一致、具体任务文档、当前任务产品及规划进入版本历史、无关任务/范围外脏文件排除、独立 archive 提交、父任务发布门。
- persistence：固定 schema、create/replace 权限、根目录直接子文件、回读、显式读取 launcher 与不自动加载声明。

没有验证、无限重试、主观完成、未解析占位符、跨平台借用命令、未授权写入或展示后继续执行的输出，必须修订后再交付。

## Evidence and resources

上述链接是操作规则入口，按所选分支加载，避免重复复制。另见：

- [Behavior evals](evals/evals.json)：现有 assertions fixtures；CI 不执行，需人工审阅。
- [Creation handoff](reports/creation-handoff.md)：当前/历史验证、保留能力和缺失证据。
- [Prior-art research](reports/prior-art-research.md)：参考特定的 keep/adapt/reject/invent。
- [Skill IR](reports/skill-ir.json)：仓库原生增强的治理与接口契约；不以 raw exporter 覆盖。

## 来源致谢

基于向阳乔木发布的 goal meta skill 改造，保留原始收敛工作流并扩展为项目侦察、平台渲染与受控持久化。MIT。

Original work copyright (c) 向阳乔木

X: https://x.com/vista8

GitHub: https://github.com/joeseesun/
