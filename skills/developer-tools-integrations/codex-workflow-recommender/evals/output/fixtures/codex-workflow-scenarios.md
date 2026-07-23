# Codex workflow scenarios

Classification: `file-backed fixture`

These synthetic scenarios contain only recommendation-relevant summaries. They
do not contain raw doctor/config/auth/provider/environment values and do not
prove provider execution, human judgment, telemetry, or a live Codex install.

## Scenario A - Stale skill root

- Repository guidance tells contributors to add project skills under
  `.codex/skills`.
- The current dated surface evidence says project skills are discovered under
  `.agents/skills`; native custom agents remain under `.codex/agents`.
- No skill creation has been approved.

## Scenario B - Existing browser bundle

- A frontend repository needs browser screenshots for repeated UI verification.
- Inventory summary: browser plugin `installed-enabled`; browser MCP provenance
  is `plugin-provided`.
- A raw browser MCP is not directly configured.

## Scenario C - Mixed MCP provenance

- Inventory summary: docs MCP is `user-config`; issue-tracker MCP is
  `plugin-provided`; database MCP is `project-config` and read-only.
- Marketplace summary: issue-tracker plugin is `installed-enabled`; observability
  plugin is `available-uninstalled`.
- Credential values, provider URLs, and raw config are intentionally absent.

## Scenario D - Healthy small repository

- One runtime, one documented verification command, effective root guidance,
  and no repeated workflow pain or external-system need.
- No local Codex capability gap is evidenced.

## Scenario E - Old or unavailable surface

- Installed CLI version predates the probed plugin command surface.
- Desktop App and ChatGPT workspace capability cannot be inspected.
- Repository facts and the dated reference remain available.

## Scenario F - High-permission integration

- The user wants an external issue tracker integration that can create, edit,
  and close work items.
- Data scope, managed policy, owner, least-privilege credentials, and rollback
  procedure are not yet approved.
- The request authorizes recommendation only, not installation or configuration.
