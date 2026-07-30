# web-research skill 去死路由与自足化重构

## Goal

`skills/development-workflows/web-research/` 是 `ref/repo/yichen-skills-main/yichen-web-research/`
的逐字拷贝（仅改 `name`、删 description 前缀「逸尘自用的」，表格被格式化钩子重排；README、
两个脚本、`agents/openai.yaml` 与源仓库字节一致）。它是一个**纯路由层，而 4 个路由目标在本仓库
全部不存在**，附带 35KB 面向 macOS + 私有后端的死脚本和一套从未被 CI 执行、现已全挂的 unittest。

把它重建为**自足的「来源发现 + 候选核验 + 确认后本地归档」skill**，与已有近邻
`skills/research-learning-knowledge/deep-research-pro` 划清边界，并对齐
`skills/development-workflows/AGENTS.md` 的套件 house 标准。

## 现状证据

审计于 2026-07-30 实测，不是推断：

| 项 | 事实 | 影响 |
|---|---|---|
| 路由目标 | `yichen-unified-search` / `yichen-content-archive` / `yichen-bookmarks-export` / `yichen-asr` 在 `skills/**` 下均不存在 | 路由表、固定流程、交接 JSON、「唯一入口」章节全部悬空 |
| `tests/test_router_contract.py` | `python -m unittest` → `Ran 8 tests, FAILED (failures=1, errors=6, skipped=1)` | `ROOT = parents[2]` 在本仓库解析为 `skills/development-workflows/`，再读 `yichen-web-research/SKILL.md` → FileNotFoundError |
| CI 盲区 | `just python-check` 只做字节编译；`just node-test` 只发现 `*.mjs` | 全挂的 unittest 从未被任何 CI 通路执行，静默腐坏 |
| `scripts/doctor_yichen.py` (22KB) | 体检 OpenCLI / 头条适配器 / Grok CLI / 火山 ASR / 小宇宙凭证；`:45` 硬编码 `/Applications/Google Chrome.app/...` | macOS-only 路径 + 本机不存在的后端；`SKILLS_ROOT` 默认解析到 `skills/development-workflows/` |
| `scripts/validate_family.py` (13.5KB) | 校验 5 元组 `FAMILY`；默认 validator 指向 `~/.codex/skills/.system/skill-creator/scripts/quick_validate.py` | 校验对象与校验器都不存在 |
| `README.md` | 15 个后端环境变量表；`python3 yichen-web-research/scripts/...` | 路径与解释器名在本仓库均错误 |
| `agents/openai.yaml` | `display_name: 逸尘互联网研究`，default_prompt 全指向 `$yichen-*` | **直接违反** `development-workflows/AGENTS.md`：接口文件必须中性命名 `agents/interface.yaml`，"never a platform-named `openai.yaml`" |
| frontmatter | 缺 `category` / `tags` / `version`；description 含 `$yichen-web-research` | `scripts/check.py` 报 `warning: Top-level category is missing` |
| 正文 | `~/.agents/skills/...`、`python3` | 非本仓库路径；Windows 下解释器名错误 |

近邻边界冲突：`deep-research-pro`（完整 frontmatter + evals + README，工具无关）已覆盖
「搜索纪律 → 精读 → 综合 → 带引用报告」。`web-research` 与其重叠于发现与综合，
不重叠的部分（归档下载、私人收藏导出、ASR 路由）恰好全是死路由。

约 50KB 内容中唯一有独立价值的是 9 条安全边界（社交只读、搜索不自动转下载、
授权不可转移到下载、不打印凭证、不覆盖产物、清理只入回收站）。

## Requirements

- **任务定位**：用户有明确研究目标、需要跨平台找到并核验来源、再把选中来源落成本地产物时触发。
  产出「候选清单 → 用户确认 → 归档」的分阶段纪律，而不是主题综述。
- **边界互引**：SKILL.md 必须显式声明——需要主题调研/综合/带引用报告时改用 `deep-research-pro`；
  `deep-research-pro` 不负责本地归档落盘。两侧职责在正文中各出现一次，可被 evals 断言。
- **工具基线**：只依赖本环境真实存在的能力——`WebSearch`、`WebFetch`、Exa MCP
  (`web_search_exa` / `web_fetch_exa`)、`Bash`（`yt-dlp` / `gh` 等按需且必须先探测可用性）。
  不得假设 AnySearch、OpenCLI、Grok CLI、火山 ASR 存在。
- **安全边界保留**：9 条边界改写为不依赖子 skill 的表述后保留，这是本 skill 相对
  `deep-research-pro` 的实质增量。

### 交付物

- `SKILL.md` — 重写，自足，零 `yichen-*` 引用。frontmatter 补齐
  `name` / `description` / `category: development-workflows` / `tags` / `version`；
  `allowed-tools` 若声明则用逗号分隔字符串。
- `README.md` — 重写，删除 15 个后端环境变量表与错误的校验命令。
- `evals/evals.json` — git-commit schema：
  `{ skill_name, evals: [ { id, prompt, expected_output, files, assertions[] } ] }`，
  键名用 `assertions`（不是 `expectations`），不加 `name` 之类杂键。
- `agents/interface.yaml` — 中性接口文件（`display_name` / `short_description` / `default_prompt`），
  替换违规的 `agents/openai.yaml`。

### 删除

- `scripts/doctor_yichen.py`、`scripts/validate_family.py`（35KB，整个 `scripts/` 目录）
- `tests/test_router_contract.py`、`tests/trigger_matrix.json`（整个 `tests/` 目录）
- `agents/openai.yaml`

> 删除走 `mv` 到备份目录，不用 `rm -rf`（本仓库 pre-bash 钩子拒绝 `rm -rf`）。

### 约束

- 遵守 `skills/AGENTS.md` 与 `skills/development-workflows/AGENTS.md`：
  description 无尖括号、含 use-when 触发词与显式 non-triggers；不使用裸 `$SKILL_DIR`；
  纯 advisory 工作流无 scripts 是合法形态（AGENTS.md 明确认可，`unknowns-first` 为例）。
- 归入现有 `development-workflows` 类别，不新建目录，不改动 `deep-research-pro`。
- 正文语言沿用中文（现状即中文，且与 `literature-mentor` 等一致）；
  evals 的 `expected_output` 与 `assertions` 用英文。
- 保持路径与命令 Windows 可用：不写 `python3`、不写 `~/.agents/skills/...`。

## Acceptance Criteria

全部于 2026-07-30 实测通过。

- [x] `just skills-check` 通过且**无** `Top-level category is missing` 警告 —— `[OK] ... exit=0`，无 warning 行。
- [x] `just ci` 通过 —— `just ci exit=0`（输出中仅有 git 的 CRLF 换行提示，非失败）。
- [x] `grep -rn "yichen" skills/development-workflows/web-research/` 无结果（exit=1）。
- [x] `grep -rn "python3 \|~/.agents/skills\|\$SKILL_DIR" skills/development-workflows/web-research/` 无结果（exit=1）。
- [x] `scripts/`、`tests/`、`agents/openai.yaml` 已移除；`agents/interface.yaml` 存在且含
      `display_name` / `short_description` / `default_prompt`。最终树只剩
      `SKILL.md`、`README.md`、`agents/interface.yaml`、`evals/evals.json`。
- [x] `evals/evals.json` 6 个用例：正向 2（发现流程 #1、已知链接归档 #2）、
      routing-negative 4（#3 主题调研 → `deep-research-pro`；#4 搜索后未确认即批量下载 → 拒绝；
      #5 转发/关注等改变账号状态 → 拒绝；#6 登录态检索 → 需当轮授权且不可转移）。
      schema conformance 实测：键名为 `assertions`，无 `name` / `expectations` 杂键。
- [x] SKILL.md 保留 7 条安全边界，含搜索不自动转下载、授权不可转移、不打印凭证、不覆盖既有产物。
- [x] `just docs-sync` 已执行（新增 2 个 detail 页 + catalog/skills 索引），`docs-check` 在 `just ci` 中通过。

补充实测：`description` 445 字符（限 1024）、无尖括号；`allowed-tools` 为逗号分隔字符串
`Read, Write, WebSearch, WebFetch, Bash`；`category: development-workflows`；`version: 0.1.0`。

## Notes

- Lightweight 任务：PRD-only，无需 design.md / implement.md。
- 决策已确认（2026-07-30）：定位取「来源发现 + 本地归档纪律」，
  防腐资产取 `evals/evals.json`（对齐 `deep-research-pro` / `code-refactor` 惯例）。
  `development-workflows/AGENTS.md` 已说明 CI **不执行** evals，它是评审与未来工具资产；
  硬校验仍由 `scripts/check.py` 的 frontmatter 层承担。
- 源仓库 `ref/repo/yichen-skills-main/` 保持只读参考，本任务不改动它。
- 参考近邻实现：`skills/development-workflows/code-refactor/evals/evals.json`（套件内 evals 范例），
  `skills/git-github-collaboration/git-commit/`（repo 级 evals + interface.yaml 参考）。

## 执行记录（2026-07-30）

- **该 skill 目录从未被 git 跟踪**（`git ls-files` 为空，`git status` 因仓库配置
  `status.showUntrackedFiles=no` 而显示 clean）。因此删除**不可**通过 git 回滚，
  被删资产已 `mv` 至仓库外备份：`D:/Documents/Code/Agents/.backup-web-research-20260730/`
  （含 `scripts/`、`tests/`、`openai.yaml`、`SKILL.md.orig`、`README.md.orig`）。
  确认新实现无误后可自行清理该备份。
- 净变化：7 文件 / ~50KB → 4 文件 / ~11KB；死路由 4 条 → 0；全挂 unittest 8 个 → 0；
  新增 6 个 routing evals。
- 未提交。`ref/repo/yichen-skills-main/` 未改动（且被 `.gitignore` 忽略）。
