---
name: implementation-notes
description: Use when implementing a multi-step spec, PRD, design doc, GitHub issue, or approved plan where decisions, deviations, and tradeoffs accumulate during coding. Maintain a live implementation-notes.md alongside the work capturing design decisions (choices made where the spec was ambiguous), intentional deviations from the spec, alternatives considered and rejection criteria, and open questions for human review. Use proactively the moment implementation of a written spec begins, before the first edit. Triggers include 实施记录, 实现笔记, 决策日志, 边写边记, 按这个 spec 实现, 按这个计划做, implementation log, decision log, spec divergence, implement this plan. Do NOT use for single-file fixes, pure investigation, one-off scripts, work without a written spec to deviate from, or simple tasks where one commit captures the reasoning.
category: development-workflows
tags:
  - implementation
  - decision-log
  - spec
  - documentation
  - review
version: 0.1.0
---

# implementation-notes

Maintain a live `implementation-notes.md` while implementing a written spec, so that design decisions, intentional deviations, alternatives considered, and open questions stay visible during review instead of being reverse-engineered from the diff.

## Core principle

A spec is never complete. As you implement, you will make choices the spec did not name. The diff records *what* you did. Commit messages record *what changed*. Neither captures *why this option over the alternative*, *which spec line you knowingly departed from*, or *which question you still need a human to answer*. This file does.

The goal is not to write more documentation. It is to give yourself a legitimate place to record the judgment calls you would otherwise either bury silently in code or interrupt the user to ask about.

## When to start

Start before the first edit, when **all** of the following are true:

- A written spec exists — PRD, design doc, GitHub issue, approved plan, or a multi-paragraph prompt.
- Implementation will span multiple files or multiple commits.
- The spec contains at least one ambiguity, gap, or area where a reasonable implementer would face a choice.

If no written spec exists yet, stop and invoke `writing-plans` first. This skill does not replace planning; it captures what happens after planning meets reality.

## When to skip

Do not start this file for:

- Single-line or single-file fixes where the change is self-explanatory.
- Pure investigation, debugging, or reading code.
- One-off scripts, throwaway experiments, or work no one will review later.
- Specs under ~50 lines where the implementation produces a single commit. Put the reasoning in the commit body instead.

If you start the file and realize the work is too small, delete it. An empty notes file is worse than no file.

## File location

Default location: `implementation-notes.md` at the root of the spec. If the spec lives inside the repo and the root is reserved for other use, place it at `.notes/<spec-slug>.md`.

If the spec is in a PR, the notes file ships with the change in the same PR.

## The four sections

Every entry under each section must answer something the diff cannot. Each entry is one to three sentences. Link to file paths, line ranges, or commit SHAs where useful.

### Decisions

Choices made where the spec was ambiguous or silent. Record the choice point and why this option was picked over a named alternative.

- Good: "Used a single SQLite file for the cache instead of one file per project. Reason: simpler GC and we never need cross-project queries. See `cache/store.py:42`."
- Bad: "Added caching to the API." (This belongs in the commit message; the diff already shows it.)

### Deviations

Places where the implementation intentionally departs from the spec. Quote the spec line, then state the change and the reason.

- Good: "Spec §3.2 says `retries: 5`. Implemented with `retries: 3` because the upstream rate-limits at 4 req/s and 5 retries blows the budget. See `client.py:88`."
- Bad: "Changed retry count." (Does not name the spec line or the reason.)

### Tradeoffs

Alternatives considered and rejected. Include the rejection criterion so a reviewer does not waste cycles re-evaluating the same option.

- Good: "Considered Redis for the queue. Rejected because it adds a deployment dependency the user explicitly wanted to avoid (`spec.md:14`). In-process queue is sufficient at current scale (<1k req/min)."
- Bad: "Picked option A." (No alternatives, no criterion.)

### Open questions

Items that need a human to answer before merge. Phrase each so a reviewer can answer yes/no or pick one from a short list.

- Good: "Should expired sessions be deleted or marked? Currently marked. If deleted, the audit table loses history. **Pick: delete / keep marked / keep marked + separate archive.**"
- Bad: "Need to figure out session expiry." (Not actionable; reviewer cannot resolve.)

## Writing rules

- Write the entry at the moment the decision is made, before or immediately after the edit that embodies it. End-of-session backfill is forbidden because reconstruction inflates confidence and loses alternatives.
- Each entry is one to three sentences. If you need more, the decision probably contains two decisions — split it.
- Reference paths, line numbers, and commit SHAs; do not paste full diffs.
- Do not timestamp individual entries. A session-boundary heading like `## 2026-05-20 session 2` is the only timestamp needed.
- If you must backfill an entry you forgot to write, tag it `[reconstructed]` and treat the reasoning as low-confidence.

## Anti-patterns

| Anti-pattern | Counter-rule |
|---|---|
| Chronological log — "added function X, then function Y, then ran tests" | If an entry could be reconstructed from `git log --stat`, delete it. Only write what the diff alone cannot explain. |
| End-of-session backfill — writing the whole file at the end | Append at the moment of the decision. A note written hours later is fiction dressed as fact. |
| Over-triggering — maintaining notes for a one-commit fix | Gate at the start of work. If the spec is under ~50 lines or the work fits in one commit, skip this skill and put the reasoning in the commit body. |

## Cadence

Append entries as decisions land. Do not batch. Do not "clean up later." The file is meant to be a low-friction scratchpad that produces a high-signal artifact precisely because it is written in-flight.

A session that adds zero entries is fine if no real decisions were made. Padding the file is worse than leaving it empty.

## Integration with other skills

- **`writing-plans`**: This skill activates *after* a plan exists. If no plan, run `writing-plans` first.
- **`subagent-driven-development`**: When subagents implement tasks, the **parent maintains this file**. Subagents report their decisions back; the parent appends. Never let multiple subagents write to this file concurrently — entries will conflict and reasoning will get lost.
- **`git-commit`**: When a notes entry maps one-to-one to a commit, the commit body should link to the entry (e.g., `See implementation-notes.md "Retry count deviation"`). Do not duplicate the reasoning in both places.
- **`handoff`**: When producing a handoff doc, pull the "Key decisions" / "Why this over that" content from this file rather than reconstructing from memory. The notes file is the durable record; the handoff is the short pointer that says "this matters next session."
- **`code-auditor` / PR review**: Reviewers should read this file before reading the diff. It frames what the diff is trying to do.

## Minimal template

```markdown
# Implementation notes — <spec name>

Spec: <link or path>
Started: <YYYY-MM-DD>

## Decisions

- (none yet)

## Deviations

- (none yet)

## Tradeoffs

- (none yet)

## Open questions

- (none yet)
```

Keep the four headings even when empty. The empty heading is a question to yourself at the next decision point.

## Quality checklist

Before requesting review:

- [ ] Every entry answers something the diff cannot.
- [ ] No entry could be reconstructed from `git log --stat` alone.
- [ ] Every `Deviations` entry quotes the spec line it departs from.
- [ ] Every `Open questions` entry is phrased so a reviewer can answer yes/no or pick one.
- [ ] The PR description links to this file.
