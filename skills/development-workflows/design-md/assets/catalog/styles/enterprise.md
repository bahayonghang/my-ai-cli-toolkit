---
name: Enterprise
colors:
  primary: "#0C5CAB"
  secondary: "#0a4a8a"
  success: "#10b981"
  warning: "#f59e0b"
  danger: "#ef4444"
  surface: "#09090b"
  text: "#fafafa"
  neutral: "#09090b"
typography:
  h1:
    fontFamily: "IBM Plex Sans"
    fontSize: 2rem
  body-md:
    fontFamily: "IBM Plex Sans"
    fontSize: 1rem
  label-caps:
    fontFamily: "IBM Plex Sans"
    fontSize: 0.75rem
  sourceScale: "12/14/16/20/24/32"
  weights: "100, 200, 300, 400, 500, 600, 700, 800, 900"
rounded:
  sm: 4px
  md: 8px
spacing:
  sm: 8px
  md: 16px
  sourceScale: "8pt baseline grid"
---

## Overview

Dark-themed cloud-platform aesthetic with modular grids, glass-like panels, and strong data hierarchy for productivity dashboards.

## Style Foundations

- **Visual style:** modern, clean, cloud-platform aesthetic (Heroku/Vercel/GitHub inspired), dark theme, subtle gradients, soft shadows, glass-like panels, rounded components
- **Typography scale:** 12/14/16/20/24/32
- **Typography fonts:** primary=IBM Plex Sans, display=IBM Plex Sans, mono=IBM Plex Sans
- **Typography weights:** 100, 200, 300, 400, 500, 600, 700, 800, 900
- **Color palette:** primary, neutral, success, warning, danger
- **Spacing scale:** 8pt baseline grid

## Colors

- **Primary (#0C5CAB):** Token from style foundations.
- **Secondary (#0a4a8a):** Token from style foundations.
- **Success (#10b981):** Token from style foundations.
- **Warning (#f59e0b):** Token from style foundations.
- **Danger (#ef4444):** Token from style foundations.
- **Surface (#09090b):** Token from style foundations.
- **Text (#fafafa):** Token from style foundations.
- **Neutral (#09090b):** Derived from the surface token for official format compatibility.

## Brand Character

Enterprise design emphasizes grids, modular components, and strong visual hierarchy to present complex data in a clear and accessible way. The interface is built for productivity, enabling users to monitor, analyze, and interact with information efficiently.

## Accessibility

WCAG 2.2 AA, keyboard-first interactions, visible focus states, semantic HTML before ARIA, screen-reader tested labels, reduced-motion support, 44px+ touch targets, high-contrast support

## Writing Tone

concise, confident, helpful, clear, friendly, professional, action-oriented, low-jargon

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
