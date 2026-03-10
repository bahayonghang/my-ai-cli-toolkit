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
- [export-summary](/commands/export-summary): core summary export flow
- [import-summary](/commands/import-summary): summary import flow
- [git-commit](/commands/git-commit): conventional-commit helper

## Related guide pages

- [Commands Guide](/guide/commands)
- [Installation](/guide/installation)
