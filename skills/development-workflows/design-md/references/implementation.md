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
2. For `legacy` entries, copy values from the color and typography sections into the same structure.
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
- Use real or clearly marked placeholder content. Do not invent customers, metrics, or testimonials.
- Use the entry's imagery rules. Without real images, use neutral placeholders with correct aspect ratios.

## 5. Verify at runtime

Compile success is not visual verification. Do these checks in a running page:

1. Start the dev server or open the HTML file in a browser.
2. Take screenshots at a desktop width (about 1440px) and a mobile width (about 390px).
3. Compare with `DESIGN.md`: canvas and surface colors, primary action color, display and body fonts, radius, section spacing.
4. Tab through the page: every control receives a visible focus indicator.
5. Check contrast for text on each surface used.
6. Check one hover, one disabled, and one error state.

If you cannot run the page, report each check above that did not run. Do not report the UI as verified.

## 6. Final report

Give: the entry id, customizations made to `DESIGN.md`, files changed, token layer location, verification results with screenshot paths, and open gaps.
