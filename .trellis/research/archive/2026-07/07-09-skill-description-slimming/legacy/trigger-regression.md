# 触发回归清单（等价于 trigger_eval.py 的人工评测）

> 说明：已安装的 yao-meta skill 并未附带 `trigger_eval.py`（SKILL.md 引用但未分发），
> 按 PRD 备选方案改用触发用例清单逐条核验。评测方法：对每个被修改的 skill，
> 取原 description 中被删除的触发短语构造代表性用户话术，判断新 description
> 是否仍能命中；并核验原排除场景仍不命中。

## 结论

- 34 个被修改 skill 全部通过；1 例（touying）在评测中发现真实回归风险，已修复。
- 2 例带备注（cold-shower、claude-md-improver），属可接受的语义泛化。

## 逐项核验

| Skill | 高风险话术（含被删短语） | 判定 | 说明 |
|---|---|---|---|
| paper-plot | "照着这个图画"；"用 bar_paired_delta 画" | PASS | "复现这张图"+from-image 模式句覆盖；目录风格名由 "a named catalog style" 概括，目录表在 body |
| unknowns-first | "先诊断再做"；"帮我定义成功标准" | PASS | 核心中文短语全保留；spark/cold-shower 反路由保留，implementation-notes 反路由已搬入 body |
| handoff | "主题切换要交接"；"continue tomorrow" | PASS | "switching topics, resuming across days" + 明早接着干 覆盖 |
| academic-figure | "IEEE 图"；"投稿图"；"学术图表" | PASS | IEEE/Elsevier/Nature specs + 论文配图/期刊图/科研绘图 覆盖 |
| archify | "network topology"；"ETL map"；"runbook 流程图" | PASS | 五个类型族（architecture/workflow/sequence/data-flow/lifecycle）语义覆盖同义词 |
| html-artifact | "incident report artifact"；"design comparison 页面" | PASS | browser-viewable report/dashboard 语义覆盖 |
| implementation-notes | "按这个计划做，边做边记"；"spec divergence" | PASS | 按这个 spec 实现/边写边记/决策日志 保留 |
| git-commit | "包括未跟踪文件一起提交" | PASS | "include everything" 覆盖；语言检测细节在 body §0 |
| windows-dev-process-cleanup | "任务管理器一堆 node npm backgroundTaskHost" | PASS | Task Manager full of node/npm noise + backgroundTaskHost 堆积 覆盖 |
| humanizer-paper | "帮我给摘要降AI味" | PASS | 降AI味/润色/学位论文 保留；诚信边界句保留 |
| claude-md-improver | "帮我优化 @import 链"；"claudeMdExcludes 怎么配" | PASS* | 机制术语从触发词降级；此类话术通常伴随 CLAUDE.md 字样，仍可命中。备注：极端裸术语话术可能需要用户点名 skill |
| ripgrep | "rg 在 PowerShell 怎么转义" | PASS | 话术必含 rg/ripgrep，主触发词命中 |
| spark | "帮我把这个想法 brainstorm 成方案" | PASS | brainstorm/design/scope/plan 保留 |
| document-writer | "把 README 重写成中文" | PASS | README + 中文技术文档改写保留 |
| cold-shower | "骂我"；"别夸我"；"假设你是我的对手" | PASS* | 泼冷水/挑刺/给我泼盆冷水/魔鬼代言人 保留；"骂我"单独出现本就歧义，adversarial review 语义可泛化。备注：接受轻微召回损失换 -214 chars |
| code-auditor | "review comments"；"summarize review findings" | PASS | code review/PR review/CR/代码审查 保留 |
| literature-mentor | "这篇值不值得读"；"批判分析这篇论文" | PASS | "解读某篇论文"+三模式名保留；(1)-(5) 场景列表与逐图流程细节在 body 完整存在 |
| paper-workbench | "把这几篇整合一下" | PASS | 精读这篇/整合这几篇/找研究空白/搭综述框架 全保留 |
| code-quality-review | "文件太大要不要拆" | PASS | maintainability/structure/代码质量审查 覆盖；file growth 等维度在 body |
| goudi | "这个方案先落地一下"；"别太飘" | PASS | 落地/先落地/别太飘/收一收/止损 全保留 |
| bidwriter | "写投标方案"；"评分细则核对"；"否决性条款" | PASS | 标书/投标/招标/技术标/商务标/评分标准提取/废标风险/逐条响应 保留，同义长尾由语义泛化 |
| code-refactor | "减少重复代码" | PASS | reduce duplication（EN）+ 重构代码/拆分模块 保留 |
| touying | "用 metropolis 主题做幻灯片"（不提 Typst） | FIXED | 初版删光主题名后此话术可能丢路由；已加回 "(e.g. metropolis)"，完整主题清单补进 body |
| roundtable | "模拟多方思想交锋" | PASS | 圆桌讨论/多人物观点碰撞/结构化辩论探索 保留 |
| agents-md-improver | "检查 nested AGENTS.md" | PASS | nested AGENTS.md conflicts 保留 |
| ast-grep | "找出缺少 error handling 的函数" | PASS | "searches plain text tools like rg can miss" + descendants 保留 |
| codex-workflow-recommender | "配置 Codex plugins" | PASS | configure MCP/plugins/subagents 保留 |
| goal-meta-skill | "帮我写验证命令和成功标准"（goal 语境） | PASS | Goal 指令/目标指令//goal prompts 保留 |
| beautiful-mermaid-editor | "改 editor 的剪贴板行为" | PASS | editor.ts/editor.html/repo 提及为主信号 |
| archive-planning | "用 skill 替代老的归档 prompt" | PASS | $archive-planning 命令与文件名保留；deprecated 句搬入 body |
| codex-dynamic-workflows | "需要多智能体编排" | PASS | 关键触发词全保留，仅删限定长尾 |
| geju | "别只顾向后兼容，想大一点" | PASS | think bigger/design space/局部细节跳出 保留 |
| deep-research-pro | "做个深度研究，带来源" | PASS | 调研/做个深度研究/带来源总结 保留 |
| renhua | "这段太有 AI 味了，改得像我写的" | PASS | 去AI味/改得像本人 保留 |

## 排除场景复核（抽样）

- "帮我 review 这个 PR"（code-auditor 场景）→ 不触发 cold-shower（其排除句保留）✓
- "普通 Mermaid 语法问题" → 不触发 beautiful-mermaid-editor（排除句保留）✓
- "把生成的论文洗过知网检测" → humanizer-paper 拒绝边界保留 ✓
- "写个营销文案" → 不触发 bidwriter / document-writer（排除句均保留）✓
- "单文件小修" → 不触发 implementation-notes / handoff（排除句保留）✓
