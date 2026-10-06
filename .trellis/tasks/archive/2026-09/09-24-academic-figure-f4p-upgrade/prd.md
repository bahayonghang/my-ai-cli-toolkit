# 完善 academic-figure skill（对照 figures4papers）

## Goal

以 `ref/repo/figures4papers`（HEAD `3c181f8`，2026-09-06）为参照，修复
`skills/academic-research-tools/academic-figure`（1.2.0）的缺陷，移植 figures4papers
全部可用的绘图功能与脚本，并补齐缺失图型。完成后版本为 1.3.0。

## Background

- figures4papers 于 2026-09-06 新增 LICENSE，许可证为 CC BY-NC 4.0（`LICENSE:1`）。
  `6790a93` 之后只改动了 `LICENSE` 与 `README.md`，25 个脚本与 skill 引用的快照相同。
- skill 的 `attribution.md:12,20-29`、`design-theory.md:3-6`、
  `panel-layout-patterns.md:10-12` 仍记录「无许可证」，并据此只吸收设计事实。
- 用户决定（2026-09-24）：本项目在 GitHub 开源、非商用；移植 figures4papers 所有
  可用的功能与脚本；在 README 中注明参考了该仓库。
- 研究记录：`research/figures4papers-catalog.md`（逐脚本技法清单、30 条设计声明核验、
  27 项差距 G1–G27）、`research/skill-audit.md`（S1–S6、A1–A18、B1–B6、C1–C6、D1）。
- 上次整合任务：`.trellis/tasks/archive/2026-08/08-16-upgrade-academic-figure-skill/`。

## Requirements

- R1：许可证与出处记录与上游现状一致：figures4papers 记为 CC BY-NC 4.0、快照
  `3c181f8`；间接来源（经 nature-figure 转述的 figures4papers 片段）标明原始出处；
  移植内容写明来源路径与改动说明。
- R2：修复审计中的一致性缺陷与脚本健康问题（子任务 `09-24-af-defect-fixes`）。
- R3：新增可导入的 house-style 辅助模块，覆盖配色、预设、导出契约与色觉检查
  （子任务 `09-24-af-figstyle-module`）。
- R4：移植 figures4papers 24 个绘图脚本及其原图，作为 from-data / from-image 的
  目录风格，并提供展示级（海报、幻灯片、README）路由（子任务 `09-24-af-f4p-port`）。
- R5：补齐 `chart-selection.md` 推荐但 `chart-recipes.md` 缺少的图型，扩充 evals 与
  trigger 用例（子任务 `09-24-af-recipes-evals`）。
- R6：新增 skill `README.md`，含用途、四个模式、安装、示例、依赖、输出、故障排查，
  以及对 figures4papers 与其余上游仓库的致谢与许可证说明。
- R7：`SKILL.md`、`agents/interface.yaml`、`skills/academic-research-tools/AGENTS.md`
  与新增能力一致；frontmatter `version` 升至 1.3.0；生成文档同步。

## Acceptance Criteria

- [ ] A1：四个子任务的验收标准全部满足，且各自已提交。
- [ ] A2：`attribution.md`、`design-theory.md`、`panel-layout-patterns.md`、README
      中不再出现 figures4papers「无许可证」的表述；README 含指向
      `https://github.com/ChenLiu-1996/figures4papers` 的致谢与 CC BY-NC 4.0 说明。
- [ ] A3：`SKILL.md` 路由表与 Resources 列出新增目录风格、辅助模块与展示级入口；
      路由表每一行指向的文件均存在。
- [ ] A4：`skills/academic-research-tools/AGENTS.md` 的模式数量与 skill 一致（四个）。
- [ ] A5：frontmatter `version: 1.3.0`；`just docs-sync` 后 `just ci` 通过，
      `git diff --check` 无输出。
- [ ] A6：没有真实提供商触发复测时，交接说明把触发行为标为 `missing evidence`。

## Out of Scope

- 不移植 figures4papers `assets/` 下的 10 张非 Python 生成的示意图。
- 不引入 pytest，不把 scipy、seaborn、LaTeX 变为 CI 必需依赖。
- 不改动 `industrytslib`、pubfig、AgentFigureGallery 集成指引的接入方式。
- 不发布到外部 GitHub 仓库。
