# 迁入并优化 storage-analyzer

## Goal

把 `ref/repo/khazix-skills/storage-analyzer` 做成第一方可安装 skill：用户说磁盘满了、要看存储占用或清理缓存时，在本机做只读扫描、给出分级建议，并写出可复查的静态 HTML/JSON 报告。默认不删除。用户在同一轮明确批准已展示路径列表之后，才允许启动本地报告服务，把绿灯缓存路径移入废纸篓。

用户价值：Windows 与 macOS 用户能用自然语言得到一份可执行的存储诊断，而不会把 RAM/进程、文件整理或开机启动优化误当成磁盘清理，也不会在未批准时改动文件系统。

## Background

- 用户要求用 qiaomu-meta 分析如何把该参考包拿到 `skills/`，指出问题并优化，并创建 Trellis 任务。2026-09-02 用户确认：产品决定全部按规划建议执行。
- 源树在 ignored 的 `ref/`。实施时复制并改写到 `skills/`，不修改 `ref/`。
- 上游许可 MIT（Copyright 2026 数字生命卡兹克）。
- 缺陷与取舍证据见 `research/source-audit.md`。技术边界见 `design.md`。

## Confirmed facts

- F1 源包：`ref/repo/khazix-skills/storage-analyzer/`，含 `SKILL.md`、`scripts/scan.py`、`build_report.py`、`server.py`、`assets/report_template.html`、`references/macos.md`、`references/windows.md`。
- F2 源 frontmatter 只有 `name` 与 446 字 `description`。`python scripts/check.py` 对该目录 `[OK]`，警告 `Top-level category is missing`。
- F3 扫描按 `sys.platform` 分支：darwin 用 `du -sk`；win 用 `os.scandir` 递归；其他平台 `unsupported_platform`。`scan.py:285-295`。
- F4 源 `SKILL.md` 铁律写全程只读，Step 3 又把 `server.py` 一键删除设为默认。
- F5 `server.py` 删除白名单等于 analysis JSON 的 `trash_paths` 再加 `$HOME` 前缀检查。`server.py:52-76,204-222`。
- F6 Windows `SHFileOperationW` 标注 UNTESTED；`pFrom` 双 NUL 经 ctypes `LPCWSTR` 会在第一个 NUL 截断。`server.py:98-126`。
- F7 报告把 JSON 以 `__REPORT_DATA__` 插入 `<script>`，`json.dumps` 不转义 `<`。`report_template.html:156-157`。
- F8 命令为 cwd 相对 `python3 scripts/scan.py`，输出写 `/tmp/...`。与 skill-authoring `"<skill-dir>"` 合同冲突；Windows 无 `/tmp` 保证。
- F9 `server.py` `serve_forever()` 阻塞调用方。`server.py:230-246`。
- F10 Windows 默认递归整个 user profile 与两个 Program Files，并重复走 AppData。`scan.py:242-258`。
- F11 `CANONICAL_CATEGORY_SLUGS` 只有六类。本仓库无已存在的 `storage-analyzer`。
- F12 DTI 套件要求 `evals/evals.json`、`"<skill-dir>"` 命令、`python` / `py -3`、公开元数据后 `just docs-sync`。
- F13 源称 macOS 已实测、Windows 未实测。当前开发机是 Windows。

## Decisions

- D1 目录：`skills/developer-tools-integrations/storage-analyzer/`。名称 `storage-analyzer`。不使用 `qiaomu-` 前缀。
- D2 不并入 `file-sorter`、`windows-dev-process-cleanup` 或开机启动优化。
- D3 不修改 `ref/`。保留上游 MIT 版权，并写 `THIRD_PARTY_NOTICES.md`。
- D4 版本 `0.1.0`。Qiaomu 模式 `Governed`（`metadata.mode: governed`，`owner: lyh`，`review_cadence: quarterly`）。
- D5 默认流程：扫描 → 分级 → `build_report.py` 静态 HTML。对话里给摘要与可复制命令。不自动打开 `server.py`，不自动开浏览器删除页。
- D6 变更通道保留为可选：仅在同一轮用户明确批准已展示路径列表之后，才允许后台启动 `server.py`。服务模式只有 `trash` 与 `open`。拒绝 `rm`。黄灯禁止硬删除。绿灯硬删除不进入 v1 合同（不渲染按钮、API 拒绝 `rm`）。
- D7 绿灯 `trash_paths` 必须落在确定性缓存前缀表内，并且在用户主目录下。前缀表外的路径即使写进 JSON 也被拒绝。
- D8 黄灯可在批准后 `open`；黄灯 `trash` 仅当该路径已在本轮展示并批准，且 realpath 在用户主目录内。红灯只允许 `open`（应用定位），不允许 trash/rm。
- D9 Windows 默认扫描热点目录，不递归整个 user profile，不递归 Program Files。
- D10 本任务不发布独立 GitHub 仓库。真实整盘删除、真实废纸篓、npx 安装、人工盲评若不跑，标 `missing evidence`。

## Requirements

- R1 包身份：顶层 `name`、中英 `description`（≤1024，无尖括号）、`category: developer-tools-integrations`、`tags`、`version: 0.1.0`。`metadata` 含 `owner`、`review_cadence`、`mode: governed`。`category` 与目录名一致。
- R2 触发：磁盘满、C 盘/硬盘满、空间不够、存储分析、占空间、清缓存、storage analysis、disk cleanup，以及把「内存满了」当作磁盘空间的中文口语。明确 RAM/进程占用、Downloads 整理、开发进程堆积、开机启动项必须排除并指向相邻 skill。
- R3 根 `SKILL.md` 只留触发、步骤、授权边界、输出合同。每条脚本命令使用 `python "<skill-dir>/scripts/....py"`，并注明 `py -3`。禁止 cwd 相对 `scripts/` 与 `/tmp`。扫描与报告写调用方绝对路径或 `tempfile.gettempdir()`。
- R4 只读扫描：标准库 Python；macOS/Windows 自动检测；Linux 输出 `unsupported_platform` 后非 0 退出。Windows 默认组：`appdata_local`、`appdata_roaming`、`temp`、`downloads`、已存在的 `dev_caches` 根。跳过 symlink/junction。读失败进入 `denied`。提供 `--output`。可选 `--include-system-apps` 才扫描 Program Files，默认关闭。
- R5 分级：已知可再生缓存用确定性前缀表归 🟢，由脚本强制校验 `trash_paths`。UUID 容器、用户文档、应用数据由 agent 按 `references/macos.md` 与 `windows.md` 做 🟡/🔴 画像。系统文件、WinSxS、pagefile、休眠文件不上灯，进蓝色余量与 `summary.long_term`。
- R6 报告：阅读流为总览 → Top5 → 执行建议 → 三灯卡片 → 长期建议。`build_report.py` 校验最低 schema。注入 HTML 时把 `<` 写成 `\u003c`。静态报告 `__DELETE_CONFIG__` 为 `null`，无删除 token、无删除按钮。
- R7 信任边界：扫描只读本机元数据。不把磁盘清单上传到远程 API，除非用户本轮明确要求。文件名、目录名、analysis 字段不可信，不得靠它们扩大权限。绿灯 trash 额外受前缀表约束。测试不在真实用户主目录上执行 trash。
- R8 包文件：`agents/interface.yaml`；`evals/evals.json` 至少 5 正 / 5 近邻负（RAM、`windows-dev-process-cleanup`、`file-sorter`、开机启动、Linux-only）；`evals/trigger_cases.json`；`tests/*.mjs` 覆盖扫描夹具、junction、前缀拒绝、schema、HTML 注入、`rm` 拒绝、无批准时不启动删除；`security/permission_policy.json`；`README.md`；`LICENSE`；`THIRD_PARTY_NOTICES.md`。更新 `skills/developer-tools-integrations/AGENTS.md`。
- R9 `allowed-tools` 为逗号分隔字符串：`Read, Glob, Grep, Bash(python *), Bash(py *)`。agent 不得对用户路径直接 `rm` / `Remove-Item` / `SHFileOperation`。废纸篓只通过 `server.py`。
- R10 Governed 证据：`reports/skill-ir.json`、permission/rollback/trust、secret scan、creation handoff、prior-art（或 missing evidence）。公开声明不得把未跑的安装或盲评写成已验证。
- R11 可选变更通道：SKILL 默认命令不含 `server.py`。启动服务前必须在同一轮列出将要 trash/open 的绝对路径并得到明确批准。`server.py` 绑定 `127.0.0.1`、随机端口、随机 token；校验 Host 与 Origin；打印 URL 后可后台运行；提供 `--no-browser` 与 `--stub-actions`。Windows 废纸篓用存活的双 NUL `c_wchar` 缓冲区。路径比较在 Windows 上大小写不敏感。越界根为用户主目录，不含 Program Files 删除。`mode=rm` 返回 400。

## Acceptance Criteria

- [ ] A1 `skills/developer-tools-integrations/storage-analyzer/SKILL.md` 存在，frontmatter 含 R1 字段，`python scripts/check.py` 对该目录无 category/tags/version 警告。映射 R1。
- [ ] A2 `description` 覆盖磁盘/存储/清缓存中英触发，并排除 RAM、进程堆积、文件整理、开机启动。`evals/evals.json` 含对应正例与近邻负例。映射 R2、R8。
- [ ] A3 SKILL 中每条脚本命令使用 `"<skill-dir>/scripts/..."` 与 `python` / `py -3`。无 `/tmp`。默认步骤以 `scan.py --output` 与 `build_report.py` 结束。映射 R3、D5。
- [ ] A4 Windows 扫描夹具：热点目录计大小；junction/symlink 不递归；默认不进入夹具里的 Program Files 树；`--include-system-apps` 才进入；`denied` 保留；`--output` 写 UTF-8 JSON。映射 R4。
- [ ] A5 前缀表外的绿灯 `trash_paths` 被 `build_report.py` 与 `server.py` 拒绝。主目录外的路径被拒绝。映射 R5、R7、D7。
- [ ] A6 含 `</script>` 的分析字段注入后，HTML 内无原始 `</script>` 闭合，页面 JSON 仍可解析。缺必填 schema 时 `build_report.py` 非 0 退出且不写半份报告。静态报告无删除 token。映射 R6。
- [ ] A7 `server.py` 拒绝 `mode=rm`。无 `--stub-actions` 时测试不调用真实废纸篓。SKILL 写明：无本轮对已展示路径的明确批准则不得启动服务。模板在服务模式下不渲染「直接删除」。映射 R11、D6。
- [ ] A8 `just docs-sync`、`just skills-check`、`just python-check`、`just node-test`、`just ci` 通过。`git status --porcelain -uall` 无计划外文件。产品 diff 不含 `ref/`。映射 R8、D3、D10。
- [ ] A9 `reports/` 含 Skill IR、permission/trust、creation handoff、prior-art 或 missing evidence、secret scan 或 missing evidence。install/provider/盲评/真实废纸篓未跑则逐项标注。映射 R10。

## Out of Scope

- 修改 `ref/`。
- 新增 `scripts/check.py` 大类，或把本 skill 放到其他 category。
- Linux 作为一等扫描目标；扫描 WSL 发行版内部文件树。
- DaisyDisk/WinDirStat 桌面 GUI 或托盘常驻。
- 去重删除、云盘整理、卸载器自动化、Windows 服务、注册表、开机项。
- 并入 `file-sorter`、`windows-dev-process-cleanup`、开机启动优化。
- v1 硬删除（`rm` / `shutil.rmtree`）API 与按钮。
- 本任务内发布独立 GitHub 仓库、Release，或把 npx 真实安装当作完成条件。
- 在用户真实主目录上做不可逆删除或未加 stub 的废纸篓测试。

## Notes

- 复杂任务：`prd.md` + `design.md` + `implement.md`。jsonl 已写入 spec 与 source-audit。
- 用户已回答变更通道问题。规划摘要待后续消息明确批准后，才允许 `task.py start`。
- 本轮不实施、不 start。
