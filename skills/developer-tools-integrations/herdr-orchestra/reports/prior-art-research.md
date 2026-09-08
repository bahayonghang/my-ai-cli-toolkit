# Prior-art research

研究日期：2026-09-08。采用 qiaomu-meta-skill 2.8.1 的先例发现、机制取舍和证据分层方法；本包独立撰写，不复制参考包的大段源码。来源为父任务保存的实际调研及本轮源码复核。

## 检索与可信度

检索意图：`herdr orchestration`、`codex independent review`、`multi agent cross review`。统一 runner 在 Windows 因找不到 `npx` 失败；改用直接 `npx --yes skills find` 三次查询（退出 0）及 runner 的 `--skip-skills-sh` SkillsMP 查询（退出 0，29 个 candidate families）。后者 machine report 的 `complete: false` 是单次执行边界，未被补写成完整。

skills.sh 当日展示官方 `herdrdev/herdr@herdr` 41.8K installs、`pedronauck/skills@herdr-orchestration` 94、`jezweb/claude-skills@codex-review` 472、`riekelt/multi-agent-review@multi-agent-review` 5.2K。后三者仅发现，未作为已研读候选；jezweb 尝试的源码路径 404。

SkillsMP 官方源新旧命名条目 stars 分别为 35,573 与 22,326；旧 `ogulcancelik/herdr` URL 当日跳转 `herdrdev/herdr`，按 canonical repository + skill path 合并候选身份，不合并计数。GitHub 当日页面另显示 rounded 36.0k。Installs 是采用量，stars 是仓库指标，都不是评分或质量证明；满意度/评分证据缺失。

## 实际研读候选

| 候选与信号 | 学到的机制 | 落点与拒绝项 |
| --- | --- | --- |
| [inbeomheo/herdr-orchestra](https://github.com/inbeomheo/herdr-orchestra)，研读 SKILL/README/LICENSE，commit `876af28f2f14d052cbf96fb666cbf5a439c046f2`，2026-07-03；MIT，Inbeom Heo | 一个调用者承担分工、顺序依赖与最终核验 | `references/patterns-and-recovery.md`；拒绝 focus-as-caller、raw prompt、自动 trust、旧补丁全局化、三模型投票和强制 commit |
| [Official Herdr skill](https://github.com/herdrdev/herdr/blob/v0.8.2/skills/herdr/SKILL.md)，用户提供的 195 行版本与官方文档；上游仓库标识 Apache-2.0 | caller 环境、返回 ID、pane/agent 区分、原生 lifecycle 和资源 ownership | `references/delegation.md`；不复制完整 CLI 目录；对最新深度 history 的隐式滚屏保留权限边界 |
| 本仓库 `skills/development-workflows/codex-bridge/SKILL.md`，一方源码；研读触发和交叉核验段落 | 显式 Codex 意图、父 Agent 核验、不无限递归 | handoff 的角色分工；不引入持久 bundle、固定模型或实现轮次 |
| [BenedictKing/codex-review](https://github.com/BenedictKing/codex-review) 的已安装本地 stub，仅入口被研读，完整上游/许可证未检查 | 同名发现不能证明实际传输能力；本地入口宣传自动 CHANGELOG | 留作相邻路由与安装碰撞证据，不归因未检查行为，不覆盖本地安装 |

## 当前官方事实与版本差异

访问日期 2026-09-08，不代表文档发布日期：[Agent automation](https://herdr.dev/docs/agent-automation/)、[CLI reference](https://herdr.dev/docs/cli-reference/)、[Agents](https://herdr.dev/docs/agents/)、[Agent skill](https://herdr.dev/docs/agent-skill/)、[Windows support](https://herdr.dev/docs/windows-beta/)。调研的本机 help 版本为 `herdr 0.8.2-preview.2026-08-19-b5c4a0176e91`；仅证明 client help，不证明 server 或集成状态。

旧参考基于 0.7.1 preview 的 recent/wait 缺陷；相关 issues [962](https://github.com/herdrdev/herdr/issues/962) 与 [963](https://github.com/herdrdev/herdr/issues/963) 当日已关闭。关闭状态不是已安装版本修复证明，因此不保留固定 sleep/visible-only 轮询控制器。最新文档描述某些 idle alternate-screen history 读取会自动滚屏，与用户提供 skill 的旧版“无法恢复”说明不同。本包按当前能力和权限选择 passive 来源，既不宣称所有 recent 都失败，也不宣称所有 read 都被动。

Codex 参数由上层消费契约提供；已研读的当日官方 [Developer commands](https://learn.chatgpt.com/docs/developer-commands?surface=cli) 及本机 `codex-cli 0.153.4` help 支持交互启动与 `--no-alt-screen`。实际检测和输出完整性仍需 live 证据。

## 取舍与原创连接

- **keep**：有边界的 assignment、唯一身份、返回值驱动、父 Agent 验收。
- **adapt**：host-neutral 入口、POSIX/PowerShell 参数分离、生命周期与输出分开、只读分段重述。
- **reject**：自动信任、busy-turn 重用、旧输出当成功、通用 supervisor、旧 CLI 兼容、默认模型表、默认安装或清理。
- **invent**：一处文本 handoff 连接通用 Herdr transport 与专门的 Codex review；这是本任务的设计贡献，不是新颖性研究主张。

未执行候选代码、安装器、hook 或模型调用。没有复制需附原样许可证的大段来源；上游归属保持以上 attribution。qiaomu 方法署名：Copyright (c) 向阳乔木；[X](https://x.com/vista8)、[GitHub](https://github.com/joeseesun/)。此方法署名不取代任何上游作者的所有权。

## Evidence limits

Production 风格的入口、interface、契约、eval 和 reports；按本仓库约定不为 meta schema 添加 README/manifest，公共说明由仓库 catalog 生成。真实 server、环境检测、focus/cwd 保持、模型执行、长输出恢复、有效 sandbox、fresh-session discovery 与跨 host 行为均为 **missing evidence**。fixture/手工语义复核不升级为 runtime 成功。
