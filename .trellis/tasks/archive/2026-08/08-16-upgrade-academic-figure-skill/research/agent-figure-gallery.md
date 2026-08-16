# Research: AgentFigureGallery（Dsadd4/AgentFigureGallery）

- **Query**: 分析 AgentFigureGallery 的结构、工作流、可吸收点与集成可行性
- **Scope**: internal（本地 shallow clone，静态阅读）
- **Date**: 2026-08-16
- **本地路径**: `ref/repo/plot_ref/AgentFigureGallery/`

## 1. 仓库结构概览

| 路径 | 内容 |
|---|---|
| `skills/agent-figure-gallery/SKILL.md` | skill 入口，65 行；frontmatter 仅 `name` + `description` |
| `agentfiguregallery/cli.py` | CLI 主入口，`agentfiguregallery` 命令 |
| `agentfiguregallery/server.py` | 本地 gallery HTTP 服务与偏好读写 |
| `frontend/reference_gallery/{index.html,app.js,styles.css}` | 浏览器候选图界面 |
| `data/reference_candidate_index.json` | 候选索引，488.8 KB，284 条（minimal pack） |
| `data/reference_candidate_facets.json` | 按 plot_type 的可选数量统计，534 B |
| `data/reference_global_preferences.json` | 全局偏好，182.2 KB |
| `assets/packs/minimal/previews/` | 预览图资产，68 MB |
| `docs/AGENT_QUICKSTART.md` | Agent 侧最小指令集 |
| `docs/HUMAN_PREFERENCE_LOOP.md` | 偏好循环定义、稳定 ID 规则、bundle 契约 |
| `docs/TRUST_AND_INSTALL.md` / `docs/COMMUNITY_PACKS.md` | 安装信任说明 / 社区包贡献规则 |
| `ExtendAgent/README.md` | 由 agent 扩展图库的契约与质量门 |
| `scripts/install.sh` / `scripts/setup_full_kb.py` | 一键安装 / 全量包安装 |
| `examples/` | 端到端示例、生成图示例、prompt-only vs 参考驱动对照实验，9.1 MB |
| `THIRD_PARTY_ATTRIBUTION.md` / `LICENSE` | 出处策略 / MIT |

克隆体积（不含 `.git`）84 MB，其中 `assets/` 68 MB、`examples/` 9.1 MB、`docs/` 2.5 MB。

## 2. 核心能力与工作流

CLI 子命令（`agentfiguregallery/cli.py:39-140`）：`doctor`、`install-skill`、
`install-cursor-rule`、`query`、`gallery`、`first-run`、`serve`、`prefer`、
`bundle`、`setup`、`assets download`。

工作流（README「Browser Gallery Workflow」与 `docs/AGENT_QUICKSTART.md`）：

1. `query --task "<任务>"` 把任务解析为候选数量；
2. `gallery --plot-type <type> --limit 50 --serve` 生成一个 reference session，
   打印 session id，并在 `http://127.0.0.1:8765/` 提供浏览器界面；
3. 人工在浏览器标记 like / reject / select；也可用
   `prefer --session <id> --like <ID> --reject <ID> --select <ID>` 命令行记录；
4. `bundle --session <id> [--copy-scripts]` 导出
   `outputs/reference_sessions/<session_id>/export_bundle/reference_bundle.json`；
5. Agent 读取 bundle 后再写绘图代码。

偏好语义（`docs/HUMAN_PREFERENCE_LOOP.md`）：`like` / `reject` 按 plot_type 作用域，
`select` 指定本次动作使用的候选，`global_like` / `global_reject` 为跨任务记忆，
`global_reject` 使候选不再出现在后续生成的 session 中。

稳定 ID 规则：候选使用 `BAR-` / `HEAT-` / `BOX-` / `SCAT-` 前缀的稳定 ID；
session 内的短 ID（`B01`、`H03`）仅用于界面引用，不作为永久标识。

候选记录字段（`data/reference_candidate_index.json` 首条样例）：
`stable_candidate_id`、`display_id`、`reference_candidate_id`、
`global_preference_key`、`plot_type`、`source_repo`、`source_role`、
`script_kind`、`quality_score`、`source_output_path_rel`、`source_output_type`、
`script_path_rel`、`route_path_rel`、`why_suggested`。

Bundle 契约（`docs/HUMAN_PREFERENCE_LOOP.md`）：selected candidate IDs、preview
paths、source repository metadata、source script paths 或复制的脚本、recommended
template、recommended palette、plot-type self-check、upstream-agent prompt。文档明确
要求上游 agent 检查选中的代码与模板，不要只依据截图推断。

覆盖的 10 个 plot_type（`data/reference_candidate_facets.json`）：`bar_chart`、
`benchmark_performance`、`box_violin_distribution`、`embedding_plot`、
`heatmap_matrix`、`line_chart`、`microscopy_panel`、`multi_panel_figure`、
`scatter_plot`、`spatial_map`。minimal pack 284 条；full-public pack 16,341 条，
托管在 Hugging Face 数据集 `dsadd4/AgentFigureGallery`，需 `setup --pack full-public` 下载。

## 3. 与现有 academic-figure skill 的重叠与差异

| 维度 | AgentFigureGallery | academic-figure v1.0.0 |
|---|---|---|
| 参考图来源 | 本机图库检索 + 浏览器筛选 | from-image 由用户上传单图；from-data 用仓库内 9 个命名风格 |
| 人工介入 | 强制环节：浏览器 like/reject/select | 无对应环节 |
| 偏好持久化 | session 级 + 全局偏好 JSON，跨任务复用 | `scripts/academic_figure_pref.py` 只存 `library` 与 `journal_style` 两个默认值，机制不同 |
| 产物 | reference_bundle.json（参考包，不含绘图代码） | matplotlib 脚本 + 300 dpi PNG / 矢量导出 |
| 期刊合规 | 不涉及 | journal-spec 模式的核心 |
| 运行依赖 | 本机安装包 + KB + 本地 HTTP 服务 + 浏览器 | 纯文档 + 脚本 |

重叠点集中在「先看参考图再写代码」的顺序约束；差异在于 AgentFigureGallery 的检索与
人工筛选环节必须本机安装才能运行。

## 4. 建议吸收点

| 优先级 | 吸收内容 | 建议落点 | 说明 |
|---|---|---|---|
| 高 | 「先取参考、后写代码」的顺序约束与「不要只看截图、要查看源脚本与模板」的规则 | `references/modes/from-image.md` 或新增段落 | 属于工作流思想，不依赖本机安装 |
| 高 | 集成指引文档：检测条件 + CLI 六步 + 环境变量 + bundle 路径 | 新增 `references/agent-figure-gallery-integration.md`，结构参照 `references/industrytslib-integration.md` | 只在用户已安装时走该路径 |
| 中 | 偏好语义四元组（like / reject / select / global_*）与 plot_type 作用域规则 | 集成指引文档内的语义表 | 命令参数需与 CLI 一致 |
| 中 | 稳定候选 ID 与 session 短 ID 的区分规则（笔记与提交信息记稳定 ID） | 集成指引文档 | 影响可追溯性 |
| 中 | bundle 契约字段清单，作为"参考包应包含什么"的检查项 | 集成指引文档 | 也可用于用户手工整理参考材料时的清单 |
| 低 | 10 个 plot_type 分类名 | 图型选择相关文档的对照词表 | 与 SciPilot 的图型决策框架可能重复，需去重 |
| 低 | `install-skill --target claude-code` 安装位置说明（`~/.claude/skills`、`.claude/skills`） | 集成指引文档的安装小节 | 与本仓库 skill 安装路径存在冲突风险，需提示 |

不建议吸收：`assets/packs/minimal/previews/`（68 MB 预览图）、`data/*.json`
（索引与全局偏好）、`frontend/`、`ExtendAgent/`、社区包机制。这些必须本机安装才可用，
且与 PRD「不 vendor 大体积资产」冲突。

## 5. 许可证与出处标注要求

- 许可证：MIT，`LICENSE`，`pyproject.toml` 声明 `license = "MIT"`、
  `license-files = ["LICENSE"]`，作者署名为 "AgentFigureGallery contributors"。
- 仓库自身的出处策略见 `THIRD_PARTY_ATTRIBUTION.md`：候选保留 `source_repo`、
  `script_path_rel` 等来源字段；预览图用于人工筛选；源脚本仅在上游许可证允许时再分发；
  公共包不能替代阅读原始仓库许可证。
- 因此若在 skill 文档中引用其工作流与命令，需注明来源仓库 `Dsadd4/AgentFigureGallery`
  与 MIT 许可证；若未来引用其候选图或脚本，需另行核对上游仓库许可证。

## 6. 依赖、安装方式与体积注意事项

- PyPI 包名 `agentfiguregallery`，版本 `0.1.0`，`requires-python = ">=3.10"`，
  `dependencies = []`（无第三方运行时依赖）。
- 安装方式：`curl -fsSL .../scripts/install.sh | bash`（克隆到 `$HOME/AgentFigureGallery`、
  建 venv、装包、装 skill wrapper）；或 `git clone` + `pip install -e .`；
  或 `npx add-skill Dsadd4/AgentFigureGallery`。
- 环境变量：`AGENT_FIGURE_GALLERY_ROOT` 或 `DRAWING_KB_ROOT` 指向 KB 根目录；
  安装期变量 `AFG_INSTALL_FULL_PUBLIC=1`、`AFG_AGENT_TARGETS="codex claude-code cursor"`、
  `AFG_CURSOR_PROJECT=<path>`。
- 体积：本地 clone 84 MB（不含 `.git`）；full-public 包另需从 Hugging Face 下载
  16,341 条候选的预览资产，README 记录了 Hugging Face 被屏蔽时的 GitHub API manifest 回退。
- 运行形态：需要本地 HTTP 服务（默认 `127.0.0.1:8765`）与浏览器人工操作，
  在无人值守的 agent 会话中无法完成 like/reject/select 环节。

## Caveats / Not Found

- 未执行任何 CLI 命令，`query` / `gallery` 的实际输出格式未验证，
  以 `README.md`、`docs/AGENT_QUICKSTART.md`、`SKILL.md` 的文档描述为准。
- `bundle` 的 JSON 实际字段未逐一核对（只读了 `docs/HUMAN_PREFERENCE_LOOP.md` 的契约描述与
  `examples/generated_embedding_plot/reference_bundle_example.json` 的存在性）。
- Windows 下 `scripts/install.sh` 的可用性未验证；该脚本为 bash 脚本，
  依赖 `$HOME` 与 venv 布局。
