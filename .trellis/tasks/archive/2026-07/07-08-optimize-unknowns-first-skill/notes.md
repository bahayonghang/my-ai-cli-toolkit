# Audit Evidence — unknowns-first (2026-07-08)

Deep audit performed via /yao-meta. Baseline: SKILL.md 159 lines, 3 references, 1 agents
file, no evals, no scripts. `just skills-check` passes with 1 warning. All findings below
were verified against the working tree at commit 84ea972 (files themselves untracked).

## Compliance findings (house standard: skills/development-workflows/AGENTS.md)

| #   | Finding                                                         | Evidence                                                                                                                                                                                |
| --- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | All 5 skill files untracked in git                              | `git ls-files` empty for the dir; `git ls-files --others --exclude-standard` lists all 5; repo `status.showUntrackedFiles=no` hides them from plain `git status`                        |
| A2  | Frontmatter missing `category`, `tags`, `version`               | SKILL.md:1-4 has only name+description; `scripts/check.py --json` warns "Top-level category is missing"; AGENTS.md:96-98 requires all five keys                                         |
| A3  | Platform-named `agents/openai.yaml`                             | AGENTS.md:72-74: "never a platform-named `openai.yaml`"; all 18 other agents files in the repo are `interface.yaml` (glob evidence); content structure itself matches the geju exemplar |
| A4  | No `evals/evals.json`; prose `references/test-cases.md` instead | AGENTS.md:55-68 mandates one format/location with `assertions` key + ≥2 routing negatives; cold-shower is the exemplar                                                                  |
| A5  | Description has no non-triggers; over-broad triggers            | SKILL.md:3 — "…planning, or execution tasks", "start complex work" match nearly everything; "improve a prompt" mis-routes; AGENTS.md:99-100 requires explicit non-triggers              |
| A6  | Not listed in the suite member list                             | AGENTS.md:3-5 enumerates 11 skills; unknowns-first absent                                                                                                                               |
| A7  | Absent from docs catalog                                        | `grep -ri unknowns-first docs/` → no match; docs-sync never run for it                                                                                                                  |

## Content findings

| #   | Finding                                                        | Evidence                                                                                                                                                                          |
| --- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | "task level" never defined                                     | SKILL.md:23 (step 4), SKILL.md:62-79 (Expert Selection) depend on it; no scale, examples of levels, or judging questions anywhere                                                 |
| B2  | Duplicates implementation-notes sibling skill                  | references/implementation-notes-template.md vs `skills/development-workflows/implementation-notes/` (dedicated skill, same capability); house rule allows in-repo routing by name |
| B3  | Lite mode has no output shape                                  | SKILL.md:46-52 gives steps only; full mode gets the 10-section template at SKILL.md:137-157                                                                                       |
| B4  | test-cases.md references a nonexistent "medium" mode           | test-cases.md:14 "Use full or medium diagnosis"; SKILL.md defines only full/lite                                                                                                  |
| B5  | "HTML interaction" vague; html-artifact sibling not referenced | SKILL.md:96-104; suite has `html-artifact` skill                                                                                                                                  |

## Near-neighbor boundary map

- `spark` — plan-first brainstorming → converges to an approved implementation plan.
  unknowns-first stops at a confirmed diagnosis, produces no plan artifact.
- `cold-shower` — adversarial challenge of an idea/plan the user already has.
  unknowns-first clarifies a task the user cannot yet define.
- `implementation-notes` — decision log while implementing a written spec.
  unknowns-first's During Execution section overlaps; route there, keep local template
  as standalone fallback.
- `geju` / `goudi` — strategic thinking family, no direct trigger collision observed.

## What is good (do not regress)

- Four-unknowns definitions (SKILL.md:33-40) are crisp and operational.
- Step-10 hard stop plus "thinking order, not conversation-turn order" (SKILL.md:29-31).
- Body-level anti-over-triggering: lite/skip rules for editing, translation, formatting,
  summarization (SKILL.md:54-56) — these just need to be surfaced into the description.
- Expert-standards-as-hypotheses stance and expert-perspective questions (SKILL.md:72-79).
- Bilingual prompt template; host-neutral text; `allowed-tools` correctly omitted for an
  advisory skill; no scripts (legitimate per AGENTS.md:37-39).

## Draft target description (R3; implementer may refine within PRD constraints)

> Diagnose a task before execution when the user may not yet know how to define success.
> Use when the user asks to clarify an ambiguous or unfamiliar task, define what good
> means, avoid rework on high-stakes, strategic, creative, learning, research, or product
> work, turn vague intent into an actionable brief, or says 澄清任务, 先诊断再做, 理清需求,
> 帮我定义成功标准. Surfaces task level, true expert, success standards, and the four
> unknowns (known knowns, known unknowns, unknown knowns, unknown unknowns), then stops
> for confirmation before execution. Do NOT use for direct editing, translation,
> formatting, summarization, or fully-specified small tasks — execute those directly. Do
> NOT use when the user wants a feature brainstormed into an implementation plan (use
> spark), an adversarial challenge of an existing plan (use cold-shower), or a decision
> log during implementation (use implementation-notes).

(~1010 chars — verify ≤1024 after any edit; no angle brackets.)
