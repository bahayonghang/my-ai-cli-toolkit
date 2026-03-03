---
name: tech-design-doc
description: Generate technical design documents with proper structure, diagrams, and implementation details. Use when designing a new feature, documenting architecture decisions, or planning refactoring work. Default language is English.
metadata:
  category: documentation
  tags: [design-doc, architecture, adr, rfc, technical-spec]
argument-hint: [feature-name]
allowed-tools: Read, Write, Glob, Grep
---

# Technical Design Document Skill

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

### 3. Write Document

1. Read the document template from `$SKILL_DIR/references/TEMPLATE.md`.
2. Write the design document following the template structure, scaled to the assessed complexity level.

### 4. Verify Before Handoff

Verify the following criteria:
- Define the problem clearly (what breaks if we do nothing?).
- Compare options with trade-offs (do not present just one solution).
- Document the decision rationale.
- Add diagrams to illustrate key flows.
- Make implementation steps concrete and actionable.
- Identify risks and provide mitigations.

### 5. Handle Feedback

Process user change requests:
1. Identify which section needs revision.
2. Update only affected sections.
3. Ensure changes don't contradict other sections.
4. Re-verify the checklist items related to changes.

### 6. Output Location

1. Look for a `docs/`, `ai_docs/`, or `design/` directory in the project.
2. Ask the user if the location is unclear.
3. Save with a descriptive filename such as `design-[feature-name].md`.
