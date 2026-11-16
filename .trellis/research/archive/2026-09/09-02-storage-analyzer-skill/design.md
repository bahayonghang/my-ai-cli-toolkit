# design.md — storage-analyzer

依据：`prd.md`（R1–R11 / A1–A9 / D1–D10）、`research/source-audit.md`、`.trellis/spec/guides/skill-authoring-conventions.md`、DTI `AGENTS.md`。

## D1 交付与模式

单任务交付 suite skill、suite `AGENTS.md`、docs catalog、Governed 证据。不拆父子任务。不发布。用户批准本规划摘要前不得 `task.py start`。

成熟度：Governed。版本 `0.1.0`。

```text
skills/developer-tools-integrations/storage-analyzer/
├── SKILL.md
├── README.md
├── LICENSE
├── THIRD_PARTY_NOTICES.md
├── agents/interface.yaml
├── references/macos.md
├── references/windows.md
├── references/scan-safety.md
├── references/classification.md
├── references/report-schema.md
├── references/cache-prefixes.json
├── scripts/scan.py
├── scripts/build_report.py
├── scripts/server.py
├── scripts/paths.py          # 前缀展开、越界、HTML 安全 dumps；scan/server/build_report 共用
├── assets/report_template.html
├── tests/storage-analyzer.test.mjs
├── tests/fixtures/
├── evals/evals.json
├── evals/trigger_cases.json
├── security/permission_policy.json
└── reports/
```

`allowed-tools: Read, Glob, Grep, Bash(python *), Bash(py *)`。

从 `ref/repo/khazix-skills/storage-analyzer/` 复制脚本、模板、macos/windows 参考后改写。不改 `ref/`。视觉结构可保留；授权与 Windows 扫描必须改。

## D2 路由

| 请求 | 所有者 |
|---|---|
| 磁盘满、C 盘、存储分析、清缓存、占空间、disk cleanup | `storage-analyzer` |
| 「内存满了」且语境是磁盘空间 | `storage-analyzer` |
| 哪个进程吃内存、RAM、活动监视器 | 拒绝；非本 skill |
| Windows 开发进程 / Playwright MCP / UWP 后台 | `windows-dev-process-cleanup` |
| Downloads 分类整理、重命名 | `file-sorter` |
| 开机启动项 | 拒绝；指向未来的 startup optimizer，不在本包实现 |
| Linux 主机存储分析 | 拒绝；`unsupported_platform` |

## D3 运行切分

```text
scan.py --output scan.json          # 只读
  -> agent 读 references/{macos,windows}.md 与 classification.md
  -> agent 写 analysis.json（三灯 + summary）
  -> build_report.py analysis.json report.html
  -> 对话摘要；打开静态 HTML
  -> 仅当用户本轮批准已展示路径列表
       server.py analysis.json --no-browser   # 后台；trash/open
```

LLM 填写黄/红画像与绿灯候选。绿灯 `trash_paths` 能否执行由 `paths.py` 前缀表决定，不由模型说了算。

## D4 扫描契约

```text
python "<skill-dir>/scripts/scan.py" [--output PATH] [--min-kb N] [--include-system-apps]
```

| 退出码 | 含义 |
|---|---|
| 0 | 写出扫描 JSON |
| 1 | 扫描中发生未捕获失败 |
| 2 | 参数非法或平台不受支持 |

`--output` 省略时 JSON 打 stdout（紧凑，无 `indent=2`）。SKILL 始终传 `--output` 到 `tempfile.gettempdir()` 下的文件。`--min-kb` 默认 `51200`。

stdout/文件 JSON：

```text
{
  "generated_at": "...",
  "scan_seconds": 0.0,
  "system": {os, build, arch, user, home, filesystem, disk_total, disk_used, disk_free, purgeable, disk_name, disks[]},
  "groups": { "<name>": [{name, path, size_kb, size_h, denied?}] },
  "denied": ["..."]
}
```

`size_kb` 为整数。`disk_*` 保留人类字符串以兼容模板；另加 `disk_total_bytes` / `disk_used_bytes` / `disk_free_bytes` 供分段条使用，避免只靠 `parseGB`。

### Windows 默认组

| group | 根 |
|---|---|
| appdata_local | `%LOCALAPPDATA%` 一级子项 |
| appdata_roaming | `%APPDATA%` 一级子项 |
| temp | `%TEMP%` 一级子项 |
| downloads | `%USERPROFILE%\Downloads` 一级子项 |
| dev_caches | 下表中已存在的完整根，各计一次大小 |

默认 **不** 把整个 `%USERPROFILE%` 或 Program Files 当作扫描根。`--include-system-apps` 才增加 `program_files` 与 `program_files_x86` 一级子项（仍跳过 junction）。

`dev_caches` 候选（存在才扫）：

- `%USERPROFILE%\.cache`、`.npm`、`.pnpm-store`、`.gradle`、`.m2`、`.nuget\packages`、`.cargo`、`.rustup`、`.bun`
- `%LOCALAPPDATA%\pip\Cache`、`uv\cache`、`Yarn`、`npm-cache`、`pnpm`、`ms-playwright`、`go-build`、`NuGet`
- `%APPDATA%\npm-cache`

一级子项计大小时递归，但跳过 `is_symlink()` / junction / 不可读项。不可读根写入 `denied`。

`system.filesystem`：Windows 用 `GetVolumeInformation`（ctypes）读系统盘；失败则 `"unknown"`，不写死 NTFS。

`system.disks`：仍枚举存在的盘符，只做 `shutil.disk_usage`，不做全盘递归。

### macOS

保留源 `MAC_TARGETS` 与 `MAC_DEV_CACHE_PATHS`，同样跳过 symlink。输出路径与 `--output` 对齐。不把 `/tmp/storage_scan.json` 写进 SKILL。

### Linux

`{"error":"unsupported_platform","platform":...}`，exit 2。

## D5 前缀表与分级

`references/cache-prefixes.json` 按平台列出可展开占位符：`{HOME}`、`{TEMP}`、`{LOCALAPPDATA}`、`{APPDATA}`。

Windows 绿灯前缀（展开后 realpath，比较用 `os.path.normcase`）：

- `{TEMP}`、`{LOCALAPPDATA}/Temp`
- `{LOCALAPPDATA}/pip/Cache`、`{LOCALAPPDATA}/uv/cache`
- `{LOCALAPPDATA}/Yarn`、`{LOCALAPPDATA}/npm-cache`、`{APPDATA}/npm-cache`
- `{HOME}/.cache`、`{HOME}/.npm`、`{HOME}/.pnpm-store`
- `{HOME}/.gradle/caches`、`{HOME}/.m2/repository`
- `{HOME}/.nuget/packages`、`{HOME}/.cargo/registry`
- `{LOCALAPPDATA}/ms-playwright`、`{LOCALAPPDATA}/go-build`
- 浏览器缓存用规则而非整棵 User Data：路径 normcase 后匹配 `google/chrome/user data/*/cache`、`microsoft/edge/user data/*/cache`、`mozilla/firefox/profiles/*/cache2`

macOS 绿灯前缀对齐源 `macos.md` 的 Caches / 开发缓存 / DerivedData / CoreSimulator。

`paths.py`：

- `expand_prefix(spec) -> Path`
- `is_under(path, root) -> bool`（realpath；Windows `normcase`）
- `is_green_trash_path(path) -> bool`
- `html_safe_dumps(obj) -> str`（`json.dumps` 后替换 `<` 为 `\u003c`）

绿灯 `trash_paths`：必须 `is_green_trash_path` 且 `is_under(home)`。  
黄灯 `trash_paths`：必须 `is_under(home)`，不受缓存前缀约束（本轮展示 + 用户批准是授权）。  
红灯：不得出现 `trash_paths`；`app_paths` 只用于 `open`。

Downloads 安装包、文档、容器 UUID **不是** 绿灯前缀。

## D6 报告

```text
python "<skill-dir>/scripts/build_report.py" <analysis.json> [--output PATH]
```

缺 `--output` 时写 `tempfile.gettempdir()/storage-report.html`。成功则打印绝对路径。不要打印 macOS `open`。

最低 schema（缺则 exit 2，不写输出文件）：

- `system.os`、`system.home`、`system.disk_total`、`system.disk_used`、`system.disk_free`
- `green` / `yellow` / `red` / `top5` 为数组（可空）
- `summary.overview` 字符串
- `summary.tier_stats.green|yellow|red` 字符串
- `summary.priority`、`summary.long_term` 为数组

校验每个 `green[].trash_paths` 条目：失败则 exit 2，并在 stderr 写被拒路径。

注入：`html_safe_dumps(analysis)` 替换 `__REPORT_DATA__`；`__DELETE_CONFIG__` 为 `null`。

模板改动：

- 页脚改为「默认只读报告；废纸篓按钮仅在本轮批准后的本地服务中出现」。
- `delBlock` 去掉「直接删除」按钮。
- 服务模式下绿灯只渲染「移到废纸篓」；黄灯渲染「打开」与可选「移到废纸篓」；红灯只「打开」。

阅读流保持源顺序。`tier_stats` 优先用 `*_bytes` 字段；没有则回退 `parseGB`。

## D7 本地服务

```text
python "<skill-dir>/scripts/server.py" <analysis.json> [--no-browser] [--stub-actions PATH]
```

启动时再跑与 `build_report.py` 相同的 schema + 绿灯前缀校验。失败 exit 2，不起服务。

绑定 `127.0.0.1:0`。打印一行 `REPORT_URL=http://127.0.0.1:<port>/` 便于 agent 抓取。默认不调用 `webbrowser.open`（`--no-browser` 为默认）；仅当用户本轮要求打开浏览器且已批准路径时，SKILL 才允许省略 `--no-browser`。为减少误开删除页，SKILL 示例始终带 `--no-browser`，并让 agent 把 URL 发给用户。

`POST /action` JSON：`{token, mode, paths}`。

| mode | 允许集合 |
|---|---|
| `open` | 黄灯 `path`、红灯 `app_paths`、以及已批准的 trash 路径（realpath 存在） |
| `trash` | 绿灯通过前缀表的 `trash_paths` ∪ 黄灯 `trash_paths`（均需在 home 内） |
| `rm` | 一律 400 `rm_disabled` |

校验顺序：token → Host ∈ `{127.0.0.1,localhost}` → Origin 为空或以 `http://127.0.0.1` / `http://localhost` 开头 → mode → 每条 path realpath 在对应 allow 集合 → home 越界检查（Windows `normcase`）。

Windows 废纸篓：`ctypes.create_unicode_buffer(abspath + "\0")`，保证双 NUL 且缓冲区在 `SHFileOperationW` 返回前保持存活。返回码非 0 则 500。macOS 保留 osascript Finder delete，失败再 `~/.Trash` 改名移动。

`--stub-actions PATH`：不调用 OS 废纸篓/打开，把 `{mode, path, ok}` 追加到该 JSONL。测试只用这条路径。

SKILL 合同：列出将 trash/open 的绝对路径 → 用户明确批准 → 后台启动服务。agent 不得在同一轮未批准时启动。

阻塞：`serve_forever` 仍会阻塞，因此 SKILL 要求后台运行（宿主 Bash 后台 / PowerShell `Start-Process` 不作为合同；写「在后台运行该命令，读到 REPORT_URL 后把 URL 交给用户」）。

## D8 测试

`tests/storage-analyzer.test.mjs`，探测 `python3` / `python` / `py -3`，与 file-sorter 相同。全部在 `os.tmpdir()` 夹具中进行。

必测：

1. Linux 或伪造 `sys.platform` 不作为本测试目标；在 win32/darwin 上 scan exit 0。
2. 默认 scan 不进入夹具 `Program Files` 目录树；`--include-system-apps` 才出现该组。
3. junction/symlink 子树不递归（win32 建 junction；其他平台用 symlink；不支持则 skip）。
4. `--output` UTF-8 JSON，含 `groups` 与 `denied`。
5. `build_report.py` 缺 `system.os` → exit 2，输出文件不存在。
6. 绿灯 `trash_paths` 指向夹具 `Documents\secret` → build_report 与 server load 均失败。
7. 绿灯路径在 `{TEMP}` 夹具前缀内 → 校验通过。
8. 分析字段含 `</script>` → HTML 不含原始 `</script>`，含 `\u003c`。
9. 静态报告无 token 字符串。
10. `server.py --stub-actions` 对 `mode=rm` 返回非 ok / 进程侧可测的拒绝（可用短请求脚本或 server 增加 `--check-allowlist` 子命令避免真 HTTP 长时间占用）。

为避免测试里挂 `serve_forever`，`server.py` 增加：

```text
python "<skill-dir>/scripts/server.py" --check-allowlist <analysis.json>
```

stdout JSON：`{ok, rm_allowed:false, green_trash:[], rejected:[]}`，exit 0/2。HTTP 服务仍保留给人工使用。Node 测试默认打 `--check-allowlist` 与 `build_report.py`，不启动 HTTP。

可选：`--print-shfileop-buffer` 仅在 Windows 测双 NUL 长度 ≥ path+2。

## D9 入口与 suite

`description` 草案（实施时可微调，须 <1024 且无 `<>`）：

> Use when the user wants a read-only disk/storage analysis on macOS or Windows: 磁盘满了, C盘满了, 空间不够, 存储分析, 占空间, 清缓存, storage analysis, disk cleanup, or Chinese 内存满了 when they mean disk space. Scans known hotspots, classifies cache vs user data vs keep, and writes an HTML report with copyable commands. After this-turn approval of shown paths, may start a local report server that only moves allowlisted cache paths to Trash. Do not use for RAM/process memory, Windows dev-process cleanup, Downloads file sorting, startup-app optimization, or Linux-only hosts.

`agents/interface.yaml`：`display_name: Storage Analyzer`；`side_effect_policy` 写明 scan/build_report 只读，server trash 需本轮批准；`rm` 禁用。

`security/permission_policy.json` 能力：`filesystem_scan` approved；`filesystem_trash` approved（仅 server trash + 前缀/home）；`filesystem_delete` not-approved；`network` 仅 127.0.0.1 回环。

更新 DTI `AGENTS.md`：suite 列表加入 `storage-analyzer`；allowed-tools 表一行 `Read, Glob, Grep, Bash(python *), Bash(py *)`。

房规 evals 至少：

正例：C 盘满了；清缓存；storage analysis；磁盘占用 Top；中文「内存满了」且说的是 C 盘。  
负例：哪个进程吃内存；Playwright MCP 进程堆积；整理 Downloads；关掉开机启动；在 Linux 服务器上清盘。

## D10 许可、证据、回滚

- `LICENSE` 保留 MIT 与「数字生命卡兹克」版权，可附加本仓库贡献者行。
- `THIRD_PARTY_NOTICES.md` 提名 `khazix-skills/storage-analyzer`。
- Qiaomu：`validate_skill.py`、`trigger_eval.py`、`export_skill_ir.py`。catalog 检索在实施 P0 补 `reports/prior-art-research.md`；失败则 missing evidence。
- install / provider / 盲评 / 真实 `SHFileOperation`：missing evidence。
- 回滚：删除 `skills/developer-tools-integrations/storage-analyzer/`，还原 `AGENTS.md` 与 `docs/`（`just docs-sync`）。`--stub-actions` 保证测试无废纸篓残留。
- 服务关掉后按钮失效（源行为保留）。废纸篓项由用户在资源管理器恢复；无额外 undo sidecar（v1 不发明第二套回收账本）。

## Tradeoffs

- 保留 `server.py` 而不做纯报告包：用户确认要变更通道，但默认静态，避免源包把删除当默认。
- v1 去掉 `rm`：少一个不可逆接口，测试面更小。代价是清空废纸篓前磁盘数字不下降；SKILL 必须写明。
- 黄灯 trash 仍允许：给「B 站离线目录」这类已展示安全子路径留可逆清理。残余风险是模型把用户文档标进黄灯 `trash_paths`；缓解是本轮列出绝对路径并要求明确批准，外加 home 越界检查。
- Windows 不默认扫 Program Files：扫描时间可控。大应用占用改由「系统设置 > 应用」写进 `long_term`，或用户显式要求后再加 `--include-system-apps`。
