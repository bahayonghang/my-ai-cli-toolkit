# Prompt Quality Profile

Skill: `codex-workflow-recommender`
Relevance: `prompt-heavy`
Overall quality score: `80.0/100`

## Primary Task Family

**Prompt engineering**
- Matched keywords: prompt, role

## Complexity

- Band: `complex`
- Score: `6`
- Reason: multiple inputs, constraints, or task families require tradeoff handling

## Need Model

- Explicit Need: Audit a repository and current Codex capabilities, then recommend the smallest evidence-backed read-only improvement or no change. Use for Codex setup optimization, surface selection, unapplied MCP/plugin/subagent plans, 优化 Codex 工作流, 审阅 Codex 配置, Codex 能力推荐. Exclude direct AGENTS/code-map edits, docs-only questions, skill audits, dynamic workflow builds, code review, and unapproved install/config/write.
- Implicit Need: The reusable skill needs a stable role, task, and output contract rather than a one-off prompt.
- Scenario: not yet explicit
- User Level: infer from examples and standards; ask only if it changes output depth
- Success Standard: usable output with clear validation cues

## RTF To Skill Mapping

- Role: Use a prompt engineer role only when role design materially improves execution.
- Task: Map Role, Task, and Format into skill behavior rather than copying a large prompt template.
- Format: Return a compact prompt contract plus tests, quality matrix, and usage notes.

## Quality Matrix

### Completeness — 75/100
- Matched signals: output, example
- Repair: Name missing inputs, outputs, constraints, or success standards before deepening the package.

### Clarity — 80/100
- Matched signals: none
- Repair: Replace broad verbs with observable actions and define what done means.

### Consistency — 80/100
- Matched signals: none
- Repair: Check that role, task, format, exclusions, and examples do not contradict each other.

### Practicality — 95/100
- Matched signals: action, use, workflow
- Repair: Add runnable steps, examples, or verification cues instead of abstract advice.

### Specificity — 70/100
- Matched signals: none
- Repair: Anchor wording in the user's audience, domain nouns, and target outcome.

## Matched Task Families

### Prompt engineering
- Score: `2`
- Keywords: prompt, role
- Role: Use a prompt engineer role only when role design materially improves execution.
- Task: Map Role, Task, and Format into skill behavior rather than copying a large prompt template.
- Format: Return a compact prompt contract plus tests, quality matrix, and usage notes.

### Analytical reasoning
- Score: `1`
- Keywords: decision
- Role: Use an analyst role that separates evidence, inference, uncertainty, and recommendation.
- Task: State assumptions, compare alternatives, and make the decision path inspectable.
- Format: Return findings, evidence, tradeoffs, recommendation, and residual risks.

### Execution operation
- Score: `1`
- Keywords: workflow
- Role: Use an operator role with explicit boundaries, inputs, outputs, and failure handling.
- Task: Convert the job into ordered steps with validation checks and stop conditions.
- Format: Return a runbook-like handoff with commands, checks, owners, and next actions when relevant.

### Dialogue interaction
- Score: `1`
- Keywords: support
- Role: Use a conversational role that asks only high-leverage questions and remembers the user's goal.
- Task: Clarify intent, resolve uncertainty, and converge toward a recommendation instead of a long option list.
- Format: Return concise prompts, decision points, and reviewer-visible assumptions.

## Self-Repair Checks

- Check explicit need, implicit need, scenario, user level, and success standard before deepening.
- Map Role, Task, and Format into skill behavior, not decorative prompt labels.
- Ask one focused clarification only when missing information changes the package boundary.
- Add tests or examples for prompt-heavy behavior before treating it as reusable.
- Keep prompt methodology in references and reports instead of bloating SKILL.md.

## Reviewer Note

Use this profile when the package depends on prompt behavior, role design, output contracts, or conversation quality.

## Reviewer Interpretation

This package is a repository-grounded analytical recommender, not a prompt-writing
or teaching skill. Its success standard is an evidence/provenance-backed smallest
surface decision, including no change, plus risk-ordered verification, rollback,
and separate approvals. The six recorded fixtures exercise that contract.
Provider-backed prompt behavior and human review remain `missing evidence`.
