# Interactive Editor

## Use when

Temporary local editors for JSON/YAML/config/prompt/checklist data, triage forms, and structured export tools.

## Do not use when

The user asks for production UI implementation, remote data entry, or server persistence.

## Information architecture

- Input or form pane.
- Preview pane.
- Validation panel.
- Diff/export panel.
- Instructions and constraints.
- Empty, error, and success states.

## Visual direction

App-like two-pane layout with sticky action bar, clear affordances, and visible local-only privacy notice.

## Core components

Textarea/form controls, preview card, validation messages, diff output, and copy/export buttons.

## Interaction pattern

Perform local validation only, copy as JSON/Markdown/diff, reset sample data, and support keyboard-first form navigation. See `interaction-cookbook.md` — recipe 6 (native `<dialog>`) for confirm-reset prompts, recipe 9 (copy with feedback) for export buttons, recipe 8 (theme toggle) when the editor will be used in mixed light/dark contexts.

## Accessibility notes

Associate labels with fields, announce validation changes with `aria-live`, and never submit data over the network.

## Minimal HTML skeleton

```html
<section id="editor" aria-labelledby="editor-title">
  <h2 id="editor-title">Editor</h2>
  <div class="callout">
    <strong>Local-only:</strong> validation and export run in this page; no
    network requests are made.
  </div>
  <label for="json-input">JSON input</label>
  <textarea id="json-input" rows="10" aria-describedby="json-status"></textarea>
  <p id="json-status" aria-live="polite"></p>
  <div>
    <button type="button" data-copy="#json-input">Copy JSON</button>
    <button type="button" data-export="markdown">Export as Markdown</button>
    <button type="button" data-reset>Reset to sample</button>
  </div>
</section>
<section id="preview" aria-labelledby="preview-title">
  <h2 id="preview-title">Preview</h2>
  <article class="card" id="preview-card" aria-live="polite"></article>
</section>
```
