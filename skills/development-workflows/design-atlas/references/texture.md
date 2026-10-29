# Texture and Print Artifacts

Read this file only when the chosen entry names a texture, or when a project `DESIGN.md` declares a print lineage (risograph, letterpress, newsprint, ticket stock, line printer, CRT). `theme:*` entries cite recipes here as `references/texture.md § N`.

Texture is a treatment with a budget. It is never ambience. A page gets one artifact family, its opacity is a token, it never animates, and it stays away from body text.

## The budget

These rules bind every artifact, whatever the entry says.

- **One artifact family per page.** Pick grain, halftone, misregistration, scanline, or deckle. A risograph print counts as one family: its grain and its misregistration come from the same drum. A halftone that is a photograph's own treatment belongs to the image and does not count.
- **Opacity is a token.** Declare `--texture-opacity` in the token layer. Keep it at 0.08 or less page-wide and 0.15 or less inside one card or plate. Under running body text, use 0.05 or nothing. A low-frequency wash (base frequency 0.02 or lower, such as a fibre or a paper tone) tints instead of specking and may run to 0.12 page-wide; measure contrast on the result.
- **Never animated.** No drifting grain and no pulsing dots.
- **Never interactive.** Every overlay gets `pointer-events: none` and `aria-hidden="true"`. A retro signal is atmosphere; never draw a monitor bezel or a browser window (gate 47a in `anti-slop.md`).
- **No image requests.** Use pure CSS or a data-URI SVG filter.

## 1. Grain (paper)

A speck grain:

```css
:root { --texture-opacity: 0.08; }
.grained { position: relative; isolation: isolate; }
.grained::after {
  content: ""; position: absolute; inset: 0; pointer-events: none; z-index: 1;
  background-size: 200px 200px; opacity: var(--texture-opacity);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 9 -4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");
}
```

The colour matrix turns the noise into discrete specks (alpha is the noise times nine, minus four), so the grain is visible at 1x inside the budget. Plain `feTurbulence` at these opacities is a haze nobody sees. On a dark ground the specks must be light: change the first three matrix rows to `0 0 0 0 1` so each speck is white, and keep the opacity. Apply it to one plate, one accent card, or the page at 0.08 or less.

## 2. Halftone (dot field)

A dot screen with size tokens:

```css
:root { --halftone-size: 12px; --halftone-dot: 1.5px; }
.halftone {
  background-image: radial-gradient(var(--color-ink) var(--halftone-dot), transparent var(--halftone-dot));
  background-size: var(--halftone-size) var(--halftone-size);
}
```

Use it on plate fills and section bands. Never put it under or over type. Print the dot in ink or one spot colour, never the accent at full field strength.

## 3. Misregistration (chromatic echo)

The risograph signature, usable on any print-lineage page:

```css
.misreg { position: relative; display: inline-block; isolation: isolate; }
.misreg::before, .misreg::after {
  content: attr(data-text); position: absolute; inset: 0; z-index: -1;
  white-space: nowrap; pointer-events: none;
}
.misreg::before { color: var(--color-accent); transform: translate(-2px, -2px); }
.misreg::after { color: var(--color-accent-2, var(--color-focus)); transform: translate(2px, 2px); }
```

Use it on **one focal word per page, in the hero head, and only with a recorded waiver for gate 38iii** (one coloured word inside a head). Never on every heading. Record the waiver in `DESIGN.md` under `## Anti-slop Waivers` (see `anti-slop.md`). The span is an inline block so the copies sit on the glyphs at any line-height. The copies print behind the ink, so the word keeps its colour and only the fringes show. The echo colours are the entry's spot inks (`--color-accent` and `--color-accent-2` here, or the entry's own echo tokens). Keep the offset at 1 to 3px; more reads as broken. It may settle once on load over a long duration token at most, stays static under reduced motion, and never loops.

## 4. Scanline (CRT)

For arcade and CRT materials only. The retro signal is atmosphere, never a drawn monitor bezel (gate 47a):

```css
:root { --scanline: oklch(from var(--color-ink) l c h / 0.06); }
body::after {
  content: ""; position: fixed; inset: 0; z-index: var(--z-raised);
  pointer-events: none;
  background: repeating-linear-gradient(transparent 0 2px, var(--scanline) 2px 3px);
}
```

`--scanline` is a page-local decorative token at low alpha. Define `--z-raised` in the project's token layer.

## 5. Deckle (paper edge)

For plates, tickets, and stubs on print-lineage pages:

```css
.deckled {
  box-shadow: inset 0 0 0 1px var(--color-rule);
  mask-image: radial-gradient(6px at 0 50%, transparent 97%, black);
  mask-size: 12px 24px; mask-repeat: repeat-y; mask-position: left;
}
```

One edge, on one element class per page (a ticket edge, a perforation). Never on cards in general: it is an artifact, not a border style.

## Who may use texture

An entry earns texture when its surfaces section names one. A hand-written `DESIGN.md` earns it when its lineage is print, and then it uses the one artifact that lineage used. Examples from the theme catalog: `theme:riso` (grain and misregistration), `theme:halftone` (a dot screen), `theme:pasteup` (a fibre wash), `theme:darkroom` (film grain), `theme:arcade` (scanlines).

Never add a texture the entry does not name, grain on a modern-minimal page, two artifact families on one page, or texture over everything because the page felt flat.

## Reduced motion and accessibility

Only the settle-once misregistration moves. Everything else here is identical under `prefers-reduced-motion: reduce` because nothing animates. Texture must not push text contrast below the contrast gates (40 and 41 in `anti-slop.md`): measure contrast on the textured result, not on the flat token.

## Source

Adapted from `references/texture.md` in [Nutlope/hallmark](https://github.com/Nutlope/hallmark) (MIT, Copyright (c) 2026 Hallmark contributors), commit `8f6969f`. Hallmark's CSS stamp and build-flow steps are removed; waivers use the `DESIGN.md` section described in `anti-slop.md`. License text: `assets/catalog/LICENSES/hallmark.LICENSE`.
