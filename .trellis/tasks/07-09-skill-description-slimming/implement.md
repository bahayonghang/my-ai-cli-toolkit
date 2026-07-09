# Implement: skill description 精简

## 基线数据（2026-07-09，chars 为规范化后 description 长度）

| Skill                                                    | Chars | 预算                       |
| -------------------------------------------------------- | ----- | -------------------------- |
| research-learning-knowledge/paper-plot                   | 953   | 550                        |
| development-workflows/unknowns-first                     | 887   | 550                        |
| development-workflows/handoff                            | 855   | 400                        |
| academic-research-tools/academic-figure                  | 815   | 550                        |
| docs-writing-publishing/archify                          | 815   | 400                        |
| development-workflows/html-artifact                      | 813   | 400                        |
| development-workflows/implementation-notes               | 809   | 400                        |
| git-github-collaboration/git-commit                      | 801   | 400                        |
| developer-tools-integrations/windows-dev-process-cleanup | 775   | 400                        |
| research-learning-knowledge/humanizer-paper              | 758   | 550                        |
| developer-tools-integrations/claude-md-improver          | 696   | 400                        |
| developer-tools-integrations/ripgrep                     | 647   | 400                        |
| docs-writing-publishing/document-writer                  | 604   | 400                        |
| development-workflows/spark                              | 599   | 400                        |
| research-learning-knowledge/paper-workbench              | 563   | 550（已近达标，微调）      |
| development-workflows/code-auditor                       | 564   | 550（微调）                |
| development-workflows/code-quality-review                | 554   | 550（微调）                |
| development-workflows/cold-shower                        | 549   | 550（保持）                |
| development-workflows/goudi                              | 536   | 550（保持）                |
| docs-writing-publishing/touying                          | 529   | 400                        |
| development-workflows/code-refactor                      | 516   | 400                        |
| developer-tools-integrations/codex-workflow-recommender  | 493   | 400                        |
| development-workflows/codex-dynamic-workflows            | 485   | 400                        |
| developer-tools-integrations/agents-md-improver          | 455   | 400                        |
| developer-tools-integrations/ast-grep                    | 449   | 400                        |
| research-learning-knowledge/roundtable                   | 443   | 400                        |
| developer-tools-integrations/goal-meta-skill             | 436   | 400                        |
| docs-writing-publishing/beautiful-mermaid-editor         | 407   | 400（保持）                |
| research-learning-knowledge/deep-research-pro            | 406   | 400（保持）                |
| docs-writing-publishing/renhua                           | 403   | 400（保持）                |
| research-learning-knowledge/literature-mentor            | 377   | 保持                       |
| development-workflows/geju                               | 375   | 保持                       |
| docs-writing-publishing/bidwriter                        | 365   | 保持（触发词可再删同义项） |
| developer-tools-integrations/archive-planning            | 360   | 保持                       |
| developer-tools-integrations/image-to-ui-skill           | 335   | 保持                       |
| developer-tools-integrations/uv-workflow                 | 238   | 保持                       |
| git-github-collaboration/gh-bootstrap                    | 216   | 保持                       |
| git-github-collaboration/gh-address-comments             | 199   | 保持                       |
| git-github-collaboration/gh-fix-ci                       | 190   | 保持                       |

合计 ≈21,270；目标 ≤13,000。

## 执行清单

1. [x] 批次 A（>750 chars 的 9 个）：逐个重写 description
2. [x] 批次 B（600–750 chars 的 4 个）：同上
3. [x] 批次 C（400–600 chars 且预算 400 的 ~10 个）：轻量压缩
4. [x] paper 系路由重构：改为单向短语（paper-plot → academic-figure；literature-mentor → paper-workbench），无路由盲区
5. [x] 触发回归：trigger_eval.py 未随 yao-meta 分发，按备选方案完成触发用例清单（trigger-regression.md）；发现并修复 touying 主题名回归
6. [x] 前后对比表：before-after.md（34 skill，20,019 → 11,815）
7. [x] `just ci` 全绿（exit 0）

## 实施偏差记录

- 为达成总量 ≤13,000，追加了第二轮压缩，涉及原表中标"保持"的 9 个 skill（cold-shower、goudi、geju、bidwriter、literature-mentor、deep-research-pro、beautiful-mermaid-editor、renhua、archive-planning），全部通过触发回归。
- spark 最终 406 > 400 预算：其 Node 测试将三个行为短语锁定为 frontmatter 契约，保留短语、豁免预算（改测试属于修改 body 契约，超出本任务范围）。
- 批次间未分开 commit：三批次在同一会话内完成并整体通过 CI，交叉修复（YAML 冒号、formatter 表格重排、spark 测试契约）使批次边界不再是有效回滚点，改为单个 skills commit。
- 附带修复：PostToolUse 格式化钩子曾重排 spark 的 surface 表格导致其测试断言（±120 字符窗口内需含 "Claude"）失败，已恢复原始紧凑表格、仅保留 description 修改。
- `docs/` 为生成产物，已随 `just docs-sync` 再生成并纳入同一提交。

## 回滚点

- 每批次一个 commit；任一批次触发回归失败则 revert 该批次单独修复。

## 备注

- 中文触发短语是路由主信号，压缩时优先保留中文特有短语，删英文直译重复。
- `platforms/` 下如有从 skills 派生的资产，本任务不改；发现派生机制则在 wrap-up 时提醒。
