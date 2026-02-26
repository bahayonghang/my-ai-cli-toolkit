# OpenSpec Interview Dimensions

Interview dimensions reorganized by OpenSpec artifact phase. Each phase targets one artifact.

## Phase 1 — Proposal (proposal.md)

Focus: **Why** this change exists and **what** it changes at a high level.

### Business Motivation
- What problem does this solve? What happens if we do nothing?
- Who are the primary stakeholders and end users?
- What measurable outcome defines success?

### Scope & Simplicity (KISS/YAGNI)
- Is this the minimum viable change to achieve the goal?
- Can any part be deferred to a later change?
- Are there cheaper alternatives that achieve 80% of the value?

### Risk Preview
- What is the blast radius if this goes wrong?
- Are there compliance, security, or data integrity concerns?
- What existing functionality might break?

### Capabilities Identification
- What new capabilities does this introduce?
- What existing capabilities are modified or removed?
- List each capability as a noun phrase (e.g., "user-authentication", "export-csv").

---

## Phase 2 — Specs (specs/\<capability\>/spec.md)

Focus: **What** each capability requires, expressed as testable scenarios.

### Requirements per Capability
- What are the ADDED requirements? (new behavior)
- What are the MODIFIED requirements? (changed behavior)
- What are the REMOVED requirements? (deprecated behavior)

### Scenario Definition (WHEN/THEN format)
- WHEN [precondition/trigger], THEN [expected outcome], AND [additional constraints]
- Cover the happy path first, then error paths
- Include boundary conditions and edge cases

### API & Data Contracts (if applicable)
- REST/GraphQL/gRPC endpoint naming and semantics
- Request/response schema with constraints
- Authentication and authorization model
- Error codes and status mapping

### UI/UX Flows (if applicable)
- Core interaction flow and mental model consistency
- Loading, empty, and error state designs
- Responsive breakpoints and accessibility (WCAG)
- i18n and localization considerations

---

## Phase 3 — Design (design.md)

Focus: **How** to implement — technical decisions and their rationale.

### Context
- What is the current state of the system?
- What constraints does the existing architecture impose?

### Architecture Decisions (SOLID)
- Is each module single-responsibility and cohesive?
- Are interfaces designed for extension without modification?
- Are dependencies clean, unidirectional, and abstract?

### Technology Tradeoffs
- What alternatives were considered? Why was this approach chosen?
- What technical debt does this decision accept? What is the repayment plan?
- Are there vendor lock-in risks?

### Edge Cases & Resilience
- Retry, circuit-breaker, and timeout strategies
- Concurrent update conflict resolution
- Graceful degradation and fallback paths
- Logging, monitoring, and alerting design

---

## Phase 4 — Tasks (tasks.md)

Focus: **Do** — concrete implementation steps as a checklist.

### Task Breakdown
- Break into logical groups (setup, core, integration, testing, docs)
- Each task should be completable in a single session
- Specify file paths and function names where possible

### Priority & Dependencies
- Which tasks must be done first? (blocking dependencies)
- Which tasks can be parallelized?
- What is the critical path?

### Acceptance Criteria
- How do we verify each task is done correctly?
- What tests must pass?
- What manual verification steps are needed?

### Engineering Infrastructure
- CI/CD pipeline changes needed?
- New dependencies to install?
- Documentation or config updates required?
- Code style, lint, and commit conventions to follow
