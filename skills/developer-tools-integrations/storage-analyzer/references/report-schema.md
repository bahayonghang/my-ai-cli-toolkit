# Analysis JSON

Required keys:

- `system.os`, `system.home`, `system.disk_total`, `system.disk_used`, `system.disk_free`
- `top5`, `green`, `yellow`, `red` (arrays, may be empty)
- `summary.overview` (string)
- `summary.tier_stats.green|yellow|red` (strings that start with a size, e.g. `约 1.2 GB`)
- `summary.priority`, `summary.long_term` (arrays)

Optional: `system.disk_total_bytes` / `disk_used_bytes` / `disk_free_bytes` for the bar. `denied` paths.

Green item: `name`, `path`, `size_estimate`, `trash_paths`, optional `commands`, `kill_processes`.
Yellow item: `name`, `path`, `size`, `content_profile`, `why_manual`, `disposal`, `risk`, optional `trash_paths`, `open_note`.
Red item: `name`, `path`, `size`, `why_keep`, `indirect_release`, optional `app_paths`.

`build_report.py` exits 2 and writes no HTML when schema or green prefixes fail. Static HTML sets delete config to `null`.
