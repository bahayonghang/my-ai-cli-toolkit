# Prior-art research and contribution ledger

日期：2026-09-08。沿用父任务已完成的 qiaomu-meta-skill 2.8.1 调研与实际网页/本地源读取，不重新安装或执行候选。查询为 `herdr orchestration`、`codex independent review`、`multi agent cross review`。

## 来源与检索边界

统一 runner 在 Windows 解析 npx 时失败：`FileNotFoundError [WinError 2]`。随后三次直接 `npx --yes skills find` 均退出 0；SkillsMP 单独 runner 退出 0，返回 29 个候选族。该单独 JSON 仍记录 `complete: false` 与 `skills_sh: not_run`，没有改写成统一成功。不因本次包创作而修复用户全局脚本。

skills.sh 当日显示 official `herdrdev/herdr@herdr` 41.8K installs、`pedronauck/skills@herdr-orchestration` 94、`jezweb/claude-skills@codex-review` 472、`riekelt/multi-agent-review@multi-agent-review` 5.2K。后三项是发现记录；jezweb 的尝试源路径返回 404，未将其作为实现依据。SkillsMP 的 Herdr 新旧 namespace 分别报 35,573 和 22,326 repository stars；旧 `ogulcancelik/herdr` URL 重定向到 `herdrdev/herdr`，按 canonical repo + skill path 去重，不相加。GitHub 同次读取显示约 36.0k，是另一时间/精度观察。installs、repository stars 都不是评分，满意度或质量比较为 missing evidence。

## 实际研读候选与落点

| 候选 | 研读范围、维护/许可证据 | 学习与取舍 |
| --- | --- | --- |
| [inbeomheo/herdr-orchestra](https://github.com/inbeomheo/herdr-orchestra) | 本地完整 SKILL/README/LICENSE，commit `876af28f2f14d052cbf96fb666cbf5a439c046f2`，2026-07-03；MIT，Inbeom Heo | keep：单一 conductor 与明确 assignment；adapt：将 review 语义分给本包、进程给 orchestra；reject：focus-as-caller、自动 trust、旧轮询、模型 folklore、强制 commit 和 405 行复制。 |
| [Official Herdr skill](https://github.com/herdrdev/herdr/blob/v0.8.2/skills/herdr/SKILL.md) | 用户提供的本地文件与官方 source/docs；当前 repo 标为 Apache-2.0 | keep：native identity/readiness/receipt；由 orchestra 统一拥有。adapt：只读 reviewer 用同 worker 编号重述；reject：以临时文件 fallback 为由扩大 reviewer 权限。新 deep-read 文档的隐式滚屏边界由 orchestra 执行。 |
| 仓库 `codex-bridge` | 父调研读取 `skills/development-workflows/codex-bridge/SKILL.md` 的意图、权限与父核验部分；一方仓库源 | keep：显式 Codex 意图、父核验、避免递归；reject：为单次 Herdr 审查复制 bundle 目录、固定模型或实现轮次。保留它的非 Herdr 路由。 |
| 已安装第三方 `codex-review` | 父调研只读取 `.agents/skills/codex-review/SKILL.md` stub，指向 [BenedictKing/codex-review](https://github.com/BenedictKing/codex-review)；上游完整实现、许可与维护状态未核验 | keep：同名 discovery 风险；reject：stub 宣传的自动 CHANGELOG 与本次只读目标冲突。不归因未读上游行为，不改安装。 |

**invent**：轻量六字段文本 handoff，将 scope/content identity、严格只读 leaf 和父 findings 验收交给一个 Codex consumer。分开记录 lifecycle、响应完整性和审查证据；这是为本工作流作出的设计连接，不是研究新颖性声明。

本包为独立撰写的语义适配，没有复制候选大段代码/文本；若日后引入实质性源码应保留对应许可与 notice。qiaomu 是作者工作方法，不取代候选原作者归属。未执行不可信候选、installer、hook 或 model。

## 证据层级

**design advantage**：唯一 transport owner、明确 scope 与可核验 findings 边界。**validated advantage** 只限本包已记录的静态/手工一致性检查，不作竞品优越声明。**hypothesis**：no-alt-screen 与编号重述能提高完整收集率；真实 detection、恢复效果、review 质量/成本、有效 sandbox、跨宿主加载、同名入口解析均为 **missing evidence**。实际检查见 [creation handoff](creation-handoff.md)。
