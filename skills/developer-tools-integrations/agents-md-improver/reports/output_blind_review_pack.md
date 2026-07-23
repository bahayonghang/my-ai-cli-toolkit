# Output Blind A/B Review Pack

This packet hides whether each variant came from the baseline or the skill-guided output. Use the separate answer key only after review.

- Pairs: `5`
- Seed: `yao-output-eval-blind-v1`
- Answer key separate: `True`

## Case: effective-instruction-chain

Prompt: Using Scenario A, report the effective Codex instruction chain for the launch context.

Rubric:
- `selects-chain` (1.0): Selects one non-empty file per directory in precedence order.
- `reports-shadows` (1.0): Names shadowed and out-of-chain candidates.
- `checks-budget` (1.0): Uses the effective byte evidence and reports risk honestly.
- `preserves-uncertainty` (1.0): Keeps unavailable config as missing evidence.

### Variant A

All AGENTS.md files under C:/repo govern their descendants. The active files are root AGENTS.md, packages/api AGENTS.md, and packages/web AGENTS.md. The default limit is probably enough.

### Variant B

The file-backed fixture fixes the launch CWD at C:/repo/packages/api and provides effective config evidence. Select C:/repo/AGENTS.override.md, then C:/repo/packages/TEAM_GUIDE.md after skipping the empty override, then C:/repo/packages/api/AGENTS.override.md. Root AGENTS.md, root TEAM_GUIDE.md, and api AGENTS.md are shadowed; packages/web/AGENTS.md is outside this root-to-CWD chain. The selected 36,000 bytes exceed project_doc_max_bytes=32,768, so report truncation or an incomplete-chain risk instead of claiming all selected content loaded. If effective config were unavailable, label its value missing evidence.

## Case: navigation-only-candidate

Prompt: Using Scenario B, decide whether modules/ needs nested guidance and/or a local map.

Rubric:
- `separates-decisions` (1.0): Evaluates the two creation decisions independently.
- `creates-map-only` (1.0): Recommends a map and rejects unnecessary behavioral guidance.
- `names-hard-gate` (1.0): Explains why complexity is insufficient for AGENTS guidance.

### Variant A

modules/ is large and has many entry points, so create both modules/AGENTS.md and modules/code_map.md.

### Variant B

The file-backed fixture establishes a navigation need, so propose modules/code_map.md with local routes and search anchors. Durable local instruction need is not established: root guidance already covers commands and verification, and there is no local safety, ownership, generated-file, override, or recurring-failure contract. Do not create modules/AGENTS.md. Complexity and file count justify the map only.

## Case: approved-edit-direct

Prompt: Using Scenario C, implement the approved guidance refresh.

Rubric:
- `uses-approval` (1.0): Executes an already approved scoped plan.
- `preserves-content` (1.0): Protects managed and human-authored content.
- `reports-check-states` (1.0): Requires honest post-edit evidence.

### Variant A

I completed the audit. Please confirm whether I should now edit the three files.

### Variant B

Treat the approved plan as authorization for the three named repository files. Edit them directly, preserve the TRELLIS managed block and unrelated human content, verify every new command and explicit code_map pointer, then return the changed files, behavioral outcome, passed/failed/skipped checks, and remaining risk. Do not request another approval unless scope or side effects expand.

## Case: explicit-trivial-fast-path

Prompt: Using Scenario D, add the exact requested sentence through $agents-md-improver.

Rubric:
- `uses-fast-path` (1.0): Uses explicit invocation without a full audit.
- `keeps-semantic-check` (1.0): Checks the exact edit before applying it.
- `stops-cleanly` (1.0): Avoids scope and approval expansion.

### Variant A

Because the user explicitly invoked the skill for a fully specified repository-scoped edit, use the trivial fast path: verify the sentence is not stale or contradictory, edit only AGENTS.md, run focused file and command checks, report the result, and stop. Do not expand into a repository audit or another approval gate.

### Variant B

First I will audit every AGENTS.md and code_map.md in the repository and return a scored quality report for approval.

## Case: claude-only-near-neighbor

Prompt: Using Scenario E, audit CLAUDE.md layering and .claude/rules only.

Rubric:
- `declines-route` (1.0): Declines the Claude-only request.
- `routes-owner` (1.0): Names the owning skill.
- `protects-codex-files` (1.0): Avoids Codex guidance edits.

### Variant A

Do not trigger agents-md-improver. This is a Claude-only near-neighbor request owned by claude-md-improver. Route there without inspecting or editing Codex AGENTS files. Preserve a shared code_map.md only if that owning workflow changes the shared fenced template contract.

### Variant B

Use agents-md-improver to inspect AGENTS.md and rewrite the repository guidance alongside CLAUDE.md.
