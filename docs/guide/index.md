# Introduction

This site documents the current repository shape of [`my-claude-code-settings`](https://github.com/bahayonghang/my-claude-code-settings), not the older template project layout that some historical pages still referenced.

## What lives in this repository

- `content/skills/` contains installable skill directories, organized by category.
- `content/commands/` contains slash-command and workflow sources for different platforms.
- `content/agents/` contains markdown agent definitions grouped into `ccw` and `specialist`.
- `content/skills/external-skills.toml` contains the external skill registry metadata used by MCS Web.
- `content/hooks/` and `content/memorys/` contain runtime support files.
- `mcs/` is a Rust workspace with a shared core library, a terminal UI, and a web app.

## Recommended entrypoints

### Use MCS TUI

```bash
just mcs
```

- Best for browsing installed vs source content.
- Supports platform switching, diff view, batch install/uninstall, and multi-sync.

[Open the TUI guide →](/guide/mcs)

### Use MCS Web

```bash
just web
```

- Runs the Axum backend and React UI together for a browser-based workflow.
- Best for richer detail drawers, install target dialogs, and catalog browsing.

[Open the MCS Web guide →](/guide/mcs-web)

### Install the skill catalog directly

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills
```

- Fast path when you only need the skills catalog.
- Does not replace the repository-level MCS tooling or command catalogs.

## Documentation map

- [Installation](/guide/installation): clone, run, build, and supported platform paths
- [MCS TUI](/guide/mcs): keyboard flow, install model, migration, troubleshooting
- [MCS Web](/guide/mcs-web): backend/UI startup, pages, install flows
- [MCS Architecture](/guide/mcs-architecture): `mcs-core`, `mcs-tui`, `mcs-web`
- [Commands](/guide/commands): how `content/commands` maps to installed command locations
- [Runtime Files](/guide/runtime-files): hooks, memory/runtime files, prompt-related assets
- [External Skills](/guide/external-skills): registry format and install flow for third-party skills
- [Creating Skills](/guide/creating-skills): adding new `content/skills/<category>/<skill-name>/`

## Notes on legacy pages

Some historical pages used older names such as `my-claude-skills`, `skills/`, `install.sh`, `install.ps1`, or `src/install.py`. Those references are no longer the source of truth for this repository. Where compatibility pages remain, they now redirect readers to the current model.
