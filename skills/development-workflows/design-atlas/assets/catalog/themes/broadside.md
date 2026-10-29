---
version: "alpha"
name: "Broadside"
description: "grained buff stock, near-black ink, Six Caps and Bevan wood capitals over Archivo Narrow, ink rules at one point or five, one vermilion"
colors:
  canvas: "oklch(92% 0.028 88)"
  surface: "oklch(88.5% 0.032 88)"
  surface-strong: "oklch(85% 0.036 86)"
  ink: "oklch(18% 0.01 50)"
  ink-muted: "oklch(30% 0.012 50)"
  muted: "oklch(43% 0.02 62)"
  rule: "oklch(75% 0.028 82)"
  primary: "oklch(53% 0.19 33)"
  on-primary: "oklch(95.5% 0.018 88)"
  focus: "oklch(53% 0.19 33)"
typography:
  display:
    fontFamily: "\"Six Caps\", \"Impact\", sans-serif"
    fontWeight: 400
    letterSpacing: "0.02em"
  body:
    fontFamily: "\"Archivo Narrow\", \"Arial Narrow\", ui-sans-serif, sans-serif"
  outlier:
    fontFamily: "var(--font-body)"
rounded:
  card: "0"
  pill: "0"
elevation:
  card: "none"
rule:
  hair: "1px"
x-theme:
  genre: "editorial"
  paper:
    band: "light"
    L: 92
    hue: 88
  display:
    class: "display-condensed"
    face: "Six Caps"
  accent:
    band: "warm"
    hue: 33
  posture: "committed"
  photo: "duotone ink paper con=20"
  material: "grained buff stock, near-black ink, Six Caps and Bevan wood capitals over Archivo Narrow, ink rules at one point or five, one vermilion"
  pictured: "Marquee Hero, Settled hero"
  keywords: ["auction", "sale", "market", "fair", "event", "one night", "announcement", "town", "notice", "poster", "bill", "lots", "machinery", "tools", "festival", "fete", "hammer", "date", "venue", "tickets"]
  tokens:
    font-display-2: "\"Bevan\", Georgia, serif"
    rule-bar: "5px"
    rule-frame: "3px"
    grain: "0.08"
---

## Overview

A printer's bill: grained buff stock, near-black ink, Six Caps fitted to the measure over Bevan, Archivo Narrow small print, rules at one point or five, one vermilion. It is loud because the capitals are tall and the rules heavy, never because anything is drawn; photographs print plainly in the ink, like the plate on a sale bill. Not a western pastiche, nor a soft cream editorial page.

## Colors

This is the theme's token layer. Copy the `:root` block into the project's token layer as written; the frontmatter maps the same values to roles. Values are OKLCH.

```css
:root {
  --color-paper: oklch(92% 0.028 88); --color-paper-2: oklch(88.5% 0.032 88); --color-paper-3: oklch(85% 0.036 86);
  --color-ink: oklch(18% 0.01 50); --color-ink-2: oklch(30% 0.012 50); --color-muted: oklch(43% 0.02 62);
  --color-rule: oklch(75% 0.028 82);
  --color-accent: oklch(53% 0.19 33); --color-accent-ink: oklch(95.5% 0.018 88); --color-focus: oklch(53% 0.19 33);
  --font-display: "Six Caps", "Impact", sans-serif; --font-display-2: "Bevan", Georgia, serif;
  --font-body: "Archivo Narrow", "Arial Narrow", ui-sans-serif, sans-serif;
  --font-outlier: var(--font-body);
  --radius-card: 0; --radius-pill: 0; --rule-hair: 1px; --rule-bar: 5px; --rule-frame: 3px;
  --shadow-card: none;
  --tracking-display: 0.02em; --display-weight: 400;
  --grain: 0.08;
}
```

One dial, the colourway, stated in DESIGN.md (`broadside: bill`).

| Colourway | Stock | Ink | Accent |
| --- | --- | --- | --- |
| `bill` (default) | the block above | ink | vermilion |
| `inked` | oklch(17% 0.01 60), grain screened | buff oklch(92% 0.028 88) | vermilion at oklch(63% 0.19 33); paper band dark |
| `red-bill` | the vermilion | buff oklch(95.5% 0.018 88), 5.5:1 | buff; posture drenched |

## Typography

- **Six Caps** 400, uppercase, line-height 0.88, `--tracking-display`, for the h1, big figures and fitted lines. It is fitted, not stepped: each line its own element that never wraps (`white-space: nowrap`, the 55b guard), its size set from its measured width in `cqi` so it fills its column exactly; lines stacked in one block differ in size, as type set by hand does.
- **Bevan** 400 for section heads, item titles, the wordmark and short lines of fact; uppercase, untracked, line-height 1.
- **Archivo Narrow** 400 and 600, line-height 1.5, for everything read; labels, table heads, captions and meta in its 500 a step smaller, sentence case, untracked, `--color-muted`. Figures are Six Caps, or Archivo Narrow tabular in a row.
- Three families, no outlier: one case of wood type, the gothic for scale and the slab for weight.

## Layout

This is the material's compositional range: what it sets well without a photograph. It is not a page structure, a section order, or a component that a page must include.

- A timetable as a bill: each day a column under a five-point rule, its name fitted in Six Caps to the column, the hour in Bevan, the small print under a 1pt rule; columns parted by a five-point vertical rule.
- A count or a date fitted to the full measure in Six Caps, the one vermilion line of its screen, its small print beneath.
- Particulars as rows: a Bevan label on the left, the fact in Archivo Narrow 600 on the right, hair rules between, a five-point rule over the first; a fact not yet known prints as a muted fill, never invented.
- A form on the vermilion band: buff fields with an ink keyline, the ink block as its action, the head in Bevan.

## Elevation & Depth

- Rules: `--rule-bar` in ink above a section, a table or between two columns of a bill, `--rule-hair` in ink under a running head, `--rule-hair` in `--color-rule` between rows. Nothing between one and five.
- Square corners everywhere, no shadow. A frame is a double rule, a `--rule-frame` ink border with a 1px ink keyline 3px inside it, round a well or a photograph.
- Bands: `--color-paper-2`, ink with buff type, or one vermilion band with buff type; two a page at most.
- Photographs: plain daylight documentary at eye level, the thing for sale whole and side-on, a detail at arm's length; nobody facing the lens. Printed in the ink on the stock (the `photo:` duotone), square, in the double-rule frame; type never sits on one, and a caption under it carries a fact.
- Grain, the only texture: the speck layer (`references/texture.md` § 1) at `--grain`, multiplied on buff and screened on ink, on bands, wells and photograph frames, never under running text.

## Components

- An ink-filled block in Archivo Narrow 600, untracked capitals (legal under an uppercase display), beside the same block as an unfilled double-rule frame; square, 48px, one fill a page.
- Links in ink, underlined, vermilion on hover; inputs square, 48px, a 1px ink border.
- Vermilion sets one whole display line (its own element, never part of a head) or one figure a screen, on buff or `--color-paper-2`.

## Motion

Printed, so still: a live figure updates in place, a fitted line fits once when the fonts load. No marquee, no hover growth, no reveal.

## Voice

A sale bill read aloud: the date, the place, the lot and the hour, each said once. Shouted in capitals, explained in the small print, in the words of the trade it sells to.

## Do's and Don'ts

### Do

- Build sections from the treatments in Layout; they are what this material makes.
- Keep every colour, face, radius, and shadow on the tokens in Colors.

### Don't

- Never a ragged big line; a Six Caps line that does not fill its measure is fitted or cut.
- Never a fourth face outside code: the case is Six Caps, Bevan and the narrow.
- Never a rounded corner; frames, controls and photographs are square.
- Never a second colour, in type or in a picture; photographs print in the ink.
- Never a drawn gavel, star or ornament; the capitals and the photograph are the loud things.
- Never a photograph on every fold; half the bill is type, and the type is the loud half.

## Implementation Hint

```html
<link href="https://fonts.googleapis.com/css2?family=Six+Caps&family=Bevan&family=Archivo+Narrow:wght@400;500;600&display=swap" rel="stylesheet">
```

```css
h1, .display { font-family: var(--font-display); font-weight: 400; text-transform: uppercase; line-height: 0.88; letter-spacing: var(--tracking-display); }
.fit { display: block; white-space: nowrap; }
h2, h3, .wordmark { font-family: var(--font-display-2); font-weight: 400; text-transform: uppercase; line-height: 1; letter-spacing: 0; }
.rule-bar { border-top: var(--rule-bar) solid var(--color-ink); }
.frame, .btn--frame { border: var(--rule-frame) solid var(--color-ink); box-shadow: inset 0 0 0 3px var(--color-paper), inset 0 0 0 4px var(--color-ink); }
.frame { padding: var(--space-lg); } .frame--photo { padding: var(--space-2xs); }
.btn { display: inline-flex; align-items: center; min-height: 48px; padding: 0 var(--space-xl); border: 3px solid var(--color-ink); background: var(--color-ink); color: var(--color-paper); font: 600 var(--text-sm)/1 var(--font-body); text-transform: uppercase; }
.btn--frame { background: transparent; color: var(--color-ink); }
.grained { position: relative; isolation: isolate; }
.grained::after { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: var(--grain); mix-blend-mode: multiply; } /* the speck SVG, references/texture.md § 1 */
::selection { background: color-mix(in oklab, var(--color-accent) 30%, transparent); }
```

## Known Gaps

- Fonts load from `fonts.googleapis.com` (see Implementation Hint). Confirm each face's license before you self-host or bundle it.
- The preview picture is not bundled. View it online: https://raw.githubusercontent.com/Nutlope/hallmark/8f6969f8922caabde9de1784959eae11ddf68073/skills/hallmark/references/themes/broadside.jpg
- Shared tokens used here but not defined: `--space-2xs`, `--space-lg`, `--space-xl`, `--text-sm`. Define them in the project's token layer.
- Where this file names `waive <gate>`, record the waiver under `## Anti-slop Waivers` in DESIGN.md (see `references/anti-slop.md`).
- Photographs are not supplied. Use the project's own.
