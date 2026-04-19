# Design Artifact HTML

Use this skill when the user wants an **HTML-first web product prototype** rather than a themed deck, diagram, or image.

Typical triggers:

- “做一个 browser-openable clickable prototype”
- “Turn this product brief into an HTML mockup”
- “Make a multi-screen onboarding flow demo in HTML”
- “Give me a one-page product concept that feels like a real app”

## What it does

1. classifies the request into a prototype mode such as concept screen, flow prototype, interactive demo, or comparative exploration
2. reads any provided screenshots, code, design tokens, or brief before inventing UI
3. defaults to a standalone HTML artifact with inline CSS and light JavaScript
4. builds around believable product tasks, states, and interactions instead of generic marketing sections
5. returns the generated file path, chosen mode, and key assumptions

## Best for

- net-new product interface prototypes
- clickable workflow demos
- dashboard and workspace concepts
- onboarding, form, and settings explorations
- comparing a few front-end product directions in one artifact

## Notes

- This skill is intentionally **HTML-only** in its first version.
- If the user references an existing app, the skill should still default to a standalone HTML prototype unless they explicitly ask for in-place framework edits.
- It should not be the first choice for brand-style transfer, theme replacement, diagrams, posters, or slides.
- The output should feel like a product design artifact, not a generic “modern SaaS” landing page.
