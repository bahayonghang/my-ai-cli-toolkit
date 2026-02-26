# OpenSpec Artifact Templates

Fallback templates when `openspec instructions` CLI is unavailable. Prefer CLI output over these templates.

## proposal.md

```markdown
# Proposal: <change-name>

## Why

<Problem statement — what pain exists today>

## What Changes

- <Bullet list of high-level modifications>

## Capabilities

- <capability-name>: <one-line description>

## Impact

- Files: <affected directories/modules>
- Dependencies: <new/changed dependencies>
- Risk: <low/medium/high> — <brief justification>
```

## specs/\<capability\>/spec.md

```markdown
# <Capability Name>

## Purpose

<What this capability provides>

## ADDED Requirements

### <Requirement Title>

<Description>

**Scenarios:**

- WHEN <precondition>, THEN <outcome>, AND <constraint>
- WHEN <error condition>, THEN <error handling>

## MODIFIED Requirements

### <Existing Requirement Title>

<What changed and why>

**Scenarios:**

- WHEN <new precondition>, THEN <new outcome>

## REMOVED Requirements

### <Deprecated Requirement>

<Why it was removed>
```

## design.md

```markdown
# Design: <change-name>

## Context

<Current system state and constraints>

## Goals

- <What this design achieves>

## Non-Goals

- <What is explicitly out of scope>

## Decisions

### <Decision Title>

- **Choice**: <what was chosen>
- **Alternatives**: <what was rejected>
- **Rationale**: <why this choice>
```

## tasks.md

```markdown
# Tasks: <change-name>

## Setup

- [ ] <task description> (`path/to/file`)

## Core Implementation

- [ ] <task description>
  - [ ] <subtask>
  - [ ] <subtask>

## Integration

- [ ] <task description>

## Testing

- [ ] <task description>

## Documentation

- [ ] <task description>
```
