---
name: design-md
description: "Pick a design language from a categorized offline catalog of 151 entries (84 brand-inspired DESIGN.md files and 67 generic styles), write it as DESIGN.md in the project root, then implement or restyle production UI from that file and verify it in a running page. Use when the user asks to list or compare design styles, build a page in the style of a known product (Linear, Vercel, Stripe, Claude, Apple), choose a look such as minimal, editorial, glassmorphism, brutalism, or retro, create or update DESIGN.md, or implement UI from an existing DESIGN.md / 列出设计风格、分类查看设计、选一个设计系统、按某品牌风格做页面、生成 DESIGN.md、在根目录创建 design.md、按 DESIGN.md 实施 UI、统一设计 token. Not for HTML reports, plans, or slide-like artifacts (use html-artifact); not for recreating a screenshot or mockup (use image-to-ui-skill); not for backend or non-UI work."
category: development-workflows
tags:
  - design-system
  - design-md
  - frontend
  - ui
  - design-tokens
  - accessibility
version: 0.1.0
argument-hint: "[entry-id-or-style-request]"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# design-md

Turn a design choice into a project-root `DESIGN.md`, then build UI that follows it.

## Scope

Use for:

- listing or searching the catalog by category
- choosing a brand-inspired or generic style for a product
- writing, customizing, or replacing the project `DESIGN.md`
- implementing pages or components from `DESIGN.md`

Route elsewhere:

- report, plan, review, or mini-deck HTML → `html-artifact`
- screenshot, mockup, or reference-image recreation → `image-to-ui-skill`
- backend, data, or non-UI tasks → not this skill

## Commands

> Commands below write `<skill-dir>` as a placeholder. Substitute the literal skill directory announced when the skill loads; it is not an environment variable. The script self-locates its catalog. If `python` is not found, use `py -3`.

| Task                                                             | Command                                                                                      |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| List all entries by category                                     | `python "<skill-dir>/scripts/design_catalog.py" list`                                        |
| Filter                                                           | `... list --kind brand` / `--kind style` / `--category style-tech-dark` / `--format json`    |
| Search (id, name, description, Chinese or English category name) | `python "<skill-dir>/scripts/design_catalog.py" search "<words>"`                            |
| Read one entry                                                   | `python "<skill-dir>/scripts/design_catalog.py" show brand:linear.app`                       |
| Write the project `DESIGN.md`                                    | `python "<skill-dir>/scripts/design_catalog.py" apply style:minimal --root "<project-root>"` |
| Replace an existing `DESIGN.md` (backs it up first)              | add `--force`                                                                                |

Entry ids are `brand:<slug>` or `style:<slug>`. A bare slug works when it is unique; `claude` exists as both kinds and needs the prefix. Exit codes: 0 success, 1 no search result, 2 bad input, 3 refused overwrite.

## Workflow

1. **Classify the request.** List-only requests stop after step 3 output. Requests to build UI continue to step 7.
2. **Check for an existing design source.** If the project root has `DESIGN.md` (any letter case), implement from it. Replace it only when the user asks for a different design; then use `apply --force`, which keeps a timestamped backup.
3. **Select an entry.**
   - The user names a brand or style → `show` it.
   - The user describes a mood, audience, or industry → `search` and `list --category`, then offer 2–3 entries with one reason each and wait for the choice.
   - The user delegates the choice → pick one, state the reason, continue.
   - For a list request, print the grouped `list` output (or a filtered part) and stop.
4. **Write `DESIGN.md`.** Run `apply` with the project root. Do not hand-copy entry files; `apply` adds the provenance comment and handles overwrite protection.
5. **Customize when asked.** Edit `DESIGN.md` first, then code. Follow `references/design-md-format.md` section 4. Recheck contrast after any color change.
6. **Implement.** Follow `references/implementation.md`: detect the stack, build one token layer, build components with all states from `references/design-system-core.md`, then compose the requested pages.
7. **Verify in a running page.** Screenshots at desktop and mobile widths, keyboard focus pass, contrast check, state check. If the page cannot run, list each check that did not run; do not call the UI verified.
8. **Apply the brand boundary.** For every `brand:*` entry, follow `references/brand-boundary.md`: no logos, wordmarks, brand names, brand imagery, or proprietary font files in the output.

## References

| File                               | Read when                                                                |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `references/design-system-core.md` | writing rules, building components, QA checklist                         |
| `references/design-md-format.md`   | reading `stitch` vs `legacy` entries, customizing or writing `DESIGN.md` |
| `references/implementation.md`     | mapping tokens to the stack, building and verifying UI                   |
| `references/brand-boundary.md`     | any `brand:*` entry                                                      |

## Catalog

- `assets/catalog/index.json` — entries, 18 categories with Chinese and English names, upstream commits.
- `assets/catalog/brands/*.md`, `assets/catalog/styles/*.md` — entry files.
- `assets/catalog/LICENSES/` — MIT license texts of both upstream collections.
- `scripts/build_catalog.py` — maintainer rebuild from upstream checkouts; not part of the user workflow.

## Output

Report: chosen entry id and reason, `DESIGN.md` path (and backup path if any), customizations, changed files, token layer location, verification results with screenshot paths, and remaining gaps.
