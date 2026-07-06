# 创建 ripgrep 使用技能（developer-tools-integrations）

## Goal

搜索 ripgrep 官方文档（README / GUIDE / FAQ / release notes），参照 `skills/developer-tools-integrations/ast-grep` 的结构与目录 `AGENTS.md` 的套件规范，在 `skills/developer-tools-integrations/ripgrep/` 下创建一个教代理正确使用 rg CLI 的可安装技能。

## Background

- 该目录已有 ast-grep（结构化搜索）与 uv-workflow（CLI 工具使用）两个近邻先例；ast-grep 的 Triage 已写明「精确文本用 rg」，但仓库缺少 rg 侧的对应技能，路由是单向的。
- Claude Code 内置 Grep 工具即由 ripgrep 驱动，但不暴露 rg 的全部能力（替换预览、--json、--stats、--pre、type-add、配置文件、-uuu 等）；技能面向「需要直接驱动 rg CLI」的场景（终端、脚本、其他平台代理）。
- 用户平台为 Windows（PowerShell / cmd / Git Bash 并存），引号与转义坑必须一等公民对待（ast-grep 技能已有此先例）。

## Requirements

- R1 技能包：`skills/developer-tools-integrations/ripgrep/` 以 `SKILL.md` 为入口；深度参考拆入 `references/`；评测用例放 `evals/evals.json`。
- R2 事实来源：内容必须以 ripgrep 官方文档为依据（BurntSushi/ripgrep 的 README、GUIDE.md、FAQ.md、最新 release notes），核对 2026-07 当前稳定版本号；研究证据落盘于本任务 `research/` 目录，SKILL.md 中的关键行为描述可回溯到 research 文件。
- R3 套件规范（`skills/developer-tools-integrations/AGENTS.md`）：
  - frontmatter 必含 `name`、`description`、`category: developer-tools-integrations`、`tags`、`version`（0.1.0，不加引号）；鼓励 `allowed-tools`、`argument-hint`。
  - `description` ≤1024 字符、无尖括号、以「use when the user …」触发句式书写，且含显式排除项。
  - evals 使用 git-commit schema：`{ skill_name, evals: [ { id, prompt, expected_output, files, assertions[] } ] }`——键名用 `assertions`（不得复制历史 `expectations` drift）；prompt 保持自然语言（中/英均可），`expected_output` 与 `assertions` 用英文。
  - evals 至少含 2 条近邻路由否定用例（结构化/语法形状查询 → ast-grep；重命名/类型解析等语义操作 → LSP 或其他工具）。
- R4 路由边界：与 ast-grep 形成双向一致分流——rg 负责文本/正则/内容搜索，ast-grep 负责语法结构；不修改 ast-grep 技能本身（其 Triage 已正确指回 rg）。
- R5 Windows 意识：覆盖 PowerShell / cmd / Git Bash 下正则元字符与引号的差异、glob 路径分隔符、UTF-16 文件处理等官方文档确认的行为。
- R6 输出契约：SKILL.md 定义回答 rg 任务时的固定输出结构（命令 + 它匹配什么/漏什么 + 注意事项），与 ast-grep 的 Output Contract 风格对齐。
- R7 反误导硬约束：明确 `-r/--replace` 只改写输出、绝不修改文件；明确默认忽略行为（gitignore/隐藏/二进制）导致「rg 找不到文件」的诊断路径；默认引擎不支持 lookaround/backreference 时指向 `-P/--pcre2`。
- R8 目录文档：在 `skills/developer-tools-integrations/AGENTS.md` 的技能清单与 allowed-tools 表中补一行 ripgrep 条目（最小改动，仅新增，不顺手修其他 drift）。

## Constraints

- 遵循仓库规则：技能置于既有类别目录，不发明新顶层目录；Conventional Commits。
- Surgical changes：不重构/不修复 ast-grep 或 AGENTS.md 中已记录的历史 drift（如 uv-workflow 未列入清单），只新增本技能相关内容；发现的 drift 记入任务 notes 供用户决定。
- yao-meta 门槛说明：`trigger_eval.py` 在本机 yao-meta 技能包中不存在（missing evidence），触发面回归改用本仓库 evals 路由用例承载；无遥测/评分数据，不虚构。
- `agents/interface.yaml` 为类别可选项；是否随附在 design.md 中决策并给出理由。

## Acceptance Criteria

- [ ] `skills/developer-tools-integrations/ripgrep/SKILL.md` 存在，frontmatter 含全部必填键，description 符合 R3 且显式排除结构化查询（指向 ast-grep）。
- [ ] `references/` 至少含一份 CLI 深度参考（flag 语义、引擎差异、配置文件、集成输出），SKILL.md 中有加载指引。
- [ ] `evals/evals.json` 使用 `assertions` 键，含 ≥2 条正向用例与 ≥2 条路由否定用例（ast-grep 方向、LSP/语义方向各至少 1 条）。
- [ ] SKILL.md 含 Windows 引号/转义指引与 `-r` 只改输出、默认忽略行为、PCRE2 分流三条硬约束（R7）。
- [ ] AGENTS.md 新增 ripgrep 行（清单 + allowed-tools 表），无其他改动。
- [ ] `just skills-check` 通过；`just docs-sync` 后 `just ci` 全绿（工作区干净时执行，避免回吞未提交手改）。
- [ ] 关键事实抽查可回溯：`-r` 语义、`-u/-uu/-uuu` 阶梯、PCRE2 能力差异三点在 research/ 文件中有出处 URL。

## Out of Scope

- 不做通用正则教学；不覆盖 rg 之外的批量改写工具链细节（只给官方认可的组合入口）。
- 不修改 ast-grep 技能、不修复类别内既有 drift、不新建平台映射或 `platforms/` 资产。
- 不引入脚本（`scripts/`）——本技能是纯指导型，与类别内 read/audit 技能同类，无脚本是合理形态。

## Notes

- 研究产物：`.trellis/tasks/07-05-ripgrep-skill/research/01..08-*.md`（by trellis-research，2026-07-06 全部落盘）。R2/最后一条验收标准的三事实抽查已通过：`-r` 仅改输出（05，含 GUIDE 原文引用）、`-u/-uu/-uuu` 阶梯（02）、默认引擎无 lookaround/backref → `-P`（04）。
- 版本基线：当前稳定版 ripgrep **15.1.0**（2025-10-22）；15.0.0 含多个 ignore/multiline/replace 修复，reference 版本门槛以此为界。
- 环境事实：本仓库沙箱内 `rg` 解析为 GNU grep 3.0（research/01）——验证命令与技能诊断路径都要考虑此类 shadowing。
- 发现的既有 drift（不在本任务处理）：AGENTS.md 称 ast-grep evals 用 `expectations` 但实际已是 `assertions`；uv-workflow 未列入 AGENTS.md 技能清单。
