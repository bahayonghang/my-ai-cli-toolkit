# Component Layer Evidence

## Repository findings

- `skills/development-workflows/html-artifact/SKILL.md:32` defines the non-negotiable self-contained, semantic, accessible, and reviewable output contract.
- `skills/development-workflows/html-artifact/SKILL.md:73` already owns page-level template routing; the new table therefore belongs at section level and must not replace template selection.
- `skills/development-workflows/html-artifact/SKILL.md:107` has the full creation workflow, while `:126` has the existing size gate. The fast path must be an explicit eligibility branch that rejoins the validator and output-contract gates.
- `skills/development-workflows/html-artifact/SKILL.md:151` documents reusable starter primitives, including finite grids and table variants. `columns` would duplicate those primitives.
- `skills/development-workflows/html-artifact/SKILL.md:183` requires the bundled validator and Node test for skill changes; `:188` and `:196` are the natural homes for content honesty and progressive-disclosure links.
- `references/` currently contains ten page-template guides and five `*-cookbook.md` guides; planning and out-of-scope counts use those live repository totals.
- `assets/style-tokens.css` is explicitly the token source of truth and says artifacts should inline an equivalent block. Its base tokens cover typography, spacing, radius, shell sizing, and strokes; semantic theme tokens cover surfaces, text, borders, accents, shadows, and statuses.
- `assets/starter-template.html:272` defines `grid-2/3/4`; `:303` defines `table--matrix`, `table--decision`, and `table--evidence` behavior; `:320` defines `diagram-frame`. Component snippets should compose these rather than redefine them.
- `scripts/check_html_artifact.py:384` validates file structure and offline/security rules, reports warnings separately, and returns success only when errors are absent. It does not validate fragment-directory conventions, so snippet-contract review remains an explicit implementation/check step.
- `tests/check-html-artifact.test.mjs` already covers valid artifacts, offline failures, starter layout primitives, token warnings, accessibility, diagrams, and structural errors. No validator-semantic change is planned, so no test change is required unless implementation changes the checker.

## Reference findings

- `ref/repo/zhijian-skills-main/skills/html-express/SKILL.md:28` lists ten copyable components, `:53` routes information shapes to components, and `:77` forbids placeholders and fabricated data.
- The reference `assets/components/` files demonstrate the useful packaging shape: purpose comment, scoped CSS, and example markup. Their `hx-` classes and brand-specific tokens are reference-only and must not be copied into html-artifact.
- The reference `columns` component duplicates html-artifact's existing finite grids, leaving a fixed first-party set of nine components.

## Planning decisions supported by evidence

1. Keep page-level template selection and add section-level component routing beneath it.
2. Ship exactly nine named snippets; route columns to existing grid primitives.
3. Require `style-tokens.css` before snippets and do not add hardcoded token fallbacks.
4. Use only repository-verifiable facts and process text in sample markup so the demo obeys the content-honesty rule it teaches.
5. Keep the checker unchanged; validate `demo-all.html`, review fragment contracts directly, and run desktop/mobile visual checks.
6. Run `just docs-sync` after the 0.4.0 frontmatter change, then the targeted and full repository gates.
