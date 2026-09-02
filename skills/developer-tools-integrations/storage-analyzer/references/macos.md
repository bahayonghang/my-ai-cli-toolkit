# macOS layout

Scan home, Library, Caches, Containers, Group Containers, Application Support, Applications, Downloads, and known dev caches.

| Location | Typical light |
|---|---|
| `~/Library/Caches`, `~/.cache`, pip/uv/npm | Green |
| Xcode DerivedData, CoreSimulator | Green |
| UUID Containers, Application Support data | Yellow |
| `/Applications/*.app` | Red only when duplicate or uninstall is requested |

UUID containers: list `Data/Documents` / `Data/Library` read-only to find the bundle id. Do not modify files during scan.

Long-term: `brew cleanup`, Storage settings, Time Machine local snapshot policy.

Trash uses Finder `osascript` after this-turn approval. Hard delete is disabled.
