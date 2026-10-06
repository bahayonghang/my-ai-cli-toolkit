# Research: 仓库测试位置、目录结构与完善程度

- Query: 为「仓库测试位置、文件夹结构、完善程度」收集公开先验。意图查询：agent skill that audits where tests live and how complete they are；Anthropic / Claude skill authoring guidance on tests, evals, folder layout；pytest / node:test repository layout conventions used by coding agents；中文「仓库测试目录结构、测试完善度、技能 eval 与 CI 的差别」。目录查询（乔木脚本指定）：`repository test layout skill`；`audit test coverage structure`。
- Scope: mixed
- Date: 2026-10-06
- 本文不包含本仓库的实现计划。

## 失败与 missing evidence

下列来源没有拿到完整原文，或工具没有跑完。后文凡用到替代通道，都标明。

| 来源 | 结果 |
|---|---|
| web-access CDP | `node C:\Users\lyh\.grok\skills\web-access\scripts\check-deps.mjs` 退出码 1。Node v26.7.0 可用。浏览器未打开远程调试。未登录、未操作已有浏览器 tab。无 CDP 页面存档。 |
| 本会话 `web_fetch` | SSRF 拦截。`nodejs.org` → 198.18.0.10；`code.claude.com` → 198.18.0.11；`api.github.com` → 198.18.0.57。这些 URL 的正文改由 Exa 摘录或 `gh api` 读取。 |
| `research_prior_art.py` 第一次 | 工作目录停在仓库根。`python` 找不到 `D:\Documents\Code\Agents\my-claude-code-settings\scripts\research_prior_art.py`。退出码 1。 |
| `research_prior_art.py` 第二次 | 工作目录已改为乔木 skill 目录。命令：`python scripts/research_prior_art.py "repository test layout skill" "audit test coverage structure" --strict --summary --timeout 120 --output <本任务 research\prior-art-candidates.json>`。`subprocess` 直接 `CreateProcess("npx")`，Windows 上报 `FileNotFoundError: [WinError 2]`。异常未被脚本接住，SkillsMP 没有跑，JSON 没有写出。`--strict` 没有产生目录报告。 |
| `gh api repos/anthropics/skills/license` | HTTP 404。GitHub 未识别仓库级 license。不能把某一份 `LICENSE.txt` 推广到整个仓库。 |
| `audit-tests` 技能正文 | `gh search repos "audit-tests" --owner jeremylongshore` 与 `gh search code "name: audit-tests" --owner jeremylongshore` 无结果。未打开该技能的 `SKILL.md`。 |
| SkillsMP 第 2 页 | 两次查询都返回 `total: 11`、`hasNext: true`、`totalIsExact: false`。只读了 page 1、limit 10。 |
| 评分 | skills.sh CLI 输出只有 installs。未见 rating / review 字段。rating evidence unavailable。 |
| 「测试完善度」的官方定义 | 本次读过的 pytest、Node、Coverage.py 首页都没有给出这个术语的阈值或判定式。 |
| `functionCoverage` 是否已出现在 Node v26.5.1 已发布文档 | 只在 `nodejs/node` `main` 的 `doc/api/test.md` 里看到默认值 0。v26.5.1 的 Exa 摘录在该字段前截断。 |

乔木包 `reports/` 没有写入本次 JSON。

目录命令在脚本崩溃后改由手工跑，且没有 `npx skills add`，没有安装新 skill：

- `npx.cmd --yes skills find "repository test layout skill"`
- `npx.cmd --yes skills find "audit test coverage structure"`
- 在乔木 skill 目录：`python scripts/search_skillsmp.py "<同上两条>" --limit 10 --sort stars`

两条都在 2026-10-06 成功。SkillsMP 匿名额度：第一次剩余 daily 45 / minute 9，第二次剩余 daily 44 / minute 8。

## 证据等级

一手：官方文档站点、官方仓库里用 `gh` 读到的 raw 文件、`gh api` 的仓库元数据。

二手：Exa 对一手 URL 的摘录（页面本身是一手，通道有截断）、skills.sh / SkillsMP 的目录卡、GitCode 博客对别人仓库的转述。

安装量和仓库 star 只表示发现入口或仓库关注度。二者都不是技能正确性。跨目录的数字没有相加。

## Findings

### 目录检索：高安装量大多是词面碰撞

观察日 2026-10-06。skills.sh 两条查询的前排包括 `vercel-labs/skills@find-skills`（3.7M installs）、`mattpocock/skills@improve-codebase-architecture`（1M）、`mattpocock/skills@codebase-design`（735K）、`vercel-labs/agent-skills@web-design-guidelines`（701.6K）、`heygen-com/hyperframes@hyperframes-registry`（703.7K）、`microsoft/azure-skills@azure-compliance`（540.1K）、`lllllllama/rigorpilot-skills@minimal-run-and-audit`（450.2K）。这些名称不声称「测试文件放在哪、runner 能否收集、行为是否被断言覆盖」。本次没有打开它们的 `SKILL.md`。不把它们列入可改编短名单。

同一次输出里名字更靠近测试、但安装量低的条目：`voidmatcha/e2e-skills@playwright-test-generator` 152 installs；`katalon-labs/true-skills@test-management` 20 installs；`zcaceres/skills@test` 7 installs。未读正文。

SkillsMP 按仓库 star 排序。page 1 的 star 属于整个 GitHub 仓库。与本次工作有描述重叠的只有 `openclaw/openclaw` 的 `test-audit`（目录记录 repo_stars 391223，`catalog_updated_at` 2026-08-15）。同页的 `technical-documentation`、`github-ops`、`dsh-doc`、`audit-the-list`、`auto-qa`、`healthcheck` 等工作对象不同。`auto-qa` 的描述是对 OpenClaw 自身做持续 QA，并默认落地修复。未读其 `SKILL.md`。

没有一条高安装量 skills.sh 结果同时满足：指出测试位置、对照 runner 的发现规则、并分开报告行为完善度。

### 候选

#### pytest 官方布局与发现规则

- 来源 URL：<https://docs.pytest.org/en/stable/explanation/goodpractices.html>；对照 <https://github.com/pytest-dev/pytest/blob/9.1.1/doc/en/explanation/goodpractices.rst> 与 <https://github.com/pytest-dev/pytest/blob/9.1.1/src/_pytest/main.py>
- 日期：Exa 于 2026-10-06 摘录 stable / latest / 8.4 / 8.3 的 Good Integration Practices。`gh api repos/pytest-dev/pytest/releases/latest`：tag `9.1.1`，发布于 2026-06-19。`norecursedirs` 与 `testpaths` 的默认值读自 tag `9.1.1` 的 `src/_pytest/main.py`。rst 标题与 `test_*.py` / `*_test.py` / `importlib` / `pythonpath = ["src"]` 读自同一 tag 的 `goodpractices.rst`。
- 等级：一手。stable 网页正文经 Exa，未用 `web_fetch` 整页保存。9.1.1 源文件经 `gh`。
- 它解决的问题：pytest 如何发现测试，以及两种目录怎么放。
- 可改编的机制：
  - 无命令行参数时，从 `testpaths` 收集；未配置则从当前目录收集。`testpaths` 默认是空列表。
  - 递归时跳过 `norecursedirs`。9.1.1 默认：`*.egg`、`.*`、`_darcs`、`build`、`CVS`、`dist`、`node_modules`、`venv`、`{arch}`。设置该选项会替换默认值，文档示例写了这一点（`doc/en/reference/reference.rst` 的检索命中；默认列表本身以 `main.py` 为准）。
  - 文件名：`test_*.py` 或 `*_test.py`。类与函数另有 `test` 前缀规则。
  - 两种布局都受支持。测试放在应用代码外的 `tests/`。测试放进包内并随包分发。新项目建议 `importlib` import mode，并在默认 `prepend` 下使用 `src` 布局。`prepend` 仍是 argparse 帮助文本里的 Default。
  - `importlib` 不改 `sys.path`。`prepend` 下，测试模块名必须唯一，除非把 `tests/` 做成包；做成包后又会把仓库根放进 `sys.path`。
- 拒绝原因：这些页面定义可收集性与导入方式。它们没有定义「完善度」，也没有 agent skill 合同。不能把 `tests/` 外置布局写成唯一合法结构。本次未运行 pytest。

#### Node.js test runner 的默认文件位置

- 来源 URL：<https://nodejs.org/api/test.html>（Exa 页面标题为 v26.5.1）；<https://nodejs.org/dist/latest/docs/api/test.html>（Exa 标题 v26.5.0）；<https://beta.docs.nodejs.org/test>（Exa 标题 26.8.1）；<https://github.com/nodejs/node/blob/main/doc/api/test.md>
- 日期：2026-10-06 的 Exa 摘录彼此一致。`gh` 对 `main` 的 `doc/api/test.md` 确认了「By default, Node.js will run all files matching these patterns」以及覆盖率阈值默认值。
- 等级：文档站是一手，本次以 Exa 摘录读取。`main` 文档片段是一手 raw。未执行 `node --test`。
- 它解决的问题：不传文件参数时，`node --test` 会跑哪些路径；覆盖率数字如何变成失败。
- 可改编的机制：三份文档摘录给出同一组默认 glob。JavaScript：
  - `**/*.test.{cjs,mjs,js}`
  - `**/*-test.{cjs,mjs,js}`
  - `**/*_test.{cjs,mjs,js}`
  - `**/test-*.{cjs,mjs,js}`
  - `**/test.{cjs,mjs,js}`
  - `**/test/**/*.{cjs,mjs,js}`
  - 未传 `--no-strip-types` 时，另有对应的 `cts` / `mts` / `ts` 六组。
  - 自定义 glob 是传给 `node` 的最后参数，并遵循 `glob(7)`。文档要求命令行上用双引号，避免 shell 展开。
  - `--test-name-pattern` 只过滤已经选中的测试名。Exa 对 GitHub 文档的摘录写明：测试名模式不改变 runner 执行的文件集合。
  - `--experimental-test-coverage` 才收集覆盖率。默认不计入 Node 核心模块和 `node_modules/`。匹配到的测试文件默认排除出覆盖率报告。`lineCoverage` 与 `branchCoverage` 的默认值在摘录和 `main` raw 里都是 0，未达标时进程退出码 1。`functionCoverage` 默认 0 只在 `main` raw 中确认。
- 拒绝原因：这是发现规则与可选阈值，不是完善度定义。默认 0 表示「开了覆盖率也不自动因百分比失败」。`*.spec.js` 不在上表。`__tests__/` 只有在文件名同时命中其他模式时才会跑；目录名 `test` 才会触发 `**/test/**/*.{cjs,mjs,js}`。本次没有用 Node 二进制验证这条推断，推断只来自 glob 字面。

#### Anthropic：技能作者指南、Claude Code skills、skill-creator

- 来源 URL：
  - <https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices>
  - <https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices>
  - <https://code.claude.com/docs/en/skills>
  - <https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md>
  - <https://github.com/anthropics/skills/blob/main/skills/skill-creator/references/schemas.md>
  - <https://github.com/anthropics/skills/blob/main/skills/skill-creator/agents/grader.md>
  - 仓库目录：`gh api repos/anthropics/skills/contents/skills`，2026-10-06
- 日期：仓库 `pushed_at` 2026-10-05。`stargazers_count` 179864（`gh api` 当日）。best-practices 与 code.claude.com 为 Exa 摘录，页面未标发布日期。skill-creator 的字段名用 `gh` raw 的 `Select-String` 核对，未把全文抄入本文。
- 等级：一手。code.claude.com 与 best-practices 是摘录，有截断。
- 它解决的问题：怎么写一个 Agent Skill，以及怎么评估这个技能是否改变了模型行为。仓库列表里没有以仓库测试布局为对象的技能。19 个目录名：`academy-guide`、`algorithmic-art`、`brand-guidelines`、`canvas-design`、`claude-api`、`discernment-nudge`、`doc-coauthoring`、`docx`、`frontend-design`、`internal-comms`、`mcp-builder`、`pdf`、`pptx`、`skill-creator`、`slack-gif-creator`、`theme-factory`、`web-artifacts-builder`、`webapp-testing`、`xlsx`。
- 可改编的机制：
  - 技能包布局：`SKILL.md` 为入口；参考文件从 `SKILL.md` 直链，一层深度；可执行脚本与会被读入上下文的说明分开。best-practices 把 `SKILL.md` 正文控制在 500 行以内写成作者建议。
  - Claude Code 文档把技能目录放在企业托管设置、`~/.claude/skills/`、项目 `.claude/skills/`、插件 `skills/`。这是技能安装位置。它不规定产品仓库的 `tests/` 位置。
  - 评估对象分成两件：技能有没有在该触发的 prompt 上被调用；调用之后输出是否符合预期。比较方式是干净会话里「有技能」对「无技能」。
  - best-practices 的评估顺序：先找出没有技能时的失败，写约三个场景，建立无技能基线，再写刚好够用的说明。同一摘录写明：平台目前没有内建的评估运行器，用户自己建。
  - skill-creator 的 `SKILL.md` 把用例先写入 `evals/evals.json`，断言后补；运行目录区分 `with_skill/outputs` 与 `without_skill/outputs`；`grading.json` 的条目使用 `text`、`passed`、`evidence`。能用程序检查的断言用脚本，不靠目测。分析步骤要标出「有没有技能都通过」的断言。
  - `references/schemas.md` 的检索命中把用例字段写成 `evals[].expectations`。同一技能的 `SKILL.md` 把后补字段叫作 `assertions`。两份文件同时在 `main`。本次未判定 viewer 读哪一个字段。
  - grader 要求 PASS 有具体证据，并拒绝只满足表面条件的结果。它同时要求指出断言本身的漏洞。
- 拒绝原因：这套机制评估的是技能。仓库 CI 评估的是产品测试是否被 runner 执行并通过。把 `evals/evals.json` 当成产品测试目录，或把「三个场景」当成仓库完善度，都换了对象。GitHub license API 404。`skills/skill-creator/LICENSE.txt` 开头是 Apache License 2.0；该文件只覆盖这份技能，不自动覆盖仓库内其他技能。best-practices 写 description 上限 1024 字符；code.claude.com 摘录写技能列表里 description 与 when_to_use 合计在 1536 字符截断。两处同时公开，本次未核对各自更新时间。

#### agentskills.io 的技能输出评估

- 来源 URL：<https://agentskills.io/skill-creation/evaluating-skills>
- 日期：Exa 摘录，2026-10-06。页面未给出发布日期。code.claude.com 摘录把「Evaluating skill output quality」指到 agentskills.io。
- 等级：被 Claude Code 文档点名的说明页。本次只有 Exa 摘录，没有整页存档。与 skill-creator 仓库的字段名不完全相同，见上一条。
- 它解决的问题：一个技能的输出是否稳定地好于没有该技能。
- 可改编的机制：手写文件主要是 `evals/evals.json`。`grading.json`、`timing.json`、`benchmark.json` 是运行产物。断言在看见第一轮输出之后再写。`benchmark.json` 汇总 with_skill 与 without_skill 的通过率、时间、token，并给出 delta。机械检查优先用脚本。摘录写 skill-creator 能自动化其中一大部分。
- 拒绝原因：示例字段用 `assertions`。anthropics/skills 的 `schemas.md` 检索命中用 `expectations`。在字段名对齐之前，不能把任一份示例当成唯一 schema。该页不审计产品仓库的测试树。

#### addyosmani/agent-skills 的三层技能评估

- 来源 URL：<https://github.com/addyosmani/agent-skills/blob/main/evals/README.md>
- 日期：`gh api` 仓库元数据，2026-10-06：`pushed_at` 2026-10-03，stars 101733，license MIT，fork false。README 前段由 `gh` raw 读取。PR #342 的讨论页经 Exa，是设计说明，不是 main 的当前数字。
- 等级：该仓库的一手 README。它转述 Anthropic skill-creator 与 obra superpowers，并声明 Tier 2 是自己补上的。
- 它解决的问题：一个多技能目录里，技能是否会被触发、描述是否互相碰撞、代理跟着技能做时是否满足 `expectations[]`。
- 可改编的机制：README 当前表格把 Tier 1（结构）和 Tier 2（触发与路由）放进 CI，成本为免费；Tier 3（行为）按需运行，消耗 token，不进 CI。Tier 2 是对 description 的词干 TF-IDF，README 写明它不能判断语义。Tier 2 失败时，README 的结论是改 description。main 上的命令示例是 `node scripts/run-evals.js --min-rank1 95`。行为评估使用一次性 git 仓库和 `evals/fixtures/`。`kind: dialogue` 被写成人工豁免，不是执行类技能的通用出口。
- 拒绝原因：评估对象仍是技能目录，不是任意产品仓库的 pytest / node:test 树。README 里的 `claude plugin eval`、Claude Code 2.1.269 / 2.1.278、claude-opus-5 触发率，本次没有对照 Claude Code 官方发布说明。那些数字只属于这篇 README 的自述。不要把这篇 README 的通过率阈值搬到产品测试覆盖率。

#### 阿里巴巴 skill-up（中文项目文档）

- 来源 URL：<https://alibaba.github.io/skill-up/zh/guide/writing-evals>；仓库 <https://github.com/alibaba/skill-up>
- 日期：`gh api` 2026-10-06：描述 “An evaluation and evolution tool for Agent Skills.”，homepage 即上述站点，license Apache-2.0，`pushed_at` 2026-10-05，stars 1139。正文来自 Exa 对文档站的摘录，未保存整页。
- 等级：该项目的一手文档。它不是 pytest 或 Node 的中文规范，也不是法规。
- 它解决的问题：给一个 Skill 配可重复的评测包：环境、引擎、用例、门槛检查、质量判断。
- 可改编的机制：评测文件放在技能目录的 `evals/`。`eval.yaml` 为入口；`cases/` 为用例；`fixtures/` 可含仓库模板、补丁、脚本。文档摘录写明评测框架目录 `evals/` 始终排除在技能安装内容之外。`expect` 是本地门槛（退出码、文件是否存在、字面包含），失败则跳过 `judge`。`judge` 可以是规则、脚本或 `agent_judge`。摘录建议先用确定性检查，只把需要语义判断的部分交给会消耗 token 的 judge。
- 拒绝原因：这里的「仓库」是评测 fixture，不是对任意业务仓库做测试布局审计。摘录没有把这套评测定义成 CI。不能用这篇中文文档填补「测试完善度」的官方定义。

#### GitCode 博客（二手，且与当前 README 不一致）

- 来源 URL：<https://blog.gitcode.com/91124cb04a66b2cb2b791c9cf474901d.html>
- 日期：Exa 给出的发布日期 2026-09-08。
- 等级：二手转述。正文自称依据某 agent-skills 仓库的 CONTRIBUTING、skill-anatomy、evals/README。结构与 `addyosmani/agent-skills` 的 `evals/README.md` 同族。
- 它解决的问题：向读者说明给该仓库贡献技能时要交哪些文件。
- 可改编的机制：无。需要的区分已经在该仓库 README 的一手文本里。
- 拒绝原因：博客写 Tier 2 的 CI 地板是 `--min-rank1 80`。2026-10-06 用 `gh` 读到的 main README 示例是 `--min-rank1 95`。博客不能当作当前合同。

#### microsoft dotnet/skills：`test-quality-auditor`

- 来源 URL：<https://github.com/dotnet/skills/blob/main/plugins/dotnet-test/agents/test-quality-auditor.agent.md>
- 日期：`gh api` 2026-10-06：license MIT，`pushed_at` 2026-10-06，stars 5562，fork false。agent 文件前 35 行由 `gh` raw 读取。插件目录同时有 `skills/` 与 `agents/`。
- 等级：一手。这是 agent 文件，不是 `SKILL.md`。正文只读了开头。
- 它解决的问题：对已有测试套件做有边界的健康评估。聚焦请求走单一专家；宽请求才合并多个维度。
- 可改编的机制：诊断与改写分开。开头写明不要用来编写、生成或修复测试；修复走另一个公开技能。未得到用户单独的修复请求时，不编辑生产代码和测试文件。维度表把弱断言、反模式、正式 smell、缺口、覆盖率、CRAP、标签分成不同入口。覆盖率一行写明 .NET 用 `coverage-analysis`，其他语言用原生工具。
- 拒绝原因：默认问题域是 .NET 测试质量，不是「文件是否落在 pytest / node:test 能发现的位置」。未读后续专家技能，不能把它们的阈值当成通用完善度。仓库 star 不是这个 agent 的安装量。

#### NickCrew/Claude-Cortex：`test-review`

- 来源 URL：<https://github.com/NickCrew/Claude-Cortex/blob/HEAD/skills/test-review/SKILL.md>
- 日期：`gh api` 2026-10-06：license MIT，`pushed_at` 2026-06-29，stars 50，fork false。机制来自 Exa 对该 blob 的摘录，未用 `gh` 重拉全文，也未读它引用的 `audit-workflow.md`。
- 等级：技能正文的摘录。仓库元数据是一手。
- 它解决的问题：先读项目自己的测试标准，再审计某模块的测试缺口。产出是报告。
- 可改编的机制：摘录中的状态是 Covered、Shallow、Missing。Shallow 表示测试碰到了行为但没有真正核验。流程要求读源码来列公开行为，再读测试。输出在审阅前不写测试实现。发现步骤与定优先级的步骤分开。
- 拒绝原因：摘录把发现工作派给固定的 Haiku 子 agent，并把标准文件放在该仓库的 `skills/agent-loops/references/`。这两处是该仓库的耦合。未核对共享标准文件是否存在、许可证是否允许整段复用。star 50 是仓库 star。

#### openclaw `test-audit`

- 来源 URL：<https://github.com/openclaw/openclaw/blob/main/.agents/skills/test-audit/SKILL.md>
- 日期：SkillsMP `catalog_updated_at` 2026-08-15。SkillsMP 记录的 repo_stars 391223 是整个 openclaw 仓库，观察日 2026-10-06。`SKILL.md` 前 50 行由 `gh` raw 读取。license 本次未读。
- 等级：一手技能开头。后面的 junk pattern 清单未读完。
- 它解决的问题：新测试该不该加，以及已有测试里哪些只是在重复实现、没有独立契约。
- 可改编的机制：完善度被写成行为合同，而不是文件数量或行覆盖率。摘录中的四个问题：保护的可观察行为是什么；怎样的回归会让它失败；现有测试为什么接不住这个失败；它是否要求一个生产代码不需要的测试专用缝。会因保持行为的重构而失败的测试，被标成在断言实现。无断言的覆盖率探针被列入 junk pattern 的开头。审计模式可以另开 PR，目标写成信心，不写成删除数量。
- 拒绝原因：它不判定测试目录是否符合 pytest 或 `node --test` 的发现规则。Campaign 模式会修剪测试面，那是改仓库的模式。parent repo 的 star 不能当成这个技能的质量分。license 未核实，不能复制原文。

#### jovd83/stack-aware-unit-testing-skill

- 来源 URL：<https://github.com/jovd83/stack-aware-unit-testing-skill>
- 日期：`gh api` 2026-10-06：license MIT，`pushed_at` 2026-09-28，stars 0，fork false。机制来自 Exa 对仓库说明的摘录。`SKILL.md` 与 `scripts/detect-test-context.ps1` 本次未读。未执行该脚本。
- 等级：README 级。检测规则的具体实现是 missing evidence。
- 它解决的问题：识别仓库已有的测试栈，再决定单元测试怎么写。
- 可改编的机制：摘录写明先检查仓库，沿用已有框架和本地约定；已有更精确的技能时移交；脚本接受目标根路径，查找常见生态、测试文件和测试目录，并可输出 JSON。`evals/fixtures/` 覆盖多语言小仓库。说明文字要求不悄悄改生产代码。
- 拒绝原因：技能同时承担编写测试。stars 0 只说明仓库关注度，不说明检测逻辑对错。在读脚本之前，不能采用它的文件名规则。PowerShell 检测器也未被审计。

#### boshu2/agentops 的 `skills-codex/test`

- 来源 URL：<https://github.com/boshu2/agentops/blob/main/skills-codex/test/SKILL.md>
- 日期：`gh api` 2026-10-06：license Apache-2.0，`pushed_at` 2026-10-06，stars 447，fork false。正文为 Exa 摘录，未全文重拉。
- 等级：技能摘录。
- 它解决的问题：生成测试、跑测试，并留下覆盖率或 TDD 记录。
- 可改编的机制：摘录把原始覆盖率、缺口清单和摘要分成不同文件。语言相关的测试文件仍放在目标仓库自己的位置。
- 拒绝原因：工作流是红灯测试、实现、再重构，并写入 `.agents/scratch/tests/`。这是生成与改代码。它不提供「只报告位置与完善度」的停止条件。

#### anthropics/skills `webapp-testing`

- 来源 URL：<https://github.com/anthropics/skills/blob/main/skills/webapp-testing/SKILL.md>
- 日期：2026-10-06，`gh` raw 前 60 行。frontmatter 写 `license: Complete terms in LICENSE.txt`。该 `LICENSE.txt` 未打开。
- 等级：一手开头。
- 它解决的问题：用 Playwright 检查本机 Web 应用的界面行为。
- 可改编的机制：无用于本次问题的部分。它选择静态 HTML 或已运行服务器，再写 Playwright 脚本。
- 拒绝原因：对象是浏览器里的页面，不是仓库测试树，也不是 pytest / `node --test` 的发现规则。

#### Intent Solutions `audit-tests` 与 audit-harness

- 来源 URL：目录页 <https://tonsofskills.com/skills/audit-tests/>（Exa）；harness 仓库 <https://github.com/jeremylongshore/intent-audit-harness>（Exa 同时出现 `jeremylongshore/audit-harness` 这个标题，元数据同为创建于 2026-04-22、Apache-2.0、stars 1）。
- 日期：harness 创建时间 2026-04-22（Exa 的仓库卡）。技能 `SKILL.md` 的 GitHub 路径本次未找到。
- 等级：目录页是二手。harness README 摘录可视为该工具仓库的一手说明，但不能代替技能正文。
- 它解决的问题：目录页描述一套七层测试分类、确定性门禁、RTM，并在有缺口时交给 `implement-tests`。harness 摘录描述的是哈希锁定与 escape-scan，用来拒绝降低阈值、删除测试或绕过架构规则的改动。
- 可改编的机制：在未读技能正文之前，不采用。harness 把「工程师拥有的策略文件」和「检测这些文件被悄悄改掉」分开，这一区分只作为未验证线索。
- 拒绝原因：技能源文件缺失。目录页还要求特定的 `@intentsolutions/audit-harness`、等级分数，以及有 P0/P1 时强制移交给会改仓库的技能。这些条件使它不能当作布局先验。stars 1 同样不是质量分。

#### Coverage.py 首页

- 来源 URL：<https://coverage.readthedocs.io/en/latest/index.html>
- 日期：Exa 摘录，2026-10-06。未读 FAQ。
- 等级：一手首页的摘录。
- 它解决的问题：测量哪些行或分支被执行过。
- 可改编的机制：摘录写明 Coverage.py 默认不区分测试与被测代码；可用 `--source` 把从未执行的文件也标出来。pytest 的集成点是 pytest-cov 插件，不是 pytest 核心。
- 拒绝原因：首页没有把某个百分比定义成完善。未执行文件可以被标成 0，这仍是执行记录，不是行为合同。

#### Phoenixrr2113/agent-harness 的 skill-evals 文档

- 来源 URL：<https://github.com/Phoenixrr2113/agent-harness/blob/main/docs/skill-evals.md>
- 日期：Exa 摘录，2026-10-06。未用 `gh` 重读。
- 等级：二手通道上的第三方仓库文档。
- 它解决的问题：该 harness 如何把技能的触发评估和质量评估分开。
- 可改编的机制：摘录写 CI 只校验 `triggers.json` / `evals.json` 的 schema，不执行真实模型调用。触发失败与质量失败对应不同的修改位置（description，或工作流 / 脚本）。
- 拒绝原因：未全文核对。文中还写 runner 目前可以返回乐观常量。不能把该仓库的 0.85 通过率当成外部标准。

### 技能 eval 与仓库 CI：已读材料里的分界

这些句子来自不同一手材料，对象不同。

- pytest 与 `node --test` 决定哪些文件会被测试进程收集，以及进程以什么退出码结束。
- Node 的行 / 分支覆盖率阈值是可选门禁，已读默认值为 0。pytest 核心文档没有给出完善度百分比。
- skill-creator、agentskills.io、code.claude.com 比较的是同一 prompt 在有技能与无技能时的输出。
- addyosmani/agent-skills 的 README 把不花 token 的结构与路由检查放进 CI，把会调用模型的行为评估留在 CI 外。
- skill-up 的摘录把零 token 的 `expect` 放在会调用模型的 `judge` 之前。
- 平台 best-practices 摘录仍写「没有内建评估运行器」。Claude Code 文档与 skill-creator 描述了可选的技能评估循环。两套说法同时存在。

中文检索没有找到 pytest 官方中文版。Node 中文译本本次未打开。skill-up 是中文项目文档。GitCode 博客是过期转述。

### 编码代理实际怎么放测试

已读的代理技能没有一份一手规范写着「所有代理都必须把测试放在 `tests/`」。能核对的约定是：

- 语言 runner 的发现规则（pytest 9.1.1 与 Node 文档）决定文件在不在默认命令里。
- stack-aware 的 README 摘录要求先检测仓库已有约定。该脚本未读。
- openclaw `test-audit` 与 dotnet `test-quality-auditor` 都从「已有测试在测什么」出发，不从统一目录名出发。
- Anthropic 的目录图是技能包目录，不是产品测试目录。

因此「代理常用 Jest 的 `__tests__` 或 `*.spec.js`」本次没有一手代理规范可引用。Node 默认 glob 本身不包含 `*.spec.js`。

## keep / adapt / reject / invent

### keep

- pytest 9.1.1：两种布局都合法；发现文件名是 `test_*.py` 与 `*_test.py`；`testpaths` 默认为空；`norecursedirs` 有明确默认列表；`prepend` 仍是默认 import mode，`importlib` 与 `src` 布局是新项目建议。
- Node 文档：无参数时的六组 JavaScript glob，加上未关闭类型剥离时的 TypeScript glob；测试名过滤不改变文件集合；覆盖率阈值默认不构成百分比门禁。
- 三件不同的观察要分开记录：文件在树上的位置；默认 runner 命令会不会收集它；断言是否核验了行为。
- 技能评估使用干净的有技能 / 无技能对照，并且 PASS 要带证据。
- 诊断输出可以停在报告。dotnet auditor 与 `test-review` 摘录都把「写测试」放到明确的后续请求。

### adapt

- `test-review` 的 Covered / Shallow / Missing。不带走它的固定子 agent 型号和外部参考路径。
- openclaw `test-audit` 开头的四个问题，用来描述行为完善度。不带走 Campaign 修剪模式。
- skill-creator 对「有没有技能都通过」的断言的警告。对应到仓库时，只表示文件存在或行被执行过，还没有证明行为被核验。
- addyosmani README 与 skill-up 的共同顺序：先做不消耗模型调用的结构或门槛检查，再决定要不要做消耗 token 的行为判断。不带走 `--min-rank1 95`、TF-IDF 或 `eval.yaml` schema。
- stack-aware README 的顺序：先识别现有框架和测试目录。不执行、不复制其 PowerShell。
- Node `**/test/**` 与 pytest `norecursedirs` 说明「目录里有测试文件」和「默认命令会执行它们」是两次判断。

### reject

- 把 skills.sh installs 或 SkillsMP repo star 当作质量分，或把二者相加。
- skills.sh 前排里未读、且名称不覆盖本问题的技能，包括 `find-skills`、`improve-codebase-architecture`、`web-design-guidelines`、`minimal-run-and-audit`。
- `webapp-testing`：Playwright 本机页面。
- agentops `test` 技能：TDD 改写循环和 `.agents/scratch/tests/` 产物合同。
- `audit-tests`：技能正文缺失；目录页要求专用 harness，并在缺口存在时移交会改仓库的技能。
- 把 skill-creator、agentskills.io 或 addyosmani 的技能评估包，当作产品仓库的测试布局。
- GitCode 博客上的 `--min-rank1 80`。main README 已是 95。
- 把 `tests/` 外置写成唯一合法布局。
- 把覆盖率百分比写成完善度。已读官方页没有这个定义。
- 在未审计的情况下执行第三方技能脚本。

### invent

公开材料里没有一份已读技能同时做完这三件事：标出测试文件的位置与目录形态；对照 pytest 与 `node --test` 的发现规则指出哪些文件不会被默认命令收集；用行为合同而不是覆盖率百分比说明完善度。

现有材料分成三堆。语言官方文档负责发现规则。测试审计技能负责已有测试的断言质量或低价值测试。Anthropic、agentskills.io、addyosmani、skill-up 负责技能自身的 eval，并把它和 CI 的成本分开。

「文件存在，但默认 runner 不收集」与「套件看起来完整」之间的连接，在本次读过的 `SKILL.md` 里没有现成合同。这是缺口记录，不是本仓库的实现步骤。

## Related Specs

- `.agents/skills/qiaomu-meta-skill/references/prior-art-research.md`：本次使用的先验方法。安装量不是满意度或正确性；短名单要分流行度锚点、信任锚点和互补专长；合成用 keep / adapt / reject / invent。
- 本次没有把结论写入 `.trellis/spec/`。

## Caveats / Not Found

- 乔木统一脚本没有产出 `research/prior-art-candidates.json`。原因是 Windows 上 `CreateProcess("npx")` 失败。手工 `npx.cmd` 与 `search_skillsmp.py` 成功，所以目录证据仍在，但没有脚本的合并 JSON。
- CDP 与 `web_fetch` 失败后，code.claude.com、agentskills.io、skill-up、Coverage.py、若干技能正文只有 Exa 摘录。
- skill-creator 的 `assertions` 与 `schemas.md` 的 `expectations` 尚未对齐。
- `functionCoverage` 默认 0 只确认到 Node `main` 文档。
- openclaw `test-audit` 的 license、stack-aware 的检测脚本、`audit-tests` 的 `SKILL.md`、addyosmani README 后半与 Claude Code 插件评估命令，都没有完成全文核对。
- 未找到「测试完善度」的官方定义。
- 未找到要求编码代理统一使用某一测试目录名的一手规范。
