# Incident: 2026-09-08 omp Google models via herdr-orchestra

Date: 2026-09-08. Environment: Herdr `HERDR_ENV=1`, caller `w4:p2`, tab `w4:t2`, cwd `D:\Documents\Code\Agents\my-claude-code-settings`. Kind list included `omp`. Integration `omp: current (v9)`.

This note records the live run. It is not a Herdr product bug report and not proof of other kinds.

## Request

User invoked `/herdr-orchestra` with: 请帮我调用 omp 查询谷歌当前有哪些模型.

Acceptance implied: a current Google/Gemini model list from omp, with evidence.

## What ran

1. Environment and CLI help passed. Caller pane `229x56`, split right `--no-focus` → `w4:p3`. pwsh at prompt.
2. `herdr agent start omp_google_models --kind omp --pane w4:p3 --timeout 60000` returned `timeout` / `timed out waiting for agent startup`. `herdr agent get omp_google_models` → `agent_not_found`.
3. `w4:p3` still hosted omp TUI: title `π > my-claude-code-settings`, welcome `omp v18.1.14`, model `Gemini 3.8 Flash`, provider `google-antigravity`. Pane `agent_status=unknown`. Foreground WMI process remained `pwsh.exe`; child `bun.exe` ran `C:\home\lyh\.npm-global/node_modules/@oh-my-pi/pi-coding-agent/dist/cli.js`. Child env had `HERDR_ENV=1`, `HERDR_SOCKET_PATH=C:\Users\lyh\AppData\Roaming\herdr\herdr.sock`, `HERDR_PANE_ID=w4:p3`.
4. Server log for this pane (internal pane_id=15) had `agent.start` ok then timeout `agent.get`. No `herdr::pane: agent changed ... agent=Some(Omp)` line. Codex/Grok detections in the same log matched process image names (`codex`, `grok.exe`).
5. Orchestra contract forbade raw pane input without confirmed identity. Operator did not prompt the TUI.
6. Operator then split `w4:p4` down from the now-narrow caller and `pane run` `omp models find google` / `find gemini` / `google-antigravity`. That produced the catalog. First `wait-output --match OMP_MODELS_END` matched the command line that contained the same token; a later `^OMP_MODELS_END$` regex wait collected the finished output (`truncated: false`).

## Failure chain

```
user: 调用 omp 查询模型
  → compact workflow always agent start
  → omp TUI up, Herdr identity never ready
  → prompt path blocked
  → extra pane + CLI (transport change the skill forbids as silent success)
```

Root compact-path defect: `SKILL.md` Compact Workflow step 3 always starts an interactive agent. `references/delegation.md` already says one-shot `exec`/`review` and ordinary programs belong on pane surface and must not use agent lifecycle. The live operator followed the root compact path, not the exception buried in the reference.

## Observed mechanism classes

| Mechanism | Evidence | Class after qiaomu generalization |
| --- | --- | --- |
| Compact workflow always `agent start` | SKILL.md lines 23–24 vs delegation.md line 28 | Core. Surface must be chosen before start. |
| Kind-native non-interactive command can satisfy the goal | `omp models` lists Google/Gemini catalog; TUI chat was unnecessary | Core. If a kind-native non-interactive command meets the stated acceptance, use pane surface first. |
| Wrapper runtime vs process-name detection | bun.exe + pi-coding-agent; no `agent changed`; grok/codex matched image names | Core diagnosis: kind binary may not be the foreground/child image. Do not encode `omp`/`bun.exe` as a standing rule. |
| Integration installed ≠ report_agent delivered | `herdr integration status` omp v9; no report in server log; extension requires `ctx.hasUI === true` before session_start reports | Adapter/fixture. Keep as eval + troubleshooting, not a second controller. |
| Start timeout drops the live name while leaving the process | `agent_not_found` after timeout; TUI still running | Core. Timeout is not “nothing launched”. Inspect the owned pane; do not treat missing name as empty shell. |
| Visual idle ≠ Herdr idle | Welcome prompt visible; pane unknown | Core. Unknown/unregistered identity cannot receive `agent prompt`. |
| Silent second pane after start failure | `w4:p4` created after `w4:p3` timeout | Core. Same-worker inspect first; no automatic replacement worker. |
| Completion marker substring of the command | `wait-output --match OMP_MODELS_END` hit the `pane run` line | Core for pane-surface collection. Marker must not appear in the sent command text. |
| Google model table contents | catalog rows | Eval-only fixture. Not a skill rule. |

## Keep / adapt / reject / invent

- Keep: HERDR_ENV gate, caller≠focus, no-focus sibling, no auto-trust, lifecycle≠acceptance, no raw prompt into unconfirmed identity, no silent transport claimed as Herdr completion (H01, H07, H08).
- Adapt: Compact Workflow must name pane surface vs agent surface before split/start, matching delegation.md line 28.
- Reject: omp-only `bun.exe` encyclopedia; faking `pane report-agent`; treating TUI chrome as `agent prompt` ready; adding README/manifest to pass qiaomu schema (creation-handoff already records that repo contract).
- Invent: none beyond making the existing pane-vs-agent contract executable in the root compact path, plus evals for the missed classes.

Prior-art catalog rerun is not required for this iteration: the change tightens an existing contract rather than introducing a new skill. If planning later adds a new transport, rerun discovery then.

## Product decision

2026-09-08 user selected option 1: after `agent start` timeout with a visible TUI and no Herdr identity, inspect the same pane and return incomplete. No CLI fallback, raw pane input, `report-agent` impersonation, or second worker.

## Missing evidence

- Why omp’s herdr extension did not `report_agent` despite HERDR_* env (hasUI, named-pipe path, extension load). Not claimed.
- Whether other wrapper kinds (node/python shims) fail the same way. Treat as predicted class, not counted runs.
- Whether `omp -p` would have been a valid one-shot chat alternative. Unused this run.
- Real Herdr provider/model execution of the updated skill. Still missing after this task until a live re-run.
