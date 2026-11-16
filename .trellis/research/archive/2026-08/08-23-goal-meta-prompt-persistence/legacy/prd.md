# goal-meta-skill：持久化 Goal Prompt 交接契约

## Goal

让 `goal-meta-skill` 在用户明确要求“保存 / 持久化 / 交给新 Agent / 跨会话继续”，或确认复杂文件型 Goal 的落盘方案后，把已确认的目标、约束、边界、验证、迭代、完成与暂停条件写入项目根目录的单一 Markdown 合同 `GOAL.md`，并为 Claude Code、Codex、Grok Build、Oh My Pi（OMP）或 Kimi Code 返回一条短小、平台正确、可直接复制的 `/goal` 启动指令。

用户价值：新 Agent 不需要依赖旧对话摘要，只要在同一项目中显式读取 `GOAL.md`，就能从一个可审阅、可版本化、可校验的入口恢复任务意图和验收边界。

## Background

- 当前 skill 在 `SKILL.md:34,74` 已支持 4,000 字符以上的 `.planning/goal-<slug>.md` 文件指针模式，但只把内容输出到聊天并要求用户手工保存；`references/default-goal-strategy.md:89` 明确禁止默认写文件。
- 当前 `allowed-tools` 只有读取、只读 Git 探针和 Python helper；`scripts/lint_goal_command.py` 可以校验 Goal 字段、平台规则、占位符和 4,000 字符限制，但没有项目根目录、持久化文件、覆盖冲突或秘密内容契约。
- 本仓库 `.gitignore:43-44` 忽略 `.planning/` / `.plannings/`。改用根目录 `GOAL.md` 会提高可发现性，但默认会出现在 Git 状态中；skill 不得擅自提交、忽略或删除它。
- OpenAI 官方文档只承诺 Codex 自动发现 `AGENTS.md` 链；任意 `GOAL.md` 不会自动进入新会话。Codex `/goal` 的文本既是首条提示也是完成标准，因此短指令必须显式要求读取该文件。
- Claude Code 官方文档只承诺 `CLAUDE.md` / memory 自动加载；任意文件应通过 `@GOAL.md` 或明确读取指令带入上下文。Claude `/goal` 的 evaluator 不独立读文件，因此执行 Agent必须把合同的完成门和证据带入对话记录。
- Grok Build、OMP 与 Kimi Code 均已从官方文档或规范源代码确认存在原生 Goal 模式，但管理命令、预算、状态机、模式互斥和 headless 行为不同，不能套用 Claude/Codex 二选一模板。详细证据见 `research/platform-goal-modes-grok-omp-kimi.md`。
- Kimi Code 的规范源代码同样把目标正文限制为 4,000 字符，并建议长内容放入文件后引用路径；Grok Build 与 OMP 未找到官方长度上限，因此 4,000 对二者只能作为本 skill 的保守可移植性约束，不能写成平台事实。
- 详细平台、先例与方案比较见 `research/feasibility-and-prior-art.md`。

## Requirements

### R1 持久化模式触发与授权

1. 满足任一条件时进入持久化候选模式：
   - 用户明确说保存、持久化、落盘、交接给新 Agent、跨会话继续或点名根目录 Markdown；
   - 合同过长或复杂，skill 在 S4 明确列出将创建的文件、路径和影响，用户在 S5/S6 确认该方案。
2. 普通短 Goal、一次性草案、管理现有 `/goal`、无项目上下文的请求仍保持聊天输出且不写文件。
3. 对现有项目的 S1 侦察仍只读；只有确认后的 S6 可以执行已授权的 `GOAL.md` 写入。
4. 用户说 `直接给` 只跳过访谈，不自动授权文件写入；除非同一句话同时明确要求保存 / 持久化。

### R2 项目根目录与文件生命周期

1. Git 项目用 `git rev-parse --show-toplevel` 的解析结果作为项目根；非 Git 工作区只有在宿主提供明确 workspace root 或用户确认目录时才能写入。
2. 默认文件名为根目录 `GOAL.md`，代表“当前工作树唯一活动 Goal 合同”。不得把它描述为任一目标平台自动加载的配置文件。
3. 输出路径必须是解析后项目根的直接子文件，拒绝绝对路径、`..`、路径分隔符、根外路径和符号链接 / reparse-point 目标。
4. 默认 create-only：已有 `GOAL.md` 时先读取并报告冲突，不静默覆盖。替换必须经过用户明确确认，并以已读取内容的 SHA-256 作为 compare-before-replace 条件；文件在确认后发生变化时失败关闭。
5. skill 不自动修改 `.gitignore`、`.git/info/exclude`，不自动 `git add`、commit、push 或删除旧合同。写完后报告文件是 tracked、ignored 还是 untracked，并说明跨 worktree / cloud 复用需要该文件可见于对应工作区。

### R3 单文件合同内容

`GOAL.md` 至少包含以下可机器检查的章节，不允许未解析占位符：

1. `Contract metadata`：状态必须为 `approved`、目标平台（`codex` / `claude` / `grok` / `omp` / `kimi` / 明确多平台集合）、生成 skill/version、项目相对路径、当前 branch / HEAD、生成时间，以及 dirty-state 摘要（若有）。
2. `Authority and startup`：先遵守系统、用户、`AGENTS.md` / `CLAUDE.md`、Trellis 或现有权威 spec；合同冲突或基线漂移时停止并报告。
3. `Objective`：一个可观察的最终结果。
4. `Required reading / Current context`：新 Agent 必须先读的最小文件清单与当前事实；不得复制秘密或大段无关会话。
5. `Scope and boundaries`：允许修改和禁止修改的路径 / 行为。
6. `Constraints`：权限、依赖、兼容性、远程 / 生产 / 付费 / 破坏性边界。
7. `Verification`：命令、运行证据、人工或外部证据及其 `VERIFIED / UNVERIFIED` 状态。
8. `Iteration policy`：失败后的证据驱动重试、最大轮次与可继续的独立工作。
9. `Completion conditions`：合取式、可判定、覆盖完整范围。
10. `Pause / stop conditions`：Codex/Grok/OMP/Kimi 使用各自可恢复的 pause/blocked/budget 语义；Claude 使用停止并报告；不得把普通可恢复失败误写成整体完成或永久阻塞。
11. `Launch commands`：至少给出目标平台的短 `/goal`；文件正文是权威合同，短命令只负责显式读取、复述关键门并开始执行。

Trellis 任务实施时，`GOAL.md` 必须链接具体 `prd.md` / `design.md` / `implement.md`，保留现有 commit-then-archive 与父任务发布门节奏；它不能覆盖这些任务文档。

### R4 五平台正确的短启动命令

Codex 推荐形状：

```text
/goal First read and follow ./GOAL.md as the approved execution contract. Restate its objective, constraints, verification, completion, and pause conditions before editing; then work until every completion gate is evidenced or a pause condition is reached.
```

Claude Code 推荐形状：

```text
/goal @GOAL.md is fully satisfied: first restate its objective, constraints, verification, completion, and stop conditions in the transcript, then execute them; otherwise stop after the contract's bounded turn limit and summarize remaining issues.
```

Grok Build 推荐形状：

```text
/goal First read and follow ./GOAL.md as the approved execution contract. Restate its objective, constraints, verification, completion, and pause conditions, then work until every completion gate has current evidence or a pause condition is reached.
```

Oh My Pi 推荐形状：

```text
/goal First read and follow ./GOAL.md as the approved execution contract. Preserve its full objective across turns, verify every deliverable against current repository evidence, and leave the goal active or paused when the contract is not fully satisfied.
```

Kimi Code 推荐形状：

```text
/goal First read and follow ./GOAL.md as the approved execution contract. Restate its finish line, evidence, boundaries, iteration policy, and stop conditions, then continue until the goal is complete, blocked, or paused exactly as that contract defines.
```

要求：

- 不把“进入 Goal 模式但不给目标文本”说成会自动发现 `GOAL.md`。
- 平台选择顺序为用户显式名称 > 当前 host 证据 > 现有“可选调整”中的一个平台选择；仍不明确时不猜。`OMP` 在本任务中映射为 Oh My Pi。
- Codex 短命令必须显式读取文件；Claude 优先使用官方支持的 `@GOAL.md` 引用，并要求证据进入 transcript。
- Grok 与 OMP 使用显式自然语言读取；Kimi 第一版也使用显式读取。三者在 `/goal` 内使用 `@GOAL.md` 的行为必须在 provider-backed fresh-session 证据出现后才能升级为推荐写法。
- 只输出用户选择平台的启动命令；明确要求多平台交接时才在合同中输出多个 launcher，不生成含混的“通用命令”。
- 命令小于 4,000 字符，且指向真实存在、已回读校验的文件。对 Grok/OMP，4,000 是本 skill 的保守输出预算，不声称是平台上限。
- 平台管理命令必须分别建模：Grok 用 `status/pause/resume/clear` 和可选 `--budget`；OMP 用 `set/show/pause/resume/drop/budget`；Kimi 用 `status/pause/resume/cancel/replace/next`，headless 只支持创建；Claude 不得出现 pause/resume；Codex 保留既有 edit/pause/resume/clear。

### R5 受控写入 helper

1. 新增标准库 Python helper，从 stdin 接收完整合同，避免把可能敏感的内容放入 argv / process list。
2. helper 必须先校验合同和输出路径，再以 UTF-8、LF 写入；使用同目录临时文件与安全 finalize，失败不得破坏已有文件，并清理临时残留。
3. create-only 为默认；替换需要显式 flag + expected SHA-256。成功输出只包含路径、字节数、hash、create/replace 状态和 Git 可见性，不回显全文。
4. 拒绝代表性秘密值（API key、PAT、私钥块、cookie/token 值）；允许只写环境变量名或“需要凭证时暂停”的说明。秘密扫描是 backstop，不得声称完整分类器。
5. helper 只写一个根目录 Markdown，不修改任何其他文件或 Git 状态。

### R6 Skill 包同步

- 将路径、授权、冲突、合同格式和启动命令的详细判断下沉到新 reference；`SKILL.md` 只保留触发、S1/S4/S6 状态变化和最短输出契约。
- 把 `references/platform-goal-facts.md` 扩展为五平台事实单一来源，并为每条外部行为标注来源、证据级别与 `Last verified: 2026-08-23`；其他 reference 不复制平台事实表。
- 更新 `references/default-goal-strategy.md`、`goal-command-playbook.md`、`interview-checklist.md`、`trellis-goal-cadence.md`、`agents/interface.yaml` 与 `evals/evals.json`，消除旧的“只输出、不得写”矛盾。
- 更新 `skills/developer-tools-integrations/AGENTS.md` 对 helper 和 `allowed-tools` 的真实说明；若仍复用 `Bash(python *)`，不得继续把整个 skill 描述为只读。
- 版本从 `0.4.0` 升到 `0.5.0`，并运行 `just docs-sync`。不新增本仓库不要求的 README / manifest。

### R7 回归与证据

- 保留 18 个现有行为 eval，不弱化侦察、双语、平台差异、4k、Trellis cadence 和 S6 展示断言。
- 新增行为 eval：显式持久化成功、普通 Goal 不写、直接给但未授权不写、已有文件拒绝覆盖、确认替换、非 Git 根目录歧义、五平台启动命令、各平台管理命令互斥、Kimi headless 创建、Trellis 权威链接、秘密拒绝、Git 可见性报告。
- 新增 Node 集成测试覆盖 helper 的 create、replace/hash mismatch、路径逃逸、符号链接、LF/UTF-8、lint-before-write、失败不破坏旧文件、stdout 不泄露全文。
- 对新增持久化触发词和 Grok/OMP/Kimi 平台别名运行 qiaomu trigger eval，并把 provider-backed 新会话执行 / 人工跨 Agent 接力标为 `missing evidence`，直到真实运行完成。

## Constraints

- 规划采用 Qiaomu Governed 文件写入门：显式授权、trust boundary、rollback boundary、secret backstop、可复现测试和诚实缺证据。
- 不改变 Claude Code、Codex、Grok Build、OMP 或 Kimi Code 的 `/goal` 平台事实；外部行为声明必须写 `Last verified: 2026-08-23` 和官方链接/规范源码 commit。
- 不把 `GOAL.md` 加入 `AGENTS.md` / `CLAUDE.md`、`.grok/rules`、`.omp/AGENTS.md` / `.omp/RULES.md` 或其他自动 import；任务级合同不应污染每个新会话的常驻指令。
- 不把一个 immutable Goal 合同扩展成进度 ledger、memory vault、任务数据库或多 Goal 调度器。
- 不新增依赖，不执行目标正文，不启动 `task.py start`，不提交或发布。

## Out of Scope

- 修改任一目标平台的 `/goal` 运行时。
- 自动恢复旧会话 transcript、自动同步云端或跨机器复制文件。
- 自动把 `GOAL.md` 提交到 Git、加入 ignore、写入 memory 或转成任一平台的常驻规则/上下文文件。
- 多个并发 Goal 共用同一工作树；并发任务应使用独立 worktree 或显式的非默认文件名。
- 用 `GOAL.md` 取代 Trellis、issue、PRD、design、runbook 或正式架构决策。
- qiaomu 发布、PR、release 或安装流程。

## Acceptance Criteria

- [ ] A1 明确保存 / 交接请求在 S6 确认后创建根目录 `GOAL.md`；普通 Goal 和管理命令不写文件。
- [ ] A2 Git 根解析正确；非 Git 且根不明确时停止询问，不向任意 CWD 写入。
- [ ] A3 路径逃逸、路径分隔符、绝对路径、符号链接 / reparse-point 和根外输出全部失败关闭。
- [ ] A4 已有 `GOAL.md` 默认不变；只有显式 replace + 匹配 SHA-256 才能原子替换，hash mismatch 保留旧文件。
- [ ] A5 stdin 以 raw bytes 严格解码 UTF-8 / UTF-8-BOM，非法字节不写；输出为 UTF-8 + LF，包含 R3 的全部章节、无占位符、无代表性秘密值，并通过扩展后的 linter。
- [ ] A6 五个平台都有各自的 launch renderer：Codex/Grok/OMP/Kimi 显式读取 `./GOAL.md`，Claude 使用 `@GOAL.md` 或等价显式读取并要求证据进入 transcript；每条命令都小于 4,000 字符。
- [ ] A7 新 Agent 入口不声称自动加载任意 `GOAL.md`，也不修改 `AGENTS.md` / `CLAUDE.md`、`.grok/rules` 或 `.omp` 规则/上下文文件。
- [ ] A8 Trellis 型合同链接具体任务文档并保留 commit-then-archive / 父任务发布门；非 Trellis Goal 不注入该节奏。
- [ ] A9 helper 成功只报告路径、长度、hash、动作和 Git 可见性，不回显合同全文；失败不留临时文件、不破坏已有文件。
- [ ] A10 代表性 API key / PAT / 私钥 / token 值被拒绝，环境变量名和凭证暂停规则可通过。
- [ ] A11 `evals/evals.json` 保留 id 1-18 并新增 A1-A10 与五平台路由/管理覆盖；Node tests 覆盖成功、冲突、安全、编码和平台矩阵。
- [ ] A12 `version` 为 0.5.0，`just skills-check`、`just python-check`、`just node-test`、`just ci` 通过；frontmatter 变化已 `just docs-sync`。
- [ ] A13 qiaomu trigger eval 对新增正向、负向与近邻案例通过；qiaomu package validator 的 README / manifest 偏差按仓库规范记录而不补文件。
- [ ] A14 Claude、Codex、Grok Build、OMP、Kimi Code 的真实新会话接力分别记录证据状态；没有 provider-backed transcript 的平台保持 `UNVERIFIED`，不能用单元测试代替。
- [ ] A15 `references/platform-goal-facts.md` 成为五平台事实唯一来源，包含精确命令、状态/预算/权限/长度/文件引用边界和 dated primary-source 链接。
- [ ] A16 linter 接受 `codex|claude|grok|omp|kimi|both|all`，保留 `both` 的旧语义，并拒绝把一个平台独有的管理命令借给另一个平台。
- [ ] A17 Kimi 的 4,000 字符限制按官方实现校验；Grok/OMP 仍遵守 skill-owned 4,000 可移植性预算，但错误信息不得声称这是两平台官方上限。

## Decisions

1. 推荐采用根目录固定名 `GOAL.md`，因为用户要的是“新 Agent 一眼可找”的单一活动入口；它不是自动加载文件。
2. 推荐“显式 / 经确认的持久化模式”，不把所有 `/goal` 生成请求都变成文件写入。
3. 推荐在 S6 最终确认后落盘；S1 侦察和 S4 草案仍不写。
4. 推荐一份 immutable 执行合同 + 一条短启动命令，不引入多文件状态目录或进度 ledger。
5. 推荐 create-only + hash-guarded replace；不自动备份、删除、提交或忽略。
6. 推荐 `GOAL.md` 只压缩并链接权威材料，最新用户指令和项目规则永远可以使它过期或被覆盖。
7. 推荐“一个平台中立合同 + 五个薄渲染器”，而不是维护五份 Goal 正文；平台差异只进入启动、管理、预算和停止语义。
8. 本任务中的 `OMP` 明确指 Oh My Pi；该结论同时由本仓库 Trellis adapter 与官方 `omp` CLI 源码支持。

## Open Questions

无阻塞问题。以上默认方案需要用户在最终规划摘要后明确批准，才可运行 `task.py start` 并实施。
