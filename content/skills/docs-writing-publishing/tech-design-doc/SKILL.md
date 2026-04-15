---
name: tech-design-doc
description: Generate technical design documents with proper structure, diagrams, and implementation details. Use when designing a new feature, documenting architecture decisions, or planning refactoring work. Default language is English.
category: docs-writing-publishing
tags: [design-doc, architecture, adr, rfc, technical-spec]
argument-hint: [feature-name or design-task description]
version: 1.2.0
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Technical Design Document Skill

## Preconditions

1. If the request does not clearly identify the system, feature, or refactor scope, infer the narrowest safe scope from context and state the assumption in the document.
2. Read `$SKILL_DIR/references/TEMPLATE.md` before drafting.
3. If updating an existing design doc, read it first and preserve its terminology, decision history, and open questions.
4. If the request is only to revise one section, keep the rest of the document stable and avoid rewriting unaffected sections.

## Execution Flow

### 1. Assess Complexity

| Level | Scope | Sections Required |
|-------|-------|-------------------|
| Small | Single component, <100 LOC | TL;DR, Design, Implementation |
| Medium | Cross-component, API changes | + Background, Solution Analysis |
| Large | System-level, new service | Full template |

### 2. Gather Context

Explore the codebase before writing:
1. Identify affected components using `Glob` and `Grep` for related code.
2. Read existing implementations and patterns.
3. Note dependencies and potential side effects.
4. Check for similar solutions already in the codebase.
5. Capture assumptions or unresolved unknowns explicitly instead of silently inventing details.

### 3. Write Document

1. Choose the closest design-doc shape:
   - ADR / decision record
   - feature RFC / implementation plan
   - refactor or migration design
2. Write the design document following the template structure, scaled to the assessed complexity level.
3. For medium and large docs, compare at least two plausible options unless the user explicitly asks for a single approved design to be documented.
4. Use Mermaid diagrams only when they materially clarify multi-component flow, data flow, or state transitions.
5. Extend the base template only when the problem actually needs it:
   - rollout / backout plan for risky launches
   - observability / success metrics for behavior changes
   - migration notes for schema, API, or data moves
6. For medium and large docs, identify the direct owner of the design decision when the project context makes that meaningful.

### 4. Verify Before Handoff

Verify the following criteria:
- Define the problem clearly (what breaks if we do nothing?).
- Compare options with trade-offs (do not present just one solution).
- Document the decision rationale.
- Add diagrams to illustrate key flows.
- Make implementation steps concrete and actionable.
- Identify risks and provide mitigations.
- Call out assumptions, open questions, and deferred work instead of burying them.

### 5. Handle Feedback

Process user change requests:
1. Identify which section needs revision.
2. Update only affected sections.
3. Ensure changes don't contradict other sections.
4. Re-verify the checklist items related to changes.

### 6. Output Location

1. Look for a `docs/`, `ai_docs/`, or `design/` directory in the project.
2. If multiple locations exist, prefer the one already used for similar design artifacts.
3. Ask the user only if the location is still materially ambiguous.
4. Save with a descriptive filename such as `design-[feature-name].md`.

## Output contract

The delivered document should make it easy for another engineer to answer:

- what problem is being solved,
- why this option was chosen,
- what will change,
- how it will be implemented and verified,
- what the main risks, assumptions, and follow-ups are.

## Rules

- Do not present guesses as settled architecture facts.
- Do not skip trade-offs, risks, or non-goals just to make the design look cleaner.
- Keep implementation steps actionable enough that another engineer could execute them without reverse-engineering the intent.
- Prefer subtraction over ceremonial sections: if a section adds no decision value for a small design, omit it.
