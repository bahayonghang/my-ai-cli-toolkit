# Design: Herdr orchestration and Codex review

## Ownership and delivery shape

Use two instruction-first packages with no execution helper or new dependency. The recurring work needs a clear delegation protocol, not a second implementation of Herdr. Both packages start at `0.1.0`; package maturity and runtime evidence remain separate.

| Owner | Responsibility | Planned source |
| --- | --- | --- |
| herdr-orchestra | Caller/environment, layout, agent readiness, dispatch, wait, collection and owned-resource handling | `skills/developer-tools-integrations/herdr-orchestra/` |
| codex-review | Review target, read-only native args, leaf-review prompt, findings contract and parent verification | `skills/development-workflows/codex-review/` |
| Official Herdr CLI | Accepted command syntax, runtime identity and lifecycle | Installed help, supplemented by dated upstream docs |
| Calling Agent | User intent, permissions, decomposition, ownership and final acceptance | Current task context |

The adapter invokes the other package by loaded skill name/path and hands over text. There is no fixed relative filesystem traversal between installed skills, JSON RPC API, controller daemon, config registry or job database. If the named in-repo dependency is unavailable, report the missing package and its source path; do not claim a direct Codex launch satisfied the requested Herdr route.

## Routing contract (R1, R3, R5)

- Explicit Herdr coordination of workers → `herdr-orchestra`.
- Explicit Codex review in Herdr, or a codex-review invocation with established Herdr task context → `codex-review`, then `herdr-orchestra`.
- Simple Herdr pane inspection/terminal control → installed official `herdr` guidance when available, or installed CLI help. The official skill is a reference, not a required external package dependency.
- Ordinary review without a Codex/Herdr request → the existing review workflow. A bundled Codex collaboration request outside Herdr stays within `codex-bridge`'s existing remit.
- A spawned reviewer assigned to do the review itself is a leaf; it does not trigger either orchestration entrypoint again.

Draft description for orchestra: “Use when the user explicitly asks to coordinate worker agents in Herdr, delegate tasks across Herdr panes, or collect and compare their results; 支持 Herdr 多 Agent 编排、分工、交叉核验。Do not use for ordinary local subagents, simple pane inspection, or work outside Herdr.”

Draft description for review: “Use when the user asks an Agent inside Herdr to start Codex for an independent review through herdr-orchestra; 支持在 Herdr 中让 Codex 审查改动、提交、文件或计划。Do not use for generic review, direct non-Herdr Codex collaboration, automatic fixes or CHANGELOG generation, or when already assigned as the leaf reviewer.”

These are planning drafts. Trigger smoke cases must be authored against the real domain and independently reviewed; the qiaomu keyword scorer is not provider routing evidence.

## Delegation handoff (R2, R3, R4, R7)

Use a short prose block with the following actual values, not a persistent schema:

1. Objective and completion evidence.
2. Explicit cwd and caller identity obtained from current context.
3. Worker kind, requested name and native argv; preserve user-selected model, otherwise inherit config.
4. Input scope: target refs/files, conventions and any reviewed material boundaries.
5. Read/write permission and exclusive file ownership; declare other concurrent work and forbidden actions.
6. Expected response and how the parent will accept it; leaf/no-further-delegation restriction when applicable.

Orchestra returns the resolved identity, observed lifecycle, collected response, coverage/completeness and outstanding failure. Herdr state and task success are independent observations. The parent remains the sole synthesizer.

## Orchestration sequence (R1, R2)

Check explicit Herdr scope and `HERDR_ENV` before session controls. Discover installed syntax using help and non-mutating command groups. Resolve caller via `--current`/environment context, never the UI-focused pane. Default to a sibling in the caller tab/cwd, select geometry from layout, and use `--no-focus`. Use returned JSON IDs, including changed IDs after a move.

Use only a new/available shell pane for `agent start`, then wait for readiness before sending a task. Do not send a fresh job to an already-working agent: Herdr waits are not per-turn tracking. Dispatch with `agent prompt ... --wait` and a finite per-call timeout; timeout means inspect the existing worker, not launch a replacement. Run ordinary shell work only through the pane surface. Optional parallel query, pipeline and cross-check patterns stay in a short reference; writable workers require non-overlapping ownership or an explicitly requested isolated location.

Record and handle actual errors rather than build a closed error-code table. Known cases to test are startup not ready, blocked, unknown, stalled prompt, timeout, exited/replaced occupant and incomplete response. Never auto-press Enter on trust/approval dialogs. Do not change global integrations or kill the Herdr server. Leave worker panes available on ordinary completion; cleanup is a deliberate action limited to resources owned by the task and never an unrelated live process.

## Codex review sequence (R3, R4)

Resolve the review cwd and one scope before launching. Default “current changes” means staged, unstaged and untracked; an explicit base uses its merge-base comparison, a commit uses that commit's changes, and explicit files/plan use those inputs. Record relevant HEAD/ref identities and an input snapshot sufficient to detect scope changes; inspect again before accepting findings. Do not checkout/fetch/reset to prepare review. If the reviewed inputs change, report scope drift and the need for a newly authorized/still-authorized rerun rather than presenting stale findings as current.

Ask orchestra to create one interactive `codex` worker with native arguments:

```text
--sandbox read-only --ask-for-approval never --no-alt-screen
```

Use a full natural-language review prompt, not `/review` UI automation. This is an interactive Codex review request, not a claim to have run the dedicated `/review` preset. Root flags and their local help are checked at execution. Preserve any explicit user model; otherwise do not set one. Do not pass `exec review` into an agent-start path that waits for interactive readiness. The optional CLI reference explains `review`/`exec review` and their target/PROMPT conflicts, but a second one-shot transport is outside this MVP.

The reviewer reads and analyzes locally without repairs, CHANGELOG, git writes, dependencies, hooks, trust changes or further agents. Sandbox intent is not a claim that Codex writes no session metadata or that connectors are sandboxed identically. Its prompt limits all tools to the assigned review; a check requiring mutation remains unrun.

Findings carry priority, exact file/line, concrete scenario, effect and evidence. The response states actual reviewed scope and verification limits, including an explicit no-actionable-findings outcome when justified. Parent rechecks actionable claims against unchanged inputs and reports accepted findings, discarded false positives when material, and remaining uncertainty. No automatic fix-review loop.

## Output collection and UI boundary (R2, R4)

Read output only through the resolved worker. Latest Herdr docs describe automatic mouse-scroll during some deep alternate-screen history reads; the local supplied Herdr skill describes an older limitation. Record this drift and consult current behavior rather than declare recent sources always broken or all reads passive.

Where UI input is prohibited, use passive reads. Codex is launched with `--no-alt-screen` to preserve ordinary scrollback; this improves the design but Herdr detection/retrieval still needs live evidence. If the complete final response is unavailable, ask the same read-only reviewer to repeat missing material in small numbered parts and collect those parts. The parent may write captured text under its own artifact authority. Do not enlarge the reviewer sandbox to write a temporary file. For other worker roles that already have permission for an output file, the generic upstream temp-file fallback remains available only after read failure. An incomplete recovery stays incomplete.

## Package and evaluation conventions (R6, R7, R8)

Earned files per package: root `SKILL.md`, `agents/interface.yaml`, a workflow/contract reference, relevant CLI/provenance reference, `evals/evals.json`, dedicated qiaomu trigger cases, and `reports/` containing prior-art, IR, trigger smoke, output review and creation handoff. Examples/fixtures never use a nested exact `SKILL.md`. Use `<skill-dir>` literal substitution for resources, and provide PowerShell and POSIX forms where shell syntax differs.

Apply Production-level evidence proportionally. `.trellis/spec/guides/skill-authoring-conventions.md:314` deliberately excludes per-package README/manifest files just to satisfy qiaomu validation; public documentation is generated by the repository catalog. Respect this repo contract, run the qiaomu validator, and record the actual schema deviation instead of adding ceremonial files or claiming it passed. All other package checks must be addressed. Attribution must name studied candidates and respect any adapted source licenses; meta-method attribution must not be misrepresented as ownership of third-party code.

Behavior fixtures use the repo `evals/evals.json` schema; trigger cases are a separate smoke input with domain-specific concepts. Manually assess output cases and document the candidate response, expected behavior, verdict and provenance. Do not add regex tests that merely mirror prose. Live tests are a separate evidence tier: actual account/model calls and real pane operations require the applicable execution authority and an isolated, owned scope. If unrun, declare them missing rather than converting fixture success into runtime success.

## Trace and rollback

| Parent AC | Design mechanism | Evidence |
| --- | --- | --- |
| AC1 | Ownership/routing/package conventions | Metadata, root isolation, neutral interface and docs catalog checks |
| AC2 | Orchestration sequence and output boundary | Orchestra behavior cases and recorded semantic verdicts |
| AC3 | Handoff, review sequence, leaf rule | Cross-package review scenario and routing negatives |
| AC4 | Scope capture, findings contract, collection | Review scope-drift/truncation/quoting cases |
| AC5 | Separate evidence tiers and package convention deviations | Reports, docs-sync, final just ci, explicit missing evidence |

Rollback of the eventual source change removes only the two newly created source directories and regenerates their docs; it never touches an installed third-party package or an unrelated runtime pane. No migration or compatibility adapter is needed.
