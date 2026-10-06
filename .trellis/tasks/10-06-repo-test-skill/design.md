# Design: repo-test-audit

## Boundaries

父任务保存契约和集成顺序。两个子任务各自实现，各自可验收。

- `10-06-repo-test-audit-package` 拥有 `skills/development-workflows/repo-test-audit/**`。
- `10-06-repo-test-audit-backfill` 拥有 `justfile`、根 `AGENTS.md` 的 CI 列举、`scripts/check_skill_evals.py`、各类目 `AGENTS.md` 里被本契约改写的句子，以及除新 skill 以外的测试补齐。
- `code-auditor` 继续只读审查 diff / PR / 全维度审计。本 skill 不读取它的严重级别表，也不写 `docs/audits/`。

## Report Contract

一次审计输出三列，每列都要有路径或命令证据。

| 列 | 问题 | 本仓库的判定来源 |
| --- | --- | --- |
| 位置 | 测试文件在哪，目录名是什么 | 文件 walk。技能内 `tests/` 与 `scripts/` 并列。仓库级测试只认已经存在的 `scripts/test_install_projects.py`、`docs/scripts/test_sync_docs_catalog.py`、`platforms/claude/hooks/tests/` |
| 收集 | 声明的 runner 会不会执行它 | 解析 `justfile` recipe 正文。`node-test` 收集路径分量含 `tests` 且以 `.mjs` 结尾的文件。`python-test` 收集 recipe 里写出的 discover 根。`python-check` 标成编译，不标成测试通过 |
| 行为 | 断言是否核验可观察结果 | Covered：收集到的测试断言输出、退出码或数据结构。Shallow：只断言文件存在或只做编译。Missing：有脚本或有约定要求的路由句，但没有被收集的断言 |

完善度不用行覆盖率。pytest 9.1.1 与 Node 文档都没有把百分比定义成完善度。

状态词只用 Covered、Shallow、Missing。说明型 skill 的路由测试断言 `description` 排除句和 eval 负例文本，状态最高是 Covered（路由文本被锁住）。它不证明模型会这么路由。报告里把模型路由写成 missing evidence。

## Runner Parsing

盘点脚本读取目标根的 `justfile`：

- 从 `python-test` recipe 提取 `unittest discover -s <dir>` 的目录。
- 把 `node-test` 视为收集 `skills/**/tests/*.mjs`。实现若改成别的 glob，脚本改为读 recipe 里的字面量，不用第二套硬编码。
- `install-projects-test` 与 `docs-check` 里的具名测试文件单独列入「已收集」。
- `evals-check` 列入「已收集的是 schema，不是模型评分」。
- 目标根没有 `justfile` 时，脚本只列文件位置，收集列写 `runner-not-declared`。不套用 pytest 或 Node 默认 glob 作为该仓库的事实。skill 正文可以另起一节，标明「若采用上游默认发现规则，这些文件名会落在外面」，并引用 pytest 的 `test_*.py` / `*_test.py` 与 Node 的六组 JavaScript glob。

脚本不写文件，不跑被测仓库的测试进程，不访问网络。脚本看到断言关键字时把 `behavior` 标为 `needs-review`，不自动写成 Covered。Covered 与 Shallow 的最终判定写在审计报告里。

## CI Shape After Backfill

`just ci` 八步，顺序保持现有七步的相对位置，把新步骤插在 `node-test` 之后、`git diff --check` 之前：

1. `docs-check`
2. `skills-check`
3. `python-check`
4. `python-test`
5. `install-projects-test`
6. `node-test`
7. `evals-check`
8. `git diff --check`

`python-test` 发现这些根，任一失败则 recipe 非 0：

- `platforms/claude/hooks/tests`
- `skills/` 下每个含 `test_*.py` 的 `tests/` 目录

不递归进 `.agents/`、`.claude/`、`.trellis/`、`node_modules/`、`ref/`。

`evals-check` 调用 `python scripts/check_skill_evals.py`。规则：

- 每个 `skills/<category>/<skill>/SKILL.md` 旁必须有 `evals/evals.json`。
- JSON 对象含 `skill_name` 与 `evals` 数组。`skill_name` 等于目录名。
- 每个元素含 `id`、`prompt`、`expected_output`、`files`、`assertions`。`assertions` 是非空字符串数组。
- 不新增 `expectations` 字段。Anthropic `schemas.md` 与本仓库 git-commit schema 的字段名尚未在上游对齐；本仓库继续用 `assertions`。
- 不扫描自由文本来猜测「这是不是路由负例」。路由负例的可执行锁在 14 个 skill 自己的 `*.test.mjs` 里，每条断言写明排除对象。

## Test Backfill Shape

| 对象 | 测试形式 | 不测什么 |
| --- | --- | --- |
| `code-auditor` 三个 Python 脚本 | 该 skill `tests/test_*.py`，导入纯函数或用临时规则文件走子进程 | 不跑完整仓库审计 |
| `gh-bootstrap` `gh_bootstrap_runtime.py` | 临时目录上的 `detect` 与 `render-template` | `fetch-template` 的网络克隆 |
| `job-application-kit` `verify_pdf.py` | `parse_page_count` 与缺命令时的 `VerificationError` | 不调用本机 `pdfinfo` |
| `renhua` `renhua_lint.py` | 对固定短文本断言命中的 pattern 名 | 不把整份文风指南重写成测试 |
| `humanizer-paper`、`paper-workbench` | 把现有 `def test_*` 收进 `unittest.TestCase`。`tmp_path` 改为 `tempfile`。`monkeypatch` 改为 `unittest.mock` | 不保留 pytest fixture 注入 |
| 14 个说明型 skill | 各自 `tests/<slug>.test.mjs`，只读本 skill 的 `SKILL.md` 与 `evals/evals.json` | 不导入其他 skill 的脚本 |
| `repo-test-audit` | 夹具仓库上的盘点脚本测试，覆盖「文件在、recipe 不收集」 | 不把当前 34 个 skill 的快照写死成断言 |

14 个说明型 skill 若现有 eval 里还没有两条点名排除对象的 `assertions`，在该 skill 的 `evals/evals.json` 追加，不改已有用例的 `id`。

## Skill Package

```text
skills/development-workflows/repo-test-audit/
├── SKILL.md
├── README.md
├── agents/interface.yaml
├── evals/evals.json
├── evals/trigger_cases.json
├── references/report-contract.md
├── references/this-repo-runners.md
├── scripts/inventory_tests.py
├── tests/inventory_tests.test.mjs
└── reports/
```

`SKILL.md` 命令使用 `<skill-dir>/scripts/inventory_tests.py` 这一占位写法。`allowed-tools` 用逗号分隔字符串。`development-workflows/AGENTS.md` 的技能名单加入 `repo-test-audit`，并删掉「只产出对话就可以没有测试」这句；evals 改为由 `just evals-check` 做 schema 检查，模型评分仍不在 CI。

盘点脚本的测试使用 `tests/fixtures/` 里的小型假仓库。假仓库不放进技能安装内容的说明里当用户数据。

## Compatibility

- `.github/workflows/agentkit-desktop.yml` 已执行 `just ci`。新步骤跟着进去，不改 workflow 矩阵。
- 根 `AGENTS.md`、`justfile` 的「步骤 N/7」字符串、`skills/AGENTS.md`、`skills/development-workflows/AGENTS.md`、`skills/research-learning-knowledge/AGENTS.md`、`humanizer-paper` 文档里的 pytest 可选句，在 backfill 子任务一次改完。
- 新 skill 的 frontmatter 会改变 docs catalog。package 子任务运行 `just docs-sync`，生成页随该子任务提交。生成页保持 LF。
- 同类仓库里「evals 不进 CI」是它们的现状。本仓库按已批准的决定改成本地 schema 门禁。skill 报告必须先读目标仓库自己的入口，不能把本仓库的新门禁写成所有仓库的规则。

## Rollback

- package 子任务回滚：删除 `skills/development-workflows/repo-test-audit/`，并还原 `docs/` 里 catalog 生成结果。
- backfill 子任务回滚：还原 `justfile`、`scripts/check_skill_evals.py`、约定文档，以及列出的测试文件。两份 pytest 风格文件在改写前以当时的 git blob 为还原点。

## Trade-Offs

- schema 检查会让缺字段的旧 eval 在 CI 失败。处理方式是补字段，不放宽检查器。
- 路由测试锁的是文本，不是模型行为。这是零 token CI 做得到的部分。
- 盘点脚本不执行测试进程，所以它不能把「收集到」说成「已经通过」。通过与否留给 `just ci`。
