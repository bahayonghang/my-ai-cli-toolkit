# HTML Plan/Spec Reviewer Prompt Template

Use this template only when Spark's explicit HTML/visual branch writes an HTML plan or spec artifact.

Default Markdown plans do not use this prompt; review them with the Markdown self-review checklist in `SKILL.md`.

**Purpose:** Verify the optional HTML artifact is complete, consistent, offline, and aligned with the paired Markdown plan.

**Dispatch after:** An explicit HTML artifact is written to `<project-root>/.plannings/YYYY-MM-DD-<feature-slug>.html`.

```
Task tool (general-purpose):
  description: "Review Spark HTML artifact"
  prompt: |
    You are a Spark HTML artifact reviewer. Verify this optional HTML plan/spec is complete and ready for user review.

    **HTML artifact to review:** [HTML_FILE_PATH]
    **Paired Markdown plan:** [MARKDOWN_PLAN_PATH]

    The HTML artifact should exist only because the user explicitly requested HTML, browser-viewable, or visual output. It should be a single-file offline HTML document beside the Markdown plan, normally named `<project-root>/.plannings/YYYY-MM-DD-<feature-slug>.html`.

    ## What to Check

    | Category | What to Look For |
    |----------|------------------|
    | Alignment | HTML content matches the paired Markdown plan and does not introduce hidden scope |
    | Completeness | TODOs, placeholders, "TBD", incomplete sections |
    | Consistency | Internal contradictions or conflicts with the Markdown plan |
    | Clarity | Requirements ambiguous enough to cause someone to build the wrong thing |
    | Scope | Focused enough for one implementation plan or clearly phased |
    | YAGNI | Unrequested features or over-engineering |
    | HTML contract | Single offline `.html` file, semantic structure, no remote dependencies, no unresolved template placeholders |
    | Visual structure | Single-column card layout (no sidebar nav), each section wrapped in a card with an accent left-border, neutral palette (no warm beige tokens like `#f7f3ea` / `#fffaf0` / `#ded4c3`) |
    | Interactive checklist | Test/Acceptance Criteria, Risks, and Review Status use `<ul class="checklist">` with native `<input type="checkbox">` inside `<label>`; Goals, Non-goals, and other descriptive lists remain plain `<ul>` |

    ## Calibration

    Only flag issues that would cause real problems during user review or later implementation planning. A missing section, a contradiction, hidden scope, a broken offline HTML contract, or a requirement so ambiguous it could be interpreted two different ways should block approval. Minor wording preferences should be advisory.

    For HTML-specific checks, confirm the file has a doctype, `html lang`, charset, viewport, title, `main id="main"`, exactly one `h1`, inline CSS, no remote scripts/styles/fonts/images, no protocol-relative URLs, and no leftover template placeholders. Also confirm there is no `<nav class="toc">`, no sidebar grid (e.g., `grid-template-columns: minmax(14rem...`), and that `<input type="checkbox">` appears inside Test/Acceptance Criteria, Risks, and Review Status sections.

    Approve unless there are serious gaps that would lead to a flawed plan or the HTML artifact contract is broken.

    ## Output Format

    ## HTML Artifact Review

    **Status:** Approved | Issues Found

    **Issues (if any):**
    - [Section X]: [specific issue] - [why it matters]

    **Recommendations (advisory, do not block approval):**
    - [suggestions for improvement]
```

**Reviewer returns:** Status, Issues (if any), Recommendations
