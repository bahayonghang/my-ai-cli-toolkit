# Fresh-context review prompt

Use this prompt after `slop_check` reports no open FAIL and every REFLEX is fixed or waived. It asks a reader who did not build the page to judge it the way a visitor would. The structure follows hallmark's `review-hero.md` and `review-finish.md` (MIT, commit `8f6969f8`); the wording is new.

## How to run it

1. Take screenshots: the first screen at about 1440px wide, the same at about 390px, and one full-page capture at desktop width. Note the file paths.
2. Start a subagent with no history from the build. Give it the prompt below with the three inputs filled in. Do not paste your build notes, your reasoning, or the `slop_check` output; the reviewer should see what a visitor sees, plus the contract.
3. If the host has no subagent, run the prompt yourself in a clean pass: read only the inputs, answer in the format, and mark the result `自检，非独立复核` in the final report.
4. `fix` means: apply the listed fixes, rerun `slop_check`, and review once more. `rebuild` means: return to the composition step. Stop after three review rounds and report what is still open.

## Prompt

```text
You are reviewing a web page you did not build. Judge it as its first visitor would, then as a designer
checking it against its written contract.

Inputs
- Screenshots: <paths: desktop first screen, mobile first screen, desktop full page>
- Contract: <path to DESIGN.md>
- Page source: <paths to the page files>

Read DESIGN.md first. It is the contract: colours, type, spacing, components, the x-theme block if present,
and any "## Anti-slop Waivers" lines. A choice the contract declares is not a fault.

First screen (look at the desktop and mobile first screens only)
1. In five seconds, can you tell what this is, who it is for, and what to do next?
2. Does one element clearly lead, or do several compete?
3. Would this first screen still make sense with the brand name swapped for another? If yes, it is generic.
4. Is anything on it invented: a customer logo, a metric, a quote, a person, an award?

Whole page (full-page screenshot and source)
5. Does each section earn its place with real content, or is it filler (feature-card grids, stock testimonials,
   a closing call to action that repeats the hero)?
6. Do the colours, faces and radii match DESIGN.md? Name any value that drifts.
7. Does the type set a clear order (display, section head, body, small text) without labels shouting in
   tracked capitals or monospace for decoration?
8. Read the copy aloud. Flag stock phrases, rhetorical patterns repeated three times, buzzwords, and labels that
   could sit on any product.
9. Check the details at close range: alignment edges, spacing rhythm between sections, one icon style,
   image crops, focus rings, hover and disabled states visible in the source.

Answer format (nothing before the first word)
- First word: ship, fix, or rebuild.
  ship    = a visitor would trust it and the contract holds.
  fix     = the structure is right; specific issues remain.
  rebuild = the first screen or the section order fails; patching will not save it.
- Then at most five issues, most important first. Each one line:
  <where: section or selector> · <what is wrong, concretely> · <the change to make>
- No praise, no summary, no issue you cannot point to on a screenshot or in the source.
```

## Recording the result

Put the verdict and the issue lines in the final report under "Review". State whether the review was independent (a subagent) or `自检，非独立复核`.
