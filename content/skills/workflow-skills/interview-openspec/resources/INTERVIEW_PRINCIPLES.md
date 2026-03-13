# Interview Principles

## 1. Structured Progression

Follow the pyramid: `Business Goals (Why) → Engineering Principles (How Design) → Implementation Details (How Impl) → System Protection & Tradeoffs (What ifs)`.

In OpenSpec context, this maps to: `Proposal → Specs → Design → Tasks`.

## 2. Reflective Probing

Act as a senior architect with 10 years of experience. Don't just collect information — challenge assumptions with "What happens if we don't do this?" to surface hidden defects.

## 3. Convergent Options (Eliminate Ambiguity)

Use convergent, scoped options instead of open-ended questions.

**Interaction constraint: Always present options via `AskUserQuestion` tool** so the user can click to select in the UI. Never output plain-text A/B/C lists expecting manual input. Each question provides 2-4 `options` with concise `label` (1-5 words) and explanatory `description`. Merge independent questions into a single call (up to 4 `questions`).

**Example**:
- ✅ `AskUserQuestion({ questions: [{ question: "Which async strategy?", header: "Async", options: [{ label: "Message Queue", description: "..." }, { label: "Coroutine", description: "..." }, { label: "Not needed", description: "..." }] }] })`
- ❌ "What do you think?"
- ❌ Plain text "A. Message Queue B. Coroutine C. Not needed"

## 4. Context-Aware Weighting

Dynamically adjust question focus based on the project type:
- **API/Backend**: Emphasize retry, compensation, isolation, data consistency
- **Frontend**: Emphasize interaction, rendering, graceful degradation
- **CLI**: Emphasize cross-platform POSIX compatibility, piping, signal handling
- **Skill/Workflow**: Emphasize artifact structure, template compliance, tool integration

## 5. Artifact Boundary Awareness (OpenSpec-specific)

Each interview phase strictly targets its corresponding artifact's fields. Do not mix proposal-level questions into the specs phase, or design decisions into the tasks phase. Complete one artifact before advancing.

## 6. Scenario-Driven Elicitation (OpenSpec-specific)

During the Specs phase, guide users to express requirements in WHEN/THEN format:
- "WHEN [trigger], THEN [expected behavior], AND [constraint]"
- Cover happy path first, then error paths and edge cases

## 7. Incremental Generation (OpenSpec-specific)

Write each artifact immediately after its interview phase completes. The user can exit at any point with partial but valid artifacts. Never batch all writing to the end.

## 8. Approach Exploration (Brainstorming Integration)

After Phase 1 (Proposal) completes, propose 2-3 viable implementation approaches with tradeoff analysis and a recommendation. Present via `AskUserQuestion` for the user to select. The selected approach feeds into proposal.md's "What Changes" section; rejected approaches are documented in design.md's "Alternatives Considered" section. See `resources/BRAINSTORMING_INTEGRATION.md` for the full protocol.
