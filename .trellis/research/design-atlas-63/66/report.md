# #66 · Equipment directory density

On the original cards, FE-01’s Inspect/Pick pair sat below a 48 px gap and only 12 px above FE-02’s title box. Clicking still acted on FE-01. The restyle placed related controls inside ruled rows. The compact comparison control already grouped them correctly; its conditional restyle kept all four project files byte-for-byte.

## Browser results

Windows headless Edge 158.0.4370.33, empty pick list, same 24 instruments. Each count includes only whole records inside the visible `#records` pane. Each counted row had both Inspect and Pick enabled, tabbable and hit-testable. Positions are actual, stable CSS-pixel offsets. Two top requests per viewport produced one top sample.

| Viewport | Actual scrollTop | Original cards | Restyled cards | Compact control |
| --- | ---: | ---: | ---: | ---: |
| 1440 × 900 | 0 | 5 | 12 | 13 |
| 1440 × 900 | 360 | 4 | 11 | 12 |
| 390 × 844 | 0 | 4 | 6 | 6 |
| 390 × 844 | 360 | 4 | 5 | 6 |

The desktop pane was 730 px high. The restyle reduced its scrolling content from 3367 to 1424 px. The narrow pane was 683 px high; its content fell from 3367 to 2718 px. Stacking the controls below the equipment on narrow screens preserved a full-width reading line and cost space compared with the control’s side column. The control showed one additional whole row at the second narrow-screen sample.

At all twelve samples across these three pages, the first complete record responded to a pointer click on Inspect. Tab reached its Pick button; Space selected only that ID, then cleared it on a second press. Read the receipt for every visible ID and action and the observed detail/selection messages. Full-size screens were inspected for visual ownership as well. [Browser observations](browser.jsonl) · [Narrow original](cards-before-390.png) · [Narrow restyle](cards-after-390.png) · [Desktop comparison control](comparison-1440.png)

## Reproduction and model results

Use the [fixture instructions](../../../../skills/development-workflows/design-atlas/tests/fixtures/task-aware/density/README.md) to create the working copy and run the browser check. To replay the edited output, run `git apply <absolute-path-to-restyle.diff>` from a separate cards fixture copy. The patch applied cleanly in the untouched input. [Actual edits](restyle.diff)

Five fresh Codex CLI sessions used `gpt-6.2-astra` at medium reasoning, one isolated project per invocation. Each received the natural user request, the SKILL.md path, the matching audit/restyle entry, a concrete source target, the same measurement helper and the local Edge launch instructions. Only the target project files were available in that working directory. Screenshots and audit reports were saved outside it. The fixed baseline skill was extracted at `493a1a3aaf7e6da98dc9cc34629b5a13affb5c86`; revised references were tested on the ticket branch starting at `14255fb1`. [Actual final replies](outputs.md)

| Session | User-facing outcome |
| --- | --- |
| Old compact audit | Preserved all records and actions but counted the task words against gate 58 (157 and 153 at desktop positions). |
| Revised compact audit | Retained the grid/density and explicitly excluded required text from the marketing guidance. Suggested separate refinements to narrow-price alignment and selection feedback. |
| Revised cards audit | Identified FE-01’s operation beside FE-02, its 48 px gap and gate 3; reported current counts only. |
| Revised cards restyle | Edited two presentation files. JavaScript, data and DESIGN.md were byte-identical; measured all four positions before and after. |
| Revised compact restyle | Prompt asked to adjust row spacing and ownership only if needed. Returned a no-change decision with correct counts and operations. All four files matched the supplied control by SHA-256. |

A separate sixth session ran the fresh-context review of the edited cards with only the contract, page source and desktop, narrow and full-document captures. Its entire verdict was `ship` (session `01a2106d-5c59-7cc1-90ff-40905fabfe16`). The full-document capture shows the outer document; the second pane position was observed separately by the browser check.

Every audit copy matched its complete four-file input by SHA-256. The scanner inspected the isolated target HTML and stylesheet in each project. It reported zero Floor/House failures, Reflex findings, warnings or waivers on each original and the edited page. This judgement of visual grouping came from running-page inspection; gate 4 and DA1 retained their existing scope.

The stdlib regression ran red before the sampler existed and green with observed-position deduplication. An isolated mutation using the requested offset failed the same regression on two requests clamped to the same actual position. Root `just ci` passed on Windows, including 351 passed Node tests and 51 environment-dependent skips. The audit examples compare one old model run and one revised run on the grid. Both already retained the data, so they establish a difference in word-count reasoning only. Touch hardware, screen-reader announcements, other engines and native GPUI were outside this Web fixture’s observations.
