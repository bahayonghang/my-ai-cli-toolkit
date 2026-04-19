# Verification Guidance

Read this before delivery. The artifact is not done until it has been checked with the best path the host allows.

## Path A: Preview-Capable Host

If the host can open local HTML and inspect it:

1. open the artifact in preview
2. check for console errors or failed script execution
3. visually inspect the default state
4. exercise the primary interaction, navigation, or playback path
5. confirm labels, controls, and comparison directions are understandable without extra explanation

If the artifact contains multiple directions, verify that each direction is visible, labeled, and meaningfully different.

## Path B: No Preview Capability

If the host cannot preview HTML:

1. confirm the final file exists at the reported path
2. inspect the written HTML for obvious truncation, broken tags, or unresolved placeholders
3. scan for obvious filler such as `Lorem ipsum`, `TODO`, or unchanged starter text
4. verify template-specific wiring in source
5. state clearly which runtime behaviors remain unverified

Do not claim screenshot or interaction verification if the host could not actually render the page.

## Template-Specific Checks

### Product or Landing Artifacts

- the primary action or message is visible above the fold
- sections and controls belong to the artifact's main goal
- fake metrics, filler sections, and dead controls have been removed

### HTML Deck or Storyboard

- slide order is obvious
- keyboard or click navigation works if provided
- the slide shell preserves position between refreshes
- slides are labeled or auto-labeled for review context

### Motion Demo

- play/pause works
- scrubber or progress control works
- the timed sequence explains a change or progression, not just visual flair

### Comparative Exploration

- every direction is labeled
- at least two dimensions vary across directions
- the artifact makes side-by-side review easy without opening multiple files

## Delivery Rule

Return only what you actually verified.

If you used fallback-only verification, say so and name the remaining runtime risk in one short sentence.
