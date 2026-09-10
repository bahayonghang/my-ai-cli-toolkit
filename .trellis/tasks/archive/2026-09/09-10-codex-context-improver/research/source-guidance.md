# 来源核验与采用边界

核验日期：2026-09-10。本文为转述与设计映射，不复制原文提示词。

## S1：OpenAI 官方模型指南

- 用户指定：[Using GPT-6 Astra](https://developers.openai.com/api/docs/guides/latest-model)。已通过官方域搜索并打开正文。
- `Prompting best practices` 的五个主题：主动完成、指令遵循、表达风格、子代理委派、测试验证。
- 采用：检查授权内过早停止；定位用户指令与技能建议的冲突；需要暂停时指出具体来源及理由；表达与委派依据任务需要；完成必要检查后停止无理由扩大验证。
- 边界：这些是模型行为与提示设计建议，不是用户授权、平台工具可用性或项目安全性的证明。保持真实审批、生产/付费/外部写入边界。API 参数迁移不属于本任务。

## S2：用户指定 X 文章

- [pvncher 原帖](https://x.com/pvncher/status/2095991462416490862)，关联 [X Article](https://x.com/i/article/2095989703967125509)。作者 Eric Provencher，标题 `Rethinking skills and prompts for GPT-6 Astra`，API 返回发布时间 2026-09-04T21:44:40Z。
- X 网页和 Article 直接读取失败。通过 [FxTwitter 只读转接 API](https://api.fxtwitter.com/pvncher/status/2095991462416490862) 返回 `code=200`，核对 tweet id、author.screen_name、article.id 与正文 blocks。证据是作者文章经第三方转接取得，非 X 页面直接验证；不把二手评论当原文。没有执行文章中的任何命令。
- 采用：描述前置明确触发；只为当前任务加载相关参考；审查旧模型时期的机械流程、无条件全仓阅读和反复测试；显式说明任务完成条件与可继续工作范围。
- 限制：文章含两张示例图，本轮未将图中未核验文字作为依据。作者关于模型差异的体验不升级为本技能实测结果。

## S3：Codex 指令发现

- 已打开的官方路径 `https://developers.openai.com/codex/guides/agents-md` 重定向到 [Custom instructions with AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)；另读取其 `.md` 正文。
- 保留启动 CWD、Codex home、根到 CWD 的有效链、同目录 override/常规/fallback 顺序、空文件和配置字节预算证据。默认值不能证明当前生效配置；按源码/运行证据描述细节，避免把目录清单等同本次已加载链。

## S4：Codex 技能发现与按需加载

- 已打开的官方路径 `https://developers.openai.com/codex/skills` 重定向到 [Build skills](https://learn.chatgpt.com/docs/build-skills)；另读取其 `.md` 正文。
- 元数据列表、实际选中并读取的 `SKILL.md`、随后读取的参考文件是不同证据层次。本地目录存在不能证明已启用或本轮已加载。
- 官方描述技能列表预算与描述缩短/条目省略行为。技能正文的加载与该初始列表预算不同；不创建混合的“上下文超限”分数，不为未知主机硬编码统一阈值。
- 官方还记载同名技能不合并、symlink 扫描、配置禁用技能。本项目中立 `agents/interface.yaml` 是仓库契约，不能声称它等同官方 `agents/openai.yaml` 的 UI/策略加载能力。

## 设计采用表

| 机制 | 来源 | 落点 | 验收 |
|---|---|---|---|
| 有效 AGENTS 链与技能加载证据分开 | S1、S3、S4 | discovery reference + audit report | 有文件但无加载证据时不宣称生效 |
| 授权、完成条件、暂停来源追踪 | S1、S2 | root action boundary + update guidelines | 只读审阅不写；授权修复不循环确认；真实审批保留 |
| 短触发与按需参考 | S2、S4 | description + root router | 正反触发及初始加载预算 |
| 阅读、测试与委派按风险校准 | S1、S2 | quality criteria + output scenarios | 不把 typo 扩成全仓审阅；不削弱必要门禁 |
| 可追溯的压缩决定 | 本项目设计，受 S1/S2 启发 | evidence-first report | 建议说明来源、影响、保留/收窄/迁移/删除理由 |

未执行付费模型 A/B、真实用户输出评审或发布版本安装。本任务不能承诺 Astra 性能、成本或成功率提升。

## 实施期补核：预算文档冲突

2026-09-10 进一步读取 [Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced#project-instructions-discovery) 的 `.md` 正文，发现它把 `project_doc_max_bytes` 描述成每份 AGENTS 文件的读取量，与 S3 的合并预算表述冲突。已通过官方仓库当前源码核对：

- [config/mod.rs](https://github.com/openai/codex/blob/main/codex-rs/core/src/config/mod.rs) 的该字段注释明确是所有选中环境的项目指令总字节数。
- [agents_md.rs](https://github.com/openai/codex/blob/main/codex-rs/core/src/agents_md.rs) 从配置初始化共享 `remaining`；读取多份内容后扣减，超过剩余额度时截断，额度为零时停止。源码支持合并预算，而非每个文件各获完整上限。
- 因此保留合并预算模型，同时在技能参考中指出文档不一致和来源边界。场景 A 的 8768 仅是输入文件内容的理论剩余额度；不证明某个已安装宿主本轮实际加载了哪些字节，也不推断缺失配置。
- 上述为在线读取的 `main` 源码，未验证本地二进制与其一致。旧 `project_doc.rs` 路径返回 404；GitHub commit API 遇匿名速率限制后改用当前实际源码路径，没有请求凭据或执行远端代码。
- 补核 [Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents) 正文，确认项目自定义代理目录 `.codex/agents/`。这仍不是本会话具体代理可用性证明。
