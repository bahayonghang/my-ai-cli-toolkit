# Workflow Guidance

## 1. Understand the artifact goal

Start from the user's communication goal, not from a favorite layout pattern.

Lock these facts as early as possible:

- who the artifact is for
- what the artifact needs to prove or communicate
- what the primary action, message, or progression is
- which parts need real interaction versus clear static presentation

## 2. Ground in real context

If the user provides any of these, read them before inventing UI:

- screenshots
- code paths or component files
- tokens or style files
- copy, notes, or content outlines
- slide structure or scene beats

Reuse the vocabulary you find there. Do not replace grounded context with generic AI design defaults.

## 3. Lock the mode, then the shell

Choose the primary mode from `artifact-modes.md` before writing the artifact.

Then decide whether a starter component actually helps:

- use a frame when context matters
- use a deck shell when sequence matters
- use an animation scaffold when time matters
- skip templates when they add no real value

## 4. Design around task, message, and states

Every artifact needs a main path:

- product artifacts need believable states and actions
- narrative pages need a clear section arc
- decks need slide-to-slide pacing
- motion demos need a clear before/after or timed progression

Only include states or sections that help explain the idea. If a state, control, or section teaches nothing, remove it.

## 5. Keep implementation simple

Default to:

- one standalone HTML file
- inline CSS
- light JavaScript only where needed

Split into a few support files only when the artifact becomes hard to maintain as one document or when a starter template already solves a non-trivial problem.

## 6. Preserve credibility

If the artifact references an existing app or codebase:

- keep the product domain and interaction model
- borrow real layout, spacing, and copy cues where possible
- still default to a standalone HTML artifact unless the user explicitly asked for in-place framework edits

Do not quietly switch a design-artifact request into production-code implementation.

## 7. Close with explicit delivery notes

When returning the artifact, always state:

- what mode you chose
- which context sources you used
- what you assumed
- what the user should adjust next

This keeps the next iteration grounded instead of reopening the whole problem.
