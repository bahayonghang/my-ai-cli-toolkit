---
name: article-cover
description: "Generate article cover images as SVG. Use when creating cover/banner/header graphics for blogs, documentation, social media cards, or OG images. Trigger this skill whenever the user mentions article covers, blog banners, post thumbnails, social sharing images, or any visual header for written content — even if they don't explicitly say 'SVG'."
version: 1.0.0
category: content-creation
tags: [svg, graphics, cover-image, blog, design, banner, og-image, social-media, thumbnail]
argument-hint: [article-title-or-topic]
allowed-tools: Write, Read
---

# Article Cover SVG Generation

1. Check if `$ARGUMENTS` is provided. If empty, prompt the user for the article title or topic.
2. Analyze the topic to determine the main title, subtitle, and layout pattern.
3. Read `$SKILL_DIR/references/DESIGN_SYSTEM.md` for SVG templates, color systems, and design rules.
4. Choose a layout pattern (Comparison, Flow, Centered Concept, or Typography-First) based on the topic. Layout selection directly impacts visual communication efficiency — a mismatched layout weakens the cover's ability to convey the article's core message at a glance.
5. Generate the SVG content following the visual hierarchy and color contrast rules defined in the design system.
6. Write the output to a file named `{article-slug}-cover.svg` in the appropriate directory (e.g., alongside the article or in an `assets/` folder).
7. Validate the generated SVG: ensure all tags are properly closed, `viewBox` attribute is present on the root `<svg>` element, and all `<text>` elements have a `font-family` attribute.

## Output

- A valid, visually striking SVG file containing the article cover.
- Notify the user that the file can be opened in a browser or converted to PNG via Inkscape/browser screenshot.

## Troubleshooting

- If text renders incorrectly, ensure `font-family="Arial, sans-serif"` is used for better cross-platform and CJK support.
- If contrast is low, verify that gradients and background colors follow the guidelines in the design system.
- If the SVG displays as blank in the browser, check that the root `<svg>` element has a valid `viewBox` attribute and the `xmlns="http://www.w3.org/2000/svg"` namespace is present.
