# storage-analyzer 源包审计与落点

日期：2026-09-02  
产品决定（2026-09-02 用户确认按建议执行）：默认静态报告；可选 `server.py` 仅在本轮批准已展示路径后启动；拒绝 `rm`；绿灯 trash 受缓存前缀表约束。细节以 `prd.md` D5–D10 为准。  
源树：`ref/repo/khazix-skills/storage-analyzer/`（`ref/` 为 ignored 参考区，不是第一方源）  
许可：上游仓库 `ref/repo/khazix-skills/LICENSE` 为 MIT，Copyright (c) 2026 数字生命卡兹克  
本文件只记录仓库可核对的事实与迁入建议，不改 `ref/`。

## 1. 源包在做什么

源 skill 对 macOS / Windows 做一次本机磁盘占用扫描，由 agent 按 🟢/🟡/🔴 分级，再注入 HTML 模板生成交互报告。可选启动 `127.0.0.1` HTTP 服务，在网页上对白名单路径执行移废纸篓或直接删除。

工作流（源 `SKILL.md`）：

```text
scan.py 只读扫描 -> stdout JSON
  -> agent 读 references/{macos,windows}.md 分级
  -> 写出 analysis JSON
  -> 默认 server.py 打开可删除报告
  -> 或 build_report.py 写静态 HTML
```

脚本全部为 Python 标准库。macOS 路径自称已实测。Windows 路径源注释为 UNTESTED。

## 2. 落点

`scripts/check.py` 的 `CANONICAL_CATEGORY_SLUGS` 只允许六类。`skills/code_map.md` 把本机工具、Windows 维护、先审计后执行的技能放在 `developer-tools-integrations/`。同目录已有：

| 相邻 skill | 边界 |
|---|---|
| `file-sorter` | 单目录分类/重命名；明确排除去重删除和系统清理 |
| `windows-dev-process-cleanup` | Windows 开发进程 / UWP 后台任务；排除通用性能剖析、卸载、非 Windows 清理 |
| 规划中的 `windows-startup-optimizer` | 开机启动项；与磁盘占用无关，不并入本包 |

目标目录：`skills/developer-tools-integrations/storage-analyzer/`。  
slug 保持 `storage-analyzer`。本仓库 skill 名不使用 `qiaomu-` 前缀。不新增第七类。

Qiaomu 模式：只要保留文件系统变更（废纸篓 / 删除 / 本地删除服务），就按 `Governed` 做。只保留扫描与静态报告时，可降到 `Production`。推荐对齐 `file-sorter`：Governed，默认只读，变更走本轮明确授权。

## 3. 源文件体量

| 文件 | 行数 | 说明 |
|---|---:|---|
| `SKILL.md` | 104 | 仅 `name` + `description`（446 字） |
| `scripts/scan.py` | 306 | macOS `du` + Windows `os.scandir` 递归 |
| `scripts/server.py` | 250 | 本地删除 API |
| `scripts/build_report.py` | 55 | JSON 注入 HTML |
| `assets/report_template.html` | 497 | 报告 UI |
| `references/macos.md` | 34 | 分级参考 |
| `references/windows.md` | 33 | 分级参考 |

`python scripts/check.py ref/repo/khazix-skills/storage-analyzer`：`[OK]`，警告 `Top-level category is missing`。缺 `category` / `tags` / `version`。无 `tests/`、`evals/`、`agents/`、`README`、`security/`。

## 4. 问题清单

严重度：P0 迁入后会误删或无法通过本仓库合同；P1 本机 Windows 上不可用或不可维护；P2 质量与性能。

### P0 合同与安全

| ID | 现象 | 证据 |
|---|---|---|
| P0-1 | `SKILL.md` 铁律写「全程只读、删除命令只展示」，Step 3 又把 `server.py` 一键删除设为默认。同一包给出相反授权。 | `SKILL.md` 铁律段；`SKILL.md` Step 3「默认用一键删除模式」 |
| P0-2 | 删除白名单来自 agent 写的 analysis JSON 的 `trash_paths`。服务只检查「路径在 JSON 里且在 `$HOME` 下」。agent 把 `Documents` 标成绿灯即可删用户数据。 | `server.py` `load()` 52-76 行；`do_POST` 204-222 行 |
| P0-3 | HTML 用 `const DATA = __REPORT_DATA__` 把 JSON 插进 `<script>`。`json.dumps` 不转义 `<`。路径或字段含 `</script>` 时可截断脚本并取走页面里的删除 token。 | `report_template.html` 156-157 行；`build_report.py` 44-46 行；`server.py` 173-175 行 |
| P0-4 | Windows `SHFileOperationW` 把 `path + "\x00\x00"` 赋给 `LPCWSTR`。ctypes 按第一个 NUL 截断，双 NUL 列表不成立，可能把邻接内存读成额外待删路径。源标注 UNTESTED。 | `server.py` 98-126 行 |
| P0-5 | 命令写成 cwd 相对路径 `python3 scripts/scan.py`。本仓库 agent 的 CWD 是项目根，`$SKILL_DIR` 不存在。`.trellis/spec/guides/skill-authoring-conventions.md` 要求 `"<skill-dir>/scripts/..."`。 | `SKILL.md` Step 1、Step 3 |
| P0-6 | 扫描输出写死 `/tmp/storage_scan.json`。Windows 默认没有该路径。 | `SKILL.md` Step 1-3 |
| P0-7 | `server.py` `serve_forever()` 阻塞。agent 前台调用会挂起，报告 URL 可能永远不回到对话。 | `server.py` 230-246 行 |
| P0-8 | 越界根写死 `(HOME, "/Applications")`。Windows 红灯 `app_paths` 若在 `Program Files`，打开也会被拒。路径比较区分大小写。 | `server.py` 209-213 行 |

### P1 Windows 可运行性与包合同

| ID | 现象 | 证据 |
|---|---|---|
| P1-1 | `scan_windows()` 对整个 user profile、`AppData`、`Program Files`、`Program Files (x86)` 做 Python 递归计大小。每个一级子目录都全树遍历。本机首次扫描可到数分钟级，且 `user_profile` 与 `appdata_*` 重复走 `AppData`。 | `scan.py` 158-281 行 |
| P1-2 | Windows 开发缓存列表短于实际热点，且有的路径不对。例如 `%LOCALAPPDATA%\uv` 对 uv 缓存可能应为 `uv\cache`；缺 pnpm/bun/nuget/WSL vhdx/Docker Desktop 磁盘镜像、`%LOCALAPPDATA%\Packages`、用户级 `Programs`。 | `scan.py` 259-266 行；`references/windows.md` |
| P1-3 | `system.filesystem` 恒为 `"NTFS"`。ReFS / exFAT 外置盘会标错。 | `scan.py` 235 行 |
| P1-4 | `build_report.py` 结束时打印 `open '...'`。Windows 应走 `os.startfile` / `explorer`。默认写 `~/Desktop/storage-report.html`，桌面路径随 OneDrive 重定向会变。 | `build_report.py` 36-51 行 |
| P1-5 | `open_in_file_manager` 在 Windows 调用 `explorer <dir>`，不检查退出码，也不对文件用 `/select,`。 | `server.py` 153-154 行 |
| P1-6 | 缺本仓库必填/套件文件：`category`、`tags`、`version`、`evals/evals.json`、`agents/interface.yaml`、`tests/*.mjs`、`security/permission_policy.json`。DTI `AGENTS.md` 未列入本 skill。 | `scripts/check.py`；`skills/developer-tools-integrations/AGENTS.md` |
| P1-7 | 绿灯 `delBlock()` 在服务模式下同时渲染「移到废纸篓」和「直接删除」。页脚仍写「删除命令请自行在终端确认后执行」。 | `report_template.html` 152、322-334 行 |

### P2 设计与质量

| ID | 现象 | 证据 |
|---|---|---|
| P2-1 | 分级完全交给 LLM。已知可再生缓存（pip/npm/uv/Temp）没有确定性前缀表，输出不可回归。 | `SKILL.md` Step 2 |
| P2-2 | `dir_size_bytes` 跳过 `is_symlink()`。Windows junction 在近期 CPython 上通常算 symlink，需夹具确认，避免 `Application Data` 自指循环或漏计。 | `scan.py` 158-176 行 |
| P2-3 | `human()` 把字节当 KB 再乘 1024，接口以 KB 传入，调用处 `t // 1024` 先除再乘，能自洽；但磁盘字段已是人类字符串，模板再 `parseGB`，丢失精确字节。 | `scan.py` 29-35、230-234 行；模板 `parseGB` |
| P2-4 | 无 schema 校验。缺 `system` 或 `tier_stats` 非「约 x GB」时进度条分段失败。 | `build_report.py` 全文；`SKILL.md` Step 3 |
| P2-5 | 无 Linux/WSL 作为独立 OS。WSL 磁盘镜像若在 `%LOCALAPPDATA%\Packages` 或 `%LOCALAPPDATA%\wsl`，当前扫描覆盖不到。 | `scan.py` 285-295 行 |
| P2-6 | `description` 同时写「扫描全程只读」和「网页上一键删除」，并收「内存满了」口语。RAM 排除写在后半段，路由仍可能误伤进程/内存问题。 | `SKILL.md` frontmatter |
| P2-7 | 扫描 JSON `indent=2` 打到 stdout，大结果占对话上下文。无 `--output` / `--root` / `--min-kb`。 | `scan.py` 302 行 |

## 5. Qiaomu 取舍（相对源包与相邻 skill）

参考已读：`file-sorter`、`windows-dev-process-cleanup`、本源包。skills.sh / SkillsMP 目录检索本轮未跑，标 `missing evidence`，实施前补 `research/prior-art-research.md`。

| 动作 | 机制 | 落到 |
|---|---|---|
| keep | 只读扫描脚本 + 三灯决策清单 + 交互 HTML 阅读流（总览 → Top5 → 处方 → 卡片） | `scripts/scan.py`、`assets/report_template.html`、`references/` |
| keep | 标准库、零 pip 依赖、macOS/Windows 自动分支 | 脚本约束 |
| keep | RAM/进程占用排除；与 `file-sorter`、进程清理、开机启动优化分界 | `description` + evals 近邻负例 |
| adapt | 默认只读；变更必须本轮明确授权；删除服务不得作为默认打开方式 | 对齐 `file-sorter` plan_id / `windows-dev-process-cleanup` WhatIf |
| adapt | 绿灯路径用确定性缓存前缀表约束，LLM 只给黄/红神秘目录做内容画像 | `references/windows.md` / `macos.md` + 可选 `scripts/classify.py` |
| adapt | 命令全部改为 `"<skill-dir>/scripts/..."`；Windows 解释器 `python` / `py -3`；输出写 `tempfile.gettempdir()` | `SKILL.md` |
| adapt | Windows 默认扫描热点目录，不递归整个 `Program Files` 和整个 user profile | `scan.py` 目标表 |
| reject | 默认网页「直接删除」(rm) | 不可逆，且白名单由 LLM 填写 |
| reject | 把分析 JSON 的任意 `trash_paths` 当作安全证明 | 见 P0-2 |
| reject | 新增 skill 大类或改名为 `qiaomu-*` | 违反 `CANONICAL_CATEGORY_SLUGS` 与本仓库命名 |
| reject | 并入 `windows-dev-process-cleanup` 或未来的 startup optimizer | 工作对象分别是磁盘、进程、开机项 |
| invent | analysis JSON schema 校验 + HTML 注入安全（`\u003c` 或单独 JSON 脚本块） | `build_report.py` / `server.py` |
| invent | 删除/废纸篓路径可注入 shim，供 `tests/*.mjs` 测白名单与越界，不碰真实用户盘 | 对齐 skill-authoring-conventions 的 destructive-path shim |
| invent | `evals/evals.json`：磁盘满了/C 盘/清理缓存为正例；RAM、进程堆积、Downloads 整理、开机启动为负例 | DTI 套件合同 |

## 6. 推荐包结构（实施阶段）

```text
skills/developer-tools-integrations/storage-analyzer/
  SKILL.md
  README.md
  LICENSE
  THIRD_PARTY_NOTICES.md
  agents/interface.yaml
  evals/evals.json
  evals/trigger_cases.json          # Production+ 若做 Qiaomu trigger eval
  references/macos.md
  references/windows.md
  references/scan-safety.md
  references/classification.md       # 三灯规则与确定性缓存前缀
  references/report-schema.md
  scripts/scan.py
  scripts/build_report.py
  scripts/server.py                 # 仅在产品决定保留变更通道时保留
  assets/report_template.html
  security/permission_policy.json
  tests/storage-analyzer.test.mjs
  reports/                          # Skill IR / trust / creation handoff；缺证据写 missing evidence
```

根 `SKILL.md` 只留触发、流程、授权边界、输出合同。长规则进 `references/`。

许可：保留上游 MIT 版权声明；本仓库改动在 `THIRD_PARTY_NOTICES.md` 提名 `khazix-skills/storage-analyzer`。不改 `ref/`。

## 7. 验证命令（实施完成后）

- `just skills-check`
- `just python-check`
- `just node-test`
- `just docs-sync` 然后 `just docs-check`
- `just ci`
- `git diff --check`
- `git status --porcelain -uall`（本仓库默认隐藏 untracked）

真实磁盘删除、真实废纸篓、真实整盘扫描耗时、独立人工盲评、npx 安装证明：若本任务不跑，报告里标 `missing evidence`。
