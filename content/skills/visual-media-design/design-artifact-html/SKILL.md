---
name: design-artifact-html
description: "Create HTML-first web product prototypes. Use when the user wants a browser-openable product mockup, clickable prototype, UI flow demo, onboarding concept, dashboard concept, app walkthrough, or one-page product experience in HTML, even if they do not explicitly say 'HTML'. Prefer this skill for net-new web front-end prototypes and interaction concepts. Do not use it for brand-style transfer, deck theming, architecture diagrams, posters, or image generation."
version: 1.0.0
category: visual-media-design
tags:
  - html
  - prototype
  - ui
  - product-design
  - frontend
  - mockup
  - interaction
argument-hint: "[product-prototype-request]"
allowed-tools:
  - Read
  - Write
  - Grep
  - Glob
---

# Design Artifact HTML

Use this skill to turn a product idea, flow, or UX brief into a browser-openable HTML prototype.

This skill is for **web front-end product prototypes**, not for copying a brand or decorating an existing artifact with a new theme. It is strongest when the user wants to explore a product idea, screen flow, or interaction model quickly in HTML.

## When To Use

- Net-new product prototypes in HTML
- Clickable flow demos for onboarding, settings, dashboards, search, forms, or workspace UIs
- One-page product concept explorations that still feel like a real product interface
- Multi-screen mockups that should open directly in a browser without a framework setup
- Design explorations where the user wants to compare a few UI directions in one HTML artifact

## Do Not Use

- Brand or visual-language transfer requests such as “make it feel like Apple / Stripe / Claude” → use `brand-design-md`
- Theme or palette replacement on an existing artifact → use `theme-factory`
- Architecture diagrams, Mermaid, Excalidraw, or SVG-only diagram work
- Posters, cover art, image generation, or non-product illustration work
- Slide decks, presentation pages, or PPT-oriented deliverables

## Inputs

Typical inputs:

- a product brief, feature idea, or UX problem statement
- optional screenshots, component files, design system files, or code paths
- optional constraints such as device type, audience, fidelity, or number of screens

If the user supplies code, styles, screenshots, or design tokens, read them before designing. Treat them as grounding context.

## Workflow

1. Read `references/artifact-modes.md` to choose the right prototype mode before generating anything.
2. Read any user-provided product brief, code, screenshots, or design-system context first. If the request points at an existing codebase, inspect the closest UI structure and style cues.
3. If key product facts are missing, ask only the smallest set of clarifying questions needed to avoid designing the wrong thing. Focus on:
   - target user or audience
   - main task to prototype
   - platform or device
   - desired fidelity
   - whether the user wants one direction or a few
4. Read `references/workflow.md` and `references/anti-slop.md` before writing the prototype.
5. Choose an output shape:
   - default to one standalone HTML file with inline CSS and JS
   - only split into a small number of support files when that clearly improves maintainability
6. Build the artifact around a believable product task, not around decorative sections. Use realistic UI states, hierarchy, actions, and navigation.
7. When the user wants multiple directions, keep them inside one HTML artifact when possible so comparison is easy.
8. Resolve the output path:
   - use the user-provided filename when present
   - otherwise save as `{descriptive-slug}-prototype.html` in the working directory
9. Write the artifact to disk and return the path, chosen prototype mode, major assumptions, and the context sources you used.

## Existing Codebase Requests

If the user references an existing app or codebase:

- inspect the existing visual and product vocabulary first
- preserve the product domain and interaction model
- still default to delivering a standalone HTML prototype unless the user explicitly asks for in-place framework edits

Do not silently switch from “prototype an idea” to “modify production React/Vue code”.

## Quality Bar

The prototype should feel like a product design artifact, not a generic AI webpage.

Minimum expectations:

- clear information hierarchy
- believable user task and screen logic
- realistic empty, active, or error states when relevant
- strong spacing, alignment, and density discipline
- minimal but meaningful interactions
- no filler metrics, fake charts, or decorative sections that do not help the concept

## Output Contract

Always return:

- the final file path
- the chosen prototype mode
- a short note on the primary design direction
- any important assumptions
- which inputs or references were used for grounding

Do not paste the full HTML into chat unless the user explicitly asks for inline code.

## Failure Handling

- If the request is really about brand mimicry, route to `brand-design-md` instead of forcing a product prototype workflow.
- If the request is really about recoloring or retheming an existing artifact, route to `theme-factory`.
- If the request is too vague to determine the product task, ask for the missing product objective instead of inventing a random SaaS shell.
- If the user asks for implementation inside a framework but only gives a concept brief, explain that this skill defaults to a standalone HTML prototype unless they provide the target code context.

## Final Checklist

- Trigger choice matches an HTML product-prototype task
- Prototype mode was selected intentionally
- User-provided context was read before designing
- Output is browser-openable HTML
- UI states and interactions support a real product task
- The artifact avoids generic AI UI filler
