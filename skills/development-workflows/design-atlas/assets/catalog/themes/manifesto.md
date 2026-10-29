---
version: "alpha"
name: "Manifesto"
description: "warm near-black ground, warm off-white ink, Anton capitals at poster size leaded tight over a quiet Public Sans body, hairlines, a heavy ink bar and square edges, one fighting red"
colors:
  canvas: "oklch(13% 0.01 60)"
  surface: "oklch(17% 0.011 60)"
  surface-strong: "oklch(22% 0.012 60)"
  ink: "oklch(95% 0.014 85)"
  ink-muted: "oklch(84% 0.012 80)"
  muted: "oklch(64% 0.016 65)"
  rule: "oklch(31% 0.014 60)"
  primary: "oklch(56% 0.228 28)"
  on-primary: "oklch(98.5% 0.004 90)"
  focus: "oklch(64% 0.22 28)"
typography:
  display:
    fontFamily: "\"Anton\", \"Impact\", sans-serif"
    fontWeight: 400
    letterSpacing: "0.004em"
  body:
    fontFamily: "\"Public Sans\", ui-sans-serif, system-ui, sans-serif"
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
    band: "dark"
    L: 13
    hue: 60
  display:
    class: "display-condensed"
    face: "Anton"
  accent:
    band: "warm"
    hue: 28
  posture: "committed"
  photo: "duotone paper ink con=24"
  material: "warm near-black ground, warm off-white ink, Anton capitals at poster size leaded tight over a quiet Public Sans body, hairlines, a heavy ink bar and square edges, one fighting red"
  pictured: "Manifesto, Ledge hero"
  keywords: ["manifesto", "statement", "declaration", "principles", "beliefs", "mission", "movement", "protest", "cause", "campaign", "petition", "activism", "advocacy", "rights", "values", "take a stand", "bold launch", "defiant", "punk", "record label"]
  tokens:
    color-accent-deep: "oklch(49% 0.2 28)"
    color-accent-text: "oklch(64% 0.22 28)"
    rule-bar: "4px"
    lh-tight: "0.9"
    text-display: "clamp(4.5rem, 12vw, 13rem)"
---

## Overview

A declaration printed on a dark sheet: a warm near-black ground, warm off-white ink, Anton capitals set as big as the width allows and leaded tight, a small plain Public Sans body, hairlines, one heavy ink bar, square edges and one fighting red. The force is the contrast between poster-size caps and quiet body text, and red spent sparingly; photographs print in the off-white ink, hard and close, like a pasted-up flyer. Nothing is decorated. It is not a protest-poster pastiche of stickers and torn paper, and not a dark product page with a red button.

## Colors

This is the theme's token layer. Copy the `:root` block into the project's token layer as written; the frontmatter maps the same values to roles. Values are OKLCH.

```css
:root {
  --color-paper: oklch(13% 0.01 60); --color-paper-2: oklch(17% 0.011 60); --color-paper-3: oklch(22% 0.012 60);
  --color-ink: oklch(95% 0.014 85); --color-ink-2: oklch(84% 0.012 80); --color-muted: oklch(64% 0.016 65);
  --color-rule: oklch(31% 0.014 60);
  --color-accent: oklch(56% 0.228 28); --color-accent-deep: oklch(49% 0.2 28); --color-accent-text: oklch(64% 0.22 28); --color-accent-ink: oklch(98.5% 0.004 90);
  --color-focus: oklch(64% 0.22 28);
  --font-display: "Anton", "Impact", sans-serif; --font-body: "Public Sans", ui-sans-serif, system-ui, sans-serif;
  --font-outlier: var(--font-body);
  --radius-card: 0; --radius-pill: 0; --rule-hair: 1px; --rule-bar: 4px; --shadow-card: none;
  --tracking-display: 0.004em; --display-weight: 400; --lh-tight: 0.9; --text-display: clamp(4.5rem, 12vw, 13rem);
}
```

## Typography

- **Display:** Anton 400, one weight, uppercase only, `--tracking-display`. Condensed caps take a step up: a Ledge or Corridor hero head sets at the theme's own `--text-display` (to 13rem), a statement as large as its longest line allows across the twelve columns, other heads one step over the shared scale. A head whose lines each sit in their own element and never wrap (`white-space: nowrap`, sized in `cqi`, waiver `waive 55b`) leads at `--lh-tight`; any head that can wrap leads at 1.02 (55a).
- **The red word:** one word on the whole page, inside the hero head, in `--color-accent-text` (waiver `waive 38iii`). Every other head is one colour.
- **Body:** Public Sans 400 and 600, plain, in `--color-ink-2`; a lead at 21px is the loudest it gets.
- **Labels, captions, table heads, meta, dates:** Public Sans 500 a step smaller, sentence case, untracked, `--color-muted`. No mono.

## Layout

This is the material's compositional range: what it sets well without a photograph. It is not a page structure, a section order, or a component that a page must include.

- **The record:** demands, principles or clauses as full-width rows under hairlines, each numeral in Anton at section size in the muted ink, the clause in Anton at title size, its one plain line beside it.
- **The poster line:** one date, figure or slogan in Anton across all twelve columns, as big as the line allows, with Steps or a short line beneath; the size is the argument.
- **A stacked creed:** three short lines of Anton locked at `--lh-tight`, each its own nowrap line, flush left on the sheet with nothing else beside it.
- **The pledge:** a sentence in Anton with the name blank set inside it, on the one red field, the email and its button beneath.

## Elevation & Depth

- Hairlines divide: `--rule-hair` in `--color-rule` between rows and under heads like a broadsheet; one `--rule-bar` in ink under the nav or over a record; a red rule once a page at most.
- Radius 0 and no shadow anywhere: no boxed cards, no lift. A well is a `--color-paper-2` field under a hairline.
- Bands: `--color-paper-2`, or the page's one red-inverted surface, a red field with `--color-accent-ink` type; two a page at most.
- Photographs: close and hard-lit, the thing the page argues for (a board, a tool, hands at a repair), sharp, no faces, cropped tight so the edges fall to dark. They print in the off-white ink (the `photo:` duotone), square, in a 1px `--color-rule` ring, full-bleed or not at all. A head crosses one only over its darkest third, on a `--color-paper` plate; red never touches a picture.
- Everything warm-tinted (hue 60 to 90), never neutral grey; no texture, no ornament.

## Components

- Square, ruler-drawn controls: a flat red block with `--color-accent-ink` text (`--color-accent-deep` on hover) beside a hairline block in `--color-ink-2` that inverts to red on hover. On the red field the primary turns to the ground with ink text.
- Links are ink with a 1px underline that turns `--color-accent-text` on hover; inputs are square, hairline-bordered, on `--color-paper-2`.
- Outside the red field, red stays under 5% of a screen: the red word, the primary control, the focus ring, one red rule.

## Motion

One clip reveal: the hero head wipes upward once (`clip-path: inset()`, never a soft fade) over `--dur-long` on `--ease-out`. Nothing else moves; no bounce, no parallax, no red pulsing.

## Voice

Imperative, short, declarative: fighting words, verbs over adjectives, the demand in the reader's own nouns. No hedging; state it and stand behind it.

## Do's and Don'ts

### Do

- Build sections from the treatments in Layout; they are what this material makes.
- Keep every colour, face, radius, and shadow on the tokens in Colors.

### Don't

- Never a second accent; red is the only colour.
- Never a red flood beyond the one inverted surface; red is a signal, not a background.
- Never a light ground; the sheet stays dark.
- Never ornament: no fleurons, stickers, torn edges, hard-offset shadows, or a photograph in colour or toned red.
- Never a serif, lowercase or title-case display, and never a timid head: if Anton sits under 64px at 1440 it has stopped shouting.

## Implementation Hint

```html
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Public+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

```css
body { color: var(--color-ink-2); }
h1, h2, h3 { font-weight: 400; text-transform: uppercase; line-height: 1.02; color: var(--color-ink); }
.display { line-height: var(--lh-tight); container-type: inline-size; }
.display > span { display: block; white-space: nowrap; }
.display .hot { color: var(--color-accent-text); }
.bar { border-bottom: var(--rule-bar) solid var(--color-ink); }
.btn { border: var(--rule-hair) solid transparent; background: none; border-radius: 0; padding: var(--space-sm) var(--space-lg); font-weight: 600; }
.btn--primary { background: var(--color-accent); color: var(--color-accent-ink); }
.btn--primary:hover { background: var(--color-accent-deep); }
.btn--secondary { border-color: var(--color-ink-2); color: var(--color-ink); }
.btn--secondary:hover { background: var(--color-accent); border-color: var(--color-accent); color: var(--color-accent-ink); }
.band--red { background: var(--color-accent); color: var(--color-accent-ink); }
.reveal { animation: wipe var(--dur-long) var(--ease-out) both; }
@keyframes wipe { from { clip-path: inset(100% 0 0 0); } to { clip-path: inset(0); } }
::selection { background: var(--color-accent); color: var(--color-accent-ink); }
```

## Known Gaps

- Fonts load from `fonts.googleapis.com` (see Implementation Hint). Confirm each face's license before you self-host or bundle it.
- The preview picture is not bundled. View it online: https://raw.githubusercontent.com/Nutlope/hallmark/8f6969f8922caabde9de1784959eae11ddf68073/skills/hallmark/references/themes/manifesto.jpg
- Shared tokens used here but not defined: `--dur-long`, `--ease-out`, `--space-lg`, `--space-sm`. Define them in the project's token layer.
- Where this file names `waive <gate>`, record the waiver under `## Anti-slop Waivers` in DESIGN.md (see `references/anti-slop.md`).
- Photographs are not supplied. Use the project's own.
