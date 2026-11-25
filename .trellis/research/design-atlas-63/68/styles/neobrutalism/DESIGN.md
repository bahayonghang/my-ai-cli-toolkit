---
name: Neobrutalism
colors:
  primary: "#FDC800"
  secondary: "#432DD7"
  success: "#16A34A"
  warning: "#D97706"
  danger: "#DC2626"
  surface: "#FBFBF9"
  text: "#1C293C"
  paper: "#F3E8CC"
  canvas-dark: "#1C293C"
  text-dark: "#FBFBF9"
  neutral: "#FBFBF9"
typography:
  h1:
    fontFamily: "Inter"
    fontSize: clamp(3.8rem, 7.2vw, 7rem)
  body-md:
    fontFamily: "Inter"
    fontSize: 0.9375rem
  label-caps:
    fontFamily: "JetBrains Mono"
    fontSize: 0.8125rem
  sourceScale: "13/15/17/21/27/35"
  weights: "100, 200, 300, 400, 500, 600, 700, 800, 900"
rounded:
  sm: 4px
  md: 8px
spacing:
  sm: 4px
  md: 8px
  sourceScale: "4/8/12/16/24/32"
---
<!-- design-atlas: entry=style:neobrutalism; source=https://github.com/bergside/awesome-design-skills@f631a09; license=MIT -->

<!-- customized: Tide register print mount, display scale, controls and surrounding dark surface -->

## Overview

Modern take on brutalism with bold borders, vivid accent colors, and raw, high-contrast layouts on warm surfaces.

## Style Foundations

- **Visual style:** modern, clean, high-contrast
- **Typography scale:** 13/15/17/21/27/35
- **Typography fonts:** primary=Inter, display=Inter, mono=JetBrains Mono
- **Typography weights:** 100, 200, 300, 400, 500, 600, 700, 800, 900
- **Color palette:** primary, neutral, success, warning, danger
- **Spacing scale:** 4/8/12/16/24/32

## Colors

- **Primary (#FDC800):** Token from style foundations.
- **Secondary (#432DD7):** Token from style foundations.
- **Success (#16A34A):** Token from style foundations.
- **Warning (#D97706):** Token from style foundations.
- **Danger (#DC2626):** Token from style foundations.
- **Surface (#FBFBF9):** Token from style foundations.
- **Text (#1C293C):** Token from style foundations.
- **Neutral (#FBFBF9):** Derived from the surface token for official format compatibility.

## Accessibility

WCAG 2.2 AA, keyboard-first interactions, visible focus states

## Writing Tone

concise, confident, helpful

## Do's and Don'ts

### Do

- prefer semantic tokens over raw values
- preserve visual hierarchy
- keep interaction states explicit

### Don't

- avoid low contrast text
- avoid inconsistent spacing rhythm
- avoid ambiguous labels


## Tide register composition

Start in light appearance. A yellow masthead with a registration target identifies the study. A poster-scale, heavy sans title anchors the left column. Place the plate selector immediately below the description. Set the physical sheet inside a violet mount with four registration crosses and a caption strip. On narrow screens the print follows the selector and precedes the notes.

Use the catalog text color for outlines and hard offset shadows. Keep corners square on the mount and use 4px on controls. Local Arial and Consolas substitute for Inter and JetBrains Mono. Use mono for print metadata and captions. The artwork has its own permanent cream paper token. Dark paper swaps only the surrounding canvas, rules and text.

Use native radios with a filled center for the active plate and an appearance button with a switch indicator. Selection, focus and theme changes take effect immediately with either motion preference. Keyboard arrows change the plate. Preserve the selected plate when changing appearance. Both PNGs occupy the same complete sheet rectangle.

## Print record

The print stays on its original cream substrate in each appearance. Keep the source field names Kelp, Oxide and Register. The supplied Register value is “1,000 × 740 pixels per plate”.
