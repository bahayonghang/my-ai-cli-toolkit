# implement.md — 执行清单

> 前置：本清单在 `task.py start`（状态 → in_progress）之后才执行。每步带验证命令；Windows 环境 Python 命令一律前缀 `PYTHONUTF8=1`。

## Step 0 — 研究对齐（门槛）

- [ ] 核对 `research/` 实际文件名与 design.md / jsonl 指针一致；不一致则先修正指针（改工件，不改研究文件）。
- [ ] 抽查三事实有出处 URL：`-r` 仅改输出、`-u/-uu/-uuu` 阶梯、默认引擎无 lookaround/backref → PCRE2 分流。
- 验证：`ls .trellis/tasks/07-05-ripgrep-skill/research/`；抽查文件内含源 URL。

## Step 1 — 骨架与 frontmatter

- [ ] 建 `skills/developer-tools-integrations/ripgrep/`（SKILL.md / references/ / evals/ / agents/）。
- [ ] frontmatter：`name: ripgrep`、design §3 的 description（微调后 ≤1024、无尖括号）、`category`、`tags`、`version: 0.1.0`、`argument-hint`、`allowed-tools: Read, Glob, Grep, Bash, Write`。
- 验证：`PYTHONUTF8=1 python -c "import pathlib,re; t=pathlib.Path('skills/developer-tools-integrations/ripgrep/SKILL.md').read_text(encoding='utf-8'); d=re.search(r'description:.*?(?=\n\w|\n---)', t, re.S).group(); assert len(d)<=1100 and '<' not in d; print('desc ok')"`（粗检）；后续以 `just skills-check` 为准。

## Step 2 — SKILL.md 正文

- [ ] 按 design §4 的 11 节骨架写正文（150–200 行），事实句以 research/01–08 为据；R7 三条硬约束单独成节。
- [ ] Triage 与 ast-grep 的 Triage 互为镜像（文本↔结构双向让路）；含 harness 内置 rg 后端搜索工具的分流句。
- [ ] Windows 三 shell 引号差异 + `-f` pattern-file 首选（镜像 ast-grep 的 Rule File First）。
- 验证：对照 prd.md R3/R5/R6/R7 逐条自检；`wc -l skills/developer-tools-integrations/ripgrep/SKILL.md` 行数在体量带内（勿用本机 `rg` 做验证——沙箱中它是 GNU grep 的别名，见 research/01）。

## Step 3 — references/cli_reference.md

- [ ] 按 design §5 轮廓成文；版本门槛 flag 标 "since X.Y"（出处 research/01 release notes）。
- 验证：与 SKILL.md 无自相矛盾（flag 拼写抽查 5 处与 research 一致）。

## Step 4 — evals/evals.json

- [ ] 按 design §6 写 6 条用例；键名 `assertions`；`expected_output`/`assertions` 英文。
- 验证：`PYTHONUTF8=1 python -m json.tool skills/developer-tools-integrations/ripgrep/evals/evals.json > /dev/null && echo json ok`；对照 ast-grep evals.json 核对 schema 键。

## Step 5 — agents/interface.yaml

- [ ] 三字段：`display_name` / `short_description` / `default_prompt`（对照 uv-workflow 的 interface.yaml 形态）。
- 验证：`PYTHONUTF8=1 python -c "import yaml,pathlib; yaml.safe_load(pathlib.Path('skills/developer-tools-integrations/ripgrep/agents/interface.yaml').read_text(encoding='utf-8')); print('yaml ok')"`

## Step 6 — AGENTS.md 增量（R8）

- [ ] 清单句加 `ripgrep`；allowed-tools 表加一行。仅新增，不碰既有 drift。
- 验证：`rtk proxy git diff -- skills/developer-tools-integrations/AGENTS.md` 仅显示新增行。

**⛳ review gate：Step 2–6 完成后自查一轮 prd 验收标准，再进 Step 7。**

## Step 7 — 仓库门禁

- [ ] `just skills-check` 通过。
- [ ] 确认工作区仅含本任务改动后 `just docs-sync`（防回吞手改），检查 docs 再生成 diff 合理。
- [ ] `just ci` 全绿。
- 验证：命令退出码 0；`rtk proxy git status` 无意外文件。

## Step 8 — 质量复核（Phase 2.2 / 3.1）

- [ ] 派 `trellis-check`（prompt 首行 `Active task: .trellis/tasks/07-05-ripgrep-skill`）对照 spec 与 prd 验收清单复核；修复其发现。
- 验证：trellis-check 报告无阻断项。

## Step 9 — 收尾（Phase 3.3/3.4）

- [ ] 视需要 `trellis-update-spec`（若沉淀出新套件约定；预期无）。
- [ ] 提交：Conventional Commits，建议 `feat(skills): [AI] ✨ 新增 ripgrep 使用技能` 风格（对齐仓库近期提交样式），含 Why 行。
- 验证：`just ci` 已绿的前提下提交；`rtk proxy git log -1` 检查格式。

## 回滚点

- Step 1–6 任意点：改动纯新增 → `git restore skills/developer-tools-integrations/AGENTS.md` + 移除未跟踪的 ripgrep 目录（pre-bash hook 拦 `rm -rf`，用 `git clean -i` 或 `mv` 备份）。
- Step 7 后：`docs-sync` 产物随源回退后重跑即可复原。
