---
version: "alpha"
name: "Halftone"
description: "butter-cream stock, brown-black ink, Ultra over Chivo, three-pixel ink rules and square wells, one vermilion printed solid and through a dot screen, photographs in full colour"
colors:
  canvas: "oklch(96.2% 0.032 94)"
  surface: "oklch(92.6% 0.046 92)"
  surface-strong: "oklch(87.5% 0.058 90)"
  ink: "oklch(23% 0.040 38)"
  ink-muted: "oklch(33% 0.045 40)"
  muted: "oklch(44% 0.048 44)"
  rule: "oklch(82% 0.042 82)"
  primary: "oklch(54.5% 0.215 33)"
  on-primary: "oklch(97% 0.022 94)"
  focus: "oklch(46% 0.19 31)"
typography:
  display:
    fontFamily: "\"Ultra\", ui-serif, Georgia, serif"
    fontWeight: 400
    letterSpacing: "0.005em"
  body:
    fontFamily: "\"Chivo\", ui-sans-serif, sans-serif"
rounded:
  card: "0"
  pill: "999px"
elevation:
  card: "none"
rule:
  hair: "1px"
x-theme:
  genre: "playful"
  paper:
    band: "light"
    L: 96.2
    hue: 94
  display:
    class: "slab-serif"
    face: "Ultra"
  accent:
    band: "warm"
    hue: 33
  posture: "committed"
  photo: "natural vib=25 sat=10 con=6"
  material: "butter-cream stock, brown-black ink, Ultra over Chivo, three-pixel ink rules and square wells, one vermilion printed solid and through a dot screen, photographs in full colour"
  pictured: "Back of the Can, Settled hero"
  keywords: ["drinks", "soda", "food brand", "print shop", "zine", "magazine", "record label", "packaging", "campaign", "label", "bottle", "can", "screen print", "bold", "one colour", "retail", "craft", "loud", "fruit", "snack"]
  tokens:
    color-accent-deep: "oklch(46% 0.19 31)"
    color-dot: "var(--color-accent)"
    halftone-size: "12px"
    halftone-dot: "3px"
    radius-input: "3px"
    rule-bar: "3px"
---

## Overview

A loud one-colour print voice: butter-cream stock, brown-black ink, a fat Ultra slab for heads, Chivo for everything else, 3px ink rules and one vermilion that prints solid on controls and as a dot screen on a band or a well. Photographs are the only full colour, close and bright like a label's product shot. It feels screen-printed because there is one ink and its dots fade from solid to nothing, not because anything is drawn. It is not a comic-book pop-art page and not a pastel snack brand.

## Colors

This is the theme's token layer. Copy the `:root` block into the project's token layer as written; the frontmatter maps the same values to roles. Values are OKLCH.

```css
:root {
  --color-paper: oklch(96.2% 0.032 94); --color-paper-2: oklch(92.6% 0.046 92); --color-paper-3: oklch(87.5% 0.058 90);
  --color-ink: oklch(23% 0.040 38); --color-ink-2: oklch(33% 0.045 40); --color-muted: oklch(44% 0.048 44);
  --color-rule: oklch(82% 0.042 82);
  --color-accent: oklch(54.5% 0.215 33); --color-accent-deep: oklch(46% 0.19 31); --color-accent-ink: oklch(97% 0.022 94); --color-focus: oklch(46% 0.19 31);
  --color-dot: var(--color-accent); --halftone-size: 12px; --halftone-dot: 3px;
  --font-display: "Ultra", ui-serif, Georgia, serif; --font-body: "Chivo", ui-sans-serif, sans-serif;
  --radius-card: 0; --radius-input: 3px; --radius-pill: 999px; --rule-hair: 1px; --rule-bar: 3px;
  --shadow-card: none;
  --tracking-display: 0.005em; --display-weight: 400;
}
```

Committed: the spot carries the screen, the controls and a field band. Three stocks, stated in DESIGN.md (`halftone: cream`).

| Stock | Paper and ink | The spot |
| --- | --- | --- |
| **Cream and vermilion** (default) | the tokens above | `oklch(54.5% 0.215 33)` |
| **Lemon on black** | `oklch(19% 0.01 60)` under `oklch(96% 0.02 90)` | yellow `oklch(88% 0.17 95)` with dark ink on it |
| **Blood orange** | the colour goes into the stock: `oklch(72% 0.17 45)` under plum `oklch(24% 0.06 25)` | the plum ink is also the spot, so the dots print dark |

## Typography

- **Display:** Ultra 400, its only weight, roman, sentence case, line-height 1.08 (Ultra's descenders touch the next line any tighter), `--tracking-display`; one colour per head. Ultra's figures are its loudest letters: a number at 200px and over may print solid in the spot, tracked -0.02em, line-height 0.9 when it stands alone on its line.
- **Body:** Chivo 400, 17px, line-height 1.55, in `--color-ink-2`; Chivo 700 on controls and on the names in a label panel.
- **Labels, tags, table heads, captions:** Chivo 500 a step smaller, sentence case, untracked; the 3px rules give them authority. No mono.

## Layout

This is the material's compositional range: what it sets well without a photograph. It is not a page structure, a section order, or a component that a page must include.

- **A figure as a poster:** one real number (the calories, the size, the price) in Ultra at 240px and over, solid spot on the cream, its unit and its one line in Ultra ink at section size beside it.
- **The label as a panel:** a 3px ink rule over full-width rows, the name in Chivo 700, the value in Ultra at item size, hairlines between, the way a can's back reads; never shrunk into a box.
- **The order on the spot:** a spot band with a cream knockout head, a stepper and its running total in Ultra, the screen fading in from one edge behind the empty side.
- **A statement knocked out:** one blunt sentence in Ultra at display size, cream out of the ink or the spot, nothing else on the field but its links.

## Elevation & Depth

- Rules do the work of borders: `--rule-bar` in ink across the top of a section, a table or a list, `--rule-hair` in `--color-rule` between rows.
- A well is the one boxed surface: `--color-paper-2` inside a `--rule-bar` ink border, square, with nothing boxed inside it. No shadow anywhere.
- Radii: 3px on buttons and inputs, a full pill on a chip; wells, tags and photographs are square.
- Bands: `--color-paper-2`, a spot field with cream type knocked out of it, or `--color-ink` with cream text. Two a page at most. `--color-accent-deep` is the spot pressed: hover, the focus ring and any spot type under 24px.
- Photographs: the product and what goes into it, close and bright (a cut lemon, a knuckle of ginger, bubbles in a glass), hard daylight on a plain light ground. The page's only full colour; square, a 1px ink hairline, a caption beneath naming what is in it. The spot never tints a picture.
- The screen (`references/texture.md` § Halftone): a `--halftone-dot` dot on a `--halftone-size` cell in the spot, masked to fade from solid to nothing, on a band or a well; one screened field per section, never under or across type or a photograph.

## Components

- A spot-filled button in Chivo 700 at 3px beside a plain `--rule-bar` spot underline with no box.
- Links in ink with a spot underline; inputs at 3px, 1px ink border.
- The spot sits on controls, the screen, a field band and the focus ring; never on body type.

## Motion

State only, `--dur-short` on `--ease-out`: a button darkens one step. The screen never moves.

## Voice

The label: the fruit, the calories, the size of the can, the price of the box. Blunt, sweet and specific; never a lifestyle.

## Do's and Don'ts

### Do

- Build sections from the treatments in Layout; they are what this material makes.
- Keep every colour, face, radius, and shadow on the tokens in Colors.

### Don't

- Never a second ink; one spot does dots, buttons and fields, and a blue link on the cream is a different printer.
- Never a gradient that is not dots; a fade is a screen from solid to nothing.
- Never dots under or across type or a photograph.
- Never a synthesised bold Ultra, a soft shadow or a rounded well.
- Never spot type smaller than a section head on the cream; it prints weak, so small spot type takes the deep spot.

## Implementation Hint

```html
<link href="https://fonts.googleapis.com/css2?family=Ultra&family=Chivo:wght@400;500;700&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-weight: var(--display-weight); line-height: 1.08; }
.poster { font: 400 clamp(10rem, 22vw, 20rem)/0.9 var(--font-display); letter-spacing: -0.02em; color: var(--color-accent); font-variant-numeric: tabular-nums; }
.btn { padding: var(--space-md) var(--space-lg); border-radius: var(--radius-input); font: 700 var(--text-sm) var(--font-body); background: var(--color-accent); color: var(--color-accent-ink); }
.btn--secondary { background: none; color: var(--color-ink); padding: var(--space-md) 0 var(--space-xs); border-radius: 0; border-bottom: var(--rule-bar) solid var(--color-accent); }
.well { border: var(--rule-bar) solid var(--color-ink); background: var(--color-paper-2); }
.ruled { border-top: var(--rule-bar) solid var(--color-ink); } .ruled > * { border-bottom: var(--rule-hair) solid var(--color-rule); }
.photo { outline: var(--rule-hair) solid var(--color-ink); outline-offset: calc(-1 * var(--rule-hair)); }
.halftone { position: relative; isolation: isolate; }
.halftone::before { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: radial-gradient(var(--color-dot) var(--halftone-dot), transparent calc(var(--halftone-dot) + 0.5px)) 0 0 / var(--halftone-size) var(--halftone-size);
  mask: linear-gradient(110deg, transparent 45%, var(--color-ink) 95%); }
::selection { background: color-mix(in oklab, var(--color-accent) 30%, transparent); }
```

## Known Gaps

- Fonts load from `fonts.googleapis.com` (see Implementation Hint). Confirm each face's license before you self-host or bundle it.
- The preview picture is not bundled. View it online: https://raw.githubusercontent.com/Nutlope/hallmark/8f6969f8922caabde9de1784959eae11ddf68073/skills/hallmark/references/themes/halftone.jpg
- Shared tokens used here but not defined: `--dur-short`, `--ease-out`, `--space-lg`, `--space-md`, `--space-xs`, `--text-sm`. Define them in the project's token layer.
- Where this file names `waive <gate>`, record the waiver under `## Anti-slop Waivers` in DESIGN.md (see `references/anti-slop.md`).
- Photographs are not supplied. Use the project's own.
