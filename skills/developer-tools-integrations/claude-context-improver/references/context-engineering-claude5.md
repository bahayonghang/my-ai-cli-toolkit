# Context Engineering for Claude 5 Generation Models

Last verified: 2026-07-26 against <https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models>

## Why this file exists

Most `CLAUDE.md` files in the wild were written against models that needed guardrails. Anthropic removed **over 80% of Claude Code's system prompt** for Claude Opus 5 and Claude Fable 5 with no measurable loss on their coding evaluations. Guidance that compensated for a weaker model is now dead weight at best and an active conflict at worst.

The failure mode Anthropic observed in their own transcripts: a single request carrying contradictory instructions — "leave documentation as appropriate" from one layer, "DO NOT add comments" from another — because the system prompt, skills, and the user's request were each written in isolation. Claude can usually reach the right answer, but it must spend reasoning reconciling the layers first.

## The six shifts

### 1. Rules → judgement

**Then**: hard rules to prevent worst cases. Anthropic's old system prompt said "In code: default to writing no comments. Never write multi-paragraph docstrings or multi-line comment blocks — one short line max."

**Now**: "Write code that reads like the surrounding code: match its comment density, naming, and idiom."

**Audit check**: list every absolute (`NEVER`, `ALWAYS`, `MUST`, `DO NOT`) in the file. For each, ask whether the worst case it prevents is actually expensive. Keep absolutes for secrets, destructive operations, production deploys, PII, and money movement. Rewrite the rest as intent, or delete them when the model's default already matches.

**Why it matters**: a rule that is wrong for a subset of prompts (multi-line comment blocks _are_ right for genuinely complex code) forces Claude to either follow it into a bad outcome or spend reasoning deciding to break it.

### 2. Examples → interface design

**Then**: the number-one tool-usage rule was to give examples.

**Now**: examples constrain the exploration space. Design the tool, script, or file format so its parameters are self-describing — a `status` enum of `pending | in_progress | completed` tells Claude how to use it, and one line ("keep exactly one item in_progress") defines the behavior a wall of examples would have implied.

**Audit check**: flag long few-shot blocks in `CLAUDE.md`. Ask what interface change (better parameter names, an enum, a typed signature, a clearer script flag) would make the examples unnecessary. Keep examples only where the format is genuinely unguessable.

### 3. Everything upfront → progressive disclosure

**Then**: put every practice in `CLAUDE.md` because Claude would not find it otherwise.

**Now**: Claude Code is competent at loading the right context at the right time. Anthropic moved verification and code review out of the system prompt into separately-invoked skills, and made some tools deferred-loading so their definitions cost nothing until searched for.

**Audit check**: multi-step procedures inline in `CLAUDE.md` should become a skill the file points to. Path-specific guidance should become `.claude/rules/*.md` with a `paths:` glob. Navigation should be in `code_map.md`. What remains in `CLAUDE.md` is what every session needs.

**Applies to skills too**: a long `SKILL.md` should split into multiple files under `references/` rather than front-loading everything.

### 4. Repetition → say it once

**Then**: earlier models could need instructions repeated, or weighted the end of the context window over the start, so the same instruction appeared in both the system prompt and the tool description.

**Now**: put the instruction in the layer that owns it and delete the copies.

**Audit check**: the same instruction appearing in root `CLAUDE.md` and a nested file, or in both a rule and the root, is duplication — not reinforcement. Because Claude Code layers additively, both copies arrive. Pick the narrowest layer that always loads when the instruction is relevant.

### 5. Memory in `CLAUDE.md` → auto-memory

**Then**: users were encouraged to save facts into `CLAUDE.md` with the `#` hotkey.

**Now**: Claude saves memories relevant to the work and to the user automatically. `CLAUDE.md` is guidance, not a memory dump.

**Audit check**: flag past decisions, one-off debugging history, "we tried X and it failed", and session-specific facts. Durable project conventions stay; episodic memory goes.

### 6. Simple specs → rich references

**Then**: plans and specs as markdown files for Claude to refer back to.

**Now**: Claude handles richer references. A spec can be a detailed test suite, a function in another codebase to port, or an HTML artifact. Rubrics are references too — they let Claude verify taste in a domain (what good API design looks like) and can drive verifier sub-agents.

**Audit check**: when `CLAUDE.md` restates in prose what a test file, typed interface, or mockup already expresses precisely, replace the prose with a pointer. Prefer in-code references: an HTML mockup beats a description or a screenshot of a design.

## Assembling the layers

| Layer         | What belongs there                                                                                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| System prompt | Product context. Claude Code users never modify it; agent-harness builders should spend most of their effort here.                                                                                     |
| `CLAUDE.md`   | Brief statement of what the repo is for, then **gotchas** — the non-obvious things. Never what Claude can see by reading the file system.                                                              |
| Skills        | Lightweight guides encoding opinions, knowledge, and practices particular to you, your team, or your product. Avoid over-constraint except where mistakes are expensive. Split long ones across files. |
| References    | `@`-mentioned files: specs, mockups, test suites, whole codebases. Prefer artifacts in code — they are high-fidelity instructions in a language Claude already knows.                                  |

## Conciseness test

From the official Claude Code best practices: for each line, ask _"Would removing this cause Claude to make mistakes?"_ If not, cut it. A bloated `CLAUDE.md` causes Claude to ignore the instructions that matter. If Claude keeps doing something you have a rule against, the file is probably too long and the rule is getting lost.

## Relationship to `/doctor`

Anthropic shipped these practices as the bundled `/doctor` skill (`claude doctor`), which rightsizes skills and `CLAUDE.md` files automatically and estimates the context cost of the skill listing. Treat it as an assistant, not a court: review its deletions. This skill complements it with repo-grounded verification, `code_map.md` and `.claude/rules/` coverage, and a report-first diff.

## Migration pass order

When optimizing an existing context layer, run the passes in this order — the early ones delete work the later ones would otherwise have to evaluate:

1. **Conflict pass** — list every absolute rule across all layers; delete duplicates and contradictions.
2. **Obvious pass** — delete anything Claude learns from reading the file tree or a manifest.
3. **Skill extraction** — move multi-step procedures out into skills that the file points to.
4. **Example pass** — replace few-shot walls with clearer interfaces or contracts.
5. **Reference pass** — replace restated prose with pointers to code, tests, and rubrics.
6. **Measure** — re-run whatever evaluation you trust. Anthropic's "no measurable loss" claim is about _their_ evals on _their_ prompt; yours may differ.

## Sources

- The new rules of context engineering for Claude 5 generation models — <https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models> (2026-07-24); originally posted by Thariq (@trq212) at <https://x.com/trq212/status/2080710971228918066>
- Prompting Claude Fable 5 — <https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5> — "Skills developed for prior models are often too prescriptive for Claude Fable 5 and can degrade output quality." Also warns that instructions telling the model to reproduce its reasoning can trigger `reasoning_extraction` refusals.
- Best practices for Claude Code — <https://code.claude.com/docs/en/best-practices> — the conciseness test and the "occasional workflows belong in skills" boundary.
- Slash commands — <https://code.claude.com/docs/en/slash-commands> — `/doctor` as a bundled skill and skill-listing context budget.
