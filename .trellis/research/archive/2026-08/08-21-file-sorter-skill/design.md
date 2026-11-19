# design.md — file-sorter 技术设计

依据：`prd.md`（R1–R16 / A1–A10）、`research/source-capability-map.md`、`research/prior-art-research.md`、skill-authoring / helper / error-handling 规范。

## D1 交付与模式

单任务交付 suite skill、suite `AGENTS.md`、docs catalog、Governed 证据。不拆父子任务。不发布。用户批准本规划摘要前不得 `task.py start`。

成熟度：Governed。版本 `0.1.0`。

```text
skills/developer-tools-integrations/file-sorter/
├── SKILL.md
├── README.md
├── THIRD_PARTY_NOTICES.md
├── agents/interface.yaml
├── references/taxonomy.md
├── references/scan-safety.md
├── references/review-apply.md
├── references/naming.md
├── scripts/file_sorter.py
├── tests/file-sorter.test.mjs
├── tests/fixtures/
├── evals/evals.json
├── security/permission_policy.json
└── reports/
    ├── skill-ir.json
    ├── trigger-eval.json
    ├── prior-art-research.md
    ├── creation-handoff.md
    └── secret-scan.md
```

`allowed-tools: Read, Glob, Grep, Bash(python *), Bash(py *)`。文件移动只通过 helper。agent 不得对用户路径调用 `mv`/`Move-Item`。

任务内 `research/trigger-cases.json` 是 Qiaomu trigger eval 源；房规 eval 仍是 `evals/evals.json`。

## D2 路由

| 请求 | 所有者 |
|---|---|
| 整理 Downloads/杂乱目录、分类建夹、建议重命名 | `file-sorter` |
| 清理 Windows 开发进程 | `windows-dev-process-cleanup` |
| 创建/删除 git worktree | `git-worktree` |
| 提交 | `git-commit` |
| 仓库内源码重构 | 开发工作流，本 skill 拒绝 |
| 去重删除、Drive 同步、人生文档柜 | 拒绝并说明 Out of Scope |

## D3 运行切分

```text
scan (helper)
  -> optional content notes (agent Read / vision; never required)
  -> proposals JSON (agent: category, subcategory, optional suggested_name)
  -> assemble-plan (helper: normalize, whitelist, validate, dest, uniqueness, identity)
  -> show plan (agent)
  -> apply --dry-run (helper, default)
  -> this-turn approval of plan_id
  -> apply --execute (helper)
  -> undo sidecar
```

LLM 不得计算 `target_dir`。`assemble-plan` 在 consistent 模式下覆盖图片/文档主类为 `preferred_main_category`。

## D4 helper 契约

```text
python "<skill-dir>/scripts/file_sorter.py" scan --root <abs> [--recursive] [--include-hidden] [--output <json>]
python "<skill-dir>/scripts/file_sorter.py" assemble-plan --scan <json> --proposals <json> [--mode more-consistent|more-refined] [--operation categorize|rename|categorize-and-rename] [--whitelist <json>] [--no-subcategory] [--output <json>]
python "<skill-dir>/scripts/file_sorter.py" apply --plan <json> [--dry-run | --execute] [--undo-output <json>]
python "<skill-dir>/scripts/file_sorter.py" undo --undo <json> [--dry-run | --execute]
```

stdout：一份 JSON，UTF-8，`newline="\n"`。禁止把 PowerShell `>` 当作契约路径。

| 退出码 | 含义 |
|---|---|
| 0 | 命令完成。dry-run 或 `ok_to_apply=false` 仍为 0 |
| 1 | 策略失败：`--execute` 时计划无效、身份漂移、目标已存在、扫描根受保护 |
| 2 | 参数非法、根不存在、跨父目录、路径逃出扫描根 |

未指定 `--execute` 时 apply/undo 视为 dry-run。`--dry-run` 与 `--execute` 同时出现：exit 2。

### scan

- `--root` 必须是绝对路径，解析后仍为目录。
- 不跟随 symlink。
- junk：`.DS_Store`、`Thumbs.db`、`desktop.ini`。
- 默认跳过隐藏项（Windows `FILE_ATTRIBUTE_HIDDEN`；其他平台文件名以 `.` 开头）。`--include-hidden` 才纳入。
- 强保护规则与源表对齐：`unity`、`unreal`、`godot`、`git`、`node`、`python`、`rust`、`go`、`gradle`、`dotnet`、`xcode`、`blender`。`blender-file` 为弱信号，写入 `notes`，不跳过。
- 扫描根匹配强规则：`entries=[]`，`skipped` 含该根，`ok_to_scan=false`。
- 每个文件条目：`path`、`name`、`family`、`allowed_main_categories`、`preferred_main_category`（可 null）、`is_symlink`。

扩展名表与候选主类见 `research/source-capability-map.md` §3.1。脚本内用数据表，不从 C++ 生成。

### assemble-plan

proposals 每条：`source`（必须出现在 scan.entries）、`category`、`subcategory`、可选 `suggested_name`。

后处理顺序：

1. 路径规范化；source 必须在扫描根内且不是 symlink。
2. 白名单互斥校验。
3. consistent：图片/文档主类改为 `preferred_main_category`。
4. 无白名单时制品主类别名归一化；低信息子类 → `General`。
5. 白名单成员检查。
6. `ReviewNameValidator` 等价规则。
7. 操作决定 `target_dir` / `dest_name`：
   - `rename`：`target_dir = source.parent`，`dest_name = suggested_name or source.name`
   - `categorize`：`target_dir = scan_root / category [/ subcategory]`，`dest_name = source.name`
   - `categorize-and-rename`：上者加建议名
8. 同一 `target_dir` 内大小写不敏感去重，冲突 `stem_2.ext`、`stem_3.ext`。
9. 记录 `source_size`、`source_mtime_ns`。
10. 任一条失败则该条 `ok=false` 进入 `rejected`；全部可执行条目合法且存在至少一条时 `ok_to_apply=true`。

whitelist JSON：

```text
{ "categories": [], "subcategories": [], "subcategories_by_category": {} }
```

`subcategories` 与 `subcategories_by_category` 不得同时非空。

### apply

- 读取计划；重跑目标路径仍在扫描根下、标签合法、`ok_to_apply`。
- 每条：源存在、非 symlink、size/mtime 匹配；目标不存在。
- `--execute`：`Path.mkdir(parents=True, exist_ok=True)` 后 `os.replace` 不可用则 `shutil.move`。一条失败则停止。已成功条目写入 undo 并留在结果里。
- undo sidecar：`plan_id`、`created_at`、`entries: [{source, destination, size, mtime_ns}]`。默认写在计划文件旁 `<plan-stem>.undo.json`；stdout 计划则必须 `--undo-output`，否则 `--execute` exit 2。

### undo

- 每条：destination 存在且 size 匹配；source 不存在。
- `--execute` 把 destination 移回 source。失败停止。

## D5 JSON 形状

scan：

```text
kind: file-sorter.scan
scan_root, recursive, ok_to_scan, entries[], skipped[], notes[]
```

plan：

```text
kind: file-sorter.plan
plan_id, scan_root, operation, mode, use_subcategory, ok_to_apply, items[], rejected[], skipped[]
```

`items[]` 含 `source, family, category, subcategory, target_dir, dest_name, operation, source_size, source_mtime_ns, reasons[]`。

apply 结果：

```text
kind: file-sorter.apply-result
plan_id, dry_run, executed, completed[], failed, undo_path
```

## D6 状态机

```text
RESOLVE root
SCAN
  if not ok_to_scan -> report skipped, stop
AGENT proposals (optional content)
ASSEMBLE
SHOW plan_id and items
BRANCH:
  user stops -> end
  user approves this plan_id -> apply --execute
  user asks undo -> undo --execute after showing sidecar
```

SKILL 必须写明：用户说「整理这个文件夹」只授权 scan/assemble。批准用语须指向已展示计划（例如「按 plan_id 执行」或「按这份计划 apply」）。

## D7 权限与回滚

`security/permission_policy.json` 能力：

- `filesystem_scan`：只读扫描指定根。
- `filesystem_move`：仅 apply `--execute` 且 `ok_to_apply=true` 的计划条目。
- `filesystem_undo`：仅 undo sidecar 中的 destination→source。
- 禁止：删除、跟随 symlink、写扫描根外、远程上传、改计划未覆盖的文件。

回滚：

- dry-run：无文件系统变化。
- apply 中途失败：已完成条目保留；undo sidecar 只含已完成条目；报告 `failed`。
- undo：把 sidecar 条目移回。source 已有文件则拒绝该条，不覆盖。

trust：路径、文件名、摘录、白名单是不可信输入。secret scan 扫 skill 包，不扫用户目录。

## D8 验证形状

全部在 `os.tmpdir()` 夹具中进行，不触碰用户 Downloads。

- 文件族：jpg/pdf/msi/zip/mp3/unknown
- consistent vs refined 对同一 `pci_dss.pdf` 提案
- 白名单互斥、分支子类、>30 截断
- 标签非法字符、保留名、主类=子类
- 扫描根 `.git` → 空 entries
- 子目录 Node 项目被 skip
- `.blend` 弱信号不 skip
- dry-run apply 零 mkdir
- execute 移动并写 undo；二次 execute 因源不存在失败
- 改源 mtime 后 execute 失败
- 目标已存在失败
- undo execute 还原
- 跨父目录 scan 列表 exit 2

apply 的真实 `shutil.move` 只允许临时目录。禁止对仓库源码跑 execute。

## D9 兼容与许可

- 不修改其他 skill 正文，除非近邻 eval 需要一句反向路由。
- `AGENTS.md` 增加 `file-sorter` 行：`Read, Glob, Grep, Bash(python *), Bash(py *)`。
- 扩展名表与保护规则按源行为重写，标注提名致谢，不包含 AGPL 源文件。
- 公开质量声明（「更准」）禁止；准确率是 `missing evidence`。
