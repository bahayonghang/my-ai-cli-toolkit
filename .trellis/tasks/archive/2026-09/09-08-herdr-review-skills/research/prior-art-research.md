# Prior-art research and contribution ledger

- Researched: 2026-09-08. Method: user-selected qiaomu-meta-skill 2.8.1; source inspection rather than candidate installation/execution.
- Queries: `herdr orchestration`; `codex independent review`; `multi agent cross review`.
- Catalogs: skills.sh and SkillsMP, queried through the meta package's supported underlying tools. Ratings/satisfaction evidence: unavailable.
- Local source baseline: `dev`, HEAD `36919731`; initial `git status --porcelain -uall` contained no pre-existing changes before task creation.

## Catalog execution and limitations

The unified `research_prior_art.py --strict` failed before producing its combined report: Python on Windows could not resolve `npx` and raised `FileNotFoundError [WinError 2]`. This matches the already documented repo convention in `.trellis/spec/guides/skill-authoring-conventions.md:391`. No user-global script was repaired.

Recovery used direct `npx --yes skills find` for all three queries (all exited 0), plus `research_prior_art.py --skip-skills-sh --summary --timeout 15 --retries 0` for SkillsMP. The latter exited 0 with 29 candidate families, each query successful; the preserved generated `prior-art-candidates.json` says `complete: false` and `skills_sh: not_run` because that invocation intentionally ran only SkillsMP. The separate direct skills.sh observations below complete the research activity, not that machine report's execution history. No scores are added across sources.

| Direct skills.sh observation | Displayed installs, 2026-09-08 | Disposition |
| --- | --- | --- |
| `herdrdev/herdr@herdr` | 41.8K | Studied; official runtime contract anchor |
| `pedronauck/skills@herdr-orchestration` | 94 | Discovery only; not used as implementation evidence |
| `jezweb/claude-skills@codex-review` | 472 | Discovery only; attempted GitHub `main/skills/codex-review` source path returned 404; no lessons attributed |
| `riekelt/multi-agent-review@multi-agent-review` | 5.2K | Discovery only; broad multi-review is outside the minimal transport scope |

SkillsMP reports official Herdr repository stars as 35,573 for `herdrdev/herdr`, and 22,326 for an older `ogulcancelik/herdr` entry. Opening [the old repository URL](https://github.com/ogulcancelik/herdr) redirected to [herdrdev/herdr](https://github.com/herdrdev/herdr). Collapse those two entries at canonical repo + `skills/herdr` path, retaining their separate dated telemetry as index drift, never summing it. GitHub displayed rounded 36.0k stars on this visit; it is another observation, not an adjustment to the saved catalog response. No skill quality conclusion follows from any of these counts.

## Studied shortlist

| Candidate actually inspected | Evidence and trust | Candidate-specific lesson | Deliberate rejection / destination |
| --- | --- | --- | --- |
| [inbeomheo/herdr-orchestra](https://github.com/inbeomheo/herdr-orchestra) | Local full SKILL/README/LICENSE; commit `876af28f2f14d052cbf96fb666cbf5a439c046f2`, 2026-07-03; MIT, Inbeom Heo | A conductor can bound independent work, assign it to worker panes, compare returned evidence and execute sequential dependencies | Reject focus-as-caller, automatic trust answers, old visible-only/polling rules, stale-idle completion, model folklore and mandatory commit stage; keep orchestration concepts in the new delegation/pattern reference |
| [Official herdr skill](https://github.com/herdrdev/herdr/blob/master/skills/herdr/SKILL.md) | User-supplied/local 195-line skill and fetched official source/docs; current repo identifies Apache-2.0 | Respect caller environment, parse runtime IDs, distinguish layout/pane/agent, use named-agent readiness and bounded waits | Do not copy a full CLI encyclopedia; reconcile newer auto-scroll history docs and only retain fallback within worker authority |
| Local `codex-bridge` | `skills/development-workflows/codex-bridge/SKILL.md:3`, `:33`, `:48`, `:56` read; one-party repository source | Explicit Codex intent, fixed review access boundary, parent validation and no unbounded review recursion | Do not import its persistent bundle hierarchy, scenario model pins or implementation rounds into a single Herdr review; keep it as adjacent routing and a semantic precedent |
| Installed third-party `codex-review` | `.agents/skills/codex-review/SKILL.md:3`, `:18`, `:27` read; stub points to [BenedictKing/codex-review](https://github.com/BenedictKing/codex-review). Upstream license/full behavior not inspected | Same-name discovery is a real integration concern; a name and generic review description do not establish the requested transport | Reject its advertised auto CHANGELOG behavior for this readonly review; do not install or overwrite it. Do not attribute uninspected upstream behavior beyond the stub |

No untrusted candidate code, installer, hook or model invocation was executed. npx was used for catalog queries only, not `skills add`. Licenses and maintenance are recorded at the inspected-source level; an uninspected license is missing evidence, not a permission assumption. Original material will be written independently with source attribution. If substantial licensed source is adapted, retain the applicable license/notice; qiaomu credit never replaces the original owner.

## Contribution ledger

- **keep**: one accountable caller, bounded worker assignments, native agent identity/lifecycle, precise review scope and parent adjudication.
- **adapt**: Claude-only conducting becomes host-neutral; shell examples follow actual PowerShell/POSIX boundaries; dated bug workarounds become recovery cases; read-only review uses no-alt-screen plus bounded text retransmission instead of writing a temp report from the reviewer.
- **reject**: copying the 405-line reference, automatic trust/bypass, majority vote as correctness proof, a universal polling controller, hardcoded models, automatic commit/fix loops, default global installation and old CLI compatibility branches.
- **invent**: a thin text delegation contract connecting a Herdr process skill to a Codex review skill, with a leaf rule and separate lifecycle/response/scope evidence. This is a design contribution for the user's workflow, not a claim of novel research.

## Planned advantages and limits

- **design advantage**: responsibility is explicit in the parent/child plan; only orchestra owns process controls, only review owns findings semantics.
- **design advantage**: the plan directly addresses the inspected reference's caller, approval, stale-output, cleanup and read-only recovery problems.
- **validated advantage**: none claimed for new skills, because product source, runtime trials and package evals do not yet exist.
- **hypothesis**: no-alt-screen and numbered retransmission should improve complete review retrieval, but actual Herdr detection and result collection are missing evidence.

## Planned package evidence and repo deviations

Use qiaomu's Production evidence ladder proportionally: trigger-aware entry, neutral interface, output contract, prior-art/IR/handoff, lexical smoke and semantic cases. The repository intentionally uses generated catalog documentation and omits per-package README/manifest merely to satisfy qiaomu validation (`.trellis/spec/guides/skill-authoring-conventions.md:314`). Run the relevant tool and record that precise schema deviation; do not claim a clean qiaomu package pass if it fails. Domain trigger cases must not use qiaomu-authoring default concepts. Repo `evals/evals.json` and qiaomu trigger-case inputs are different formats and evidence tiers.

Install/live-link mapping is a repo contract; new-session discovery is separate (`docs/harnesses.md`). No installation or replacement of the current same-name entry is authorized by this research activity. Auth/account access, model calls, effective sandbox, Herdr server/detection, long output, cross-host startup, and fresh-session discovery remain missing evidence.
