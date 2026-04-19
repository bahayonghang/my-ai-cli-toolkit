# Design Artifact

Create HTML-first standalone design artifacts.

## When to Use

Use this skill when the user wants to:

- build a browser-openable product prototype or flow demo
- turn a brief into a landing, launch, or narrative page that still feels like a designed artifact
- create an HTML deck or storyboard instead of a PPTX
- show a motion concept or timed interaction in the browser
- compare a few design directions in one HTML artifact

This skill should still trigger when the user never says "HTML" explicitly, as long as the deliverable is clearly a standalone browser artifact.

## When Not to Use

- choose `brand-design-md` when the user names a real brand and wants that visual language imported into the output
- choose `theme-factory` when the artifact already exists and only needs a new theme, palette, or font direction
- choose `architecture-diagram`, `mermaid-expert`, `excalidraw`, or `fireworks-tech-graph` for diagram-first requests
- choose `card` for posters, long-image explainers, or knowledge cards
- choose `gemini-image` for raster illustration or image editing work

## Default Behavior

- **Default deliverable**: standalone `.html`
- **Default implementation**: inline CSS plus light JavaScript
- **Default posture**: read user-provided brief, screenshots, code, or tokens before inventing UI
- **Default delivery**: one artifact containing multiple directions when comparison matters

## Supported Modes

1. **Product Prototype** - app surfaces, workflows, states, and interaction logic
2. **Landing or Narrative Page** - launch, feature-story, and concept pages
3. **HTML Deck or Storyboard** - slide or scene-based communication in HTML
4. **Motion Demo** - timed interaction or animation studies
5. **Comparative Exploration** - multiple labeled directions in one artifact

## Starter Templates

The skill ships with reusable starter components instead of a single hard-coded shell:

- `design_canvas.jsx` for side-by-side comparison
- `browser_window.jsx` for desktop framing
- `ios_frame.jsx` for mobile framing
- `deck_stage.js` for HTML slide shells
- `animations.jsx` for timeline-based motion demos

These templates are optional. The skill should only load them when they clearly improve the artifact.

## Output Contract

Every delivery should report:

- final artifact path
- selected artifact mode
- context sources used for grounding
- key assumptions
- next iteration suggestions

## Main Supporting Files

- `content/skills/visual-media-design/design-artifact/SKILL.md`
- `content/skills/visual-media-design/design-artifact/references/artifact-modes.md`
- `content/skills/visual-media-design/design-artifact/references/workflow.md`
- `content/skills/visual-media-design/design-artifact/references/anti-slop.md`
- `content/skills/visual-media-design/design-artifact/references/starter-components.md`
- `content/skills/visual-media-design/design-artifact/references/verification.md`

## Notes

- This skill is still HTML-first even though the name no longer includes `html`.
- It deliberately avoids host-specific agent adapters and export scripts in this phase.
- If the user references an existing app, the skill should still default to a standalone HTML artifact unless they explicitly ask for in-place framework edits.
