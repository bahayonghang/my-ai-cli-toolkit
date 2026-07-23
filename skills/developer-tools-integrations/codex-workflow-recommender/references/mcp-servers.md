# Codex MCP and connector recommendations

Load this reference only when the job requires live external context or action.

## Evidence first

Confirm the installed surface with `codex mcp --help`, then use only the minimum
read-only fields from `codex mcp list --json` or `codex mcp get <name>`. Preserve
provenance: `user-config`, `project-config`, or `plugin-provided`. An MCP shown in
the list is not necessarily a direct config entry.

Before proposing direct MCP, check whether a built-in connector or an
`installed-enabled` plugin already owns the job. Do not confuse
`available-uninstalled` with installed capability.

## Hard decision gate

A framework, database dependency, or issue URL is only an investigation signal.
Recommend MCP/connector only when live external access materially improves a
repeated job and local files or existing capabilities cannot satisfy it.

For every candidate state:

- exact external job and data classes;
- read versus write actions and least-privilege scope;
- trusted project and managed-policy prerequisites;
- owner, provenance, and existing-capability result;
- current official setup source, verification task, and disable/remove rollback.

Never reproduce raw doctor/config/auth/provider/environment values or secrets.
Use token environment-variable names only after current help confirms support.
Write-capable systems require an explicit action list, non-production test plan,
and separate authorization before setup or any write test.

After separately approved implementation, verify both inventory provenance and
one smallest real task; a list entry alone does not prove usable capability.
