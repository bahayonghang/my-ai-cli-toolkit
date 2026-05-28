# Spec Document Reviewer Prompt Template

Use this template when dispatching a spec document reviewer subagent.

**Purpose:** Verify the spec is complete, consistent, and ready for implementation planning.

**Dispatch after:** HTML spec document is written to `<project-root>/.spark/YYYY-MM-DD-<topic>-design.html`.

```
Task tool (general-purpose):
  description: "Review spec document"
  prompt: |
    You are a spec document reviewer. Verify this spec is complete and ready for planning.

    **Spec to review:** [SPEC_FILE_PATH]

    The spec should be a single-file offline HTML document under `<project-root>/.spark/`, normally named `YYYY-MM-DD-<topic>-design.html`. `.spark/` is gitignored working state, not committed source.

    ## What to Check

    | Category | What to Look For |
    |----------|------------------|
    | Completeness | TODOs, placeholders, "TBD", incomplete sections |
    | Consistency | Internal contradictions, conflicting requirements |
    | Clarity | Requirements ambiguous enough to cause someone to build the wrong thing |
    | Scope | Focused enough for a single plan — not covering multiple independent subsystems |
    | YAGNI | Unrequested features, over-engineering |
    | HTML contract | Single offline `.html` file, semantic structure, no remote dependencies, no unresolved template placeholders |
    | Visual structure | Single-column card layout (no sidebar nav), each section wrapped in a card with an accent left-border, neutral palette (no warm beige tokens like `#f7f3ea` / `#fffaf0` / `#ded4c3`) |
    | Interactive checklist | Test/Acceptance Criteria, Risks, and Review Status use `<ul class="checklist">` with native `<input type="checkbox">` inside `<label>`; Goals, Non-goals, and other descriptive lists remain plain `<ul>` |

    ## Calibration

    **Only flag issues that would cause real problems during implementation planning.**
    A missing section, a contradiction, or a requirement so ambiguous it could be
    interpreted two different ways — those are issues. Minor wording improvements,
    stylistic preferences, and "sections less detailed than others" are not.

    For HTML-specific checks, confirm the file has a doctype, `html lang`, charset, viewport, title, `main id="main"`, exactly one `h1`, the standard spec sections, inline CSS, no remote scripts/styles/fonts/images, no protocol-relative URLs, and no leftover template placeholders. Also confirm there is no `<nav class="toc">`, no sidebar grid (e.g., `grid-template-columns: minmax(14rem...`), and that `<input type="checkbox">` appears inside Test/Acceptance Criteria, Risks, and Review Status sections.

    Approve unless there are serious gaps that would lead to a flawed plan or the HTML spec contract is broken.

    ## Output Format

    ## Spec Review

    **Status:** Approved | Issues Found

    **Issues (if any):**
    - [Section X]: [specific issue] - [why it matters for planning]

    **Recommendations (advisory, do not block approval):**
    - [suggestions for improvement]
```

**Reviewer returns:** Status, Issues (if any), Recommendations
