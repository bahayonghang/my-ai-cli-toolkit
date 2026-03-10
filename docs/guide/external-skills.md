# External Skills

## Overview

Third-party skills are managed from `content/external-skills/`.

This area is separate from the first-party repository catalog under `content/skills/`.

It contains:

- `external-skills.toml`: registry data
- `install.py`: CLI installer
- `install_tui.py`: terminal UI for the external catalog
- `README.md`: registry usage and supported install types

## Supported install types

The registry currently documents flows for:

- `npm-cli`
- `npx`
- `pip-cli`
- `git`
- `vercel`

## Relationship to MCS

MCS consumes this catalog through `mcs-core` and exposes external-skill functionality in the web API.

That means:

- first-party catalog lives in `content/skills/`
- third-party catalog lives in `content/external-skills/`
- docs should describe them separately

## When to use it

Use external skills when:

- the capability is maintained outside this repository
- installation depends on another package manager or remote repo
- you want to keep third-party lifecycle separate from the first-party catalog

## CLI examples

```bash
cd content/external-skills
uv run python install.py list
uv run python install.py agents
uv run python install.py info <skill-name>
uv run python install.py install <skill-name> --target claude
```

For more detail, inspect the local README in `content/external-skills/README.md`.
