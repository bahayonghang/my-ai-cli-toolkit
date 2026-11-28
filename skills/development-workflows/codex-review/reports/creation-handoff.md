# codex-review 0.1.0 交付记录

第一方源码位于 `skills/development-workflows/codex-review`。已移除项目安装的第三方同名技能，通过项目安装器链接新版本。另在一个空目录完成安装并从链接运行 CLI 帮助。

| 类型 | 结论与证据 |
| --- | --- |
| design advantage | 工作区的 staged、unstaged、untracked 分开记录。同一文件的发现可标明证据层和批次；全仓可以覆盖未修改文件。 |
| validated advantage | 在 Windows 上用本机 Codex CLI 0.172.0 审查工作区、全仓、单提交和基线，四种范围都定位到合成回归 `mathutil.py:3`；实际执行 `double(3)` 得到 5，预期为 6。[可复核的报告](example-review.md)。 |
| validated advantage | 在不含目标对象的小仓库，从本地入口审查 [普通 PR](https://github.com/cli/cli/pull/15172) 和 [fork PR](https://github.com/cli/cli/pull/14854)，得到固定 SHA 与可打开的报告。 |
| validated advantage | [触发烟测](trigger-eval.json) 11/11。这是关键词边界检查；宿主模型的自然路由命中率仍待实测。 |
| hypothesis | 按范围和指纹保存报告能减少不同 agent 的重复查证。尚无多人耗时对照。 |

首次用此技能审查本次改动后，补了文件与目录互换、子模块配置、采集中途暂存、批次编码大小与物理行号、无效定位及超时的回归测试。修正后的代码也保留了每个批次的旧、新 diff 行坐标。

[BenedictKing](https://github.com/BenedictKing/codex-review/blob/main/.claude/skills/codex-review/SKILL.md) 的审查意图在本包落实为 `--focus`，舍弃了自动改 CHANGELOG 和自动修复。[RandyNorthrup](https://github.com/RandyNorthrup/codex-review-skill/blob/main/SKILL.md) 的只读执行和独立复核落实为隔离运行、带位置的发现及复核记录。两个候选的许可证、目录信号、采用与拒绝理由见[调研记录](prior-art-research.md)。

可重跑 `python -m unittest discover -s skills/development-workflows/codex-review/tests -v` 检查真实 Git 与替身 CLI 的输入、失败、分批及状态保留。源码和文档的仓库门禁为 `just ci`。CI 的 eval 检查只验证结构。缺少 Linux/macOS 原生运行、私有及 Enterprise PR、跨宿主自然触发和盲评证据。
