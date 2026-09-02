# Windows layout

Default scan groups: `%LOCALAPPDATA%`, `%APPDATA%`, `%TEMP%`, Downloads, and existing dev caches. Program Files is opt-in (`--include-system-apps`). Other drives are listed with `disk_usage` only.

| Location | Typical light |
|---|---|
| `%TEMP%`, `%LOCALAPPDATA%\Temp` | Green |
| pip / uv / npm / yarn / nuget / cargo registry | Green |
| Chrome/Edge `User Data\*\Cache` | Green |
| Browser profile (non-Cache) | Yellow |
| Downloads installers | Yellow |
| `%LOCALAPPDATA%\Packages` app data | Yellow |
| Program Files app bodies | Red only when the user wants to uninstall; otherwise blue |

System reclaim (not lights): Storage Sense, `cleanmgr`, DISM StartComponentCleanup. Do not hand-delete WinSxS, pagefile, or hiberfil.

v1 Recycle Bin: `SHFileOperationW` with a live double-NUL buffer, only after this-turn path approval. Hard delete is disabled. Emptying Trash is required before free space rises.
