# design-md 实施计划

前置：`prd.md` 的 A1–A4 已由用户确认或修订；`task.py start` 已执行。

所有路径相对仓库根。`SKILL_DIR = skills/development-workflows/design-md`。Windows 下 Python 命令前加 `PYTHONUTF8=1`。

## 步骤

### 1. 先行研究记录

- [x] 用 qiaomu 的 `search_skillsmp.py` 搜 2–3 个查询（"DESIGN.md design system catalog"、"design style picker frontend"、"brand inspired design tokens"）。`npx skills find` 在 Windows 子进程会报 WinError 2，不用。
- [x] 结果写入 `research/prior-art.md`：候选、指标来源、keep / adapt / reject。网络失败时记为 `missing evidence`，不阻塞后续步骤。

### 2. 类别定义

- [x] 写 `SKILL_DIR/assets/catalog/categories.json`，内容按 `design.md` §2.2 两张表。

### 3. 构建脚本与测试（先测试）

- [x] 写 `SKILL_DIR/tests/test_build_catalog.py`（临时目录夹具，见 `design.md` §8）。
- [x] 写 `SKILL_DIR/scripts/build_catalog.py`（`design.md` §3）。
- [x] `just python-check` 与 `python -m unittest discover -s SKILL_DIR/tests -p "test_build*.py"` 通过。

### 4. 生成目录资产

- [x] 运行：

```bash
PYTHONUTF8=1 python skills/development-workflows/design-md/scripts/build_catalog.py --design-md ref/repo/awesome-design-md --design-skills ref/repo/awesome-design-skills --out skills/development-workflows/design-md/assets/catalog
```

- [x] 核对 stdout：品牌 84、风格 67、未分类 0；`git diff --check` 无输出。
- [x] 抽查 `styles/minimal.md`、`styles/claude.md`、`brands/kraken.md`（legacy）、`brands/slack.md`。

回滚点 A：删除 `assets/catalog/brands`、`assets/catalog/styles`、`index.json` 后重跑。

### 5. 运行时 CLI 与测试（先测试）

- [x] 写 `SKILL_DIR/tests/test_design_catalog.py`（`design.md` §8）。
- [x] 写 `SKILL_DIR/scripts/design_catalog.py`（`design.md` §4）。
- [x] 测试通过；手工运行 `list`、`search 极简`、`show brand:claude`、`apply brand:vercel --root <scratchpad 临时目录>` 并查看输出。

### 6. references

- [x] `references/design-system-core.md`、`design-md-format.md`、`implementation.md`、`brand-boundary.md`，按 `design.md` §6。每个文件开头一句说明用途，结尾注明上游出处与 MIT。

### 7. SKILL.md、README、interface、evals

- [x] `SKILL.md`：frontmatter（R1、R2）；正文 = 适用/不适用 → 命令表（`"<skill-dir>/scripts/design_catalog.py"` 占位写法 + `python` / `py -3` 回退说明）→ `design.md` §5 的 8 步工作流 → references 索引。规则正文不重复 references。
- [x] `README.md`：用途、安装（`just install-projects` 与 `npx skills add`）、示例请求（中英各 3 条）、18 个类别概览表（类别名 + 数量）、输出、限制、来源与许可（两个仓库、commit、MIT）。
- [x] `agents/interface.yaml`。
- [x] `evals/evals.json`：正例 ≥5（列目录、按氛围推荐、指定品牌写入 DESIGN.md、已有 DESIGN.md 时按其实施、已有 DESIGN.md 时要求更换风格需 `--force` 备份），反例 ≥2（HTML 报告 → `html-artifact`；截图复刻 → `image-to-ui-skill`）。

### 8. 仓库集成

- [x] `skills/development-workflows/AGENTS.md` 首段 skill 列表加入 `design-md`。
- [x] 检查 `skills/code_map.md` 是否按 skill 列举；若是，补一行。
- [x] `just docs-sync`，检查生成 diff 只涉及新 skill 与目录计数。

### 9. 验证

```bash
just skills-check
just python-check
just python-test
just evals-check
just docs-check
just ci
```

- [x] 全部通过后，用 `git status --porcelain -uall` 确认新文件都被列出（仓库设置 `status.showUntrackedFiles=no`）。
- [x] 运行时验证：在 scratchpad 建一个最小 HTML 页面，按 `apply` 写入的 DESIGN.md 实施一个 hero + 按钮 + 卡片，用浏览器打开截图，核对 token 生效。记录结果到 `research/runtime-check.md`。

### 10. 收尾

- [ ] 走 Trellis 3.3（spec 已更新；提交待用户确认）（spec 更新：若出现可复用约束，如"资产不得命名为 SKILL.md"，写入 `.trellis/spec/guides/skill-authoring-conventions.md`）与 3.4（提交，Conventional Commits，例如 `feat(skills): ✨ add design-md design system skill`）。提交前等待用户确认。

## 审阅门

- 步骤 4 之后：确认资产数量与抽查结果再写 CLI。
- 步骤 9 之后：`just ci` 输出全绿才进入收尾。

## 回滚

- 整体回滚：删除 `SKILL_DIR`，还原 `skills/development-workflows/AGENTS.md` 与 `skills/code_map.md`，重跑 `just docs-sync`。
