# Codex plugin recommendations

Load this reference for existing reusable bundles or team distribution.

## Inventory semantics

Probe current `codex plugin --help` before exact syntax. On the 2026-07-23 local
CLI, plugin list views distinguish marketplace availability from installed and
enabled status; JSON and available views are not equivalent. Normalize entries
as `installed-enabled`, `installed-disabled`, or `available-uninstalled` and
record the marketplace/source without copying credentials or private URLs.

A plugin may provide skills, connectors/MCP, hooks, and assets. Inspect that
provenance before recommending a raw MCP or duplicate skill.

## Hard decision gate

Prefer a suitable installed plugin first. Recommend installing an available
plugin only when its declared capability matches the job, source/trust is
reviewed, permissions and data access are acceptable, and a small verification
task exists. Recommend creating a plugin only for a reusable installable/team
distribution unit, not a one-off rule or single local workflow.

Every recommendation includes status/provenance, capability match, source and
version confidence, permission/data risk, prerequisites, verification, rollback,
and why a smaller prompt/AGENTS/skill/MCP surface is insufficient.

Adding, enabling, upgrading, or removing a plugin changes persistent state and
requires separate approval. Never present a placeholder plugin name as a
verified marketplace fact.
