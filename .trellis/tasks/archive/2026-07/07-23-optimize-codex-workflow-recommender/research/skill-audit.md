# Deep audit - codex-workflow-recommender 1.0.0

Audit date: 2026-07-23

Mode: read-only Yao Production review. No target skill files were edited.

## Executive assessment

The skill has a sound read-only intent and useful category references, but it is
not currently a reliable Production recommender. It can send users to an
undiscoverable skill root, includes a non-current custom-agent field, cannot
distinguish installed/plugin-provided capabilities from direct config, and
loads more than twice the Production context budget without any trigger/output
regression evidence.

Recommended disposition: keep the package read-only, correct the Codex surface
model first, then add a minimal decision/output contract and Production evidence.
Do not add installation or configuration automation.

## Findings

### F1 - High: current Codex skill roots are wrong

Evidence:

- `SKILL.md:70,117-119` uses `.codex/skills` / `~/.codex/skills`.
- `references/skills-reference.md:11-12,49,64,79,94,108,134` repeats those roots.
- Official Build skills documentation fetched 2026-07-23 defines repo
  `$CWD/.agents/skills` through `$REPO_ROOT/.agents/skills`, user
  `$HOME/.agents/skills`, admin `/etc/codex/skills`, and bundled system skills.
- The same official manual confirms `.codex/agents` / `~/.codex/agents` for
  native custom agents; the two concepts must not be normalized to one root.

Impact: a primary recommendation can create a valid-looking skill where current
Codex will not discover it.

Proposed fix: centralize dated roots in `references/codex-surface-map.md`, update
all examples, and lock both positive and negative path contracts in tests.

### F2 - High: the entrypoint fails the Production resource boundary

Evidence:

- Yao context estimate: `SKILL.md` `2079` initial-load tokens; Production limit
  `1000`; total deferred references `4512`; quality density `12.0`.
- `SKILL.md:34-224` embeds a complete discovery catalog, surface catalog and
  full report template even though five deferred references already exist.

Impact: every activation pays for detail that is only relevant to some
categories, while higher-value decision and evidence contracts remain implicit.

Proposed fix: retain trigger, read-only boundary, decision skeleton, output
contract and reference router in `SKILL.md`; move versioned facts and detailed
examples to referenced files. Keep the default 1000-token limit.

### F3 - High: feature inventory is not a decision model

Evidence:

- `SKILL.md:107-154` provides one paragraph per category.
- `SKILL.md:201-206` hard-codes AGENTS -> skill/subagent -> MCP/plugin order.
- Current official Customization guidance distinguishes AGENTS, memories,
  skills, plugins, MCP, subagents, hooks and automations and recommends reusing
  an existing plugin before creating a new skill.
- `SKILL.md:4-6` claims CLI/App scope, but the body does not separate local
  CLI/IDE/App config from ChatGPT web plugin/connector behavior.

Impact: the skill can recommend redundant or wrongly scoped infrastructure and
cannot explain why no change is the best result.

Proposed fix: use hard minimum conditions per surface, existing-capability-first
selection, provenance, permission/data risk and dependency-driven sequencing.

### F4 - High: state discovery loses provenance

Evidence:

- `SKILL.md:87-93,166-172` reduces MCP/plugins to configured or absent.
- On the current `codex-cli 0.145.0`, `codex mcp list --json` includes both
  directly configured and plugin-provided servers, while `codex doctor --json`
  reports a smaller direct-config count.
- `codex plugin list` reports marketplace entries with install/enable status;
  `--available --json` has different semantics.

Impact: an installed plugin-provided tool can be recommended again as a raw MCP,
or an available but uninstalled plugin can be reported as configured.

Proposed fix: normalize evidence as built-in, user/project config,
plugin-provided, installed-enabled/disabled, available-uninstalled, unsupported,
or `missing evidence`; test the distinctions with file-backed fixtures.

### F5 - Medium: cross-platform tool declarations are unreachable

Evidence:

- `SKILL.md:25` declares PowerShell cmdlets as `Bash(...)` commands.
- `SKILL.md:53-61` mixes POSIX and PowerShell discovery blocks.
- Repo skill-authoring guidance says Claude Code's Bash tool is POSIX and
  PowerShell cmdlets require an explicit executable wrapper; declared tools must
  match reachable commands.

Impact: the recommended discovery path can fail before analysis on one of the
claimed platforms, and metadata promises capabilities the runtime cannot invoke.

Proposed fix: prefer Read/Glob/Grep and reachable `rg`/`codex` families; keep
shell-specific examples in deferred guidance only when the executable is allowed.

### F6 - Medium: a published subagent field is not in the current schema

Evidence:

- `references/subagent-templates.md:30-37` publishes a reusable TOML example
  containing `nickname_candidates`.
- Current official standalone agent schema requires `name`, `description`,
  `developer_instructions` and supports normal config keys such as `model`,
  `model_reasoning_effort`, `sandbox_mode`, `mcp_servers`, `skills.config`.
  `nickname_candidates` is not listed.

Impact: users may copy a template that fails strict config validation or relies
on undocumented behavior.

Proposed fix: remove the field unless current CLI/docs explicitly prove it;
contract-test the minimum schema and keep version-sensitive fields deferred.

### F7 - Medium: output contract encourages a catalog-shaped report

Evidence:

- `SKILL.md:36-45` forces six top-level sections.
- `SKILL.md:156-216` includes all category placeholders and a fixed
  `Want me to implement...` section.
- The contract lacks a first-class no-change result, provenance, prerequisites,
  permission/data risk, confidence/missing evidence and rollback per item.

Impact: even with “relevant category” language, the template biases output
toward filled categories and a call to action instead of a crisp decision.

Proposed fix: lead with outcome, then evidence/unknowns and only prioritized
supported recommendations; make approval options factual and separate local
files from external/persistent actions.

### F8 - Medium: no trigger, output or deterministic regression evidence

Evidence:

- Package inventory has only `SKILL.md` plus five references.
- Yao `validate_skill.py` fails for missing `agents/interface.yaml`.
- Governance score is `20` (`draft`) with no manifest, owner or review cadence.
- Category `AGENTS.md` explicitly records missing evals as a known gap.

Impact: description, path, schema and recommendation changes can regress without
a repository gate noticing; `scripts/check.py` passing only proves metadata.

Proposed fix: add the minimum Production interface/manifest, trigger eval,
file-backed output eval and Node contract test; keep provider/human/telemetry
evidence honest.

### F9 - Medium: generic MCP matching underweights trust and reuse

Evidence:

- `references/mcp-servers.md:27-44` maps technology signals directly to MCP
  types.
- The safety notes are category-specific and do not require existing plugin/
  connector discovery, data classification, write-capability review, managed
  policy, or least-privilege credentials for every candidate.

Impact: a dependency mention can produce unnecessary external access or a
write-capable integration recommendation without sufficient justification.

Proposed fix: treat stack detection as a research signal only; require external
need, existing-capability check, provenance, permissions/data risk, owner,
verification and rollback/defer reason.

## What is already good

- `SKILL.md:32` establishes a clear read-only boundary and separate approval for
  implementation.
- `SKILL.md:78-95` correctly prefers installed CLI help over model memory.
- References are all reachable from `SKILL.md`; Yao found no unused resource dir.
- The skill already limits recommendations to high-value items and keeps OMX
  conditional, which should be preserved in a leaner contract.
- MCP secrets are directed to environment variables rather than raw config.

## Baseline gates

| Gate | Result | Meaning |
| --- | --- | --- |
| Repo `scripts/check.py` | pass | frontmatter meets repository minimum |
| Yao lint | pass | no basic skill lint error |
| Yao validate | fail | missing `agents/interface.yaml` |
| Yao governance | warn | no manifest; score 20/draft |
| Yao resource boundary | fail | 2079 > 1000 initial tokens |
| Trigger eval | missing evidence | no cases |
| Output eval | missing evidence | no file-backed cases |
| Contract tests | missing evidence | no tests |
| Provider execution | missing evidence | not requested/run |
| Human blind review | missing evidence | not requested/run |
| Telemetry/adoption | missing evidence | not available |

## Sources

- Local target package and category `AGENTS.md`, read 2026-07-23.
- Local `codex-cli 0.145.0` help/list/doctor probes, read-only and summarized.
- OpenAI Codex manual fetched 2026-07-23 via the `openai-docs` manual helper:
  - `https://learn.chatgpt.com/docs/build-skills.md`
  - `https://learn.chatgpt.com/docs/agent-configuration/subagents.md`
  - `https://learn.chatgpt.com/docs/customization/overview.md`
  - `https://learn.chatgpt.com/docs/config-file/config-advanced.md`
  - `https://learn.chatgpt.com/docs/extend/mcp.md`
  - `https://learn.chatgpt.com/docs/build-plugins.md`
  - `https://learn.chatgpt.com/docs/hooks.md`
  - `https://learn.chatgpt.com/guides/best-practices.md`
- Yao `skill-engineering-method`, `operating-modes`, `resource-boundaries`,
  `output-eval-method`, and `review-studio-method`.
