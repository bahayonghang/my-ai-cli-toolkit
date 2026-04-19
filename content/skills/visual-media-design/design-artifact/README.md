# Design Artifact

`design-artifact` is the HTML-first control surface for standalone design artifacts in this repository.

It is meant for requests that should end as a browser-openable artifact rather than a framework patch, a diagram file, or a raster image.

## What it covers

- product prototypes and flow demos
- landing or narrative pages
- HTML decks and storyboards
- motion demos
- comparative exploration inside one artifact

## What it does not cover

- brand-style transfer -> `brand-design-md`
- pure retheming -> `theme-factory`
- diagrams -> `architecture-diagram`, `mermaid-expert`, `excalidraw`, `fireworks-tech-graph`
- long-image cards or posters -> `card`
- raster image generation -> `gemini-image`

## Package Structure

```text
design-artifact/
├── SKILL.md
├── README.md
├── evals/
│   ├── evals.json
│   └── trigger-evals.json
├── references/
│   ├── anti-slop.md
│   ├── artifact-modes.md
│   ├── starter-components.md
│   ├── verification.md
│   └── workflow.md
└── templates/
    ├── animations.jsx
    ├── browser_window.jsx
    ├── deck_stage.js
    ├── design_canvas.jsx
    └── ios_frame.jsx
```

## Working Model

The skill stays thin:

- `SKILL.md` selects the artifact mode and routes to the right reference files
- `references/` carries the durable rules for mode choice, workflow, anti-slop checks, starter templates, and verification
- `templates/` provides zero-dependency scaffolds for common artifact shells
- `evals/` gives both output eval prompts and trigger-boundary prompts

## Notes

- This package deliberately avoids host-specific agent adapters and export scripts.
- The default delivery remains browser-openable HTML even though the skill name no longer says `html`.
- If a later iteration needs PPTX, PDF, or host-specific preview adapters, add them as a second phase instead of bloating this first pass.
