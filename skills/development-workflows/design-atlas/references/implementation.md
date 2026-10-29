# Implement UI from DESIGN.md

Use this file after the project root has a `DESIGN.md`. The goal is code whose tokens, components, and layout match that file, verified in a running page.

## 1. Detect the stack

Read the project before you write code:

| Signal                                                           | Token layer to use                                                                     |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `tailwind.config.*` (Tailwind v3)                                | `theme.extend.colors`, `fontFamily`, `fontSize`, `borderRadius`, `spacing`             |
| CSS file with `@import "tailwindcss"` and `@theme` (Tailwind v4) | `@theme { --color-*: …; --font-*: …; --radius-*: …; --spacing-*: … }`                  |
| CSS Modules, plain CSS, Sass                                     | `:root { --… }` custom properties in one global file                                   |
| CSS-in-JS (styled-components, Emotion, MUI, Chakra)              | the library's theme object                                                             |
| Component library with its own tokens (shadcn/ui, Ant Design)    | map DESIGN.md roles onto the library's token names; do not run two parallel token sets |
| Native or other UI frameworks                                    | the platform's theme or style resource file                                            |

If the project already has a token layer, extend or replace it. Do not add a second one.

## 2. Build the token layer

1. Map every frontmatter token to one variable. Keep the role name: `colors.surface-card` → `--color-surface-card`.
2. For brand `legacy` entries, copy values from the color and typography sections into the same structure. For `scene:*`, do not look for "2. Color Palette & Roles". `scene:bi` keeps color, type, spacing, and radius in the 「视觉设计系统」 tables; build the token layer from that table.
3. Load fonts: use an open font that the entry names as a substitute, or a system stack. Do not download or embed a licensed brand font (see `brand-boundary.md`).
4. Add `prefers-reduced-motion` handling and a `:focus-visible` style in the same global file.
5. Check the contrast of each text/background pair that the entry's components use before you build components. Upstream pairs can fail WCAG AA: in `brand:claude`, white text on `primary` (#cc785c) is 3.28:1, below 4.5:1 for 14px button text. When a pair fails, change the token in `DESIGN.md` (for example, a darker button background or a larger, bolder label), record the change in `Known Gaps`, and then update the token layer.

Example (plain CSS):

```css
:root {
  --color-primary: #cc785c;
  --color-on-primary: #ffffff;
  --color-canvas: #faf9f5;
  --font-display: "Cormorant Garamond", Georgia, serif;
  --font-body: Inter, system-ui, sans-serif;
  --radius-md: 8px;
  --space-section: 96px;
}
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
  }
}
```

## 3. Build components

1. Start with the components the requested page needs. For brand entries, use the `## Components` section; keep the same component keys as class or component names where practical.
2. For style entries (no component section), derive buttons, inputs, cards, navigation, and badges from the tokens and `design-system-core.md` section 4.
3. Implement every state in `design-system-core.md` section 4, even when the entry documents only default and active.
4. Use only token variables in component styles.

## 4. Compose pages

- Follow the entry's Layout, Do's and Don'ts, and Responsive Behavior sections. Rhythm rules (for example, alternating light and dark bands) are part of the design.
- For `scene:bi`, the page follows the four information-architecture layers, the chart section, the table section, the accessibility section, and the delivery order in section 12. The opening 「角色与设计目标」 note is part of the design source. It is not a second skill workflow; keep following this file and `SKILL.md`. Component states still come from `design-system-core.md`.
- Use real or clearly marked placeholder content. Do not invent customers, metrics, or testimonials.
- Use the entry's imagery rules. Without real images, use neutral placeholders with correct aspect ratios.

### Anti-slop build rules

Build to `anti-slop.md` from the first line, not only at the end. The rules most often broken while composing:

- Every colour and font family lives in the token layer; components reference tokens. No pure `#fff` or `#000` in component styles.
- Name transitioned properties; animate `transform` and `opacity` only; add a `prefers-reduced-motion: reduce` block whenever anything moves.
- Every interactive element gets a visible `:focus-visible` ring, plus `:active` and disabled styles. Never remove an outline without a replacement.
- `overflow-x: clip` on `html` and `body`, never `hidden`; image grid tracks use `minmax(0, 1fr)`.
- No eyebrow line over a heading, no tracked-capital labels, no monospace labels, no middle-dot meta strings, no arrows glued to link labels, unless `DESIGN.md` declares that material (`anti-slop.md` section 4).
- No emoji icons, no drawn browser or phone chrome, no gradient text, no cards nested in cards.
- Copy names the real product, people and numbers, or a marked slot. Never invent them (`anti-slop.md` section 7).

## 5. Verify at runtime

Compile success is not visual verification. Do these checks in a running page:

1. Start the dev server or open the HTML file in a browser.
2. Take screenshots at a desktop width (about 1440px) and a mobile width (about 390px).
3. Compare with `DESIGN.md`: canvas and surface colors, primary action color, display and body fonts, radius, section spacing.
4. Tab through the page: every control receives a visible focus indicator.
5. Check contrast for text on each surface used.
6. Check one hover, one disabled, and one error state.

If you cannot run the page, report each check above that did not run. Do not report the UI as verified.

## 6. Anti-slop check

Run after section 5, on the page files and the stylesheet they load:

```bash
node "<skill-dir>/scripts/slop_check.mjs" <page-or-src-dir> [--scope page|component|app]
```

The script finds `DESIGN.md` by walking up from the first path; pass `--design <path>` to override. Exit 0 means no open FAIL or REFLEX.

1. Fix every FAIL and rerun until the count is 0. Floor findings cannot be waived.
2. Resolve every REFLEX: fix it, or add one line under `## Anti-slop Waivers` in `DESIGN.md` with evidence and a reason about this page (`anti-slop.md` section 5). A rejected waiver shows up as a NOTE; the finding stays open.
3. Walk the judged checklist in `anti-slop.md` section 6 against the screenshots from section 5. Fix what fails.
4. Run the fresh-context review in `review-prompt.md`. On `fix`, apply the fixes and repeat from step 1; on `rebuild`, return to section 4.

WARN lines are worth a look but do not block. If Node 20 or later is not available, say so in the report and walk every gate in `anti-slop.md` section 3 by hand.

## 7. Final report

Give: the entry id, customizations made to `DESIGN.md`, files changed, token layer location, verification results with screenshot paths, the `slop_check` summary line and any waivers, the review verdict (marked `自检，非独立复核` when no subagent ran it), and open gaps.
