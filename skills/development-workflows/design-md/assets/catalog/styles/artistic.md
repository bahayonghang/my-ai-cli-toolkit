---
name: Artistic
colors:
  primary: "#3B82F6"
  secondary: "#8B5CF6"
  success: "#16A34A"
  warning: "#D97706"
  danger: "#DC2626"
  surface: "#FFFFFF"
  text: "#111827"
  neutral: "#FFFFFF"
typography:
  h1:
    fontFamily: "Limelight"
    fontSize: 2.25rem
  body-md:
    fontFamily: "Limelight"
    fontSize: 1rem
  label-caps:
    fontFamily: "JetBrains Mono"
    fontSize: 0.75rem
  sourceScale: "12/14/16/18/24/30/36"
  weights: "100, 200, 300, 400, 500, 600, 700, 800, 900"
rounded:
  sm: 4px
  md: 8px
spacing:
  sm: 4px
  md: 8px
  sourceScale: "4/8/12/16/24/32"
---

## Overview

High-contrast, expressive style with creative typography and bold color choices for visually striking interfaces.

## Style Foundations

- **Visual style:** high-contrast, artistic
- **Typography scale:** 12/14/16/18/24/30/36
- **Typography fonts:** primary=Limelight, display=Limelight, mono=JetBrains Mono
- **Typography weights:** 100, 200, 300, 400, 500, 600, 700, 800, 900
- **Color palette:** primary, neutral, success, warning, danger
- **Spacing scale:** 4/8/12/16/24/32

## Colors

- **Primary (#3B82F6):** Token from style foundations.
- **Secondary (#8B5CF6):** Token from style foundations.
- **Success (#16A34A):** Token from style foundations.
- **Warning (#D97706):** Token from style foundations.
- **Danger (#DC2626):** Token from style foundations.
- **Surface (#FFFFFF):** Token from style foundations.
- **Text (#111827):** Token from style foundations.
- **Neutral (#FFFFFF):** Derived from the surface token for official format compatibility.

## Accessibility

WCAG 2.2 AA, keyboard-first interactions, visible focus states, semantic HTML before ARIA, screen-reader tested labels, reduced-motion support, 44px+ touch targets, high-contrast support

## Writing Tone

concise, confident, professional, action-oriented

## Do's and Don'ts

### Do

- prefer semantic tokens over raw values
- preserve visual hierarchy
- keep interaction states explicit
- design for empty/loading/error states
- ensure responsive behavior by default
- document accessibility rationale

### Don't

- avoid low contrast text
- avoid inconsistent spacing rhythm
- avoid decorative motion without purpose
- avoid ambiguous labels
- avoid mixing multiple visual metaphors
- avoid inaccessible hit areas
