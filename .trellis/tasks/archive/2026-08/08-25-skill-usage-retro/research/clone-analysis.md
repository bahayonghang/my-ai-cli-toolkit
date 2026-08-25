# Clone analysis

Date: 2026-08-25
Root: `ref/repo/skill-usage-retro/`
Method: `git clone --depth 1`. Large repos: `--filter=blob:none --sparse`.
Scripts in clones were not executed.

Target job after Q1: named skill → historical conversations that invoked it → improvement report + handoff Prompt. Do not edit the target skill.

## Closest matches (read SKILL.md)

### quangtran88-x-skills / skills/x-skill-improve

Searches historical Claude sessions for a named skill. Builds an instruction inventory. Classifies Followed / Deviated / Skipped / Worked Around / N/A. Dual verdict `UPDATE SKILL` vs `COMPLIANCE GAP`. Report table in `references/output-template.md`. Session discovery in `references/session-discovery.md`: MCP `session_search`, fallback JSONL grep, then paste.

Also applies edits after the user chooses Apply. Persistence: `data/alignment-log.jsonl`. Bound to x-skills + oh-my-claudecode.

**Adapt:** inventory, dual verdict, session pick list, JSONL fallback, alignment log.
**Reject:** auto-apply path; x-skill-only resolution; Basic Memory write.

### Sun-sunshine06-skill-optimizer / skills/skill-optimizer

Hard rule: **Read-only: never modify skill files. Only output report.** Claude `Skill` tool_use + Codex session events. Codex note (SKILL.md:72-78): load in `base_instructions` is not invocation; invocation is workflow-marker output. Eight dimensions include post-invocation user reaction, workflow completion, undertrigger. P0/P1/P2 report.

Default can scan all installed skills.

**Adapt:** read-only contract; Codex load ≠ invoke; user reaction after invoke; undertrigger as a finding type; P0/P1/P2.
**Reject:** whole-catalog default; 8-dimension scoring as a required product surface.

### Dwsy-agent / skills/improve-skill

`scripts/extract-session.js` for Claude / Pi / Codex. Generates a copy-paste prompt for a **fresh session** that then writes SKILL.md. Also has a create-new-skill branch.

**Adapt:** extract helper; Claude/Pi/Codex paths; fresh-session handoff.
**Reject:** create-new-skill; the generated prompt tells the next session to write the skill (our next session is qiaomu-meta, via our own handoff template).

### Consiliency-agent-harness / skills-src/codex/codex-skill-improvement-planner

Description: produces a plan for `codex-skill-editor` and **does not edit skills itself**. Recurring evidence gate (`--min-reflections` default 2). Separates actionable vs speculative vs contradictions.

Evidence source is skill reflection files, not raw JSONL.

**Adapt:** planner/editor split (matches Q1); min-evidence gate; contradictions stay unresolved in the report.
**Reject:** Codex-only reflection corpus as the only input.

### grandamenium-skill-optimizer

One Claude JSONL vs one SKILL.md. Five 1–10 scores. Writes `analysis.md` + `diff.patch` + `history.json`. Documents nested Claude JSONL (`message.content` tool_use).

**Adapt:** nested JSONL parse notes; per-run history file; five diagnostic questions (trigger, steps, refs, execution, output).
**Reject:** required numeric scores; writing `diff.patch` as a primary artifact.

## Partial overlap

| Clone | Job | Notes |
|---|---|---|
| `yctimlin-agent-usage-analyzer` | counts | Structured SKILL.md load only; coverage notes; no quality |
| `kl529-skill-usage-stats` / `cskwork-skill-usage-stats` | counts + delete | Claude `commandName`; cleanup is out of scope |
| `crystian-skills/.../skill-optimizer` | current conversation Kaizen | LESSONS.md Hits; Accept/Postpone/Reject; not historical multi-session |
| `chujianyun-skill-optimizer` | static review then plan | Confirm-before-edit; no transcript mining |
| `zhangchenchen-skills_optimizer` | current-thread governance | Explicitly: do not claim global usage without extra logs |
| `Joey-Ren-skill-optimizer` | static 7-dim + eval loop | Phase 0 report-only exists; full loop edits |
| `Undertone0809-skill-optimizer` | evidence ledger → patch + evals | Same layer as qiaomu-meta authoring |
| `tripleyak-SkillForge` | create/eval/doctor | `mine_skill_friction.py --consent` is opt-in transcript mining for **new** skill friction |
| `hqhq1025-skill-optimizer/skills/skill-miner` | mine **new** skills from sessions | Points personalizer for tuning existing skills |
| `alchaincyf-darwin-skill` | eval → edit → keep/revert | Replay, not organic history |
| `microsoft-SkillOpt` sparse skillopt-sleep | harvest → replay → stage | Runtime; adopt is separate |
| `anthropics-skills` sparse skill-creator | eval harness + grader | Controlled transcripts |
| `igniscloud-skill-optimizer` | weak-model traces | Primary evidence is execution trace, then maybe edit additional/`<model>.md` |
| `Evol-ai-SkillCompass` | ecosystem eval + usage inbox | Plugin runtime; eval-improve writes |
| `Yonkoo11-hermes-dojo` | Hermes session DB → patch overnight | Hermes-only |
| `trailofbits-skills` skill-improver | review-fix loop until clean | Static reviewer, not usage history |
| `petekp-claude-skills` claude-code-audit | workflow leverage, not named skill | |
| `florianbuetow-claude-code` retrospective plugin | new-skill opportunities | |
| `TerenceBristol-claude-improve` | `improve.md` command, last 5 sessions → CLAUDE.md/skills | |
| `mattpocock-skills` retro | environment retrospective | |
| `taxueseek-skill-optimizer` | grok/mimo skill **creators** | |
| `fastxyz-skill-optimizer` | benchmark across LLMs | |
| `mitsuhiko-agent-stuff` | no `improve-skill` in this checkout | Canonical extract skill is Dwsy |
| `Undertone0809-zee-skills` | `meta-skills/skill-creator` | Authoring, not retro |

## Codex invocation (from clone, not hypothesis)

`Sun-sunshine06-skill-optimizer/skills/skill-optimizer/SKILL.md` lines 72-78:

- Codex injects skills through context, not a `Skill` tool call.
- Presence in `base_instructions` is load, not use.
- Treat as invoked only if assistant output follows that skill's workflow markers.

This is missing evidence for Grok beyond `<skills_referenced>` (structured, already sampled). Codex remains a product decision (Q2).

## Synthesis after clones

No clone is a drop-in:

- Historical + named skill + dual verdict: x-skill-improve, then it edits.
- Historical + read-only report: Sun-sunshine06, then it scores a whole catalog and still does not emit a qiaomu-meta handoff.
- Planner/editor split: Consiliency, then evidence is reflections not JSONL.
- Multi-agent extract + handoff: Dwsy, then the handoff asks the next agent to write SKILL.md.

This repo's skill can combine: structured discovery (Claude `attributionSkill` / Skill tool / Grok `skills_referenced`) + x-skill dual verdict + Sun-sunshine read-only + Consiliency min-evidence + trellis-plan-review persist/handoff. Grok is original relative to these clones.
