# agents-md-improver baseline audit

Audit date: 2026-07-22.

Mode: Production. The skill is reusable across repositories, allows implicit
invocation, has several near neighbors, and produces user-facing audit and edit
artifacts. It is not Governed: it has no high-permission scripts, remote writes,
or release/compliance authority.

## Package inventory

| File | Lines | Bytes | Role |
| --- | ---: | ---: | --- |
| `SKILL.md` | 185 | 11,243 | trigger, semantics, six-phase workflow |
| `agents/interface.yaml` | 7 | 355 | agent-facing name and default prompt |
| `references/quality-criteria.md` | 115 | 5,666 | audit and creation scoring |
| `references/report-format.md` | 91 | 2,449 | report/update skeletons |
| `references/templates.md` | 231 | 6,450 | AGENTS and code-map templates |
| `references/update-guidelines.md` | 126 | 5,248 | edit rules and validation checklist |

No `evals/`, `tests/`, `manifest.json`, durable Codex-semantics reference, or
output-quality evidence exists.

## Confirmed findings

### P1: discovery misses higher-precedence instruction files

Evidence:

- `SKILL.md:44-57` searches only `AGENTS.md` and `code_map.md`.
- `SKILL.md:75-84` classifies only `AGENTS.md`, not
  `AGENTS.override.md` or configured fallback filenames.
- Current official Codex guidance selects at most one instruction file per
  directory in this order: `AGENTS.override.md`, `AGENTS.md`, configured
  fallbacks. It builds the chain from project root to CWD once per run and has
  a default 32 KiB combined project-instruction limit.

Impact: an audit can report the wrong effective chain, miss the file that
actually wins, or recommend edits to an inactive file. Static
"directory-and-descendants" scope is insufficient without activation context.

Proposed fix: add a deferred official-semantics reference and make discovery
report the launch CWD, selected file per directory, shadowed alternatives,
fallback configuration, and instruction-budget risk.

### P1: the skill teaches a stale repo skill path

Evidence:

- `SKILL.md:67-73` and `SKILL.md:97` name `.codex/skills`.
- `references/templates.md:39-43` recommends `.codex/skills` in generated
  guidance.
- Current official Codex documentation uses `.agents/skills` for repo-scoped
  skills and `$HOME/.agents/skills` for user skills. `.codex/agents` remains the
  project-scoped native-agent location.

Impact: generated guidance can send future agents to a path Codex does not scan
for repo skills.

### P1: initial prompt context fails the Production budget

`resource_boundary_check.py` failed:

- estimated initial load: `2890 > 1000` tokens
- `SKILL.md` body: 2,802 estimated tokens
- deferred references: 4,930 estimated tokens
- unused resource directories: none

The issue is not the reference set; it is that the entrypoint still carries
detailed discovery lists, rubric tables, repeated report/edit gates, verification
lists, and common-issue lists. GPT-5.6 guidance says to state each rule once and
move detail out of the initial prompt unless it changes branch selection.

Proposed fix: keep only trigger, action classification, essential branch logic,
output contract, stop rules, and conditional reference routing in `SKILL.md`.
The default 1,000-token Production gate must pass; do not hide the failure behind
a larger compatibility ceiling.

### P1: Production routing and output claims have no regression evidence

Evidence:

- The skill allows implicit invocation in `agents/interface.yaml:6-7`.
- It overlaps `claude-md-improver`, `codex-workflow-recommender`, direct trivial
  edits, ordinary docs work, and general code review.
- The category guidance records missing evals as a known gap.
- `export_skill_ir.py --validate-only` passes schema but reports
  `maturity=scaffold`, `target_count=0`, and one description-only trigger sample.

Impact: description changes, report changes, and shared-template changes can
regress without CI or review evidence.

Proposed fix: add the repo's `evals/evals.json`, a small file-backed output-eval
set, a task-local yao trigger suite plus holdout, and a Node contract test for
shared template parity and stale-path regression.

### P1: the interface is not an aligned multi-platform contract

`validate_skill.py` failed because `agents/interface.yaml` lacks:

- `compatibility.canonical_format`
- `compatibility.adapter_targets`
- `compatibility.activation.mode`
- valid execution context and shell
- trust source tier, remote execution policy, and remote metadata policy
- per-target degradation behavior

Impact: the package advertises an interface but cannot pass the selected
meta-skill's compatibility validation.

Proposed fix: align `interface.yaml` with the actual OpenAI/Claude/generic
behavior and keep remote inline execution forbidden. Add Production lifecycle
metadata only if it is used by Skill IR and review cadence.

### P2: action boundaries are repetitive and create an unnecessary approval gate

Evidence:

- `SKILL.md:27`, `SKILL.md:129-135`, and the interface default prompt repeat
  report-first behavior.
- The trigger claims `fix AGENTS.md`, but the body has no trivial edit fast path.
- The report format is required before edits even when the user explicitly asks
  for a fully specified local change.

Impact: a safe local change request can be converted into an extra report and
approval round. This conflicts with the current GPT-5.6 recommendation to state
one compact authorization policy and distinguish audit/plan from change/fix.

Required behavior:

- audit/optimize/plan without write authorization: report first, no edits;
- explicit approved-plan or scoped change/fix: edit and validate;
- fully specified trivial edit: do not trigger implicitly; if explicitly
  invoked, use a minimal semantic check and edit path;
- external, destructive, user-global, or scope-expanding writes: require
  confirmation.

This preserves the established report-first audit preference without forcing it
onto every edit.

### P2: nested AGENTS creation and navigation needs are conflated

Evidence:

- `quality-criteria.md:69-86` assigns 25 points for independent commands, 20
  for a technical boundary, and 20 for local constraints. Those three ordinary
  monorepo properties already exceed the 60-point create threshold.
- `SKILL.md:115-119` uses one result to decide both nested AGENTS guidance and
  local code-map creation.
- Official Codex guidance recommends adding instructions for recurring mistakes,
  repeated review feedback, durable non-obvious commands, or local constraints,
  while keeping guidance small.

Impact: structural complexity alone can create another always-loaded behavioral
layer even when only navigation is needed.

Proposed fix: use two decisions:

1. instruction need: requires a durable, non-inferable behavioral, command,
   safety, ownership, or override need;
2. navigation need: complexity or routing pressure may justify a local
   `code_map.md` without a new AGENTS file.

Scores can support evidence summaries, but a score must not bypass the minimum
instruction-need condition.

### P2: the output promise and report skeleton disagree

Evidence:

- `SKILL.md:27` and `agents/interface.yaml:4` promise proposed diffs.
- `references/report-format.md:5-62` has only issue and proposed-change bullets;
  it has no proposed diff section.
- The report has no required severity, evidence source, active/shadowed chain,
  confidence, or `missing evidence` field.
- Empty sections and an average score are mandatory even for a one-file repo.

Impact: a model can satisfy the template without producing the evidence-backed,
actionable artifact the entrypoint promises.

Proposed fix: lead with prioritized findings and evidence, include an effective
instruction-chain table, require proposed diffs only for files that should
change, and omit empty optional sections. After edits, report passed, failed,
and skipped checks with reasons.

### P2: the discovery command is not cross-platform for Codex hosts

Evidence:

- `SKILL.md:46-55` uses POSIX `find`.
- The current repo and user environment are Windows PowerShell; `find` resolves
  to a different Windows utility outside Git Bash.
- The skill targets Codex CLI/App as well as a Claude-style `allowed-tools`
  surface.

Impact: the documented command can fail or behave incorrectly on a supported
host.

Proposed fix: prefer structured Glob/Read tools or a single-line
`rg --files --hidden` contract with explicit include/exclude globs. Update
`allowed-tools` and the category row together.

### P2: templates contain stale and generic guidance the skill itself forbids

Evidence:

- `templates.md:39-43` contains the stale `.codex/skills` path.
- `templates.md:29-37`, `templates.md:93-96`, `templates.md:118-121`, and
  `templates.md:143-146` include generic testing, safety, UI, backend, and docs
  advice.
- `SKILL.md:146` and `update-guidelines.md:79-89` say not to add generic advice
  Codex already knows.

Impact: copying the templates can violate the skill's own quality contract and
inflate AGENTS prompts.

Proposed fix: turn templates into evidence slots and conditional examples.
Delete defaults that are not tied to a verified repository fact.

### P3: shared code-map wording has no executable drift guard

The two sibling skills' fenced code-map template bodies are currently equal.
Their section-heading markup differs, and there is no CI test enforcing the
shared contract documented in both templates files. Add one focused parity test;
edit `claude-md-improver` only where the shared block must remain identical.

## Baseline gate results

| Gate | Result | Interpretation |
| --- | --- | --- |
| repo `scripts/check.py` | pass, no warnings | existing frontmatter is valid |
| yao `validate_skill.py` | fail | incomplete compatibility interface |
| yao resource boundary | fail | 2,890 initial tokens vs 1,000 budget |
| Skill IR validate-only | schema pass | semantic maturity still scaffold; zero targets |
| prompt-quality profile | 83/100 heuristic | prompt-heavy and complex; scenario unspecified, specificity 70; Chinese decoding is corrupted in the generated profile |
| task-local trigger eval | 14/14 deterministic smoke | no FP/FN under the authored semantic config; not independent router evidence |
| shared fenced template compare | body pass | no automated regression guard |

## Trigger-eval limitation

The installed `trigger_eval.py` frontmatter extractor reads only the literal
`description:` line, so a folded YAML value such as `description: >-` becomes
`>-`. The baseline therefore uses `research/current-description.txt`.

The evaluator also gets desired positive and negative concepts from the authored
semantic config. A 14/14 result proves that the fixture/config/evaluator contract
runs; it does not prove that the current description independently communicates
all exclusions. Promotion still needs:

- before/after literal description review;
- a separate holdout not used to tune the description;
- repo-schema behavior evals;
- with-skill vs baseline output cases;
- human or provider-backed blind review when available, otherwise labeled
  `missing evidence`.

## Prior-task delta

The 2026-07-08 twin-skill task intentionally declined a separate Codex semantics
reference because the then-modeled rules appeared simple. Current official
evidence now exposes additional load-bearing behavior: overrides, fallback
filenames, CWD-bound discovery, byte budget, and current skill roots. That prior
decision should be superseded explicitly rather than silently ignored.

## Scope guard

Do not use this task to clean unrelated drift in
`codex-workflow-recommender`, the category AGENTS inventory, or other skills.
Touch a sibling only for a shared code-map contract, and touch generated docs
only through `just docs-sync` after public metadata/resource changes.
