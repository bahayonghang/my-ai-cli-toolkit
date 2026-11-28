# codex-review

让本机 Codex CLI 对指定代码做一次独立审查。每次运行都在目标仓库的 `reports/codex-review/` 留下一份 UTF-8 Markdown。另一位 agent 拿到路径即可查看比较版本、输入清单、发现和待复核事项。

[查看真实 CLI 生成、已复核的示例报告](reports/example-review.md)

## 你可以直接这样说

| 请求 | 实际输入 |
| --- | --- |
| 使用 GPT 审查还没提交的改动 | 分别读取暂存 diff、未暂存 diff 和未被忽略的新文件 |
| 让 Codex 审查整个仓库，关注交互反馈 | 当前磁盘上 Git 已跟踪和未忽略的新文件，含未修改的源码 |
| 用 Codex review 这个 commit | 该提交与第一父提交的差异，根提交与空树比较 |
| 用 GPT 审查当前分支相对 origin/main 的改动 | 本地基线与 HEAD 的 merge-base 到 HEAD |
| 用 Codex 审查 PR #42 或给定的 GitHub PR URL | GitHub 返回的固定版本，支持 fork PR |

未指定范围时默认为未提交改动。命令、参数位置和 `--focus` 示例见 [SKILL.md](SKILL.md)。

## 安装与运行

在本工具集根目录运行 `python scripts/install_projects.py --skill codex-review --project .`。从未发布的本地 checkout 也可用 `npx skills add . --skill codex-review`。运行需要 Python 3.9+、Git、本机已登录的 Codex CLI；审查 PR 还需要可读目标 PR 的 `gh` 和 Git 网络访问。用 `codex login status` 确认登录，`codex exec --help` 检查结构化输出参数。验证过的版本见[交付记录](reports/creation-handoff.md)。

脚本把已选证据通过 stdin 交给本机 CLI，由模型服务处理。审查进程在临时目录运行，使用只读沙箱、临时会话、禁用 shell 和扩展，并忽略用户的 Codex 配置文件。只依赖自定义配置文件的模型服务需要单独验证。运行时间主要由批次数和模型响应决定，小改动通常一批，全仓按约 60,000 字符分批串行；每批可按几十秒至数分钟预留，终端会显示进度。

## 如何复核

打开命令输出的绝对路径。在“Codex 发现”中按优先级阅读问题、位置和验证方法。对照 Git 端点或相同工作区快照复核，再把 CR 编号、结论和依据追加到“复核记录”。界面动画、帧率与可访问性按实际运行结果判断。

- `complete` 表示所有可送审批次都收到有效结果；问题数可为零，也可大于零。
- `empty` 表示范围内没有改动。二进制、非 UTF-8、凭据类文件名、重定向、过大或不可读输入会列为跳过，对应 `partial`。
- `failed` 表示这次没有得到有效审查。中途失败会保留已完成批次并标记 `partial`。这两种状态都返回退出码 2。
- 报告内的 SHA-256 标识实际收集的证据。工作区继续变化后应重跑。文件名过滤只覆盖常见凭据名；提交给模型的内容适用该仓库平时的代码访问约定。
- 工作区里的历史报告保留到显式清理为止，审查输入会排除这个目录。本工具集已忽略该输出路径；在其他仓库，是否把报告纳入版本控制由该仓库决定。

小改动通常只需一次模型调用。全仓文本和较大 diff 按约 64 KB 分批串行处理，耗时随批次数增长，每批预留几十秒到数分钟。单批默认超时 900 秒，可在子命令前给 `--timeout 秒数`。单文件或单份补丁超过 1 MiB、物理行编码后超过 48 KB 时记入跳过清单。模型引用超出本批证据的行号会进入“待定位”。审查使用 Codex 的 `--ignore-user-config`，不加载用户配置中的模型覆盖、MCP 或插件，沿用本机登录。

## Troubleshooting

| 现象 | 检查 |
| --- | --- |
| 找不到 CLI 或报告显示运行错误 | 用同一终端检查 `codex --version`、登录状态和 `codex exec --help`，修正后重跑 |
| PR 读取失败 | 核对 URL、`gh auth status` 和 Git 读取权限；基线参数用本地已存在的引用 |
| 报告中的行号已变化 | 按报告记录的 SHA 查看提交；工作区报告对照当时内容，或重新审查 |

项目验收运行 `just ci`；作者工具的 `validate_skill.py` 用于检查技能包。开发范围及依赖见[规格与 tickets](planning/spec.md)。方法参考和取舍见[调研记录](reports/prior-art-research.md)。

创作方法来源：qiaomu-meta-skill，Copyright (c) 向阳乔木。[X](https://x.com/vista8) · [GitHub](https://github.com/joeseesun/)
