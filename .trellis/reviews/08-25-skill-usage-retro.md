---
skill: trellis-plan-review
version: 0.2.0
task_dir: D:/Documents/Code/Agents/my-claude-code-settings/.trellis/tasks/08-25-skill-usage-retro
task_name: 08-25-skill-usage-retro
task_status: planning
verdict: 需返回规划
blocking: 5
should_fix: 3
notes: 2
generated_at: 2026-08-25T18:07:09.7353365+08:00
---

# Trellis 规划审阅报告

## 结论

需返回规划 — 阻断 5 / 应修 3 / 提示 2

## 问题清单

### TPR-01 · 阻断 · 核心诊断输出没有被验收标准逐子句覆盖

- Location: `prd.md:26-30`（R1、R3、R4、R5）与 `prd.md:40-49`（AC1–AC9）
- Claim: 现有 AC 已能证明产物是“使用情况反馈报告”，并能证明每条发现的证据、重复信号优先级和只报告边界。
- Evidence: AC1 只检查会话发现、平台和信号类型；AC2 只要求会话 id 与裁决标签；AC3 只约束单次纠正；AC4 只检查落盘、交接 Prompt、目标目录无写入和覆盖。没有任何 AC 子句要求报告实际包含 R1 的“步骤偏差、用户纠正、缺口、可复用建议”，也没有逐发现要求 R3 的“平台、可核对证据”，没有证明 R4 的多会话重复信号会被优先提升，也没有直接证明 R5 的“不调用 qiaomu-meta、不应用 patch”。`design.md:88-90` 虽然提到问题清单和建议，但设计机制不能替代可观察的验收结果。
- Impact: 实现可以只列会话 id 和四选一标签，既不说明 skill 哪里被绕过，也不给可核对证据或改进建议，却仍满足当前全部 AC；这会让 Goal 的主要用户结果未被验收。
- Route: 将 R1/R3/R4/R5 的上述独立义务拆成可观察的 AC 子句，并分别指向 `finding-contract.md`、报告模板、交接模板及对应的合同测试或人工验收；不要只在一个 AC 上挂多个 R 编号。

### TPR-02 · 阻断 · Codex 与 Oh My Pi 把“读取目标 skill”误当成“实际调用”

- Location: `prd.md:27`（R2）、`prd.md:41-42`（AC1b/AC2）、`design.md:55-56`、`research/clone-analysis.md:23-28,82-90`
- Claim: Codex 的工具记录或 Oh My Pi 的 `read`/bash 只要打开 `.../skills/<name>/SKILL.md`，就足以证明该 skill 被调用。
- Evidence: `research/clone-analysis.md:23-28,82-90` 已记录相反边界：加载不等于调用，Codex 应看工作流标记；克隆原文 `ref/repo/skill-usage-retro/Sun-sunshine06-skill-optimizer/skills/skill-optimizer/SKILL.md:72-78` 也明确区分 load 与 active invocation。更直接的内部反例是 `design.md:90`：后续 qiaomu-meta Agent 必须读取目标 skill；该“审阅/改写目标”的会话会产生与 `design.md:55-56` 完全相同的读文件信号，却不是目标 skill 的使用会话。
- Impact: 报告会稳定混入 qiaomu-meta 改写、静态审阅或代码搜索会话，并把这些会话里的摩擦错误归因给目标 skill；R2、AC1b 和 AC2 都依赖这一错误推论。
- Route: 为 Codex/Oh My Pi 分开记录 `available`、`loaded/inspected`、`invoked`；读文件只能进入候选或低置信层，必须再由目标 skill 的工作流标记、输出合同或后续行为证据确认，无法确认时裁决为 `INCONCLUSIVE`，不能单独作为改进依据。

### TPR-03 · 阻断 · 路径输入被降格成名字，无法区分同名 skill 实例

- Location: `prd.md:26`（R1）、`design.md:49-60`
- Claim: 输入 skill 路径时读取 frontmatter `name`，随后仅以 `--skill-name` 扫描，就能保持目标身份。
- Evidence: `design.md:60` 明确把路径输入折叠为 frontmatter 名字，扫描器合同没有 `--skill-path`、规范化路径或版本/来源标识。本机同时存在 `D:\Documents\Code\Agents\my-claude-code-settings\skills\development-workflows\trellis-plan-review\SKILL.md` 与 `C:\Users\lyh\.skillsmanage\skills\trellis-plan-review\SKILL.md`；同名但路径和可能的版本不同。Claude/Grok 的结构化字段及 Codex/Oh My Pi 的读记录都包含路径，当前设计却丢弃了这部分可用身份信息。
- Impact: 用户给出明确路径时，报告仍可能聚合另一个安装副本、仓库副本或旧版本的会话，再用当前目标 `SKILL.md` 去评判它们；R1 的“名字或路径”语义失真。
- Route: 保留并传递规范化目标路径/来源身份；路径输入应按精确实例匹配，名字输入应执行明确的解析与歧义报告。若产品确实要跨副本聚合，必须把该选择、版本兼容规则和对应 AC 明写出来。

### TPR-04 · 阻断 · 会话检索范围在平台间不一致，且 Grok 根路径少一层 session id

- Location: `prd.md:5,34`（Goal、R9）、`design.md:49-58`
- Claim: 四个平台适配器能为给定 skill 列出过去的调用会话。
- Evidence: Claude、Grok、Oh My Pi 被限定到当前 `cwd` 的编码目录（`design.md:53-54,56`），Codex 却扫描全局 `~/.codex/sessions/**`（`design.md:55`）；Goal 与 R9 没有声明“只看当前工作区”。只读命令 `rg -l 'Base directory for this skill:...trellis-plan-review|attributionSkill...trellis-plan-review' C:\Users\lyh\.claude\projects` 找到当前仓库之外的结构化调用 `...\D--Documents-Code-Github-ccr\ee300746-ae87-49be-9f39-159bf4456b44.jsonl`，当前 cwd 方案会漏掉它。另据本机目录，Grok 实际文件形状为 `~/.grok/sessions/<encoded-cwd>/<session-id>/chat_history.jsonl`，例如 `...\01a0382b-83f9-7f71-90e4-87261e209511\chat_history.jsonl`；`design.md:54` 写成了缺少 `<session-id>` 的 `.../<encoded-cwd>/chat_history.jsonl`。
- Impact: 同一 skill 在不同仓库的真实调用会被 Claude/Grok/Oh My Pi 漏掉，而 Codex 又会全局聚合；按文档直接实现 Grok glob 时，本工作区现有会话也可能一个都找不到。AC1 的四平台结果因此不可成立。
- Route: 先决定并写明统一的检索域（全局、本 cwd，或显式开关），让四个平台遵守同一语义；修正 Grok 的嵌套路径，并用至少两个 cwd、多个 session 子目录的 fixture/真实只读 smoke 证明范围。

### TPR-05 · 阻断 · R8 的 Production 触发行为没有可执行验收门

- Location: `prd.md:33`（R8）、`prd.md:46,69`（AC6、Key decisions）、`design.md:20,30`、`implement.md:14-25`
- Claim: 新增 `evals/evals.json` 的正负例，再运行 `just ci`，即可证明 description 的触发与不触发边界。
- Evidence: `.trellis/spec/guides/skill-authoring-conventions.md:216-225` 明确说明仓库 `evals/evals.json` 只是人工审阅的行为/输出 fixture，`just ci` 不执行它；同文件 `:235-245` 要求 qiaomu-meta 的独立 trigger cases/概念配置和 `trigger_eval.py` 门。当前计划没有 trigger cases、阈值、命令或通过判据；`implement.md:19-25` 的全部命令都不会运行触发评估。
- Impact: description 可以对 R8 的正例漏触发、对近邻负例误触发，而 `just ci` 和全部现有 AC 仍然全绿；“Production：trigger eval”只是声明，没有证据闭环。
- Route: 保留仓库 `evals/evals.json` 作为行为合同，同时补任务内可复现的 qiaomu trigger cases/概念配置、执行命令与明确通过阈值；这只是验证新 skill 的 description，不授权 qiaomu-meta 改写任何 skill。

### TPR-06 · 应修 · 隐私 AC 没有确定的通过判据

- Location: `prd.md:31,45`（R6、AC5）、`design.md:88,100-107`
- Claim: “报告不含完整用户私聊”足以确定隐私要求是否通过。
- Evidence: AC5 没有定义“完整”的边界、短摘录的最大长度/数量、必须脱敏的字段或检查方法；`design.md:107` 又明确 helper 不做完整 secret scan，只笼统要求 `SKILL.md` 脱敏。`design.md:100-101` 的测试清单没有报告隐私 fixture 或人工检查步骤。同一份接近完整、只删一小段的消息既可能被判通过，也可能被判失败。
- Impact: 验收者无法得到唯一 pass/fail，敏感私聊或凭据片段可能进入报告；反过来实现者也可能过度删除，导致证据不可核对。
- Route: 定义短摘录的可测上限、允许/禁止字段与脱敏顺序，并在报告模板或 finding contract 中落机制；增加确定性 fixture/扫描或明确的人工检查清单，无法自动证明的 secret 风险保留为 `UNVERIFIED`。

### TPR-07 · 应修 · `.gitignore` 判断允许错误的权威来源

- Location: `prd.md:36,48`（R11、AC8）、`design.md:77-82`
- Claim: 用 `git check-ignore`（或读 `.gitignore` 行）判断“已覆盖”，即可保证仓库根 `.gitignore` 含 `reports/skill-session-review/`。
- Evidence: R11/AC8 要求根 `.gitignore` 自身包含该行；但不校验来源的 `git check-ignore` 也可能因全局 excludes、父级规则或 `.git/info/exclude` 返回命中。计划所引用的近邻 `skills/git-github-collaboration/git-worktree/SKILL.md:48-56` 明确规定全局 excludes 和 `.git/info/exclude` 不足以满足仓库门。当前设计把两个不等价的判断写成可互换方案，测试清单也没有外部 ignore 命中用例。
- Impact: 某台机器上报告被忽略时 helper 会跳过追加，但仓库根规则仍缺失；换机器或提交后 AC8 失效。
- Route: 以根 `.gitignore` 的精确规范化规则为权威，或解析 `git check-ignore -v` 并只接受根文件来源；补全局 excludes/`.git/info/exclude` 命中但根规则缺失的回归用例。

### TPR-08 · 应修 · 实施计划没有验证真实适配器边界，也缺少逐步检查

- Location: `design.md:98-107`、`implement.md:5-27`
- Claim: 四平台 fixture 加最终 `just` 命令足以完成实施验证。
- Evidence: `implement.md:7-15` 的九个步骤都没有各自的验证命令，`implement.md:17-27` 只列全局静态/测试门和 writer 的临时仓库检查；没有对本机已存在的 Claude/Grok/Codex/Oh My Pi 会话做只读 smoke，也没有验证跨 cwd、同名不同路径、load-vs-invoke、重复事件去重或真实 session id 提取。当前只读核对已确认：Claude 当前仓库有 14 个 JSONL、Oh My Pi 全局有 66 个、`~/.pi` 为 0、Grok 使用 session 子目录；这些正是 fixture 可能与真实格式共同漂移的边界。
- Impact: fixture 可以与实现一起写错而仍然全绿；实施者到最后才发现真实目录或事件形状不匹配，且无法把故障定位到某一步。
- Route: 为扫描器、writer、skill 合同和路由分别给出最小检查；增加不回显私聊正文的真实只读 smoke/元数据核对，并把外部格式无法自动证明的部分列为手工或 `UNVERIFIED` 边界。

### TPR-09 · 提示 · context manifests 混入代码、待改文件和自动注入的任务文档

- Location: `implement.jsonl:7-9`、`check.jsonl:4-6`
- Claim: `implement.jsonl` 与 `check.jsonl` 已替换为真实、可直接用于 Phase 2 的上下文条目。
- Evidence: `implement.jsonl:7` 指向本任务将修改的 `skills/developer-tools-integrations/AGENTS.md`，`:8` 是 Python 代码，`:9` 是另一个 skill 的 `SKILL.md`；`check.jsonl:4-5` 重复列出本来就会自动注入的 `prd.md`/`design.md`。`.trellis/workflow.md` 的 context 规则只允许 spec/research，明确排除代码与即将修改的文件。`task.py validate` 虽退出 0，但已对 `implement.jsonl:8` 发出 code-file warning。
- Impact: Phase 2 上下文会重复、自引用并携带待修改文件的旧内容；结构校验通过容易被误读成 context 已完成治理。
- Route: manifests 只保留 `.trellis/spec/**` 与任务 research；让 agent 按计划自行读取代码和待改文件，并把 `feasibility.md` 等真实信号研究放进 check 上下文，而不是重复注入任务文档。

### TPR-10 · 提示 · `AC1b` 被预检解析成第二个 `AC1`

- Location: `prd.md:40-42`
- Claim: `AC1b` 是可被现有 Trellis 追溯工具稳定识别的独立 criterion id。
- Evidence: `plan_precheck.py` 结果为 `requirements=11 criteria=10`，但 criteria 列表出现两个 `AC1`，第二个没有 requirement，并报告 `criteria_without_requirement=['AC1']`；原文 `AC1b（R9）` 实际有 R9 注解，说明是 id 语法被截断而非真实缺链。
- Impact: 当前人工可读，但机械预检会持续给出误导结果，后续按 id 修订或交接时容易引用错 AC。
- Route: 使用工具支持的纯数字 AC id；若要扩展 id 语法，应另立 Trellis runtime 范围并先补解析测试，不在本 feature 中顺手改预检器。

## 未能核实

- 四个平台所有历史版本的 JSONL schema、截断/损坏行行为与超大文件性能 — 适配器尚未实现，本次只核对了当前本机目录形状、少量结构化字段和文件数量。
- 实际报告能否稳定脱敏凭据、身份信息和长私聊 — 当前只有规划文字，没有可运行模板/fixture/helper。
- Windows junction/reparse point 的拒绝是否覆盖所有路径形状 — `design.md` 声明拒绝，但测试计划未列 junction/reparse 用例，代码尚不存在。
- 第三方候选的安装量、完整许可证与真实维护质量 — `research/prior-art.md:70-75` 已诚实标为 missing evidence，本次未联网补核。

## 可靠部分

- 任务仍为 `planning`（`task.json:6`），因此 Pass 7 实现漂移不适用；本次没有运行 `task.py start/finish/archive`，也没有修改规划或产品代码。
- 复杂任务六类产物齐全；`plan_precheck.py` 没有发现 placeholder、缺文件、越界引用或 undefined R/AC，正确识别 11 个 requirement、10 条 criterion。`task.py validate` 也确认 JSONL 都有真实条目；这些仅是结构证据，不是实施就绪结论。
- `prd.md:15-22` 的多项当前仓库事实成立：工作分支为 `dev`；目标 category、近邻 skill、空 `reports/` 目录、qiaomu-meta 路径、四类会话存储以及缺失的 `agent-skill-review` 均已只读核对。
- 本机 `trellis` 确为 0.6.15，`trellis mem search ... --platform pi --global --json` 返回 `[]`；`~/.omp/agent/sessions` 有 66 个 JSONL，`~/.pi/agent/sessions` 为 0，支持计划排除空 `.pi` 适配层的决定。
- 当前根 `.gitignore` 不含 `reports/skill-session-review/`，`git check-ignore -v reports/skill-session-review/example.md` 退出 1；“需要新增项目级 ignore 规则”的现状判断正确。
- 新 skill 目录、根 `.gitignore`、category `AGENTS.md` 和生成 docs 的改动边界，与 `skills/AGENTS.md`、category `AGENTS.md` 及目录规范一致；目标 skill 只读、诊断与 qiaomu-meta 创作分离的产品边界在 PRD/design/implement 中一致。
- Python writer 的 UTF-8 LF、同目录临时替换、路径受限、退出码和不回显正文方向，与 `.trellis/spec/backend/quality-guidelines.md`、`error-handling.md` 及现有 `write_review_report.py` 模式一致。
- `design.md` 没有需要重算的预算、像素、超时或单位论证，Pass 4 不适用。

## 盲区

An agent reviewing an agent's plan is not an independent second opinion. The reviewer and the
author share most of the same blind spots. A clean report means "this pass found nothing", not
"the plan is complete". Treat the findings as a triage list, not as an approval.
