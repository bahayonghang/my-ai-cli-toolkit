# Classification

Three lights are a cleanup decision list, not a full inventory. Everyday apps and the OS stay in the blue remainder of the disk bar.

## Green

Regenerable caches and temp files. `trash_paths` must be under `cache-prefixes.json` after env expansion and inside the user home. Prefix misses are rejected by `build_report.py` and `server.py`.

Typical: pip/uv/npm/yarn caches, `%TEMP%`, browser `*/Cache` folders matched by the glob rules, Xcode DerivedData on macOS.

## Yellow

User data or judgment cost: Downloads installers, documents, sandbox containers, chat/offline media, `node_modules` inside projects. Give a content profile, risk, and a disposal path. `open` is allowed after this-turn approval. `trash` is allowed only for paths shown and approved in this turn, and only inside the home directory. No `rm`.

## Red

Large apps the user may want to uninstall, duplicate installs, core app data that should not be hand-deleted. Give uninstall steps. `app_paths` may be opened in the file manager. No trash and no `rm`.

## Off-limits for lights

WinSxS, pagefile, hiberfil, APFS snapshots, `C:\Windows`. Put reclaim tips in `summary.long_term`.
