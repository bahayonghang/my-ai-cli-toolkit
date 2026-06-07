---
name: beautiful-mermaid-editor
description: >-
  Modify the Beautiful Mermaid live editor itself rather than writing ordinary
  Mermaid diagrams. Use when the task mentions the Beautiful Mermaid repo,
  `editor.ts`, generated `editor.html`, config panel/options, themes or dark
  mode, zoom, PNG/SVG export, clipboard behavior, sample presets, or renderer
  wiring for the editor. Do not use for generic Mermaid syntax help or normal
  Markdown Mermaid authoring.
category: docs-writing-publishing
tags:
  - mermaid
  - diagram-editor
  - bun
  - typescript
  - live-editor
  - svg-export
argument-hint: "[path-to-beautiful-mermaid-repo-or-editor-task]"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Beautiful Mermaid Editor

Work from the Beautiful Mermaid editor source tree, not from generated HTML output.

## Preconditions

1. If `$ARGUMENTS` includes a repo path, treat it as the starting point.
2. Before proposing edits, read the target repo's `AGENTS.md`, package scripts, and current editor source.
3. Treat `editor.ts` as the source of truth. Do not edit generated `editor.html` directly unless the target repo explicitly requires committed build artifacts.

## Execution flow

### 1. Locate the real edit surface

- Find the Beautiful Mermaid repo root and the `editor.ts` file that generates `editor.html`.
- Read the current build/dev entrypoints (`package.json`, `dev.ts`, Bun scripts, or equivalents) before assuming command names.
- Identify adjacent source files only after locating the concrete change path:
  - `src/browser.ts`
  - `src/types.ts`
  - `src/theme.ts`
  - `src/styles.ts`
  - `samples-data.ts`

### 2. Route by task type

Load only the references needed for the requested change:

| Task type | Load first |
| --- | --- |
| Config panel, color control, slider, sample preset | `references/CHANGE_PATTERNS.md` |
| Render pipeline, theme, dark mode, zoom, export, clipboard | `references/ARCHITECTURE.md` |
| Rebuild commands, smoke checks, generated artifact review | `references/VERIFICATION.md` |
| Renderer support or new `RenderOptions` field | `references/ARCHITECTURE.md` + `references/CHANGE_PATTERNS.md` |

### 3. Inspect before editing

Trace the current behavior through the real code path before changing anything:

1. UI control or action handler in `editor.ts`
2. local editor state
3. `buildOptions()` / render call
4. SVG post-processing, theme sync, zoom, or export path

Prefer extending the existing flow over creating parallel state or duplicate helpers.

### 4. Implement with the existing patterns

- **Config option / control**: wire UI, local state, `readConfig()`, and events together.
- **SVG override**: follow the post-render injected-style pattern and rerun it after every render.
- **Renderer support**: add the field to `RenderOptions`, then thread it through the theme/renderer helpers.
- **Theme / dark mode**: preserve the existing auto-theme vs manual-theme behavior.
- **Zoom**: preserve viewBox-based width/height updates; do not switch to CSS `transform: scale(...)`.
- **Export / clipboard**: keep SVG/PNG/clipboard behavior aligned and inspect scale handling.
- **Samples**: update the editor's sample source and category behavior rather than only editing showcase data.

Detailed edit recipes live in `references/CHANGE_PATTERNS.md`.

### 5. Verify before handoff

Read `references/VERIFICATION.md` before finalizing. At minimum:

- regenerate the editor artifact from source when source changed
- run the smallest relevant project checks
- smoke-test the edited workflow in a browser if the task affects UI, render, export, theme, or zoom
- review whether generated `editor.html` should be included in the final diff

## Rules

- Do not assume the target repo still matches older architecture notes; re-read the current source first.
- Do not expose new UI options that the renderer cannot actually support.
- Do not treat generic Mermaid authoring or syntax questions as editor-maintenance tasks.
- When the request is really about ordinary Mermaid content, decline this skill and use a normal docs/writing workflow instead.

## Progressive disclosure

- `references/ARCHITECTURE.md` — current state model, render pipeline, theme/CSS variables, sharing, and export paths.
- `references/CHANGE_PATTERNS.md` — step-by-step change recipes for controls, samples, SVG overrides, renderer support, and related edits.
- `references/VERIFICATION.md` — rebuild commands, targeted checks, browser smoke scenarios, and generated-artifact review.
