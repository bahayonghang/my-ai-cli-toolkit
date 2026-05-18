# Commands Catalog

## Source directories in `content/platforms/*/commands/`

| Source directory | Current command files |
|------------------|-----------------------|
| `content/platforms/claude/commands/` | `archive-planning.md`, `init-projects.md` |
| `content/platforms/gemini/commands/` | `export-summary.toml`, `import-summary.toml`, `plan/new.toml`, `plan/impl.toml` |
| `content/platforms/antigravity/commands/` | `export-summary.md`, `import-summary.md` |
| `content/platforms/trae/commands/` | `export-summary.md`, `import-summary.md` |
| `content/platforms/windsurf/commands/` | `export-summary.md`, `import-summary.md` |

> Note: `content/platforms/gemini/commands/import- summary.toml` is also present as a compatibility filename. Treat `import-summary.toml` as the canonical live source.

## Installed platform mapping

| Installed platform | Command source | Fallback source | Installed folder |
|--------------------|----------------|-----------------|------------------|
| Claude | `claude` | none | `~/.claude/commands/` |
| Codex | `codex` prompts, then configured command source | `claude` in defaults | `~/.codex/prompts/` |
| Gemini | `gemini` | none | `~/.agents/commands/` |
| Qwen | `qwen` | `claude` in defaults | `~/.qwen/commands/` |
| Kiro | `kiro` | `claude` in defaults | `~/.kiro/steering/` |
| Qoder | `qoder` | `claude` in defaults | `~/.qoder/commands/` |
| Trae | `trae` | `claude` in defaults | `~/.trae/commands/` |
| Trae CN | `trae` | `claude` in defaults | `~/.trae-cn/commands/` |
| OpenCode | `opencode` | `claude` in defaults | `~/.config/opencode/commands/` |
| Antigravity | `antigravity` | none | `~/.gemini/antigravity/workflows/` |
| Windsurf | `windsurf` | none | `~/.codeium/windsurf/workflows/` |

The mapping table describes install configuration. It does not imply that every named command source directory exists in this checkout.

## Live command inventory

### Claude

- `archive-planning.md`: move active root planning files into `.plannings/<timestamp>-<feature>/`.
- `init-projects.md`: project initialization prompt for creating repository guidance files.

### Gemini

- `export-summary.toml`
- `import-summary.toml`
- `plan/new.toml`
- `plan/impl.toml`

### Antigravity / Trae / Windsurf

- `export-summary.md`
- `import-summary.md`

## Related non-command prompt sources

Codex currently keeps prompt sources under `content/platforms/codex/prompts/`, including `archive-planning.md`, `init-projects.md`, and the `codex-companion/` prompt set. Codex base guidance is stored under `content/platforms/codex/rules/AGENTS.md`.

## Historical pages

The old command-family docs (`cc`, `cli`, `gh`, `issue`, `kiro`, `memory`, `task`, `workflow`, `zcf`, and `utilities`) describe removed source families. They are retained outside the live sidebar as compatibility references and should not be treated as current inventory.

## Notes

- For exact file-level truth, inspect `content/platforms/*/commands/` directly.
- For how MCS resolves target paths and fallbacks, inspect `platforms.toml` and `mcs-core/src/config/platform.rs`.
- When adding or removing command sources, update this page and run `python docs/scripts/audit_sync.py`.
