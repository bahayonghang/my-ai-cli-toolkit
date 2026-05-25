# Beautiful Mermaid verification

Use the target repo's current scripts as the source of truth. The commands below describe the classic Beautiful Mermaid layout and should be adapted if the repo has drifted.

## 1. Re-check the actual scripts first

Before running commands, inspect the current repo for:

- `package.json`
- `bunfig.toml`
- `dev.ts`
- task runner files or README build notes

Do not hardcode `bun run editor` or `bun run dev` if the target repo renamed them.

## 2. Minimum rebuild rule

If you changed `editor.ts` or any source that feeds the generated editor page:

```bash
bun run editor
```

If the repo expects committed build artifacts, review the generated `editor.html` diff after rebuilding.

## 3. Iteration loop for UI work

For interactive changes, prefer the repo's dev/watch command, commonly:

```bash
bun run dev
```

Use it for:

- config panel changes
- theme/dark-mode edits
- zoom behavior
- export or clipboard UI changes
- sample preset changes

## 4. Targeted checks

Run the smallest relevant checks exposed by the target repo, for example:

- typecheck or build
- editor-specific tests
- lint for touched files
- smoke checks for generated artifacts

If the repo has no dedicated tests, say so and compensate with stronger manual smoke coverage.

## 5. Browser smoke scenarios

When the task affects rendering or UI behavior, verify the changed flow manually:

### Config or control changes

- control renders in the expected section
- default value is correct
- changed value updates preview
- rerender keeps or intentionally resets the value

### Theme / dark mode

- light mode
- dark mode
- auto theme behavior
- manual theme selection remains stable across mode toggles

### Zoom

- zoom in/out changes actual preview size
- scroll container still behaves correctly
- rerender preserves zoom

### Export / clipboard

- Save PNG works
- Save SVG works
- Copy image / clipboard path works or fails gracefully
- exported output matches preview styling

### Samples

- sample appears in the expected category
- selecting it updates the editor input and preview
- no existing sample navigation regressed

## 6. Generated artifact review

If `editor.html` is tracked and regenerated:

1. Confirm the HTML diff is explainable from the source change.
2. Check that the updated inline bundle or template is consistent with the edited source.
3. Avoid mixing unrelated regenerated noise into the final patch.

If the repo does **not** commit generated output, keep the verification note explicit: source changed, artifact regenerated locally, generated file intentionally not committed.

## 7. Final handoff checklist

Before closing the task, be able to state:

- which source files changed
- whether `editor.html` was regenerated
- which commands were run
- which browser smoke scenarios were exercised
- any remaining gaps, such as clipboard behavior that could not be fully verified in the current environment
