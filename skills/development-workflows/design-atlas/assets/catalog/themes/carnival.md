---
version: "alpha"
name: "Carnival"
description: "tinted paper, deep warm ink, Big Shoulders Display 800 capitals set poster-large over Golos Text, 2px rules, a hard 4px ink shadow, two accents that compete as whole fields"
colors:
  canvas: "oklch(92% 0.045 50)"
  surface: "oklch(88% 0.050 45)"
  surface-strong: "oklch(82% 0.060 40)"
  ink: "oklch(18% 0.080 20)"
  ink-muted: "oklch(28% 0.060 25)"
  muted: "oklch(42% 0.050 30)"
  rule: "oklch(40% 0.21 25)"
  primary: "oklch(86% 0.18 95)"
  on-primary: "oklch(18% 0.080 20)"
  focus: "oklch(40% 0.21 25)"
typography:
  display:
    fontFamily: "\"Big Shoulders Display\", Impact, sans-serif"
    fontWeight: 800
    letterSpacing: "0.015em"
  body:
    fontFamily: "\"Golos Text\", system-ui, sans-serif"
  outlier:
    fontFamily: "var(--font-body)"
rounded:
  card: "2px"
  pill: "2px"
elevation:
  card: "4px 4px 0 var(--color-ink)"
rule:
  hair: "1px"
x-theme:
  genre: "editorial"
  paper:
    band: "light"
    L: 92
    hue: 50
  display:
    class: "display-heavy"
    face: "Big Shoulders Display"
  accent:
    band: "chromatic-yellow"
    hue: 95
  posture: "full-palette"
  photo: "natural vib=20 con=10"
  material: "tinted paper, deep warm ink, Big Shoulders Display 800 capitals set poster-large over Golos Text, 2px rules, a hard 4px ink shadow, two accents that compete as whole fields"
  pictured: "Label and Ledger, Stage hero"
  keywords: ["record label", "podcast", "comedy", "indie", "zine", "poster", "illustrator", "games", "hot sauce", "merch", "streetwear", "cassette", "vinyl", "live show", "festival", "loud", "maximalist", "scrappy"]
  tokens:
    color-accent-2: "oklch(40% 0.21 25)"
    rule-bar: "2px"
---

## Overview

A loud, screen-printed register: tinted paper, deep warm ink, Big Shoulders Display capitals over Golos Text, a hard ink shadow and two accents that compete. Every surface is a flat fill with a hard edge, like a print pinned to a wall, and photographs come close and hot, framed the same way. The loudest thing on a page is a fact in the capitals at poster size, not a picture. It is not a pastel playground, a soft-shadow app or a retro costume.

## Colors

This is the theme's token layer. Copy the `:root` block into the project's token layer as written; the frontmatter maps the same values to roles. Values are OKLCH.

```css
:root {
  --color-paper: oklch(92% 0.045 50); --color-paper-2: oklch(88% 0.050 45); --color-paper-3: oklch(82% 0.060 40);
  --color-ink: oklch(18% 0.080 20); --color-ink-2: oklch(28% 0.060 25); --color-muted: oklch(42% 0.050 30);
  --color-rule: oklch(40% 0.21 25); --color-accent: oklch(86% 0.18 95); --color-accent-2: oklch(40% 0.21 25);
  --color-accent-ink: oklch(18% 0.080 20); --color-focus: oklch(40% 0.21 25);
  --font-display: "Big Shoulders Display", Impact, sans-serif; --font-body: "Golos Text", system-ui, sans-serif;
  --font-outlier: var(--font-body);
  --radius-card: 2px; --radius-pill: 2px; --rule-hair: 1px; --rule-bar: 2px; --shadow-card: 4px 4px 0 var(--color-ink);
  --tracking-display: 0.015em; --display-weight: 800;
}
```

One dial, the drop, stated in DESIGN.md (`carnival: diner-sign`); its second accent is also the rule and focus colour. `paper-2` and `paper-3` step 4 and 10 points darker on the paper's hue, `ink-2` and `muted` lighten the ink alike, and the ink sits on every first accent.

| Drop | Pick for | Paper | Ink | Accent | Accent 2 |
| --- | --- | --- | --- | --- | --- |
| cold-snap (default) | music, winter, cassettes, vinyl | 92% 0.045 50 | 18% 0.080 20 | mustard 86% 0.18 95 | oxblood 40% 0.21 25 |
| citrus-riot | zines, skate, summer drops | 94% 0.040 85 | 20% 0.07 145 | lime 82% 0.20 130 | magenta 28% 0.28 350 |
| diner-sign | food and drink, hospitality, roadside | 95% 0.035 90 | 16% 0.04 30 | cherry 60% 0.22 25 | navy 30% 0.16 250 |
| studio-night | radio, podcasts, blue hour | 88% 0.05 25 | 20% 0.05 270 | cyan 78% 0.18 220 | plum 24% 0.18 320 |
| aqua-park | summer, pool, surf, motels | 94% 0.040 180 | 20% 0.06 200 | turquoise 72% 0.16 195 | coral 36% 0.24 35 |
| pressroom | journalism, newsletters, opinion | 89% 0.025 65 | 16% 0.02 60 | amber 78% 0.18 75 | slate 34% 0.10 240 |

## Typography

- **Display:** Big Shoulders Display 800, capitals, `--tracking-display`, line-height 1.0 where a head can wrap; a lone word on one nowrap line may run at -0.005em and 0.9. The face is narrow, so it sets a step above the scale: the hero head up to about 160px at 1440, a section head at `--text-display-s`, an item title at `--text-2xl`.
- **Body:** Golos Text 400 and 500, sentence case, full ink.
- **Labels, captions, table heads:** Golos Text 500 a step smaller, sentence case. Never mono.
- **Figures:** a fact that sells (a price, a volume, a count) sets in the display face at the hero's size, tabular, its unit beside it in the same capitals; small figures are Golos Text with `tabular-nums`.

## Layout

This is the material's compositional range: what it sets well without a photograph. It is not a page structure, a section order, or a component that a page must include.

- **Figures** on a whole accent field: three or four facts in the display capitals at poster size, each over its line in Golos, parted by 2px ink bars, the halftone in one corner of the field and never under a figure.
- **Rows** ruled with `--rule-bar` in the second accent: a question or a name in capitals at item-title size on the left, the answer in Golos at lead size on the right; a picked row inverts to ink with paper type.
- **Statements** on the second accent under paper type, the line at poster size across ten columns, one action beside it.
- **Forms** as a well on the hard shadow: options as ruled rows that invert when chosen, a live total in the capitals.

## Elevation & Depth

- Two accents that compete: one fills a surface, the other the next, never a gradient between them.
- The hard offset shadow (`--shadow-card`, zero blur) on wells, controls and photographs, never clipped by an overflow; nothing else casts depth.
- Rules: `--rule-bar` in `--color-accent-2` between sections and rows, in ink around a shadowed surface; radius 2px at most.
- Bands: a field of either accent (the second under paper text) or `--color-paper-2`; two a page at most.
- Photographs: the thing itself, close, in hard light or flash, colour pushed, one subject filling the frame: the bottle in a hand, the fruit cut open, a sleeve. A `--rule-bar` ink border on the hard shadow, like a print pinned up, free to tilt a degree or two; type never sits on one, though a flat accent block with a fact may overlap a corner.
- Texture: the halftone screen (`references/texture.md` § 2) in ink on a well or a band, never under running text or over a photograph.

## Components

- The pair: a first-accent fill beside the same block outlined in ink on paper, both on the hard shadow and in the display face's capitals, untracked.
- Links are ink, underlined in `--color-accent-2`; inputs take a `--rule-bar` ink border on paper and no shadow.
- The first accent fills the primary control, a band or a well; the second carries rules, focus, links and the other fill.

## Motion

Mostly still. Hover swaps colour and nothing else; active presses the offset to 1px; nothing lifts. The one loop a page may run is a marquee of words at 8s a cycle or slower.

## Voice

Loud, short, funny by being exact: the count, the price, the date, one joke a screen. Heads in capitals, six words or fewer, ending in a full stop; body in sentence case and the present tense, numerals over words.

## Do's and Don'ts

### Do

- Build sections from the treatments in Layout; they are what this material makes.
- Keep every colour, face, radius, and shadow on the tokens in Colors.

### Don't

- Never a soft shadow; hard offset or none.
- Never both accents inside one surface; blending kills the duo-tone read.
- Never sentence-case heads, and never loose tracking.
- Never a grey or ghost button; the secondary is the outlined ink block.
- Never a drawn mascot, flame, skull or doodle; the loud thing is photographed or set in type.

## Implementation Hint

```html
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@800&family=Golos+Text:wght@400;500&display=swap" rel="stylesheet">
```

```css
h1, h2 { font-family: var(--font-display); font-weight: 800; text-transform: uppercase; letter-spacing: var(--tracking-display); line-height: 1; }
.btn { border: var(--rule-bar) solid var(--color-ink); border-radius: var(--radius-pill); box-shadow: var(--shadow-card); padding: var(--space-sm) var(--space-lg); background: var(--color-paper); color: var(--color-ink); font: 800 var(--text-lg)/1 var(--font-display); text-transform: uppercase; }
.btn--primary, .band--a { background: var(--color-accent); color: var(--color-accent-ink); }
.btn:active { box-shadow: 1px 1px 0 var(--color-ink); }
.well, .photo { border: var(--rule-bar) solid var(--color-ink); border-radius: var(--radius-card); box-shadow: var(--shadow-card); background: var(--color-paper-2); }
.band--b { background: var(--color-accent-2); color: var(--color-paper); }
.halftone { background-image: radial-gradient(var(--color-ink) 1.5px, transparent 1.5px); background-size: 12px 12px; }
```

## Known Gaps

- Fonts load from `fonts.googleapis.com` (see Implementation Hint). Confirm each face's license before you self-host or bundle it.
- The preview picture is not bundled. View it online: https://raw.githubusercontent.com/Nutlope/hallmark/8f6969f8922caabde9de1784959eae11ddf68073/skills/hallmark/references/themes/carnival.jpg
- Shared tokens used here but not defined: `--space-lg`, `--space-sm`, `--text-2xl`, `--text-display-s`, `--text-lg`. Define them in the project's token layer.
- Where this file names `waive <gate>`, record the waiver under `## Anti-slop Waivers` in DESIGN.md (see `references/anti-slop.md`).
- Photographs are not supplied. Use the project's own.
