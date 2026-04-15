# Darwin Optimization Report

Date: 2026-04-15  
Scope: `content/skills/research-learning-knowledge`

## What was completed

This Darwin pass completed four artifacts:

1. Rewrote or refined all 11 target `SKILL.md` files
2. Added `test-prompts.json` to each target skill directory
3. Added a machine-readable results log in `darwin-results.tsv`
4. Added a human-readable score summary in `darwin-scorecard.md`

## Evaluation method

This run used `dry_run` evaluation rather than sub-agent A/B testing.

That means each skill was judged by:

- frontmatter completeness
- workflow clarity and sequencing
- boundary and fallback coverage
- instruction specificity
- resource/reference correctness
- a simulated walkthrough of 2-3 representative prompts

No score in this report should be read as a benchmark against live output
quality under real interactive execution. It is a structured proxy score.

## Key improvements by cluster

### 1. Portability and environment safety

Largest gains came from removing host-specific assumptions:

- `deep-research-pro` no longer depends on fixed local search scripts or home-directory conventions
- `knowledge-absorber` no longer treats reference prompts as higher-priority runtime law
- `paper2code` no longer silently assumes dependency installation is acceptable

### 2. Explicit routing and stopping conditions

Several skills already had strong content quality, but were missing operational
clarity:

- `paper-workbench` now has sharper mode routing and clearer defaulting
- `memory-system` now distinguishes search/add/index/status/cleanup more explicitly
- `word-flow` now makes dependency failure and partial completion honest

### 3. Honesty and graceful degradation

The most important Darwin-style change was not stylistic polish. It was forcing
the skills to say what they can and cannot guarantee:

- `rank` can now conclude `秩：未定` without sounding like failure
- `word` now locks onto a primary sense instead of flattening all meanings
- `roundtable` now rejects weakly grounded participant choices more clearly

## Per-skill notes

### deep-research-pro

- Before: looked powerful but was tightly coupled to a specific personal setup
- After: now reads like a transferable research workflow with clear sourcing rules
- Remaining risk: still depends on the runtime having web access and decent search tooling

### knowledge-absorber

- Before: high ambition, but too entangled with a specific reference prompt and host model
- After: now clearly separates ingestion, analysis lens, mode choice, and persistence
- Remaining risk: `references/system_prompt.md` still contains legacy host-specific ideas

### learn

- Before: strong concept engine, but underspecified when input is a material rather than a concept
- After: now handles concept extraction and no-save behavior more explicitly
- Remaining risk: still relies on the operator to choose the right concept when source material is very dense

### memory-system

- Before: script routing was good, human-facing contract was weak
- After: now explains what to tell the user after each operation
- Remaining risk: actual retrieval quality still depends on the script and embeddings, not just the skill text

### paper-workbench

- Before: conceptually strong, but some routing was implicit
- After: clearer defaults, better 2-paper fallback, cleaner profile-light handling
- Remaining risk: complexity remains high because the skill spans many artifact types

### paper2code

- Before: strong pipeline idea, weak dependency and failure honesty
- After: explicit dependency gate, stop conditions, and failure-stage reporting
- Remaining risk: real output quality still depends heavily on pipeline docs and source paper quality

### plain

- Before: very stylistically mature, but operational edges were implicit
- After: now better at handling multi-input scope and optional file persistence
- Remaining risk: style-heavy skills can still drift if the operator over-indexes on voice over accuracy

### rank

- Before: philosophically sharp, but not explicit enough about when not to conclude
- After: applicability and honesty are clearer
- Remaining risk: “representative phenomenon list” quality still dominates output quality

### roundtable

- Before: already strong, but soft on participant admissibility and one-shot mode
- After: more robust on realism and bounded discussion shape
- Remaining risk: quality still depends on the model actually knowing the chosen figures well

### word

- Before: strong structure, slightly underspecified on polysemy and example quality
- After: better sense locking and better example expectations
- Remaining risk: uncertain IPA or etymology cases still require honesty in execution

### word-flow

- Before: clear high-level idea, weak operational failure model
- After: now behaves like a true workflow skill with dependency awareness
- Remaining risk: still depends on external `card` skill availability

## Remaining repo-level risks

1. This pass did not rewrite supporting `references/` content except where the
   main `SKILL.md` needed explicit guardrails.
2. This pass did not add automated test runners for the new `test-prompts.json`
   files.
3. This pass did not run true with-skill vs baseline sub-agent comparisons.

## Recommended next pass

If you want to continue Darwin-style optimization, the next highest-leverage
work is:

1. Add a small evaluator script that reads `test-prompts.json`
2. Run paired live evaluations for `deep-research-pro`, `knowledge-absorber`, and `paper2code`
3. Normalize legacy reference assets under `knowledge-absorber`
