# Actual skill responses

These are the four final responses. Temporary Markdown links are shown as their labels, since the captures lived outside the input project. The paired retained screenshots and the separately checked gate records are in [the run report](run.md).

## Audit of the supplied edition

**Fix two issues before the print run.** A printer can choose either plate and get the correct mixing notes. The pass order is A–B–A, but the key gives conflicting colour cues, and the revision warning is easy to miss.

| Printer’s task | What Edge showed | Recommended change |
|---|---|---|
| Read the ink order | Passes 01 and 03 are marigold squares. Pass 02 is an iris circle, but the “B · Iris” key shows a **marigold circle**. The shapes agree; the inks disagree. | Remove the plate B key override so the key inherits iris. |
| Choose a plate | Clicking B or using Tab and the arrow keys selected the plate and updated its notes. B showed “Iris · Mix before the second pass.” Returning to A restored the first- and third-pass instructions. | Keep the shared marigold selection fill, native radio dot, plate label and visible keyboard focus ring. Focused plate B |
| See the revision notice | “Revision proof only. Do not match production ink to this sheet.” sits beside the job. At 32% opacity, its effective colour is about `#78697A` on `#392846`, **2.62:1** against a 4.5:1 target. | Remove the opacity override. The existing paper colour gives **12.35:1** on that panel. |

**Keep the Nightjar Press look.** Both fixes reuse its existing inks, plum surface and typography. One optional refinement from the independent review is to remove the 14px marigold rule above the sequence. It gives plate A’s ink extra emphasis across all three passes.

**Verification.** The design-atlas scan covered both source files and reported zero Floor, House or Reflex findings, warnings or waivers. The two operational issues emerged in rendered review. I checked headless Edge at six widths from 320 to 1920 px. Physical print output and screen-reader announcements remain unverified. No project files changed. Desktop evidence · Mobile evidence

## Restyle of the supplied edition

The *Balcony at dusk* chart and key now agree on all three passes: **A Marigold → B Iris → A Marigold**, with squares for A and circles for B. Removing the edition overrides also lifted the revision notice from **2.62:1 to 12.35:1** contrast and removed the heavy marigold rule above the chart. The job details and Nightjar Press typography are intact.

The plate controls already worked. In headless Edge, I verified that either selected plate retains the marigold fill and checked radio dot, keyboard focus is visible, and switching plates updates the mixing note. Desktop and mobile layouts passed. The design-atlas check reported zero failures, warnings, or waivers. Independent visual review returned **ship**.

Before · After · Mobile · Plate B keyboard focus

Verification covered the on-screen desk in Edge. Other browsers and physical print output were not tested.

## Audit of the expressive control

**Pass for the on-screen proof desk.** At 1280×800 and 390×844 in headless Edge, a printer could read the ink order, choose either plate, and see the revision notice without scrolling.

| Task | Evidence |
|---|---|
| Read the ink order | The chart and key agree in both colour and shape. Passes 01 and 03 use the marigold square for Plate A. Pass 02 uses the iris circle for Plate B. Pass-number contrast was 11.75:1 on marigold and 8.44:1 on iris. |
| Choose a plate | Tab then Right Arrow selected Plate B, showed a focus outline, and changed the note to “Iris · Mix before the second pass.” Clicking Plate A restored its first-and-third-pass note. The radio dot and label identify the plate, so Nightjar’s marigold selection fill works for either choice. |
| See the revision notice | “Revision proof only. Do not match production ink to this sheet.” appeared directly below the key on both screens, at full opacity and 12.35:1 contrast against the plum panel. |

**Keep the Nightjar Press look.** The plum surface, Georgia job title, marigold signature, and two spot inks serve the task. The design-atlas scan covered both page files and found zero Floor, House, or Reflex findings, with no waivers or rejections. No edits were made.

**Verification gaps.** This was a self-review. Screenshots were inspected in memory because the requested artifact folder was outside the writable project. Screen-reader announcements and physical print output were unverified.

## Restyle of the expressive control

**No project edits were needed.** The *Balcony at dusk* proof desk already makes all three decisions clear.

- **Ink order** reads Marigold → Iris → Marigold. Passes 1 and 3 match the square Plate A key. Pass 2 matches the circular Plate B key. Desktop proof
- **Plate selection** works by click and keyboard. The checked plate has a marigold fill and radio dot. Selecting Plate B shows “Iris · Mix before the second pass.” Keyboard focus adds a visible outline. Plate B selected
- **Revision notice** stays with the job on desktop and mobile. “Do not match production ink to this sheet” measures **12.35:1** against its plum panel. Mobile proof

Headless Edge passed layout checks at five widths from 320 to 1920 px. Design-atlas reported zero failures, warnings, or waivers. Independent visual review returned **ship**. Physical print output and screen-reader announcements remain unverified.
