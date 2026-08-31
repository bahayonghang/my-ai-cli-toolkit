# Target handoff confirmation clause

Authoritative wording lives in `references/handoff-prompt.md` at implementation. This note is the intended semantic cluster, not a lock on one sentence.

## Chinese cluster (reviser prompt)

```text
确认门
- 先把剩余阻塞项分成三类：仓库可回答事实、已批准范围内的实现判断、用户所有且会改变范围/产品语义/风险/成本/授权的确认项（含 TPR Route 里互斥的产品选项，以及本轮修订新引入的 start 前门）。
- 第三类仍存在时，必须在继续写规划前用宿主结构化问题工具一次收口（最多 4 题）：Claude Code 使用 AskUserQuestion；Oh My Pi 使用 ask；Codex 使用实际可用的 request_user_input 或当前等价名；无工具则问一个简短编号题。每题带推荐项与互斥选项。先确认实际工具名，不得把未拥有的工具写成可调用 API。
- 禁止把确认清单只写进聊天并等待用户提醒「请使用 AskUserQuestion」。无第三类项时不得仪式性提问。仓库可回答事实与普通实现细节不得提问。
- 回答后在同一轮写入被决定条款，并处理全部「阻断」和「应修」。不要再开一轮等人提醒后才完善规划。若写回后又出现新的第三类项，可以再来一轮结构化提问（仍 ≤4），但不得退回聊天罗列。
- 仍禁止运行 task.py start / finish / archive，仍禁止声称规划已获批准或可以开始实现。本轮结束后规划应可被一次后续实施请求直接执行。
```

## English cluster

Same semantics: classify; must call host structured tool; dump-and-wait forbidden; one batch ≤4 with recommended options; write back in the same turn; no `task.py start`; plan left implementation-ready.

## Fail-closed strings for tests

Handoff Chinese and English templates must contain all of:

1. `AskUserQuestion`
2. host equivalent / no-tool numbered fallback
3. positive duty (must call / 一次收口)
4. dump-forbidden (不得只写聊天等待提醒 / do not dump a confirmation list and wait)
5. write-back in the same turn
6. still no `task.py start`
7. negative exclusions (repo-answerable / ordinary implementation details)

## Non-goals for this clause

- Do not add “批准规划并开工” as a start authorization. That belongs to `08-31-goal-meta-ask-confirm` generated `/goal`.
- Do not instruct the **reviewer** to call AskUserQuestion.
- Do not copy brainstorm “one question per message” into this reviser contract.
