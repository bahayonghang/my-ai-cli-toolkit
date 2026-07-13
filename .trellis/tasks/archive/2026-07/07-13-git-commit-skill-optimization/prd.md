# 优化 git-commit skill：composer 可配置化、Assisted-by 生态对齐与测试补齐

## Goal

修复 `skills/git-github-collaboration/git-commit/`（v1.10.0）在 yao-meta 审查 + 网络调研中发现的问题：composer 脚本的硬编码限制与 SKILL.md 自身「仓库配置优先」规则相矛盾、PowerShell 路径存在编码陷阱、AI 署名 trailer 与社区新惯例脱节、核心脚本零测试覆盖。

## Background（审查发现，按严重度排序）

### F1 — 高 · header 72 列硬上限与「仓库配置优先」自相矛盾

- SKILL.md Preflight §5 规定：commitlint 等仓库配置的长度规则「authoritative over this skill's defaults」；evals.json #21 还断言 60 字符上限要被遵守。
- 但 `scripts/compose_commit_message.py:153-159` 在 >72 显示列时硬性 exit 1，**无任何放宽/收紧开关**。
- 调研确认：JS 生态默认配置 `@commitlint/config-conventional` 的 `header-max-length` 是 **100**（非 72）。目标仓库允许 100 时，脚本会阻断合法 header，而 SKILL.md §4.8 又禁止手写多行消息——两条规则互锁，agent 无路可走。
- 反向同理：60 上限时脚本欠约束，只能靠模型自觉。

### F2 — 高 · `--type` 白名单阻断仓库自定义 type

- `compose_commit_message.py:31` 用 `choices=sorted(TYPE_EMOJIS)` 把 type 锁死为 11 个内置值。
- Preflight §5 同样承诺仓库 commitlint `type-enum`（常见自定义如 `hotfix`/`deps`/`release`）优先，但脚本直接 argparse 报错，与 F1 同类矛盾。

### F3 — 中 · PowerShell 重定向编码陷阱（跨平台正确性）

- SKILL.md §4 的可选参数列表**未提及 `--output`**；§5.3 只说「Write the message to a file and commit with `git commit -F`」。自然路径是 shell 重定向 `>`。
- Windows PowerShell 5.1 的 `>` 默认写 UTF-16LE（PS7 为 UTF-8），中文/emoji 提交消息经重定向后 `git commit -F` 会读入乱码。脚本 `--output` 已显式 UTF-8 写文件（`compose_commit_message.py:204-206`），但文档没有把它与 §5.3 关联，也没有警告 PS 重定向风险。

### F4 — 中 · AI 署名 trailer 与社区 `Assisted-by:` 惯例脱节

- 调研确认社区已收敛：Linux Kernel（`Assisted-by: AGENT:MODEL [TOOL]`，且明确 AI 永不加 `Signed-off-by`，DCO 只能由人类签署）、Fedora、OpenTelemetry（`Assisted-by: Claude Opus 4.5`）、Apache（`Generated-by:` 供机器可解析 provenance）均有公开政策。
- 本 skill 的 `Agent-Task`/`Agent-Model`/`Agent-Prompt-Ref`/`Generated-By: agent` 是更丰富的私有方案，但对已有 AI 署名政策的外部仓库，skill 的「适配仓库习惯」原则（语言/emoji/type 都会适配）在 trailer 维度没有适配钩子，也没有文档说明与社区标准的映射/分歧理由。
- 附带缺口：skill 全文未提 DCO/`Signed-off-by` 边界（agent 不得擅自代签）。

### F5 — 中 · composer 脚本零自动化测试

- `just ci` 只跑 `skills/**/tests/*.mjs` Node 测试 + Python 编译检查；本 skill 无 `tests/` 目录。
- `display_width`（CJK/emoji/VS16/组合符）、`normalize_summary`、issue-ref 归一化、trailer 顺序、`--require-why`/`--ai` 门控、退出码 1/2/3 等边界逻辑全部裸奔。姊妹 skill 已有 .mjs 外壳调脚本的成熟模式（如 `windows-dev-process-cleanup/tests/audit-scripts.test.mjs`）。

### F6 — 低 · description 缺负向触发词

- Anthropic 官方 best practices 建议 description 包含 negative triggers。当前 description 未声明「不做 push / PR / amend / rebase / tag」，相邻请求（如"amend 上一条提交"）可能误路由。

### F7 — 信息级（本次仅顺手处理，不单列验收）

- 示例模型 ID 会过时（`claude-sonnet-4-6` 等）；commit-types.md「描述做了什么，而不是为什么做」与 Why-line 规则乍读矛盾（宜加一句 subject=what / body=why 澄清）。

## Requirements

1. **R1（对应 F1）**：`compose_commit_message.py` 新增 `--max-header-width <int>`（默认 72，保持现行为），SKILL.md §4 说明「Preflight 发现仓库长度规则时传入该值」；超限报错文案同步提示该 flag。
2. **R2（对应 F2）**：允许非内置 type。方案：`--type` 移除 `choices` 硬约束，未知 type 时无内置 emoji——要求显式 `--emoji <char>` 或自动按 no-emoji 处理，并在 stderr 提示；内置 11 类型行为完全不变。SKILL.md/commit-types.md 补充说明。
3. **R3（对应 F3）**：SKILL.md §4 参数表补 `--output`；§5.3 改为明确指示「用 `--output` 写消息文件，禁止在 PowerShell 下用 `>` 重定向（UTF-16 编码风险）」。
4. **R4（对应 F4）**：
   - agent-workflow.md 增加「与社区惯例的关系」小节：`Assisted-by:` 生态现状、本 skill 私有 trailer 与之的映射及保留理由。
   - Preflight §5 采样点增加：仓库 history/CONTRIBUTING 若已有 AI 署名惯例（`Assisted-by:`/`Generated-by:`），按仓库惯例输出（复用现有 `--footer-line` 即可表达，无需新 flag；若实现更顺手可加 `--assisted-by`，二选一，在 design.md 定夺）。
   - 新增禁止项：agent 不得自行添加 `Signed-off-by`（DCO 属人类签署）。
5. **R5（对应 F5）**：新增 `tests/compose-commit-message.test.mjs`，经 wrapper 调 Python 脚本覆盖 ≥10 个用例（含 R1/R2 新行为、宽度计算 CJK+emoji、`--require-why` 退出码、trailer 顺序、`--output` UTF-8 内容断言），被现有 `just node-test` 自动发现。
6. **R6（对应 F6）**：description 追加一句负向触发（不处理 push/PR/amend/rebase/tag），保持总长可控；SKILL.md 边界处（§0 或 §5）加一行 out-of-scope 说明。
7. **R7**：evals.json 追加 2–3 条：仓库 header 上限 100 时不再因 72 阻断；仓库自定义 type（如 `hotfix`）被采用；目标仓库用 `Assisted-by:` 惯例时按仓库惯例输出。
8. 版本号按语义递增（新增能力，minor → 1.11.0），同步 `agents/interface.yaml` 措辞（若受 R4/R6 影响）。

## Constraints

- 默认行为零回归：不传新 flag 时输出与 1.10.0 逐字节一致（除 stderr 提示文案允许改进）。
- 遵守仓库规则：frontmatter 字段齐全；`just skills-check`、`just python-check`、`just node-test` 全绿；Conventional Commits 提交。
- SKILL.md 保持 <500 行、精简（延续 07-09 description 瘦身方向），细节进 references/。
- 不引入第三方依赖（wcwidth 等），沿用现有近似宽度算法。
- 私有 trailer 方案**保留**为默认（本仓库审计口径依赖它），社区惯例仅作为目标仓库有明确信号时的适配分支。

## Acceptance Criteria

- [ ] `--max-header-width 100` 放行 73–100 列 header；`--max-header-width 60` 在 61 列时 exit 1；不传时 72 行为不变（R1）。
- [ ] `--type hotfix --emoji 🚑` 正常出消息；`--type hotfix` 无 emoji 参数时按 no-emoji 输出且 stderr 有提示；内置 type 输出与旧版一致（R2）。
- [ ] SKILL.md §4 列出 `--output` 与 `--max-header-width`；§5.3 明确 PowerShell 禁用 `>` 重定向并给出 `--output` 用法（R3）。
- [ ] agent-workflow.md 含 `Assisted-by:` 生态对照小节 + `Signed-off-by` 禁止项；SKILL.md Preflight §5 含 AI 署名惯例采样点（R4）。
- [ ] `just node-test` 发现并通过新测试文件，用例 ≥10，覆盖清单见 implement.md（R5）。
- [ ] description 含负向触发词句；`just skills-check` 通过（R6）。
- [ ] evals.json 新增 ≥2 条且编号延续、断言可判定（R7）。
- [ ] `just ci` 全绿；版本号与 interface.yaml 同步更新。

## Out of Scope

- 不改其他 git-github-collaboration 家族 skill（除非 interface.yaml 联动措辞）。
- 不实现 gitmoji 文本码（`:sparkles:`）支持、不引入 wcwidth 精确宽度库。
- 不把私有 trailer 方案整体迁移到 `Assisted-by:`（仅加适配分支与文档映射）。
- 不处理 amend/rebase/push 功能本身（只做边界声明）。
