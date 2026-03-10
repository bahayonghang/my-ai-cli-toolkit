# `content/external-skills/`

Third-party skill registry and installer tooling live here.

This directory is intentionally separate from the first-party catalog in `content/skills/`.

## Main files

| File | Purpose |
|------|---------|
| `external-skills.toml` | Registry of external skill definitions |
| `install.py` | CLI installer |
| `install_tui.py` | TUI installer |
| `CLAUDE.md` | Contributor guidance for this module |

## Supported install types

- `npm-cli`
- `npx`
- `pip-cli`
- `git`
- `vercel`

## Common usage

```bash
cd content/external-skills
uv run python install.py list
uv run python install.py info <skill-name>
uv run python install.py install <skill-name> --target claude
```

## Relationship to MCS

- `mcs-core` can load this registry as external catalog data
- `mcs-web` exposes external-skill flows through its API layer
- this directory does not replace the first-party repository catalog
