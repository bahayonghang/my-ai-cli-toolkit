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
  ink: "#24303A"
  muted: "#5C6B76"
  input: "#00787F"
  input-wash: "#E5F8F9"
  output: "#8D4D8C"
  output-wash: "#FBEFFA"
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

## Colourway

The colourway is a dial. `apply` sets it from the project: an accent token the project already has, then the project content, then the default. The roles, the material, and the contrast gates are the same in every colourway. Only the nine hex values below change.

<!-- palette:begin colourway -->
Colourway: `hue:202` (derived: input hue 202, output hue 328).

- Field: `#E3F6F7` to `#F5E6F4`.
- Blobs: `#C8EDEF`, `#ECD3EA`, `#E0E8F9`, each at opacity 0.70.
- Input: `#00787F` on `#E5F8F9`.
- Output: `#8D4D8C` on `#FBEFFA`.
- Other colourways: `mint`, `sky`, `apricot`, `slate`, or `hue:<0-359>`.
<!-- palette:end colourway -->

To switch, rerun `apply --force --palette <preset|hue:N>`. Do not edit one hex by hand. The contrast table under Accessibility is measured for this colourway only.

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

Text:

- `{colors.ink}` (`#24303A`) for titles and body. It is the same neutral in every colourway. It sits on paper, on a well, on `{colors.control-fill}`, or directly on the field.
- `{colors.muted}` (`#5C6B76`) for 12px secondary text. It is also fixed. It sits on paper or on a well. The Accessibility table says whether this colourway lets it sit on the field.
- `{colors.input}` (`#00787F`) for input, completion, links, and the focus ring. It sits on paper or on `{colors.input-wash}`.
- `{colors.output}` (`#8D4D8C`) for output and secondary figures. It sits on paper or on `{colors.output-wash}`.

减少透明度时 (`prefers-reduced-transparency: reduce`),以及系统高对比度时,纸和浮层都改为 `{colors.sheet-solid}` (`rgba(255,255,255,0.96)`),浮层不再模糊. 保持同一色相,只提高不透明度. 纸的填充是 0.62. 轻来自底场的色斑、纸之间露出的底场、白描边、内高光和柔影,不来自模糊.

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

### Control boundaries

WCAG 1.4.11 asks for 3:1 on the visual information that identifies a control and its state. It does not ask for an outline on a control that a fill and a text label already identify.

| Control | Identified by | Boundary |
| --- | --- | --- |
| Text input, textarea, select | 1px `{colors.control-edge}` | Required: 3:1 on paper |
| Checkbox or radio, off | 1px `{colors.control-edge}` | Required: 3:1 on paper |
| Checkbox or radio, on | Fill `{colors.input}` with a white mark | The fill is the boundary |
| Switch, off | 1px `{colors.control-edge}` on the track, thumb in `{colors.muted}` | Required: 3:1 on paper |
| Switch, on | Track fill `{colors.input}`, white thumb | The fill is the boundary |
| Primary button | Fill `{colors.input}`, white label | No outline |
| Secondary button | Fill `{colors.control-fill}`, label `{colors.ink}` | No outline |
| Tag | Fill `{colors.input-wash}` or `{colors.output-wash}` with its semantic color as the label, or fill `{colors.control-fill}` with label `{colors.ink}` | No outline |
| Segmented item | Track `{colors.control-fill}`. The selected item is `{colors.input-wash}` with label `{colors.input}`. Other items have label `{colors.ink}` | No outline |
| Focus ring, every control | 2px `{colors.input}`, offset 2px | Same in every state |

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
- Set numbers in `tabular-nums`.
- On pointer press, scale to 0.98 for about 120ms on `transform` only. Skip that motion for keyboard activation and for `prefers-reduced-motion`.

### Don't

- Don't blur paper, wells, list rows, or tables. Only an overlay with content scrolling beneath it may blur.
- Don't cover the window with one paper. Without the field showing, the material is a white page.
- Don't nest paper, and don't put more than 6 blurred overlays in one viewport.
- Don't draw a blob with a blur filter, and don't give a blob a new hex.
- Don't use the 1px `rgba(255,255,255,0.70)` edge as a control boundary or as an opaque fence. On the field it is far below 3:1. The Accessibility table has the ratio.
- Don't outline a button, a tag, a segmented item, or a well in gray. A fill and a text label identify them.
- Don't animate blur.
- Don't use Inter, Plus Jakarta Sans, or DM Sans.
- Don't set body text in a lighter tint of `{colors.input}` or `{colors.output}`. Under 4.5:1 on its well, it fails.
- Don't apply negative letter-spacing to Chinese running text.
- Don't add a second outer shadow, a neon glow, or a saturated neon gradient.
- Don't put `{colors.muted}`, `{colors.input}`, or `{colors.output}` text on the field. The one exception is `{colors.muted}` in a colourway whose Accessibility table allows it.
- Don't put accent-colored text on the neutral well. `{colors.input}` and `{colors.output}` are measured on paper and on their own wash.
- Don't turn this field gradient off as decoration, and don't paste it onto another DESIGN.md. Choosing this style means the gradient is the material.
- Don't change one hex of the colourway by hand, and don't raise the chroma of a field end. Switch the whole colourway with `apply --force --palette`.

## Responsive Behavior

| Condition | Paper | Overlay |
| --- | --- | --- |
| Transparency allowed, at every width | `{colors.sheet}`, no blur | `{colors.overlay}`. Blur 20px only when content scrolls beneath it |
| The stack has no backdrop blur | Unchanged | `{colors.sheet-solid}` |
| `prefers-reduced-transparency: reduce`, or system high contrast | 减少透明度时的不透明回退: `{colors.sheet-solid}` | `{colors.sheet-solid}`, blur none |

At a narrow width the papers stack in one column. Keep the gap between them and the margin at the window edge, so the field still shows.

Pills stay pills. The focus ring stays 2px `{colors.input}`. Keyboard focus does not scale.

## Known Gaps

- No dark theme. Every colourway is light.
- No chart palette.
- `{colors.ink}` and `{colors.muted}` do not tint with the colourway. On a warm field they read slightly cool.
- Contrast ratios above are measured on the eight field backgrounds, on paper and the neutral well over them, on the two semantic wells, and on `#FFFFFF` for the opaque fallback. They are not measured on photographs, and not on content that shows through an overlay.
- The neutral well is 0.04. At 0.05, `{colors.muted}` on the worst paper is 4.50:1 in some derived colourways, which leaves no margin.
- Blob positions and sizes are a starting point for a desktop window. They are not tokens.
- If Figtree is unavailable, fall back to the system sans-serif and keep `"PingFang SC", "Noto Sans SC"` after the Latin family.
- Title weight 650 needs the Figtree variable font. Static Figtree files step by 100. If only a static file is available, use 600 for that role and do not add a second token.
- Line-height is specified for Chinese body text only (1.7). Other roles do not add a second line-height.
