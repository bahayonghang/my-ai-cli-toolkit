# /goal 官方事实研究(2026-08-03 实测)

逐条标注证据等级:**official**(官方文档原文)/ **local-probe**(本机实测)/
**community-observed**(社区对源码/PR 的解读,不得写成官方事实)。
实现阶段修改 `references/platform-goal-facts.md` 时以本文件为准,并在该文件加
`Last verified: 2026-08-03 against <url>` 行(house 规则)。

## 对现有 facts 文件的修正(审阅点 1 核实结果)

| 现有表述 | 核实结果 | 证据 |
|---|---|---|
| "Enablement: experimental,需手动启用 features.goals" | **过期**。goals 现为 stable 且默认启用;`features.goals` 启用指引仅作为老版本/受管环境的排障回退保留 | local-probe:`codex features list` on 0.146.0 → `goals  stable  true`;official:follow-goals 页仍保留"若列表无 /goal 则启用 features.goals"的排障文案 |
| "Commands: set / view / pause / resume / clear" | **缺 `/goal edit`**。官方命令面:"Set, edit, pause, resume, view, or clear a task goal";"Use `/goal edit` to revise the objective" | official:developers.openai.com/codex/cli/slash-commands(§ Set or view a task goal with /goal) |
| "Persistence: goals persist across sessions (v0.128.0+)" | 窄化有误。**0.128.0 是 Goals 可用性起点**("Goals are available starting in Codex 0.128.0") | official:cookbook using_goals_in_codex |

## Codex 侧新增事实

- **goal 文本 = 首轮 prompt + 完成标准**:"The goal text becomes both the first
  prompt and the completion criteria for the task."(official:learn.chatgpt.com/docs/long-running-work)
- **官方建议 /plan 先访谈**:"If the outcome is still unclear, start with /plan.
  Ask ChatGPT to interview you, identify constraints, and turn the result into a
  goal with measurable success criteria."(official:同上)—— 本 skill 的访谈定位有官方背书。
- **官方三要素表**:Outcome / Constraints / Verification(official:同上)。
  cookbook 六要素(Outcome/Verification surface/Constraints/Boundaries/Iteration
  policy/Blocked stop)与本 skill 六字段一致(official)。
- **不扩权 + 决策即暂停**:"Starting a goal doesn't grant ChatGPT broader access.
  It keeps the same sandbox and approval policy and pauses when it needs a
  decision."(official:同上)—— Codex 存在真实的决策暂停;暂停条件字段在 Codex
  侧有运行时对应物。
- **read-first 开局有官方背书**:follow-goals 官方清单第 2 条"Point Codex at the
  files, docs, issue, logs, or plan it must read first";第 4 条"work in
  checkpoints and keep a short progress log"(official:follow-goals use-case 页)。
- **生命周期状态**:active / paused / cleared / completed / **budget-limited**;
  暂停/恢复/清除/预算转移由用户或系统控制,模型只能创建与(证据支持时)标记完成
  (official:cookbook)。
- **`/goal edit` 语义**(community-observed:openai/codex PR #21954,2026-05):
  打开预填编辑框;active/paused 保持状态,completed 重置为 active,
  budget-limited 保持;**保留 token 预算与时间/token 记账**;要重置记账需
  `/goal clear` 后新建。管理型问答应据此回答"改目标但保留进度记账"类请求。
- **文本预算子句不能设置运行时预算**(community-observed,证据强):PR #21954
  评论区实测 `/goal --tokens 8000 …` 与 goal 正文写 "use up to 8000 tokens"
  均未限制实际消耗("completed the goal with more than 8000 tokens used")。
  运行时预算是 thread/goal API 层的记账状态,无文档化的 goal 文本设置方式。
  → 起草规则:预算类文字只能作为**软性停止条款**输出,并明确告知用户它不等于
  平台运行时预算。
- 4,000 字符上限、objective 非空:不变(official:slash-commands 页)。

## Claude Code 侧新增事实(现有 facts 均准确,以下为增补)

来源:code.claude.com/docs/en/goal(official,本会话全文抓取)。

- **goal 不改变权限**:默认权限模式下每轮工具调用仍会请求批准;无人值守需配
  auto mode("pair /goal with auto mode")。
- **`/clear`(开新会话)也会移除活动 goal**。
- **evaluator 每轮返回 reason**,作为下一轮工作的指引;状态视图显示最近 reason。
- 官方有效条件三件套:一个可度量终态 + 声明的检查方式 + 关键约束。
- **turn/time 上限条款是软边界**:"Claude reports progress against that clause
  each turn and the evaluator judges it from the conversation" —— 由 evaluator
  从对话判断,不是硬计时器。
- 实现机制:`/goal` 是会话级 prompt-based Stop hook 的包装;evaluator 用配置的
  small fast model(Claude API 默认 Haiku),`ANTHROPIC_DEFAULT_HAIKU_MODEL`
  可换(全局生效,慎推荐)。
- headless:`claude -p "/goal ..."` 单次跑完;默认 text 输出在完成前无打印,
  建议 `--output-format stream-json --verbose`。
- 路由邻居:`/loop`(时间间隔)、自定义 Stop hook(脚本判定)。

## 官方来源清单

- https://code.claude.com/docs/en/goal
- https://developers.openai.com/codex/cli/slash-commands(§ /goal)
- https://developers.openai.com/codex/use-cases/follow-goals
- https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex
- https://learn.chatgpt.com/docs/long-running-work
- local-probe:`codex --version` → 0.146.0;`codex features list` → `goals stable true`
- community-observed:github.com/openai/codex/pull/21954;win4r/goal-prompt-builder
  README(continuation.md audit 机制解读,标注为社区解读)
