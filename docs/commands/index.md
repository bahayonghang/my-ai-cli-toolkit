# Commands Overview

This section documents the command catalog shipped from `content/commands/`.

## How the command catalog works

- Source files live under `content/commands/`
- Install targets and destination folders are resolved through `platforms.toml` and `mcs-core`
- Some platforms reuse another platform's source directory through `fallback_commands_source`

## Read this section with two layers in mind

1. **Source directories**: what the repository currently stores under `content/commands/`
2. **Installed platforms**: where MCS installs those commands for a specific target

The two are related, but they are not always one-to-one.

## Start here

- [Catalog](/commands/catalog): current source directories, platform mapping, and command families

## Command Families

| Family | Description | Commands |
|--------|-------------|----------|
| [cc](/commands/cc) | Command creation and agent authoring | create-command, meta-agent |
| [cli](/commands/cli) | CLI tool initialization and code review | cli-init, codex-review |
| [gh](/commands/gh) | Git operations and GitHub integration | commit, fix-issue, review-pr |
| [issue](/commands/issue) | GitHub issue management | discover, discover-by-prompt, execute, new, plan, queue |
| [kiro](/commands/kiro) | Kiro IDE integration | design, execute, spec, task, vibe |
| [memory](/commands/memory) | Memory system management | 14 commands for memory generation, loading, and updates |
| [task](/commands/task) | Task management | breakdown, create, execute, replan |
| [workflow](/commands/workflow) | Development workflows | ~30 commands including brainstorm, session, tools, ui-design sub-families |
| [zcf](/commands/zcf) | Git utilities | git-cleanBranches, git-rollback, git-worktree, init-project |

## Standalone Commands

- [export-summary](/commands/export-summary): session context export flow
- [import-summary](/commands/import-summary): summary import flow
- [Utilities](/commands/utilities): enhance-prompt, version

## Related guide pages

- [Commands Guide](/guide/commands)
- [Installation](/guide/installation)
