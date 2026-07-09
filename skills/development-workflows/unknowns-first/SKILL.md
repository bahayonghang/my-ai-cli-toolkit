---
name: unknowns-first
description: Diagnose a task before execution when the user may not yet know how to define success. Use to clarify an ambiguous or unfamiliar task, define what good means, turn vague intent into an actionable brief, or when the user says 澄清任务, 先诊断再做, 理清需求, 帮我定义成功标准. Do NOT use for fully-specified small tasks (execute directly), feature-to-plan brainstorming (spark), or challenging an existing plan (cold-shower).
category: development-workflows
tags: [task-clarification, requirements, unknowns, diagnosis, planning]
version: 0.1.0
---

# Unknowns First

Use this skill to diagnose a task before doing it. The goal is to find the unknowns that could change the task direction, quality bar, deliverable, or execution path.

Do not execute the user's substantive task during the opening diagnosis unless the user explicitly asks to skip diagnosis.

Routing: for brainstorming a feature into an implementation plan use spark; for adversarially challenging an existing plan use cold-shower; for a decision log during implementation use implementation-notes.

## Core Contract

Before execution, produce an opening diagnosis:

1. Restate your understanding of the task.
2. Judge the user's starting point.
3. Identify four kinds of unknowns:
   - known knowns
   - known unknowns
   - unknown knowns
   - unknown unknowns
4. Judge the task level.
5. Identify the true expert for that level.
6. Establish current success standards.
7. Decide whether references, prototypes, examples, or HTML interaction are needed.
8. Identify only the key unknowns.
9. Ask focused clarification questions.
10. Stop and wait for user confirmation.

The numbered list is a thinking order, not necessarily a conversation-turn order. A first response may cover steps 1-9 together, but step 10 must remain a real stop.

## Four Unknowns

Use these meanings:

- Known knowns: facts, goals, constraints, and standards the user has already made explicit.
- Known unknowns: gaps the user already knows need clarification.
- Unknown knowns: tacit judgment, taste, context, examples, or standards the user can recognize but has not verbalized yet.
- Unknown unknowns: domain risks, expert failure modes, missing concepts, hidden dependencies, or success criteria the user may not know to ask about.

## Mode Selection

Use full mode when the task is ambiguous, unfamiliar, high-stakes, cross-functional, strategic, creative, learning-oriented, or likely to create rework.

Use lite mode when the task is simple but underspecified:

1. Restate the task.
2. Name the likely success standard.
3. Surface the key unknowns.
4. Ask 1-3 questions.
5. Stop for confirmation.

Skip diagnosis only when the user explicitly asks for immediate execution, the request is trivial, or the answer is already fully constrained.

For direct editing, translation, formatting, summarization, or small one-shot requests, do not run the full diagnosis. Execute directly when the audience, tone, source material, and output shape are already clear. Ask at most 1-2 questions only when those constraints are missing.

## Length Control

Keep the opening diagnosis compact. Prefer 3-5 focused clarification questions. If more questions exist, group them as later follow-ups instead of blocking the first confirmation checkpoint.

## Task Levels

Judge the task level to choose the right expert and success bar. Treat this as a working scale, not a rigid taxonomy, and re-judge when new facts change the stakes.

- Routine execution: a bounded task with a known-good shape. Ask: could a competent practitioner finish this without redefining the goal?
- Project- or deliverable-shaping: the output commits scope, time, or a concrete artifact. Ask: would a wrong frame here cause visible rework?
- Domain- or strategy-level: the decision sets direction or crosses functions. Ask: does getting this wrong cost more than the work itself?

## Expert Selection

Do not choose the expert by keyword alone. Choose the expert by the task level and the decision the output must support.

For example:

- A logistics platform task may need an operations/productization expert, not only a software architect.
- A learning task may need a self-learning coach, not only a subject-matter expert.
- A boss-facing memo may need an executive decision advisor, not only a writer.

Treat expert standards as high-quality hypotheses, not final truth. Revise them when real constraints, implementation findings, or user judgment contradict them.

When judging unknown unknowns, ask from the expert perspective:

- What would an expert check before starting?
- What usually causes this kind of task to fail?
- What would look finished but still be wrong?
- What evidence would prove the result is good enough?

## Key Unknowns

Do not ask every possible question. Focus only on unknowns that could change:

- task level
- true expert
- success standard
- deliverable shape
- execution path
- required reference material
- rework risk
- user's ability to judge the result

When the user has implicit standards that are hard to verbalize, use examples, options, prototypes, or comparisons to surface them.

## References, Prototypes, And HTML

Recommend reference material when the task depends on external facts, source documents, domain standards, prior decisions, or exact user context.

Recommend prototypes or multiple options when the user may recognize quality by seeing alternatives before they can describe it.

Recommend HTML interaction when visual comparison, structured choices, complex implementation notes, or post-task explanation/testing would make the unknowns easier to inspect. Use the `html-artifact` skill if available to produce it; otherwise hand-write the HTML.

Do not use HTML by default. Use it when it materially improves judgment.

## During Execution

For complex tasks, maintain implementation notes. Capture:

- original assumption
- new fact discovered
- affected success standard
- decision made
- reason for deviation
- open question
- final standard revision

Use the `implementation-notes` skill if available; otherwise use `references/implementation-notes-template.md`. Reach for it when the task is long, risky, or likely to drift.

If a new fact changes the task level, true expert, success standard, or deliverable shape, stop and ask for confirmation before continuing.

## After Execution

For learning, product, strategy, or complex execution tasks, offer a post-task explanation and self-test:

- Explain what was done and why.
- State which unknowns were resolved.
- State which success standards were revised.
- Ask test questions that verify whether the user can judge or reproduce the result.

## Output Shape

Use the user's language. Keep the diagnosis concise enough to be useful.

Full mode uses these sections:

```markdown
## My Understanding

## Your Starting Point

## Four Unknowns

## Task Level

## True Expert

## Success Standards

## Needed References / Prototypes / HTML

## Key Unknowns

## Clarifying Questions

## Confirmation Checkpoint
```

Lite mode has no template. Write plain prose covering the restated task, the likely success standard, the key unknowns, and 1-3 questions, then stop for confirmation.

For a copyable prompt, read `references/prompt-template.md`.
