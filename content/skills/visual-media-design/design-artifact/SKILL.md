---
name: design-artifact
description: "Create HTML-first design artifacts. Use this skill whenever the user wants a browser-openable product prototype, clickable flow demo, landing or storytelling page, HTML slide deck or storyboard, motion concept, or a few design directions in one artifact, even if they never say 'HTML'. Prefer this skill for net-new design exploration and standalone front-end artifacts. Do not use it for brand-style transfer, pure retheming, architecture diagrams, poster or card outputs, or raster image generation."
version: 2.0.0
category: visual-media-design
tags:
  - html
  - design-artifact
  - prototype
  - landing-page
  - deck
  - motion
  - ui
argument-hint: "[design-artifact-request]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
---

# Design Artifact

Use this skill to turn a brief, flow, screenshot, or code context into a browser-openable HTML design artifact.

This is the HTML-first design control surface for standalone artifacts. It covers product prototypes, launch or narrative pages, HTML decks or storyboards, motion demos, and multi-direction explorations. It should stay focused on artifact creation rather than brand transfer or media generation.

## Quick Positioning

Use this skill for:

- product surfaces, flows, and app concepts
- landing, launch, or storytelling pages that should feel like real artifacts rather than generic websites
- HTML slide decks or storyboards
- motion demos with meaningful playback or state changes
- side-by-side or toggleable exploration of a few strong design directions

Do not use this skill for:

- named-brand style transfer or design-system import -> `brand-design-md`
- theme, palette, or font replacement on an existing artifact -> `theme-factory`
- architecture, topology, trust-boundary, Mermaid, or Excalidraw diagrams
- poster, card, infographic, manga, or other long-image outputs -> `card`
- raster illustration, photo generation, or image editing -> `gemini-image`

## Route The Request

Start by reading `references/artifact-modes.md` and selecting one primary mode.

| Request shape | Primary mode | Load next | Optional template |
| --- | --- | --- | --- |
| App surface, flow, workspace, onboarding | Product Prototype | `workflow.md`, `anti-slop.md` | `browser_window.jsx`, `ios_frame.jsx` |
| Launch page, narrative page, feature story | Landing or Narrative Page | `workflow.md`, `anti-slop.md` | `browser_window.jsx` |
| Slides, storyboard, talk flow, sequence | HTML Deck or Storyboard | `workflow.md`, `verification.md` | `deck_stage.js` |
| Motion study, animated concept, timed reveal | Motion Demo | `workflow.md`, `verification.md` | `animations.jsx` |
| Compare directions in one artifact | Comparative Exploration | `workflow.md`, `anti-slop.md` | `design_canvas.jsx` |

Read `references/starter-components.md` only when one of the shipped templates materially reduces work or improves quality. Read `references/verification.md` before delivery.

## Workflow

1. Read the user brief and any provided screenshots, code, tokens, or copy before designing.
2. Pick the artifact mode first. Then load only the references needed for that mode.
3. Ask only the smallest set of clarifying questions needed to avoid building the wrong artifact. Focus on audience, primary goal, platform, fidelity, and whether the user wants one direction or several.
4. Default to one standalone HTML file with inline CSS and lightweight JavaScript. Split into a few support files only when that clearly improves maintainability.
5. Keep multiple directions inside one artifact when practical. Prefer labeled sections, toggles, or a comparison canvas over many unrelated files.
6. Resolve the output path:
   - use the user-provided filename when present
   - otherwise save `{descriptive-slug}.html` in the working directory
7. Verify with the best path available in `references/verification.md`.
8. Return the required output contract.

## Existing Codebase Requests

If the user references an existing app or codebase:

- inspect the existing product vocabulary first
- preserve the domain language, navigation logic, and density cues you find there
- still default to a standalone HTML artifact unless the user explicitly asks for in-place framework edits

Do not silently convert "explore this feature" into production React or Vue edits.

## Output Contract

Always return:

- the final artifact path
- the selected artifact mode
- the context sources used for grounding
- the key assumptions that shaped the result
- the most useful next iteration suggestions

Do not paste full HTML into chat unless the user explicitly asks for inline code.

## Failure Handling

- If the real need is brand mimicry, route to `brand-design-md`.
- If the real need is retheming an existing deliverable, route to `theme-factory`.
- If the user wants a diagram, route to the diagram skill that matches the artifact type.
- If the request is too vague to identify the artifact goal, ask for the missing communication or product objective instead of inventing a random shell.
- If verification could not be completed because the host lacks preview capability, say what you checked locally and what remains unverified.

## Final Checklist

- The trigger matches an HTML-first design artifact request.
- The artifact mode was chosen intentionally.
- User-provided context was read before generating UI.
- The deliverable is a browser-openable HTML artifact.
- Variations, if any, differ in structure, pacing, or interaction rather than color only.
- The delivery message includes all 5 output-contract items.
