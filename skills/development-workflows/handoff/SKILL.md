---
name: handoff
description: Use when the user wants to compact context before auto-compaction kicks in, hand off an unfinished task to a fresh session, switch topics mid-stream and preserve state, or pick up yesterday's work in a new conversation. Produces a single handoff.md that captures completed work, blocked items with what was already tried, next concrete steps, and the minimum context needed to resume cold. Use proactively when context usage is high, a long-running task hits a natural break, or the user signals a session switch. Triggers include 上下文压缩, 交接文档, handoff, 续接会话, 主题切换, 接力, 明早接着干, context handoff, compact before, fresh session, continue tomorrow. Do NOT use for single-file fixes that finish in one commit (put it in the commit body), Q&A or pure investigation sessions, or end-of-session retrospectives meant for human review (those are different artifacts).
category: development-workflows
tags:
  - handoff
  - context-management
  - session
  - continuity
version: 0.1.0
---

# handoff

让一份 `handoff.md` 成为"下一会话 AI 接力的入口文档"。在上下文被动压缩之前主动产出，让新会话不依赖回忆、只读这一份文件就能继续工作。

## Core principle

Claude Code 的自动压缩按字符预算丢弃内容，不知道哪些是判断逻辑、哪些是失败方案、哪些是接下来要做的第一步。被动压缩之后再接力，成本极高：新会话只能从代码和 git log 倒推意图，而失败过的路径、被否决的方案、当前 mental model — 这些代码里都没有。

handoff 是手动压缩。在你最理解当前状态的时刻，把"下一会话拿到这份文档就能立刻干活"所需的最小信息固化下来。它不是会话日记，不是给人复盘看的；目标读者是另一个 LLM 会话（包括明早的你 + 明早的 Claude）。

## When to start

任何一个信号出现就该写：

- 上下文使用率超过 60%，且当前任务还要继续
- 即将主动触发压缩，或察觉自动压缩在即
- 长跑任务到了自然断点（一轮调试结束、一个子模块写完、一组测试通过）
- 主动切换主题（P1 bug 进来要停下手头事 / 切到另一个 PR）
- 跨工作日续接（今晚停、明早或周一继续）
- 任务复杂且 trial-and-error 多（试过两三个方案都没收敛）

## When to skip

- 单文件改动一次提交收尾 → 写到 commit body
- 纯 Q&A、解释性会话 → 没什么要交接
- 一次性脚本、抛弃型实验
- 纯探索性 chat（连任务边界都没有 — 交接什么？）
- 任务规模小到下次会话从头开始的成本低于维护 handoff 的成本

写了之后发现工作太小，把文件删了。空的 handoff 比没有更糟。

## File location

默认 `handoff.md` 放仓库根目录。

并行多个未完成任务时改放 `.handoff/<slug>.md`，每任务一份，避免互相覆盖。

**是否入 git**：默认 gitignored（加到 `.gitignore`）。理由：handoff 频繁变化、是会话级状态，不该污染提交历史。任务跨多人、需要 review 时手工豁免，让 handoff 跟 PR 一起走。

## The four sections

每节回答的问题不同，不要混淆。每条目一到三句话，引用路径、行号、commit SHA。

### Completed / 已完成

确实跑通、有验证证据的事。**不要**把"打算做"或"做了一半"写进来。

- Good: "用户注册 API done，`POST /auth/register` 通过 6 个测试。bcrypt rounds 设为 12，见 `api/auth.ts:34`。"
- Bad: "实现了用户注册" — 没有验证证据，下次接力者不知道能不能信。

### Blocked / 在做但卡住

正在做、还没收敛的事。**必须**包含：卡在哪、已经试过什么、为什么不行。这是 handoff 区别于"列 TODO"的关键。

- Good: "JWT refresh token 卡在 token 轮换上。试过 `jsonwebtoken` 的 `verify` + 重签名，会有 race condition（两个并发请求拿到同一旧 token 都通过校验）。下一步考虑用 Redis 单 key 锁，见 `auth/refresh.ts:88` 的 TODO。"
- Bad: "JWT 还没做完" — 下次接力者要把所有失败路径重走一遍。

### Next steps / 下一步

新会话第一动作。按优先级排，每条具体到"打开哪个文件做什么"。

- Good: "1) 在 `auth/refresh.ts` 加 Redis 锁。2) 写 race condition 测试覆盖并发。3) 跑 `pnpm test auth` 确认绿。"
- Bad: "继续做 refresh token" — 太抽象，等于没说。

### Context / 必要上下文

新会话不知道、从代码也看不出来的事。包括环境状态、关键决策的 why、被显式否决的方案、外部依赖的怪癖。

- Good: "数据库用 Postgres 16，JWT secret 在 `.env` 的 `JWT_SECRET`（不要从 `process.env.SECRET` 拿，那是另一个东西）。Passport.js 试过但配置太复杂，统一用 `jsonwebtoken` + 自写中间件。"
- Bad: "项目是 Node.js + Express + Postgres" — git log / package.json 自己能看出来。

## Writing rules

- **边干边写**。决策当下就追加，不要等会话末尾批量写。事后追述会把"试过 A、试过 B、最后选 C"压成"选了 C"，下次接力者会重走 A 和 B。
- **引用而不要复制**。贴文件路径、行号、commit SHA。不要把代码段大段贴进 handoff，会很快过时。
- **删掉 git log 能告诉你的内容**。"在 `auth.ts` 加了 `validateToken`" — diff 已经写了。handoff 写"为什么是 `validateToken` 而不是 `checkToken`"，或"为什么先校验过期再校验签名"。
- **显式记录失败**。Failed attempts 比成功路径对下次接力更有价值。例如：试过 Passport.js 但配置太复杂 → 改用 jsonwebtoken。下次接力者不会再走一遍 Passport.js。
- **不写小说**。每条一到三句话。需要长解释 → 多半是两个决策塞一起了，拆开。

## Anti-patterns

| 反模式 | 反制 |
|---|---|
| 时间线流水账（"先做 A 然后做 B 然后做 C"） | 改成结构化的"已完成 / 卡住 / 下一步"，时间不重要 |
| 复制 git log 当 handoff 正文 | git log 自己就在仓库里，handoff 写 git log 没写的"why" |
| 把背景写成长文（项目历史、技术栈介绍） | 只写下次接力者不读不行的事，假设对方会读 README |
| 把决策塞到正文段落，不分节 | 决策、上下文、下一步分开放，新会话好定位 |
| 维护多个 handoff 文件互相 cross-ref | 一个任务一份 handoff，超过就拆 `.handoff/<slug>.md` |

## Cadence

- 新增条目：决策刚做完时、failed attempt 刚否决时、卡点刚明确时
- 重写：handoff 超过 200 行，多半是没及时清理已完成项，整体重写一遍
- 归档：任务完成后，把 handoff 内容合到 PR 描述或 commit body，删掉 handoff 文件

session 中 handoff 增加 0 条是正常的 — 没做出真决策、没碰到卡点的会话不需要写。强行填充比留空更糟。

## Picking up in a new session

新会话第一动作（无论 user 是不是开口要求）：

1. 检查仓库根目录 `handoff.md` 和 `.handoff/` 目录
2. 找到就先完整读一遍，不要跳读
3. 用一句话向 user 确认："准备从 handoff 的 Next steps 第 1 项 [具体内容] 开始，对吗？"
4. user 确认后开始第一动作，**同时**保持 handoff 同步更新（每完成一项划掉、每出现新失败追加）
5. 不让 handoff 与当前状态脱节 — 用户随时可能再开会话

如果 handoff 看起来过时（git log 比 handoff 新很多），先 `git log -10` 对一下，把不一致处问用户而不是猜。

## Integration with other skills

- **`implementation-notes`**：实施一份 spec 时记录决策、偏离、未决问题。handoff 处理跨会话状态，implementation-notes 处理单 spec 的判断细节。两者并存 — handoff 的 "Context" 节可引用 implementation-notes 的具体条目。
- **规划文档 / plan**：架构性方案应有独立 plan 文档（由你所在环境的规划工作流产出）。handoff 不替代 plan，只提到当前在执行哪个 plan 的哪一步。
- **`git-commit`**：已完成且已提交的事，commit body 写"why"，handoff 只留一句指针。变更记录别在两处重复。

## Minimal template

```markdown
# Handoff — <task slug>

**Last updated**: <YYYY-MM-DD HH:MM>
**Branch**: <branch>
**Spec / Plan**: <link or path>

## Completed
- (nothing yet)

## Blocked
- (nothing yet)

## Next steps
1. (first concrete action)

## Context
- (anything the new session can't get from code or git)
```

四节标题即使为空也保留 — 空标题是给自己的提问。

## Quality checklist

新会话开始接力前，handoff 必须满足：

- [ ] 每节都不空（或显式声明 "none"）
- [ ] 每条 Completed 都有验证证据（测试、命令输出、文件路径）
- [ ] 每条 Blocked 都包含"试过什么、为什么不行"
- [ ] 每条 Next steps 都具体到文件 + 动作，不是抽象目标
- [ ] Context 节不重复 README / package.json 能告诉新会话的事
- [ ] 整份文档新会话能在 60 秒内读完
