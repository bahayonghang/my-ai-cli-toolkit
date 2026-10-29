---
version: "alpha"
name: "Darkroom"
description: "warm print-black ground, a fine light grain, fibre-white ink, hairline Sofia Sans Extra Condensed capitals over Barlow, zero radius, black-and-white photographs printed deeper than the ground, one amber safelight"
colors:
  canvas: "oklch(12.5% 0.008 55)"
  surface: "oklch(16% 0.009 55)"
  surface-strong: "oklch(20.5% 0.01 55)"
  ink: "oklch(92% 0.012 78)"
  ink-muted: "oklch(80% 0.012 75)"
  muted: "oklch(64% 0.012 65)"
  rule: "oklch(29% 0.01 55)"
  primary: "oklch(73% 0.15 58)"
  on-primary: "oklch(12.5% 0.008 55)"
  focus: "oklch(73% 0.15 58)"
typography:
  display:
    fontFamily: "\"Sofia Sans Extra Condensed\", ui-sans-serif, sans-serif"
    fontWeight: 200
    letterSpacing: "-0.005em"
  body:
    fontFamily: "\"Barlow\", ui-sans-serif, sans-serif"
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
  genre: "atmospheric"
  paper:
    band: "dark"
    L: 12.5
    hue: 55
  display:
    class: "display-condensed"
    face: "Sofia Sans Extra Condensed"
  accent:
    band: "chromatic-amber"
    hue: 58
  posture: "restrained"
  photo: "mono high=-20 shad=-12"
  material: "warm print-black ground, a fine light grain, fibre-white ink, hairline Sofia Sans Extra Condensed capitals over Barlow, zero radius, black-and-white photographs printed deeper than the ground, one amber safelight"
  pictured: "Photographic, Poster hero"
  keywords: ["photographer", "photography", "film", "analogue", "darkroom", "prints", "portfolio", "exhibition", "gallery", "edition", "commission", "cinematographer", "negative", "archive", "monochrome", "lab", "moody", "black and white", "night", "print shop", "travel", "places", "landscape", "portrait", "photo studio"]
  tokens:
    color-accent-deep: "oklch(50% 0.11 52)"
    grain: "0.07"
---

## Overview

A print room with the lights off: a warm black ground a step lighter than a print's own black, so a photograph sits on it as an object; fibre-white ink; hairline extra-condensed capitals over Barlow; one amber safelight. Photographs are black and white, printed deep and large, and the type carries the rest. It is not a film-strip costume, a moody gradient, flat screen black or a white-matted gallery.

## Colors

This is the theme's token layer. Copy the `:root` block into the project's token layer as written; the frontmatter maps the same values to roles. Values are OKLCH.

```css
:root {
  --color-paper: oklch(12.5% 0.008 55); --color-paper-2: oklch(16% 0.009 55); --color-paper-3: oklch(20.5% 0.01 55);
  --color-ink: oklch(92% 0.012 78); --color-ink-2: oklch(80% 0.012 75); --color-muted: oklch(64% 0.012 65);
  --color-rule: oklch(29% 0.01 55);
  --color-accent: oklch(73% 0.15 58); --color-accent-deep: oklch(50% 0.11 52); --color-accent-ink: oklch(12.5% 0.008 55); --color-focus: oklch(73% 0.15 58);
  --font-display: "Sofia Sans Extra Condensed", ui-sans-serif, sans-serif; --font-body: "Barlow", ui-sans-serif, sans-serif;
  --font-outlier: var(--font-body);
  --radius-card: 0; --radius-pill: 0; --rule-hair: 1px; --shadow-card: none;
  --tracking-display: -0.005em; --display-weight: 200; --grain: 0.07;
}
```

Three colourways, stated in DESIGN.md (`darkroom: amber`).

| Colourway | Ground, ink, signal |
| --- | --- |
| **amber** (default) | the tokens above |
| **red** | signal `oklch(62% 0.19 32)`, deep `oklch(44% 0.16 32)` |
| **fibre paper** | ground `oklch(95% 0.01 80)`, ink `oklch(14% 0.006 40)`, muted `oklch(46% 0.01 50)`, signal `oklch(50% 0.2 30)`, rule `oklch(80% 0.014 70)`; dark specks at 0.12 |

## Typography

- **Display:** Sofia Sans Extra Condensed in capitals, 200 on the hero, section heads and figures, 400 on an item title and a control, line-height 1.0, `--tracking-display`, roman. The hairline at scale is the look: being extra-condensed, every display step may set one step above the shared scale, and the hero head runs to poster size across eight columns.
- **Body:** Barlow 400 for prose at 17px and 1.6, so the reading text holds on the dark; Barlow 300 only at lead size and above.
- **Labels, captions, table heads:** Barlow 400 a step smaller, sentence case, untracked, in `--color-muted`; a plate number and a month are this voice. Figures are tabular. No mono.

## Layout

This is the material's compositional range: what it sets well without a photograph. It is not a page structure, a section order, or a component that a page must include.

- **Figures as an edition:** the prompt's real numbers (plates, prints of each, the run) in the 200 hairline at 12rem and over on a grained well, vertical hairlines between them, each with a muted Barlow line beneath; the size is the drama, the colour stays ink.
- **A collector's sheet:** Rows under full-width hairlines, the label in muted Barlow on the left and the value in display capitals at title size on the right: series, subject, negative, paper, edition, sizes.
- **A process as a contact strip:** Steps across the twelve columns, each stage a hairline numeral at section size over a short line (exposed, developed, printed, editioned), parted by verticals; nothing drawn.
- **A choice set as numerals:** a working picker of plates or sizes in 1px rule cells, each a display numeral at title size, the chosen one lit by the safelight, beside a plain form on the ground.

## Elevation & Depth

- Depth is lightness, never light: ground 12.5, well 16, surface 20.5. No vignette, no bloom, no shadow; a print's blacks sit below the ground, which is what makes it read as a print.
- Rules: 1px `--color-rule`, run full width between rows of a sheet and as vertical hairlines between figures; radius 0 everywhere.
- Bands: a `--color-paper-2` well, grained, for the sections that carry no picture; two a page at most, never an amber field.
- Photographs: the work. Black and white, printed deep (open highlights, full blacks, the film's grain); a subject at a distance with room around it, or close and flat. Radius 0, no frame, no mat; full-bleed or held to the columns, never thumbnail size, a caption beneath with the plate number. Type crosses a photograph only over its darkest third, on a scrim of the ground at 40 to 70%.
- Texture: the speck grain of `references/texture.md` § 1 at `--grain`, on a well; never over a photograph.

## Components

- The pair: a 1px ink-outlined secondary beside an amber-filled primary in `--color-accent-ink`, both display capitals at 400, untracked, radius 0, 48px tall.
- Links are ink, underlined in `--color-rule`; the underline turns amber on hover. Inputs: radius 0, a 1px `--color-muted` border on the ground, a steady outline on focus.
- The safelight is scarce: the one filled control, a selected plate, a caption on hover; `--color-accent-deep` is the quieter fill under ink text.

## Motion

Still as a print. A photograph may rise once from the ground over `--dur-long`, as in the tray, from a visible default; hover on a linked plate turns its number amber. Nothing else moves.

## Voice

Lab notes and a collector's sheet: series, plate, place, month, edition, paper. Exact numbers, short lines, no adjectives about light or soul.

## Do's and Don'ts

### Do

- Build sections from the treatments in Layout; they are what this material makes.
- Keep every colour, face, radius, and shadow on the tokens in Colors.

### Don't

- Never an amber wash, band, glow or amber head; the safelight lights a control or a number, never a section.
- Never a sprocket hole, a film strip, a grease-pencil ring or a drawn frame.
- Never Sofia Sans Extra Condensed above 400 for a head, and never a figure in anything but the 200.
- Never sepia, duotone or a tint on a picture, and never flat screen black under the prints.

## Implementation Hint

```html
<link href="https://fonts.googleapis.com/css2?family=Sofia+Sans+Extra+Condensed:wght@200;400&family=Barlow:wght@300;400&display=swap" rel="stylesheet">
```

```css
h1, h2, .figure { font-family: var(--font-display); font-weight: 200; text-transform: uppercase; line-height: 1; letter-spacing: var(--tracking-display); }
h3 { font-family: var(--font-display); font-weight: 400; text-transform: uppercase; line-height: 1; }
.btn { min-height: 48px; padding: 0 var(--space-lg); border: var(--rule-hair) solid var(--color-ink); border-radius: 0; background: transparent; color: var(--color-ink); font: 400 var(--text-lg)/1 var(--font-display); text-transform: uppercase; }
.btn--primary { background: var(--color-accent); border-color: var(--color-accent); color: var(--color-accent-ink); }
.well { background: var(--color-paper-2); }
.grained { position: relative; isolation: isolate; }
.grained::after { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none; opacity: var(--grain); background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 9 -4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E") 0 0 / 200px 200px; }
::selection { background: color-mix(in oklab, var(--color-accent) 35%, transparent); }
```

## Known Gaps

- Fonts load from `fonts.googleapis.com` (see Implementation Hint). Confirm each face's license before you self-host or bundle it.
- The preview picture is not bundled. View it online: https://raw.githubusercontent.com/Nutlope/hallmark/8f6969f8922caabde9de1784959eae11ddf68073/skills/hallmark/references/themes/darkroom.jpg
- Shared tokens used here but not defined: `--dur-long`, `--space-lg`, `--text-lg`. Define them in the project's token layer.
- Where this file names `waive <gate>`, record the waiver under `## Anti-slop Waivers` in DESIGN.md (see `references/anti-slop.md`).
- Photographs are not supplied. Use the project's own.
