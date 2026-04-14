# Brand Design MD

Use this skill when the user wants UI output that matches a **specific real brand, product, or media site's design language** and expects the model to pull structured guidance from `getdesign.md` before generating code.

Typical triggers:

- “做成 Apple / Notion / Claude / Stripe 的感觉”
- “参考某个品牌官网风格生成页面”
- “把现有 React / Vue 组件改成某品牌风格”
- “混搭两个明确品牌的视觉语言”

## What it does

1. resolves the requested brand through a local helper plus the live `getdesign list` catalog
2. retrieves the matching `DESIGN.md` with a deterministic `--out` path
3. extracts concrete tokens such as color, typography, spacing, radius, and shadow rules
4. generates UI code that follows those values directly
5. separates greenfield prototype work from existing-project component edits

## Best for

- branded landing pages or sections
- style transfer from known product design systems
- mixed-brand UI directions with explicit token blending
- existing component restyling when the target brand is explicit

## Notes

- This skill is strongest when the user names a brand directly.
- The supported brand set is live, not hard-coded; as of 2026-04-14 the upstream catalog returned 66 brands.
- If the requested brand is unknown, the skill should surface the closest live suggestions instead of guessing.
- It should not be the first choice for generic “make it nicer”, logos, posters, slides, diagrams, or image generation.
