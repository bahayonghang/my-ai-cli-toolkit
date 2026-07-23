# Design — 删除 6 个过时 skill

## 引用分类模型（4 类）

删除一个 skill 会在仓库里留下四种「命中」，处理方式不同：

- **A. 真实交叉引用（手改）** — 存活文件里以 skill 名义指向删除目标的链接/路由/示例。
- **B. 生成产物（再生成）** — `docs/**` 目录页与 catalog，由 `just docs-sync` 从磁盘 `skills/` 重建。
- **C. 误报（不动）** — 通用英文词 "handoff"/"implementation" 恰好命中，与 skill 无关。
- **D. 历史快照（不动）** — `.trellis/tasks/archive/**`、journal、`gh-pr-release/reports/*`。

完整逐文件分类见 `research/reference-triage.md`。

## 关键边界

- **docs 不手改**：`docs/scripts/sync_docs_catalog.py` 扫描磁盘上的 `skills/`，删除目录后
  `just docs-sync` 会自动移除 6 个 skill 的 catalog 条目与详情页；`just docs-check` 校验零漂移。
  手改 docs 会与生成器冲突（见记忆 docs-sync-regenerates-all-docs）。
- **删除用 `git rm -r`**：`rm -rf` 被本仓库 pre-bash hook 拦截。`git rm -r` 直接暂存删除。
- **AGENTS.md 是分类导览**：两个 `AGENTS.md` 描述各自 category 的 skill 集合、示例范式、
  交叉引用范例。删除后需重写为「仅存活 skill」，并为被删除的「范式示例」另选存活替身：
  - dev-workflows：eval-schema 示例原为 `cold-shower` → 改用存活 skill 的 `evals/evals.json`。
  - DTI：script-bearing 示例原为 `archive-planning` + `goal-meta-skill` → 收敛为仅 `goal-meta-skill`。
- **unknowns-first 自足性**：其 `references/implementation-notes-template.md` 存在，删除
  `implementation-notes` skill 后，把 SKILL.md 的「skill if available; otherwise template」
  路由收敛为「直接用本地 template」，并移除对 `cold-shower` 的路由句。

## A 类改动清单（存活文件）

| 文件                                                         | 改法                                                                                                                          |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `skills/development-workflows/AGENTS.md`                     | 移除 cold-shower/geju/goudi/handoff/implementation-notes 的条目、列表项、示例；范式示例改指存活 skill；保持文件原有结构与语气 |
| `skills/developer-tools-integrations/AGENTS.md`              | 移除 archive-planning 条目/表格行/交叉引用；script-bearing 示例收敛为 goal-meta-skill                                         |
| `skills/development-workflows/unknowns-first/SKILL.md`       | 描述行(3) 去掉 "(cold-shower)" 路由；正文(15) 去掉 cold-shower/implementation-notes 路由句；(131) 收敛为本地 template         |
| `skills/development-workflows/html-artifact/evals/README.md` | 约定示例路径从 cold-shower 改为存活 skill（如 unknowns-first）的 evals                                                        |
| `.gitignore`                                                 | 删除 `goudi-workspace/` 行                                                                                                    |

## 不做的事（避免范围蔓延）

- 不动 C 类通用词命中；不「顺手」改 `skills/code_map.md:13` 的通用措辞（低价值，非硬链接）。
- 不动 D 类历史/快照。
- 不新增功能、不重构相邻代码。

## 兼容性 / 回滚

- 纯删除 + 文档再生成，无运行时行为变更；`git rm` 可通过 `git restore --staged/`checkout` 回滚。
- 回滚点：删除后未提交前可整体 `git checkout -- <paths>` 还原。
