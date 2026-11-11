# Official source checks

Read on 2026-11-11 with installed Ego Browser guide v2.2.0, task space 3. All seven pages loaded. These checks establish documented mechanisms, not browser interoperability or visual quality. CSSWG editor drafts can change; APG is implementation guidance (the tooltip pattern itself notes ongoing work).

| Source | Decision retained | Fallback / limitation |
| --- | --- | --- |
| [CSS Text 4](https://drafts.csswg.org/css-text-4/#text-wrap-style) | `balance` and `pretty` select wrapping strategies, with layout-quality/stability tradeoffs. Long content needs deliberate wrapping. | Normal wrapping remains usable. Do not promise identical line breaks, CJK punctuation behavior or streaming stability across browsers. |
| [CSS Fonts 4](https://drafts.csswg.org/css-fonts-4/#font-variant-numeric-prop) | `tabular-nums` requests the font's tabular numeral feature. | Font support must be checked; reserve sensible numeric space and test digit-count changes separately. |
| [CSS Conditional Rules 3](https://drafts.csswg.org/css-conditional-3/#at-supports) | Feature queries can group optional styles around supported property/value pairs. | A parsing-support result does not establish readability, correct rendering or performance. Keep baseline styles outside the enhancement block. |
| [Media Queries 5](https://drafts.csswg.org/mediaqueries-5/#prefers-reduced-motion) | Motion preference can control presentation. | Immediate state changes must remain functional; do not require a transition-end event for business completion. No browser-version promise. |
| [Filter Effects 2](https://drafts.csswg.org/filter-effects-2/#BackdropFilterProperty) | Backdrop filtering belongs only to an already selected translucent material. | Draft semantics, unknown background and contrast still need runtime checks. Opaque token surface is the baseline; do not animate the filter or promise performance. |
| [APG Tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/) | Supplementary text on hover/focus; trigger retains focus; Escape dismisses. Interactive content needs a suitable interactive overlay. | Keep critical information in the ordinary flow. Do not use a tooltip for links/actions. |
| [APG Modal Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | Initial focus, contained tab navigation, dismissal and focus return are part of the interaction. | Preserve existing confirmation semantics and library behavior; drawer appearance alone does not determine modality. |

No minimum browser versions were retained. `corner-shape` was not selected for the implementation: ordinary radius and existing DA4 suffice, so its compatibility remains unverified. Source article parameter values were not promoted to defaults.

Reproduction: `ego-browser skill`, then `ego-browser nodejs -e "await import('file:///…/read-official-sources.mjs')"` used two task-local read-only source-extraction scripts during this session; temporary scripts/excerpts were removed after this paraphrased ledger. No external code was executed. Runtime probe evidence is separate in `runtime-results.json`.
