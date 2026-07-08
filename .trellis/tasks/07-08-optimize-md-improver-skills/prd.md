# Optimize agents-md-improver and claude-md-improver skills

## Goal

Fix the issues found by the 2026-07-08 deep audit of
`skills/developer-tools-integrations/agents-md-improver/` and
`skills/developer-tools-integrations/claude-md-improver/`: structural compliance gaps,
twin-skill drift, an over-broad trigger, an unreachable PowerShell tool branch, and
unanchored external-behavior claims. `just skills-check` passes for both today; this task
is about quality and drift-proofing, not metadata failures.

## Requirements

### R1 — Add `agents/interface.yaml` to both skills (P1)

Both skills lack `agents/interface.yaml`; 6 of 11 sibling skills in the same category have
one (e.g. `agent-skill-review`, `ripgrep`, `uv-workflow`, `windows-dev-process-cleanup`).
Add one per skill, aligned with each SKILL.md's actual inputs/outputs/boundaries, following
the structure used by sibling skills.

### R2 — Resolve twin-skill drift on shared artifacts (P1)

Both skills instruct writing a repo-root `code_map.md`, but their templates have drifted:

- claude-md-improver's templates declare the root code_map template "intentionally
  identical in structure" to agents-md-improver's, yet the opening sentence differs
  (`live in AGENTS.md` vs `live in CLAUDE.md (and AGENTS.md if present)`), so running both
  skills in one repo makes each rewrite the other's first line.
- Nested code_map templates differ (`<subtree>/**` vs `<subtree>/`).
- Exclusion lists, creation-scorecard thresholds (60/40), and report skeletons are
  copy-paste duplicated with no shared-convention note.

Required outcome:

- Root and nested `code_map.md` templates converge on one canonical wording that names both
  guidance files conditionally (e.g. "Behavioral rules live in `CLAUDE.md` / `AGENTS.md`
  (whichever exist)"), identical in both skills.
- Each skill's templates file carries a symmetric note that the code_map templates are
  shared with the sibling skill and must be edited in both places together.
- A dual-tool coexistence note is added to both SKILL.md bodies: when a repo runs both
  Claude Code and Codex, `code_map.md` is a shared artifact; neither skill may rewrite the
  other's guidance-file mention; prefer the `@AGENTS.md` bridge for shared content.

### R3 — Fix unreachable PowerShell branch in `allowed-tools` (P1)

`allowed-tools` in both skills lists `Bash(Get-ChildItem *)`, `Bash(Get-Content *)`,
`Bash(Select-String *)`. Claude Code's Bash tool is Git Bash (POSIX): those commands fail
when run directly, and the viable `powershell -Command ...` form is not allowed. Apply one
option consistently in both skills:

- (preferred) drop the PowerShell allowed-tools entries and the PowerShell code blocks,
  keeping POSIX-only discovery commands (Git Bash is always available on Windows for
  Claude Code); or
- keep PowerShell blocks but change allowed-tools to `Bash(powershell *)` and wrap examples
  as `powershell -Command "..."`.

The SKILL.md discovery sections must match whatever `allowed-tools` permits.

### R4 — Narrow claude-md-improver trigger; add trivial-edit fast path (P1)

The description ends with "use this skill whenever the user wants to manage Claude Code
memory files at any layer, even if they only mention CLAUDE.md without explicit audit
wording" — a one-line CLAUDE.md edit currently routes into the full six-phase report-first
workflow. Required outcome:

- Soften/narrow the catch-all sentence so trivial single-edit requests are not claimed, OR
  keep the trigger but add an explicit fast path near the top of SKILL.md: for a scoped
  trivial edit, apply it directly with only the relevant semantic checks (marker blocks,
  200-line budget, no `@code_map.md`), skipping the full report.
- Description/trigger wording changes are routing-boundary edits: record before/after
  trigger phrases and a short overlap check against agents-md-improver's triggers (both
  claim "code_map" phrases) in the task notes. If yao-meta `trigger_eval.py` tooling is
  unavailable in this environment, label that as missing evidence rather than fabricating
  an eval.

### R5 — Anchor external-behavior claims in claude-md-improver (P2)

`references/claude-md-loading.md` and SKILL.md assert Claude Code behaviors that can go
stale: `v2.1.59+` auto memory, "200 lines or 25KB" MEMORY.md limit, `claudeMdExcludes`,
`CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD`, block-comment stripping, precedence
"./CLAUDE.md then ./.claude/CLAUDE.md", and a blog URL. Required outcome:

- Verify each claim against current official docs (code.claude.com/docs) where reachable;
  correct any that changed.
- Add a "Last verified: <date> against <source>" line to `claude-md-loading.md`.
- Claims that cannot be verified are labeled unverified/missing evidence, not silently kept
  as fact.

### R6 — Align discovery commands with prose exclusion lists (P2)

In both skills, the `find` commands exclude 6 directories while the surrounding prose
requires also excluding `vendor/`, coverage output, generated docs output, and package
caches. Either extend the commands or state explicitly that the command is a starting set
and the prose list governs.

### R7 — Slim SKILL.md by externalizing report templates (P2)

SKILL.md bodies are 261 and 280 lines; the Phase 4 report skeleton and Final Output
template are large inline boilerplate. Move both into a `references/report-format.md` per
skill and leave a one-line pointer, keeping SKILL.md operational. Do not change report
content semantics while moving.

### R8 — Minor fixes (P3)

- agents-md-improver: mark OMX marker/workflow content as environment-specific (optional)
  in quality-criteria and templates; decide whether a compact Codex semantics reference is
  needed (documenting the decision is acceptable; adding the file is optional).
- claude-md-improver: add `.git` exclusion to the `.claude/rules` find command.
- Bump both skills' `version` to 1.1.0.

## Constraints

- Report-first default mode, six-phase workflow shape, scoring rubrics, and creation
  scorecard thresholds must not change semantically.
- Surgical edits only; do not rewrite sections not implicated by a requirement.
- All frontmatter must stay valid per `scripts/check.py` (allowed keys, category, name,
  description without angle brackets, ≤1024 chars).
- Do not fabricate verification evidence; unverifiable external claims are labeled as such.

## Acceptance Criteria

- [ ] `agents/interface.yaml` exists in both skill dirs and matches sibling-skill structure.
- [ ] Root + nested code_map templates use identical canonical wording across the two
      skills (apart from an allowed skill-name mention); both templates files carry the
      shared-artifact note; both SKILL.md bodies contain a dual-tool coexistence note.
- [ ] No PowerShell command remains that the declared `allowed-tools` cannot execute.
- [ ] claude-md-improver's trigger no longer routes trivial single-line CLAUDE.md edits
      into the full workflow (narrowed description or documented fast path), with trigger
      before/after + overlap note recorded.
- [ ] `claude-md-loading.md` carries a "Last verified" line; each listed claim is verified,
      corrected, or explicitly labeled unverified.
- [ ] Discovery commands and prose exclusion lists are consistent in both skills.
- [ ] Both SKILL.md line counts decrease (report templates externalized) with no semantic
      loss.
- [ ] Both versions read 1.1.0; `just skills-check` and `just ci` pass; `git diff --check`
      is clean.

## Notes

- Audit evidence lives in the conversation of 2026-07-08; key file baselines:
  agents-md-improver SKILL.md 261 lines + 3 references; claude-md-improver SKILL.md 280
  lines + 4 references. Both frontmatters currently pass `scripts/check.py` with no
  warnings.
