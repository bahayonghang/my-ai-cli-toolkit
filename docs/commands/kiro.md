# Kiro Integration Commands

> Historical / offline note: this page documents a removed command family. The matching source tree is not present in current `content/platforms/*/commands/`, and this page is intentionally kept outside the live sidebar.


Spec-driven development workflow with iterative requirements, design, and task generation following Kiro's developer-friendly approach.

## Commands

### `spec`

**Description**: Create a complete feature specification from rough idea to implementation plan, with iterative user approval at each stage.
**Usage**: `/kiro:spec [feature name or rough idea]`

#### Workflow

1. **Requirements Gathering** - Generate initial requirements in EARS format based on the feature idea, with user stories and acceptance criteria. Output to `.kiro/specs/{feature_name}/requirements.md`
2. **User Review (Requirements)** - Prompt for explicit approval before proceeding; iterate on feedback
3. **Design Document** - Create comprehensive design with architecture, components, data models, error handling, and test strategy. Output to `.kiro/specs/{feature_name}/design.md`
4. **User Review (Design)** - Prompt for explicit approval; iterate on feedback
5. **Task List** - Generate numbered checkbox implementation plan with TDD orientation and requirement references. Output to `.kiro/specs/{feature_name}/tasks.md`
6. **User Review (Tasks)** - Prompt for explicit approval; workflow complete after approval

#### Requirements Format (EARS)

```markdown
### Requirement 1

**User Story:** As a [role], I want [feature], so that [benefit]

#### Acceptance Criteria

1. WHEN [event] THEN [system] SHALL [response]
2. IF [precondition] THEN [system] SHALL [response]
```

#### Task List Format

```markdown
- [ ] 1. Set up project structure and core interfaces
    - Create directory structure for models, services, repositories
    - Define interfaces establishing system boundaries
    - _Requirements: 1.1_

- [ ] 2. Implement data models
- [ ] 2.1 Create core data model interfaces
    - Write TypeScript interfaces for all data models
    - _Requirements: 2.1, 3.3_
```

#### Key Rules

- Feature name uses `kebab-case` (e.g., `user-authentication`)
- Each stage requires explicit user approval before advancing
- Tasks are code-only (no deployment, UAT, or manual testing tasks)
- The workflow creates planning artifacts only -- actual implementation uses separate commands

### `design`

**Description**: Create a comprehensive feature design document with research and architecture.
**Usage**: `/kiro:design [feature name or rough idea]`

#### Workflow

1. **Check Requirements** - Ensure `.kiro/specs/{feature_name}/requirements.md` exists
2. **Research** - Identify areas needing research based on requirements; summarize key findings
3. **Design Creation** - Generate `.kiro/specs/{feature_name}/design.md` with required sections
4. **User Review** - Iterate until explicit approval

#### Design Document Sections

| Section | Content |
|---------|---------|
| Overview | Feature summary and goals |
| Architecture | System architecture and boundaries |
| Components & Interfaces | Component definitions and their contracts |
| Data Models | Data structures and relationships |
| Error Handling | Error scenarios and recovery strategies |
| Test Strategy | Testing approach and coverage plan |

Mermaid diagrams are included where appropriate. Design decisions include rationale.

### `task`

**Description**: Generate an implementation task list from an approved feature design.
**Usage**: `/kiro:task [feature name]`

#### Workflow

1. **Check Design** - Ensure `.kiro/specs/{feature_name}/design.md` exists
2. **Generate Tasks** - Convert design into numbered checkbox list with TDD orientation
3. **User Review** - Iterate until explicit approval

#### Task Constraints

- Each task references specific requirements (e.g., `_Requirements: 1.1, 2.3_`)
- Tasks are scoped to specific coding activities (write, modify, or test code)
- Incremental progression -- each step builds on previous ones
- Two-level hierarchy maximum (epics with decimal-numbered subtasks)
- Excludes non-coding tasks (deployment, UAT, documentation, performance metrics)

### `execute`

**Description**: Execute a specific task from a Kiro spec, focused on implementation.
**Usage**: `/kiro:execute [feature name] [task description or task number]`

#### Workflow

1. **Read Spec Files** - Load `requirements.md`, `design.md`, and `tasks.md` from `.kiro/specs/{feature_name}/`
2. **Identify Task** - Locate the requested task (or suggest the next uncompleted task)
3. **Implement** - Execute the single task, validating against referenced requirements
4. **Stop for Review** - Halt after completing the task; do not auto-advance to the next one

#### Key Rules

- Always reads all three spec files before starting
- Executes one task at a time -- never continues to the next without user request
- If a task has subtasks, starts with the subtasks first
- Can answer questions about tasks without executing them

### `vibe`

**Description**: Quick development assistance with Kiro's relaxed, developer-friendly personality.
**Usage**: `/kiro:vibe [question or problem]`

A lightweight mode for rapid prototyping and direct problem-solving. No spec workflow -- just fast, practical help.

#### Characteristics

- Minimal steps, direct communication
- Answers questions, explains concepts, provides code snippets
- Runs tests only when the user suggests it
- Prioritizes parallel tool calls for efficiency
- Clarifies intent only when truly ambiguous

## Examples

```bash
# Create a full spec from a rough idea
/kiro:spec user-authentication

# Create just the design document
/kiro:design payment-processing

# Generate tasks from an approved design
/kiro:task payment-processing

# Execute a specific task
/kiro:execute user-authentication 2.1

# Quick development help
/kiro:vibe "How should I structure the error handling for this API?"
```

## Notes

- The full spec workflow is: `spec` (requirements -> design -> tasks) or individual stages via `design` / `task`
- All artifacts are stored in `.kiro/specs/{feature_name}/` (requirements.md, design.md, tasks.md)
- Each stage requires explicit user approval before proceeding to the next
- `execute` implements one task at a time from the generated task list
- `vibe` is independent of the spec workflow -- use it for quick, informal assistance
- Tasks follow TDD principles: test-driven, incremental, and building on previous steps
