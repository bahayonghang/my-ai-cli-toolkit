# Design System Core

Use this file when you write, extend, or check design rules: a new `DESIGN.md`, a custom token set, or component guidance. These rules apply to every catalog entry. Entry-specific tokens and Do/Don't lists come from the entry itself.

## 1. Priorities

1. Apply foundations first (tokens), then component rules, then page composition.
2. When a rule conflicts with accessibility, accessibility wins. Record the conflict in `Known Gaps`.
3. Prefer one system-wide rule over a local exception. A local exception must name the component and the reason.
4. Give a concrete default. When an alternative exists, state the trade-off in one sentence.

## 2. Authoring order

1. State the design intent in one sentence before any rule.
2. Define tokens: color roles, type scale, spacing scale, radius scale, elevation. Name each token by role (`primary`, `surface-card`, `body-md`), not by value (`blue-500`).
3. For each component, give anatomy, variants, states, and interaction behavior.
4. Give accessibility acceptance criteria that a reviewer can test.
5. Give content and tone rules with one example each.
6. List anti-patterns and migration notes for UI that does not follow the system.
7. End with a QA checklist (section 7).

## 3. Token rules

- Code must reference tokens. A raw hex value or pixel value outside the token layer is a defect, except in the token layer itself.
- Every text/background pair that a token set allows must meet WCAG 2.2 AA contrast: 4.5:1 for body text, 3:1 for text at 24px or 18.66px bold and above, 3:1 for UI component boundaries and focus indicators.
- Spacing uses the entry's scale only. Do not add an off-scale value to fix one layout; change the layout.
- When the entry names a proprietary font, use the substitute that the entry or `brand-boundary.md` names. Keep the same role (display, body, mono) and similar metrics.

## 4. Component rules

For every interactive component, define these states where they apply: default, hover, focus-visible, active/pressed, disabled, loading, error.

- Keyboard: every action is reachable with Tab/Shift+Tab and runs with Enter or Space. Focus order follows visual order.
- Focus-visible: a visible indicator with at least 3:1 contrast against adjacent colors. Never remove an outline without a replacement.
- Pointer and touch: touch targets are at least 44×44 CSS px, or the entry records a smaller size in `Known Gaps`.
- Disabled: lower emphasis, no hover change, `aria-disabled` or the native `disabled` attribute.
- Loading: keep the component size; announce the change with `aria-busy` or a live region.
- Error: color plus text or icon. Color alone is not an error signal.
- State the token for spacing, type, and color of each part. Example: "button-primary: background `{colors.primary}`, text `{colors.on-primary}`, type `{typography.button}`, height 40px".
- Cover edge cases: long labels, empty states, overflow, and right-to-left text when the product needs it.

## 5. Responsive rules

- Define breakpoints with a name, a width range, and the layout change at each range.
- Reduce columns before you scale components down.
- Navigation needs a stated collapse pattern and a stated breakpoint.
- Code blocks and data tables scroll horizontally inside their container. The page body does not scroll horizontally.

## 6. Constraint language

- "must" marks a non-negotiable rule. "should" marks a recommendation.
- Anchor every rule to a token, a threshold, or an example. An adjective alone ("clean", "bold") is not a rule.
- Pair every Do with at least one concrete Don't.
- When you add a new pattern, add a migration note for existing components.

## 7. QA checklist

Run this list in code review or after implementation:

- [ ] No raw color, font-size, radius, or spacing values outside the token layer.
- [ ] Text contrast meets section 3 for every used pair, in every theme.
- [ ] Every interactive component shows the states in section 4.
- [ ] Keyboard-only use reaches and runs every action; focus is always visible.
- [ ] Layout works at each documented breakpoint and at 320px width.
- [ ] `prefers-reduced-motion` disables non-essential animation.
- [ ] Labels are specific ("Save draft", not "OK").
- [ ] The entry's Do's and Don'ts hold on every new screen.
- [ ] No brand asset violates `brand-boundary.md`.
- [ ] `anti-slop.md` holds: `slop_check` reports 0 FAIL, every REFLEX is fixed or waived in `DESIGN.md`, and the judged checklist (section 6) is walked.

## Source

Adapted from the shared rule sections of [bergside/awesome-design-skills](https://github.com/bergside/awesome-design-skills) (MIT, Copyright (c) 2026 Bergside) and the DESIGN.md conventions of [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) (MIT, Copyright (c) 2026 VoltAgent). License texts: `assets/catalog/LICENSES/`.
