# Scan safety

`--root` must be an absolute directory. A symlink root is rejected. The helper does not follow symlinks.

## Always skipped

- `.DS_Store`, `Thumbs.db`, `desktop.ini`
- Hidden entries, unless `--include-hidden` (Windows hidden attribute; other platforms names starting with `.`)
- Symlinks
- Strong protected project directories, including the scan root

Skipped rows include `id`, `name`, `reason`, and `path`.

## Strong protected roots

If the scan root matches a strong rule, `ok_to_scan` is false and `entries` is empty.

| id | Markers |
|---|---|
| unity | `Assets` and `ProjectSettings/ProjectVersion.txt` |
| unreal | `Config`, `Content`, and a `.uproject` child |
| godot | `project.godot` |
| git | `.git` |
| node | `package.json` plus one of lockfile / `node_modules` / `src` |
| python | `pyproject.toml` |
| rust | `Cargo.toml` |
| go | `go.mod` |
| gradle | settings + build/gradlew pair |
| dotnet | `.sln` / `.csproj` / `.fsproj` / `.vbproj` child |
| xcode | `.xcodeproj` / `.xcworkspace` child |
| blender | `.blend` child plus an assets/textures/materials/renders/cache sibling |

`blender-file` (only a `.blend` child) is weak: recorded in `notes`, not skipped.

## Target bound

Every destination must stay under the scan root. Cross-parent file lists are rejected.
