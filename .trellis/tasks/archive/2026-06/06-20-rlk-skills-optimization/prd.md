# 审查优化 research-learning-knowledge 4 个 skill

- Date: 2026-06-20
- Status: Planning
- Task: `.trellis/tasks/06-20-rlk-skills-optimization`（父任务）

## Goal

对 `skills/research-learning-knowledge/` 下的 4 个 skill（`deep-research-pro`、
`literature-mentor`、`paper-workbench`、`roundtable`）做一次系统审查，并把发现的问题
拆成可独立验收的子任务推进修复。本任务是**父任务**：拥有审查结论、问题→子任务映射，
以及跨子任务的整体验收口径，自身一般不直接改代码。

## 审查结论（8 个发现）

评审基准：技能工程原则（触发质量 / SKILL.md 精简度 / 最轻可靠流程 / 模式匹配 /
evals 证据）+ 仓库 `scripts/check.py` 强制规则。**前置事实：4 个 skill 当前都通过
`just skills-check`**，所以以下问题都是 linter 抓不到的运行时 / 结构 / 卫生问题。

| ID | 严重度 | skill | 问题 | 证据 |
|----|--------|-------|------|------|
| F1 | P0 | paper-workbench | 脚本调用用裸 `$SKILL_DIR`，运行时为空 → 路径失效，normalize/init-profile/save-artifact 全挂 | `SKILL.md:112,139,154` |
| F2 | P0 | deep-research-pro | README/package.json 描述了不存在的 `scripts/research` CLI（无 scripts/ 目录） | `README.md`、`package.json:8` |
| F3 | P1 | paper-workbench | 悬空引用 `paper2code`（全仓库无此 skill） | `SKILL.md:38` |
| F4 | P1 | literature-mentor | 450 行单体 + 硬编码牛基因组学领域，不可复用，与 paper-workbench 功能重叠 | `SKILL.md` 全文 |
| F5 | P1 | （品类） | 本品类缺 `AGENTS.md` 护栏（另 3 个品类都有，正是 F1 漏网原因） | 目录无 `AGENTS.md` |
| F6 | P2 | deep-research-pro | vendored 市场残留（`_meta.json`/`package.json`/clawdbot 元数据）+ 三方版本漂移（1.0.0/1.0.2/1.0.0） | `_meta.json`、`package.json`、`SKILL.md` frontmatter |
| F7 | P2 | （品类） | evals 三套约定并存且都没接 CI（pytest 永不被 `just ci` 执行） | `evals/evals.json` vs 两处 `test-prompts.json` vs 无 |
| F8 | P2 | paper-workbench | `references/` 与 `resources/` 双文档目录并存，resources/ 未在 SKILL.md 声明 | `resources/`、`references/modes/xray.md:25` |

**已排除的虚惊（不立任务）**：

- UTF-8：3 个 Python 脚本读文件均显式 `encoding="utf-8"`，无 Windows GBK 隐患。
- `__pycache__/*.pyc`：已被 `.gitignore` 忽略且未入库，非卫生问题。

## 问题 → 子任务映射

| 子任务 | 覆盖发现 | 优先级 |
|--------|----------|--------|
| `06-20-pw-skilldir-fix` | F1 + F3 | P0 |
| `06-20-litmentor-redomain` | F4 | P1 |
| `06-20-drp-devendor` | F2 + F6 | P2 |
| `06-20-rlk-conventions` | F5 + F7 | P1 |
| `06-20-pw-doc-dedup` | F8 | P2 |

## 用户决策（已确认）

1. 任务结构：父任务 + 主题拆子任务。
2. `literature-mentor` 定位：保持**个人专用**，并把领域从牛基因组学**改造为
   计算机科学 / 深度学习 / 自动化**相关领域；不通用化成 profile、不并入 paper-workbench。

## 整体验收口径（父任务）

- [ ] 5 个子任务全部完成并归档。
- [ ] `just ci` 通过。
- [ ] `python scripts/check.py skills/research-learning-knowledge` 4 个 skill 仍全部 `[OK]`。
- [ ] 复核 F1–F8：每条要么修复、要么在对应子任务里有明确的"不修+理由"记录。
- [ ] 4 个 skill 的核心行为（触发、模式路由、输出契约）无回归。

## 建议推进顺序

1. `pw-skilldir-fix`（P0，会真的炸，且最小）先行。
2. `rlk-conventions`（补 AGENTS.md 护栏，防止 F1 类问题复发；统一 evals）。
3. `litmentor-redomain`（最大，需 design+implement，单独深做）。
4. `drp-devendor`、`pw-doc-dedup`（卫生类，可并行收尾）。

## Out Of Scope

- 改动 `roundtable`（审查未发现需要立任务的硬伤，仅 `~/Documents/notes` 路径约定与
  deep-research-pro 的"不假设 home 目录"哲学不一致，属可选统一项，留作观察）。
- 新建顶层目录或迁移 skill 路径。
- 在子任务 planning 产物经审查、`task.py start` 之前开始任何实现。

## Open Questions

- 跨 skill 的"是否写 home 目录"约定是否要统一？当前留作观察，不阻塞本批任务。
