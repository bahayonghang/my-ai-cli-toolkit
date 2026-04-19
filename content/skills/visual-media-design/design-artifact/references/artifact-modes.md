# Artifact Modes

Choose one primary mode before generating the artifact. A request can borrow a frame or template from another mode, but the primary mode decides what the artifact is trying to prove.

## 1. Product Prototype

Use when the user wants to explain a product task or interface:

- dashboard or workspace concept
- onboarding, checkout, settings, search, editor, or approval flow
- single-screen or multi-screen app exploration

Output shape:

- one screen or a small linked flow
- believable UI states and actions
- interaction only where it clarifies the task

Best template fit:

- `browser_window.jsx` for desktop app framing
- `ios_frame.jsx` when mobile context matters

## 2. Landing or Narrative Page

Use when the artifact should tell a story, sell an idea, or guide a reader through a product or concept:

- launch page
- feature story page
- product overview or vision page
- campaign or announcement concept

Output shape:

- one scrollable page
- strong section rhythm
- clear narrative progression instead of generic feature-card filler

Best template fit:

- no template by default
- `browser_window.jsx` only when the page needs to sit inside a product-shell presentation

## 3. HTML Deck or Storyboard

Use when the user thinks in slides, scenes, or a timed sequence:

- presentation deck
- storyboard
- pitch flow
- product walk-through sequence

Output shape:

- discrete screens or slides
- clear order and pacing
- navigation or playback that preserves the user's place

Best template fit:

- `deck_stage.js`

## 4. Motion Demo

Use when the artifact needs motion, timing, or playback to explain the idea:

- animated interaction concept
- transition study
- timed hero sequence
- before/after reveal or guided state change

Output shape:

- one HTML artifact with timeline or playback controls
- a small number of purposeful animated moments
- motion that explains structure, not decoration for its own sake

Best template fit:

- `animations.jsx`

## 5. Comparative Exploration

Use when the user wants multiple directions in one place:

- "show me 3 directions"
- "compare two layouts"
- "explore bold vs conservative"

Output shape:

- one artifact containing multiple labeled directions
- each direction differs in structure, pacing, interaction, or information hierarchy
- no trivial color-only variants

Best template fit:

- `design_canvas.jsx`

## Selection Rules

- If the request is about a user task or product surface, use **Product Prototype**.
- If the request is about telling a story or presenting a concept on one page, use **Landing or Narrative Page**.
- If the request is slide-like, scene-based, or ordered, use **HTML Deck or Storyboard**.
- If the value is in animation, timing, or motion, use **Motion Demo**.
- If the user explicitly wants options, use **Comparative Exploration**.

When in doubt, pick the mode that makes the communication goal easiest to verify.
