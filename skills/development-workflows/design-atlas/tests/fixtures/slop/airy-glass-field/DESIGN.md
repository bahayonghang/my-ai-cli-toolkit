---
version: alpha
name: 轻盈毛玻璃
description: "轻盈毛玻璃 is airy frosted glass: a light field, white paper, and two semantic colors, one for input and one for output, in a colourway picked for the project."
colors:
  field-start: "#E3F6F7"
  field-end: "#F5E6F4"
  blob-start: "#C8EDEF"
  blob-end: "#ECD3EA"
  blob-mid: "#E0E8F9"
  sheet: "rgba(255,255,255,0.62)"
  sheet-solid: "rgba(255,255,255,0.96)"
  sheet-edge: "rgba(255,255,255,0.70)"
  overlay: "rgba(255,255,255,0.82)"
  well: "rgba(36,48,58,0.04)"
  control-fill: "rgba(36,48,58,0.08)"
  control-edge: "rgba(36,48,58,0.54)"
  on-input: "#FFFFFF"
  ink: "#24303A"
  muted: "#5C6B76"
  input: "#00787F"
  input-wash: "#E5F8F9"
  output: "#8D4D8C"
  output-wash: "#FBEFFA"
  field-start-dark: "#0E1C1D"
  field-end-dark: "#241323"
  blob-start-dark: "#0F2F32"
  blob-end-dark: "#401D3F"
  blob-mid-dark: "#1A2337"
  sheet-dark: "rgba(28,37,48,0.60)"
  sheet-solid-dark: "rgba(28,37,48,0.96)"
  sheet-edge-dark: "rgba(255,255,255,0.08)"
  overlay-dark: "rgba(30,40,52,0.84)"
  well-dark: "rgba(231,237,243,0.04)"
  control-fill-dark: "rgba(231,237,243,0.08)"
  control-edge-dark: "rgba(255,255,255,0.36)"
  on-input-dark: "#1C2530"
  ink-dark: "#E7EDF3"
  muted-dark: "#A3AFBD"
  input-dark: "#32D2DD"
  input-wash-dark: "#193638"
  output-dark: "#E69DE3"
  output-wash-dark: "#3A2A39"
typography:
  display-num:
    fontFamily: 'Figtree, "PingFang SC", "Noto Sans SC", sans-serif'
    fontSize: 32px
    fontWeight: 700
    letterSpacing: -0.02em
    fontVariantNumeric: tabular-nums
  title:
    fontFamily: 'Figtree, "PingFang SC", "Noto Sans SC", sans-serif'
    fontSize: 16px
    fontWeight: 650
    letterSpacing: 0
  body:
    fontFamily: 'Figtree, "PingFang SC", "Noto Sans SC", sans-serif'
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: 0
  meta:
    fontFamily: 'Figtree, "PingFang SC", "Noto Sans SC", sans-serif'
    fontSize: 12px
    fontWeight: 400
    letterSpacing: 0
rounded:
  check: 4px
  control: 12px
  image: 12px
  well: 16px
  sheet: 20px
  pill: 999px
spacing:
  min: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
material:
  field-angle: 160deg
  blob-opacity: 0.70
  blob-fade: 70%
  blob-max: 3
  overlay-blur: 20px
  overlay-blur-min: 16px
  overlay-blur-max: 24px
  overlay-saturate: 1.15
  backdrop-max: 6
elevation:
  sheet-highlight: "inset 0 1px 0 rgba(255,255,255,0.55)"
  sheet-shadow: "0 12px 40px -16px rgba(30,60,90,0.14)"
  overlay-highlight: "inset 0 1px 0 rgba(255,255,255,0.65)"
  overlay-shadow: "0 24px 64px -24px rgba(30,60,90,0.22)"
  sheet-highlight-dark: "inset 0 1px 0 rgba(255,255,255,0.06)"
  sheet-shadow-dark: "0 12px 40px -16px rgba(0,0,0,0.45)"
  overlay-highlight-dark: "inset 0 1px 0 rgba(255,255,255,0.08)"
  overlay-shadow-dark: "0 24px 64px -24px rgba(0,0,0,0.60)"
motion:
  press-scale: 0.98
  press-duration: 120ms
---
<!-- design-atlas: entry=style:airy-glass; source=first-party; license=MIT -->
<!-- palette: hue:202; reason: explicit --palette hue:202 -->

## Overview

轻盈毛玻璃 is airy frosted glass for a workbench, and it holds with no blur at all. It has four layers: the field, paper, wells, and overlays. The field is bright, low-chroma air: a gradient from `{colors.field-start}` to `{colors.field-end}`, with up to three soft blobs on it. Translucent white paper floats on the field, and the field shows between the papers and at the window edge. Read status, then the number, then the action. There is no marketing hero.

语义色只有两个. `{colors.input}` means input or completion. `{colors.output}` means output. Text sits on paper or on a well. `{colors.ink}` may also sit directly on the field, for example as a page title.

Blur is not the material. Paper, wells, and the field never blur. This file does not define a component library. Do not import the glassmorphism palette, fonts, or radii.

The file carries two groups, light and dark. The sections below describe the light group, and Dark Group describes the dark one. A token whose name ends in `-dark` replaces the token of the same name without the suffix. Follow the system appearance, and let an explicit choice by the user win over it.

## Colourway

The colourway is a dial. `apply` sets it from the project: an accent token the project already has, then the project content, then the default. The roles, the material, and the contrast gates are the same in every colourway. Only the hex values below change: nine in the light group and nine in the dark group.

<!-- palette:begin colourway -->
Colourway: `hue:202` (derived: input hue 202, output hue 328).

- Field: `#E3F6F7` to `#F5E6F4`.
- Blobs: `#C8EDEF`, `#ECD3EA`, `#E0E8F9`, each at opacity 0.70.
- Input: `#00787F` on `#E5F8F9`.
- Output: `#8D4D8C` on `#FBEFFA`.
- Other colourways: `mint`, `sky`, `apricot`, `slate`, or `hue:<0-359>`.
<!-- palette:end colourway -->

<!-- palette:begin colourway-dark -->
Dark group of `hue:202`.

- Field: `#0E1C1D` to `#241323`.
- Blobs: `#0F2F32`, `#401D3F`, `#1A2337`, each at opacity 0.70.
- Input: `#32D2DD` on `#193638`.
- Output: `#E69DE3` on `#3A2A39`.
<!-- palette:end colourway-dark -->

To switch, rerun `apply --force --palette <preset|hue:N>`. It rewrites both groups together. Do not edit one hex by hand. The contrast tables under Accessibility are measured for this colourway only.

## Colors

Field, the bottom layer:

- `{colors.field-start}` (`#E3F6F7`) to `{colors.field-end}` (`#F5E6F4`), about 160deg. Both ends stay low-chroma (OKLCH C at most 0.03) in every colourway.
- At most 3 blobs: `{colors.blob-start}` (`#C8EDEF`), `{colors.blob-end}` (`#ECD3EA`), and `{colors.blob-mid}` (`#E0E8F9`), each at opacity 0.70 (`{material.blob-opacity}`).
- A blob is a radial falloff: its color at the center, transparent at 70% of the radius (`{material.blob-fade}`). Draw the falloff as a radial gradient, or as an image of one where the stack has no radial gradient. Do not use a blur filter for it.
- Put `{colors.blob-start}` near the corner where the field starts, `{colors.blob-end}` near the corner where it ends, and `{colors.blob-mid}` near a third corner. Each blob is about a third to a half of the window wide.

Paper, for the sidebar and for cards. Paper does not blur:

- Fill `{colors.sheet}` (`rgba(255,255,255,0.62)`).
- 1px edge `{colors.sheet-edge}` (`rgba(255,255,255,0.70)`). This is a light edge, not an opaque fence, and not a control boundary.
- A 1px highlight along the top, inside the edge: `{elevation.sheet-highlight}`.
- One soft shadow with a negative spread: `{elevation.sheet-shadow}`.

Paper and the field have almost the same lightness. The Accessibility table reports the ratio. The layers separate through the blobs that show between the papers, the white edge, the highlight, and the shadow. They do not separate through a lighter or darker fill.

Wells are flat fills inside paper. A well does not blur and has no gray outline:

- `{colors.input-wash}` (`#E5F8F9`) is the input and completion well.
- `{colors.output-wash}` (`#FBEFFA`) is the output well.
- `{colors.well}` (`rgba(36,48,58,0.04)`) is the neutral well: `{colors.ink}` at low opacity over paper.

Overlays are popovers, menus, dialogs, and sticky bars:

- Fill `{colors.overlay}` (`rgba(255,255,255,0.82)`), the same 1px `{colors.sheet-edge}`, the highlight `{elevation.overlay-highlight}`, and one heavier shadow, `{elevation.overlay-shadow}`.
- An overlay may blur only when content scrolls beneath it. Then the overlay takes `backdrop-filter: blur(20px) saturate(1.15)`. The allowed overlay blur is 16px to 24px. The default is 20px. Saturation stays 1.15.
- Where the stack has no backdrop blur, raise the overlay fill to `{colors.sheet-solid}` (`rgba(255,255,255,0.96)`).

Controls:

- `{colors.control-edge}` (`rgba(36,48,58,0.54)`) is the 1px boundary of inputs, checkboxes, radios, and switches.
- `{colors.control-fill}` (`rgba(36,48,58,0.08)`) fills a secondary button, a neutral tag, and the track of a segmented control. Its label is `{colors.ink}`.
- `{colors.on-input}` (`#FFFFFF`) is the label, the check mark, and the switch thumb on a `{colors.input}` fill.

Text:

- `{colors.ink}` (`#24303A`) for titles and body. It is the same neutral in every colourway. It sits on paper, on a well, on `{colors.control-fill}`, or directly on the field.
- `{colors.muted}` (`#5C6B76`) for 12px secondary text. It is also fixed. It sits on paper or on a well. The Accessibility table says whether this colourway lets it sit on the field.
- `{colors.input}` (`#00787F`) for input, completion, links, and the focus ring. It sits on paper or on `{colors.input-wash}`.
- `{colors.output}` (`#8D4D8C`) for output and secondary figures. It sits on paper or on `{colors.output-wash}`.

减少透明度时 (`prefers-reduced-transparency: reduce`),以及系统高对比度时,纸和浮层都改为 `{colors.sheet-solid}` (`rgba(255,255,255,0.96)`),浮层不再模糊. 保持同一色相,只提高不透明度. 纸的填充是 0.62. 轻来自底场的色斑、纸之间露出的底场、白描边、内高光和柔影,不来自模糊.

## Dark Group

The dark group is the same material with the lightness turned over: a dark field, dark paper, and light text. Paper and the field still have almost the same lightness, and the layers still separate through the blobs, the edge, the highlight, and the shadow. Every rule in this file holds for the dark group unless this section changes it.

Use the dark group when the system appearance is dark (`prefers-color-scheme: dark`). An explicit choice by the user wins over the system appearance, in both directions. Typography, radii, spacing, `material`, and motion have no dark twin: both groups use the same values.

| Role | Light token | Dark token | Dark value |
| --- | --- | --- | --- |
| Field ends | `{colors.field-start}`, `{colors.field-end}` | `{colors.field-start-dark}`, `{colors.field-end-dark}` | `#0E1C1D`, `#241323` |
| Blobs | `{colors.blob-start}`, `{colors.blob-end}`, `{colors.blob-mid}` | `{colors.blob-start-dark}`, `{colors.blob-end-dark}`, `{colors.blob-mid-dark}` | `#0F2F32`, `#401D3F`, `#1A2337` |
| Paper fill | `{colors.sheet}` | `{colors.sheet-dark}` | `rgba(28,37,48,0.60)` |
| Opaque fallback | `{colors.sheet-solid}` | `{colors.sheet-solid-dark}` | `rgba(28,37,48,0.96)` |
| Paper edge | `{colors.sheet-edge}` | `{colors.sheet-edge-dark}` | `rgba(255,255,255,0.08)` |
| Paper highlight | `{elevation.sheet-highlight}` | `{elevation.sheet-highlight-dark}` | `inset 0 1px 0 rgba(255,255,255,0.06)` |
| Paper shadow | `{elevation.sheet-shadow}` | `{elevation.sheet-shadow-dark}` | `0 12px 40px -16px rgba(0,0,0,0.45)` |
| Overlay fill | `{colors.overlay}` | `{colors.overlay-dark}` | `rgba(30,40,52,0.84)` |
| Overlay highlight | `{elevation.overlay-highlight}` | `{elevation.overlay-highlight-dark}` | `inset 0 1px 0 rgba(255,255,255,0.08)` |
| Overlay shadow | `{elevation.overlay-shadow}` | `{elevation.overlay-shadow-dark}` | `0 24px 64px -24px rgba(0,0,0,0.60)` |
| Neutral well | `{colors.well}` | `{colors.well-dark}` | `rgba(231,237,243,0.04)` |
| Control fill | `{colors.control-fill}` | `{colors.control-fill-dark}` | `rgba(231,237,243,0.08)` |
| Control boundary | `{colors.control-edge}` | `{colors.control-edge-dark}` | `rgba(255,255,255,0.36)` |
| Label on an input fill | `{colors.on-input}` | `{colors.on-input-dark}` | `#1C2530` |
| Text | `{colors.ink}` | `{colors.ink-dark}` | `#E7EDF3` |
| Secondary text | `{colors.muted}` | `{colors.muted-dark}` | `#A3AFBD` |
| Input and its well | `{colors.input}`, `{colors.input-wash}` | `{colors.input-dark}`, `{colors.input-wash-dark}` | `#32D2DD`, `#193638` |
| Output and its well | `{colors.output}`, `{colors.output-wash}` | `{colors.output-dark}`, `{colors.output-wash-dark}` | `#E69DE3`, `#3A2A39` |

What the dark group changes:

- Paper is `{colors.sheet-dark}`: a dark color of its own, at 0.60. It is not white at a low alpha. White at a low alpha only grays the field, and it leaves no color for the opaque fallback.
- The paper edge and the two highlights stay white, at a far lower alpha. The two shadows are black and heavier.
- Both field ends stay dark and low-chroma: OKLCH L at most 0.23, C at most 0.045. A blob is lighter than both ends, and a blob stays at C 0.08 or less.
- An overlay is lighter than paper, so it is the weaker surface for light text. The dark contrast table measures text and the control boundary on the worst overlay as well as on the worst paper.
- `{colors.well-dark}` is `{colors.ink-dark}` at 0.04 over paper. The two semantic wells are dark tints of their accent, a little lighter than the paper color.
- `{colors.input-dark}` and `{colors.output-dark}` are light enough to be text on dark paper. A fill of `{colors.input-dark}` takes a dark label, check mark, and switch thumb: `{colors.on-input-dark}`, which is the paper color.
- Under 减少透明度 and under system high contrast, paper and overlays use `{colors.sheet-solid-dark}`: the paper color at 0.96. An overlay with no backdrop blur uses it too.

The recipe below is written for an explicit dark choice: `data-theme="dark"` on the root. Bind the same values when `prefers-color-scheme: dark` matches and the root carries no `data-theme="light"`. Radii, the press scale, and the rule for which overlay may blur come from the light recipe under Elevation & Depth.

```css
:root[data-theme="dark"] .field {
  background:
    radial-gradient(42rem 32rem at 12% 6%, color-mix(in srgb, #0F2F32 70%, transparent), transparent 70%),
    radial-gradient(40rem 32rem at 92% 96%, color-mix(in srgb, #401D3F 70%, transparent), transparent 70%),
    radial-gradient(30rem 24rem at 82% 10%, color-mix(in srgb, #1A2337 70%, transparent), transparent 70%),
    linear-gradient(160deg, #0E1C1D, #241323);
}
:root[data-theme="dark"] .sheet {
  background: rgba(28,37,48,0.60);
  border-color: rgba(255,255,255,0.08);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 40px -16px rgba(0,0,0,0.45);
}
:root[data-theme="dark"] .well {
  background: rgba(231,237,243,0.04);
}
:root[data-theme="dark"] .overlay {
  background: rgba(30,40,52,0.84);
  border-color: rgba(255,255,255,0.08);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 64px -24px rgba(0,0,0,0.60);
}
@supports not (backdrop-filter: blur(1px)) {
  :root[data-theme="dark"] .overlay {
    background: rgba(28,37,48,0.96);
  }
}
@media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
  :root[data-theme="dark"] .sheet,
  :root[data-theme="dark"] .overlay {
    background: rgba(28,37,48,0.96);
  }
}
```

## Typography

Family: `Figtree, "PingFang SC", "Noto Sans SC", sans-serif`. Do not use Inter, Plus Jakarta Sans, or DM Sans.

| Role | Token | Size | Weight | Notes |
| --- | --- | --- | --- | --- |
| Large numbers | `{typography.display-num}` | 32px | 700 | `tabular-nums`. Latin digits may use -0.02em |
| Title | `{typography.title}` | 16px | 650 | No negative tracking |
| Body | `{typography.body}` | 14px | 400 | Chinese running text line-height 1.7 |
| Secondary | `{typography.meta}` | 12px | 400 | Color `{colors.muted}` |

The -0.02em tracking belongs only to large Latin numerals. Chinese running text does not use negative letter-spacing.

## Layout

Spacing is 8 / 12 / 16 / 24 / 32 / 48 (`{spacing.min}` through `{spacing.xxl}`). The minimum gap is 8px.

At least two papers sit directly on the field, for example a sidebar and one or more cards. Leave the field visible between the papers and between a paper and the window edge: a gap of at least `{spacing.md}` (16px). Do not cover the window with one paper. Do not nest paper inside paper. Group content inside a paper with wells.

A page title may sit directly on the field in `{colors.ink}`.

Order on the workbench is status, number, action. Do not add a marketing hero.

When the paper padding is 8px, an inner image uses a 12px radius, because outer radius = inner radius + padding.

Icons are linear, about a 1.5px stroke, in `currentColor`. Do not add illustrated characters.

## Elevation & Depth

Depth has four sources: the field and its blobs showing between the papers, the white edge, the top highlight, and one soft shadow with a negative spread. Do not stack outer shadows or add a glow.

```css
.field {
  background:
    radial-gradient(42rem 32rem at 12% 6%, color-mix(in srgb, #C8EDEF 70%, transparent), transparent 70%),
    radial-gradient(40rem 32rem at 92% 96%, color-mix(in srgb, #ECD3EA 70%, transparent), transparent 70%),
    radial-gradient(30rem 24rem at 82% 10%, color-mix(in srgb, #E0E8F9 70%, transparent), transparent 70%),
    linear-gradient(160deg, #E3F6F7, #F5E6F4);
}
.sheet {
  background: rgba(255,255,255,0.62);
  border: 1px solid rgba(255,255,255,0.70);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.55), 0 12px 40px -16px rgba(30,60,90,0.14);
  border-radius: 20px;
}
.well {
  background: rgba(36,48,58,0.04);
  border-radius: 16px;
}
.overlay {
  background: rgba(255,255,255,0.82);
  border: 1px solid rgba(255,255,255,0.70);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.65), 0 24px 64px -24px rgba(30,60,90,0.22);
  border-radius: 16px;
}
.overlay.is-scrolled-under {
  backdrop-filter: blur(20px) saturate(1.15);
}
@supports not (backdrop-filter: blur(1px)) {
  .overlay {
    background: rgba(255,255,255,0.96);
  }
}
@media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
  .sheet,
  .overlay {
    background: rgba(255,255,255,0.96);
  }
  .overlay.is-scrolled-under {
    backdrop-filter: none;
  }
}
.sheet:active {
  transform: scale(0.98);
  transition: transform 120ms;
}
@media (prefers-reduced-motion: reduce) {
  .sheet:active {
    transform: none;
  }
}
```

The 1px border is the light edge only. CSS `border-style: solid` here only paints the translucent color. It is not an opaque fence and it is not the control boundary.

The inset highlight and the outer shadow are one `box-shadow` value in CSS. On a stack that draws them apart, keep the outer shadow outside the paper, so it does not darken the paper fill.

Pointer press uses `transform: scale(0.98)` for about 120ms, and animates `transform` only. Keyboard state changes do not animate. `prefers-reduced-motion: reduce` cancels the scale. Do not animate the overlay blur radius.

One viewport holds at most 6 overlays that use `backdrop-filter`. Do not nest paper inside paper. Paper, wells, list rows, and tables never blur.

## Shapes

| Token | Radius | Use |
| --- | --- | --- |
| `{rounded.check}` | 4px | Checkbox |
| `{rounded.control}` | 12px | Text input, textarea, select |
| `{rounded.image}` | 12px | Image inside paper when padding is 8px |
| `{rounded.well}` | 16px | Wells, popovers, menus |
| `{rounded.sheet}` | 20px | Paper, dialogs |
| `{rounded.pill}` | 999px | Buttons, tags, segmented controls, switches |

Buttons and tags are pills. Paper is 20px. With 8px padding, the inner image is 12px so that outer = inner + padding.

## Accessibility

Meet WCAG 2.2 AA on the worst specified background, not on an average of the field. The field has eight backgrounds: its two ends, and each blob at opacity 0.70 over each end. Paper is white 0.62 over one of them. A neutral well is `{colors.ink}` 0.04 over that paper. A row marked 最差 uses the background with the lowest ratio for that pair. Layers are mixed per sRGB channel, then WCAG 2.x relative luminance is used. An overlay is white 0.82 over the same backgrounds, which is lighter than paper, so text that passes on paper passes on an overlay.

These ratios were measured for this colourway. Do not replace them with a new calculation in this file. Change the colourway with `apply --force --palette`, which measures again.

<!-- palette:begin contrast -->
Inputs, checkboxes, radios, and switches draw their boundary in `{colors.control-edge}`. On the worst paper that edge is 3.16:1; the non-text minimum is 3:1. The 2px focus ring is `{colors.input}` (`#00787F`): 5.26:1 on white and 4.75:1 on the worst paper. The white paper edge on the field start is 1.12:1, so it cannot be a control boundary.

`{colors.ink}` may sit directly on the field: 10.15:1 on the worst blob. `{colors.muted}` on the field is 4.14:1 at worst, below 4.5:1, so secondary text stays on paper or a well in this colourway.

| 前景 | 背景 | 比值 | 门槛 | 用途 |
| --- | --- | --- | --- | --- |
| `#24303A` | `#FFFFFF` | 13.47 | 4.5 | 正文,不透明回退 |
| `#24303A` | 白 0.62 叠 `#E3F6F7` | 12.94 | 4.5 | 正文,纸在底场起点上 |
| `#24303A` | 白 0.62 叠 `#F5E6F4` | 12.62 | 4.5 | 正文,纸在底场终点上 |
| `#5C6B76` | 白 0.62 叠 `#E3F6F7` | 5.28 | 4.5 | 次要文字,纸在底场起点上 |
| `#5C6B76` | 白 0.62 叠 `#F5E6F4` | 5.15 | 4.5 | 次要文字,纸在底场终点上 |
| `#24303A` | 白 0.62 叠 (`#ECD3EA` 0.70 叠 `#F5E6F4`) | 12.17 | 4.5 | 正文,最差的纸 |
| `#5C6B76` | 白 0.62 叠 (`#ECD3EA` 0.70 叠 `#F5E6F4`) | 4.97 | 4.5 | 次要文字,最差的纸 |
| `#5C6B76` | `#24303A` 0.04 叠 白 0.62 叠 (`#ECD3EA` 0.70 叠 `#F5E6F4`) | 4.61 | 4.5 | 次要文字,最差的纸上的中性内容块 |
| `#24303A` | `#ECD3EA` 0.70 叠 `#F5E6F4` | 10.15 | 4.5 | 正文直接落在底场上,最差的色斑 |
| `#5C6B76` | `#ECD3EA` 0.70 叠 `#F5E6F4` | 4.14 | 只报告 | 次要文字落在底场上,只报告,本色板不可 |
| `#24303A` 0.54 叠纸 | 白 0.62 叠 (`#ECD3EA` 0.70 叠 `#F5E6F4`) | 3.16 | 3 | 输入框、复选框、单选、开关的边界,最差的纸 |
| `#00787F` | `#E5F8F9` | 4.79 | 4.5 | 输入或完成,正文与大号数字 |
| `#00787F` | 白 0.62 叠 (`#ECD3EA` 0.70 叠 `#F5E6F4`) | 4.75 | 4.5 | 链接,最差的纸 |
| `#00787F` | `#FFFFFF` | 5.26 | 4.5 | 主要按钮上的白字,不透明回退上的链接 |
| `#8D4D8C` | `#FBEFFA` | 5.27 | 4.5 | 输出,正文与大号数字 |
| `#8D4D8C` | 白 0.62 叠 (`#ECD3EA` 0.70 叠 `#F5E6F4`) | 5.31 | 4.5 | 输出色的文字,最差的纸 |
| `#8D4D8C` | `#FFFFFF` | 5.88 | 4.5 | 输出色,不透明回退 |
| `#FFFFFF` | `#E3F6F7` | 1.12 | 只报告 | 白描边,不能当控件边界 |
| 白 0.62 叠 `#E3F6F7` | `#E3F6F7` | 1.07 | 只报告 | 纸与底场的明度比,只报告,层次不靠它 |
<!-- palette:end contrast -->

A lighter tint of `{colors.input}` or `{colors.output}` that falls under 4.5:1 on its well is not a token. Use the measured value and keep the well light.

### Dark group contrast

The dark group is measured the same way, on its own eight backgrounds. Paper is `{colors.sheet-dark}` over one of them, and a neutral well is `{colors.ink-dark}` 0.04 over that paper. An overlay is `{colors.overlay-dark}` over the same backgrounds. It is lighter than paper, so the text rows and the control boundary are measured on the worst overlay as well. The opaque fallback is the paper color.

<!-- palette:begin contrast-dark -->
In the dark group, inputs, checkboxes, radios, and switches draw their boundary in `{colors.control-edge-dark}`. That edge is 3.25:1 on the worst paper and 3.21:1 on the worst overlay; the non-text minimum is 3:1. The 2px focus ring is `{colors.input-dark}` (`#32D2DD`): 8.34:1 on the worst paper and 8.12:1 on the worst overlay. The paper edge on the field start is 1.35:1, so it cannot be a control boundary.

`{colors.ink-dark}` may sit directly on the field: 12.96:1 on the worst blob. `{colors.muted-dark}` on the field is 6.86:1 at worst, so 12px secondary text may sit on the field in this colourway.

| 前景 | 背景 | 比值 | 门槛 | 用途 |
| --- | --- | --- | --- | --- |
| `#E7EDF3` | `#1C2530` | 13.12 | 4.5 | 正文,不透明回退 |
| `#E7EDF3` | `#1C2530` 0.60 叠 `#0E1C1D` | 13.89 | 4.5 | 正文,纸在底场起点上 |
| `#E7EDF3` | `#1C2530` 0.60 叠 `#241323` | 13.92 | 4.5 | 正文,纸在底场终点上 |
| `#A3AFBD` | `#1C2530` 0.60 叠 `#0E1C1D` | 7.35 | 4.5 | 次要文字,纸在底场起点上 |
| `#A3AFBD` | `#1C2530` 0.60 叠 `#241323` | 7.37 | 4.5 | 次要文字,纸在底场终点上 |
| `#E7EDF3` | `#1C2530` 0.60 叠 (`#0F2F32` 0.70 叠 `#0E1C1D`) | 13.03 | 4.5 | 正文,最差的纸 |
| `#A3AFBD` | `#1C2530` 0.60 叠 (`#0F2F32` 0.70 叠 `#0E1C1D`) | 6.90 | 4.5 | 次要文字,最差的纸 |
| `#A3AFBD` | `#E7EDF3` 0.04 叠 `#1C2530` 0.60 叠 (`#0F2F32` 0.70 叠 `#0E1C1D`) | 6.21 | 4.5 | 次要文字,最差的纸上的中性内容块 |
| `#E7EDF3` | `#0F2F32` 0.70 叠 `#0E1C1D` | 12.96 | 4.5 | 正文直接落在底场上,最差的色斑 |
| `#A3AFBD` | `#0F2F32` 0.70 叠 `#0E1C1D` | 6.86 | 只报告 | 次要文字落在底场上,只报告,本色板可以 |
| 白 0.36 叠纸 | `#1C2530` 0.60 叠 (`#0F2F32` 0.70 叠 `#241323`) | 3.25 | 3 | 输入框、复选框、单选、开关的边界,最差的纸 |
| `#32D2DD` | `#193638` | 7.01 | 4.5 | 输入或完成,正文与大号数字 |
| `#32D2DD` | `#1C2530` 0.60 叠 (`#0F2F32` 0.70 叠 `#0E1C1D`) | 8.34 | 4.5 | 链接,最差的纸 |
| `#32D2DD` | `#1C2530` | 8.40 | 4.5 | 主要按钮上的深色字,不透明回退上的链接 |
| `#E69DE3` | `#3A2A39` | 6.56 | 4.5 | 输出,正文与大号数字 |
| `#E69DE3` | `#1C2530` 0.60 叠 (`#0F2F32` 0.70 叠 `#0E1C1D`) | 7.54 | 4.5 | 输出色的文字,最差的纸 |
| `#E69DE3` | `#1C2530` | 7.59 | 4.5 | 输出色,不透明回退 |
| 白 0.08 叠纸 | `#0E1C1D` | 1.35 | 只报告 | 纸的描边,不能当控件边界 |
| `#1C2530` 0.60 叠 (`#0F2F32` 0.70 叠 `#241323`) | `#0F2F32` 0.70 叠 `#241323` | 1.00 | 只报告 | 纸与底场的明度比,只报告,层次不靠它 |
| `#E7EDF3` | `#1E2834` 0.84 叠 (`#0F2F32` 0.70 叠 `#241323`) | 12.69 | 4.5 | 正文,最差的浮层 |
| `#A3AFBD` | `#1E2834` 0.84 叠 (`#0F2F32` 0.70 叠 `#241323`) | 6.71 | 4.5 | 次要文字,最差的浮层 |
| 白 0.36 叠浮层 | `#1E2834` 0.84 叠 (`#0F2F32` 0.70 叠 `#241323`) | 3.21 | 3 | 输入框、复选框、单选、开关的边界,最差的浮层 |
| `#32D2DD` | `#1E2834` 0.84 叠 (`#0F2F32` 0.70 叠 `#241323`) | 8.12 | 4.5 | 链接,最差的浮层 |
| `#E69DE3` | `#1E2834` 0.84 叠 (`#0F2F32` 0.70 叠 `#241323`) | 7.34 | 4.5 | 输出色的文字,最差的浮层 |
<!-- palette:end contrast-dark -->

A darker shade of `{colors.input-dark}` or `{colors.output-dark}` that falls under 4.5:1 on its well is not a token. Use the measured value and keep the well dark.

### Control boundaries

WCAG 1.4.11 asks for 3:1 on the visual information that identifies a control and its state. It does not ask for an outline on a control that a fill and a text label already identify.

| Control | Identified by | Boundary |
| --- | --- | --- |
| Text input, textarea, select | 1px `{colors.control-edge}` | Required: 3:1 on paper |
| Checkbox or radio, off | 1px `{colors.control-edge}` | Required: 3:1 on paper |
| Checkbox or radio, on | Fill `{colors.input}` with a mark in `{colors.on-input}` | The fill is the boundary |
| Switch, off | 1px `{colors.control-edge}` on the track, thumb in `{colors.muted}` | Required: 3:1 on paper |
| Switch, on | Track fill `{colors.input}`, thumb in `{colors.on-input}` | The fill is the boundary |
| Primary button | Fill `{colors.input}`, label `{colors.on-input}` | No outline |
| Secondary button | Fill `{colors.control-fill}`, label `{colors.ink}` | No outline |
| Tag | Fill `{colors.input-wash}` or `{colors.output-wash}` with its semantic color as the label, or fill `{colors.control-fill}` with label `{colors.ink}` | No outline |
| Segmented item | Track `{colors.control-fill}`. The selected item is `{colors.input-wash}` with label `{colors.input}`. Other items have label `{colors.ink}` | No outline |
| Focus ring, every control | 2px `{colors.input}`, offset 2px | Same in every state |

The table names the light tokens. In the dark group each one becomes its `-dark` twin, and the boundary must reach 3:1 on paper and on an overlay.

The inside of a text input, an unchecked box, and an off switch is paper. Give it no fill of its own, so the edge mixes over paper as measured. An icon-only button has no text label. Its icon is the identifying information and must reach 3:1 on its background. Do not draw a gray outline around a button, a tag, a segmented item, or a well.

## Writing Tone

State the status, then the number, then the action. Keep labels short. No slogan and no marketing headline. Do not tighten Chinese text to match the Latin number tracking.

## Do's and Don'ts

### Do

- Put text on paper or on a well. `{colors.ink}` may also sit directly on the field.
- Put at least two papers directly on the field, and leave the field visible between them and at the window edge.
- Give paper its four parts: the fill `{colors.sheet}`, the 1px `{colors.sheet-edge}`, the top highlight, and the one soft shadow.
- Use `{colors.input}` for input, completion, links, and the 2px focus ring.
- Use `{colors.output}` for output and secondary figures.
- Draw the boundary of inputs, checkboxes, radios, and switches in `{colors.control-edge}`.
- Use `{colors.sheet-solid}` for paper and overlays under 减少透明度 and under system high contrast.
- Ship the light group and the dark group together. Follow the system appearance, and let an explicit choice by the user win.
- Set numbers in `tabular-nums`.
- On pointer press, scale to 0.98 for about 120ms on `transform` only. Skip that motion for keyboard activation and for `prefers-reduced-motion`.

### Don't

- Don't blur paper, wells, list rows, or tables. Only an overlay with content scrolling beneath it may blur.
- Don't cover the window with one paper. Without the field showing, the material is a white page.
- Don't nest paper, and don't put more than 6 blurred overlays in one viewport.
- Don't draw a blob with a blur filter, and don't give a blob a new hex.
- Don't use the 1px `rgba(255,255,255,0.70)` edge as a control boundary or as an opaque fence. On the field it is far below 3:1. The Accessibility table has the ratio. The dark paper edge is not a control boundary either.
- Don't make dark paper from white at a low alpha. Dark paper is `{colors.sheet-dark}`.
- Don't put a `-dark` token on a light surface, or a light token on a dark one.
- Don't outline a button, a tag, a segmented item, or a well in gray. A fill and a text label identify them.
- Don't animate blur.
- Don't use Inter, Plus Jakarta Sans, or DM Sans.
- Don't set body text in a lighter tint of `{colors.input}` or `{colors.output}`. Under 4.5:1 on its well, it fails.
- Don't apply negative letter-spacing to Chinese running text.
- Don't add a second outer shadow, a neon glow, or a saturated neon gradient.
- Don't put `{colors.muted}`, `{colors.input}`, or `{colors.output}` text on the field. The one exception is `{colors.muted}` in a group whose contrast table allows it.
- Don't put accent-colored text on the neutral well. `{colors.input}` and `{colors.output}` are measured on paper and on their own wash.
- Don't turn this field gradient off as decoration, and don't paste it onto another DESIGN.md. Choosing this style means the gradient is the material.
- Don't change one hex of the colourway by hand, and don't raise the chroma of a field end. Switch the whole colourway with `apply --force --palette`.

## Responsive Behavior

| Condition | Paper | Overlay |
| --- | --- | --- |
| Transparency allowed, at every width | `{colors.sheet}`, no blur | `{colors.overlay}`. Blur 20px only when content scrolls beneath it |
| The stack has no backdrop blur | Unchanged | `{colors.sheet-solid}` |
| `prefers-reduced-transparency: reduce`, or system high contrast | 减少透明度时的不透明回退: `{colors.sheet-solid}` | `{colors.sheet-solid}`, blur none |

The dark group follows the same table with its `-dark` tokens.

At a narrow width the papers stack in one column. Keep the gap between them and the margin at the window edge, so the field still shows.

Pills stay pills. The focus ring stays 2px `{colors.input}`. Keyboard focus does not scale.

## Known Gaps

- No high-contrast palette. Under system high contrast, paper and overlays turn opaque and every color stays as it is.
- No chart palette.
- `{colors.ink}` and `{colors.muted}` do not tint with the colourway. On a warm field they read slightly cool.
- Contrast ratios above are measured on the eight field backgrounds of each group, on paper and the neutral well over them, on the two semantic wells, and on the opaque fallback: `#FFFFFF` in the light group, the paper color in the dark group. The dark group is also measured on overlays. They are not measured on photographs, not on content that shows through an overlay, and not on a well inside an overlay.
- The neutral well is 0.04. At 0.05, `{colors.muted}` on the worst paper is 4.50:1 in some derived colourways, which leaves no margin.
- Blob positions and sizes are a starting point for a desktop window. They are not tokens.
- If Figtree is unavailable, fall back to the system sans-serif and keep `"PingFang SC", "Noto Sans SC"` after the Latin family.
- Title weight 650 needs the Figtree variable font. Static Figtree files step by 100. If only a static file is available, use 600 for that role and do not add a second token.
- Line-height is specified for Chinese body text only (1.7). Other roles do not add a second line-height.
