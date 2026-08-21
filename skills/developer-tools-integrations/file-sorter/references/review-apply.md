# Review and apply

## Authorization

A request to organize a folder authorizes `scan` and `assemble-plan` only.

`--execute` on `apply` or `undo` requires this-turn approval of the shown `plan_id` or undo sidecar. Do not treat an earlier “整理这个文件夹” as apply permission.

## Operations

- `categorize`: move to `scan_root/category/subcategory/` (omit subcategory with `--no-subcategory`), keep the original filename unless uniquified.
- `rename`: rename in the source directory.
- `categorize-and-rename`: move and use `suggested_name`.

## Apply gates

Default is dry-run: no directories created, no moves.

`--execute` requires `ok_to_apply`. Each item must still exist, must not be a symlink, and must match planned `source_size` and `source_mtime_ns`. The destination must not already exist unless it is the source itself.

Failure stops the run. Completed moves stay. The undo sidecar lists only completed moves. A later failed `--execute` of the same plan does not overwrite a non-empty undo file with an empty one.

## Undo

Default dry-run. `--execute` moves each sidecar destination back to source when the destination exists, the size matches, and the source path is free. It does not overwrite.

## Prohibited

- Deleting user files
- Following symlinks
- Writing outside the scan root
- Agent-side `mv` / `Move-Item`
