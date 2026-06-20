---
name: agent-skill-review
description: Review Codex, Claude, OpenAI, or other agent skill directories as reusable capability packages. Use when asked to audit, review, improve, score, rewrite, debrand, package, or document a SKILL.md, skill package, marketplace skill, or agent skill directory, especially when the user wants a comprehensive findings-first report with concrete patch recommendations and validation steps.
category: developer-tools-integrations
tags:
  - skills
  - review
  - agents
  - codex
  - documentation
version: 1.0.0
argument-hint: "[skill-dir-or-path]"
allowed-tools: Read, Glob, Grep, Edit, Write, Bash
---

# Agent Skill Review

Use this skill to review other agent skills as deployable capability packages, not as ordinary documentation.

The review lens: a strong skill is not a prompt, tutorial, app, or repository listing. It is an externalized unit of agent capability: it packages expert experience, workflow, taste, boundaries, tools, scripts, templates, validation, and known failure cases into something that can be installed, invoked, reused, improved, and judged by its results.

## Core Principles

Judge the skill by whether it helps ordinary users access a capability that expert agent users would otherwise assemble from goals, context, tools, memory, loops, CLI/MCP calls, files, scripts, and judgment.

- **Ability product, not prompt**: The skill should make a reusable capability easy to discover, install, invoke, version, and iterate. A prompt alone is usually too copyable, too implicit, and too weakly routed.
- **Experience externalization**: The valuable part is the creator's professional judgment: what good looks like, what usually fails, which options to remove, and which tool should own each step.
- **Real workflow first**: Strong skills come from repeated real tasks. They encode reading inputs, selecting approach, using tools, producing artifacts, validating, repairing, and reporting.
- **Center short, radiating thick**: `SKILL.md` should be a high-signal entry point. Heavy domain material belongs in `references/`, deterministic mechanics in `scripts/`, reusable materials in `assets/`, and stable preferences/config in explicit config files.
- **Description as router**: Frontmatter `description` is not marketing copy. It is the always-loaded trigger contract and should mirror realistic user requests.
- **Thin harness, fat skills**: Do not assume the base agent should carry every protocol, workflow, or domain rule. The skill should own vertical process and gotchas while delegating deterministic work to tools, scripts, CLI, APIs, or MCP.
- **Model does judgment, code does invariants**: Use the model for understanding, selection, tradeoffs, and synthesis. Use code, templates, schemas, and validators for repeatable structure and fragile checks.
- **Gotchas beat generic advice**: Failure-derived negative constraints are often the highest-value content. General best practices the model already knows should be deleted unless they change behavior.
- **Lifecycle over one-shot writing**: A good skill should be maintained like code: route evals, positive and negative examples, forbidden loads, cross-model checks, issue feedback, and regression gotchas.
- **User result focus**: The skill should communicate what problem it solves, what inputs it needs, what output looks like, when it fails, and how to iterate through chat.
- **Do not abstract too early**: Prefer skills that come from a real completed task, then extract reusable inputs, outputs, constraints, tools, validation, and repair steps. A skill created only from an abstract idea should be treated as an initial draft.
- **Human boundary setting matters**: Automatic skill or gene-like extraction can collect repeated success paths, but humans still need to decide naming, scope, quality bar, gotchas, and whether the pattern deserves to become a skill.

## Review Workflow

1. Inspect the skill package:
   - Read `SKILL.md` first.
   - Inspect `agents/openai.yaml` if present.
   - List referenced `references/`, `scripts/`, `assets/`, examples, evals, config files, and generated artifacts.
   - Confirm every referenced local file exists.

2. Reconstruct the intended capability:
   - What user jobs should trigger it?
   - What expert experience, taste, workflow, or failure knowledge is being externalized?
   - What does the agent do after loading it that it would not reliably do otherwise?
   - What output should a good run produce, and how would a user recognize success?
   - What inputs, tools, credentials, or environment assumptions does it need?
   - Which parts should be model judgment, and which should be scripts, templates, schemas, CLI, APIs, or MCP?

3. Evaluate against the rubric:
   - Frontmatter trigger contract
   - Ability-product clarity
   - Experience and taste externalization
   - Center-short/radiating-thick information architecture
   - Workflow and tool decomposition
   - Gotchas and negative constraints
   - Eval, validation, and maintenance loop
   - User education and result demonstration
   - Lifecycle, feedback, and distribution strategy
   - Skill-vs-tool-vs-auto-extraction boundaries
   - Portability, safety, and permission boundaries

4. Validate cheaply when possible:
   - Parse YAML frontmatter and `agents/openai.yaml`.
   - Check links and local file references.
   - Run non-destructive scripts with `--help`, dry-run, or test fixtures when available.
   - Compare the skill's stated triggers against realistic prompts.
   - If evals exist, inspect whether they include positive loads, negative loads, and forbidden loads.
   - Do not run network, credentialed, destructive, or expensive actions unless the user asked for implementation-level validation.

5. Produce a comprehensive report with concrete fixes.

## Rubric

Use these levels in the report:

- `Excellent`: directly improves agent behavior with lean, executable guidance.
- `Good`: useful and mostly clear, with limited gaps or bloat.
- `Needs work`: likely to trigger or behave inconsistently without revision.
- `Weak`: mostly documentation, vague prompting, or brittle local assumptions.

### Frontmatter

Check:

- `name` is stable, lowercase, and specific.
- `description` includes the task verbs, artifacts, and scenarios users will mention.
- Description says when to use the skill, not just what it contains.
- Trigger surface is broad enough for real prompts but narrow enough to avoid unrelated tasks.
- Metadata does not depend on body content to explain the trigger.
- The trigger is phrased like routing logic, not an advertisement.

Common fixes:

- Add artifact names such as `SKILL.md`, `skill directory`, `PPTX`, `Cloudflare Worker`, or the domain object.
- Add verbs such as `review`, `create`, `debug`, `convert`, `deploy`, `audit`, or `optimize`.
- Replace "generate beautiful slides" with "when the user needs to turn an article, outline, or talk into a presentable slide deck".
- Remove marketing language and generic claims like "helps with productivity".

### Ability Product Design

Check:

- The skill solves a repeatable class of tasks.
- It emerged from, or clearly simulates, a real workflow rather than an abstract capability label.
- It defines success criteria.
- It gives the agent domain-specific procedure, not common sense.
- It names constraints, assumptions, and non-goals.
- It explains how to adapt when inputs are incomplete.
- It makes the user-facing promise clear: problem, scenario, required input, output form, and likely failure cases.

Common fixes:

- Add a "When to use" and "When not to use" distinction.
- Add an input discovery step before acting.
- Add expected final-output shape.
- Replace broad advice with decision rules.
- Add examples of realistic user prompts that should and should not trigger the skill.

### Origin And Lifecycle

Check:

- The skill appears grounded in a real repeated task, user workflow, or domain SOP.
- It shows evidence of having been used to produce a high-quality result before being generalized.
- It separates initial creation from ongoing iteration.
- It has a path for feedback to become gotchas, templates, evals, or scripts.
- It avoids pretending that an automatically generated draft already contains real user failures or expert taste.

Common fixes:

- Add "source workflows" or "intended task examples" that explain where the skill should be applied.
- Add a maintenance loop: collect failures, filter for generality, update gotchas/evals, and retest routing.
- Mark speculative sections as assumptions until validated by real use.
- Add cross-model checks when the skill is meant to work across different agent platforms.

### Externalized Expertise

Check:

- The skill contains creator judgment that the base model would not consistently infer.
- It defines what "good" means in the domain.
- It removes bad options instead of leaving the model in unconstrained generation.
- It records gotchas from actual failures or credible domain failure modes.
- It distinguishes expert judgment from deterministic mechanics.

Common fixes:

- Add a short "Quality bar" section.
- Add negative constraints such as "do not use X unless Y", "ask before Z", or "treat A as a P0 failure".
- Move generic domain background out unless it changes decisions.
- Add concrete checks for taste, structure, safety, or industry-specific boundaries.

### Context Economy

Check:

- `SKILL.md` is short enough to load frequently without waste.
- Long references are split by use case and loaded conditionally.
- There is no duplicated information across `SKILL.md` and references.
- Examples are concise and behavior-shaping.
- The skill does not paste general documentation that the model likely already knows.
- The directory follows "center short, radiating thick" instead of stuffing everything into the entry file.

Common fixes:

- Move long API docs, schemas, policy tables, examples, or templates to `references/`.
- Keep only navigation guidance and critical workflow steps in `SKILL.md`.
- Replace paragraphs of rationale with compact heuristics.
- Add explicit "read this reference when..." pointers for each large file.

### Workflow Quality

Check:

- The workflow is ordered and matches how the task should actually be done.
- It includes discovery, execution, validation, repair, and final reporting.
- It handles common failure modes.
- It states when to ask the user versus when to make a reasonable assumption.
- It has enough specificity for another agent to follow without inventing the process.
- It turns a multi-step job into a repeatable loop, not a single response.
- It encourages iterative repair when the output naturally needs refinement.

Common fixes:

- Add a numbered workflow.
- Add fallback paths for missing files, blocked APIs, absent credentials, malformed inputs, or unavailable tools.
- Add stop conditions for unsafe or ambiguous actions.
- Split "free design/generation" into choosing from proven patterns, filling content, validating, and repairing.

### Tools, Scripts, And Assets

Check:

- Deterministic or repetitive operations are scripted.
- Scripts have clear arguments and safe defaults.
- Assets are used as output resources, not as hidden documentation.
- References are discoverable from `SKILL.md`.
- Tool instructions include permission and validation guidance.
- Templates, schemas, themes, fixtures, or layout skeletons are present when output quality depends on stable structure.
- The skill does not make the model hand-roll fragile parsing, export, rendering, or API choreography every time.

Common fixes:

- Add a small validator or extractor script instead of making the agent rewrite parsing code.
- Add `--help`, dry-run mode, or fixture-based examples to scripts.
- Remove unused assets and stale references.
- Add proven templates or skeletons so the model selects and fills rather than invents from scratch.

### Gotchas And Negative Constraints

Check:

- The skill includes mistakes to avoid, not only the happy path.
- Gotchas are specific enough to be testable.
- Gotchas are kept close to the workflow or in a dedicated section/reference that is easy to load.
- New failure cases have somewhere to be recorded without bloating the main flow.

Common fixes:

- Add a `Gotchas` section with the 5-10 most important failure modes.
- Convert vague cautions into hard constraints, priorities, or validation checks.
- Move long failure logs to a reference file and keep a short index in `SKILL.md`.

### Verification And Evals

Check:

- The skill defines what evidence proves success.
- It requires tests, render checks, linting, screenshots, dry-runs, or source citations when appropriate.
- It tells the agent what to report when verification cannot be completed.
- It avoids performative checklists that do not change behavior.
- It has, or asks for, evals that cover should-trigger, should-not-trigger, and forbidden-load cases.
- It considers cross-model robustness when the skill is intended for multiple agents or platforms.

Common fixes:

- Add validation commands.
- Add expected output or acceptance criteria.
- Add a final report template that distinguishes verified facts from assumptions.
- Add eval prompts, sample artifacts, and expected routing behavior.

### Skill Boundaries

Check:

- The skill chooses the right packaging form for the capability.
- Vertical, reusable workflows live in the skill.
- Atomic external services or context connectors are delegated to MCP, APIs, or app integrations.
- Stable command-line operations are delegated to CLI or scripts.
- Repeated success paths discovered during use are treated as candidates for gotchas, evals, sub-skills, or future automation, not blindly merged into the main flow.

Common fixes:

- Move pure service/API access details out of the main skill and into tool setup or references.
- Add scripts for deterministic mechanics instead of describing every command manually.
- Split a broad "do everything" skill into narrower vertical skills when routing or context cost becomes poor.
- Add a "candidate future skill/gotcha" note for patterns that need evidence before becoming rules.

### Distribution And User Education

Check:

- The skill can be understood by a user who does not know MCP, CLI, harnesses, memory, loops, or context engineering.
- The repository or metadata explains what problem it solves, what inputs it needs, what output looks like, and how to try it.
- There are example prompts, screenshots, videos, or generated artifacts when the skill produces visual or file outputs.
- The skill can receive feedback through issues, examples, usage data, or a documented iteration path.
- It is presented more like a useful capability page than a bare repository name.
- Distribution does not depend on hiding the skill; it can improve through openness, attribution, iteration, and visible user results.

Common fixes:

- Improve `agents/openai.yaml` and default prompt.
- Add concise examples inside `SKILL.md` only if they help routing or execution.
- Recommend external showcase material when reviewing distribution, but do not add README-like clutter to the skill package unless the target ecosystem expects it.
- Recommend README, screenshots, examples, or install instructions when reviewing a public repository, while keeping operational instructions in `SKILL.md`.

## Report Format

Write the report in the user's language unless they request otherwise.

Start with findings, ordered by severity. Use this structure:

```markdown
**Overall Assessment**
Rating: Good
Summary: One short paragraph on whether this skill would reliably improve an agent.

**Findings**

- [P1] Title
  Evidence: File and line or exact artifact.
  Why it matters: Explain the agent behavior that will fail or degrade.
  Suggested fix: Concrete edit, replacement wording, or file move.

**Rubric Notes**

- Frontmatter: ...
- Ability-product design: ...
- Origin/lifecycle: ...
- Externalized expertise: ...
- Context economy: ...
- Workflow quality: ...
- Tools/resources: ...
- Gotchas: ...
- Verification/evals: ...
- Skill boundaries: ...
- User education/distribution: ...

**Skill Product Alignment**
One paragraph on whether the skill behaves like a reusable ability product that externalizes expert workflow, taste, tools, gotchas, evals, and distribution readiness.

**Recommended Patch Plan**

1. ...
2. ...
3. ...

**Residual Risk**
Anything that could not be validated, missing inputs, or assumptions.
```

Priority guide:

- `P0`: The skill cannot load, cannot trigger correctly, or directs unsafe behavior.
- `P1`: The skill will often fail, over-trigger, under-trigger, or waste major context.
- `P2`: The skill is usable but meaningfully weaker than it should be.
- `P3`: Polish, clarity, or maintainability improvements.

## Review Stance

Be direct and evidence-led. Do not praise a skill for being long or comprehensive unless that content changes agent behavior. Prefer fewer, sharper findings over a checklist dump. When suggesting rewrites, provide concrete replacement text for frontmatter or specific sections when that is the fastest path to improvement.

If the user asks you to implement the improvements, edit the files and verify them instead of stopping at recommendations.
