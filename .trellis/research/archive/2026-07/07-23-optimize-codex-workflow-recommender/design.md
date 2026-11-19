# Design - evidence-driven Codex workflow recommendation

## Scope Boundary

Primary source changes stay under:

- `skills/developer-tools-integrations/codex-workflow-recommender/`
- the target rows in `skills/developer-tools-integrations/AGENTS.md`
- generated docs produced by `just docs-sync`
- this task's research/evaluation evidence

Adjacent skills are routing neighbors only. Do not edit them to make this task's
evals pass. The pre-existing Trellis framework changes and untracked
`.trellis/agents/*.md` files are outside this task.

## Package Shape

- `SKILL.md`: lean trigger/exclusions, read-only authorization, discovery and
  decision skeleton, output/success contract, reference routing, stop rules.
- `references/codex-surface-map.md`: dated official/current CLI facts, surface
  scope, discovery roots, provenance vocabulary, trust/policy caveats.
- Existing five references: focused decision and example guidance. Consolidate
  duplication; retain a file only when `SKILL.md` routes to it.
- `agents/interface.yaml`: neutral Production interface with read-only trust and
  degradation behavior.
- `manifest.json`: owner/review/maturity/context/target/resource metadata.
- `evals/evals.json`: bilingual trigger and near-neighbor behavior cases.
- `evals/output/fixtures/codex-workflow-scenarios.md`: `file-backed fixture` for
  repository/environment scenarios.
- `evals/output/cases.jsonl`: baseline vs with-skill semantic assertions.
- `tests/contracts.test.mjs`: deterministic package, path, schema, reference,
  safety and output-contract checks.
- Reviewed `reports/output-risk-profile.md`, `reports/prompt-quality-profile.md`,
  and `reports/output_quality_scorecard.md`; no decorative report inventory.

One-run compiler, conformance, trust, atlas, registry/package/install/upgrade and
Review Studio artifacts belong under task `research/yao/`, not the public skill.

## Surface Selection Model

```text
user outcome + scope + recurrence + external-system need + timing
                           |
                           v
            is a durable change justified at all?
                  | no                | yes
                  v                   v
              no change       choose smallest owner
                                  |
      prompt/thread | AGENTS | memory | skill | plugin | MCP/connector
                    | config/rule | subagent | hook | automation
                                  |
                                  v
                check existing capability and provenance
                                  |
                 reuse installed/native before creating new
                                  |
                                  v
                rank by impact, evidence, risk, effort, dependency
                                  |
                                  v
                 verification + rollback + approval boundary
```

The model uses hard ownership conditions, not a numeric score alone:

| Surface | Minimum condition |
| --- | --- |
| Prompt/thread | one-off or current-run constraint |
| `AGENTS.md` | durable repo/subtree convention or verification boundary |
| Memory | useful learned context, not an explicit mandatory rule |
| Skill | repeated task workflow with reusable output contract |
| Plugin | installable/team distribution or an existing reusable bundle |
| MCP/connector | live external context/action is required |
| Config/profile/rule | durable runtime default or enforcement setting |
| Subagent | independently delegable role with bounded ownership |
| Hook | deterministic lifecycle enforcement around agent events |
| Automation | scheduled or recurring follow-up work |

OMX is an optional detected extension, not a universal Codex surface.

## Discovery and Provenance Flow

1. Resolve repo root, launch CWD, user-stated outcome and allowed inspection
   scope. Read repo `AGENTS.md`/`code_map.md` before broad search.
2. Inventory repo manifests, local gates, existing `.agents/skills`,
   `.codex/agents`, trusted project config/hooks, plugins and MCP state.
3. Probe `codex --version` and only relevant `--help` subcommands. Do not run
   every command when the user asks for one category.
4. Normalize evidence into provenance labels:
   `built-in`, `user-config`, `project-config`, `plugin-provided`,
   `installed-enabled`, `installed-disabled`, `available-uninstalled`,
   `unsupported`, `missing evidence`.
5. Summarize diagnostic/config evidence. Never paste raw auth, provider URL,
   token, env value or complete doctor JSON into the report.
6. Match repository needs to the smallest surface, then check for an existing
   capability before proposing a new one.
7. Stop when top recommendations are supported. Omit unsupported categories.

Current CLI output overrides dated examples for exact syntax. Dated official
facts override memory for discovery and product scope. Callable current-session
behavior wins for that environment when it conflicts with docs, and the conflict
must be stated.

## Recommendation Contract

Each recommendation uses these fields:

- `Recommendation` and owning surface
- `Observed evidence` with source paths/commands
- `Why now` and intended outcome
- `Existing capability/provenance`
- `Scope` and files/config target
- `Prerequisites` and user decisions
- `Permission/data risk`
- `Confidence` or `missing evidence`
- `Verification`
- `Rollback` or `Defer reason`

Priority is ordinal (`P0` correctness/safety, `P1` material workflow value,
`P2` optional optimization); do not invent precise ROI scores without data.

Safe implementation order is derived from dependencies and reversibility:

1. Correct or remove stale guidance and establish baseline evidence.
2. Reuse already installed/native capability when it solves the job.
3. Add repo-local, reviewable guidance/skill/agent files.
4. Change persistent project/user config, hooks, MCP or plugins only after
   explicit approval and policy preflight.
5. Validate real behavior, then document rollback and remaining evidence gaps.

## Output Contract

Default report:

1. `Outcome` - concise answer, including `No change recommended` when earned.
2. `Evidence and Unknowns` - current surface/provenance and `missing evidence`.
3. `Prioritized Recommendations` - only relevant surfaces, using the shared
   recommendation fields.
4. `Implementation Sequence` - dependency/risk order and approval checkpoints.
5. `Verification and Rollback` - observable checks and recovery.
6. `Approval Options` - local-file and external/persistent actions separated.

For a single-surface request, omit unrelated sections/categories but preserve
evidence, safety and verification. Do not force a marketing-style call to action.

## Trigger Boundary

Owned positives:

- audit or optimize a repository's Codex workflow/setup;
- compare which Codex surface should own a recurring need;
- recommend repo-grounded AGENTS/skill/plugin/MCP/subagent/hook/automation/config
  improvements without applying them;
- produce a safe implementation sequence and verification plan.

Near-neighbor exclusions:

- direct AGENTS/code-map edit -> `agents-md-improver`;
- current Codex documentation answer -> `openai-docs`;
- skill package audit -> `agent-skill-review` or `yao-meta-skill`;
- durable multi-stage task packet implementation -> `codex-dynamic-workflows`;
- actual install/config/write request -> owning implementation flow after a
  separate approval boundary.

The description must distinguish “recommend/configure a plan for MCP” from
authorization to execute `codex mcp add`.

## Evaluation Design

### Trigger eval

At least eight natural-language cases:

- positives: repo Codex setup audit, workflow surface selection, MCP/plugin plan,
  and Chinese `优化 Codex 工作流` request;
- negatives: direct AGENTS edit, docs-only Codex fact, skill audit, dynamic
  workflow build, and ordinary code review. Use at least four negatives.

Keep an untouched holdout subset. Investigate every FP/FN; do not tune only the
threshold or memorize phrases.

### Output eval

At least six file-backed scenarios:

1. repo with stale `.codex/skills` guidance -> correct `.agents/skills`;
2. browser need with installed browser/plugin capability -> reuse, no duplicate
   raw MCP;
3. direct and plugin-provided MCP entries -> preserve provenance;
4. healthy small repo with no recurring pain -> no change;
5. missing/old CLI -> bounded `missing evidence`, no invented command;
6. write-capable external MCP/config request -> permission/data preflight and
   separate approval.

Assertions grade decisions and safety, not exact wording. The with-skill result
must beat baseline. `recorded_fixture` is reproducibility evidence only;
provider/model runs, human blind adjudication and telemetry remain distinct.

### Contract tests

- no active `.codex/skills` or `~/.codex/skills` root claims;
- `.agents/skills` and `.codex/agents` semantics stay present;
- no undocumented `nickname_candidates` template field;
- all routed references exist and optional directories are used;
- eval/manifest/interface JSON/YAML parse and required fields exist;
- read-only contract forbids mutation commands during recommendation;
- report schema includes no-change, provenance, risk, verification and rollback;
- version/resource docs remain synchronized through repository gates.

## Compatibility and Degradation

- Canonical format remains agent-skills; target adapters are OpenAI, Claude and
  generic inline execution.
- Claude frontmatter `allowed-tools` must only name reachable Claude tools even
  though the skill's subject is Codex.
- If CLI, filesystem roots, trusted project config, managed policy or current
  official docs cannot be inspected, the skill narrows claims and writes
  `missing evidence`; it does not fail open into generic recommendations.
- CLI/App/IDE may share config layers; ChatGPT web does not read local Codex
  config and should use installed workspace plugins/connectors instead.

## Rollback Boundary

- Runtime behavior is prompt/reference/metadata/fixture only; there is no data
  migration or external state.
- Revert target skill changes as one `1.1.0` package unit before release.
- Generated docs roll back with public metadata.
- Task research remains historical evidence even if implementation is reverted.
