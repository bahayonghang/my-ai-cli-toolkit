# 将 paper-plot-skills 规范化为单个 paper-plot skill

## Goal

把 `ref/repo/paper-plot-skills`（两个并列 skill：`plot-from-data` + `plot-from-image`）
整理、合并为**一个**符合 `skills/research-learning-knowledge` 房规的 skill：`paper-plot`，
内部以 `from-data` / `from-image` 两个 mode 承载原有两种用法。

## Context

参考仓库提炼自 9 张真实论文图，质量高（参数细到 RGB/字号/spine/tick 级别），
但不符合本仓库房规（见 `skills/research-learning-knowledge/AGENTS.md` 与
`scripts/check.py`）。本任务只做「整理 + 规范化迁移 + 必要可移植性修复」，
不重写各风格的视觉逻辑、不新增 CLI/CSV 输入等增强能力。

## Decisions (已与用户确认)

1. **结构**：合并为单个 `paper-plot` skill，内部 `references/modes/` 分 `from-data` 与 `from-image`，
   对齐 exemplar `paper-workbench`。
2. **素材**：保留 10 张 `originals/` 作为 from-image 风格匹配的画廊参考；**丢弃** `repro/`（纯验证产物）。
3. **深度**：规范化迁移 + 必要可移植性修复（结构、frontmatter、路径引用、`python3→python`、
   脚本自定位与输出路径参数化、evals）。不改各风格视觉逻辑，不加 CLI/CSV 增强。

## Requirements

### R1 — 单 skill 结构
- 新建 `skills/research-learning-knowledge/paper-plot/`，精简 `SKILL.md` 作路由入口。
- 两种用法落到 `references/modes/from-data.md` 与 `references/modes/from-image.md`。
- 8 个风格参数文档归入 `references/styles/`；`reproduction_guide.md` 归入 `references/`。
- 8 个 from-data 脚本 + from-image 示例脚本归入 `scripts/`。
- 10 张原图归入 `assets/originals/`。

### R2 — Frontmatter 合规
- 顶层含 `name`、`description`、`category: research-learning-knowledge`、`tags`、`version`。
- `description` 覆盖两种用法的触发语（含中英文），并写清 vs `paper-workbench` /
  `literature-mentor` 的边界（本 skill 是「画图/复现图表」，不是文献阅读/综述）。
- 不引入 `package.json`/`_meta.json` 等 sidecar；`version` 单一真源在 frontmatter。

### R3 — 剔除 vendor 资产
- 不迁移 `agents/openai.yaml`（marketplace 元数据，房规要求剔除）。

### R4 — 路径与可移植性
- skill 内一切「自身目录」引用用 `` `<skill-dir>` `` 字面替换占位符，不用裸 `$SKILL_DIR`。
- 修复所有跨 skill 引用（原 `../plot-from-data/...`）为 skill 内相对路径。
- 脚本调用统一 `python`（非 `python3`）；文档提示 Windows 读 UTF-8 时加 `PYTHONUTF8=1`。
- 脚本通过 `Path(__file__)` 自定位；输出路径参数化（argv 可选，默认写入当前工作目录），
  不再硬编码 `*_repro.png`。

### R5 — evals
- 新增 `evals/evals.json`（git-commit schema），含正例（from-data、from-image 各 ≥1）
  与 ≥2 条路由反例（应路由到 `paper-workbench` / `literature-mentor` 而非本 skill）。

## Out of Scope

- 不重写/改动任一风格的绘图视觉逻辑（颜色、布局算法保持等价）。
- 不新增统一 CLI、CSV/JSON 数据输入层、新风格。
- 不动 `ref/repo/paper-plot-skills` 源目录（只读参考）。
- 不修改本仓库其它 skill。

## Acceptance Criteria

- [ ] `skills/research-learning-knowledge/paper-plot/SKILL.md` 存在且为精简路由型，两 mode 可达。
- [ ] frontmatter 含全部必填字段；`just skills-check`（`scripts/check.py`）通过、无未知键告警。
- [ ] 8 个风格文档、`reproduction_guide.md`、8+1 脚本、10 张原图均已就位且 skill 内引用路径正确（无 `../plot-from-data` 残留、无裸 `$SKILL_DIR`）。
- [ ] 未迁入任何 `agents/openai.yaml` 或 sidecar 元数据文件。
- [ ] 至少抽样运行 1 个 from-data 脚本与 from-image 示例脚本，在 Windows 下 `python <script>` 能生成 dpi=300 PNG（输出路径参数化生效）。
- [ ] `evals/evals.json` 含正例 + ≥2 路由反例，结构合法。
- [ ] `just python-check` 通过；结构变更后 `just docs-sync` + `just ci` 干净通过。
