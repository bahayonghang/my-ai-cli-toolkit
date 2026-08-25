# Feasibility

Date: 2026-08-25

## Verdict

可行。做成独立 meta skill，MVP 用本机已有会话文件即可验证。不要做成运行时优化器，也不要并入 qiaomu-meta。

## Problem restatement

用户要稳定接住的重复任务：指定一个已有 skill，根据过去真实使用过它的对话，找出 skill 文本该改的地方，写成可执行的改进报告，再交给原 skill 的优化流程。

## Fundamental constraints

- 会话文件在用户磁盘上，不上传。
- 多数客户端没有「skill 调用」专用遥测；能用的是 JSONL 里偶尔出现的结构化字段，加上 `SKILL.md` 被读入上下文的痕迹。
- 对话里提到 skill 路径，不等于调用了 skill。
- Agent 没按 skill 做，可能是 skill 写错，也可能是执行不合规。
- 私聊不能原样进仓库。
- qiaomu-meta 已声明自己是作者，并禁止隐式扫私聊后改规则。

## Local evidence

### Retrieval

`trellis mem search "trellis-plan-review" --cwd <this-repo> --limit 5 --json` 返回 Grok 与 Claude 会话。OpenCode 提示 reader unavailable。CLI 0.6.15 落后于项目 0.7.0-beta.3，但不阻断检索。

假阳性：多条命中只是助手在列举改动文件时写了 `trellis-plan-review/SKILL.md`，并不是该 skill 被触发。

### Claude Code

路径：`C:\Users\lyh\.claude\projects\D--Documents-Code-Agents-my-claude-code-settings\*.jsonl`

已见表字段：

- 用户消息注入完整 skill 正文，前缀 `Base directory for this skill:`。
- 助手消息 `attributionSkill`（样例 `"yao-meta"`）。
- `attachment.type` 为 `skill_listing` 只说明 skill 在目录里，不说明本次调用。

### Grok

路径：`C:\Users\lyh\.grok\sessions\<urlencoded-cwd>\<session-id>\chat_history.jsonl`

已见表字段：

```xml
<skills_referenced>
  <skill name="qiaomu-meta-skill" path="C:\Users\lyh\.grok\skills\qiaomu-meta\SKILL.md"/>
</skills_referenced>
```

以及 `<skill name="..." args="...">` 包裹注入正文。这足以把「调用 qiaomu-meta」从「讨论 qiaomu-meta」里分开。

### Codex

路径：`~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl`。

已见表字段：

- `world_state.host_skills.body`：可用 skill 目录。出现在这里只表示加载到上下文，不表示本次调用。
- 调用信号：`response_item` `custom_tool_call` / `event_msg` 读取 `.../skills/<name>/SKILL.md`（本机样例为 `Get-Content -LiteralPath '.../latex-thesis-zh/SKILL.md'`）。

### Oh My Pi（omp / pi）

路径：`C:\Users\lyh\.omp\agent\sessions\<encoded-cwd>\*.jsonl`。本仓库目录有会话。

`C:\Users\lyh\.pi\agent\sessions` 有三个编码 cwd 子目录，文件数为 0。`trellis mem --platform pi --global` 在 CLI 0.6.15 返回 `[]`。检索必须直接读 `~/.omp`，不能依赖当前 `trellis mem` 的 pi 适配器。

JSONL：`type=message`，`message.role` 为 `user` / `assistant` / `toolResult`。工具名集合含 `read`、`bash`、`grep`、`edit` 等。全库 66 个 jsonl 中 38 个含 `SKILL.md` 字符串。未见 `skills_referenced` 或 `attributionSkill`。调用判定暂用对目标 `SKILL.md` 的 `read`（或 bash 读文件）记录。

## Technical options

1. **关键词搜全文**  
   实现快，假阳性高。只可作召回，不可作调用判定。

2. **结构化调用检测 + 抽会话 + LLM 对照 SKILL.md**  
   与 `x-skill-improve` / grandamenium 同类。本机 Claude/Grok 已有字段。适合 MVP。

3. **Eval replay / sleep-cycle（SkillOpt、darwin）**  
   能量化，但要后端、预算、held-out 集。超出「改进报告」请求。

推荐 2。检索可走 `trellis mem --json`，判定必须再用字段过滤。

## Risks

| Risk | Effect | Mitigation |
|---|---|---|
| 把文件路径提及当成调用 | 报告污染 | 结构化信号白名单；启发式单独分栏 |
| 把合规缺口写成 skill 缺陷 | 错误补丁 | 强制双视角标签 |
| 一次纠正升成核心规则 | skill 膨胀 | 泛化门；单次默认 ONE-OFF |
| 报告写入私聊原文 | 泄露 | 短摘录上限；禁止整段 user_query |
| 本 skill 直接改目标 SKILL.md | 与 qiaomu-meta 抢权、过拟合 | Q1；默认只报告 |
| Codex 把目录列表当成调用 | 假阳性 | 忽略 `host_skills` 目录；只认读该 SKILL.md 的工具记录 |
| Oh My Pi 走 `~/.pi` 或 `trellis mem --platform pi` | 空结果 | 读 `~/.omp/agent/sessions` |
| 会话体积大 | 上下文爆 | 先 inventory 调用会话，再按会话切片，不一次读全量 JSONL |

## Non-skill check

会反复出现，流程稳定（定位会话 → 对照 SKILL.md → 分类 → 落盘报告 → 交接）。不是一次性总结。应做成 skill。
