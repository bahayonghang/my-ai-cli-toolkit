# spark

Standalone brainstorming skill. Asks one question at a time to refine an idea, presents 2–3 approaches with tradeoffs, writes a single-file offline HTML spec to `docs/spark/YYYY-MM-DD-<topic>-design.html`, then stops.

See [SKILL.md](./SKILL.md) for the full skill content (this is what Claude reads when the skill triggers).

## Provenance

Extracted from [`brainstorming`](https://github.com/obra/superpowers/tree/main/skills/brainstorming) in [obra/superpowers](https://github.com/obra/superpowers) (MIT, Jesse Vincent).

### Changes vs. the original

Functional intent: original `brainstorming` ends by handing off to `writing-plans`, which chains into `executing-plans` / `subagent-driven-development`. `spark` cuts the pipeline at the spec — once the spec is written, the turn ends.

#### 1. Frontmatter rewritten

```diff
- name: brainstorming
- description: "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation."
+ name: spark
+ version: 0.2.0
+ description: "Spec-only brainstorming workflow for turning an idea into an approved offline HTML design spec. Use when the user wants to brainstorm an idea or design a feature/spec, especially when the result should be a written spec rather than immediate implementation. Explores intent and requirements through dialogue, then writes a single-file HTML spec document to docs/spark/ and STOPS. Does not auto-chain to implementation planning or any other skill."
+ category: development-workflows
+ tags:
+   - brainstorming
+   - spec-writing
+   - product-design
+   - requirements
+   - planning
+ argument-hint: "[idea-or-feature-brief]"
```

The description was rewritten to make the "stops after spec" behavior explicit — Claude reads this to decide whether to invoke the skill, so the new wording prevents misuse expecting implementation follow-through. `category`, `tags`, and `argument-hint` keep repository docs and skill discovery aligned with the generated catalog contract. A `version` field was added (optional per the [agent skills spec](https://agentskills.io/specification)) for future bumps.

#### 2. Checklist step 9 — terminal action

```diff
- 9. **Transition to implementation** — invoke writing-plans skill to create implementation plan
+ 9. **Deliver spec to user and STOP** — report the spec file path; do not invoke any other skill or start implementation
```

#### 3. Process-flow graphviz — terminal node

```diff
- "Invoke writing-plans skill" [shape=doublecircle];
+ "Deliver spec path to user and STOP" [shape=doublecircle];

  ...

- "User reviews spec?" -> "Invoke writing-plans skill" [label="approved"];
+ "User reviews spec?" -> "Deliver spec path to user and STOP" [label="approved"];
```

#### 4. "Terminal state" paragraph after the flowchart

```diff
- **The terminal state is invoking writing-plans.** Do NOT invoke frontend-design, mcp-builder, or any other implementation skill. The ONLY skill you invoke after brainstorming is writing-plans.
+ **The terminal state is delivering the spec to the user. STOP.** Do NOT invoke any other skill, do NOT start implementation planning, do NOT write code. Report the spec path and end your turn — the user will decide what to do with the spec.
```

#### 5. "After the Design / Documentation" — cross-plugin dep removed

```diff
  - Write the validated design (spec) to `docs/spark/YYYY-MM-DD-<topic>-design.html`
    - (User preferences for spec location override this default)
- - Use elements-of-style:writing-clearly-and-concisely skill if available
  - Commit the design document to git
```

The removed line referenced a skill from a different plugin (`elements-of-style`) that doesn't exist in this standalone distribution — leaving it would cause the model to attempt invoking a nonexistent skill.

#### 6. Final "Implementation:" section — replaced entirely

```diff
- **Implementation:**
-
- - Invoke the writing-plans skill to create a detailed implementation plan
- - Do NOT invoke any other skill. writing-plans is the next step.
+ **Done — STOP here:**
+
+ - Report the spec file path to the user and end your turn.
+ - Do NOT invoke any other skill.
+ - Do NOT start implementation planning or write any code.
+ - The user will decide what to do with the spec on their own.
```

#### 7. Spec output path — out of the `superpowers/` namespace

All three references changed:

```diff
# in frontmatter description:
- writes a spec document to docs/superpowers/specs/ and STOPS
+ writes a spec document to docs/spark/ and STOPS

# in checklist step 6 and Documentation section:
- docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md
+ docs/spark/YYYY-MM-DD-<topic>-design.html
```

The original Superpowers plugin namespaced every skill's artifacts under `docs/superpowers/` to isolate them from the project's own `docs/`. For a single standalone skill that's just visual noise — the spec is project documentation, so it goes under `docs/spark/` directly.

#### 8. Spec output switched to offline HTML

The default final artifact is now `docs/spark/YYYY-MM-DD-<topic>-design.html` instead of Markdown. `assets/spec-template.html` provides the committed spec shell: a standalone, printable, semantic HTML document with inline CSS and no remote dependencies. This is separate from `scripts/frame-template.html`, which remains Visual Companion runtime UI and is not reused for final specs.

The spec reviewer prompt now checks the HTML contract as well as content readiness: single-file/offline structure, required sections, no remote resources, no protocol-relative URLs, and no unresolved template placeholders.

#### 9. Skill directory renamed

`skills/brainstorming/` → `skills/spark/`. Matches the `name:` field in the frontmatter and keeps the install path `~/.claude/skills/spark/` distinct from anyone running the original `superpowers:brainstorming`.

### Preserved as-is

- 9-step checklist structure, the `<HARD-GATE>` block, the "This Is Too Simple To Need A Design" anti-pattern
- Graphviz process flow (only the terminal node was retargeted)
- Visual companion feature — browser-based mockup viewer in `scripts/` and `visual-companion.md`
- Spec self-review loop (placeholder scan, internal consistency, scope, ambiguity)
- All key principles: one question at a time, multiple choice preferred, YAGNI, explore alternatives, incremental validation, be flexible
- The subagent spec reviewer prompt template (`spec-document-reviewer-prompt.md`), updated with HTML-specific checks

## License

MIT — see [LICENSE](../../LICENSE) at the repository root.
