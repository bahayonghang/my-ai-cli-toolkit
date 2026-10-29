---
version: alpha
name: 轻盈毛玻璃
description: "轻盈毛玻璃 is airy frosted glass: a light field, white paper, and two semantic colors, green for input and purple for output."
colors:
  canvas-mint: "#E7F6F1"
  canvas-lavender: "#EDE7F8"
  sheet: "rgba(255,255,255,0.78)"
  sheet-solid: "rgba(255,255,255,0.96)"
  sheet-edge: "rgba(255,255,255,0.80)"
  ink: "#24303A"
  muted: "#5C6B76"
  input: "#187A56"
  input-wash: "#E7F7F0"
  output: "#6D4BD6"
  output-wash: "#F3EEFC"
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
  sheet-blur: 20px
  sheet-blur-min: 16px
  sheet-blur-max: 24px
  sheet-saturate: 1.15
  blob-blur: 80px
  blob-opacity: 0.55
  blob-max: 3
  backdrop-max: 6
  solid-breakpoint: 960px
elevation:
  sheet-shadow: "0 20px 48px rgba(70, 90, 120, 0.08)"
motion:
  press-scale: 0.98
  press-duration: 120ms
---

## Overview

轻盈毛玻璃 is airy frosted glass for a workbench. The field is bright, low-chroma, cool air. White paper floats on a mint-to-lavender gradient. Read status, then the number, then the action. There is no marketing hero.

绿与紫是两个语义色. `{colors.input}` means input or completion. `{colors.output}` means output. Text sits on paper or on a solid well, never on the field.

Glass is not the default card skin. Only the paper uses `backdrop-filter`, and only once. This file does not define a component library. Do not import the glassmorphism palette, fonts, or radii.

## Colors

Field:

- `{colors.canvas-mint}` (`#E7F6F1`) to `{colors.canvas-lavender}` (`#EDE7F8`), about 160deg.
- At most 3 blobs. A blob keeps the hue of one field end and raises chroma slightly. Do not assign a new hex. Blur about 80px, opacity about 0.55. Keep blobs out from under text.

Paper is the only surface that may blur:

- Fill `{colors.sheet}` (`rgba(255,255,255,0.78)`).
- 模糊 20px, written `backdrop-filter: blur(20px) saturate(1.15)`. The allowed blur is 16px to 24px. The default is 20px. Saturation stays 1.15.
- 1px edge `{colors.sheet-edge}` (`rgba(255,255,255,0.80)`). This is a light edge, not an opaque fence, and not a control boundary.
- One shadow: `{elevation.sheet-shadow}`.

Wells are solid and do not blur again. `{colors.input-wash}` (`#E7F7F0`) is the input and completion well. `{colors.output-wash}` (`#F3EEFC`) is the output well.

Text:

- `{colors.ink}` (`#24303A`) for titles and body.
- `{colors.muted}` (`#5C6B76`) for 12px secondary text.
- `{colors.input}` (`#187A56`) for input, completion, links, and the focus ring.
- `{colors.output}` (`#6D4BD6`) for output and secondary figures.

窄屏、减少透明度时的不透明回退、以及没有 `backdrop-filter` 时,纸改为 `{colors.sheet-solid}` (`rgba(255,255,255,0.96)`),模糊为 none. 保持同一色相,只提高不透明度. 填充 0.78 是有意比水晶卡更实,好让低饱和字段上的文字稳定过 4.5:1. 轻来自字段的颜色、大圆角和淡阴影,不来自把纸做成全透明.

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

Order on the workbench is status, number, action. Do not add a marketing hero.

When the paper padding is 8px, an inner image uses a 12px radius, because outer radius = inner radius + padding.

Icons are linear, about a 1.5px stroke, in `currentColor`. Do not add illustrated characters.

## Elevation & Depth

Depth is the field showing past the paper, one soft shadow, and the large radius. Do not stack shadows or add a glow.

```css
.field {
  background: linear-gradient(160deg, #E7F6F1, #EDE7F8);
}
.sheet {
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(20px) saturate(1.15);
  border: 1px solid rgba(255,255,255,0.80);
  box-shadow: 0 20px 48px rgba(70, 90, 120, 0.08);
  border-radius: 20px;
}
.sheet.is-solid {
  background: rgba(255,255,255,0.96);
  backdrop-filter: none;
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

Pointer press uses `transform: scale(0.98)` for about 120ms, and animates `transform` only. Keyboard state changes do not animate. `prefers-reduced-motion: reduce` cancels the scale. Do not animate the blur radius.

One viewport holds at most 6 `backdrop-filter` layers. Do not nest paper inside paper. Wells, list rows, and tables stay solid.

## Shapes

| Token | Radius | Use |
| --- | --- | --- |
| `{rounded.image}` | 12px | Image inside paper when padding is 8px |
| `{rounded.well}` | 16px | Solid wells |
| `{rounded.sheet}` | 20px | Paper |
| `{rounded.pill}` | 999px | Buttons and tags |

Buttons and tags are pills. Paper is 20px. With 8px padding, the inner image is 12px so that outer = inner + padding.

## Accessibility

Meet WCAG 2.2 AA on the worst specified background, not on an average of the field. These ratios were measured for this palette. Do not replace them with a new calculation in this file.

Controls show their boundary by fill, plus a 2px focus ring in `{colors.input}` (`#187A56`). On white that ring is 5.31:1. The white edge on the mint field is 1.11:1, which is below the 3:1 non-text boundary, so the edge cannot be the control boundary.

| 前景 | 背景 | 比值 | 用途 |
| --- | --- | --- | --- |
| `#24303A` | `#FFFFFF` | 13.47 | 正文,不透明回退 |
| `#24303A` | 白 0.78 叠 `#E7F6F1` | 13.16 | 正文,最亮薄荷字段 |
| `#5C6B76` | 白 0.78 叠 `#E7F6F1` | 5.37 | 次要文字 |
| `#187A56` | `#E7F7F0` | 4.79 | 输入或完成,正文与大号数字 |
| `#187A56` | `#FFFFFF` | 5.31 | 链接与焦点环 |
| `#6D4BD6` | `#F3EEFC` | 5.08 | 输出,正文与大号数字 |
| `#6D4BD6` | `#FFFFFF` | 5.79 | 输出色在白纸上 |
| `#FFFFFF` | `#E7F6F1` | 1.11 | 白描边,不能当控件边界 |
| `#1F8A62` | `#E7F7F0` | 3.89 | 更亮的绿,不够正文,不使用 |

`#1F8A62` is not a token. On the input well it is 3.89:1, short of 4.5:1. Use `#187A56` (4.79:1) and keep the well light.

## Writing Tone

State the status, then the number, then the action. Keep labels short. No slogan and no marketing headline. Do not tighten Chinese text to match the Latin number tracking.

## Do's and Don'ts

### Do

- Put text only on paper or on a solid well.
- Use `{colors.input}` for input, completion, links, and the 2px focus ring.
- Use `{colors.output}` for output and secondary figures.
- Blur only the paper, once, at 模糊 20px and saturate 1.15.
- Use the 不透明回退, `{colors.sheet-solid}`, below 960px, for 减少透明度, and when `backdrop-filter` is missing.
- Set numbers in `tabular-nums`.
- On pointer press, scale to 0.98 for about 120ms on `transform` only. Skip that motion for keyboard activation and for `prefers-reduced-motion`.

### Don't

- Don't use glass as the default card skin. Wells, list rows, and tables are solid. Only paper on the field may use one `backdrop-filter`.
- Don't use the 1px `rgba(255,255,255,0.80)` edge as a control boundary or as an opaque fence. On mint it is 1.11:1.
- Don't nest paper, and don't put more than 6 `backdrop-filter` layers in one viewport.
- Don't animate blur.
- Don't use Inter, Plus Jakarta Sans, or DM Sans.
- Don't set body text in `#1F8A62`. On `#E7F7F0` it is 3.89:1.
- Don't apply negative letter-spacing to Chinese running text.
- Don't add a second shadow, a neon glow, or a purple-to-blue neon gradient.
- Don't put text on the field or on a blob.
- Don't turn this field gradient off as decoration, and don't paste it onto another DESIGN.md. Choosing this style means the gradient is the material.

## Responsive Behavior

| Condition | Paper |
| --- | --- |
| 960px and above, transparency allowed, `backdrop-filter` supported | Fill 0.78, 模糊 20px, at most 6 papers |
| Below 960px | `{colors.sheet-solid}`, blur none |
| `prefers-reduced-transparency: reduce` | 减少透明度时的不透明回退, at every width |
| No `backdrop-filter` | 不透明回退 |

Pills stay pills. The focus ring stays 2px `{colors.input}`. Keyboard focus does not scale.

## Known Gaps

- No dark theme.
- No chart palette.
- Contrast ratios above are measured on static wells and on the white-paper mix (white 0.78 over `#E7F6F1`, or `#FFFFFF` for the opaque fallback). They are not measured on photographs.
- If Figtree is unavailable, fall back to the system sans-serif and keep `"PingFang SC", "Noto Sans SC"` after the Latin family.
- Title weight 650 needs the Figtree variable font. Static Figtree files step by 100. If only a static file is available, use 600 for that role and do not add a second token.
- Line-height is specified for Chinese body text only (1.7). Other roles do not add a second line-height.
- Blob paints raise chroma without a separate hex. Do not invent one.
