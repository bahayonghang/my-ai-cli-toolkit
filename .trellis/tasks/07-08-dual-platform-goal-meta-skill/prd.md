# Adapt goal-meta-skill for both Claude Code and Codex /goal

## Goal

把 `skills/developer-tools-integrations/goal-meta-skill` 从「Codex 专用的 /goal 生成器」升级为「同时适配 Claude Code 与 Codex 的双平台 goal meta skill」：根据用户所在平台生成语义正确、可直接复制的 `/goal` 指令，并正确处理两个平台在评估机制、管理命令、启用条件上的差异。

## Background（审计 + 调研结论）

### 现状审计

当前 skill 结构完整（SKILL.md、3 个 references、linter、Node 测试、7 条 evals、agents/interface.yaml），Codex 侧事实全部准确（已对照官方文档验证）。核心问题：

1. **全链路 Codex 单平台绑定**：frontmatter description、tags、workflow、README、interface.yaml default_prompt 均只提 Codex；Claude Code 用户的请求（"帮我写 Claude Code goal"）无法可靠触发或得到正确输出。
2. **interface.yaml 的 claude degradation 已过时**：写的是 "drafts structured agent goal prompts with the same labels"，但 Claude Code v2.1.139（2026-05-12）起已有原生 `/goal`。
3. **管理命令跨平台会出错**：skill 会向用户推荐 `/goal pause` / `/goal resume`，但 Claude Code 没有 pause/resume（只有 set / view / clear，clear 别名 stop/off/reset/none/cancel）。
4. **验证条款未区分评估机制**：Claude Code 的 /goal 由独立小模型（默认 Haiku）只读 transcript 评估、不能运行命令或读文件；当前模板允许的"截图/产物为证据"在 Claude Code 侧必须改写为"证据落在对话输出中"的形式。
5. **启用/排障指引单平台**：只有 Codex `features.goals`；缺 Claude Code 的版本要求（≥2.1.139）、trust dialog、disableAllHooks/allowManagedHooksOnly 限制。
6. **evals 与测试无 Claude Code 用例**；linter 无平台感知，也不检查 4,000 字符上限。

### 平台事实基线（来自官方文档，写入 skill 时以此为准）

| 维度 | Codex CLI/app | Claude Code |
|---|---|---|
| 语义 | 附着于当前 thread 的持久 objective | 会话级 completion condition，独立评估器逐 turn 判定并自动续 turn |
| 命令 | `/goal <text>` / `/goal` / `/goal pause` / `/goal resume` / `/goal clear` | `/goal <condition>` / `/goal`（状态）/ `/goal clear`（别名 stop/off/reset/none/cancel）；无 pause/resume |
| 启用 | experimental，需 `features.goals`（config.toml 或 `codex features enable goals`） | v2.1.139+，需接受 workspace trust dialog；disableAllHooks / allowManagedHooksOnly 下不可用 |
| 长度上限 | objective ≤ 4,000 字符 | condition ≤ 4,000 字符 |
| 评估 | 官方描述为 attach & track | 小模型只读 transcript 判 yes/no，不调用工具 |
| 限制轮次 | 无内置轮次条款 | 官方建议在 condition 内写 `or stop after 20 turns` 类条款 |
| 设置即开工 | 设置后跟踪目标 | 设置 goal 立即以 condition 为指令开始一个 turn |
| 恢复 | v0.128.0+ 跨会话持久 | `--resume`/`--continue` 恢复，计时/轮次/token 基线重置 |
| 相邻机制 | `/plan` 先塑形再 `/goal` | `/loop`（定时）、Stop hook（自定义评估）是替代路径 |
| 非交互 | — | `claude -p "/goal ..."` 单次跑到完成 |

来源：developers.openai.com/codex/cli/slash-commands、/codex/use-cases/follow-goals、/codex/app/commands、code.claude.com/docs/en/goal。

## Requirements

1. **双平台触发**：frontmatter `description` 与 tags 覆盖 Claude Code 与 Codex 两类请求措辞（中英文），保持既有 Codex 触发不回退。
2. **平台判定规则**：SKILL.md 定义平台选择逻辑——用户明说平台则遵从；未说则默认当前宿主平台；仍不明确时并入现有"可选调整"编号选择题（不新增独立问卷轮次）。
3. **共享合同 + 平台渲染**：七要素合同（目标/验证/约束/边界/迭代/完成/暂停）保持为共享核心；按平台渲染差异——
   - Codex 版：objective 风格，保留 pause/resume 管理与 `features.goals` 排障；
   - Claude Code 版：condition 风格，验证证据必须是"会落在 transcript 中"的形式（命令退出码、测试输出、文件清单等），必须包含轮次/时间上限条款，"暂停条件"改写为"停止并报告等待人工决定"（因无 pause）。
4. **管理命令平台正确**：对"查看/暂停/恢复/清除现有 goal"类请求，按平台给出正确最小命令；Claude Code 侧对 pause 请求要解释无此命令并给出替代（clear + 之后重设，或直接打断）。
5. **启用与排障双平台**：README/SKILL.md troubleshooting 覆盖两平台的启用条件与常见失败。
6. **linter 平台感知**：`lint_goal_command.py` 新增 `--platform codex|claude|both`（默认 both 保持向后兼容）：claude 模式拒绝 `/goal pause`/`resume` 建议、要求轮次/时间上限条款；两种模式都检查 `/goal` 首行 ≤ 4,000 字符。
7. **evals/tests 扩展**：新增 Claude Code 正向用例、Claude Code pause 请求纠偏用例、平台歧义处理用例；Node 测试覆盖 linter 新参数。
8. **interface.yaml 同步**：claude 不再是 degradation 而是一等 adapter target，default_prompt 改为平台感知措辞。
9. **保持既有质量约定**：中文优先输出结构（推荐执行版→默认理由→可选调整→回复提示→英文镜像）不变；`<skill-dir>` 占位符约定不变；不虚构平台行为——所有平台事实以上表为准。

## Out of Scope

- 不改动仓库内其他 skill；不新增顶层目录。
- 不支持 Codex/Claude Code 之外的平台（Gemini CLI 等），interface.yaml generic degradation 保留即可。
- 不实现 goal 的执行编排（skill 只产出指令）。

## Acceptance Criteria

- [ ] `just skills-check`、`just python-check`、`just node-test` 全绿；`just ci` 通过。
- [ ] SKILL.md description 同时含 Claude Code 与 Codex 触发词；`scripts/check.py` 元数据校验通过。
- [ ] 对同一个模糊需求，skill 文档中的示例能给出 Codex 版与 Claude Code 版两种正确渲染，且 Claude Code 版含轮次上限条款、无 pause/resume 措辞、验证证据均为 transcript 可见形式。
- [ ] `lint_goal_command.py --platform claude` 能拒绝含 `/goal pause` 建议或缺轮次上限的 Claude Code 输出；`--platform` 缺省时旧有调用行为不变（现有测试不改动即通过）。
- [ ] linter 对 `/goal` 首行超 4,000 字符的输入报错（两平台）。
- [ ] evals.json 至少新增 3 条用例：Claude Code 正向、Claude Code pause 纠偏、平台歧义。
- [ ] README 双平台安装/启用/排障表更新；来源致谢与 License 保留。
- [ ] interface.yaml：claude 为一等 target，无"过时 degradation"描述。

## Notes

- 平台事实必须锚定本 PRD 的基线表；如实现时发现文档更新，先更新基线表再写正文。
- 现有 7 条 evals 语义保持不变（id 7 的 agents-md-improver 路由用例原样保留）。
