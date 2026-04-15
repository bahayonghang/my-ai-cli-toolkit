---
name: theme-factory
description: Toolkit for styling artifacts with a theme. These artifacts can be slides, docs, reports, HTML landing pages, and similar deliverables. There are 10 pre-set themes with colors and fonts that can be applied directly, or a new theme can be generated on-the-fly when none fit.
license: Complete terms in LICENSE.txt
category: visual-media-design
tags: [theme, styling, typography, color, slides, design-system]
version: 1.1.0
argument-hint: [artifact-and-theme-request]
allowed-tools: Read, Write
---


# Theme Factory Skill

This skill provides a curated collection of professional font and color themes, each with carefully selected color palettes and font pairings. Once a theme is chosen, it can be applied to any artifact.

## When To Use

Use this skill when the user wants a consistent visual theme applied to an artifact such as slides, docs, reports, or HTML pages.

Each theme includes:
- A cohesive color palette with hex codes
- Complementary font pairings for headers and body text
- A distinct visual identity suitable for different contexts and audiences

## Do Not Use

- Creating net-new illustrations or diagrams
- Reverse-engineering a real brand system from screenshots
- Abstract design critique without applying a concrete theme

## Usage Instructions

To apply styling to a slide deck or other artifact:

1. Inspect the artifact type and any existing styling constraints. Do not overwrite a strict house style unless the user asked for a replacement.
2. If the user already named a theme, skip the showcase and go straight to that theme.
3. Otherwise show `theme-showcase.pdf` when visual selection would help and the current runtime can display it.
4. Ask the user to choose one of the available themes, or describe the desired mood if a custom theme is needed.
5. Read the selected theme file from `themes/` and apply its colors and fonts consistently to the artifact.
6. Preserve readability and hierarchy; the theme should support the content, not overpower it.

## Themes Available

The following 10 themes are available, each showcased in `theme-showcase.pdf`:

1. **Ocean Depths** - Professional and calming maritime theme
2. **Sunset Boulevard** - Warm and vibrant sunset colors
3. **Forest Canopy** - Natural and grounded earth tones
4. **Modern Minimalist** - Clean and contemporary grayscale
5. **Golden Hour** - Rich and warm autumnal palette
6. **Arctic Frost** - Cool and crisp winter-inspired theme
7. **Desert Rose** - Soft and sophisticated dusty tones
8. **Tech Innovation** - Bold and modern tech aesthetic
9. **Botanical Garden** - Fresh and organic garden colors
10. **Midnight Galaxy** - Dramatic and cosmic deep tones

## Theme Details

Each theme is defined in the `themes/` directory with complete specifications including:
- Cohesive color palette with hex codes
- Complementary font pairings for headers and body text
- Distinct visual identity suitable for different contexts and audiences

## Application Process

After a preferred theme is selected:
1. Read the corresponding theme file from the `themes/` directory
2. Apply the specified colors and fonts consistently throughout the deck
3. Ensure proper contrast and readability
4. Maintain the theme's visual identity across all slides

## Create Your Own Theme

If none of the existing themes fit:

1. Derive a new theme from the user's stated mood, audience, and artifact type.
2. Give it a concise descriptive name consistent with the existing naming style.
3. Define at minimum:
   - primary / secondary / accent colors
   - background and text colors
   - heading and body font pairing
4. Show the custom theme for review before applying it broadly.

## Output Contract

Return:

- chosen theme name
- theme file used, or note that a custom theme was created
- the artifact or files updated
- a brief note about the palette and typography direction

## Failure Handling

- If the showcase cannot be displayed, list the 10 theme names and their one-line descriptions in chat.
- If the user is undecided, recommend 2-3 themes based on artifact type and tone instead of stalling.
- If the artifact already has a locked brand system, explain the conflict before applying a new theme.

## Final Checklist

- Theme choice is explicit or well-justified
- Colors and fonts come from a real theme file or a clearly defined custom theme
- Contrast and readability remain intact
