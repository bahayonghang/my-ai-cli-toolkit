# Design: herdr-orchestra

## Source ownership

Own only `skills/developer-tools-integrations/herdr-orchestra/`. Parent owns shared research and the cross-package design; the review child owns Codex-specific findings semantics. The parent design's “Delegation handoff”, “Orchestration sequence” and “Output collection and UI boundary” sections are the shared protocol source during planning.

## Package layout

- `SKILL.md`: concise route, preflight, delegate/collect workflow and result boundary; top-level repo metadata, version 0.1.0.
- `agents/interface.yaml`: neutral display/description/default prompt, matching explicit Herdr intent and actual side effects.
- `references/delegation.md`: the single executable-instructions contract for assignment inputs, shell availability, layout/agent dispatch and response receipt. Define returned identity, observed lifecycle, scope, response, completeness and failure in prose.
- `references/patterns-and-recovery.md`: independent parallel/pipeline/cross-check examples, caller-shell-specific examples and exceptional output handling. Reference official CLI rather than reproduce its entire catalog.
- `evals/evals.json`: natural behavior cases using repo assertions schema; no provider-execution claim.
- `evals/trigger_cases.json`: qiaomu domain-specific lexical smoke input, distinct from behavioral evals.
- `reports/prior-art-research.md`, `reports/skill-ir.json`, `reports/trigger-eval.json`, `reports/output-eval.md`, `reports/creation-handoff.md`: dated provenance and actual local evidence, with runtime gaps explicit.

No helper scripts or new dependencies are needed. Follow the parent package-convention decision about README/manifest and record actual qiaomu schema deviations. Source credits are concise and preserve any upstream notice required by adapted material.

## Operational decisions

Caller checks happen at the orchestra boundary once. Review adapters pass the requested authority; they do not duplicate environment/layout probes. The ordinary case is one new sibling and one named worker in the calling cwd. More workers need independent tasks and known write ownership. A user's explicit location/topology takes precedence; never infer a worktree just because more agents are available.

Use the live binary's help and current docs. The packaged examples must preserve parameters separately in POSIX and PowerShell, including multiline prompt, apostrophe, dollar/backtick syntax, Chinese and a cwd with spaces. Do not use shell-string interpolation or raw `pane run` to feed an interactive agent.

Waits are finite, lifecycle-aware and tied to a fresh/known-idle task-owned worker. After timeout/stall, inspect that worker instead of duplicate submission. `blocked` means return a required decision, with no automatic dialog keys. `unknown` or unreadable response means incomplete. A caller may choose to continue waiting within the existing task; no retry subsystem is introduced.

For output, choose a passive source when UI action is not authorized. Current upstream deep history behavior may synthesize mouse scrolling; a command called read is not by itself sufficient authority. Codex's no-alt-screen and readonly segmented retransmission are consumer constraints respected by this contract. Generic file recovery is only for an already-authorized output write. Normal completion retains the owned pane and reports its identity; closure is not necessary for success.

## Acceptance trace

| AC | Mechanism | Evaluation |
| --- | --- | --- |
| AC1 | Explicit route + pre-control env gate + neutral interface | Trigger negatives and metadata/resource review |
| AC2 | Caller IDs, available shell, agent-native lifecycle, no false success | H01–H08 below |
| AC3 | Bounded assignment + permissions + output receipt | H09–H12 below |
| AC4 | One delegation reference with native argv and response contract | Codex consumer walkthrough and package/docs checks |

Behavior cases: H01 environment absent; H02 caller differs from focus; H03 target occupied; H04 returned/moved ID; H05 initial idle without task activity; H06 blocked startup; H07 timeout/stall/unknown with stale output; H08 agent exited/replaced; H09 concurrent write ownership; H10 multiline/quoted Windows and POSIX inputs; H11 incomplete output with UI forbidden and read-only receiver; H12 foreign resource cleanup request absent. Each actual evaluation records the case input, candidate action/output, expectation and verdict. Variants can share a case but must have separate observed verdicts.

## Rollback and limits

Remove only this new source package and regenerate catalog entries if rollback is needed. No runtime layout was created by planning. Local help/fixtures do not prove active server readiness, detection, preserved focus, long-output collection or cross-host discovery; keep those as missing evidence until measured.
