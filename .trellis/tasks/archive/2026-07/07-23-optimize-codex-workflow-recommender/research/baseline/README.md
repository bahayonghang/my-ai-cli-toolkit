# 1.0.0 baseline

Captured: 2026-07-23

Scope: deterministic local package checks and command-help probes only. No raw
doctor, config, auth, provider, environment-value, MCP-list, or plugin-list
output was persisted.

## Package checks

- `python scripts/check.py <skill-dir> --json`: pass, no warnings.
- `validate_skill.py <skill-dir>`: fail, `Missing agents/interface.yaml`.
- `resource_boundary_check.py <skill-dir>`: fail, estimated initial load
  `2079 > 1000`; five references contribute 4,512 deferred tokens.
- Trigger eval, output eval, contract tests, manifest, and reports: absent.

## Package inventory

- `SKILL.md`: 8,338 bytes, version `1.0.0`.
- `references/`: five Markdown files.
- `agents/`, `evals/`, `tests/`, `reports/`, `manifest.json`: absent.

## Local CLI probe

- `codex --version`: `codex-cli 0.145.0`.
- Read-only help confirms `mcp`, `plugin`, `doctor`, `features`, `exec`,
  `review`, `resume`, `fork`, `sandbox`, and `app` subcommands.
- `codex mcp --help`: list/get/add/remove/login/logout.
- `codex plugin --help`: add/list/marketplace/remove.
- `codex doctor --help`: supports redacted JSON and summary views.

These are dated baseline facts, not permanent compatibility claims.

## Public docs baseline

Generated Chinese and English pages show version `1.0.0`, five reference files,
and no detected Node tests.
