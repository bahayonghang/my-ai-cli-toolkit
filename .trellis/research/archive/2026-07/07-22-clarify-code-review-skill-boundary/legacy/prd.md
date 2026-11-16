# 厘清 code-auditor 与 code-quality-review 的触发边界并在文档中点明二者区别

## Goal

依据 2026-07-22 的 skill 审计结论:两个 skill 是刻意设计的互补分工,**不合并**。
本任务修复审计发现的两处边界缺陷,并在手工维护文档中点明二者区别(使用目的、方式)。

分工背景:

- `code-auditor`:六维全谱审查(正确性、安全、性能、可读性、测试、架构),
  pr / dir / project 三路由,重资产(语言指南、规则包、脚本、模板)。
- `code-quality-review`:单一透镜——可维护性、结构、抽象质量、重构机会,
  轻量,输出契约为 `Verdict + CQ-ID + Confidence`。

边界已有单向保护(code-auditor evals #5 让位给 code-quality-review),
但存在下述缺陷与文档缺口。

## Requirements

### R1 — 修复裸触发词冲突(审计发现 F1)

`code-quality-review/SKILL.md` 的 "When to Use" 一节(约 L28)列出了不带限定的
`code review` 触发词,与 code-auditor 的 PR 审查触发面正面冲突
(裸 "code review" / "review 这个 PR" 应默认归属全谱审查的 code-auditor)。

- 将裸 `code review` 改为带限定的表述(例如 `code review focused on
  quality/maintainability`)或删除该裸词。
- 仅当需要时才同步微调 frontmatter `description`;保持 description 瘦身原则
  (≤1024 字符、无尖括号、"use when …" 触发句式)。

### R2 — 补齐双向路由回归保护(审计发现 F2)

`code-quality-review/evals/evals.json` 缺少反向近邻负例:
"对项目做全维度审计"类请求应让位给 code-auditor。

- 新增至少 1 条 routing-negative eval(镜像 code-auditor evals #5),
  断言全谱/多维审计请求不由 code-quality-review 承接,应路由到 code-auditor。
- 遵循套件 eval 规范(`skills/development-workflows/AGENTS.md`):
  git-commit schema、键名用 `assertions`、prompt 保持自然语言、
  `expected_output` 与 `assertions` 用英文。

### R3 — 在文档中点明二者区别(使用目的、方式)

在手工维护的文档中明确写出两个 skill 的分工对照,内容至少覆盖:

- **使用目的**:全谱合并前把关审计 vs 聚焦可维护性/结构的单透镜审查。
- **使用方式**:触发词族(review PR / 全维度代码审计 vs 代码质量审查 / 可维护性审查)、
  路由归属(裸 "code review" 归 code-auditor)、输出契约差异
  (severity→[必须修复] 映射 vs Verdict+CQ-ID)。
- 落点:`skills/development-workflows/AGENTS.md` 新增一小节(路由/定界说明)。
  `docs/skills/**` 页面由 `sync_docs_catalog.py` 从 SKILL.md 自动生成,
  不手改;若 SKILL.md description 有变动,靠 `just docs-sync` 同步。

### 明确不做(Out of scope)

- 不合并两个 skill;不改动 code-auditor 的路由表、规则包、脚本。
- 不统一两边的 severity 体系(审计发现 F3,判定为可接受的设计差异)。
- 不清理 `scripts/__pycache__/`(未被 git 跟踪的本地产物,与本任务无关)。

## Acceptance Criteria

- [ ] `code-quality-review/SKILL.md` 不再含裸 `code review` 触发词;
      限定后的表述仍覆盖"代码质量审查/可维护性审查"场景。
- [ ] `code-quality-review/evals/evals.json` 含 ≥1 条全谱审计 routing-negative 用例,
      schema 与套件规范一致。
- [ ] `skills/development-workflows/AGENTS.md` 含二者分工对照说明
      (目的、触发/方式、输出契约三点齐备)。
- [ ] 触发/边界变更按 yao-meta 规则跑过 `trigger_eval.py` 路由回归
      (若脚本不可用,在任务记录中注明 missing evidence)。
- [ ] 若 SKILL.md frontmatter 有改动:`just docs-sync` 后 `just ci` 通过;
      `docs-sync` 会重置 `docs/` 下未提交的手改,执行前确认无无关 WIP。

## Notes

- 改动面最小化:只触碰 R1–R3 涉及的文件。
- 提交遵循 Conventional Commits(建议 `fix(skills):` / `docs(skills):` 范围)。
- 审计全文见本会话记录;关键证据:code-auditor evals #5(单向负例)、
  git 提交 `61fcfa3`(定界调校)、`eb643f1`(description 瘦身)。
