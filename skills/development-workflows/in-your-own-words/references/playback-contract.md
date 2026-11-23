# Playback Contract

本契约定义 `in-your-own-words` 在对齐用户目标与待解问题时的质量门槛、反复读标准、只读边界以及邻近技能路由表。

## 1. Anatomy of a High-Signal Playback（高信号复述的四要素）

| 要素 | 要回答的问题 | 常见反模式 |
| --- | --- | --- |
| **Goal（目标）** | 这件事做完后，用户最终要获得什么状态、行为或产物？ | 把操作步骤（"先改 A 再改 B"）当成目标，或照抄用户原句。 |
| **Problem（要解决的问题）** | 当前真正卡住业务/工程的根因、摩擦或风险是什么？ | 只复述表象报错，没有点出它为什么痛或为什么会发生。 |
| **Success Check（成功标准）** | 用什么可观察的信号、测试或产出验收"做对了"？ | 泛泛写"代码更干净""体验更好"等不可核验的空话。 |
| **Assumptions & Open Forks（关键假设与分叉）** | 哪些默认前提如果猜错会导致返工？是否存在必须二选一的路线？ | 至多 3 条；严禁发散成 10 题大问卷，也严禁隐藏 brief 里的内部矛盾。 |

## 2. Anti-Parroting Rubric（真复述 vs 机械复读）

复述必须体现真实消化：换用结构化、具体的因果表述，把隐含约束和风险点亮出来。

### 中文示例对照

- **原始 brief**：「最近老有用户反馈登录态动不动掉线，你帮我看下是不是 token 刷新那里竞态了，顺便把重连稳一点。」
- **反例（机械复读 — 禁止）**：
  > 你的目标是排查登录态经常掉线的问题，检查 token 刷新是不是竞态了，并把重连做得更稳。我理解得对吗？
- **正例（真消化复述）**：
  > - **目标**：把异常掉线率压下来，让用户在短时网络抖动或 token 临期时保持无缝登录，不中断当前操作。
  > - **要解决的问题**：目前问题大概率出在并发请求同时触发 token 刷新导致旧 token 提前失效，或断线重连缺少退避与状态恢复，使得原本可自愈的瞬时失败直接踢出用户。
  > - **成功标准**：并发请求下 token 刷新只发生一次且其余请求复用新凭证；模拟网络抖动后客户端自动恢复会话且现有登录测试与回归用例全绿。
  > - **关键假设与分叉**：
  >   1. 优先排查客户端拦截器与刷新锁，暂不改动服务端签发有效期策略（如需调服务端 TTL 请指出）。
  >   2. 出现彻底无法恢复的凭证失效时，只做一次安全登出提示，不做静默无限重试。
  > - 我理解得对吗？哪里有偏差或漏掉的约束请直接纠正，确认后再动手。

### English Example Contrast

- **Brief**: "Our CI is getting super slow, can you speed up the test suite without losing coverage?"
- **Bad (Echoing)**: "Your goal is to speed up the slow CI test suite without losing coverage. Right?"
- **Good (Paraphrased Playback)**:
  > - **Goal**: Cut CI wall-clock feedback time meaningfully while keeping the same failure-detection coverage on PRs.
  > - **Problem**: The test pipeline is likely bottlenecked by serial execution, redundant setup/fixtures, or full-matrix runs on every commit rather than a lack of tests.
  > - **Success check**: Measurably shorter CI runtime on a clean run with zero skipped assertions or dropped test suites.
  > - **Assumptions & open forks**:
  >   1. I am assuming we want to optimize caching, parallelism, and setup cost first rather than splitting suites into nightly-only jobs.
  > - Did I get that right? Correct me anywhere I drifted before I start.

## 3. Hard Prohibitions（硬性红线）

1. **禁止复述后顺手执行**：即使某个改动看起来完全可逆（例如改一行配置），也不能在未经确认的情况下"顺便先改了再汇报"。
2. **禁止贴大段代码或补丁**：对齐阶段只对齐方向与边界；代码草稿会诱导用户陷入细节而非目标核对。
3. **禁止变成多轮问卷审讯**：疑问或分叉不得超过 3 条，总问句数保持克制（`<= 4`）；需要设计树穷举时路由到 `grilling`。
4. **禁止抹平矛盾**：如果用户请求里同时要求"零破坏兼容"又要求"立刻删掉旧字段"，必须直接点出矛盾让用户定夺。

## 4. Read-Only Grounding Rules（只读核查规则）

- **何时查**：用户给出了路径、模块名、Issue 编号或报错关键词，且不看一眼就无法准确说出真实根因时，使用 `Read` / `Glob` / `Grep` 快速取证。
- **何时跳过**：用户还在口头构思需求、尚未落到具体文件，或对话上下文已经足够明确时，直接进入四段式复述，避免无谓工具调用。
- **严禁反问事实**：仓库根目录在哪、当前用的是什么框架、测试命令是什么等可自查事实，自己查完写入假设或背景，不要拿来问用户。

## 5. Near-Neighbor Routing（邻近技能边界）

| 用户真实诉求 | 应路由至 | 不使用 `in-your-own-words` 的原因 |
| --- | --- | --- |
| 动手前先用自己的话复述目标与问题、确认没理解偏 | **`in-your-own-words`** | 单轮对齐 + 硬停止，正是本技能定位 |
| 按设计树一轮一轮拷问、把所有设计分支盘清 | `grilling` / `laoyeye` | 多轮深度设计树访谈，而非单轮复述 |
| 把想法整理成正式 Spec 文档并拆分 Ticket 任务图 | `/to-spec` / `/to-tickets` | 产出持久化的规格与票据契约 |
| 把现有 Spec + Tickets 编译成新对话全自动实施 Prompt | `matt-implement-prompt` | 编译跨会话实施指令 |
| 把目标写成 Codex `/goal` 或根目录 `GOAL.md` | `goal-meta-skill` | 生成平台 Goal 契约 |
| 改写、润色中文或英文成稿，去掉 AI 腔 | `write` / `renhua` | 文案编辑，而非需求意图对齐 |

## 6. Host Adapter Note (`disable-model-invocation: true`)

- 本仓库根 `SKILL.md` 遵循全仓元数据 Schema（仅允许 `name`、`description`、`category`、`tags`、`version`、`metadata`、`allowed-tools`、`license`、`argument-hint`），因此不在根 `SKILL.md` 顶层写入 `disable-model-invocation`。
- 如果你在 Cursor 或 Claude Code 插件包中希望强制**仅限显式斜杠触发**（`/in-your-own-words`），避免模型在日常明确需求下主动拦截，可在宿主本地配置或平台适配层额外补充 `disable-model-invocation: true`。
