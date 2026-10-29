# DESIGN.md Format

Use this file when you read a catalog entry, customize a project `DESIGN.md`, or write one from scratch. `DESIGN.md` is a plain Markdown design-system file in the project root. Coding agents read it to keep UI consistent. The format follows the Google Stitch DESIGN.md convention.

## 1. Three formats in the catalog

| `format` in `index.json` | Count | How to read tokens |
| --- | --- | --- |
| `stitch` | 142 | YAML frontmatter holds machine-readable tokens. The body refers to them as `{colors.primary}`, `{typography.body-md}`, `{rounded.lg}`, `{spacing.section}`, `{component.button-primary}`. |
| `theme` | 50 | `theme:*` entries from hallmark. Stitch-shaped YAML frontmatter with OKLCH color strings, an `x-theme` block, and the original `:root` CSS block under `## Colors`. See section 1.1. |
| `legacy` | 11 | No frontmatter. Brand entries keep tokens in numbered sections such as "2. Color Palette & Roles" and "3. Typography Rules". `scene:*` entries also use `legacy`. |

Upstream style entries (`style:*`) use a short stitch file: frontmatter tokens, Overview, Style Foundations, Colors, then Brand Character, Accessibility, Writing Tone, and Do's and Don'ts. A first-party style may also add Layout, Elevation & Depth, Shapes, Responsive Behavior, and Known Gaps, in that stitch order. Style entries do not define a component library; build components with `design-system-core.md` section 4 and the entry's tokens.

`scene:*` entries currently use `legacy`. They have no YAML frontmatter. For `scene:bi`, read color, type, spacing, and radius from the 「视觉设计系统」 tables. Those tokens are not in a section named "2. Color Palette & Roles".

### 1.1 `theme` entries

A theme is a **material**: paper, ink, faces, rules, radius, depth, texture, controls, motion, and voice. It is not a page structure. It sets no section order, no hero, no nav, and no component that a page must include. Its `## Layout` section lists what the material composes well (its range), not a page outline. Take structure from the project and from `design-system-core.md`.

Frontmatter roles map from the hallmark `:root` tokens:

| Frontmatter key | CSS token |
| --- | --- |
| `colors.canvas` / `surface` / `surface-strong` | `--color-paper` / `--color-paper-2` / `--color-paper-3` |
| `colors.ink` / `ink-muted` / `muted` / `rule` | `--color-ink` / `--color-ink-2` / `--color-muted` / `--color-rule` |
| `colors.primary` / `on-primary` / `focus` / `slot` | `--color-accent` / `--color-accent-ink` / `--color-focus` / `--color-slot` (when present) |
| `typography.display` / `body` / `outlier` `.fontFamily` | `--font-display` / `--font-body` / `--font-outlier` |
| `typography.display.fontWeight` / `letterSpacing` | `--display-weight` / `--tracking-display` |
| `rounded.card` / `pill`, `elevation.card`, `rule.hair` | `--radius-card` / `--radius-pill`, `--shadow-card`, `--rule-hair` |

- Color values stay as `oklch()` strings. Browsers without OKLCH support need a hex fallback; generate it in the project when that matters. The catalog does not convert values.
- `x-theme` copies the upstream header: `genre`, `paper` (`band`, `L`, `hue`), `display` (`class`, `face`), `accent` (`band`, `hue`), `posture`, `photo`, `material`, `pictured`, and `keywords`. `x-theme.tokens` keeps every other `:root` token (for example `--texture-opacity`) unchanged.
- Copy the `:root` block under `## Colors` into the project's token layer as written. Colourway tables in that section are alternates; state the chosen one in `DESIGN.md`.
- Body sections: Overview, Colors, Typography, Layout (material range), Elevation & Depth, Components, Motion, Voice, Do's and Don'ts, Implementation Hint, Known Gaps.
- Gate numbers such as `(83)` or `waive 38iii` refer to `anti-slop.md`. Record a waiver under `## Anti-slop Waivers` in `DESIGN.md`. Texture recipes are in `texture.md`.
- `Known Gaps` lists shared tokens the theme uses but does not define (`--dur-*`, `--ease-*`, `--space-*`), font sources, and the online preview picture (`preview_url` in `index.json`, not bundled).

## 2. Frontmatter keys

```yaml
---
version: alpha
name: Example
description: One paragraph that states the visual intent.
colors:
  primary: "#cc785c" # role name -> hex
  on-primary: "#ffffff"
  canvas: "#faf9f5"
typography:
  body-md:
    fontFamily: "Inter, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
rounded:
  md: 8px
  pill: 9999px
spacing:
  md: 16px
  section: 96px
components: # optional
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
---
```

- Key names are roles. Keep existing names when you customize; add new names instead of reusing an old name for a different role.
- Quote hex values.
- `components` values may reference other tokens with `{group.name}`.

## 3. Body sections (stitch order)

1. `## Overview` — intent, key characteristics.
2. `## Colors` — groups such as Brand & Accent, Surface, Text, Semantic.
3. `## Typography` — font families, hierarchy table, principles, font substitutes.
4. `## Layout` — spacing system, grid and container, whitespace rules.
5. `## Elevation & Depth` — shadow and layer rules.
6. `## Shapes` — radius scale, imagery rules.
7. `## Components` — one bold `component-key` per component with tokens.
8. `## Do's and Don'ts` — `### Do`, `### Don't`.
9. `## Responsive Behavior` — breakpoints table, touch targets, collapse strategy.
10. `## Iteration Guide` — numbered rules for future edits.
11. `## Known Gaps` — what the file does not cover, licensed fonts, unconfirmed states.

A project `DESIGN.md` may omit sections it does not need. Keep the order of the sections it has.

## 4. Customize an applied entry

Edit `DESIGN.md` itself. Then change code. Do not let code drift from the file.

1. Keep the provenance comment that `apply` wrote under the frontmatter. Add one line under it: `<!-- customized: <what changed> -->`.
2. Brand color change: replace the `primary` family (`primary`, `primary-active`, `on-primary`, related tints). Recheck contrast for every pair that uses them.
3. Font change: change `fontFamily` in every typography token of the same role. Record the substitution in `Known Gaps` when the original font is licensed.
4. Dark mode: add `-dark` surface and text tokens or a second color group, and state the switch rule in `Overview`. Recheck contrast in both themes.
5. Combining two entries: start from the entry that matches the layout and component model. Take only color or typography tokens from the second entry. Record both entry ids in the customization comment.
6. Add rules to `Do's and Don'ts` and `Iteration Guide` when the change creates a new constraint.

## 5. Write one from scratch

Use the stitch frontmatter in section 2 and the section order in section 3. Follow `design-system-core.md` sections 2 to 6. Fill `Known Gaps` with what you did not decide.

## Source

Structure observed in [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) (MIT) and [bergside/awesome-design-skills](https://github.com/bergside/awesome-design-skills) (MIT). Theme material from [Nutlope/hallmark](https://github.com/Nutlope/hallmark) (MIT). DESIGN.md concept: Google Stitch.
