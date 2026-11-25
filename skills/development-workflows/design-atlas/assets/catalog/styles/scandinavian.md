---
version: alpha
name: Scandinavian
description: "Nordic functionalism for reading objects and their records. Warm paper, close-set captions and honest material colour."
colors:
  canvas: "#F5F2E9"
  surface: "#E8E5DA"
  text: "#1C302D"
  muted: "#485952"
  primary: "#1C302D"
  on-primary: "#F5F2E9"
  focus: "#8A3D24"
  control-edge: "#737970"
  series-a: "#215449"
  series-b: "#934124"
  canvas-dark: "#182521"
  surface-dark: "#283831"
  text-dark: "#EFF0E6"
  muted-dark: "#C0C6B9"
  primary-dark: "#EFF0E6"
  on-primary-dark: "#182521"
  focus-dark: "#FFA27D"
  control-edge-dark: "#929C8E"
  series-a-dark: "#9BD6BD"
  series-b-dark: "#FFA27D"
typography:
  h1:
    fontFamily: "Work Sans, Segoe UI, sans-serif"
    fontSize: "clamp(2.5rem, 5vw, 4.5rem)"
    fontWeight: 500
    lineHeight: 1.03
  body-md:
    fontFamily: "Work Sans, Segoe UI, sans-serif"
    fontSize: 1rem
    lineHeight: 1.5
  caption:
    fontFamily: "Work Sans, Segoe UI, sans-serif"
    fontSize: 0.875rem
    lineHeight: 1.45
rounded:
  sm: 2px
  md: 4px
spacing:
  related: 8px
  group: 24px
  section: 48px
---

## Overview

An object and its working notes share a sheet. Give the object room for inspection; keep its title, dimensions, labels and controls close enough to read as one record. Warm paper and spruce-black type carry the interface. Colour in the work stays intact. Follow the system's light or dark preference; keep the object's own background in either mode.

## Style Foundations

Align captions, facts and tools on a few continuous edges. A book index can use one ruled list; a material library can use a repeated grid when samples need equal space. Allow compact rows inside either. Increase the gap at a change of subject before adding a frame.

## Colors

Use canvas for the reading area and surface for an inset tool or mounting board. Keep captions opaque. Semantic series A and B can mark two data sets; pair each with a name and a distinct mark. Preserve existing product and status colours when they already have meaning. Keep paper texture inside original media; leave text surfaces flat.

## Typography

Set titles in mixed case at medium weight. Set explanations in the same family at reading size. Line up values on a common edge, with tabular figures for measurements. Keep captions close to their subject and body lines around 45–65 characters.

## Layout

On a wide sheet, give the object the larger column and align the smaller working record beside it. Use an eight-pixel gap inside a record, roughly three times that between groups. Let the asset's proportions set its frame. Keep the original crop, substrate and ink hues, including in dark mode. On a narrow screen place the title first, followed by the object and its tools.

## Accessibility

Minimum contrast ratios below use the lighter and darker opaque surfaces of each mode; values in each cell follow canvas / surface order. Check the actual background again for overlaid text or a new colour.

| Foreground role | Light canvas / surface | Dark canvas / surface |
| --- | --- | --- |
| Text and primary | 12.42 / 11.03 | 13.79 / 10.75 |
| Secondary text | 6.64 / 5.89 | 9.07 / 7.07 |
| Focus ring | 6.76 / 6.00 | 8.09 / 6.30 |
| Control edge | 3.99 / 3.54 | 5.56 / 4.33 |
| Series A | 7.72 / 6.86 | 9.62 / 7.50 |
| Series B | 6.21 / 5.51 | 8.09 / 6.30 |

Derive controls from the project's design system. Use an opaque fill change on hover and a persistent mark plus an accessible selected state on selection. Give keyboard focus a two-pixel outline with a gap. Use the primary/on-primary pair for a filled control; its light and dark ratios are 12.42 and 13.79. Keep a disabled label readable and expose the disabled state. Surface errors beside their field in words. Series labels need a shape or pattern for monochrome reproduction.

## Writing Tone

Name the object, action or material in the words people use to find it. A caption can say which plate gives the print its horizon; a switch can say which plate is visible.

## Do's and Don'ts

### Do

- Show the material at a useful scale; give its record a shared baseline.
- Put the legend next to its data. Use a verb or a named option for a control.
- Retain legible disclosures, working density and recognizable identity.

### Don't

- Tint a product photograph or an artwork to match the surrounding sheet.
- Spend a screen of whitespace between a record and the action that belongs to it.
- Add a universal primary button where reading or inspecting is the task.
