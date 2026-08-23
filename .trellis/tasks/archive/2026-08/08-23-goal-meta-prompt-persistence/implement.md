# implement.md — persistent Goal contract

## Ordered checklist

1. Add `references/persistent-goal-contract.md` with:
   - explicit persistence triggers and S6 authorization;
   - Git/workspace root resolution and one-active-contract semantics;
   - `GOAL.md` schema, authority/drift rules, conflict/replace policy;
   - Git visibility and cross-worktree/cloud limitation;
   - Claude, Codex, Grok Build, OMP, and Kimi Code launch adapters with
     `Last verified: 2026-08-23` primary-source links and evidence labels;
   - secret, rollback, and missing-evidence boundaries.
2. Add `scripts/persist_goal_contract.py` (standard library only):
   - raw-byte stdin with strict UTF-8/UTF-8-BOM decoding; literal
     `--repo-root`; safe basename default `GOAL.md`;
   - create-only default; explicit `--replace --expected-sha256`;
   - root containment, symlink/reparse checks, lint + secret backstop before write;
   - UTF-8/LF same-directory temp + safe finalization + cleanup;
   - readback SHA-256 and tracked/ignored/untracked JSON result without body echo.
3. Expand `references/platform-goal-facts.md` from two to five platforms before
   changing other prose. Record exact start/management commands, state model,
   budget/permission behavior, length limit, file-reference boundary, headless
   differences, enablement/mode conflicts, and pinned official sources. Treat
   OMP as Oh My Pi and keep Grok/OMP length limits as `missing evidence`.
4. Extend `scripts/lint_goal_command.py` with persisted-contract validation while
   keeping every existing inline / companion / platform check compatible.
   Validate approved metadata, required sections, one platform-correct launch
   command, path agreement, no placeholders, and drift/authority wording. Add
   `grok|omp|kimi|all` while preserving `both` as Codex+Claude; reject
   cross-platform management-command borrowing and use accurate 4k messages.
5. Add a focused Node test file for the persistence helper. Cover create,
   existing-file refusal, explicit replace, stale hash, traversal/absolute/
   separator names, symlink or reparse target, lint failure, secret samples,
   environment-variable names, UTF-8/UTF-8-BOM input, invalid-byte rejection,
   LF output, temp cleanup, no-body stdout, and Git
   visibility states. Update the existing allowed-tools test wording/expectation
   without weakening its narrow Git command checks.
6. Update `SKILL.md`:
   - add persistence / handoff trigger terms and bump `0.4.0 -> 0.5.0`;
   - keep S1 read-only; S4 shows exact write plan; S6 may invoke the helper only
     after the relevant confirmation;
   - route details to the new reference and retain 4k/platform/Trellis rules;
   - extend platform detection/rendering to Grok Build, OMP, and Kimi Code
     without duplicating the contract body;
   - keep the existing narrow tool declaration unless implementation proves the
     helper command is unreachable.
7. Reconcile `references/default-goal-strategy.md`,
   `goal-command-playbook.md`, `interview-checklist.md`, and
   `trellis-goal-cadence.md`:
   - remove unconditional claims that the skill never writes;
   - retain side-effect-free default for ordinary goals;
   - add root `GOAL.md` as the recommended explicit handoff contract;
   - keep named `.planning/...` requests backward-compatible;
   - describe S4/S6 draft, confirm, write, verify, launch order.
8. Update `agents/interface.yaml` and
   `skills/developer-tools-integrations/AGENTS.md` so metadata describes the
   optional governed write path, the helper, and the unchanged Git mutation
   prohibition. Add truthful `grok`, `omp`, and `kimi` adapter targets and
   degradation text. Do not add README/manifest solely for qiaomu compatibility.
9. Extend `evals/evals.json` after id 18 with behavior cases for all PRD A1-A10;
   do not delete or weaken existing assertions. Add task-local qiaomu trigger
   cases covering save/persist/handoff positives, ordinary goal negatives, and
   handoff/memory/Trellis near neighbors. Add platform fixtures for Grok
   independent verification/budget, OMP show/drop/budget and plan/vibe conflict,
   Kimi blocked/paused/headless/next, and wrong-command rejection.
10. Run `just docs-sync` after frontmatter/interface changes. Inspect generated
   catalog diffs; never hand-edit generated pages.
11. Run provider-shaped manual fixtures through the helper and linter for:
    - Codex root `GOAL.md` + explicit read/restatement launch;
    - Claude `@GOAL.md` + transcript-visible evidence + bounded turns;
    - Grok explicit read + independent verification and optional approved
      `--budget` rendering;
    - OMP explicit read + full-objective preservation and budget-is-not-complete;
    - Kimi explicit read + 4k/blocked/paused semantics and a separate headless
      create fixture;
    - Trellis child task with concrete task files and archive cadence;
    - existing `GOAL.md` conflict and approved hash-guarded replacement.

## Validation

Run the smallest surface first, then the finish-line gate:

```text
node --test skills/developer-tools-integrations/goal-meta-skill/tests/persist-goal-contract.test.mjs
node --test skills/developer-tools-integrations/goal-meta-skill/tests/lint-goal-command.test.mjs
python -m py_compile skills/developer-tools-integrations/goal-meta-skill/scripts/lint_goal_command.py skills/developer-tools-integrations/goal-meta-skill/scripts/persist_goal_contract.py
just skills-check
just python-check
just node-test
just docs-sync
just ci
git diff --check
```

Run qiaomu trigger eval with an absolute cases path if `description` changes.
Record qiaomu `validate_skill.py` README/manifest failures as the repository's
intentional package-schema deviation; do not create ceremonial files. Run a
secret scan over the changed package before finish.

Provider-backed fresh-session tests are desirable but not implied by unit tests:

- Codex: create a clean temporary repo/worktree, persist `GOAL.md`, start a new
  Goal with the returned pointer, and verify the agent reads/restates it.
- Claude: use a clean temporary repo, `@GOAL.md`, and verify completion evidence
  appears in the transcript.
- Grok Build: confirm goal mode is enabled, run the explicit-read pointer, and
  observe independent verification behavior without assuming `@` command chips.
- OMP: run from a clean session with plan/vibe off, confirm the file is read and
  `/goal show` reports the preserved full objective.
- Kimi Code: run one TUI pointer and one `kimi -p` create path, checking
  complete/blocked/paused exit semantics when practical.
- If any platform cannot be run, leave that platform `UNVERIFIED` in the task
  handoff; one platform's success is not evidence for another.

## Review gates

1. Correctness: root/path/replace/hash and no-loss failure matrix.
2. Security: secret non-echo, path containment, symlink/reparse, no Git mutation.
3. API/output contract: old inline behavior and ids 1-18 remain valid; new JSON
   result and file schema are documented and tested; `--platform both` remains
   backward-compatible while new platform grammars stay isolated.
4. Maintainability: persistence judgment lives in one reference; scripts own
   deterministic behavior; no duplicate contract prose across files.
5. Scope: no memory vault, progress ledger, runtime `/goal`, Trellis runtime,
   auto-commit, publish, or unrelated cleanup.
6. Platform fidelity: every lifecycle, length, budget, file-reference, and
   headless claim maps to `platform-goal-facts.md` and its dated primary source.

## Risky files and rollback points

- `SKILL.md`: description <=1024 chars, no angle brackets, script path uses
  literal `<skill-dir>`, existing command reachability stays valid.
- `scripts/persist_goal_contract.py`: any unsafe overwrite, root ambiguity,
  content echo, or partial-write case is a No-Go.
- `scripts/lint_goal_command.py`: existing Node tests must pass before adding
  persisted mode; do not weaken 4k/platform/placeholder checks.
- `evals/evals.json`: hand-reviewed asset, not executed by `just ci`.
- generated `docs/`: only `just docs-sync` may modify.

Rollback the coherent skill + synced docs diff. Do not delete or restore a real
user `GOAL.md` without separate, exact authorization.

## Before `task.py start`

- User explicitly approves the latest Goal/In Scope/Out of Scope/Acceptance/
  Decisions summary.
- `prd.md`, `design.md`, `implement.md`, research, and both JSONL manifests pass
  task validation.
- Start and implementation occur only in a subsequent user turn.
