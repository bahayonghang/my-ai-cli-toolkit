# Design - GPT-5.6-aligned agents-md-improver Production package

## Scope Boundary

Primary changes stay under:

- `skills/developer-tools-integrations/agents-md-improver/`
- the target rows in `skills/developer-tools-integrations/AGENTS.md`
- generated docs produced by `just docs-sync`
- this Trellis task's research/evaluation evidence

`claude-md-improver/references/templates.md` is a conditional co-owned file: edit
only when the byte-identical shared code-map block must change. Do not repair
unrelated category or sibling drift.

## Package Shape

- `SKILL.md`: lean trigger, intent/action router, core workflow, evidence rules,
  output contract, stop rules, and conditional reference routing; default
  Production initial load <= 1000 tokens.
- `references/codex-agents-discovery.md`: current official discovery semantics,
  CWD chain, override/fallback selection, byte budget, global boundary, skill and
  subagent roots; contains `Last verified` and official URLs.
- `references/quality-criteria.md`: evidence rubric plus separate instruction-need
  and navigation-need decisions.
- `references/report-format.md`: conditional audit and update contracts with
  prioritized findings, effective chain, proposed diffs, and evidence states.
- `references/templates.md`: sparse evidence slots and shared code-map blocks;
  no generic defaults or stale skill roots.
- `references/update-guidelines.md`: detailed edit and verification rules moved
  out of initial context.
- `agents/interface.yaml`: aligned metadata, compatibility, activation,
  execution, trust, degradation, and outcome-first default prompt.
- `manifest.json`: Production owner/review/target metadata used by Skill IR;
  no Governed-only permission or rollback theater.
- `evals/evals.json`: repo behavior/routing fixtures.
- `evals/output/fixtures/agents-md-scenarios.md`: `file-backed fixture` for
  discovery and creation decisions.
- `evals/output/cases.jsonl`: compact baseline vs with-skill assertions.
- `tests/contracts.test.mjs`: text/JSON contract checks and shared-template
  parity.
- `reports/output-risk-profile.md`, `reports/prompt-quality-profile.md`, and
  `reports/output_quality_scorecard.md`: only the Production evidence directly
  used in review. Provider/human evidence remains explicit when absent.

No folder is added unless `SKILL.md` or `manifest.json` declares why it exists
and a gate consumes it.

## Instruction Discovery Model

```text
launch context (project root, CWD, CODEX_HOME/effective config)
        |
        v
directories from project root through CWD
        |
        v
per-directory candidates
AGENTS.override.md -> AGENTS.md -> configured fallbacks
        |
        v
select at most one non-empty file per directory
        |
        v
concatenate root-to-CWD until effective byte budget
        |
        v
active chain + shadowed files + truncation/missing-evidence status
```

Repository-wide auditing may inventory other nested files, but it must not call
them active for the current launch context. For candidate subtrees, the report
states which CWD would activate the file. Existing `AGENTS.override.md` is
audited; creation is opt-in only.

Effective global configuration may be outside repository scope. Read it only
when the user/request permits and the runtime exposes it safely. Otherwise use
documented defaults as defaults, label the effective value `missing evidence`,
and avoid an asserted pass.

## Intent and Authorization Router

```text
audit / optimize / plan
    -> inspect and return report + proposed diffs; no writes

approved plan / explicit scoped change or fix
    -> edit only named/in-scope guidance + validate

fully specified trivial edit
    -> implicit route: leave to direct edit
    -> explicit skill invocation: minimal semantic checks, edit, validate

explanation-only / Claude-only / workflow recommendation / ordinary docs/code
    -> route to direct docs, claude-md-improver, codex-workflow-recommender,
       or the owning code/docs workflow

user-global / external / destructive / costly / scope expansion
    -> stop and request explicit authorization
```

This policy appears once in `SKILL.md`. References may explain how to apply it
but must not restate conflicting approval gates.

## Candidate Decision Model

Use two independent axes with a hard minimum condition:

| Durable local instruction need | Navigation/routing need | Outcome |
| --- | --- | --- |
| no | no | create nothing |
| no | yes | local `code_map.md` only |
| yes | no | nested `AGENTS.md` only; point to nearest useful map |
| yes | yes | nested `AGENTS.md` plus local `code_map.md` |

Instruction need requires at least one verified non-inferable local contract:

- distinct command/gate that future Codex work must use;
- local safety, generated-file, data, or external-service boundary;
- local ownership/API/change-coupling rule;
- recurring agent mistake or repeated review feedback;
- intentional override of broader guidance.

Complexity, file count, a manifest, or a different language can raise
navigation need but cannot by itself satisfy instruction need. Scores summarize
evidence after this hard gate; they do not replace it.

## Evidence and Tool Flow

1. Resolve project root, CWD, effective config evidence, and existing instruction
   candidates.
2. Run independent repository reads concurrently where the host supports it.
3. Build the effective chain before scoring content; do not score an inactive
   file as if it governed the current run.
4. Verify commands, paths, generated boundaries, and code-map anchors against
   source files.
5. Classify instruction need and navigation need separately.
6. Stop discovery when core claims are supported. Retry one or two meaningful
   fallbacks for empty/suspicious results; otherwise record `missing evidence`.
7. Render the intent-appropriate report or perform authorized edits.
8. Validate changed behavior and report actual pass/fail/skip state.

Use structured file tools first. The portable shell fallback is a single-line
`rg --files --hidden` command with include/exclude globs; no shell-specific line
continuation or POSIX-only `find` recipe is part of the contract. PTC is not
introduced: the result set is small, native paths/evidence must be preserved,
and semantic judgment occurs between stages.

## Output Contract

### Audit/plan

Required:

- concise outcome summary;
- prioritized findings with severity, file/scope, evidence, impact, proposed
  change, and confidence or `missing evidence`;
- effective instruction chain and shadowed candidates when multiple layers or
  fallback choices exist;
- separate AGENTS/code-map candidate decisions;
- proposed diffs only for files recommended to change;
- validation plan and remaining risks.

Conditional sections are omitted when empty. Average scores are secondary
diagnostics, not the headline.

### Authorized update

Required:

- files changed and intended behavioral outcome;
- preservation notes for user content, marker blocks, sibling coexistence, and
  global boundaries;
- validation results as passed/failed/skipped with reason;
- remaining risks and any `missing evidence`.

## Trigger Design

The frontmatter description owns:

- positives: audit/optimize/update repository-scoped `AGENTS.md`, overrides,
  nested conflicts, stale commands, and companion `code_map.md`;
- exclusions: Claude-only guidance, general Codex setup recommendations,
  explanation-only questions, ordinary code/docs review, and fully specified
  trivial edits unless explicitly invoked;
- bilingual high-signal phrases without an exhaustive mechanism list.

Description candidates are tested before body expansion. The task keeps a
plain-text resolved description because the installed yao extractor does not
parse folded YAML descriptions correctly.

## Evaluation Design

### Repo behavior evals

Cover:

- root/nested audit with stale commands and code map;
- override/fallback/CWD/budget discovery;
- approved implementation;
- navigation-only candidate;
- Claude-only, Codex workflow recommendation, trivial direct edit, and ordinary
  review near neighbors.

### Output evals

Use one file-backed scenario document and at least four cases:

1. effective chain selects override/fallback correctly and reports shadows;
2. high-complexity/no-local-contract subtree gets map-only, not AGENTS;
3. explicit approved edit applies and validates without another report gate;
4. near-neighbor request routes away without editing.

Assertions check semantic outcomes, not memorized wording. Recorded fixture
outputs are reproducibility evidence only. Provider-backed GPT-5.6 execution and
human blind adjudication are `missing evidence` unless actually collected.

### Deterministic contract tests

- target references declared from `SKILL.md` exist;
- target active docs contain no `.codex/skills` stale path;
- override/fallback/CWD concepts remain present;
- JSON fixtures parse;
- shared fenced root/nested code-map blocks are byte-identical to the sibling;
- the report template contains prioritized evidence, proposed diff, and honest
  verification states.

## Yao Evidence Placement

Durable future behavior stays in the package (`evals/`, focused tests, the three
reviewed reports). One-run compiler, conformance, trust, atlas, packaging,
install, upgrade, and Review Studio outputs go under this task's
`research/yao/` directory. This keeps the skill small while preserving review
evidence in the archived task.

Skill OS gates are dispositions, not decorative files:

- fail a required local deterministic gate;
- mark provider, human, telemetry, or unavailable runtime evidence as
  `missing evidence`;
- mark a genuinely irrelevant high-permission gate `not applicable` with the
  concrete reason (no scripts/dependencies/remote inline execution), rather
  than inventing trust proof.

## Compatibility and Versioning

- Target version: `1.2.0` for additive correctness, routing, and evidence
  improvements.
- Adapter targets: `openai`, `claude`, `generic`; canonical format
  `agent-skills`; inline execution.
- Canonical discovery examples are platform-neutral or `rg` based. Adapter
  degradation explains that unsupported effective-config introspection becomes
  `missing evidence`, not a guessed result.
- Public description/version/resource lists update through `just docs-sync`.

## Rollback Boundary

- All runtime behavior is prompt/reference/fixture metadata; no migration or
  external state exists.
- Revert target skill changes as one package unit before release.
- Shared code-map block changes and their sibling parity change roll back
  together.
- Generated docs roll back with the public metadata change.
- Task research remains historical evidence even if implementation is rolled
  back.
