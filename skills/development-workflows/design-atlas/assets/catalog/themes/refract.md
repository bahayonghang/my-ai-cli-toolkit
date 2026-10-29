---
version: "alpha"
name: "Refract"
description: "sunlit white plaster with real light falling across it, water caustics or prism dispersion rendered live, deep pool-blue ink, Funnel Display at a light weight over Funnel Sans, clear surfaces that cast tinted shadows, one water signal"
colors:
  canvas: "oklch(98.2% 0.006 95)"
  surface: "oklch(96.4% 0.006 95)"
  surface-strong: "oklch(93.6% 0.008 95)"
  ink: "oklch(23% 0.035 245)"
  ink-muted: "oklch(36% 0.035 245)"
  muted: "oklch(50% 0.025 240)"
  rule: "oklch(89.5% 0.008 230)"
  primary: "oklch(50% 0.12 234)"
  on-primary: "oklch(99% 0.003 95)"
  focus: "oklch(56% 0.14 234)"
  slot: "oklch(86% 0.05 212)"
typography:
  display:
    fontFamily: "\"Funnel Display\", ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
    letterSpacing: "-0.032em"
  body:
    fontFamily: "\"Funnel Sans\", ui-sans-serif, system-ui, sans-serif"
rounded:
  card: "22px"
  pill: "999px"
elevation:
  card: "18px 28px 48px -26px oklch(52% 0.09 220 / 0.38), 2px 3px 6px -2px oklch(40% 0.05 230 / 0.12)"
rule:
  hair: "1px"
x-theme:
  genre: "atmospheric"
  paper:
    band: "light"
    L: 98.2
    hue: 95
  display:
    class: "grotesk-sans"
    face: "Funnel Display"
  accent:
    band: "cool"
    hue: 232
  posture: "restrained"
  photo: "natural con=3 exp=4"
  material: "sunlit white plaster with real light falling across it, water caustics or prism dispersion rendered live, deep pool-blue ink, Funnel Display at a light weight over Funnel Sans, clear surfaces that cast tinted shadows, one water signal"
  pictured: "Timetable-led, Stage hero"
  keywords: ["pool", "lido", "swim", "spa", "hotel", "resort", "water", "skincare", "sunscreen", "eyewear", "glass", "optics", "light", "daylight", "architecture", "interiors", "studio", "wellness", "bathhouse", "summer", "clean", "calm", "product launch", "hardware"]
  tokens:
    color-rule-2: "oklch(93.5% 0.006 230)"
    color-accent-hi: "oklch(44% 0.12 236)"
    color-accent-soft: "oklch(94% 0.025 220)"
    color-shade: "oklch(86% 0.05 212)"
    color-shade-2: "oklch(74% 0.07 220)"
    color-light: "oklch(99.7% 0.004 95)"
    spec-1: "oklch(78% 0.15 32)"
    spec-2: "oklch(90% 0.15 105)"
    spec-3: "oklch(82% 0.13 175)"
    spec-4: "oklch(66% 0.15 270)"
    edge-light: "inset 0 1px 0 oklch(100% 0 0 / 0.9), inset 0 0 0 1px oklch(100% 0 0 / 0.55)"
    shadow-cast: "28px 40px 70px -30px oklch(60% 0.11 212 / 0.45)"
    radius-inner: "12px"
---

## Overview

White plaster in strong sun, with light doing the decorating: a net of water caustics moving across the ground, or a prism throwing a spectrum and its bright cusps over the page. Everything else is quiet: deep pool-blue ink, Funnel Display at a light weight, clear surfaces whose shadows carry a tint of the light that passed through them. It feels like a cool room on a hot afternoon. It is not a rainbow gradient, not frosted glass on a blur, not a blue tech landing page.

## Colors

This is the theme's token layer. Copy the `:root` block into the project's token layer as written; the frontmatter maps the same values to roles. Values are OKLCH.

```css
:root {
  --color-paper: oklch(98.2% 0.006 95); --color-paper-2: oklch(96.4% 0.006 95); --color-paper-3: oklch(93.6% 0.008 95);
  --color-ink: oklch(23% 0.035 245); --color-ink-2: oklch(36% 0.035 245); --color-muted: oklch(50% 0.025 240);
  --color-rule: oklch(89.5% 0.008 230); --color-rule-2: oklch(93.5% 0.006 230);
  --color-accent: oklch(50% 0.12 234); --color-accent-hi: oklch(44% 0.12 236); --color-accent-ink: oklch(99% 0.003 95); --color-accent-soft: oklch(94% 0.025 220); --color-focus: oklch(56% 0.14 234);
  --color-shade: oklch(86% 0.05 212); --color-shade-2: oklch(74% 0.07 220); --color-light: oklch(99.7% 0.004 95);
  --spec-1: oklch(78% 0.15 32); --spec-2: oklch(90% 0.15 105); --spec-3: oklch(82% 0.13 175); --spec-4: oklch(66% 0.15 270);
  --color-slot: oklch(86% 0.05 212);
  --edge-light: inset 0 1px 0 oklch(100% 0 0 / 0.9), inset 0 0 0 1px oklch(100% 0 0 / 0.55);
  --shadow-card: 18px 28px 48px -26px oklch(52% 0.09 220 / 0.38), 2px 3px 6px -2px oklch(40% 0.05 230 / 0.12);
  --shadow-cast: 28px 40px 70px -30px oklch(60% 0.11 212 / 0.45);
  --font-display: "Funnel Display", ui-sans-serif, system-ui, sans-serif; --font-body: "Funnel Sans", ui-sans-serif, system-ui, sans-serif;
  --radius-card: 22px; --radius-inner: 12px; --radius-pill: 999px; --rule-hair: 1px;
  --tracking-display: -0.032em; --display-weight: 400;
}
```

Two dials, stated in DESIGN.md (`refract: water/pool`). Two Refract pages in one run differ on both.

| Dial | Options |
| --- | --- |
| **Light** (the generated ground) | `water` (default): caustics from a surface of moving water, a bright net over an aqua shade. `glass`: sun through a glazed window, the pane edges split warm and cool and a prism's fan crossing the patch, falling over the product as well as the ground, slow as the sun |
| **Colourway** | `pool` (default) as above. `noon`: ink `oklch(20% 0.01 260)`, accent near-black, the spectrum the only colour |

## Typography

- **Display:** Funnel Display 400 (300 for a figure set at statement size), `--tracking-display`, line-height 1.02, sentence case, one colour. Heads stay calm; the light is the loud part.
- **Body:** Funnel Sans 400 at 17px, line-height 1.6, `--color-ink-2`; leads a step up in `--color-muted`.
- **Labels, table heads, times:** Funnel Sans 500 a step smaller, sentence case, `tabular-nums` on every figure. Never mono, never tracked capitals.

## Layout

This is the material's compositional range: what it sets well without a photograph. It is not a page structure, a section order, or a component that a page must include.

- **Times to book as lanes:** when the visitor picks a session, the sessions as long ruled rows, the time in display figures, a status pill at the right edge, the next open row lit by a thin band of the light behind it.
- **A figure in sun:** one number at statement size in Funnel Display 300 with the light falling across the space beside it, its unit and source in one muted line.
- **The day as light:** a strip of hours as slim bars whose height is the light or the demand, the present hour marked by an accent dot, the rest in `--color-shade`.
- **The product on the table:** the product's real screen as a clear panel lying in the light, its cast shadow tinted, one working control that moves the light itself.

## Elevation & Depth

- **The light:** one generated canvas or shader, never a photograph of a texture and never a gradient blob. In `water` the shade is `--color-shade` with the net in `--color-light` and a faint split into `--spec-*` at the brightest seams; in `glass` the ground stays paper and bands of `--spec-*` fall at a low angle with a white cusp along one edge. The light lands on the side of the hero away from the head and fades to paper under the text, so the head always sits on plain paper.
- **Clear surfaces:** panels are white at 72 to 86% over the light with `--edge-light`, never blurred; their shadow falls down and right from one sun (`--shadow-card`), tinted by the water. A second, larger cast (`--shadow-cast`) only under the one lead object on a page.
- **Rules:** hairlines in `--color-rule`, horizontal only, in tables and lists. Radius `--radius-card` on panels, `--radius-inner` inside them, pills for controls.
- **Bands:** paper and paper-2; one band may take the light again (the close or a statement), never more than two lit grounds a page.
- **Photographs:** bright, sunlit, hard shadows, water or white architecture or the product in sun; no people posing. Square corners on full-bleed, `--radius-card` inside the container. No duotone.

## Components

- Primary pill: `--color-accent` under `--color-accent-ink`, a white inset top edge, 48px; hover darkens to `--color-accent-hi`. Secondary pill: white at 80% with `--edge-light` and a hairline.
- Inputs are white wells with a hairline and `--radius-inner`; focus ring in `--color-focus`.
- The accent sits on the primary, focus, the present marker and links on hover; the spectrum lives only in the light.

## Motion

Water moves at swimming-pool speed (a full pattern change in about 12 seconds); glass drifts as the sun does, a band crossing in 60 seconds. Panels lift 2px on hover with their shadow lengthening. Light pauses off screen. Reduced motion: one still frame of the light.

## Voice

Bright and plain, a little sensory: the temperature, the hour, what the light does.

## Do's and Don'ts

### Do

- Build sections from the treatments in Layout; they are what this material makes.
- Keep every colour, face, radius, and shadow on the tokens in Colors.

### Don't

- Never a rainbow on type, a gradient button or a spectral border on more than one object.
- Never frosted glass or a backdrop blur; clear surfaces stay clear.
- Never the light under running text, and never two lit grounds in a row.
- Never a grey drop shadow; every shadow carries the light's tint and falls from one sun.

## Implementation Hint

```html
<link href="https://fonts.googleapis.com/css2?family=Funnel+Display:wght@300;400;500&family=Funnel+Sans:wght@400;500&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-family: var(--font-display); font-weight: var(--display-weight); letter-spacing: var(--tracking-display); line-height: 1.02; }
.clear { background: color-mix(in oklab, var(--color-light) 80%, transparent); border-radius: var(--radius-card); box-shadow: var(--edge-light), var(--shadow-card); }
.btn { min-height: 48px; padding: 0 var(--space-lg); border: 0; border-radius: var(--radius-pill); background: var(--color-accent); color: var(--color-accent-ink); font: 500 var(--text-md)/1 var(--font-body); box-shadow: var(--shadow-card); transition: background var(--dur-short) var(--ease-out); }
.btn:hover { background: var(--color-accent-hi); }
.btn--clear { background: color-mix(in oklab, var(--color-light) 80%, transparent); color: var(--color-ink); box-shadow: var(--edge-light), var(--shadow-card); }
.light { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; -webkit-mask-image: linear-gradient(to right, transparent 30%, var(--color-ink) 62%); mask-image: linear-gradient(to right, transparent 30%, var(--color-ink) 62%); }
```

## Known Gaps

- Fonts load from `fonts.googleapis.com` (see Implementation Hint). Confirm each face's license before you self-host or bundle it.
- The preview picture is not bundled. View it online: https://raw.githubusercontent.com/Nutlope/hallmark/8f6969f8922caabde9de1784959eae11ddf68073/skills/hallmark/references/themes/refract.jpg
- Shared tokens used here but not defined: `--dur-short`, `--ease-out`, `--space-lg`, `--text-md`. Define them in the project's token layer.
- Where this file names `waive <gate>`, record the waiver under `## Anti-slop Waivers` in DESIGN.md (see `references/anti-slop.md`).
- Photographs are not supplied. Use the project's own.
