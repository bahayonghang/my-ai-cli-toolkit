---
name: Basic
colors:
  primary: "#A855F7"
  secondary: "#0A1829"
  success: "#16A34A"
  warning: "#D97706"
  danger: "#DC2626"
  surface: "#FFFFFF"
  text: "#0A1829"
  neutral: "#FFFFFF"
typography:
  h1:
    fontFamily: "Oswald"
    fontSize: 3rem
  body-md:
    fontFamily: "Nunito"
    fontSize: 1rem
  label-caps:
    fontFamily: "JetBrains Mono"
    fontSize: 0.75rem
  sourceScale: "desktop-first expressive scale"
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

Print-inspired visual language for books, magazines, and reports with editorial grids and expressive typography.

## Style Foundations

- **Visual style:** modern, editorial
- **Typography scale:** desktop-first expressive scale
- **Typography fonts:** primary=Nunito, display=Oswald, mono=JetBrains Mono
- **Typography weights:** 100, 200, 300, 400, 500, 600, 700, 800, 900
- **Color palette:** primary, neutral, success, warning, danger
- **Spacing scale:** 4/8/12/16/24/32

## Colors

- **Primary (#A855F7):** Token from style foundations.
- **Secondary (#0A1829):** Token from style foundations.
- **Success (#16A34A):** Token from style foundations.
- **Warning (#D97706):** Token from style foundations.
- **Danger (#DC2626):** Token from style foundations.
- **Surface (#FFFFFF):** Token from style foundations.
- **Text (#0A1829):** Token from style foundations.
- **Neutral (#FFFFFF):** Derived from the surface token for official format compatibility.

## Brand Character

Basic design style defines the visual language of books, magazines, and reports, ranging from clean minimalism to ornate, expressive, or retro aesthetics

## Accessibility

WCAG 2.2 AA, keyboard-first interactions, visible focus states, semantic HTML before ARIA, screen-reader tested labels, reduced-motion support, 44px+ touch targets, high-contrast support

## Writing Tone

concise, confident, professional

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
