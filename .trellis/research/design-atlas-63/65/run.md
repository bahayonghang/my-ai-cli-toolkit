# #65 · Colour in a two-ink proof desk

The printer reads the pass order, selects a plate and checks whether the sheet is a production colour reference. The two editions use the same local HTML, DESIGN.md and interaction. Only three CSS declarations differ. The two natural requests and preparation steps are in the [fixture](../../../../skills/development-workflows/design-atlas/tests/fixtures/task-aware/colour/README.md).

## Fresh skill runs

Four separate ephemeral Codex CLI 0.172.0 sessions used `gpt-6.2-astra` at medium reasoning on Windows. Each session received one prepared project copy, its request, the worktree skill entry point and the available headless Edge launch command. Reports and captures went outside the input. The expectations and comparison edition were withheld. The initial transport retry produced no model output or edits. The four completed sessions used the same runner and model.

| Edition | Read-only audit | Restyle |
| --- | --- | --- |
| Supplied | Identified the incorrect B key and faint notice, kept the radio state and suggested removing the heavy rule. Project tree and bytes matched the three inputs. | Removed the edition overrides and stylesheet link. All job data, controls and the existing design contract stayed intact. |
| Expressive control | Passed the ink key, interaction and disclosure. Project tree and bytes matched the control. | Accepted the strong ink colours and dark panel. All three files remained byte-identical. |

Read the [four actual responses](outputs.md) and the [actual restyle diff](restyle.diff). The reports describe findings in prose. The records below apply the parent issue's judged-gate vocabulary. The control audit reported a self-review and in-memory screenshots. The two restyle sessions reported an independent `ship` review. The retained images below come from the separate browser measurement.

## Rendered checks

Headless Edge 158.0.4370.33 rendered each project at 1440×900 and 390×844, device scale 1, scrollY 0. The measurement started at Plate A, pressed Tab then ArrowRight and checked Plate B. For the 16px notice, the probe compared its brightest rendered text pixels with the flat background in a native-resolution element screenshot. For the key, controls and chart, it recorded computed colours, marker shapes, checked state, focus and resulting mixing text. The independent before/after images show the same mobile viewport with Plate B focused.

| Gate and location | Supplied audit | Restyle, same state | Expressive control |
| --- | --- | --- | --- |
| 40 / 41 / DA2 · `.proof-notice` on the dark `.order` panel | fail: text was present, but only 2.62:1 against RGB(57, 40, 70) with the .32 opacity override. | fixed: opacity restored, RGB(255, 244, 231) on the same panel measured 12.35:1. The instruction remains beside the job. | pass: 12.35:1 at both sizes. |
| DA2 · `.legend .plate-b .marker` beside “B · Iris” | fail: both keys were marigold (#ffd061), contradicting the iris (#c6a7ff) second pass. The square/circle distinction still worked. | fixed: the iris key now matches pass 02. The marigold squares for passes 01 and 03 still match the A key. | pass: two matching colour and shape pairs. |
| 41 · `label:has(input:checked)` in Mixing notes | pass: the dark label on marigold measured 11.75:1. B had the checked dot and a 3px paper focus outline. Its note read “Iris · Mix before the second pass.” | pass: same fill, focus and B-specific note after the keyboard selection. | pass: the common selection fill agrees with DESIGN.md for either plate. |
| Colour · press signature, pass colours, decorative `.order` edge | The 14px marigold top rule applied one plate’s colour across the whole chart. It carried no pass or selection information. | The rule disappeared. The press signature, A data marks, B ink and selection fill retained their distinct roles. | pass: the 1px separator and expressive ink palette stayed intact. |

[Before, Plate B selected at 390px](before-390.png) · [After, same state](after-390.png)

The fixture's `measure_proof.py --check-clear` failed on both viewports for the two seeded issues before the change. It passed on the actual restyle and the expressive control. The mechanical scanner reported Floor 0, House 0, Reflex 0, no waivers, for both inputs (two scannable files) and the restyle (one). Gates 2a and 74 produced no findings. Both matched their existing scanner coverage in the 60-test scanner suite. Ten existing GPUI contract tests passed. Full local `just ci` passed after regenerating the fixture file counts. The Node leg recorded 351 passing, 51 skipped and zero failed.

**Unverified.** No GPUI target or native window was provided. Physical print reproduction, screen-reader announcements, real touch input and other browser engines were outside the observed runs. This is one original two-ink job and one control. It does not establish a model-wide improvement.
