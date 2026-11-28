# Codex 审查技能调研 · 2026-11-28

检索词为 `codex code review`、`codex review uncommitted pull request` 和 `codex review`。查询了 skills.sh、SkillsMP、GitHub 源码和 OpenAI 文档。Qiaomu 的统一入口在 Windows 启动无扩展名的 npx 时遇到 WinError 2，改用终端的 npx 与 SkillsMP 脚本分别查询。SkillsMP 返回 10 个候选，包含泛化的 Git 工作流。入选项按 GitHub 仓库与技能路径去重，安装目录的精简版和上游完整版算同一个候选。

| 已读来源 | 当日信号 | 采用与取舍 |
| --- | --- | --- |
| [BenedictKing/codex-review](https://github.com/BenedictKing/codex-review/blob/main/.claude/skills/codex-review/SKILL.md) | skills.sh 516 次安装，GitHub 12 星，最近推送 2026-04-21，MIT | 将变更意图纳入审查，落成显式的 `--focus`。上游会改 CHANGELOG、修复发现并在干净目录转审 HEAD。本包保留用户选定的范围，写入仅限审查报告。 |
| [RandyNorthrup/codex-review-skill](https://github.com/RandyNorthrup/codex-review-skill/blob/main/SKILL.md) | GitHub 1 星，最近推送 2026-09-24，MIT；含平台验证记录 | 采用临时、只读 CLI 和逐条复核。将临时最终答复转成仓库内可交接的报告。无需固定模型或修改用户环境；审查输入由脚本收集。 |
| [OpenAI 非交互执行](https://developers.openai.com/codex/noninteractive/) | 官方 CLI 文档，另核对本机 0.172.0 帮助 | 使用 stdin、临时会话、结构化最终输出，区分 CLI 退出与实际审查内容。原生 review 的 diff 目标与本包的全仓、带重点及统一证据清单需求不同。 |

原创组合包括对暂存与未暂存两层分别取证、按实际输入记录 SHA-256、跨批部分失败保留有效发现，以及在缺少 PR 对象时取得固定端点且不切换工作区。没有执行第三方候选代码。星标属于仓库，安装数属于目录条目；候选的用户评分、对照质量测量均缺少证据。
