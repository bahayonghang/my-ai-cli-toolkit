# 宿主抑制指令与面包屑实测证据

来源：本任务前一轮调查（2026-08-25）。原任务面向仓库 `.trellis/` 配置，已按用户决定移出仓库；证据保留在此，作为 goal-meta-skill 派发条款的设计依据。

## 1. 宿主系统提示含反向抑制指令

Claude Code 2.1.245 的系统提示末尾含：

```
Do not call the AgentTool unless the user requested it
```

- 该字符串是 `claude.exe` 内置常量 `LLr`。
- 由 `NIs()` 经 `tengu_heron_brook` 注入。
- 三条注入来源都在本地仓库之外：client data 覆盖、远端动态配置、门函数 `tzt(e)`。

因此该指令是否出现在某次会话里，不由仓库内任何文件决定。这解释了用户观察到的「有时生效有时不生效」。

## 2. 谓词冲突

抑制指令的谓词是**「用户是否请求了」**。

Trellis 本体把派发写成 `.trellis/workflow.md` 的 `Main-session default`——一个默认值，不是用户请求。用户在这类回合里的实际输入常常只是 `continue`。模型据此判定「用户未请求」，抑制指令胜出。

## 3. 面包屑注入时机与状态跃迁错位

`task.py start` 在回合中途把状态翻成 `in_progress`，但 `[workflow-state:in_progress]` 由 `UserPromptSubmit` 钩子注入，要等下一个用户提问才送达。因此 `start` 之后、下一次提问之前的整段实施，看到的仍是 `planning` 面包屑，正文为 `Load trellis-brainstorm; stay in planning.`，完全不提派发。

## 4. 五个会话的实测计数

主会话编辑数 vs 子代理派发数，取自到达 `in_progress` 的历史会话：

| 日期  | 会话     | CLI 版本 | 主会话编辑 | 派发子代理                            |
| ----- | -------- | -------- | ---------- | ------------------------------------- |
| 06-24 | 0e6abb2c | 2.1.181  | 12         | implement ×2                          |
| 07-22 | cfdce97d | 2.1.217  | 7          | 无                                    |
| 07-22 | f00fa906 | 2.1.217  | 29         | 无                                    |
| 08-16 | 15b814c8 | 2.1.233  | 13         | research ×3 / implement ×4 / check ×1 |
| 08-20 | cc61d761 | 2.1.237  | 22         | 无                                    |

三个会话在面包屑已含 `Main-session default: dispatch implement/check sub-agents` 时派发次数为 0。

cc61d761 时间线：10:07:57 运行 `task.py start`，10:10:31 起主会话连写 7 个文件，全部落在上一个用户回合内。

## 5. 对 goal-meta-skill 的设计含义

`/goal` 正文是用户自己粘贴的话。派发要求写进 `/goal` 即直接满足「用户已请求」这个谓词，不需要与系统提示竞争，也不依赖钩子的注入时机。

这是把修复放在 goal-meta-skill 而不是仓库钩子里的理由。

## 6. 证据等级

- 抑制指令字符串与注入路径：`local-probe`，在本机 2.1.245 二进制中定位。
- 五会话计数：`local-probe`，来自本机会话记录。
- 「派发条款写进 `/goal` 会提高实际派发率」：**hypothesis**。谓词匹配是机制层论证，尚无生成后执行的对照观测。不得在 handoff 里写成已验证。
