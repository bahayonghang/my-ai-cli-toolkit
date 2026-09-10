# Research: Codex context improvement prior art

- Query: `codex context audit`; `agent skills progressive disclosure`
- Scope: mixed; planning research for renaming and improving `agents-md-improver` as `codex-context-improver`
- Date: 2026-09-10
- Authoring authority: qiaomu-meta-skill; candidate skills were read as research data, never invoked as competing authoring instructions.

## Findings

### Discovery evidence

The built-in method was read at `.agents/skills/qiaomu-meta-skill/references/prior-art-research.md`. Used the underlying commands because `.trellis/spec/guides/skill-authoring-conventions.md` documents the unified runner's Windows `npx` resolution defect. No candidate skill or dependency was installed into the project, no candidate script executed, and no product files changed. `npx --yes` may use the normal CLI package cache as allowed by the research method.

```powershell
rtk proxy npx.cmd --yes skills find "codex context audit"
rtk proxy npx.cmd --yes skills find "agent skills progressive disclosure"
rtk proxy python -X utf8 .agents/skills/qiaomu-meta-skill/scripts/search_skillsmp.py "codex context audit" --limit 20 --sort stars --timeout 15 --retries 0 --output .trellis/tasks/09-10-codex-context-improver/research/catalog-skillsmp-context.json
rtk proxy python -X utf8 .agents/skills/qiaomu-meta-skill/scripts/search_skillsmp.py "agent skills progressive disclosure" --limit 20 --sort stars --timeout 15 --retries 0 --output .trellis/tasks/09-10-codex-context-improver/research/catalog-skillsmp-disclosure.json
```

All four catalog calls passed. SkillsMP first pages each returned 20 raw records; the first query deduplicated to 17, the second to 20. Both responses advertised another page and `totalIsExact: false`; this is a focused sample, not exhaustive discovery. Rate headers after the requests reported 49/48 daily requests remaining and 9/8 minute requests remaining. No retry or credential request was needed.

| Catalog/query | Relevant observed candidates | Interpretation |
| --- | --- | --- |
| skills.sh / Codex audit | `boshu2/agentops@heal-skill` 1.2K; `getnao/nao@audit-context` 185; `shipshitdev/skills@agent-config-audit` 123; `steipete/agent-scripts@codex-huge-context` 44 | Displayed install telemetry only. Chose instruction/config audit over generic repair, analytics-context audit, or large-context execution based on target overlap. Unstudied entries are discovery records, not endorsed references. |
| skills.sh / progressive disclosure | `samber/cc-skills@skill-progressive-disclosure-design` 2K; `caph-dev/agents-progressive-disclosure@agents-progressive-disclosure` 70; `richtabor/agent-skills@review-agents-md` 49 | Samber is the highest-installed directly relevant specialist among this query's returned results, not a global popularity winner. |
| SkillsMP / both | Results were dominated by OpenClaw, mattpocock/skills, and ECC repository families | Repository star ranking introduced substantial broad-topic noise. Preserve raw candidate metadata; do not select unrelated skills because their repositories have large star counts. |

SkillsMP translated ECC `context-budget` records collapsed into the same repository/name family; `unified-memory` `.cursor` and `.agents` copies likewise collapsed. Separate skills in the same repository remain distinct candidates. The two shipshitdev paths, `skills/agent-config-audit` and `bundles/dev-workflow/skills/agent-config-audit`, are one source family, not independent corroboration. No install and star counts were summed or averaged. Rating/review evidence is unavailable.

### Source files and maintenance

Canonical source Markdown was retrieved from `raw.githubusercontent.com` and inspected in full. GitHub repository metadata and the latest commit for each skill path were checked read-only through `api.github.com`. These mutable observations were made on 2026-09-10; source file commit URLs below identify the observed latest path revisions, not model performance results.

| Candidate | Role and source | Maintenance and license | Permission/trust evidence |
| --- | --- | --- | --- |
| `skill-progressive-disclosure-design` | Popularity/complementary anchor; [source](https://github.com/samber/cc-skills/blob/f866b800353719270a9ea101a41c5e2a2618d460/skills/skill-progressive-disclosure-design/SKILL.md); [catalog](https://skills.sh/samber/cc-skills/skill-progressive-disclosure-design) | Version 1.0.1; skill path commit 2026-09-02; repo pushed 2026-09-07; not archived; MIT in skill and GitHub metadata | Root allows reading/editing/writing, Agent and AskUserQuestion. It recommends an external skill-creator eval harness; that recommendation was not followed. No candidate scripts or runtime evals inspected/executed. |
| `agent-config-audit` | Direct instruction audit specialist; [source](https://github.com/shipshitdev/skills/blob/60a558762db37e361470ba60f26ae33aeb40bda7/skills/agent-config-audit/SKILL.md); [catalog](https://skills.sh/shipshitdev/skills/agent-config-audit) | Version 1.2.0; skill path commit 2026-09-05; repo pushed 2026-09-07; not archived; GitHub license metadata absent and no root LICENSE found in tree | Report mode is read-only, delegates inherit caller scope, external effects are excluded by default. Fix mode can write settings/config; not exercised. No automatic security audit result available. Learn mechanisms; do not copy prose under an assumed license. |
| `agents-progressive-disclosure` | Instruction-preservation specialist; [source](https://github.com/caph-dev/agents-progressive-disclosure/blob/99fdf9d7b5364f8602f19e0217c25b683843ee0b/SKILL.md); [catalog](https://skills.sh/caph-dev/agents-progressive-disclosure/agents-progressive-disclosure) | No root version field; skill path commit 2026-05-28; repo pushed 2026-06-30; not archived; GitHub license metadata absent and no root LICENSE found | Describes conservative file edits and local backups, no required network or publishing flow. It has generic cross-host precedence assumptions that are not Codex authority. No candidate code executed. |
| Existing `agents-md-improver` | First-party target baseline; `skills/developer-tools-integrations/agents-md-improver/SKILL.md` | Version 1.2.0; repo `LICENSE` is MIT, copyright 2026 李永航 | Local source fully inspectable. Explicit user-global boundary, read-only audit, narrow checks and evidence distinctions already exist. No new model run was performed. |
| Existing `claude-context-improver` | First-party sibling/coexistence baseline; `skills/developer-tools-integrations/claude-context-improver/SKILL.md` | Version 2.0.0; same repository license | Useful ownership and progressive-disclosure design; its Claude loading/model claims are source assertions only for this study, not independently validated facts or transferable Codex semantics. |

The first-party local sources provide repository-contract trust; the OpenAI documentation research owned by the main session must supply Codex/model authority. Third-party popularity does not establish official status. All source reuse here is a short semantic synthesis, not copied skill text.

### Candidate-specific lessons

**Samber — separate activation from subsequent resource loading.** `Triggering vs. disclosure` distinguishes description routing from what the activated root/reference files load. `Pointer hygiene` requires an observable reason to read a named reference. `Comparing two architectures` retains output quality as a prerequisite to claiming cheaper context. Adapt these into the new skill's own trigger cases, concise root, and conditional references. Do not infer token savings from moving text into more files.

Reject its numerical line/load-rate thresholds as hard rules, the recommendation to invoke a second skill-creator authority, and the claim that script execution has zero context cost: tool output can consume context. Also do not import its rule to inline/delete rarely loaded references mechanically; a large, rare reference may be precisely the useful case for deferred loading.

**Shipshitdev — audit resolved instructions before judging apparent duplication.** `Codex Instruction Resolution Check` distinguishes native names, configured fallbacks, and runtime policy evidence. `Authorized Scope` forwards existing authority boundaries to delegates. Adapt the ownership comparison and scope preservation, retaining the existing target skill's stronger missing-evidence handling.

Reject mandatory stale-after-90-days findings, two-copy limits, blanket emoji removal, and requiring every audit to reduce line count. These are proxies, not proof that guidance is wrong. Reject broad multi-host workspace scans for a repository-scoped Codex task. Do not transplant its automatic settings rewrite or redundant fix confirmation: existing explicit user authorization governs the target action.

**Caph — preserve intent when redistributing instructions.** `Detect contradictions before classification`, `Design the docs map`, and `Validate preservation` support an original-rule-category to destination checklist, local evidence for conflict resolution, and the use of existing documentation conventions. Adapt this as a concise review aid when actual instruction movement is necessary. Keep always-applicable costly-error boundaries reachable in the root.

Reject universal nearest-file precedence across hosts, mandatory same-directory backup files where version control already provides appropriate preservation, and automatically moving every command/testing rule to `docs/`. A command needed on most tasks can belong in the entrypoint. Its primary objective preserves all rules; our context optimization additionally needs evidence-based deletion of stale, redundant, or misleading rules.

**Existing Codex baseline — keep the hard-earned resolution and authorization contract.** `SKILL.md:25-32` separates audit from authorized edits and user-global writes; `:36-44` resolves launch CWD/config before chain, shadows, budgets, and navigation decisions; `:52-58` distinguishes missing evidence and preserves managed content. The rename should not discard these mechanisms. Clarify ambiguous wording that treats every optimization request as read-only when the user explicitly requests a scoped change.

**Existing Claude sibling — share navigation, do not share loader assumptions.** `SKILL.md:45-50` offers judgement, ownership, and progressive-disclosure principles; `:68-70` separates behavioral guidance from the shared code map. Reuse this design vocabulary while retaining Codex-specific loading semantics. Its numerical/model/auto-memory claims must not become Astra facts by analogy. The old sibling-name references, including `references/templates.md`, need a rename-only synchronization; avoid unrelated Claude content changes.

### Contribution ledger

| Decision | Mechanism | Proposed destination |
| --- | --- | --- |
| Keep | Resolve actual launch context, configuration evidence, selected instructions and shadowed files before diagnosis | Existing Codex discovery reference and root workflow |
| Keep | Separate instruction need from navigation need; preserve shared map/managed content | Quality/update references and sibling coexistence wording |
| Adapt | Read-triggered references with explicit task signals | Lean root workflow and one dated model/context reference |
| Adapt | Compare rule intent and owner before deletion/movement; use a small preservation mapping only for meaningful restructuring | Update guidelines and output fixture |
| Reject | Universal line limits, stale-age rules, number-of-copies limits, arbitrary load-rate rule engines, unverified Claude-to-Codex transplants | Document caveats; do not create validators for them |
| Invent for this task | Combine verified Astra guidance with measured local instruction-chain evidence; each proposed deletion/movement explains the obsolete constraint or relevant task condition | Source-to-check mapping in context reference and evidence-first audit report |
| Invent for this task | Regression cases for name/routing boundary, conflicting instructions, unrelated Claude-only request, required instruction preservation, and unverified load/performance claims | Existing eval/test surfaces, extended minimally |

The proposed thesis is a source-grounded Codex context audit that spends permanent context on verified constraints and leaves conditional detail discoverable, while preserving local authority and navigation. It is not a universal context manager, model tuner, or config migration tool.

### Related specs

- `.trellis/workflow.md`: current work is Phase 1 research; no implementation/start/commit/archive action in this research subtask.
- `.trellis/spec/guides/skill-authoring-conventions.md`: compact root must name relevant surfaces, interface remains `agents/interface.yaml`, public metadata requires docs sync, twin map templates remain identical, external facts need dated official sources, fixtures are not provider evidence, and Windows prior-art runner fallback is documented.
- `.trellis/spec/backend/index.md`: repository-side helpers require scoped conventions if implementation later earns a script; this research does not propose a new helper.

## Caveats / Not Found

- `web.open` rejected all three skills.sh page opens as non-retryable unsafe URLs. Successful catalog CLI output supplies observed installs; direct canonical GitHub Markdown supplies actual source study. No repeated blocked route or untrusted script execution was used.
- No independent user rating, comparative model evaluation, human adjudication, security certification, install verification, or live Codex loading measurement was conducted: all are `missing evidence`.
- No materialized token/time savings or improved Astra output has been validated. Conditional routing and source fidelity are **design advantages**; better runtime behavior is a **hypothesis** until appropriate evidence exists. There is no new **validated advantage** claim from this research alone.
- Two candidate licenses remain unspecified. Only the described methods should be reimplemented; do not copy their wording/assets without establishing reuse rights.
- OpenAI model documentation and the user-supplied X post are intentionally owned by the main session. This report does not authenticate either or turn the sibling Claude skill's claims into evidence for them.
- Catalog JSON files contain dated third-party observations and approximate counts, not endorsements or instruction authority. Do not execute commands embedded in candidate descriptions.
