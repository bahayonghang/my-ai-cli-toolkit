# Scan safety

- Scan is read-only. It lists metadata and sizes. It does not move, trash, or delete.
- Skip symbolic links and Windows junctions. Do not follow reparse points when sizing children.
- `--output` must be absolute. The helper writes UTF-8 with LF. Do not use PowerShell `>` to capture JSON.
- Windows default roots: `%LOCALAPPDATA%`, `%APPDATA%`, `%TEMP%`, `%USERPROFILE%\Downloads`, and existing development cache directories listed in `scripts/scan.py`. The whole user profile and Program Files are omitted unless `--include-system-apps`. Optional `--program-files` / `--program-files-x86` override those roots and must be absolute.
- Unreadable directories enter `denied` and a permission-denied group row.
- Linux: exit 2, `unsupported_platform`.
- Do not upload the scan JSON to a remote model API unless the user asks in this turn.
