# Optimize unknowns-first skill

## Goal

Fix the issues found by the 2026-07-08 deep audit of
`skills/development-workflows/unknowns-first/`: the skill is entirely untracked in git,
violates several house rules in `skills/development-workflows/AGENTS.md` (platform-named
interface file, missing frontmatter keys, nonstandard prose test cases instead of
`evals/evals.json`), has an over-broad routing description with no non-triggers, and
leaves its central "task level" concept undefined. The skill's core method (four
unknowns, 10-step opening diagnosis with a hard confirmation stop, full/lite mode
selection, expert-standards-as-hypotheses) is sound and must be preserved — this task is
compliance, routing-surface hardening, and concept sharpening, not a rewrite.

Audit evidence with file/line pointers lives in `notes.md` in this task directory.

## Requirements

### R1 — Complete frontmatter (P1)

`SKILL.md` frontmatter has only `name` + `description`. `scripts/check.py` warns
"Top-level category is missing"; the house standard requires `name`, `description`,
`category`, `tags`, `version`. Add:

- `category: development-workflows` (must match directory; enforced by check.py)
- `tags`: 4-6 relevant tags (e.g. task-clarification, requirements, unknowns, diagnosis,
  planning)
- `version: 0.1.0` (first tracked release; unquoted, per house rule)

Advisory skill: keep omitting `allowed-tools` (house rule permits this for chat-output
skills; do not add file-writing tools).

### R2 — Rename `agents/openai.yaml` to `agents/interface.yaml` (P1)

Direct violation of the house rule: "ship one neutral `agents/interface.yaml` — never a
platform-named `openai.yaml`". The file content (display_name / short_description /
default_prompt) already matches the geju/git-commit exemplar structure — rename the file,
keep the content.

### R3 — Rewrite `description` as a bounded routing contract (P1)

Current description is trigger-only with an over-broad list: "strategic, creative,
learning, research, product, planning, or execution tasks" plus "start complex work"
matches nearly every request; "improve a prompt" mis-routes generic prompt-editing asks.
House rule: description is the always-loaded routing contract, written as "use when the
user …" triggers **with explicit non-triggers**, ≤1024 chars, no angle brackets.

Required outcome:

- Drop or narrow the catch-all triggers (`execution` tasks, `start complex work`); drop
  or reword `improve a prompt` (the prompt template is for invoking this workflow
  manually, not a prompt-improvement feature).
- Add explicit non-triggers, promoted from the SKILL.md body: direct editing,
  translation, formatting, summarization, trivial or fully-constrained requests.
- Add near-neighbor boundaries: brainstorming a feature into an implementation plan →
  `spark`; adversarial challenge of an existing plan/idea → `cold-shower`; decision log
  during implementation of a written spec → `implementation-notes`.
- Add Chinese trigger phrases (sibling precedent: cold-shower, implementation-notes),
  e.g. 澄清任务 / 先诊断再做 / 理清需求 / 帮我定义成功标准.
- Keep the four-unknowns vocabulary in the description (it is the skill's distinctive
  routing signal).

A draft target is in `notes.md`; final wording is the implementer's choice within these
constraints.

### R4 — Replace prose test cases with `evals/evals.json` (P1)

The skill ships `references/test-cases.md` (5 prose cases). House standard: one format
and location, `evals/evals.json`, git-commit schema
(`{ skill_name, evals: [ { id, prompt, expected_output, files, assertions[] } ] }`),
key `assertions` (not `expectations`); cold-shower is the in-suite exemplar.

Required outcome:

- Convert the 5 prose cases into `evals/evals.json` entries (prompts may stay in their
  natural language; `expected_output` and `assertions` in English).
- Add at least 2 near-neighbor routing-negative cases, e.g. "brainstorm and write an
  implementation plan for feature X" asserts routing to `spark` (not a full unknowns
  diagnosis), and "帮我挑刺/泼冷水 this existing plan" asserts routing to `cold-shower`.
- Fix the mode inconsistency during conversion: test case 1 says "full or medium
  diagnosis" but SKILL.md defines only full/lite modes — no "medium" may survive.
- Delete `references/test-cases.md` after conversion (no dual sources of truth).

### R5 — Define "task level" operationally in SKILL.md (P2)

Step 4 of the core contract ("Judge the task level") and the entire Expert Selection
section depend on "task level", but the term is never defined — no scale, no examples,
no judging questions. Each run currently invents its own taxonomy.

Add a compact definition (roughly 5-8 lines): a small working scale of 3-4 example
levels (e.g. routine execution / project- or deliverable-shaping / domain- or
strategy-level) with one judging question per level, presented as a working scale rather
than a rigid taxonomy. Keep the existing "choose the expert by the task level and the
decision the output must support" guidance intact.

### R6 — Route "During Execution" to the in-repo implementation-notes skill (P2)

`references/implementation-notes-template.md` duplicates the dedicated
`implementation-notes` sibling skill's capability. Per the self-containment house rule,
routing to in-repo skills by name is fine, but hard dependencies on possibly-uninstalled
skills are not (skills install individually).

Required outcome: the "During Execution" section prefers the `implementation-notes`
skill with "if available" phrasing, and keeps
`references/implementation-notes-template.md` as the explicit standalone fallback.
Both paths stay valid; no hard dependency.

### R7 — Point the HTML section at html-artifact (P3)

"References, Prototypes, And HTML" recommends "HTML interaction" without saying how.
Mention the in-repo `html-artifact` skill with the same "if available" phrasing, keeping
the existing generic guidance as fallback. No semantic change to when HTML is warranted
("do not use HTML by default" stays).

### R8 — Give lite mode an output skeleton (P3)

Full mode has a 10-section output template; lite mode has only step prose. Add a minimal
lite skeleton (3-5 lines: restated task, likely success standard, key unknowns,
questions) or an explicit sentence that lite mode is plain prose with no template.

### R9 — Suite integration (P3)

- Add `unknowns-first` to the suite member list at the top of
  `skills/development-workflows/AGENTS.md` (it is currently not listed).
- After structural changes (new `evals/`, renamed interface file), run `just docs-sync`
  so the docs catalog picks the skill up (currently absent from `docs/`), then `just ci`.

### R10 — Bring the skill under version control (P1)

All 5 skill files are untracked (invisible to `git status` due to
`status.showUntrackedFiles=no`; confirmed via `git ls-files --others`). The final commit
of this task must add the whole skill directory, using Conventional Commits
(`feat(skills): …` for the skill itself; docs-sync output per repo convention).

## Constraints

- Preserve the skill's method semantics: four-unknowns definitions, the 10-step core
  contract, the step-10 hard stop ("thinking order, not conversation-turn order"
  clarification included), full/lite/skip mode selection rules, expert-as-hypothesis
  stance, and the bilingual prompt template in `references/prompt-template.md`.
- Surgical edits only; do not rewrite sections not implicated by a requirement.
- Frontmatter must pass `scripts/check.py` with zero errors and zero warnings;
  description ≤1024 chars, no angle brackets.
- Host-neutral wording throughout (no hardcoded runner names).
- No fabricated evidence in evals; assertions must be checkable from the response text.

## Acceptance Criteria

- [x] `PYTHONUTF8=1 python scripts/check.py skills/development-workflows/unknowns-first`
      reports OK with no warnings.
- [x] `agents/interface.yaml` exists with the exemplar structure; `agents/openai.yaml`
      is gone.
- [x] New description contains explicit non-triggers, the spark / cold-shower /
      implementation-notes boundaries, Chinese trigger phrases, and no catch-all
      "execution / start complex work / improve a prompt" triggers; length ≤1024, no
      angle brackets.
- [x] `evals/evals.json` parses, matches the cold-shower schema (`assertions` key, no
      stray per-item keys), contains ≥7 cases including ≥2 routing negatives;
      `references/test-cases.md` is deleted; no "medium" mode reference remains
      anywhere in the skill.
- [x] SKILL.md defines the task-level scale with judging questions; lite mode has an
      output skeleton or an explicit no-template sentence.
- [x] "During Execution" prefers the implementation-notes skill with the template as
      fallback; HTML section mentions html-artifact with fallback phrasing.
- [x] `skills/development-workflows/AGENTS.md` suite list includes `unknowns-first`.
- [x] `just docs-sync` run on a clean tree; docs catalog includes unknowns-first;
      `just ci` passes; after commit, `git ls-files skills/development-workflows/unknowns-first`
      lists all skill files.

## Notes

- Audit evidence and the draft description live in `notes.md` in this task directory.
- What is already good and must not regress: four-unknowns definitions, the hard
  confirmation stop, body-level anti-over-triggering rules (lite/skip for simple tasks),
  Expert Selection's hypothesis stance and expert-perspective questions, bilingual
  prompt template, host-neutral text, correctly omitted `allowed-tools`, and the absence
  of scripts (legitimate for advisory skills per the house standard).
