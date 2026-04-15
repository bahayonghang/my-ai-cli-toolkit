---
name: article-cover
description: "Generate article cover images as SVG. Use when creating cover/banner/header graphics for blogs, documentation, social media cards, or OG images. Trigger this skill whenever the user mentions article covers, blog banners, post thumbnails, social sharing images, or any visual header for written content — even if they don't explicitly say 'SVG'. Do not use it for full-scene illustrations, photo editing, or slide theme work."
version: 1.1.0
category: visual-media-design
tags: [svg, graphics, cover-image, blog, design, banner, og-image, social-media, thumbnail]
argument-hint: [article-title-or-topic]
allowed-tools: Read, Write
---

# Article Cover SVG Generation

Use this skill to turn an article topic into a clean, reusable SVG cover asset.

## When To Use

- Blog or docs header images
- OG / social preview art
- Publication thumbnails or article hero graphics

## Do Not Use

- Full illustrations, raster image editing, or photo compositing
- Slide-deck themes or multi-slide styling
- Flowcharts, technical diagrams, or whiteboard sketches

## Inputs

- Required: article title, topic, or article file path
- Optional: subtitle, output path, aspect ratio, color mood, publication/brand context

## Workflow

1. Check `$ARGUMENTS`. If the request does not include a usable topic or file path, ask for the article title or topic before generating anything.
2. Resolve the output target:
   - if the user gave an explicit filename, use it
   - if the user gave an article file path, save alongside it or inside a nearby `assets/` directory as `{article-slug}-cover.svg`
   - otherwise save as `{article-slug}-cover.svg` in the active working directory
3. Read `$SKILL_DIR/references/DESIGN_SYSTEM.md` before choosing shapes, color, or composition.
4. Distill the topic into:
   - a main title
   - an optional subtitle or kicker
   - one dominant visual metaphor
   - a layout pattern: Comparison, Flow, Centered Concept, or Typography-First
5. Draft the SVG using the design system rules for hierarchy, color contrast, and spacing. Favor one clear focal idea over decorative clutter.
6. Include SVG essentials in the generated file:
   - root `xmlns="http://www.w3.org/2000/svg"`
   - a valid `viewBox`
   - accessible `<title>` and `<desc>` tags when practical
   - explicit `font-family` on text elements
7. Write the SVG to the resolved path.
8. Validate the result before finishing:
   - tags close correctly
   - title remains readable at thumbnail size
   - text does not overflow the canvas
   - contrast is strong enough against the background

## Output Contract

Return:

- the final SVG file path
- the chosen layout pattern
- a one-sentence rationale for the visual direction

Do not paste the full SVG into chat unless the user explicitly asks for inline code.

## Troubleshooting

- If the topic is too broad, ask the user to narrow the angle instead of generating a generic cover.
- If text renders incorrectly, use `font-family="Arial, sans-serif"` for reliable cross-platform and CJK support.
- If contrast is low, simplify the palette and re-check against the design system guidance.
- If the SVG displays blank in a browser, verify the root namespace, `viewBox`, and that visible elements are inside the canvas bounds.
- If the user actually wants a scene illustration or raster artwork, hand off to an image-generation skill instead of forcing SVG.

## Final Checklist

- Output path is explicit
- Layout choice matches the article angle
- SVG is valid and viewable in a browser
- Title is legible at social-preview scale
