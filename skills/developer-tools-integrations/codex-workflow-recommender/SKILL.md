---
name: codex-workflow-recommender
description: >-
  Audit a repository and current Codex capabilities, then recommend the smallest
  evidence-backed read-only improvement or no change. Use for Codex setup
  optimization, surface selection, unapplied MCP/plugin/subagent plans, 优化 Codex
  工作流, 审阅 Codex 配置, Codex 能力推荐. Exclude direct AGENTS/code-map edits,
  docs questions, skill audits, dynamic workflow implementation, code review,
  and any install/config/write.
version: 1.1.0
category: developer-tools-integrations
tags:
  - codex
  - skills
  - mcp
allowed-tools: Read, Glob, Grep, Bash(codex --version), Bash(codex * --help), Bash(codex mcp list *), Bash(codex plugin list *), Bash(git status *), Bash(rg *)
---

# Codex Workflow Recommender

Read-only: do not create, edit, install, remove, configure, or write externally;
reports never authorize implementation.

## Workflow

1. Confirm outcome, repo root, surface, and scope; read applicable
   `AGENTS.md`/`code_map.md`.
2. Inventory relevant gates, roots, trusted config, plugins, and MCP. Prefer
   structured tools or `rg` and current help.
3. Summarize minimum fields, never raw doctor/config/auth/provider/env values.
   Preserve provenance: `built-in`, `user-config`, `project-config`,
   `plugin-provided`, `installed-enabled`, `installed-disabled`,
   `available-uninstalled`, `unsupported`, `missing evidence`.
4. Decide whether persistence is justified. `No change recommended` is valid.
   Smallest owner: one-off -> prompt; repo rule -> AGENTS; learned context ->
   memory; repeated flow -> skill; team bundle -> plugin; live external need ->
   MCP; independent role -> subagent; runtime default -> config/rule; lifecycle
   event -> hook; schedule -> automation.
5. Reuse suitable native/installed capability first. Technology detection alone
   is only a signal. Rank by impact, evidence, dependency, effort,
   reversibility, and Permission/data risk.
6. Stop at supported decisions; keep OMX conditional and omit irrelevant surfaces.

## Output Contract

Return `Outcome`; `Evidence and Unknowns`; supported `Prioritized Recommendations`;
dependency/risk `Implementation Sequence`; `Verification and Rollback`; and
`Approval Options` split by local versus persistent/external action. Each item:
Observed evidence; Existing capability/provenance; scope; prerequisites;
Permission/data risk; confidence or `missing evidence`; Verification;
Rollback/defer reason. Omit empty categories.

## References

- [Surface map](references/codex-surface-map.md)
- [Skills](references/skills-reference.md)
- [Subagents](references/subagent-templates.md)
- [MCP](references/mcp-servers.md)
- [Plugins](references/plugins-reference.md)
- [Config/hooks](references/hooks-patterns.md)

Load only relevant references. CLI help overrides examples and dated facts
override memory; otherwise use `missing evidence`.
Route direct AGENTS/code-map edits to `agents-md-improver`, fact questions to
`openai-docs`, skill reviews to `agent-skill-review`/`yao-meta-skill`, and
dynamic workflow builds to `codex-dynamic-workflows`.
