# Craft polish within the existing design

Load this reference for build/restyle details that affect feedback, reading, overlays, or changing content. In an audit, use it to explain a finding only; change no files. This is a selection pass, not a checklist of effects to add.

## 1. Select the smallest useful change

Read `DESIGN.md`, the existing component variants/props, tokens, and the Restyle Keep list first. Extend that system. Preserve public APIs, semantics, dependency set, business behavior, and the user's chosen look. When keeping an existing design, do not run `route` or `apply`; if it is not yet recorded, follow [restyle.md](restyle.md) section 4 to capture it.

Choose a mechanism only for an observed problem. A flat, terminal, or brutalist interface can be finished with clear type, stable content, immediate focus, and restrained state feedback. Depth, blur, bounce, and gradients are not prerequisites. Do not add an animation dependency or parallel component implementation for polish.

For each selected change, record this applicability sheet before coding:

| Field | Required evidence or decision |
| --- | --- |
| Problem and fit | Selector/state, observed problem, and why the change fits `DESIGN.md` |
| Existing system | Component/variant, API/props to preserve, and existing token roles to reuse |
| State contract | Trigger, intermediate and end state, allowed animated properties, duration/easing role tokens, and repeat behavior |
| Interruption | Retarget/reversal, cancellation, pending work cleanup, and final state after rapid input |
| Access | Keyboard/focus, pointer/touch, and reduced-motion result; focus indicators are immediate |
| Fallback | Baseline behavior when the CSS feature, font capability, or input method is unavailable |
| Verification | Scenario, viewport/theme, runtime evidence path and result, or explicitly unverified |

Record unselected mechanisms as `n/a — <reason>`; do not fill every recipe by implementing it. Token names below are roles to map onto the project's existing names, not a mandatory new token vocabulary. Source timings and effect parameters are examples, not cross-theme constants.

## 2. Core decisions

### State motion and interruption

- **Use / exclude:** Use motion to explain a real entry, exit, replacement, or repositioning. Keep static/immediate feedback when motion adds no information; no idle halo or repeated card choreography. DA6 owns restraint; gate 12 still requires an allowed waiver for bounce/overshoot.
- **Tokens / states:** Map entry, exit, and reposition roles to existing duration/easing tokens. Record each trigger and end state. Animate only `transform` and `opacity`; layout and state changes may happen immediately. Never transition `all`. For a material change, crossfade existing decorative layers instead of animating blur or shadow values.
- **Interruption / access:** Reverse or retarget from the current presentation rather than replay from zero. Cancel stale timers/listeners; rapid open-close-open must end open with one active layer. Keep semantic state and focus in step with the actual usable control. Do not animate focus-ring appearance or trap keyboard input until an animation ends. Hover feedback needs a focus/touch equivalent.
- **Fallback / verify:** Reduced motion reaches the same functional end state immediately, without a travel path or overshoot. Test interrupted transitions, cancellation, keyboard activation, touch, narrow layout and reduced motion; screenshots alone cannot prove any of these.

### Choose an overlay by its content and task

- **Use / exclude:** A Tooltip is supplemental noninteractive text, available on focus as well as hover. No clickable links, buttons, required instructions, prices, consent or errors inside it. Interactive small tasks need the existing accessible popover; longer or blocking tasks may need a dialog/drawer with appropriate focus management. Appearance does not determine semantics.
- **Tokens / states:** Reuse overlay, elevation, placement, spacing and entry/exit roles. Specify closed, open, dismissed and any pending/error state. DA5 owns progressive disclosure; keep authorisation, payment, deletion and irreversible-action confirmations. An undo affordance requires an existing working undo operation, not optimistic copy.
- **Interruption / access:** Escape dismisses where appropriate; dismissal and re-opening cancel pending work. Tooltip focus stays on its trigger; popover focus/dismissal follows the component's established pattern. Modal dialogs contain focus and return it to the trigger on close. Nonmodal popovers do not gain a modal focus trap. Touch must have an explicit way to reveal/dismiss useful supplemental content; essential text stays visible.
- **Fallback / verify:** Retain the existing accessible overlay implementation rather than substituting a new API for polish. When no suitable supplemental disclosure exists, leave the text inline. Test focus/hover, Escape, outside dismissal where applicable, touch, focus return, rapid toggle and reduced motion. Check that no protected information or confirmation disappeared.

### Mixed CJK/Latin reading

- **Use / exclude:** Use for awkward heading breaks, squeezed mixed-language labels or long identifiers. Keep the chosen typeface hierarchy. Do not impose `word-break: keep-all` globally, insert manual spaces between scripts, or add a segmentation dependency for appearance alone.
- **Tokens / states:** Reuse body/display font, line-height, measure and spacing roles. Give flex/grid text children `min-inline-size: 0` where needed. Use `overflow-wrap: anywhere` for unbroken identifiers when they would otherwise overflow; code and tables retain their own scroll containers. Optional `text-wrap: balance` suits short headings; `pretty` is a body-text enhancement, not guaranteed punctuation control.
- **Interruption / access:** Content replacement and font loading must leave text readable and focus attached to the same control. Do not animate line breaks or truncate a focused control's only accessible label. Keyboard/touch users get the full required label; reduced motion keeps the same readable layout.
- **Fallback / verify:** Ordinary wrapping is the baseline; use `@supports` for optional wrapping enhancements such as `text-wrap: balance` or `pretty`. Check Chinese/Latin mixing, punctuation, a long title/URL, text zoom, font fallback, desktop/mobile and 320px width. Inspect actual line breaks and horizontal overflow; CSS support alone proves neither readability nor correct language segmentation.

### Numbers, loading, and streaming content

- **Use / exclude:** Stabilise changing metrics, action labels and the input area. Do not freeze meaningful content growth or hide longer real values to preserve a screenshot. Do not animate a number merely because it updates.
- **Tokens / states:** Reuse numeric/body type and spacing. `font-variant-numeric: tabular-nums` can align digit widths when the selected font supports it; separators, signs and digit count can still change width. Allow realistic values with a suitable column/reserved space. Keep loading controls the same box size; distinguish idle, pending, partial, error and complete, and announce updates proportionally using the existing accessible status pattern.
- **Interruption / access:** Stop/cancel ends pending work and preserves received content. Ignore stale responses after a newer operation according to the existing data contract; do not redesign requests as styling work. For chat, follow new output only while the user is already following the bottom. Once the user scrolls away, preserve their position and offer the existing explicit return-to-latest action; do not force scrolling on every token. Keep the composer and focused controls usable. Batch status announcements instead of reading every streamed token aloud.
- **Fallback / verify:** Without tabular figures, use the existing aligned numeric layout and allow growth. Reduced motion updates content immediately and avoids animated counters or smooth forced scrolling. Test short/long values, negative/decimal values, slow/failed loads, stream completion/cancel, user scroll-away and explicit return, keyboard/touch and reduced motion. Distinguish intended text growth from avoidable jumps of controls or the user's reading anchor.

## 3. Optional adapters

Use only adapters that address the observed problem and fit the selected material.

### Tactile button feedback

- **Use / exclude:** Use for an unclear press/release on a real action. Flat and terminal variants may use only existing active contrast/border feedback; do not add bevels to make them look expensive.
- **Tokens / states:** Reuse the button variant's surface, border, focus and press tokens. Preserve box geometry through default/hover/focus/pressed/loading/disabled. If a material needs contact/ambient layers, reuse its surface roles and crossfade opacity; do not animate shadows.
- **Interruption / access:** Pointer cancel, drag-off and release restore the right state without firing an extra action. Enter/Space and touch get equivalent feedback, immediate focus remains visible, disabled/loading follows existing semantics. Do not delay the action for a press animation.
- **Fallback / verify:** Immediate state colour/border changes work without transforms, layers or motion. Check rapid repeat, cancel, keyboard, touch and reduced motion; ensure no layout shift or new action handler behavior.

### Pointer-safe submenu travel

- **Use / exclude:** Use only when pointer travel toward an existing submenu accidentally closes it or selects a sibling. Reuse the menu library's intent/safe-area support; do not add menus or a new dependency for this recipe. Not needed for click-open menus with no travel problem.
- **Tokens / states:** Keep existing placement and open/close delay roles. Define parent-open, submenu-targeted, entered, exited and dismissed. Delays are tuned from the actual geometry, not copied from a source post.
- **Interruption / access:** Leaving the safe path, dismissal or unmount cancels pending work. Keyboard arrows, Enter and Escape remain immediate according to the existing menu pattern. Touch uses explicit open/close rather than hover intent. Reduced motion changes no navigation behavior.
- **Fallback / verify:** Keep the existing click-open/keyboard menu if no safe-area capability exists. Test diagonal travel at actual zoom, quick direction reversal, dismissal, keyboard and touch; verify the safe region does not cover unrelated controls.

### Drag target and cancellation

- **Use / exclude:** Use where drag/reorder already exists but the drop location or cancellation is unclear. Do not introduce drag as a styling feature. A non-drag keyboard/touch action remains available through the existing interaction contract.
- **Tokens / states:** Reuse lift, insertion marker, selected and focus roles. Define idle, picked-up, valid/invalid target, committed and cancelled. The marker communicates the real insertion location; any decorative lift uses only transform/opacity and preserves list geometry.
- **Interruption / access:** Escape, pointer cancellation and invalid drop restore the original order/selection. Announce pickup/target/result through the existing accessibility mechanism. Keep focus on the moved item after commit; keyboard/touch alternatives perform the same supported operation.
- **Fallback / verify:** With reduced motion or no drag enhancement, an immediate insertion marker and existing move controls suffice. Test first/last position, invalid target, cancel, repeated moves, keyboard, touch and focus retention. No fake rollback when the product cannot undo a committed operation.

### Surface layers and themes

- **Use / exclude:** Use only when a style already calls for surface depth and actual controls lack separation. Keep flat/terminal surfaces flat. Do not add liquid refraction, background sampling, blend-mode text, Halo, or invented product/browser illustrations; gates 29, 47a, 47c and 84 still apply.
- **Tokens / states:** Reuse canvas, raised surface, border, contact/ambient shadow and on-surface roles for light/dark and disabled/focus states. Keep text on a predictable readable surface. In airy-glass, retain the existing colourway dial, paper-only blur, opaque fallback and layer limits; do not hand-edit palette hex values.
- **Interruption / access:** Theme switches keep focus, selection and readable text immediately. Crossfade decorative layers with opacity only if useful; reduced motion switches immediately. Pointer, keyboard and touch retain the same control hit targets.
- **Fallback / verify:** Use the design's opaque surface when `backdrop-filter` is unsupported or unsuitable. A parsed CSS feature does not establish performance or contrast over an unknown background. Check text/boundary contrast on actual worst-case surfaces in both supported themes, disabled/focus states, fallback and reduced motion. Measure before claiming smoothness or speed.

### Corners and icons: reuse existing owners

DA4 owns nested-radius relationships and optical alignment; DA8 and [design-system-core.md](design-system-core.md) own icon drawing/semantics. Use the existing radius/icon tokens and states, with normal usable radii as the fallback. Continuous-curvature CSS is deferred unless explicitly needed and verified for the target. Do not add another radius gate, redraw an icon family, or change hit targets for polish. Check rendered size, focus, touch and reduced motion; these details need no animation by default.

## 4. Verify and report within the evidence

Run [implementation.md](implementation.md) section 5 and the existing anti-slop review. For each selected row, record runtime checks for its states, interruptions, keyboard/touch, reduced motion and fallback. Compare before/after with the same content, viewport, state and scroll position. If a browser, state or input method was not exercised, name that check as unverified; a screenshot cannot establish dynamic behavior.

Report the applicability sheet, token/component changes, preserved behavior, existing waivers and evidence paths. No new gate ids, detector rules, tiers, waivers or exit codes originate here. A static/reference test proves package connectivity or a stated contract only. Evals schema validation is not model execution; recorded fixtures are not provider runs; perceived polish remains a hypothesis until an actual comparison and human review support it.

## Sources and limits

Mechanisms were paraphrased and adapted from [Jakevin's secondary synthesis of Kubai's design tips](https://x.com/jakevin/status/2120416309859021185), read 2026-11-11; original implementations, source parameters and product claims were not independently verified. No source code or article text was copied. This reference selects style-compatible mechanisms and leaves source-specific decoration out.

Standards checked 2026-11-11: [CSS Text Level 4](https://drafts.csswg.org/css-text-4/) for wrapping choices and [CSS Fonts Level 4](https://drafts.csswg.org/css-fonts-4/) for font-dependent tabular figures. [CSS Conditional Level 3](https://drafts.csswg.org/css-conditional-3/) defines `@supports`; it tests CSS support, not usability or performance. [Media Queries Level 5](https://drafts.csswg.org/mediaqueries-5/) defines reduced-motion preference, and [Filter Effects Level 2](https://drafts.csswg.org/filter-effects-2/) describes `backdrop-filter`; the opaque baseline still needs to work.

Interaction references: the [APG Tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/) (which notes work in progress) and [modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). Draft syntax and patterns do not prove target-browser support. Use feature detection and runtime verification; no minimum browser versions are claimed here. Continuous-curvature features remain deferred.
