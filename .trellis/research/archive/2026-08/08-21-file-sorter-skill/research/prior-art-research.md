# Prior-Art Research

- Researched at: 2026-08-21
- Queries: `file organize sort categorize` (skills.sh + SkillsMP); `file-organizer` (SkillsMP)
- Catalogs: skills.sh CLI via `npx.cmd --yes skills find`; SkillsMP via `search_skillsmp.py`
- Rating evidence: unavailable; installs and repository stars are not ratings
- Unified runner: 未跑。Windows 上 `research_prior_art.py` 调用 `npx` 而不是 `npx.cmd`（与 2026-08-10 idea-bib-review 相同）。合并 JSON 为 `missing evidence`。
- skills.sh `npx.cmd` 在打印完整列表后以 UV_HANDLE_CLOSING 断言退出 1；列表本身可解析。

## Shortlist

| Candidate | Role and dated signal | Inspected source | Keep/adapt | Reject/limit |
|---|---|---|---|---|
| `composiohq/awesome-claude-skills@file-organizer` / `davila7/claude-code-templates` `productivity/file-organizer` | Popularity + SkillsMP star family. 5.4K skills.sh installs observed 2026-08-21. davila7 repo 30,311 stars, MIT, pushed 2026-08-20. Descriptions match; treat as one family, do not add metrics | gh `SKILL.md` for both | Plan before mutation; confirm before delete; log moves | Duplicate hunting, Work/Personal trees, archive-by-age, project-folder restructuring, ad-hoc `find`/`mv`, GNU `-printf` |
| `claude-office-skills/skills@file-organizer` | Content-naming specialist. 4.6K skills.sh installs; repo 400 stars, MIT, pushed 2026-01-31 | gh `SKILL.md` | Table-shaped organization plan; screenshot/invoice naming examples; content-based category hints | PARA cabinets, MCP office server, date-first global rename, auto-delete old installers, no helper |
| `jxnl/dots@file-organizer` | Complementary plan-first specialist. Repo 276 stars, pushed 2026-07-14; **license unavailable** | gh `SKILL.md` + `references/organization-rules.md` | Plan first, apply second; inspect content only when names are vague; skip `.DS_Store`; no overwrite; conflict suffix; no delete by default | Hardcoded `/Users/jasonliu` paths, Google Drive mirror, personal Finance taxonomy, license cannot be reused |
| Local `windows-dev-process-cleanup` | Suite trust analog. No external popularity metric | `skills/developer-tools-integrations/windows-dev-process-cleanup/SKILL.md` | Audit/WhatIf default; explicit authorization for mutation; injectable tests | Process termination, Windows-only PowerShell |
| `CraftOS-dev/CraftBot@file-organizer` | Negative control. 376 SkillsMP repo stars | gh `SKILL.md` | None for apply path | Extension-only `organize.ps1` with no review plan |

## Deduplication

- composiohq 与 davila7 正文同一家族。skills.sh installs 记在 composiohq 条目；GitHub stars 记在 davila7。不把两个数字加总。
- SkillsMP 上大量 `file-organizer` 复述 davila7 描述（davepoon、langchain-ai examples、benchflow fixtures）。只保留 davila7 为规范源。
- NVIDIA SkillSpector 命中是测试夹具，丢弃。

## Contribution ledger

### Keep

- 先计划、再变更。
- 跳过系统 junk。
- 名称含糊时才读内容。
- 冲突时加后缀，不覆盖。
- 默认不删除。

### Adapt

- 把「任意智能结构」换成 AI File Sorter 的文件族候选主类 + refined/consistent。
- 用标准库 helper 代替 `find`/`mv` 散文。
- 用 `ok_to_apply` + `--execute` 代替对话里的 yes/no。
- undo 用 JSON sidecar，不用 Markdown 日志当权威。

### Reject

- 去重删除、按闲置时间归档、Work/Personal/PARA。
- 把 Git/Node 项目当 Downloads 整理。
- 无审阅的按扩展名自动移动。
- 个人绝对路径、Drive 镜像、发票金额文件名作为默认。
- 复制上游 SKILL 长文。

### Invent

- 扩展名 → 文件族 → 候选主类的确定性表，与 LLM 主题判断分离。
- 强保护项目根在扫描根与子目录两级跳过。
- 制品/截图归一化与白名单三形态。
- apply 前校验 size/mtime，失败停止，写出可回放 undo。

## Advantages and evidence status

- Design advantage: 触发绑定「本地路径 + 分类/重命名计划」，并把项目根保护做成硬跳过。
- Design advantage: helper 持有路径与 apply 门，agent 不得直接 `mv`。
- Hypothesis: 文件族约束会降低截图被标成 Installers 这类漂移；provider 对比与人工盲评为 `missing evidence`。

## Missing evidence

- 统一 runner 合并 JSON。
- 公开评分。
- jxnl/dots SPDX 许可。
- 未对照源 C++ 单元测试逐条复现（实施时用夹具覆盖行为，不复制测试代码）。

## Source links

- https://skills.sh/composiohq/awesome-claude-skills/file-organizer
- https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/skills/productivity/file-organizer/SKILL.md
- https://github.com/claude-office-skills/skills/blob/main/file-organizer/SKILL.md
- https://github.com/jxnl/dots/blob/master/agents/skills/file-organizer/SKILL.md
- https://github.com/CraftOS-dev/CraftBot/blob/main/skills/file-organizer/SKILL.md
