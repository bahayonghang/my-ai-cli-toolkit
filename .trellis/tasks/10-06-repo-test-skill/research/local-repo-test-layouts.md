# Research: 本机同类仓库的测试布局

- Query: 盘点 `D:\Documents\Code\Agents` 下与 my-claude-code-settings 同类的技能/Agent 仓库如何放测试、目录如何组织、完善到什么程度。
- Scope: internal（本机目录只读；未跑测试命令，未访问网络）
- Date: 2026-10-06

## 只读范围

工作区根：`D:\Documents\Code\Agents`。

计数方法：`os.walk`。跳过目录名 `node_modules`、`.git`、`ref`、`target`、`dist`、`dist-docs`、`.venv`、`.vitepress`、`__pycache__`、`.pnpm-store`、`archive`、`vendor`、`snapshots`，以及所有以 `.` 开头的目录（因此 `.agents`、`.claude`、`.codex` 等 live-link 不重复计入）。跳过 reparse point。`docs/` 里的 `SKILL.md` 不计入技能数。

「具名测试文件」指文件名满足以下之一：`test_*.py`、`*_test.py`、`*.test.py`、`*.test.{js,mjs,cjs,ts,tsx,mts}`、`*.spec.{js,mjs,ts,tsx,mts}`、`*_test.rs`、`tests.rs`。`tests/` 或 `__tests__/` 下其余文件记为夹具，不记入具名测试。

优先仓库 15 个都存在。额外纳入 3 个技能产品仓库：`academic_slides`、`AIPPT`、`industrial-ai-research`。三者都以 `SKILL.md` 为产品，并带 `justfile`。未纳入应用仓库里成批出现的 `SKILL.md`（`BMDock`、`fanbox`、`HerdrDesk`、`seedrmux`、`sub2api`、`codexTimeZoneRev`、`obsidian-notes-karpathy` 的 depth≤4 命中分别是 56、21、55、54、55、54、61）。`ZoteroSynth` 也是单技能产品（`skill/`），因额外名额已满未展开。`OpenWork` 工作区只有 `.opencode/` 与 `opencode.jsonc`。

## 未检查的仓库

未做测试盘点：`_lzscratch`、`autoresearch`、`autoresearch_win`、`BMDock`、`codexTimeZoneRev`、`examples`、`fanbox`、`git-commit-workspace`、`HerdrDesk`、`obsidian-notes-karpathy`、`OpenWork`、`seedrmux`、`sub2api`、`ZoteroSynth`。

部分检查：

- `deepseek-harness` 的 `vendor/`、`snapshots/` 未计入。
- `paper-framework-figure-studio-pro` 的两个 zip 只做了文件名清单，未解压。
- `orca`、`deepseek-harness`、`skills-manage-windows` 的具名测试按文件名计数，未打开文件内容。
- 未执行任何 `just` / `pytest` / `vitest` / `cargo test`。

## Findings

### 主样本：my-claude-code-settings

一句话：可安装技能目录，加平台源码与 Claude hook。README：`README.md` 第 1–4 行。

技能：`skills/` 下 34 个 `SKILL.md`（每个技能目录一个；不含 live-link）。有 `tests/` 的 16 个。没有 `tests/` 的 18 个。16 个有测试的技能同时有 `evals/`。另有 17 个只有 `evals/`、没有 `tests/`。两者都没有的 1 个：`skills/developer-tools-integrations/claude-context-improver`。

没有 `tests/` 的技能：

- `skills/developer-tools-integrations/ast-grep`
- `skills/developer-tools-integrations/claude-context-improver`
- `skills/developer-tools-integrations/herdr-orchestra`
- `skills/developer-tools-integrations/ripgrep`
- `skills/developer-tools-integrations/uv-workflow`
- `skills/development-workflows/code-auditor`
- `skills/development-workflows/code-quality-review`
- `skills/development-workflows/code-refactor`
- `skills/development-workflows/codex-review`
- `skills/development-workflows/rust-build-optimization`
- `skills/docs-writing-publishing/beautiful-mermaid-editor`
- `skills/docs-writing-publishing/bidwriter`
- `skills/docs-writing-publishing/document-writer`
- `skills/docs-writing-publishing/job-application-kit`
- `skills/docs-writing-publishing/renhua`
- `skills/docs-writing-publishing/touying`
- `skills/git-github-collaboration/gh-bootstrap`
- `skills/research-learning-knowledge/literature-mentor`

除 `claude-context-improver` 外，上表其余 17 个都有 `evals/evals.json`。

具名测试文件 41 个（来源：上述 walk）。分布：

| 位置 | 具名文件 | 入口是否执行 |
|---|---|---|
| 13 个技能的 `tests/*.mjs` | 33 | `just node-test` 会收集 |
| `skills/git-github-collaboration/gh-pr-release/tests/*.py` | 3 | `just python-test` 会 discover |
| `skills/research-learning-knowledge/humanizer-paper/tests/*.py` | 1 | 不在 `python-test` |
| `skills/research-learning-knowledge/paper-workbench/tests/*.py` | 1 | 不在 `python-test` |
| `platforms/claude/hooks/tests/test_hooks.py` | 1 | `just python-test` |
| `scripts/test_install_projects.py` | 1 | `just install-projects-test` |
| `docs/scripts/test_sync_docs_catalog.py` | 1 | `just docs-check` |

13 个 Node 技能的 `tests/*.mjs` 个数：`academic-figure` 7，`skill-session-review` 10，`image-to-ui-skill` 3，`trellis-plan-review` 3，`goal-meta-skill` 2，以及各 1 个：`idea-bib-review`、`codex-context-improver`、`file-sorter`、`storage-analyzer`、`windows-dev-process-cleanup`、`html-artifact`、`git-commit`、`git-worktree`。这些目录里的 `.mjs` 全部是 `*.test.mjs` 或 `*.spec.mjs`（33 = 具名 `.mjs` 数）。夹具 17 个，在 `idea-bib-review/tests`、`windows-dev-process-cleanup/tests`、`skill-session-review/tests`、`paper-workbench/tests`（`.bib` 4、`.json` 5、`.md` 3、`.csv` 2、`.txt` 2、`.pdf` 1）。

入口（`justfile`）：

- `skills-check`：`python scripts/check.py skills`（`justfile` 70–71 行）。`scripts/check.py` 46 行写明校验 frontmatter。该文件无 `tests` / `evals` 字样，不要求技能带 `tests/`。
- `python-check`：对 `skills/`、`platforms/`、`scripts/` 下 `*.py` 做 `py_compile`，跳过路径中的 `scaffolds` 与 `node_modules`（`justfile` 74–75 行）。编译，不运行测试。
- `python-test`：只 discover 两个目录，模式 `test_*.py`（`justfile` 78–80 行）：`skills/git-github-collaboration/gh-pr-release/tests`、`platforms/claude/hooks/tests`。
- `node-test`：从 `skills/` 递归收集路径分量含 `tests` 且文件名以 `.mjs` 结尾的文件，再 `node --test`（`justfile` 83–84 行）。不跑 `*.py`。
- `install-projects-test`：`python scripts/test_install_projects.py`（`justfile` 129–130 行）。
- `docs-check`：`docs/scripts/sync_docs_catalog.py --check`，然后 `docs/scripts/test_sync_docs_catalog.py`，再装文档依赖并 `npm --prefix docs run build`（`justfile` 61–65 行）。覆盖的是 catalog 同步，不是技能行为。
- `ci`：上述七步加 `git diff --check`（`justfile` 92–116 行）。顺序与根 `AGENTS.md` 13 行一致。

GitHub：`.github/workflows/agentkit-desktop.yml` 只在 release 与指向 `main` 的 pull request 上跑。矩阵是 ubuntu / windows / macos。39 行 `run: just ci`。37–38 行设置 `IMAGE2_SKILL_BROWSER_TESTS=1`。仓库内该变量只出现在 `skills/developer-tools-integrations/image-to-ui-skill/tests/demo-validation.test.mjs` 256 行，用于取消一条 skip。

`platforms/`：具名测试只有 `platforms/claude/hooks/tests/test_hooks.py`。`platforms/codex`、`platforms/antigravity` 没有计入的 `tests/`。

`scripts/`：具名测试只有 `scripts/test_install_projects.py`。

`evals/`：`scripts/check.py` 不校验，`node-test` 不执行。`skills/research-learning-knowledge/AGENTS.md` 44–46 行：「evals are not executed by CI (`scripts/check.py` validates only `SKILL.md` frontmatter; `node-test` runs `tests/*.mjs`).」同文件 38–39 行要求至少两个 near-neighbor routing-negative case。同文件 50–56 行写明 `paper-workbench` 的 pytest「is not guaranteed in CI」，并写明不要把 pytest 接进 `just ci`。`skills/research-learning-knowledge/humanizer-paper/AGENTS.md` 80–81 行：`pytest` under `tests/` is local/optional and not wired into CI。

目录约定原文：

- 根 `AGENTS.md` 25 行：「Node skill scripts target plain Node >= 20 and live alongside their `tests/*.mjs`.」
- 根 `AGENTS.md` 28 行：「When adding or changing a Node skill, add or update a matching test file in its `tests/` directory.」
- `skills/AGENTS.md` 6 行：技能包含 instructions、bundled scripts、tests、references、assets、eval fixtures。
- `skills/AGENTS.md` 12 行：「Keep runnable helpers inside the owning skill, usually under `scripts/`, and tests under `tests/`.」
- `skills/AGENTS.md` 18–19 行：Python 测试走 `just python-check`；Node 测试走 `just node-test`，路径 `skills/**/tests/*.mjs`。
- `skills/code_map.md` 19 行：`<category>/<skill>/tests/`，通常是 Node `*.mjs` 或 Python tests。

完善程度（有路径的事实，不是评分）：

- 34 个技能里 16 个有 `tests/`，18 个没有。检查器不把缺 `tests/` 当成失败。
- 技能 Python 测试分裂：`gh-pr-release` 在 `python-test`；`humanizer-paper` 与 `paper-workbench` 不在。
- `python-check` 只做字节编译。
- evals 有 schema 和 routing-negative 约定，CI 不跑。
- 负例没有在单元测试文件名层面全库清点。已确认的负例约定在 eval JSON，不在 `node --test`。

### academic-writing-skills

一句话：论文写作技能集合，8 个技能包在 `academic-writing-skills/`，不在 `skills/`。`AGENTS.md` 13–22 行列出八个目录。

入口：

- `pyproject.toml` 87–90 行：`testpaths = ["tests", "academic-writing-skills"]`，`python_files = ["test_*.py"]`。
- `justfile` 113–115 行：`just test` → `uv run --extra dev python -m pytest`。
- `justfile` 78–80 行：`just check-versions` 只跑 `tests/contracts/test_skill_versions.py`。
- `justfile` 56–71 行：`just ci` = check-versions、lint、typecheck、test。
- `.github/workflows/ci.yml` 49 行：`just ci`。矩阵 ubuntu/windows × Python 3.10/3.13。同文件 92 行另有 docs job：`docs/scripts/check_resource_sync.py`。`AGENTS.md` 47 行写明该 docs 门禁不属于 `just ci`。

具名 `test_*.py` 115 个：

- `tests/contracts/` 21
- `tests/shared/` 3
- `tests/skills/cover_letter/` 4
- `tests/skills/latex_defense_zh/` 8
- `tests/skills/latex_paper_en/` 17
- `tests/skills/latex_thesis_zh/` 34
- `tests/skills/paper_audit/` 21
- `tests/skills/typst_paper/` 4
- `academic-writing-skills/bib-search-citation/tests/` 1
- `academic-writing-skills/paper-writing-studio/tests/` 2

其余 6 个技能没有技能内 `tests/`。8 个技能都有 `evals/`。`justfile` 的 test/ci 配方没有 eval 步骤。

约定原文（`AGENTS.md` 24 行）：「Automated tests live in `tests/` and in skill-local `academic-writing-skills/*/tests/`.」76 行：文件名 `test_*.py`，函数 `test_*`，共享 fixture 在 `tests/conftest.py`。78 行：`DEFENSE_ZH_COMPILE=1` 才跑 latex-defense-zh 编译测试；无 PyMuPDF 时 preview 测试 skip。

夹具在 `tests/` 内另有 `.stderr` 25、`.stdout` 25、`.exit` 17、`.tex` 19 等（walk 的 in-tests-dir 计数）。

### agent-creator

一句话：为一个 Codex 子代理技能生成、lint、评估 TOML。`README.md` 开头。`skills/agent-creator/SKILL.md` 1 个。

无 `justfile`、无 `package.json`、无 `pyproject.toml`、无 `.github/workflows`。具名测试 0。`skills/agent-creator/scripts/run_agent_evals.py` 与 `assets/agent_evals.example.json`、`references/eval-rubric.md` 在。没有 `evals/` 目录，没有被 CI 调用的记录（仓库无 CI）。

### drawio-skills

一句话：两个 draw.io 技能（base + academic overlay）。`skills/drawio`、`skills/drawio-academic-skills`。

入口：

- `package.json`：`"test": "node scripts/run-tests.js"`，`"ci": "npm run version:check && npm run lint && npm test && npm run test:parsers && npm run docs:build"`。
- `scripts/run-tests.js` 38–39 行只收 `*.test.js`。65 行默认收集 `tests/` 与 `skills/`。47–49 行把两个 `*.integration.test.js` 放在 `--code-parsers`，并要求 `DRAWIO_TEST_PYTHON`。
- `justfile` 230–232 行：`just test` → `npm test`。`just ci` 转到 `npm run ci`（`AGENTS.md` 26 行）。
- `.github/workflows/ci.yml` 44 行：`npm run ci`，并设置 `DRAWIO_TEST_PYTHON`。矩阵 ubuntu/windows，Node 24。

具名 `*.test.js` 74 个：`skills/drawio/scripts/` 旁 56 个，仓库 `tests/` 18 个。两个技能都有 `evals/`。`run-tests.js` 不收集 `evals/`。

约定原文（`AGENTS.md` 15 行）：「`tests/` holds repo-level Node tests, while module-level tests also live next to source as `*.test.js`.」55 行、58–60 行：`*.test.js`，`node:test` + `node:assert/strict`，fixture 靠近模块或放在 `tests/`。

### drawio-scientific-illustrator

一句话：draw.io 桌面画布的 Codex 插件，含 MCP 与一个技能。技能在 `plugins/drawio-scientific-illustrator/skills/recreate-scientific-figure-in-drawio`。该技能目录下没有 `tests/`。

入口：

- `package.json` 8–11 行：`check` 是 `node --check` 三个插件脚本再加 `scripts/validate-repo.mjs`。`test` = `npm run check && node scripts/smoke-test.mjs`。`test:project-local` = `node --test "adapters/project-local/tests/*.test.mjs"` 再加 `adapters/project-local/tests/check-global-pollution.mjs`。
- `justfile` 只有 `install`、`docs`、`docs-build`。没有 test 配方。
- `.github/workflows/ci.yml` 18 行：`npm test`（语法检查 + smoke，不跑 adapter 单测）。
- `.github/workflows/project-local-adapter.yml` 26–28 行：`npm run check` 与 `npm run test:project-local`。

`adapters/project-local/tests/`：10 个 `*.test.mjs`，另有 `helpers.mjs`、`check-global-pollution.mjs`。glob `*.test.mjs` 不包含 `helpers.mjs`。`package.json` 的 `test:project-local` 单独点名 pollution 脚本。无 `evals/`。

### NSFC-skills

一句话：国家自然科学基金申请书的诊断与局部改写技能。`README.md` 20–24 行写明拒绝生成完整申请书。

`skills/nsfc-skills/SKILL.md` 1 个。`README.md` 27–30 行布局含 `evals/evals.json`。目录里 `evals/` 只有 `evals.json`。无 `justfile`、无 `package.json`、无 CI、无具名测试。

### paper-rebuttal-skill

一句话：论文返修包技能。`skills/paper-rebuttal-skill` 1 个。

入口（`justfile` 4–32 行）：

- `ci` = lint、typecheck、runner-check、smoke、eval、docs-build。
- `runner-check`：`python -m unittest discover -s skills/paper-rebuttal-skill/evals -p test_eval_runners.py`。
- `eval`：`python skills/paper-rebuttal-skill/scripts/run_evals.py --pretty`。
- `smoke`：`compileall` 该技能 `scripts/`，再对多个 CLI `--help`，并对 `run_behavior_evals.py` 跑 `evals/runner-smoke-cases.json`。

无 GitHub workflow。无仓库级 `tests/`。`evals/` 下具名 Python 2 个：`test_eval_runners.py`、`test_install_contract.py`。discover 的 `-p` 只匹配前者。`evals/` 其余文件后缀计数：`.md` 698、`.json` 195、`.txt` 137、`.tex` 83，以及 pdf/docx/LaTeX 辅助文件。这些数字是目录文件数，不是 eval case 数。

`AGENTS.md` 50–52 行把 `just eval` 写成 deterministic fixture evals，并写 No paid LLM。

### skill_optimizer

一句话：分析 Claude Code 技能的合规、token 与写法。产品目录是 `skills/skill-audit`。`pyproject.toml` 的 package name 是 `skill-audit`。

入口（`justfile` 4–20 行）：`ci` = lint、typecheck、test。`test` 只执行 `uv run python skills/skill-audit/scripts/analyze_skill.py skills/skill-audit`。`lint` 的 ruff 范围是 `skills/`。`pyproject.toml` 无 pytest 配置，dependency-groups 只有 ruff 与 pyright。无 GitHub workflow。

`tests/` 有 4 个 pytest 文件：`test_analyze_skill.py`、`test_detect_overlap.py`、`test_quality_gate.py`、`test_render_card.py`。`test_analyze_skill.py` 第 9 行 `import pytest`。`just test` 不调用 pytest。无 `evals/`。

### skills-janitor

一句话：Skillscope CLI。根 `Cargo.toml`，并带 7 个 `skills/skillscope-*` 技能。7 个技能都没有 `tests/`，也没有 `evals/`。

入口：

- `justfile` 21–32 行：`test` = `cargo test --all-targets --all-features`。`ci` = sync、fmt-check、clippy、test、build-release。
- `AGENTS.md` 14–21 行列出同一顺序，并写明 `tests/package_identity.rs` 锁定根包名。
- `.github/workflows/ci.yml` 26 行与 32 行：先跑 package_identity 的一条测试，再 `cargo test --all-targets --all-features`。

`tests/` 4 个集成测试文件（文件名不是 `*_test.rs`）：`dashboard_cli.rs`、`package_identity.rs`、`skill_sync_cli.rs`、`version_sync.rs`。`src/` 里 12 个 `.rs` 含 `#[cfg(test)]` 或 `mod tests`：`analysis/` 下 4 个，`commands/` 下 4 个，`domain/` 下 4 个。`justfile` 14 行的 `sync-skill-version` 使用 `--ignored`，不在默认 `cargo test` 的非 ignored 集合里单独说明；默认 `cargo test` 是否包含该 ignored 测试，以 Cargo 默认行为为准：带 `--ignored` 的配方才会跑它。

### skills-manage-windows

一句话：SkillPort 桌面应用（pnpm + Tauri）。本次 walk 在源码树没有数到 `SKILL.md`（根目录清单也没有 `skills/`）。

入口：

- `package.json` scripts：`"test": "vitest run"`。
- `justfile` 34–35 行：`just ci` 先 `sync-version`，再 `node scripts/check/run-ci.mjs`（默认 lane `all` = common + rust-platform）。
- `scripts/check/run-ci.mjs` 32–76 行：common 含 `pnpm test`；rust-platform 含 `cargo test --manifest-path src-tauri/Cargo.toml --locked`，以及 `python -m unittest discover -s .trellis/scripts/tests -p test_*.py`。
- `.github/workflows/ci.yml` 80 行：`node scripts/check/run-ci.mjs --lane common`。同文件还有 windows rust job。workflow 文本不含字面量 `vitest` / `cargo test`，测试通过 `run-ci.mjs` 间接执行。
- `docs/agents/build-and-test.md` 44–53 行复述这些门禁。

具名测试：`src/test/**` 下 `.tsx` 90、`.ts` 88（按目录前两级：components 71、lib 27、pages 22、stores 22、contracts 15、scripts 12、hooks 5，其余更少）。`src-tauri/src/**` 旁具名 `.rs` 36。`src-tauri/tests/` 另有 9 个非 `*_test.rs` 文件（计入 in-tests-dir，不计入 36）。`.trellis/scripts/tests/` 3 个：`test_active_task_isolation.py`、`test_path_security.py`、`test_runtime_resilience.py`。该目录在点目录跳过规则之外，是按 CI 配方单独点名的。无 `evals/`。

### learn-claude-code

一句话：按章节讲 agent harness 的教程仓库，带 `agents/`、`skills/`（4 个 `SKILL.md`）和 `web/`。

4 个技能都没有 `tests/`。工作区没有 `tests/` 目录。`git -C learn-claude-code ls-files tests/*` 无输出。

`.github/workflows/test.yml` 24 行仍执行 `python tests/test_unit.py`。47 行按矩阵执行 `python tests/test_${session}.py`，session 为 v0–v9 与 v8a/v8b/v8c，并传入 `TEST_API_KEY`、`TEST_BASE_URL`、`TEST_MODEL`。`.github/workflows/ci.yml` 只在 `web/` 做 `tsc --noEmit` 与 `npm run build`。当前树与这两个 workflow 的测试路径不一致。

### deepseek-harness

一句话：TypeScript 多包 harness，另有 `python/sdk`。`SKILL.md` 只有 2 个，都在 `packages/preset/agent-presets/presets/cordis/skills/`。

入口：

- 根 `package.json`：`test` = `vitest run`；另有 `test:e2e`、`test:snapshot`、`test:web`、`test:coverage`、`check:ci` 等，转到 `vitest.*.config.ts` 或 `scripts/run-gates.ts`。
- `pytest.ini`：`testpaths = python/sdk/tests`。
- `.github/workflows/ci.yml` 89 行 `pnpm run check:ci:static`，151 与 474 行 `pnpm run check:ci:coverage`，295 行 `uv run --python 3.10 --group test --project python/sdk pytest`，506 行 `pnpm exec vitest run`。未逐项展开 `scripts/run-gates.ts` 每个 lane 的命令列表。

具名测试（跳过 `vendor/`、`snapshots/`）：`.ts` 906、`.tsx` 137、`.py` 6、`.js` 2。具名分组 251 个，最大的是 `colocated:scripts` 64、`packages/experimental/webworker-runtime/tests` 34、`packages/api/session-controller/tests` 33。`apps/web/tests` 另有 168 个非具名文件，`apps/cli/tests` 112 个。无 `evals/` 目录计入。两个 cordis 技能没有单独的 `tests/` 分组。

### dsh-routing-suite

一句话：DeepSeek Harness 的路由预设安装包（`injector/` + `preset/`）。源码树 `SKILL.md` 为 0。

无根 `justfile`、无根 `package.json`、无 CI。测试在子包：`preset/package.json` 17 行 `"test": "node --test router.test.mjs"`。`preset/router.test.mjs` 使用 `node:test`。`preset/README.md` 116 行写 `node --test router.test.mjs`，并注明 11 tests。仓库内没有第二处调用该脚本的 CI。`preset/probe/` 有多份 `run-*.mjs` 与 `eval-*.mjs`，文件名未计入具名测试。

### paper-framework-figure-studio-pro

一句话：论文框架图技能的 zip 与示例图目录。磁盘上的展开目录没有 `SKILL.md`。无 `justfile`、无 CI、无具名测试。

`paper-framework-figure-studio-pro-v3.2.15c-skill.zip`：4169 个条目，含 `SKILL.md`，路径含 `tests/` 的条目 0。`paper-framework-figure-studio-pro-v3.2.15f-skill.zip`：4192 个条目，同样有根上的 `SKILL.md`，`tests/` 路径 0。zip 未解压，未核对 zip 内是否用别的文件名放测试。

### orca

一句话：桌面 AI 编排器。`skills/` 下 8 个 `SKILL.md`：`computer-use`、`linear-tickets`、`orca-cli`、`orca-emulator`、`orca-emulator-android`、`orca-linear`、`orca-per-workspace-env`、`orchestration`。这 8 个目录都没有 `tests/`。

入口：根 `package.json` 的 `test` 是 `vitest run --config config/vitest.config.ts`（前面先 `ensure-native-runtime`）。`test:e2e` 用 Playwright，配置 `tests/playwright.config.ts`。另有多条 `test:e2e:*` 与 `test:skill-sharing:release`（vitest 指向 `src/main/skills` 等）。`.github/workflows/pr.yml` 含多处 `pnpm exec vitest run --config config/vitest.config.ts`。`e2e.yml`、`computer-e2e.yml`、`mobile.yml` 分别跑 e2e 或 `pnpm test`。无 `evals/` 计入。

具名测试文件 6822：`.ts` 6132、`.tsx` 578、`.mjs` 111、`.py` 1。最多的位置是源码旁而不是集中 `tests/`：`src/renderer/src` 2905，`src/shared` 454，`src/main/runtime` 375，仓库 `tests/` 317，`src/main/ipc` 314。`tests/` 下另有 237 个非具名文件。`src/main/skills` 旁有 76 个具名测试，测的是应用里的 skills 实现，不是 `skills/<name>/tests/`。

### 额外三个同类技能仓库

#### academic_slides

一句话：学术幻灯片技能，双后端 Typst 与 Beamer。`skills/academic-slides` 1 个 `SKILL.md`。

`justfile` 14–18 行：`test` = `uv run pytest -v`，`check` = lint + test。`pyproject.toml` 22–23 行：`testpaths = ["tests"]`。具名测试 1 个：`tests/test_scripts.py`。同目录有 `__init__.py`。无 `evals/`，无 GitHub workflow。

`AGENTS.md` 7 行：「Tests: `tests/` (focus on script behavior and JSON outputs).」24–30 行：`test_*.py`，pytest，改脚本时更新 `tests/test_scripts.py`。

#### AIPPT

一句话：新开演示文稿的契约式技能。`npx skills add bahayonghang/AIPPT`（`README.md`）。`SKILL.md` 7 个：`skills/aippt` 加 6 个 `subskills/*/SKILL.md`。

`justfile` 15–21 行：`ci` 对 5 个 `skills/aippt/scripts/*.mjs` 做 `node --check`，再 `docs` 的 `docs:build`。无 test 配方，无 GitHub workflow，无具名测试。`skills/aippt/evals/` 有 `evals.json`、`trigger-evals.json`、`scene-stubs/`。

`AGENTS.md` 4 行把回归夹具放在 `evals/`。20 行：「There is no separate unit-test suite yet; validation is contract-driven.」并要求行为变化时更新上述两个 JSON。

#### industrial-ai-research

一句话：工业 AI 文献研究的单个 Codex 技能。`skills/industrial-ai-research` 1 个。

`justfile` 3–5 行：`ci` = `npm install` 然后 `npm run ci`。`package.json` 的 `ci` 是 `npm run docs:build`。无具名测试，无 GitHub workflow。`evals/` 有 `evals.json` 与 `trigger_eval.json`。没有任何配方执行这两个文件。

### 可复用的布局（样本里重复出现）

这些是多个技能仓库里已经写进入口或 `AGENTS.md` 的布局，不是新设计。

- 技能内测试目录叫 `tests/`，与 `scripts/` 并列。主样本 `skills/AGENTS.md` 12 行；academic-writing 允许仓库 `tests/` 与技能内 `tests/` 并存（`AGENTS.md` 24 行）。
- Node 技能测试文件用 `node:test`，文件名 `*.test.mjs` 或 `*.test.js`，由发现器递归收集，而不是在 `justfile` 里逐个点名。主样本 `justfile` 83–84 行；drawio `scripts/run-tests.js` 38–65 行。
- Python 技能测试文件名 `test_*.py`。academic-writing `pyproject.toml` 89 行；academic_slides `AGENTS.md` 24 行；主样本 unittest discover 的 `-p` 也是 `test_*.py`。
- 仓库级门禁用 `just ci` 串起检查，GitHub workflow 调用同一条 `just ci` 或等价的 `npm run ci`。主样本、academic-writing、drawio-skills、skills-janitor 都是这个形状。
- `evals/evals.json` 与可执行测试分开。主样本明确 CI 不跑 evals。AIPPT、NSFC、industrial-ai-research 把 evals 当回归夹具，入口不执行它们。
- 元数据检查（frontmatter、`node --check`、`py_compile`、docs build）可以在没有行为测试时仍然是 CI。AIPPT 的 `just ci`、主样本的 `skills-check` + `python-check` 都是这种层。

### 不应照搬的个例

- orca：6822 个与源码同目录的 `*.test.ts` / `*.spec.ts`，另加 Playwright `tests/e2e`。技能包目录本身没有 `tests/`。这是应用单测布局。
- deepseek-harness：按 package 的 `tests/` 加多份 vitest 配置，再加 `python/sdk` 的 pytest。技能只是 preset 里的两份 `SKILL.md`。
- skills-manage-windows：Vitest 集中在 `src/test/`，Rust 测试在 `src-tauri` 源码内和 `src-tauri/tests/`，另加 `.trellis/scripts/tests`。产品是桌面应用。
- skills-janitor：测试在 Cargo `tests/*.rs` 与 `src` 内 `#[cfg(test)]`。7 个技能目录没有自己的 `tests/`。
- skill_optimizer：`tests/` 里 4 个 pytest 文件，`just test` 不运行它们，改为对技能目录跑一次 `analyze_skill.py`。
- learn-claude-code：workflow 指向 `tests/test_unit.py` 与 `tests/test_v*.py`，当前树与 `git ls-files` 都没有 `tests/`。session job 依赖 API secrets。
- paper-rebuttal-skill：可执行检查放在 `evals/*.py` 与 `scripts/run_evals.py`，没有 `tests/`。`test_install_contract.py` 不在 `runner-check` 的 `-p` 里。
- dsh-routing-suite：唯一具名测试在 `preset/router.test.mjs`，入口在子目录 `preset/package.json`，根上没有 CI。
- paper-framework-figure-studio-pro：测试面不在工作区，只在未解压的 zip 文件名清单里，且清单中 `tests/` 为 0。
- drawio-skills 的「测试与源码同目录」只覆盖 `skills/drawio/scripts/*.test.js`。academic overlay 没有这组同目录测试。
- drawio-scientific-illustrator 的默认 `npm test` 不跑 `adapters/project-local/tests`。adapter 测试在另一个 workflow。
- academic-writing 的编译/预览测试会 skip（`AGENTS.md` 78 行）。集中目录用 snake_case（`tests/skills/latex_paper_en`），技能目录用 kebab-case。
- 主样本 `IMAGE2_SKILL_BROWSER_TESTS` 只打开一个技能里的一条浏览器测试。不能把它当成全库测试开关。

### Files Found

| File Path | Description |
|---|---|
| `justfile` | 主样本 CI 与四条测试入口 |
| `scripts/check.py` | 只校验技能 frontmatter |
| `scripts/test_install_projects.py` | 安装器 unittest |
| `docs/scripts/test_sync_docs_catalog.py` | catalog 同步 unittest |
| `platforms/claude/hooks/tests/test_hooks.py` | 唯一 platforms 测试 |
| `.github/workflows/agentkit-desktop.yml` | 三系统 `just ci` |
| `skills/AGENTS.md` | 技能内 `tests/` 约定 |
| `D:\Documents\Code\Agents\academic-writing-skills\AGENTS.md` | 仓库 `tests/` + 技能内 `tests/` |
| `D:\Documents\Code\Agents\drawio-skills\scripts\run-tests.js` | 收集 `*.test.js` |
| `D:\Documents\Code\Agents\skills-manage-windows\scripts\check\run-ci.mjs` | common / rust-platform 门禁 |
| `D:\Documents\Code\Agents\skill_optimizer\justfile` | `test` 不跑 `tests/*.py` |
| `D:\Documents\Code\Agents\learn-claude-code\.github\workflows\test.yml` | 指向当前树不存在的 `tests/` |

### External References

无。本次没有查外部文档。

### Related Specs

未读 `.trellis/spec/`。本次问题是测试目录事实，不是层规范。

## Caveats / Not Found

- 未运行测试，所以「CI 会执行」只表示配方文本会调用该路径。配方是否在本机通过，未验证。
- `deepseek-harness` 的 `scripts/run-gates.ts` 内部步骤未逐条展开。workflow 里直接出现的 pytest 与 vitest 命令已记录。
- `orca` 的 6822 与 deepseek 的 1051 个具名文件未抽样打开。若生成物使用 `.test.ts` 后缀且不在跳过目录中，会被计入。
- Rust 内联测试只统计了 skills-janitor 的 `#[cfg(test)]` / `mod tests` 文件数。skills-manage-windows 的 36 个具名 `.rs` 是文件名匹配，不是 `#[cfg(test)]` 计数。
- `paper-rebuttal-skill` 的 698 个 `.md` 与 195 个 `.json` 是 `evals/` 树文件数。没有统计 eval case id。
- `learn-claude-code` 的测试文件缺失是当前工作区与 `git ls-files` 的结果。未比较远端分支。
- 负例覆盖没有做全库断言分类。只记录了主样本文档里的 routing-negative eval 约定，以及 AIPPT 的 trigger-evals 文件名。
