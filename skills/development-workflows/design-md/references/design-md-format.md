# DESIGN.md Format

Use this file when you read a catalog entry, customize a project `DESIGN.md`, or write one from scratch. `DESIGN.md` is a plain Markdown design-system file in the project root. Coding agents read it to keep UI consistent. The format follows the Google Stitch DESIGN.md convention.

## 1. Two formats in the catalog

| `format` in `index.json` | Count | How to read tokens                                                                                                                                                                        |
| ------------------------ | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stitch`                 | 142   | YAML frontmatter holds machine-readable tokens. The body refers to them as `{colors.primary}`, `{typography.body-md}`, `{rounded.lg}`, `{spacing.section}`, `{component.button-primary}`. |
| `legacy`                 | 10    | No frontmatter. Tokens are in numbered body sections ("2. Color Palette & Roles", "3. Typography Rules") as lists and tables. Copy them into a token layer by hand.                       |

Upstream style entries (`style:*`) use a short stitch file: frontmatter tokens, Overview, Style Foundations, Colors, then Brand Character, Accessibility, Writing Tone, and Do's and Don'ts. A first-party style may also add Layout, Elevation & Depth, Shapes, Responsive Behavior, and Known Gaps, in that stitch order. Style entries do not define a component library; build components with `design-system-core.md` section 4 and the entry's tokens.

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

Structure observed in [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) (MIT) and [bergside/awesome-design-skills](https://github.com/bergside/awesome-design-skills) (MIT). DESIGN.md concept: Google Stitch.
