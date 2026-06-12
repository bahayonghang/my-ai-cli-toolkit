# Component Guidelines

> How docs-site UI pieces are handled in this repository.

## Overview

There is no reusable Vue component library in this repo today. The docs site is Markdown-first, and the default path should be authored pages or generated catalog pages. Add a Vue component only when a page genuinely needs a small amount of reusable interactivity that Markdown and frontmatter cannot express cleanly.

## Component Structure

- Keep any future Vue component page-local and colocated with the docs feature that uses it.
- Do not create a shared `components/` package for the docs site unless multiple pages need the same UI.
- Prefer VitePress frontmatter, markdown tables, and generated pages before introducing component files.

## Props Conventions

- Keep props narrow and content-oriented: strings, booleans, arrays, and plain objects.
- Make required data required.
- Do not pass generated catalog data through long prop chains when the generator or page frontmatter can provide it directly.

## Styling Patterns

- Use the VitePress theme, markdown, and local page structure first.
- Keep authored home pages simple: frontmatter `hero`, `features`, headings, lists, and links.
- Avoid recreating site chrome in each page.
- If a component needs local styling, keep the CSS close to the component and scoped to that feature.

## Accessibility

- Use semantic Markdown headings and descriptive link text.
- Keep visible labels on navigational actions.
- Do not rely on icon-only controls for core page navigation.
- Keep bilingual pages structurally aligned so the content remains easy to compare.

## Common Mistakes

- Building a component layer to mirror content that is already generated.
- Using a wrapper component when Markdown or frontmatter is enough.
- Splitting simple site navigation into multiple ad hoc components.
- Adding a component before checking whether the sync script should own the markup instead.

## Examples

- `docs/index.md` uses `layout: home` with `hero` and `features` frontmatter.
- `docs/en/index.md` mirrors the Chinese landing page structure.
- `docs/skills/git-github-collaboration/git-commit.md` is generated Markdown, not a component.
- `docs/.vitepress/config.mts` owns the shared site shell.
