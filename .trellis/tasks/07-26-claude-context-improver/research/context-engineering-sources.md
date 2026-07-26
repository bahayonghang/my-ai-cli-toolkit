# Research: Claude 5 context-engineering sources (2026-07-26)

## Primary source (provided by user)

- **Tweet/article**: Thariq (@trq212), "The new rules of context engineering for Claude 5 models", 2026-07-24 — https://x.com/trq212/status/2080710971228918066
- **Official blog (same content, canonical)**: https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models (published 2026-07-24, same day as Opus 5 launch)

Key claims:

- Anthropic removed **over 80% of Claude Code's system prompt** for Opus 5 / Fable 5 with no measurable loss on coding evals.
- Best practices are encoded in **`claude doctor` / `/doctor`** — "rightsize your skills and CLAUDE.md files".
- Observed failure mode: conflicting messages within one request ("leave documentation as appropriate" vs "DO NOT add comments") as system prompt, skills, and user requests clash.

Six "then → now" myth shifts:

| Then                           | Now                                                                                                                                                |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Give Claude rules              | Let Claude use judgement (e.g. comment rule replaced by "match surrounding code's comment density, naming, idiom")                                 |
| Give Claude examples           | Design interfaces (expressive parameters hint usage; examples constrain exploration space)                                                         |
| Put it all upfront             | Progressive disclosure (skills loaded selectively; deferred-loading tools; "consider having a tree of files that can be loaded at the right time") |
| Repeat yourself                | Simple tool descriptions, say it once (in the tool description, not also in system prompt)                                                         |
| Memory in CLAUDE.md (# hotkey) | Auto-memory (Claude saves relevant memories automatically)                                                                                         |
| Simple specs (markdown plans)  | Rich references (HTML artifacts, specs-as-code, test suites, ported functions, rubrics + verifier agents)                                          |

Assembly guidance:

- **System prompt**: product context; users of Claude Code never modify it.
- **CLAUDE.md**: lightweight — what the repo is for + **gotchas**; avoid stating the obvious derivable from the file system; use progressive disclosure (e.g. verification skill referenced from CLAUDE.md).
- **Skills**: lightweight guides to find information; avoid over-constraining except in highly important areas; long skills → split into many files; best when encoding opinions/knowledge particular to you/team/product.
- **References**: @-mention files; prefer in-code references (HTML mockup beats description or screenshot; a spec may be a test suite or a function to port).

## Corroborating / related sources (web search 2026-07-26)

1. **Official platform docs — Prompting Claude Fable 5**: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5
   - "Refactor existing prompts and skills. Skills developed for prior models are often too prescriptive for Claude Fable 5 and can degrade output quality."
   - Don't instruct Claude to echo its reasoning (triggers `reasoning_extraction` refusals).
2. **Official Claude Code best practices**: https://code.claude.com/docs/en/best-practices.md
   - CLAUDE.md conciseness test: "Would removing this cause Claude to make mistakes?" If not, cut it. "Bloated CLAUDE.md files cause Claude to ignore your actual instructions."
   - Only include what applies broadly; occasional workflows → skills (loaded on demand).
3. **Slash-commands doc**: https://code.claude.com/docs/en/slash-commands.md — `/doctor` is a bundled skill (v2.1.205+); estimates skill-listing context cost.
4. **Related Thariq thread (2026-07-16)**: "Thin prompts, thick artifacts, thin skills" — ~82.4K views; ideal stack = thin prompt + thick artifacts/context + thin skills (analysis: https://explainx.ai/blog/thin-prompts-thick-artifacts-thin-skills-thariq-july-2026).
5. **Related Thariq essay (2026-07-04)**: "A Field Guide to Fable: Finding Your Unknowns" — map ≠ territory; audit skills after model upgrades, scaffolding for weaker models becomes dead weight (analysis: https://explainx.ai/blog/map-is-not-territory-fable-5-thariq-unknowns-2026).
6. **Third-party summaries**: explainx.ai (2026-07-25) https://explainx.ai/blog/claude-5-context-engineering-thariq-doctor-july-2026 — adds a practical 6-pass migration checklist (conflict pass → obvious pass → skill extraction → example pass → doctor pass → eval pass); Medium/CodeBun mirror (2026-07-25).

## Implications for the skill redesign

- The audit rubric must add: conflict detection across layers, absolute-rule (NEVER/ALWAYS) over-constraint detection, "obvious content" detection, memory-dump detection, example-heavy guidance detection.
- The update rules should recommend judgement-phrased guidance over hard rules, except where mistakes are expensive (secrets, deploys, destructive ops) — over-constraint stays legitimate there.
- The skill should mention `/doctor` as the official complementary tool and position itself as the repo-tailored, report-first alternative.
- Existing 200-line target and progressive-disclosure guidance in the skill already align; new content extends rather than replaces the loading-model semantics.
