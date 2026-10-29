---
version: "alpha"
name: "Dusk"
description: "a real landscape at the turn of the light behind the hero, slate below it, the product in smoked glass with a lit top edge, Wix Madefor Display at a quiet weight over Wix Madefor Text, bone wells for light surfaces, one periwinkle signal and one apricot"
colors:
  canvas: "oklch(17.5% 0.014 268)"
  surface: "oklch(21% 0.016 268)"
  surface-strong: "oklch(25% 0.017 268)"
  ink: "oklch(96% 0.006 75)"
  ink-muted: "oklch(85% 0.010 262)"
  muted: "oklch(70% 0.016 262)"
  rule: "oklch(30% 0.016 266)"
  primary: "oklch(77% 0.10 274)"
  on-primary: "oklch(19% 0.035 274)"
  focus: "oklch(80% 0.10 274)"
typography:
  display:
    fontFamily: "\"Wix Madefor Display\", ui-sans-serif, system-ui, sans-serif"
    fontWeight: 500
    letterSpacing: "-0.022em"
  body:
    fontFamily: "\"Wix Madefor Text\", ui-sans-serif, system-ui, sans-serif"
rounded:
  card: "18px"
  pill: "999px"
elevation:
  card: "0 1px 0 oklch(100% 0 0 / 0.06) inset, 0 40px 80px -32px oklch(8% 0.02 268 / 0.7)"
rule:
  hair: "1px"
x-theme:
  genre: "modern-minimal"
  paper:
    band: "dark"
    L: 17.5
    hue: 268
  display:
    class: "grotesk-sans"
    face: "Wix Madefor Display"
  accent:
    band: "cool"
    hue: 274
  posture: "committed"
  photo: "natural con=4 vib=6"
  material: "a real landscape at the turn of the light behind the hero, slate below it, the product in smoked glass with a lit top edge, Wix Madefor Display at a quiet weight over Wix Madefor Text, bone wells for light surfaces, one periwinkle signal and one apricot"
  pictured: "Narrative Workflow, Stage hero"
  keywords: ["treasury", "banking", "fintech", "payments", "reconciliation", "ledger", "accounting", "close", "month end", "audit", "balance", "cash management", "payouts", "settlement", "compliance", "controller", "bookkeeping", "finance team", "invoicing", "payroll", "overnight", "automation"]
  tokens:
    color-light: "oklch(100% 0 0)"
    color-shade: "oklch(10% 0.022 268)"
    color-accent-hi: "oklch(84% 0.085 274)"
    color-accent-deep: "oklch(44% 0.13 274)"
    color-accent-soft: "oklch(91% 0.038 274)"
    color-accent-2: "oklch(83% 0.095 62)"
    color-dusk: "oklch(70% 0.12 330)"
    color-day-ink: "oklch(22% 0.022 268)"
    color-day-muted: "oklch(38% 0.022 266)"
    color-fog: "oklch(94% 0.012 70)"
    color-well: "oklch(95.5% 0.008 75)"
    color-well-2: "oklch(92% 0.010 75)"
    color-well-ink: "oklch(21% 0.016 268)"
    color-well-muted: "oklch(47% 0.016 265)"
    color-well-rule: "oklch(87.5% 0.009 75)"
    color-card: "oklch(99.5% 0.003 75)"
    glass: "oklch(22% 0.018 268 / 0.58)"
    glass-blur: "22px"
    glass-hi: "inset 0 1px 0 oklch(100% 0 0 / 0.10), inset 0 0 0 1px oklch(100% 0 0 / 0.06)"
    radius-inner: "10px"
---

## Overview

Money software at the calm end of the day: a real photograph of land at dusk behind the hero, the head set dark on its palest part, the product beside it in smoked glass. Below, the page turns to slate and light surfaces are bone wells. It reads as expensive and unhurried, never a neon trading screen or a dashboard of tiles.

## Colors

This is the theme's token layer. Copy the `:root` block into the project's token layer as written; the frontmatter maps the same values to roles. Values are OKLCH.

```css
:root {
  --color-paper: oklch(17.5% 0.014 268); --color-paper-2: oklch(21% 0.016 268); --color-paper-3: oklch(25% 0.017 268);
  --color-ink: oklch(96% 0.006 75); --color-ink-2: oklch(85% 0.010 262); --color-muted: oklch(70% 0.016 262);
  --color-rule: oklch(30% 0.016 266); --color-light: oklch(100% 0 0); --color-shade: oklch(10% 0.022 268);
  --color-accent: oklch(77% 0.10 274); --color-accent-ink: oklch(19% 0.035 274); --color-accent-hi: oklch(84% 0.085 274);
  --color-accent-deep: oklch(44% 0.13 274); --color-accent-soft: oklch(91% 0.038 274); --color-focus: oklch(80% 0.10 274);
  --color-accent-2: oklch(83% 0.095 62); --color-dusk: oklch(70% 0.12 330);
  --color-day-ink: oklch(22% 0.022 268); --color-day-muted: oklch(38% 0.022 266); --color-fog: oklch(94% 0.012 70);
  --color-well: oklch(95.5% 0.008 75); --color-well-2: oklch(92% 0.010 75); --color-well-ink: oklch(21% 0.016 268); --color-well-muted: oklch(47% 0.016 265); --color-well-rule: oklch(87.5% 0.009 75); --color-card: oklch(99.5% 0.003 75);
  --glass: oklch(22% 0.018 268 / 0.58); --glass-blur: 22px;
  --glass-hi: inset 0 1px 0 oklch(100% 0 0 / 0.10), inset 0 0 0 1px oklch(100% 0 0 / 0.06);
  --shadow-card: 0 1px 0 oklch(100% 0 0 / 0.06) inset, 0 40px 80px -32px oklch(8% 0.02 268 / 0.7);
  --font-display: "Wix Madefor Display", ui-sans-serif, system-ui, sans-serif; --font-body: "Wix Madefor Text", ui-sans-serif, system-ui, sans-serif;
  --radius-card: 18px; --radius-inner: 10px; --radius-pill: 999px; --rule-hair: 1px;
  --tracking-display: -0.022em; --display-weight: 500;
}
```

Three dials, each stated in DESIGN.md (`dusk: fog/periwinkle-apricot/glass`); two Dusk pages in one run differ on two.

| Dial | Options |
| --- | --- |
| **Hour** (the hero photograph) | `fog` (default): a valley of fog under an apricot sky. `shore`: water at dusk, boats or a quay. `ridge`: mountain ridges in haze at first light |
| **Signals** (matched, then open) | `periwinkle-apricot` (default). `sage-apricot`: `oklch(80% 0.07 160)` as the first signal |
| **Product surface** | `glass` (default): smoked glass on slate. `well`: bone wells carry the hero product too, glass only over photographs |

## Typography

- **Display:** Wix Madefor Display 500, `--tracking-display`, line-height 1.02 to 1.1, sentence case. Heads stay modest; the photograph and the product are the loud parts.
- **Body:** Wix Madefor Text 400 and 500 at 17px, line-height 1.55; leads in `--color-ink-2` or `--color-muted`.
- **Figures:** the same faces, `tabular-nums`; cents in `--color-muted` at the same size, never raised. A figure set as a statement goes to Display 500 at 34 to 44px with its cents at 0.6em.
- **Labels, column heads, status:** Text 500 a step smaller, sentence case, `--color-muted`. Never mono, never tracked capitals.

## Layout

This is the material's compositional range: what it sets well without a photograph. It is not a page structure, a section order, or a component that a page must include.

- **A run as an account list:** accounts with a round initial, line counts in muted, a status word with its icon, balances right-aligned with muted cents; the open item closes the list as an apricot strip with its action.
- **A tour as a list beside one pane:** four jobs in a ruled list, the chosen one marked by a periwinkle dot and opened to one line, one glass pane beside it that changes with it.
- **A month as a strip of nights:** one slim rounded bar a day in periwinkle, its height the work done, a flagged day marked by an apricot dot above its bar, the open day in apricot, days still to come hatched; a ruled tally of four figures under it.
- **A hand-off in a well:** the note or message the product sends, set as the real card on bone.

## Elevation & Depth

- **The hour:** a library photograph of land at the turn of the light fills the hero, the head in `--color-day-ink` on its palest part over a fog scrim (`--color-fog` at 40 to 78%, radial, behind the text only), the product in glass on its darker side, the foot fading to `--color-paper`. A second photograph of the same hour may close the page behind the form; two at most.
- **Glass:** the product's surface, `--glass` blurred, `--glass-hi` for the lit edge, `--shadow-card`. Rows inside split on `--color-light` at 7%; inner parts sit on it at 4 to 6% with `--radius-inner`.
- **Wells:** a light surface is a bone well at 5:4 holding one white `--color-card`; the caption sits under it, a title and one muted line.
- **Slate:** every band below the hero is `--color-paper`; the nav turns to slate glass once it leaves the photograph.

## Components

- One periwinkle pill (`--color-accent` under `--color-accent-ink`, a light inset top edge); hover lifts to `--color-accent-hi` with a soft periwinkle ring. A ghost pill beside it in `--color-light` at 4%.
- An email field and its button share one pill: frosted fog over a photograph, smoked glass on slate.
- Tabs are a ruled list with a dot, never boxed segments. Switches are periwinkle when on.
- Two signals, two jobs: periwinkle is done, matched, on and focused; apricot is open, waiting or owed. Neither is ever a large fill.

## Motion

The hero photograph drifts 6% over 48 seconds; the product's rows rise in once, staggered; the open dot breathes; panes cross-fade; bars grow from their feet when seen. Reduced motion: all still.

## Voice

Calm and exact: what ran, when, what is left.

## Do's and Don'ts

### Do

- Build sections from the treatments in Layout; they are what this material makes.
- Keep every colour, face, radius, and shadow on the tokens in Colors.

### Don't

- Never a drawn or generated sky, and never text on the busy part of a photograph.
- Never a gradient button, a third signal colour or a red debit.
- Never a grid of stat tiles; figures live in rows, lists and one ruled tally.
- Never glass on glass, never a glow behind glass, never glass without its lit edge.

## Implementation Hint

```html
<link href="https://fonts.googleapis.com/css2?family=Wix+Madefor+Display:wght@400;500;600&family=Wix+Madefor+Text:wght@400;500;600&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-family: var(--font-display); font-weight: var(--display-weight); letter-spacing: var(--tracking-display); }
.num { font-variant-numeric: tabular-nums; } .num .c { color: var(--color-muted); }
.glass { background: var(--glass); border-radius: var(--radius-card); -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(1.35); backdrop-filter: blur(var(--glass-blur)) saturate(1.35); box-shadow: var(--glass-hi), var(--shadow-card); }
.btn { min-height: 48px; padding: 0 var(--space-lg); border: 0; border-radius: var(--radius-pill); background: var(--color-accent); color: var(--color-accent-ink); font: 600 0.9375rem/1 var(--font-body); box-shadow: inset 0 1px 0 color-mix(in oklab, var(--color-light) 35%, transparent); }
.btn:hover { background: var(--color-accent-hi); }
.hero__photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.hero__scrim { position: absolute; inset: 0; background: radial-gradient(ellipse 50% 58% at 20% 56%, color-mix(in oklab, var(--color-fog) 78%, transparent), transparent 78%), linear-gradient(to bottom, transparent 72%, var(--color-paper)); }
```

## Known Gaps

- Fonts load from `fonts.googleapis.com` (see Implementation Hint). Confirm each face's license before you self-host or bundle it.
- The preview picture is not bundled. View it online: https://raw.githubusercontent.com/Nutlope/hallmark/8f6969f8922caabde9de1784959eae11ddf68073/skills/hallmark/references/themes/dusk.jpg
- Shared tokens used here but not defined: `--space-lg`. Define them in the project's token layer.
- Where this file names `waive <gate>`, record the waiver under `## Anti-slop Waivers` in DESIGN.md (see `references/anti-slop.md`).
- Photographs are not supplied. Use the project's own.
