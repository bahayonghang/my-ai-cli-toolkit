# 用户提供的审计材料（原文，非当前现场证明）

## 4. git-commit：消除机械中止，同时保留暂存边界

文件：
C:/Users/lyh/.agents/skills/git-commit/SKILL.md

原文定位：
- 18 行：staged-only is the default.
- 42 行：no staged changes: stop and tell the user to stage files first.
- 129—131 行：明确提交请求可不重复确认。
- 143 行：hook 拒绝后停止，修改消息需要满足附加条件。

默认优化：
- 保留 staged-only、all-changes 和明确的安全审批要求。
- 无暂存内容时，先利用已授权读取完成候选文件清单和提交消息准备，
  不只返回“请先 stage”。
- 区分未获授权的暂存、文件范围不清和纯消息格式失败，
  说明准确阻点，不把整个任务交回用户从头处理。
- 已授权的提交完成后，将 push/PR 等剩余请求交回主 Agent，
  不因本技能结束而遗失后续任务。

保留：
- 秘密、异常大文件和二进制文件的审查与审批。
- 不明确的文件分组不得擅自提交。
- commit-only 不授权 push、PR、amend 或 rebase。

可选方案：扩大本地操作权限，未批准前不实施
1. 用户明确要求提交本轮或点名文件，且集合可唯一确定时，
   允许只暂存该集合；不吸入无关文件，不默认 git add -A。
2. hook 明确只拒绝提交消息格式时，允许保持语义和文件范围，
   修正格式后重试一次；不得绕过 hook。

验收场景：
明确的提交授权不会被再次询问“是否提交”；
没有暂存授权时，也能先完成可审阅的提交准备。

4. git-commit：hook 非零后先诊断，不得绕过

这里的 hook 仅指 Git commit hook，不涉及任何 Trellis hook。

### 证据

文件：`/home/lyh/.agents/skills/git-commit/SKILL.md`

- 第 143 行：`Hook rejected the commit ... stop and report the original hook failure.`
- 第 144 行却允许 formatter 修改文件后重新 stage 并重试。

### 问题

两类常规 hook 失败的处理不一致。用户已明确要求提交时，普通 commitlint、提交消息格式或可定位的检查错误会让任务在可恢复状态下过早结束。另一方面，直接自动改产品文件又可能超过纯提交请求的权限。

### 默认建议替换

将第 143 行替换为：

```text
**Hook rejected the commit** (non-zero exit): preserve and report the original output, diagnose the failure, and never bypass or disable the hook. Prepare the exact correction. Apply it only if the existing hook-remediation rule and the user's authorization permit it; otherwise present the correction and ask once. If remediation requires product-file edits, continue only when the original request already authorizes those fixes. Stop dependent execution when remediation would change the requested scope or meaning, require destructive history editing, or introduce a new external or production action.
```

### 可选有限扩权候选：语义不变的消息自动修复

本轮未批准此候选。若用户后续明确接受，可在上述段落后加入：

```text
When `git commit` is already authorized and the hook identifies only a commit-message format defect, correct the message and retry without another confirmation if the subject meaning, issue references, breaking-change status, file set, and attribution policy remain unchanged. Show the final message in the completion report.
```

这只允许自动修正空行、header 长度、合法 type/scope 排版等语义不变问题。以下情况仍须停止或询问：改变 `feat`/`fix` 等语义、增加或删除 issue closing、改变 breaking-change 标记、改变文件集合、修改产品代码、使用 `--no-verify` 或关闭检查。

### 权限影响

默认建议不扩大产品写入权限。可选候选会扩大 commit message 的自动修正权限，因此必须由用户另行批准，不能在本轮实施。

## 5. git-commit：保留现有提交边界

以下规则是有意安全护栏，不应为追求“更自主”而删除：

- `/home/lyh/.agents/skills/git-commit/SKILL.md:18-19`：默认 `staged-only`；只有用户明确说“所有改动”等才进入 `all-changes`。
- `/home/lyh/.agents/skills/git-commit/SKILL.md:42`：`staged-only` 且无 staged changes 时停止。
- `/home/lyh/.agents/skills/git-commit/SKILL.md:56`：疑似秘密和大文件不得静默提交，需要逐项决定。
- `/home/lyh/.agents/skills/git-commit/SKILL.md:28`：commit-only 不授权 push、PR、amend、rebase 或 tag。
- `/home/lyh/.agents/skills/git-commit/SKILL.md:130-131`：已有明确 commit 授权时不重复确认；仅草稿、范围实质变化或安全门命中时才等待确认。
- `/home/lyh/.agents/skills/git-commit/SKILL.md:164`：混合请求中已授权的 push/PR 后续动作可以由相应流程继续，不因 commit 阶段结束而重复索要授权。

不要在本次优化中新增 `scoped-changes`、自动 stage 未暂存文件或自动扩大 `all-changes` 的触发词。这些都会扩大当前提交权限，需要单独设计和批准。


6. goal-meta-skill：先消除同名不同版本的发现歧义

### 证据

存在两个内容和语义不同、但 frontmatter `name` 完全相同的 Skill：

1. `/home/lyh/.agents/skills/goal-meta-skill/SKILL.md`
   - 入口目录是指向 `/home/lyh/.skillsmanage/skills/goal-meta-skill` 的符号链接。
   - 第 2 行：`name: goal-meta-skill`。
   - 第 5 行：`version: 0.8.0`。
2. `/mnt/data/lyh/industrytslib/.agents/skills/goal-meta-skill/SKILL.md`
   - 是独立文件，且当前被项目 `.gitignore` 的 `.agents/` 规则忽略。
   - 第 2 行：`name: goal-meta-skill`。
   - 第 5 行：`version: 0.3.0`。

语义也不一致：

- 全局 0.8.0 第 31–33、64–65 行要求先交付 `DRAFT`，并禁止任何分支启动 Goal。
- 项目 0.3.0 第 41 行写的是 `Do not start the work described by the goal unless the user explicitly asks`，对显式启动请求的解释不同。

### 问题

同名 Skill 不会自动合并，两者可能同时出现在选择器中。同一用户请求可能因实际选中的文件而表现为不同的文本审批或显式启动授权判断。项目副本被忽略还意味着行为漂移不会自然进入版本审查。

### 建议处置步骤

1. 将 `/home/lyh/.skillsmanage/skills/goal-meta-skill` 作为当前 canonical 候选，将 `/home/lyh/.agents/skills/goal-meta-skill` 仅视为发现入口；在正式修改前核实 MCS 的真实源目录、生成目标、安装链接和缓存边界。
2. 对比 0.3.0 中仍需保留的非 Trellis 项目增量规则，并把必要内容合入 canonical 候选。
3. 若项目副本没有必须保留的独特行为，移除该旧副本；若确实需要项目专属 Skill，则改成唯一名称，例如 `industrytslib-goal-meta-skill`，并把 description 限定为项目增量规则。
4. 完成后在新 Codex 会话中重新枚举 Skill，确认只出现预期名称和版本；按实际安装机制确认是否需要重启 Codex。

移除或改名之前必须先确认项目副本是否承载未迁移规则。不要直接用全局版本覆盖项目文件。如果合并、删除或改名会改变任何 Trellis 路由或生成的 Trellis 规则，本次不得实施该处置，只报告冲突和需要另行决定的范围。

### 权限影响

消除同名冲突本身不扩权，但可能改变项目中的实际路由和行为，属于需要用户审阅的配置语义变更。任何允许 Skill 创建、激活或执行 Goal 的修改属于明确权限扩大，必须单列批准；本轮不默认执行。

## 7. goal-meta-skill：完成条件必须是合取关系

### 证据

旧项目版本 `/mnt/data/lyh/industrytslib/.agents/skills/goal-meta-skill/SKILL.md:87-89` 的示例写道：

- 最多进行 3 轮改进。
- `Stop when` 包含 “checks pass or missing checks are explicitly reported”。
- `Pause if` 罗列 credentials、payments、production data、copyrighted assets、unclear ownership 等宽泛类别。

全局 0.8.0 `/home/lyh/.agents/skills/goal-meta-skill/SKILL.md:98` 已要求“合取式完成条件”，两版没有对齐。

### 问题

“检查通过或说明缺少检查”会把无法验证误当成完成；达到三轮上限也可能被误报为完成。过宽暂停条件会在用户已经提供授权、凭证使用方式或明确目标时仍机械停止。

### 建议替换原则

完成条件与迭代上限可统一为：

```text
Completion conditions: all requested deliverables exist, each required observable behavior is verified through the named entry point, all required checks pass, and diff/status evidence shows only authorized scope. Missing access, unavailable required checks, or exhausted iteration limits are incomplete or blocked outcomes, not completion.

Iteration limit: after the bounded improvement rounds, stop and report the remaining failed conditions and evidence. Do not mark the goal complete solely because the limit was reached.

```

继续保留：Goal 文本必须界定验证、写入边界和停止条件；缺少必要证据时不得声称完成。

### 可选流程放宽：收窄按类别暂停

以下文字会允许旧规则要求暂停的某些已授权操作继续，因此属于待单独批准的自主执行范围扩大，不属于默认修订：

```text
Pause or block when progress requires an unresolved user-owned decision, new authority, credentials that are unavailable for the authorized path, destructive or irreversible action, material scope/cost/public-behavior change, or an external-state change the agent cannot perform. Existing authorization and available credentials do not by themselves require another confirmation, but all explicit approval gates for the target operation still apply.
```

### 权限影响

把“无法验证”改为 incomplete/blocked 不扩权。收窄暂停条件属于可选流程放宽；未单独批准时保留旧暂停要求。即使批准，也不自动授权新的生产、付费、凭证、破坏性或外部操作。

## 8. goal-meta-skill：保留“编写而不启动”和覆盖审批

以下规则是明确职责边界，应保留：

- `/home/lyh/.agents/skills/goal-meta-skill/SKILL.md:25`：Skill 负责编译 Goal 文本，不创建、激活或执行 Goal。
- `/home/lyh/.agents/skills/goal-meta-skill/SKILL.md:38`：已有 `GOAL.md` 未获替换授权时不得覆盖，并使用已读取文件的 SHA-256 防止竞态。
- `/home/lyh/.agents/skills/goal-meta-skill/SKILL.md:39-40`：不得自动提交、忽略、删除、发布合同，也不得写入凭证或原始私有会话。

可考虑但本轮不批准的扩权候选是：当用户在同一请求中明确要求“生成并立即创建/激活 Goal”时，Skill 只完成文本编译，再把显式授权的启动动作交还主协调器。该修改必须与宿主 Goal API 的官方权限语义单独核对，不能通过本次文本优化默认获得授权，也不能改变任何 Trellis 规则。
