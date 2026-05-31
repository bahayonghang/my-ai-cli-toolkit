# spark

Standalone brainstorming skill. Drives clarifying choices through the `AskUserQuestion` tool, presents 2–3 approaches with tradeoffs, writes a single-file offline HTML spec to `<project-root>/.spark/YYYY-MM-DD-<topic>-design.html` (gitignored), then hands off to Claude Code plan mode (`EnterPlanMode`) to draft the implementation plan.

See [SKILL.md](./SKILL.md) for the full skill content (this is what Claude reads when the skill triggers).

## Provenance

Extracted from [`brainstorming`](https://github.com/obra/superpowers/tree/main/skills/brainstorming) in [obra/superpowers](https://github.com/obra/superpowers) (MIT, Jesse Vincent).

### Changes vs. the original

Functional intent: original `brainstorming` ends by handing off to `writing-plans`, which chains into `executing-plans` / `subagent-driven-development`. `spark` v0.2 cut the pipeline at the spec entirely; v0.3 restores a planning chain but uses the native `EnterPlanMode` tool instead of the legacy `writing-plans` / `executing-plans` skills. The spec write remains the user-approval gate; the implementation plan is drafted inside plan mode and gated by `ExitPlanMode`. v0.4 streamlines the dialogue itself: the mid-flow confirmation gates (visual-companion consent, section-by-section design approval) are removed so the spec review is the single design gate, and the visual companion flips to default-on with a text opt-out.

#### 1. Frontmatter rewritten

```diff
- name: brainstorming
- description: "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation."
+ name: spark
+ version: 0.3.0
+ description: "Spec-first brainstorming workflow for turning an idea into an approved offline HTML design spec, then drafting an actionable implementation plan. Use when the user wants to brainstorm an idea or design a feature/spec. Drives clarifying choices through the AskUserQuestion tool, writes a single-file offline HTML spec to <project-root>/.spark/, then enters plan mode (EnterPlanMode) to draft an implementation plan from the spec. The spec write is the gate — no code runs until both spec and plan are explicitly approved."
+ category: development-workflows
+ tags:
+   - brainstorming
+   - spec-writing
+   - product-design
+   - requirements
+   - planning
+ argument-hint: "[idea-or-feature-brief]"
```

The description was rewritten to make both the spec-write gate and the plan-mode handoff explicit — Claude reads this to decide whether to invoke the skill, so the new wording sets expectations correctly. `category`, `tags`, and `argument-hint` keep repository docs and skill discovery aligned with the generated catalog contract. The `version` field tracks the spec-only (v0.2) → plan-mode-handoff (v0.3) → streamlined-dialogue (v0.4) evolution.

#### 2. Checklist step 9 — terminal action

```diff
- 9. **Transition to implementation** — invoke writing-plans skill to create implementation plan
+ 9. **Hand off to plan mode** — call the EnterPlanMode tool and run the implementation-plan workflow using the spec file as the primary requirements input. The user approves the resulting plan via ExitPlanMode.
```

A new step `8b. Plan-mode pre-check` was added between 8 and 9 to handle the "spark invoked while plan mode is already active" case (file writes outside the plan file are blocked in plan mode, so spark surfaces a choice instead of failing silently).

#### 3. Process-flow graphviz — terminal node

```diff
- "Invoke writing-plans skill" [shape=doublecircle];
+ "Call EnterPlanMode\n→ implementation plan workflow" [shape=doublecircle];

  ...

- "User reviews spec?" -> "Invoke writing-plans skill" [label="approved"];
+ "User reviews spec?" -> "Call EnterPlanMode\n→ implementation plan workflow" [label="approved"];
```

The dialogue nodes were also annotated with `(AskUserQuestion ...)` to make the structured-choice flow visible in the diagram.

#### 4. "Terminal state" paragraph after the flowchart

```diff
- **The terminal state is invoking writing-plans.** Do NOT invoke frontend-design, mcp-builder, or any other implementation skill. The ONLY skill you invoke after brainstorming is writing-plans.
+ **After the user approves the HTML spec, call the EnterPlanMode tool.** Do NOT write code or modify project files (other than .gitignore and the spec file itself), and do NOT invoke any other skill. EnterPlanMode hands control to Claude Code's native plan workflow; ExitPlanMode is the final user gate before any implementation begins.
```

The legacy `writing-plans` handoff is replaced by the native plan-mode tool. No skill chain — spark just calls `EnterPlanMode` and the harness takes over.

#### 5. "After the Design / Documentation" — path and commit policy

```diff
- - Write the validated design (spec) to `docs/spark/YYYY-MM-DD-<topic>-design.html`
+ - Write the validated design (spec) to `<project-root>/.spark/YYYY-MM-DD-<topic>-design.html`
    - (User preferences for spec location override this default)
- - Use elements-of-style:writing-clearly-and-concisely skill if available
- - Commit the design document to git
+ - Do not commit — `.spark/` is gitignored working state, not committed source.
```

The cross-plugin dependency on `elements-of-style:writing-clearly-and-concisely` (which doesn't exist in this distribution) was removed. The spec is now per-workspace scratchpad, not committed documentation — the new `.spark/` directory is added to the project's `.gitignore` on first write.

#### 6. Final "Implementation:" section — replaced with "Plan-mode handoff"

```diff
- **Implementation:**
-
- - Invoke the writing-plans skill to create a detailed implementation plan
- - Do NOT invoke any other skill. writing-plans is the next step.
+ **Plan-mode handoff:**
+
+ - After spec approval, call the EnterPlanMode tool with an opening message naming the spec path.
+ - Inside plan mode, treat the spec file as the primary requirements input; run the standard Phase 1-5 plan workflow.
+ - The user approves the plan via ExitPlanMode. Implementation begins only after that.
+ - Do NOT invoke any other skill (writing-plans, executing-plans, subagent-driven-development, etc.) — EnterPlanMode is the only sanctioned handoff.
+ - If the user declines the plan-mode step, report the spec path and end the turn (preserves the old terminal behavior as opt-out).
```

#### 7. Spec output path — `.spark/` (gitignored, project-local)

```diff
# in frontmatter description:
- writes a spec document to docs/superpowers/specs/ and STOPS
+ writes a single-file offline HTML spec to <project-root>/.spark/, then enters plan mode

# in checklist step 6 and Documentation section:
- docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md
+ <project-root>/.spark/YYYY-MM-DD-<topic>-design.html
```

v0.2 moved the path to `docs/spark/` and committed the specs to git. v0.3 reframes the spec as per-workspace scratchpad — the natural place is a dotfile working directory (`.spark/`), gitignored on first write. Users who want spec history can override the location or move approved specs elsewhere by hand.

#### 8. Spec output switched to offline HTML (v0.2) + visual refresh (v0.3)

v0.2 introduced `assets/spec-template.html` as the committed spec shell: standalone, printable, semantic HTML with inline CSS and no remote dependencies.

v0.3 reworked the template visually based on real-use feedback:

- Single-column layout (~1140px container) — the prior sidebar TOC swallowed screen width and the content area felt cramped.
- Section cards with a 3px accent left-border, subtle surface tint, and rounded corners — sections used to be separated only by a 1px line.
- Neutral palette (slate + indigo accent) instead of warm beige.
- Interactive `<input type="checkbox">` for Test/Acceptance Criteria, Risks, and Review Status (wrapped in `<label>` for full-row clickability). Goals/Non-goals/etc. remain plain `<ul>` since they're scope assertions, not work trackers.
- Print stylesheet updated to preserve the accent stripe on paper.

The offline single-file contract is preserved: no `<script>`, no `<link>`, no remote URLs.

The spec reviewer prompt now also flags layout regressions (sidebar TOC reappearance, warm beige palette, missing checkboxes in the tracked sections).

#### 9. Skill directory renamed

`skills/brainstorming/` → `skills/spark/`. Matches the `name:` field in the frontmatter and keeps the install path `~/.claude/skills/spark/` distinct from anyone running the original `superpowers:brainstorming`.

#### 10. AskUserQuestion adopted for structured choices (v0.3)

Clarifying questions, approach selection, and section-by-section confirmation now all flow through the `AskUserQuestion` tool when the decision reduces to 2-4 mutually-exclusive options. Plain text is reserved for genuinely open-ended prompts (free-form context, follow-up clarifications). This makes the dialogue significantly more usable in plan mode (where `AskUserQuestion` is the primary clarification surface) and clearer outside plan mode too.

#### 11. Plan-mode handoff (v0.3)

After the user approves the HTML spec, spark calls `EnterPlanMode` and the standard plan-mode workflow drafts the implementation plan. A new "Plan mode already active" branch in `SKILL.md` handles the case where spark is invoked inside an existing plan-mode session (file writes are blocked, so spark surfaces a choice between exit-and-rewrite vs. plan-inline).

#### 12. Dialogue streamlined — single confirmation (v0.4)

Real use surfaced too many mid-flow confirmation gates. v0.4 removes them so the **written spec is the single design gate**:

- **Visual-companion consent gate removed.** The companion no longer opens with a "want to try it?" message. It's now the default medium for visual questions — Claude shows mockups/comparisons in the browser by default and gives a one-line, non-blocking URL notice; the user opts out by asking for text. (`SKILL.md` "Visual Companion", `visual-companion.md` "When to Use".)
- **Section-by-section design approval removed.** Claude no longer presents the design in conversation and confirms each section with `AskUserQuestion`. It composes the complete design and writes it straight to the HTML spec, recording assumptions inline (`Assumption:`); the user corrects everything in the single spec review.
- **Clarifying questions trimmed.** Spark asks only the questions that genuinely block the design, batched into a single `AskUserQuestion` call where independent; non-blocking unknowns become explicit assumptions instead of questions.

The checklist drops from 9 steps to 6 (+5b), the process-flow graph loses the "Visual questions ahead?" and "User approves design?" branches, and the "Incremental validation" principle becomes "Single validation". The `<HARD-GATE>`, the "This Is Too Simple To Need A Design" anti-pattern, YAGNI, and the spec self-review are all preserved — only the confirmation cadence changed, not the quality bar.

### Preserved as-is

- The `<HARD-GATE>` block and the "This Is Too Simple To Need A Design" anti-pattern (the checklist itself was streamlined from 9 steps to 6 +5b in v0.4 — see #12)
- Graphviz process flow as the structural diagram (its node set was simplified in v0.4 to match the streamlined flow — see #12)
- Visual companion feature — browser-based mockup viewer in `scripts/` and `visual-companion.md` (the consent-gate offering became default-on in v0.4 — see #12)
- Spec self-review loop (placeholder scan, internal consistency, scope, ambiguity)
- Key principles YAGNI, explore alternatives, and be flexible (v0.4 replaced "one question at a time" with "ask only what blocks the design" and "incremental validation" with "single validation" — see #12)
- The subagent spec reviewer prompt template (`spec-document-reviewer-prompt.md`), updated with the v0.3 layout / checkbox checks

## License

MIT — see [LICENSE](../../LICENSE) at the repository root.
