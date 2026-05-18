# Commands Overview

This section documents the command sources that currently exist under `content/platforms/*/commands/`.

## How the command catalog works

- Source files live under `content/platforms/<platform>/commands/` when that platform has command sources in this repository.
- Install targets and destination folders are resolved through `platforms.toml` and `mcs-core`.
- Some platforms declare fallback sources, but fallback only works when that source directory exists.

## Current live sources

| Platform source | Commands currently present |
|-----------------|----------------------------|
| Claude | `init-projects.md` |
| Gemini | `export-summary`, `import-summary`, `plan/new`, `plan/impl` |
| Antigravity | `export-summary`, `import-summary` |
| Trae | `export-summary`, `import-summary` |
| Windsurf | `export-summary`, `import-summary` |

## Read this section with two layers in mind

1. **Source directories**: what the repository currently stores under `content/platforms/*/commands/`.
2. **Installed platforms**: where MCS installs those commands for a specific target.

The two are related, but they are not always one-to-one. For example, Codex has prompt sources under `content/platforms/codex/prompts/`, not a live `commands/` source tree.

## Start here

- [Catalog](/commands/catalog): current source directories, platform mapping, and command inventory.
- [export-summary](/commands/export-summary): session context export flow used by Gemini, Antigravity, Trae, and Windsurf.
- [import-summary](/commands/import-summary): summary import flow used by Gemini, Antigravity, Trae, and Windsurf.

## Historical command family pages

Older pages for `cc`, `cli`, `gh`, `issue`, `kiro`, `memory`, `task`, `workflow`, `zcf`, and `utilities` remain as historical references only. They are no longer part of the live sidebar because the matching command source families are not present in `content/platforms/*/commands/`.

## Related guide pages

- [Commands Guide](/guide/commands)
- [Installation](/guide/installation)
