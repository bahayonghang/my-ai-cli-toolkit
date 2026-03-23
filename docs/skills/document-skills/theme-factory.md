# Theme Factory

Theme toolkit for styling generated artifacts such as slide decks, reports, documents, and HTML pages with a consistent visual identity.

## When to use it

- user wants to apply a visual theme to slides, reports, documents, or other generated artifacts
- an existing artifact already exists and needs a curated theme applied
- none of the bundled themes fit and a custom theme needs to be generated

## Workflow

1. show the bundled `theme-showcase.pdf` so the user can review available themes
2. ask the user to choose a theme explicitly
3. read the selected theme definition from `themes/`
4. apply the theme's colors and fonts consistently across the artifact
5. if needed, generate a custom theme and get confirmation before applying it

## Bundled themes

The skill ships with ten preset themes, including Ocean Depths, Sunset Boulevard, Modern Minimalist, Tech Innovation, and Midnight Galaxy.

## Main assets

- `theme-showcase.pdf` for visual selection
- theme specification files under `themes/`

## Notes

- The skill is artifact-agnostic: it can theme slides, documents, reports, or HTML outputs.
- It requires explicit user theme selection before applying a preset.
- If no preset works, the skill can generate a new theme on the fly and then apply it.
