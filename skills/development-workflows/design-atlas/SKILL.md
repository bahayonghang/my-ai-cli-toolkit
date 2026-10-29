---
name: design-atlas
description: "UI design skill with an offline catalog of 202 design languages (84 brands, 67 styles, 50 material themes, 1 business scene). Picks one for the project automatically when none is set, writes it as DESIGN.md, implements or restyles production UI from it, and checks the result against anti-AI-slop gates. Use when the user asks to build or restyle a page or component, list or compare design styles or themes, design in the style of a known product (Linear, Vercel, Stripe, Apple), use a look such as minimal, editorial, riso, newsprint, terminal, glassmorphism, 轻盈毛玻璃, or brutalism, build a BI / 经营分析 / 数据看板 workbench, create or follow DESIGN.md, or audit a page for AI slop / 自动选主题、生成 DESIGN.md、按 DESIGN.md 实施 UI、页面去 AI 模板味、审查 AI 味. Not for copy or prose de-AI rewriting (use write), HTML reports, plans, or slides (use html-artifact), screenshot or mockup recreation (use image-to-ui-skill), or backend work."
category: development-workflows
tags:
  - design-system
  - design-md
  - frontend
  - ui
  - design-tokens
  - accessibility
  - anti-ai-slop
version: 0.3.0
argument-hint: "[entry-id | style request | audit <path>]"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# design-atlas

Choose a design language for the project, write it as the project-root `DESIGN.md`, build UI that follows it, and check the UI does not read as machine-made. Formerly `design-md`.

## Scope

Use for:

- listing, searching, or comparing catalog entries (brands, styles, themes, scenes)
- picking an entry from the project's needs when nothing is specified
- writing, customizing, or replacing the project `DESIGN.md`
- implementing pages or components from `DESIGN.md`
- auditing an existing page for AI-slop tells (report only)

Route elsewhere:

- rewriting copy or prose to sound less AI-written → `write`
- report, plan, review, or mini-deck HTML → `html-artifact`
- screenshot, mockup, or reference-image recreation → `image-to-ui-skill`
- backend, data, or non-UI tasks → not this skill

## Commands

> Commands below write `<skill-dir>` as a placeholder. Substitute the literal skill directory announced when the skill loads; it is not an environment variable. The scripts self-locate their data. If `python` is not found, use `py -3`. `slop_check.mjs` needs Node 20+.

| Task | Command |
| --- | --- |
| List all entries by category | `python "<skill-dir>/scripts/design_catalog.py" list` |
| Filter | `... list --kind brand\|style\|theme\|scene` / `--category theme-editorial` / `--all` (show superseded) / `--format json` |
| Search (id, name, description, keywords, category name) | `python "<skill-dir>/scripts/design_catalog.py" search "<words>"` |
| Read one entry | `python "<skill-dir>/scripts/design_catalog.py" show theme:riso` |
| Read project signals (read-only JSON) | `python "<skill-dir>/scripts/design_catalog.py" signals --root "<project-root>"` |
| Pick entries for a request (top 3, deterministic) | `python "<skill-dir>/scripts/design_catalog.py" route --prompt "<request>" --root "<project-root>"` |
| Next three / filter / JSON | `... route --reroll 1` / `--kind theme` / `--include-brands` / `--format json` |
| Write the project `DESIGN.md` | `python "<skill-dir>/scripts/design_catalog.py" apply theme:riso --root "<project-root>"` |
| Replace an existing `DESIGN.md` (backs it up first) | add `--force` |
| Anti-slop check | `node "<skill-dir>/scripts/slop_check.mjs" <page-or-src-dir> [--design <DESIGN.md>] [--scope page\|component\|app] [--json]` |

Entry ids are `brand:<slug>`, `style:<slug>`, `theme:<slug>`, or `scene:<slug>`. A bare slug works when it is unique; `claude` and `editorial` need the prefix. Superseded entries (for example `style:riso` → `theme:riso`) still `show` and `apply`, with a note. Catalog exit codes: 0 success, 1 no search result or nothing routable, 2 bad input, 3 refused overwrite. `slop_check` exit codes: 0 no open FAIL or REFLEX, 1 open findings, 2 bad input.

## Workflow

1. **Classify the request.** List or compare only → stop after step 3 output. `audit <path>` → the Audit branch below. Build or restyle UI → continue to step 2.
2. **Check for an existing design source.** If the project root has `DESIGN.md` (any letter case), implement from it and skip to step 6. Replace it only when the user asks for a different design; then use `apply --force`, which keeps a timestamped backup.
3. **Select an entry.**
   - The user names a brand, style, theme, or scene → `show` it.
   - The user names BI, 经营分析, 数据看板, or another business scene → `route` or `list --kind scene`; the scene wins.
   - The user names a scene and also a brand or style → list those candidates and wait for a choice. Do not merge two entry bodies into one `DESIGN.md`.
   - The user asks to compare or for a few options → `route --n 3`, give one reason each, and wait.
   - Otherwise (a mood, audience, industry, or no hint) → run `signals` and `route` with the user's words, **take #1 without waiting**, then put the Picks block (chosen entry and one-line reason, 2 alternates, how to switch) at the top of the reply and continue. On `confidence: low` still take #1, say the match is weak, and list the signals used. Headless runs take #1 and do not ask. Rules and template: `references/routing.md`.
   - For a list request, print the grouped `list` output (or a filtered part) and stop.
4. **Write `DESIGN.md`.** Run `apply` with the project root. Do not hand-copy entry files; `apply` adds the provenance comment and handles overwrite protection.
5. **Customize when asked.** Edit `DESIGN.md` first, then code. Follow `references/design-md-format.md` section 4. Recheck contrast after any color change.
6. **Implement.** Follow `references/implementation.md`: detect the stack, build one token layer, build components with all states from `references/design-system-core.md`, then compose the requested pages. Hold the Anti-slop Floor below while building. A theme is a material, not a page plan: it never dictates sections or order.
7. **Verify in a running page.** Screenshots at desktop and mobile widths, keyboard focus pass, contrast check, state check. If the page cannot run, list each check that did not run; do not call the UI verified.
8. **Anti-slop check.** Follow `references/implementation.md` section 6: run `slop_check.mjs` on the page or source directory until it reports 0 FAIL; fix or waive every REFLEX in `DESIGN.md`; walk the judged checklist in `references/anti-slop.md` section 6; run the fresh-context review in `references/review-prompt.md` (mark `自检，非独立复核` when no subagent is available).
9. **Apply the brand boundary.** For every `brand:*` entry, follow `references/brand-boundary.md`: no logos, wordmarks, brand names, brand imagery, or proprietary font files in the output. `theme:*` and `scene:*` entries carry no brand assets and do not use those prohibitions unless a `brand:*` entry was also selected.

### Audit branch: `audit <path>`

Report only; change no files.

1. Run `node "<skill-dir>/scripts/slop_check.mjs" <path> --json` (`--scope component` for a component directory, `--scope app` for an app shell; `--design <file>` when `DESIGN.md` is not above `<path>`).
2. Walk the judged checklist in `references/anti-slop.md` section 6 against the source, and screenshots if a running page is available.
3. Report the summary line, findings grouped by tier (Floor, House, Reflex) with file:line and the fix, judged items that fail, waivers in force, and any rejected waiver. Offer fixes as a list the user can approve; do not apply them.

## Anti-slop Floor

Every page this skill builds must pass `references/anti-slop.md`.

- Tiers: Floor (never waived: access, correctness, honesty), House and Reflex (fix, or waive in `DESIGN.md` with evidence and a reason about this page), Finish (judged, reported).
- A `DESIGN.md` that declares a material (mono display, an eyebrow component, uppercase labels, its own gradient or Tailwind colour, a named display font) turns the matching House/Reflex finding into WAIVED automatically.
- Waivers: one line per gate under `## Anti-slop Waivers` in `DESIGN.md`: `- waive <gate> · <evidence> · <reason>`.
- The script covers the mechanical gates only; the judged checklist and the fresh-context review cover the rest.
- Never invent customers, metrics, quotes, logos, or people. Missing material gets a replaceable slot, not a made-up fact (`anti-slop.md` section 7).

## References

| File | Read when |
| --- | --- |
| `references/routing.md` | no DESIGN.md and nothing named: auto-pick, Picks block, switching, compare requests |
| `references/design-system-core.md` | writing rules, building components, QA checklist |
| `references/design-md-format.md` | reading `stitch`, `legacy`, or `theme` entries; customizing or writing `DESIGN.md` |
| `references/implementation.md` | mapping tokens to the stack, building, verifying, and the anti-slop check |
| `references/anti-slop.md` | gate tiers, waivers, judged checklist; any build or audit |
| `references/review-prompt.md` | the fresh-context review in step 8 |
| `references/texture.md` | a theme names a texture recipe |
| `references/brand-boundary.md` | any `brand:*` entry; skip it for `theme:*` and `scene:*` unless a brand was also chosen |

## Catalog

- `assets/catalog/index.json` — entries, 23 categories with Chinese and English names, upstream commits.
- `assets/catalog/{brands,styles,themes}/*.md`, `assets/catalog/scenes/<category>/*.md` — entry files.
- `assets/catalog/overlays/dedup.json` (theme dedup verdicts) and `overlays/routing.json` (routing keywords and clusters) — first-party, kept across rebuilds.
- `assets/catalog/LICENSES/` — MIT license texts of the three upstream collections (VoltAgent, Bergside, Hallmark).
- `scripts/build_catalog.py` — maintainer rebuild from upstream checkouts (`--themes-only --hallmark <dir>` for themes alone); not part of the user workflow.

## Output

Report: the Picks block or the named entry and reason, `DESIGN.md` path (and backup path if any), customizations, changed files, token layer location, runtime verification with screenshot paths, the `slop_check` summary line, waivers in force, the review verdict, and remaining gaps.
