---
name: article-cover
description: Generate article cover images as SVG. Use when creating cover/banner graphics for blogs or documentation.
metadata:
  category: content-creation
  tags: [svg, graphics, cover-image, blog, design]
argument-hint: [article-title-or-topic]
allowed-tools: Write, Read
---

# Article Cover SVG Generation

1. Check if `$ARGUMENTS` is provided. If empty, prompt the user for the article title or topic.
2. Analyze the topic to determine the main title, subtitle, and layout pattern.
3. Read `$SKILL_DIR/references/DESIGN_SYSTEM.md` for SVG templates, color systems, and design rules.
4. Choose a layout pattern (Comparison or Flow) based on the topic.
5. Generate the SVG content following the visual hierarchy and color contrast rules defined in the design system.
6. Write the output to a file named `{article-slug}-cover.svg` in the appropriate directory (e.g., alongside the article or in an `assets/` folder).

## Output

- A valid, visually striking SVG file containing the article cover.
- Notify the user that the file can be opened in a browser or converted to PNG via Inkscape/browser screenshot.

## Troubleshooting

- If text renders incorrectly, ensure `font-family="Arial, sans-serif"` is used for better cross-platform and CJK support.
- If contrast is low, verify that gradients and background colors follow the guidelines in the design system.
