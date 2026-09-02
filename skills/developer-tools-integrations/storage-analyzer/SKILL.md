---
name: storage-analyzer
description: "Use when the user wants a read-only disk/storage analysis on macOS or Windows: 磁盘满了, C盘满了, 空间不够, 存储分析, 占空间, 清缓存, storage analysis, disk cleanup, or Chinese 内存满了 when they mean disk space. Scans known hotspots, classifies cache vs user data vs keep, and writes an HTML report with copyable commands. After this-turn approval of shown paths, may start a local report server that only moves allowlisted cache paths to Trash. Do not use for RAM/process memory, Windows dev-process cleanup, Downloads file sorting, startup-app optimization, or Linux-only hosts."
category: developer-tools-integrations
tags:
  - disk
  - storage
  - cleanup
  - windows
  - macos
  - cache
version: 0.1.0
allowed-tools: Read, Glob, Grep, Bash(python *), Bash(py *)
metadata:
  owner: lyh
  review_cadence: quarterly
  mode: governed
---

In the commands below, `<skill-dir>` is this skill's base directory, announced when the skill loads. Substitute the literal path. On Windows, `py -3` may replace `python`.

Default: scan and write a static HTML report. Do not start `server.py` until the user approves the shown absolute paths in this turn.

## Routing

- Disk full, C: drive, storage analysis, cache cleanup: this skill.
- RAM / which process uses memory: refuse.
- Windows dev-process leftover trees: `windows-dev-process-cleanup`.
- Downloads categorize/rename: `file-sorter`.
- Startup apps: refuse; this skill does not disable startup items.
- Linux hosts: refuse. `scan.py` exits 2 with `unsupported_platform`.

## Workflow

1. Scan (read-only). `--output` must be an absolute path. Do not capture JSON with PowerShell `>`.

```text
python "<skill-dir>/scripts/scan.py" --output <abs-scan.json>
```

Windows default groups: AppData Local/Roaming, Temp, Downloads, existing dev cache roots. Do not pass `--include-system-apps` unless the user asked to size Program Files.

2. Read [classification.md](references/classification.md) and the OS file: [windows.md](references/windows.md) or [macos.md](references/macos.md). Write `analysis.json` with `top5`, `green`, `yellow`, `red`, `summary`. Green `trash_paths` must sit under [cache-prefixes.json](references/cache-prefixes.json).

3. Build the static report:

```text
python "<skill-dir>/scripts/build_report.py" <abs-analysis.json> --output <abs-report.html>
```

Open the HTML for the user. Summarize estimated reclaim, the first two actions, and the highest-risk item.

4. After this-turn approval of the exact trash/open paths, start the local server in the background and give the user `REPORT_URL`:

```text
python "<skill-dir>/scripts/server.py" <abs-analysis.json> --no-browser
```

The server accepts `trash` and `open` only. `rm` is disabled. Green trash still has to match the prefix table. Stop the server when the user is done.

Do not call `rm`, `Remove-Item`, or `SHFileOperation` on user paths. Trash goes only through `server.py`.

## Output

Report scan path, report path, denied directories, and whether the session stayed on the static report. Mark real Recycle Bin execution, isolated install, provider comparison, and human blind review as `missing evidence`.

## Resources

- [scan-safety.md](references/scan-safety.md)
- [classification.md](references/classification.md)
- [report-schema.md](references/report-schema.md)
- [cache-prefixes.json](references/cache-prefixes.json)
- [windows.md](references/windows.md)
- [macos.md](references/macos.md)
