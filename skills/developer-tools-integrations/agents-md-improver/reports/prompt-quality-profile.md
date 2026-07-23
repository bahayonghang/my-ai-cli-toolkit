# Prompt Quality Profile

Skill: `agents-md-improver`
Relevance: `prompt-heavy`
Overall quality score: `80.0/100`

## Primary Task Family

**Teaching guidance**
- Matched keywords: guide, 指导

## Complexity

- Band: `complex`
- Score: `6`
- Reason: multiple inputs, constraints, or task families require tradeoff handling

## Need Model

- Explicit Need: Audit or improve repository-scoped Codex AGENTS.md, AGENTS.override.md, configured fallback instructions, and companion code_map.md navigation. Use for effective-chain audits, nested conflicts, stale commands, scoped-guidance gaps, approved updates, 优化 AGENTS.md, 审计 Codex 项目指导, 更新 AGENTS.md, or 生成 code_map.md. Exclude Claude-only guidance, general Codex workflow advice, explanations, ordinary code/docs review, and implicit fully specified trivial edits.
- Implicit Need: The reusable skill needs a stable role, task, and output contract rather than a one-off prompt.
- Scenario: not yet explicit
- User Level: infer from examples and standards; ask only if it changes output depth
- Success Standard: usable output with clear validation cues

## RTF To Skill Mapping

- Role: Use a teacher role that adapts to learner level and avoids overloading the first pass.
- Task: Explain through progressive steps, examples, and visible success checks.
- Format: Return learner-facing sections, worked examples, checkpoints, and common mistakes.

## Quality Matrix

### Completeness — 70/100
- Matched signals: output
- Repair: Name missing inputs, outputs, constraints, or success standards before deepening the package.

### Clarity — 80/100
- Matched signals: none
- Repair: Replace broad verbs with observable actions and define what done means.

### Consistency — 85/100
- Matched signals: boundary
- Repair: Check that role, task, format, exclusions, and examples do not contradict each other.

### Practicality — 95/100
- Matched signals: action, use, workflow
- Repair: Add runnable steps, examples, or verification cues instead of abstract advice.

### Specificity — 70/100
- Matched signals: none
- Repair: Anchor wording in the user's audience, domain nouns, and target outcome.

## Matched Task Families

### Teaching guidance
- Score: `2`
- Keywords: guide, 指导
- Role: Use a teacher role that adapts to learner level and avoids overloading the first pass.
- Task: Explain through progressive steps, examples, and visible success checks.
- Format: Return learner-facing sections, worked examples, checkpoints, and common mistakes.

### Prompt engineering
- Score: `2`
- Keywords: instruction, format
- Role: Use a prompt engineer role only when role design materially improves execution.
- Task: Map Role, Task, and Format into skill behavior rather than copying a large prompt template.
- Format: Return a compact prompt contract plus tests, quality matrix, and usage notes.

### Creative generation
- Score: `1`
- Keywords: content
- Role: Use a taste-aware creator role with clear audience, tone, and originality boundaries.
- Task: Generate variants, explain selection logic, and preserve the user's distinctive constraints.
- Format: Return options with rationale, selection criteria, and refinement paths.

### Analytical reasoning
- Score: `1`
- Keywords: decision
- Role: Use an analyst role that separates evidence, inference, uncertainty, and recommendation.
- Task: State assumptions, compare alternatives, and make the decision path inspectable.
- Format: Return findings, evidence, tradeoffs, recommendation, and residual risks.

## Self-Repair Checks

- Check explicit need, implicit need, scenario, user level, and success standard before deepening.
- Map Role, Task, and Format into skill behavior, not decorative prompt labels.
- Ask one focused clarification only when missing information changes the package boundary.
- Add tests or examples for prompt-heavy behavior before treating it as reusable.
- Keep prompt methodology in references and reports instead of bloating SKILL.md.

## Reviewer Note

Use this profile when the package depends on prompt behavior, role design, output contracts, or conversation quality.

## Reviewer Interpretation

The task-family and score rows above are keyword heuristics from the renderer,
not an independent model judgment. The actual package is an analytical,
execution-oriented repository audit with a report/update contract; it is not a
teaching skill. The file-backed scenarios make the scenario and success
standard explicit for this release. Provider-backed and human prompt-quality
evidence remain `missing evidence`.
