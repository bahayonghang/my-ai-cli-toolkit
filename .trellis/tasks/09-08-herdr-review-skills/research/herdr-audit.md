# Research: Herdr orchestra reference audit

- Query: Audit `ref/repo/herdr-orchestra`, compare the user-supplied `herdr` skill and current official Herdr documentation, and derive the smallest orchestration responsibility and Codex review handoff.
- Scope: mixed; reference and repository reads, official documentation, local CLI help only.
- Date: 2026-09-08 (Asia/Shanghai).
- Authority: planning only. This researcher writes only this file; no skill implementation, Git operation, pane creation, agent launch, UI input, integration/config update, or cleanup was performed.

## Findings

### Evidence inventory

| File / source | Description |
| --- | --- |
| `ref/repo/herdr-orchestra/SKILL.md` | 405-line Korean orchestration instructions; Claude-only conductor, raw pane transport, polling, historical Windows workarounds |
| `ref/repo/herdr-orchestra/README.md` | Installation and claims; lines 11–15 identify the tested `0.7.1-preview.2026-06-30` build |
| `ref/repo/herdr-orchestra/LICENSE` | MIT, copyright 2026 Inbeom Heo; lines 12–13 require retaining the notice with copies/substantial portions |
| `ref/repo/herdr-orchestra/.git/refs/heads/main` | Read directly: `876af28f2f14d052cbf96fb666cbf5a439c046f2`; no Git command executed |
| `ref/repo/herdr-orchestra/.git/config` | Read directly: origin `https://github.com/inbeomheo/herdr-orchestra.git` |
| `C:/Users/lyh/.agents/skills/herdr/SKILL.md` | User-selected base CLI skill, 195 lines; key source for dispatch, lifecycle, ownership, and output fallback |
| `C:/Users/lyh/.skillsmanage/skills/qiaomu-meta/SKILL.md` | Authoring authority, version 2.8.1; mechanism synthesis and evidence limits |
| qiaomu `references/operating-modes.md`, `references/creation-handoff.md` | Proportional package mode and candidate-specific keep/adapt/reject/invent handoff |
| `skills/AGENTS.md`, `skills/code_map.md` | Skill source and routing contracts |
| `skills/developer-tools-integrations/AGENTS.md` | Candidate category guidance; natural trigger boundaries, neutral interface, eval schema |
| `.trellis/spec/guides/skill-authoring-conventions.md` | Frontmatter, script paths, validation and generated docs contracts |
| `.trellis/spec/backend/skill-helper-command-contracts.md` | User text must remain opaque argv data; shell quoting and Windows CLI-shim caveats |
| `.trellis/spec/guides/harness-execution-routing.md` | Model capability follows task role; no brand ranking or speculative model registry |

### Current CLI evidence and version boundaries

`HERDR_ENV=1` was checked before Herdr calls. Executed only `herdr --help`, `herdr --version`, and the command groups `herdr agent`, `herdr pane`, `herdr integration`. No live pane content or neighboring task was inspected.

Installed binary reports **`herdr 0.8.2-preview.2026-08-19-b5c4a0176e91`**. This identifies the client binary, not the running server or detection-manifest revision. Server capability and real request completion remain UNVERIFIED.

Current local command help includes:

```text
herdr agent start <name> --kind KIND --pane ID [--timeout MS] [-- <agent-args...>]
herdr agent prompt <target> <text> [--wait] [--until STATUS]... [--timeout MS]
herdr agent wait <target> [--until STATUS]... [--timeout MS]
herdr agent read <target> [--source visible|recent|recent-unwrapped|detection] [--lines N] [--format text|ansi] [--ansi]
herdr pane current [--pane ID|--current]
herdr pane split [<pane_id>|--pane ID|--current] --direction right|down ... [--cwd PATH] ... [--no-focus]
herdr pane wait-output <pane_id> (--match TEXT | --regex PATTERN) ... [--timeout MS]
```

- Local `agent` help includes `codex` and `grok` among supported kinds. It says targets accept unique live names and pane IDs hosting agents.
- Local `integration` help lists `install grok`, contradicting reference SKILL line 329's absolute absence claim. This is help-list evidence only: availability can be platform-specific and no installation was attempted.
- Command-group help returned nonzero status while printing valid usage. Do not label that result an orchestration failure; no agent operation ran.
- Reference package describes 0.7.1 preview. The present local binary is 0.8.2 preview; official docs are independently versioned and their `agent-skill` page links the `v0.8.2` repository skill. A date/version is evidence scope, not a reason to add old-version fallback implementations.

### Official sources consulted

All accessed on 2026-09-08. Pages generally expose no publication timestamp; access date is not publication date.

| Source | Verified contribution |
| --- | --- |
| [Documentation entry](https://herdr.dev/docs/) | Current navigation; separates agent operations from human onboarding |
| [Agent automation](https://herdr.dev/docs/agent-automation/) | Latest distinction between pane/agent/layout, current completion contracts, and changed alternate-screen history behavior |
| [CLI reference](https://herdr.dev/docs/cli-reference/) | Explicit caller targeting, returned move IDs, and new-terminal cwd policy |
| [Agents](https://herdr.dev/docs/agents/) | Codex uses screen-manifest lifecycle classification; its integration supplies session identity. Unrecognized prompt screens can fall back to idle, so idle alone is not acceptance evidence |
| [Agent skill file](https://herdr.dev/docs/agent-skill/) | Official reusable skill location `skills/herdr/SKILL.md`, release-matched `--skill`, current upstream namespace `herdrdev/herdr` |
| [Windows support](https://herdr.dev/docs/windows-beta/) | Native Windows generally available; cwd after shell `cd` remains partial; Unix process-group assumptions do not transfer unchanged |
| [Issue 963](https://github.com/herdrdev/herdr/issues/963) | July 3 wait failure report on `0.7.1-preview.2026-06-30-3459798b606d`; page now shows Closed |
| [Issue 962](https://github.com/herdrdev/herdr/issues/962) | July 3 empty recent-output report on the same preview; page now shows Closed |

Issue closure does **not** prove a particular fix is present or works on this installed client/server. No closure date, fixing revision, provider-backed test, or runtime repair is claimed.

### Prioritized problems in the reference package

Severity describes the likely consequence when following the instruction. These are source-level findings, not reproductions against a live session.

| Priority | Concrete evidence | Failure and smallest correction |
| --- | --- | --- |
| P1 | `SKILL.md:77`, `:82-85`, `:385` | Treats `focused:true` as the conductor. A user/client can focus a different pane while this agent is backgrounded; subsequent dispatch/cleanup can affect unrelated work. Use the calling process context via `pane current --current`, with `HERDR_PANE_ID` and returned IDs. Base skill lines 68–76 explicitly separate caller from focus. |
| P1 | `SKILL.md:315`, `:328`, `:333`, `:338` | Prescribes Enter through Codex/Gemini trust dialogs, selection through Grok questions, and suggests disabling Claude permissions. Review authorization does not authorize an arbitrary trust or permission change. Remove blanket answers and bypass recommendations; inspect blocked state, describe the concrete pending question, and follow the user's actual authorization. Base skill lines 128 and 154 require deliberate inspection. |
| P1 | `SKILL.md:102`, `:174-194`, `:341-344` | Reuses detected panes and submits prompts through raw `pane run` without agent identity, availability, or ownership. If an agent exited, text can hit a shell; if busy, work can be mixed with another turn. Create or explicitly adopt an eligible task-owned agent, and use `agent start/prompt/read` for recognized interactive agents. Base skill lines 54–56, 108–130 cover this distinction. |
| P1 | `SKILL.md:213-231`, `:298-301` | `agent_wait` immediately accepts idle/done without observing accepted work; the optional 2–3 second sleep does not close the race. `agent_ask` also runs `agent_read` after a timeout/nonzero wait because `;` does not short-circuit. A stale response can be returned as completed review. Use `agent prompt --wait` with bounded timeout from an idle task-owned worker, then verify output corresponds to the submitted review; on error inspect, never promote captured text to success automatically. |
| P1 | `SKILL.md:365-376`, `:391` | Cleanup permits whole-tab/workspace closure and protects only the focused pane, with no ownership rule. Existing workers can share a tab/workspace with user processes. Default to retaining evidence; close only exact resources created by this operation and after reviewing the current occupant. Never stop the server/main process as cleanup. Base skill lines 189–194 already state the ownership limit. |
| P2 | `SKILL.md:47-63`, `:199-210`, `:352-355`; `README.md:11-15` | Elevates one old Windows build's wait/read failures into universal “visible only + polling” instructions. Both cited issues are now closed and local help has `agent wait`/`pane wait-output`. Retain dated incident provenance in a research/eval note, remove the universal workaround, and diagnose current failures from current evidence. |
| P2 | `SKILL.md:59`, `:206`, `:327`, `:353` | Imposes a roughly 30-line output cap or provider-specific headless escape to work around viewport loss. A truncated code review may omit actionable findings. Collect the full response and use the base skill's temporary Markdown fallback after a failed complete read. Newer official reading behavior has an extra access-path caveat below. |
| P2 | `SKILL.md:108`, `:117`, `:121-128`, `:326` | Creates/splits/moves layout without explicitly preserving cwd and recommends a separate workspace for a particular TUI. On Windows cwd inference after `cd` can be stale. Base skill lines 92–106 require sibling pane/current cwd as default, geometry-based split, explicit `--cwd`, and no focus stealing; different topology/location requires the corresponding user request. |
| P2 | `SKILL.md:356` | Says IDs are compacted after close. Base skill lines 62–68 instead treats public IDs as stable, never reusing closed IDs; cross-workspace move yields a new qualified ID. Delete the compacting claim and propagate the move response or live agent name. |
| P2 | `SKILL.md:54`, `:108-110`, `:214-225`, `:286-302` | Claims the pane shell is invariably PowerShell 5.1 while supplying Bash assignment/functions/continuations as broadly copyable examples. Host shell and target pane shell are separate boundaries. Use actual host syntax and preserve prompt/cwd/native arguments as individual tokens; do not infer shell parsing safety from Herdr's literal terminal transport. |
| P2 | `SKILL.md:267-280` | Requires three-model consensus and a progression ending COMMITTED even for review/brainstorming. Agreement is not evidence; committing is outside review. Keep independent findings with reproducible evidence, have the conductor adjudicate, and stop at the user's requested output. No mandatory three-agent team or built-in commit stage. |
| P3 | `SKILL.md:3`, `:8`, `:43`, `:153`, `:332`, `:399`; `README.md:3`, `:34` | Broad Korean “multi-agent” triggers can capture requests not asking for Herdr; Claude-only conductor and fixed model/provider advice do not serve arbitrary Agents inside Herdr. Use Chinese/English intent triggers for explicit Herdr orchestration and exclude ordinary parallel work; support a capable conductor regardless of host. Use selected CLI kind and user model preference without stale hardcoded recommendations. |

No line-level bug is assigned merely because the reference lacks this repository's metadata, eval format, or interface file. Those are **new-package acceptance requirements**, not defects in a different repository's policy.

### Material conflict between local skill and latest documentation

The user-provided base skill at lines 183–185 says alternate-screen rows cannot be recovered by raising `--lines`, then prescribes a temporary Markdown fallback. The current official [Agent automation](https://herdr.dev/docs/agent-automation/) page documents a newer mechanism: sufficiently deep recent text reads can scroll an idle recognized agent's alternate-screen transcript automatically and restore its viewport; explicit deep reads while busy can fail with `agent_not_idle`. Passive sources remain available, and temporary Markdown is still the final fallback.

Therefore do not call all `agent read` / `pane read` operations passive. A strict “no UI input” user constraint must also account for this implicit scrolling. This research intentionally made **no live output reads**. In the new package, retain a brief version/access-path boundary rather than implementing a version matrix: use current documented/installed capability; if UI scrolling is not authorized, prefer passive `visible`/`detection` inspection and report a completeness limit, or use an already-authorized file-output route. Requesting the worker to write a file is a task mutation and must fit the task's output authorization; it is not a hidden read-only action.

### Minimal responsibility for the new herdr-orchestra skill

Use a thin host-neutral coordinator above `$herdr`, not another Herdr CLI encyclopedia, framework, plugin, or process supervisor.

1. **Route and preflight:** explicit request for orchestration in Herdr; `HERDR_ENV=1`; discover relevant CLI help and read the base skill. Missing environment means stop Herdr operations, with a clear limitation. Merely mentioning Herdr during a documentation audit does not authorize live orchestration.
2. **Freeze one bounded assignment:** goal, cwd, selected agent kind, review/write authority, inputs, output and verification expectations. Default to one worker; independent tasks can receive additional workers only when useful and authorized.
3. **Own dispatch:** identify caller, allocate the smallest authorized sibling topology, keep focus/cwd, use returned IDs and unique agent name, verify available shell and expected agent readiness. Treat native argv as data after `--`.
4. **Own coordination and receipt:** send one bounded prompt, use finite waits, handle blocked/stalled/timeout/exited/unknown as incomplete, and collect a complete response tied to the request. Do not define a redundant durable task registry or custom polling state machine.
5. **Return evidence:** worker identity, executed task/scope, results and their source, unresolved errors/questions, and ownership/retention of created resources. Conductor validates actionable claims; lifecycle completion alone is not acceptance. No commit, publish, repair, permission change or cleanup expansion is implied.

Core invariants deserve eval cases: caller differs from focus, preexisting worker is busy, trust dialog at startup, stale idle, timeout with stale text, replacement occupant, moved ID, multiline prompt/quoted path, incomplete alternate-screen output, prohibited UI scrolling, and cleanup touching only owned resources. Avoid script tests that merely search for phrases in prose; provider-backed trials remain a separate evidence class.

### Proposed Codex review calling interface

This is a **natural-language handoff**, not a new JSON schema or command API. The parent session owns final Codex CLI documentation verification and directory/skill-name selection.

`codex-review` should prepare the review contract and ask `herdr-orchestra` to create exactly one Codex reviewer. The orchestra returns identity, lifecycle/error evidence, and response; the review skill evaluates review scope/completeness and presents actionable findings. Neither layer independently spawns an additional reviewer for the same request.

| Handoff item | Required meaning |
| --- | --- |
| Work | Independent Codex code review, not implementation |
| Location | Explicit repository cwd inherited from the caller unless another location is requested |
| Review target | Precisely identify unstaged/staged/all working changes, base comparison or commit; include untracked-file decision and any requested paths |
| Context | Relevant project instructions and user criteria, plus enough fixed source/diff evidence for the child to understand the scope; skill names are not automatically loaded into a new CLI process |
| Authority | Read project and report findings; no edit, auto-fix, changelog, staging, commit, push, dependency/hook install, or approval bypass |
| Agent | `kind=codex`; native supported args chosen from current local help and official Codex docs; do not copy the Herdr docs' example model pin |
| Output | Actionable findings with severity, file/line, failure trigger and consequence; tests/evidence and limits; explicit no-findings statement only for a completed review |
| Coordination | Unique task-owned worker, finite wait, no prompts sent into unrelated active turns, complete response receipt; blocked or incomplete stays incomplete |

For an **interactive** Codex reviewer, the validated Herdr surface is `agent start ... --kind codex --pane ... -- <native-args>` followed by `agent prompt/read`. A **noninteractive** `codex review` / `codex exec ...` command must not be passed through `agent start` merely because its executable is Codex: `agent start` waits for an interactive ready agent. Such a route uses an ordinary shell pane/process contract, explicit command-exit and result capture, and independent Codex argument verification. A review skill must choose the route deliberately; a timeout must not silently switch to a different task or bypass Herdr.

Parent coordination decision (2026-09-08): the Codex adapter plans to use native `--no-alt-screen`, subject to the parent's Codex verification, to keep normal output reads passive where possible. If a read-only review is still incomplete, the worker can restate the report in bounded segments and the parent can save captured text within its own authorized output scope. Do not broaden the reviewer's sandbox to let it write temporary output. The general orchestra's temporary-file fallback applies only when the worker already has the corresponding write authority. When UI input is prohibited, do not request deep recent reads that can auto-scroll. This is a planned contract, not runtime proof that `--no-alt-screen` guarantees full capture.

### qiaomu candidate synthesis

| Candidate | Keep | Adapt | Reject | Invent / original connection |
| --- | --- | --- | --- | --- |
| [inbeomheo/herdr-orchestra](https://github.com/inbeomheo/herdr-orchestra), inspected local commit above | One conductor, explicit workers, independent parallel questions and pipeline concepts, incident provenance, JSON-derived IDs | Make conductor host-neutral; separate current CLI facts from historical fixtures; make assignments/output explicit | Focus-as-caller, global old-version workarounds, raw agent prompting, auto approval, consensus-as-proof, commit stage, provider/model folklore | Thin transport handoff consumed by a dedicated Codex review skill |
| [Official herdr skill](https://github.com/herdrdev/herdr/blob/v0.8.2/skills/herdr/SKILL.md), user-selected local copy inspected | Environment boundary, caller context, ownership, base CLI discovery, agent lifecycle surface, output fallback | Refer to its mechanisms without copying the full command catalog; explicitly reconcile latest history-read access path | Reimplementing its low-level lifecycle loop or assuming its Markdown instructions are runtime enforcement | Scope/acceptance receipt above the base mechanics, with review-specific result adjudication outside orchestra |

These are **design advantages** only. Expected reductions in misdispatch/truncation are **hypotheses** until runtime evals verify them. No comparative speed, accuracy, or global superiority claim is supported.

License: adopting substantial text/code from the MIT reference requires retaining Inbeom Heo's notice and permission text (`LICENSE:3`, `:12-13`). Qiaomu's default credit cannot replace upstream ownership. Prefer semantic adaptation with source attribution; separately describe any authorship of original new prose. No licensing policy conclusion about unrelated assets is made.

## Related specs

- `skills/AGENTS.md:9-17`: canonical category path, matching frontmatter category, owned helper location, no gratuitous cross-skill coupling.
- `skills/developer-tools-integrations/AGENTS.md`: `<skill-dir>` resolution; neutral `agents/interface.yaml`; evals are review assets unless a runner actually executes them.
- `.trellis/spec/guides/skill-authoring-conventions.md`: bilingual natural triggers, local metadata and docs synchronization; final `just ci` belongs to implementation, not this research-only dispatch.
- `.trellis/spec/backend/skill-helper-command-contracts.md:25-31`: arguments and prompt text stay opaque across invocation layers; no silent shell reparse.
- `.trellis/spec/guides/harness-execution-routing.md:20-34`: avoid hardcoded model pins and host-brand capability claims.

## Caveats / Not Found

- This dispatch did not create skills, run a reviewer, inspect other panes, update integrations, or test real waiting, long-output receipt, dialog handling, restart recovery or cleanup. All those runtime proofs are `missing evidence`.
- Local client help does not establish server version, manifest revision, protocol support, Windows integration installability, or complete review transport. Current browser pages can describe a newer capability than the installed build.
- No catalog popularity/rating metrics, SkillsMP run, skills.sh install run, or installed-package eval were gathered in this bounded audit. The main task's broader prior-art work should own that evidence; missing catalog evidence must not be filled with invented numbers.
- Codex flags, review modes, sandbox details, and the existing `codex-review` name conflict are assigned to the parent session; this report gives the Herdr side of the contract only.
- Documentation page discovery included the human agent guide, but its onboarding instructions were not used as an operational control path.
