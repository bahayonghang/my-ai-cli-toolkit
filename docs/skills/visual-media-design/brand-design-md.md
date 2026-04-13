# Brand Design MD

Use this skill when the user wants UI output that matches a **specific brand design language** and expects the model to pull structured design guidance from `getdesign.md` before generating code.

It is designed for prompts like:

- “做成 Apple / Notion / Claude / Stripe 的感觉”
- “参考某个品牌的设计风格生成页面”
- “混搭两个品牌的视觉语言”

## What it does

1. maps the requested brand to the right slug
2. retrieves the corresponding `DESIGN.md` with `npx getdesign@latest add <slug>`
3. extracts concrete tokens such as color, typography, spacing, radius, and shadow rules
4. generates UI code that follows those values closely instead of loosely imitating the style

## Best for

- branded landing pages or sections
- brand-matched UI explorations
- style transfer from known product design systems
- mixed-brand design directions with explicit token blending

## Notes

- This skill is most useful when the user names a brand or a recognizable product style directly.
- It prefers exact design-token reuse over vague “inspired by” aesthetics.
- If the requested brand is unknown, it should surface the supported list and suggest the closest alternative.
