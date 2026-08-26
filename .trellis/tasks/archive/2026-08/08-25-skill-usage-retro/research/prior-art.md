# Prior-Art Research

- Researched at: 2026-08-25
- Queries: GitHub `skill optimizer` repos; code search `filename:SKILL.md` + session/improve/transcript; Exa; SkillsMP keyword
- Local clones: `ref/repo/skill-usage-retro/` (see `README.md` there and `research/clone-analysis.md`)
- skills.sh: `npx skills find` 超时。install 数 = missing evidence
- Rating evidence: unavailable

SkillsMP 对短查询返回高 star 单仓（openclaw、superpowers、ECC），`repo_stars` 是仓库星，不是 skill 质量。下列短名单以 GitHub 源 `SKILL.md` / README 与 Exa 摘要为准。

## Shortlist

| Candidate | Relevance | skills.sh installs | SkillsMP repo stars | Quality/trust evidence | Adopt | Reject | License |
|---|---|---:|---:|---|---|---|---|
| quangtran88/x-skills `x-skill-improve` | 最接近：按 skill 搜历史会话，instruction inventory，Followed/Deviated/Skipped/Worked Around，双视角 `UPDATE SKILL` vs `COMPLIANCE GAP` | missing evidence | 4 | 源 SKILL.md 可读；依赖 oh-my-claudecode `session_search`，可降级读 Claude JSONL | adapt 双视角与 inventory | reject 锁死 x-skill 与 MCP | unknown in this pass |
| mitsuhiko/agent-stuff `improve-skill`（镜像 Dwsy/agent、registry 副本） | 抽当前会话 transcript，生成**新会话**改进 Prompt | missing evidence | n/a | 多平台路径 Claude/Pi/Codex；fresh-session 防上下文污染 | adapt 新会话交接、跨平台路径 | reject 只做单会话、把改写绑在同一套 Prompt | unknown in this pass |
| grandamenium/skill-optimizer | 读 JSONL vs SKILL.md，5 维打分，写 diff 与 `history.json` | missing evidence | 14 | 职责与用户请求接近；Claude JSONL 绑定 | adapt 报告 + 趋势文件 | reject 默认写 patch、单会话、无双视角 | unknown in this pass |
| crystian/skills `skill-optimizer` | 观察**当前对话**摩擦，提案改 SKILL.md，LESSONS.md 累计 Hits | missing evidence | n/a | 可安装集合；Kaizen 单轮观察 | adapt 复发计数、用户逐条 Accept/Postpone/Reject | reject 不做历史多会话检索 | unknown in this pass |
| Undertone0809 skill-optimizer / zee meta-skills | 执行痕迹 + 用户纠正 + eval 失败 → evidence ledger → 可审 patch + trigger eval | missing evidence | n/a | 与 qiaomu SkillOps 同构 | adapt 证据账本、一次偏好 vs 可复用规则、补 eval | reject 当创作器，和 qiaomu-meta 重叠 | unknown in this pass |
| anthropics/skills `skill-creator` grader | 对**受控 eval transcript** 做期望打分，并 critiquing evals | missing evidence | n/a | 官方；`grading.json` 字段稳定 | adapt 证据引用、表面合规 vs 实质完成 | reject 有机历史会话不是 eval harness | Apache-2.0 likely; verify at source |
| microsoft/SkillOpt `skillopt-sleep` | 收割 Claude 会话 → 挖重复任务 → replay → held-out 门 → staging 提案，默不改 live | missing evidence | 16319 (repo) | 研究系统 + Claude plugin；16319 star 是仓库注意力 | adapt harvest/stage/adopt 分阶段、held-out 门、默不改 live | reject 引入 replay 引擎与 `.skillopt-sleep` 运行时 | MIT (verify) |
| alchaincyf/darwin-skill | 评估→改进→测试→保留或回滚 | missing evidence | 5729 | 中文进化叙事；偏自动闭环 | adapt keep/revert | reject 无限进化运行时 | unknown in this pass |
| yctimlin/agent-usage-analyzer | Claude/Codex 本地会话 skill/tool/MCP **计数**；只认结构化 load，不认散文 | missing evidence | 3 | 计数保守；覆盖率说明 | adapt 结构化信号、coverage notes | reject 不做质量诊断 | unknown in this pass |
| kl529/skill-usage-stats | 扫 `commandName`，列从未使用 skill，建议删除 | missing evidence | n/a | Claude `commandName` 字段有用 | adapt 调用字段名 | reject 清理安装集 | unknown in this pass |
| florianbuetow retrospective | 多会话敏捷回顾，建议**新** skill / hook | missing evidence | n/a | 工作流回顾 | reject 目标是新能力发现，不是改进具名 skill | — | unknown in this pass |
| TerenceBristol/claude-improve | 扫最近 5 个会话的纠正/摩擦，改 CLAUDE.md/skills/hooks，逐条批准 | missing evidence | n/a | 信号类型表可用 | adapt 纠正/摩擦/能力缺口分类 | reject 主对象是全局配置 | unknown in this pass |
| affaan-m/ECC `skill-comply` | 合成场景测 skill 是否被遵守 | n/a | 241055 (monorepo) | 合规可视化 | adapt 「假定遵守」无效 | reject 合成跑，不是历史会话 | unknown in this pass |
| obra/superpowers `writing-skills` | 创建/编辑/验证 skill | n/a | 273973 (monorepo) | 写作 skill | reject 无历史用量闭环 | — | unknown in this pass |
| Sun-sunshine06/skill-optimizer | Claude+Codex 会话 + 静态分析，P0/P1/P2 | missing evidence | n/a | 多平台扫描表 | adapt 平台路径表、优先级 | 源未做许可证核验 | unknown in this pass |

## keep / adapt / reject / invent

### keep

- 双视角裁决：skill 错了 vs 执行没遵守（克隆 `x-skill-improve` SKILL.md）。
- 只认结构化调用，散文不当计数（克隆 `agent-usage-analyzer`）。
- 报告默不改 live 文件（克隆 Sun-sunshine06「Read-only: never modify」；Consiliency planner/editor 分离）。
- 复发才升级（crystian LESSONS Hits；Consiliency `--min-reflections` 默认 2；qiaomu 泛化门）。

### adapt

- `trellis-plan-review` 的落盘报告 + 可复制交接 Prompt。交接读者是 qiaomu-meta，不是本 skill 自己改文件。
- `trellis mem` 作跨客户端检索；调用判定再用 Claude/Grok 字段过滤。
- Sun-sunshine06：Codex 的 `base_instructions` 加载 ≠ 调用；调用看工作流标记。用户调用后的下几条消息作反应信号。
- Dwsy `extract-session.js` 的多平台路径表（实现时自写等价物，不执行其脚本）。
- grandamenium 对 Claude JSONL 嵌套 `message.content[].tool_use` 的解析说明。

### reject

- 安装 SkillOpt / darwin / GEPA 作为依赖。
- 当前对话观察器（crystian）当作历史多会话分析。
- usage 统计与未使用 skill 删除。
- 把 qiaomu-meta 扩成会话扫描器（与自身 SkillOps 冲突）。
- 从会话抽取**新** skill（`improve-skill` 的 create 分支、retrospective 的 skill opportunities）。

### invent

- 多客户端调用归因：Claude `attributionSkill` / skill 注入消息；Grok `<skills_referenced>`；Codex 的 structured SKILL.md load（待核）。
- 具名 skill 为分析单位，跨多次历史会话聚合，而不是「当前这一轮」或「整个工作流回顾」。
- 裁决标签强制四选一，并带置信度与 missing evidence。
- 交接对象固定为 qiaomu-meta（或等价作者 skill），本 skill 不抢创作权。

## Created skill advantages (hypotheses)

- Design advantage: 诊断与创作分离；报告可复制交接。尚未实现，故不是 validated advantage。
- Design advantage: 本地已有 Claude + Grok 结构化调用字段，不必先做 NLP 会话分类。
- Hypothesis: `trellis mem` 可当统一检索，Grok 适配器质量未在本任务外验证。
- Validated advantage: 无。本任务尚未实现包。

## Missing evidence

- skills.sh install 数（命令超时）。
- 各候选 LICENSE 全文（GitHub `web_fetch` 被 SSRF 拦截；`gh api` 只核了元数据）。
- Codex 会话是否有与 Claude `attributionSkill` 同级的 skill 调用字段。
- `x-skill-improve` 与 crystian optimizer 的真实维护频率与安全审查。
- 第三方 skill 是否在用户机器上装过、效果如何：未安装、未执行其脚本。
