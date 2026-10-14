# Brand Boundary

Use this file every time you implement UI from a `brand:*` entry. Style entries (`style:*`) are generic and need only rule 4.

The brand entries describe publicly visible CSS values of real websites. The upstream collection states that it does not claim ownership of any site's visual identity. The output of this skill is UI inspired by a design language, not a copy of a brand.

## Rules

1. Do not reproduce logos, wordmarks, brand marks, mascots, or product names of the referenced brand in the user's UI. Use the user's own brand name, or a neutral placeholder.
2. Do not download, embed, or self-host a proprietary brand typeface (for example, a custom brand sans or serif listed in the entry). Use the substitute from the entry's `Known Gaps` or typography notes. When the entry gives no substitute, use an open font of the same class:
   - geometric or grotesque sans → Inter, Geist, or system-ui
   - humanist sans → Source Sans 3 or Open Sans
   - display serif → Cormorant Garamond, EB Garamond, or Georgia
   - monospace → JetBrains Mono, IBM Plex Mono, or ui-monospace
3. Do not copy brand photography, illustrations, or icons. Use the user's assets or neutral placeholders.
4. Do not present the result as the referenced company's product or as an official design. Describe it as "inspired by <brand> design language" when you name the source.
5. When the user asks for an exact clone of a brand site for public use (logo, name, and copy included), explain rules 1 to 4 and offer the inspired version.
6. Keep the provenance comment that `apply` writes in `DESIGN.md`.

## Attribution

Catalog entries come from:

- [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) — MIT, Copyright (c) 2026 VoltAgent
- [bergside/awesome-design-skills](https://github.com/bergside/awesome-design-skills) — MIT, Copyright (c) 2026 Bergside

Full license texts: `assets/catalog/LICENSES/`. Source commits: `assets/catalog/index.json` → `sources`.
