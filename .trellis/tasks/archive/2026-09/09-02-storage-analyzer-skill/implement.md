# implement.md — storage-analyzer

执行前提：用户批准本规划摘要后，才运行 `task.py start`。当前不得 start。

产品路径白名单：

- `skills/developer-tools-integrations/storage-analyzer/**`
- `skills/developer-tools-integrations/AGENTS.md`
- `docs/**`（仅 `just docs-sync` 生成）

基线脏路径（允许继续存在，禁止纳入产品暂存集）：任务目录 `.trellis/tasks/09-02-storage-analyzer-skill/**`。

实施前加载 `trellis-before-dev`，并读 DTI `AGENTS.md` 与 skill-authoring conventions。

## P0 前置

- [x] 任务仍为 `09-02-storage-analyzer-skill`，用户已批准摘要，状态才可切到 `in_progress`。
- [ ] 记录 `git status --porcelain -uall` 作为基线。
- [ ] 读取 `prd.md`、`design.md`、`research/source-audit.md`。
- [ ] 复制源树到目标目录（不改 `ref/`）：

```powershell
New-Item -ItemType Directory -Force -Path "skills/developer-tools-integrations/storage-analyzer" | Out-Null
Copy-Item -Recurse -Force "ref/repo/khazix-skills/storage-analyzer/*" "skills/developer-tools-integrations/storage-analyzer/"
```

- [ ] 先例：对磁盘清理 / storage analyzer / disk cleanup skill 跑 qiaomu `research_prior_art.py`（或 `npx skills find` + SkillsMP）。结果写入 `reports/prior-art-research.md`。目录失败则写 missing evidence，不阻断迁入。

验证：目标目录存在且 `ref/` 无 diff。回滚：删除目标 skill 目录。

## P1 共享路径与扫描（R4、R5、A4、A5）

- [ ] 新增 `scripts/paths.py`：前缀展开、home 越界、`normcase`、`html_safe_dumps`、`is_green_trash_path`。
- [ ] 新增 `references/cache-prefixes.json`，内容按 `design.md` D5。
- [ ] 改写 `scan.py`：argparse、`--output` / `--min-kb` / `--include-system-apps`、Windows 默认热点、跳过 junction/symlink、`disk_*_bytes`、filesystem 探测、Linux exit 2。
- [ ] 夹具测试覆盖 D8 条目 1–4。

```powershell
node --test "skills/developer-tools-integrations/storage-analyzer/tests/storage-analyzer.test.mjs"
just python-check
```

回滚：删除 skill 目录。

## P2 报告与模板（R6、A6）

- [ ] `build_report.py`：schema 校验、绿灯前缀校验、`--output`、HTML 安全注入、失败不写半份文件。
- [ ] 改 `report_template.html`：去掉直接删除按钮；页脚与只读默认文案；服务模式仅 trash/open。
- [ ] 测试 D8 条目 5–9。

回滚：恢复模板与 `build_report.py`。

## P3 可选服务（R11、A7）

- [ ] `server.py`：默认 `--no-browser`；打印 `REPORT_URL=`；拒绝 `rm`；Host + Origin；Windows 双 NUL 缓冲区；`--stub-actions`；`--check-allowlist`。
- [ ] 测试 allowlist 拒绝 Documents、接受 Temp 前缀、`rm_allowed=false`。不启动长期 HTTP，不调用真实 `SHFileOperationW`。
- [ ] Windows 上可选打印 SHFileOperation 缓冲区长度（stub），真实废纸篓标 missing evidence。

回滚：去掉 `server.py` 改动或整目录删除。

## P4 入口、suite、evals（R1–R3、R8、R9、A1–A3）

- [ ] 重写 `SKILL.md`：frontmatter、默认静态流程、批准后才启动 server、`<skill-dir>`、RAM/进程/file-sorter/进程清理/开机项排除。
- [ ] `references/scan-safety.md`、`classification.md`、`report-schema.md`；更新 macos/windows 参考，使其与默认扫描组一致。
- [ ] `agents/interface.yaml`、`security/permission_policy.json`、`README.md`、`LICENSE`、`THIRD_PARTY_NOTICES.md`。
- [ ] `evals/evals.json` 与 `evals/trigger_cases.json`。
- [ ] 更新 `skills/developer-tools-integrations/AGENTS.md`。

```powershell
just skills-check
python scripts/check.py "skills/developer-tools-integrations/storage-analyzer"
```

回滚：还原 `AGENTS.md`，删除 skill 目录。

## P5 证据与 docs（R10、A8、A9）

- [ ] qiaomu：`validate_skill.py`、`trigger_eval.py`、`export_skill_ir.py`。失败保存真实 stderr。
- [ ] `reports/creation-handoff.md`、`reports/secret-scan.md`（未跑则 missing evidence）。install / provider / 盲评 / 真实废纸篓：missing evidence。
- [ ] `just docs-sync`、`just ci`。
- [ ] `git status --porcelain -uall` 与 `git diff --name-only`。产品改动 ⊆ 白名单。`ref/` 必须干净。

回滚：docs 可重跑 `just docs-sync`；reports 可删除后重生成。

## Follow-up before `task.py start`

- 规划摘要已展示。
- 用户在后续消息中明确批准该摘要。
- 未把已关闭的变更通道问题重新打开。
- jsonl 含真实 spec/research 条目。
