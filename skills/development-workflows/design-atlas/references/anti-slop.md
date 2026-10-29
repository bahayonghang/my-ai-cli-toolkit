# Anti-slop gates

Use this file while you build UI from `DESIGN.md` and when you audit an existing page. It lists the habits that make a page read as machine-made, says which ones block delivery, and says how a project records a deliberate exception.

Gate numbers follow [Nutlope/hallmark](https://github.com/nutlope/hallmark) (MIT, commit `8f6969f8`), so a theme entry that cites `(64)` or `waive 38iii` points at a row in this file or in the appendix. The wording and tier choices here are this skill's own.

`scripts/slop_check.mjs` checks every gate with class `M`. You answer every gate with class `J` from the judged checklist in section 6. The script keeps its own copy of the section 3 tier table; a test fails when the two disagree.

## 1. Tiers

| Tier   | What it covers                                                                                                                                                          | Unanswered grade | May it be waived?                                                                                     |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------- |
| Floor  | Access, correctness, honesty. No good page breaks these on purpose.                                                                                                     | `FAIL`           | Never. A waiver naming a Floor gate is rejected and the gate still fails.                             |
| House  | Hallmark's own taste rules that this skill keeps as defaults: eyebrows, tracked-caps labels, template punctuation, copy tells, the purple-blue gradient, nested cards, emoji icons, drawn browser chrome. | `FAIL`           | Only through `DESIGN.md`: a declared material (section 4) or a line in `## Anti-slop Waivers`.        |
| Reflex | Defaults a model falls into. A real reason can justify one.                                                                                                             | `REFLEX`         | Yes, with a `DESIGN.md` waiver line, or automatically when `DESIGN.md` declares the material.         |
| Finish | Craft details you notice only up close.                                                                                                                                 | reported only    | Not needed. Answer each one in the report.                                                            |

Grades the script prints:

- `FAIL`: an open Floor or House finding. Fix it.
- `REFLEX`: an open Reflex finding. Fix it or waive it.
- `WAIVED`: the finding matched a declared material (`declared`) or a valid waiver line (`manual`).
- `WARN`: a suspected finding. Confirm and fix it, or explain in the report why it does not apply.
- `NOTE`: bookkeeping, including every rejected waiver.

Delivery needs `0 FAIL` and `0 REFLEX`. `WARN` and `NOTE` do not block, but the report lists them.

## 2. Classes

- `M`: the script checks it from CSS, markup, JSX/Vue/Svelte/Astro templates, Tailwind utility classes, and `cn` / `clsx` / `cva` calls.
- `J`: you judge it on the running page and answer it in the checklist.
- `M+J`: the script catches the mechanical half; you still judge the rest.

## 3. Gate table

Only gates this skill adopts appear here. Clause letters (`a`, `b`, `i`) are separate gates with their own tier.

| Gate  | Tier   | Class | Tell                                                                                                                                                       | Fix                                                                                  |
| ----- | ------ | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 1     | Reflex | M     | A default UI face (Inter, Roboto, Open Sans, Poppins, Lato, Arial, Helvetica, a system stack) sets the display or heading type.                            | Use the display face `DESIGN.md` names.                                              |
| 2a    | House  | M     | A purple-to-blue or purple-to-pink gradient, or a cyan gradient on a dark page, on any surface or clipped to text.                                         | One anchor hue; solid ink for text.                                                  |
| 2b    | Reflex | M     | Gradient-filled text in any other hue.                                                                                                                     | Solid ink; get emphasis from weight, size, or the display face.                      |
| 3     | Reflex | J     | Three equal tiles, each an icon in a rounded box over a heading; or a thick coloured stripe down one side of a card.                                       | Vary widths and heights; inline icons; a hairline or no border.                      |
| 4     | House  | M     | A card nested inside another card.                                                                                                                         | Keep one containment layer.                                                          |
| 6b    | Reflex | J     | The hero stacks headline, lede, action, and visual on one centred axis.                                                                                    | At most two centred elements; break one alignment.                                   |
| 7a    | Floor  | M     | Pure `#000` or `#fff` (or `oklch(0% …)` / `oklch(100% …)`) written as a literal outside the token layer.                                                    | Reference a token. If `DESIGN.md` declares pure white or black, the token holds it.  |
| 8     | Reflex | J     | The stock page: hero, three features, call to action, footer, in that order, for a product that has its own shape.                                         | Order sections by what the visitor came to do.                                       |
| 9     | Reflex | J     | Every section is separated the same way with the same gap.                                                                                                 | Mix separators: space, a rule, a tinted band, a change of surface.                   |
| 10a   | Floor  | M     | `transition: all`, or a transition or keyframe that animates `width`, `height`, `top`, `left`, `right`, `bottom`, or `inset`; Tailwind `transition-all`.    | Name the properties; move things with `transform` and `opacity`.                     |
| 10b   | Reflex | M     | A transition or keyframe on `margin` or `padding`.                                                                                                         | `transform`.                                                                         |
| 11    | Reflex | J     | The same lift or scale on every card, an image that scales or rotates on hover, a hover state on something that does nothing.                              | One signal per element, on the container.                                            |
| 12    | Reflex | M     | Bounce or overshoot easing on UI state (`cubic-bezier` with a y value outside 0 to 1, `animate-bounce`).                                                   | An exponential ease-out.                                                             |
| 15    | Floor  | M     | A focus ring that transitions in.                                                                                                                          | The ring appears at once.                                                            |
| 19    | House  | M     | Copy tells: placeholder people (Jane Doe), stock company names (Acme, Nexus), buzzwords (seamless, robust, unleash, supercharge, effortless, world-class), Latin em or en dashes between words, a repeated "Not X. Y." cadence, stock second actions (Learn more, Get started, Book a demo). | Say what the product does in its own nouns.                                          |
| 26a   | Floor  | M     | Interactive elements and no `:focus-visible` / `:focus` styling anywhere, or `outline: none` on focus with nothing drawn instead.                            | A ring with 3:1 contrast, shown at once.                                             |
| 26b   | Reflex | M     | No `:active` styling anywhere, or form controls and no `:disabled` styling.                                                                                | Style every state in `design-system-core.md` section 4.                              |
| 27    | Floor  | M     | Keyframes or transform transitions with no `prefers-reduced-motion` fallback (Tailwind: no `motion-reduce:` / `motion-safe:`).                              | Add the fallback.                                                                    |
| 28a   | Floor  | M     | A video that autoplays without `muted`; `loading="lazy"` on the first image or video (reported as `WARN`).                                                 | `autoplay muted loop playsinline`; eager-load the largest first-screen media.        |
| 29    | Reflex | J     | Glow and wash: blurred colour orbs or mesh blobs behind text, a radial halo, a coloured zero-offset glow on a dark page.                                   | A solid or textured surface; depth from lightness steps and offset shadows.          |
| 30a   | House  | M     | An emoji used as an icon, or an emoji at the start of a label or heading.                                                                                  | One icon set, a custom SVG, or the word alone.                                       |
| 30b   | Reflex | M     | Two icon libraries on one page.                                                                                                                            | One library.                                                                         |
| 33    | Floor  | M     | A decorative `<svg>` or `<canvas>` with neither `aria-hidden="true"` nor a label or `<title>`.                                                              | Hide it or name it.                                                                  |
| 34    | Floor  | M     | `overflow-x: hidden` on `html` or `body`, a page with no `overflow-x: clip` on both, or a `100vw` width.                                                    | `overflow-x: clip` on `html` and `body`; `width: 100%`.                              |
| 37    | Reflex | M     | More than three font families.                                                                                                                             | Display, body, and at most one outlier.                                              |
| 38i   | Floor  | M     | One italic word (`<em>`, `<i>`) inside an otherwise roman heading.                                                                                          | Set the whole head one way, or break the line.                                       |
| 38iii | Reflex | J     | One word in a heading singled out by colour, weight, a highlight, or an underline.                                                                         | Set the whole head one way. A theme that names this as its signature uses it once.   |
| 39a   | Floor  | M     | Input states that shift layout or hide meaning: border width changes between states, focus drawn only with `border`, disabled shown by opacity alone.       | Constant border, `outline` for focus, three disabled signals.                        |
| 40    | Floor  | J     | Text, icons, focus rings, or field edges below WCAG AA against their background.                                                                           | Fix the pair in `DESIGN.md`, then in the token layer.                                |
| 41    | Floor  | J     | Button text too close to its fill, a dark panel that keeps dark text, grey text on a coloured surface.                                                    | Use the paired on-colour token.                                                      |
| 44b   | Floor  | J     | At 1280 x 800 the headline, lede, primary action, and main visual are not all visible without scrolling.                                                  | Smaller display clamp, tighter leading, a shorter lede.                              |
| 46a   | Floor  | J     | A metric, testimonial, customer logo, rating, or case-study count that the user did not supply.                                                           | The user's number, a marked text slot, or nothing (section 6).                       |
| 47a   | House  | M     | A drawn browser bar or window title bar (traffic lights, URL pill).                                                                                        | A real screenshot in a `<figure>`, or no chrome.                                     |
| 47b   | Reflex | M     | A drawn phone, laptop, terminal, or editor frame.                                                                                                          | One frame at most, holding real content, or none.                                    |
| 47c   | Reflex | J     | Imitation material: a styled-div "product UI" with invented values, CSS bevels faking an object, a decorative grid with nothing under it.                  | Build the real product view, use a real asset, or leave it out.                      |
| 48    | Floor  | M     | A colour or `font-family` literal outside the token layer (CSS, inline `style`, Tailwind arbitrary values such as `bg-[#123]` or `font-['Inter']`).          | Move the value into the token layer and reference it.                                |
| 49a   | Floor  | J     | A button label or primary nav link that wraps at any width from 320 to 1920.                                                                              | Shorten it; `white-space: nowrap`.                                                   |
| 50    | Floor  | M     | A grid track holding images on bare `1fr`; a display heading with a long word and no `overflow-wrap`.                                                     | `minmax(0, 1fr)`; `overflow-wrap: break-word` with `min-width: 0`.                   |
| 53    | Floor  | M     | CSS-only radio tabs at `position: absolute; top: 0` with no script guard, so the page jumps on each click.                                                | Radios in flow at zero size, or a handler using `preventScroll`.                     |
| 54    | House  | M+J   | The eyebrow: short inert text above a heading that only announces it ("Features", "01 / The tour"), in any shape.                                         | Open the section another way; if the line carries a fact, keep it as a fact.          |
| 55a   | Floor  | M     | An uppercase display heading that can wrap, with `line-height` under 1.0.                                                                                 | 1.0 or more.                                                                         |
| 58    | House  | J     | More than about 80 words in one 900px-tall screen, or a hero with more than two text blocks before its actions.                                            | Headline, one sentence, actions; cut the rest or move it down.                       |
| 62    | Floor  | M     | Content hidden at rest (`opacity: 0`, `visibility: hidden`) by a reveal class that needs a script to show it.                                              | Visible by default; hide only under a `.js` class or use `@starting-style`.          |
| 63    | House  | M+J   | Template punctuation: meta strings joined by middle dots (`A · B · C`), an arrow glued to link text (`Read more →`), decorative status dots, `WORD - fragment` labels. | Line breaks, columns, rules; a verb as the label.                                    |
| 64    | Reflex | M     | Monospace on labels, captions, meta rows, or table heads when neither the display nor the body face is monospace and the text is not code or a figure.     | Labels in the body face, a step smaller, normal case.                                |
| 65    | Reflex | J     | The best-known generated look: cream paper, a high-contrast serif display, a terracotta or clay accent, on a page that did not ask for it.                 | Move one axis: the accent first, then the paper, then the display face.              |
| 66    | Reflex | J     | Decoration text: rotated labels, scroll cues, a version pill in the hero, a city-and-weather strip, `01 / 4` counters on tiles.                           | Delete it; keep a real fact as a caption.                                            |
| 67    | House  | M     | The tracked-caps label: a label, caption, table head, nav link, tag, or any text at 15px or less set in uppercase or small caps, or letter-spaced past 0.03em. | The body face, a step smaller, sentence case, no tracking.                           |
| 68    | Reflex | J     | Many empty image slots on one page (a row of blank portraits or products).                                                                               | Set the set in type; keep one or two replaceable slots.                              |
| 69    | Reflex | J     | The echo: one fact (price, date, count) repeated in four or more sections, or a section's last line restating its heading.                                | Say each fact once, where it does work.                                              |
| 70    | Floor  | J     | A form that shows success ("Sent", "You're on the list") with no request behind it.                                                                      | No success state until the endpoint exists; say plainly that nothing was sent.       |
| 73    | Floor  | J     | Text painted under another element (an image, a box, another line of text), sticky chrome excepted.                                                      | Give the text its own space or surface.                                              |
| 74    | Reflex | M     | A framework's stock palette (Tailwind indigo-500, violet-600, slate-900 and kin) as a token value or as utility classes.                                  | Colours from `DESIGN.md`.                                                            |
| 76    | Floor  | J     | A broken image: no source, a source that does not load, or a hotlinked stock photo the project has no right to.                                          | The real file, or a marked placeholder (section 6).                                  |
| 80    | Reflex | J     | A drawn illustration of an object, person, or scene standing in for a photograph.                                                                        | A real photograph, the product itself, or type at scale.                             |
| 83    | Reflex | J     | The photo wall: below the hero, photographs fill more than about a third of the page, so it reads as a stock gallery.                                    | Keep the strongest pictures large; build the rest from the material: type, tables, the product. |
| 84    | Reflex | J     | A drawn mock of a product that already runs and could be captured.                                                                                        | Run it, capture real screens, frame them in the design.                              |
| 85    | Reflex | J     | The page ends on an email sign-up when a mailing list is not what the visitor came for.                                                                  | End on the visitor's real next action (book, buy, download), or on the last strong section. |
| F4    | Finish | J     | More than one filled primary button style, or two filled buttons side by side.                                                                           | One filled primary per view.                                                         |
| F21   | Finish | J     | A skipped heading level.                                                                                                                                   | Use consecutive levels.                                                              |
| F23   | Finish | J     | A document without `lang`, `<title>`, or a meta description.                                                                                              | Add them.                                                                            |
| F26   | Finish | J     | A paragraph ending on one word, or a heading ending on a stub, at 375 or 1280.                                                                            | Rewrite, or `text-wrap: pretty` on copy.                                             |

## 4. Declared material

A finding is `WAIVED (declared)` when `DESIGN.md` itself says the page is made of the thing the gate looks for. The script reads the frontmatter tokens, the `x-theme` block of a theme entry, and the body sections. A declared material never lifts a Floor gate.

| Gate | `DESIGN.md` declares it when                                                                                                                       |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | A display or heading typography token (`display*`, `headline*`, `h1`, `h2`, `hero*`, `title*`) or `x-theme.display.face` names the flagged family first. Example: a brand entry whose `display-lg` is Inter. |
| 2a   | The name, description, overview, or a token key says the material is a gradient (for example `style:gradient`), and every gradient stop on the page matches a `DESIGN.md` colour. |
| 54   | The `## Components` section, or a frontmatter component key, names an eyebrow or kicker as a component.                                            |
| 64   | `x-theme.display.class` is `mono`, or a display, body, or label typography token names a monospace family first. Example: `theme:terminal`.       |
| 67   | A typography token sets `textTransform: uppercase` with a positive `letterSpacing`, or `## Typography` states an uppercase label rule.              |
| 74   | The flagged stock colour is itself one of the `DESIGN.md` colour values.                                                                           |
| 65   | (judged) The paper hue is 55 to 105 at L 90 or more, the display is a serif, and the primary hue is 20 to 50, all in `DESIGN.md`. Answer 65 as satisfied by the entry. |

Pure white or black in `DESIGN.md` is not a waiver for 7a. It means the token layer may hold that value; the page still references the token instead of writing `#fff`.

## 5. Waiver lines in DESIGN.md

Write exceptions in one section of the project `DESIGN.md`:

```markdown
## Anti-slop Waivers

- waive 47b · one terminal frame holding a real CLI capture · the command-line output is the product this page sells
```

Rules the script applies:

- One line per gate: `- waive <gate> · <evidence> · <reason>`. Name the clause (`47b`, not `47`).
- The gate must exist in section 3 and must not be Floor. A Floor waiver is rejected and the gate still fails.
- The reason is at least 24 characters, is not boilerplate ("design choice", "intentional", "looks better"), and shares a word with the page or with `DESIGN.md`.
- A gate waived twice is rejected the second time. A line that starts with `- waive` but does not have three fields is reported as malformed.
- Every rejection prints `NOTE <gate> … waiver rejected: <why>`. The original finding keeps its grade.
- Waivers cover the whole project that `DESIGN.md` covers. There is no per-file waiver. More than three waivers is reported as a `NOTE`: a house style belongs in the `DESIGN.md` body, not in exceptions.

## 6. Judged checklist

Answer each item after the script reaches `0 FAIL` and `0 REFLEX`. Write `pass`, `fixed: <what>`, or `n/a: <why>` for each id in the report.

- [ ] **8** Could this sequence of sections sit under a different business's name? If yes, reorder by what the visitor came to do.
- [ ] **9** Are sections separated in more than one way?
- [ ] **46a** Is every number, quote, rating, customer name, and logo supplied by the user or the project? Remove or mark any that are not.
- [ ] **54** For each short line above a heading: delete it and reread. If nothing but a name for the next block was lost, it was an eyebrow. Keep it only when it carries a fact, a destination, or an identifier.
- [ ] **58** Count words in each 900px-tall screen at 1440 wide, labels and table cells included. About 80 is the ceiling; the hero is a headline, one sentence, and its actions.
- [ ] **63** Each remaining single middle dot: is it in a byline, a caption, or a live state? Otherwise replace it.
- [ ] **69** Is any price, date, time, or count printed in four or more sections?
- [ ] **70** Does every form either post to a real endpoint or say that nothing was sent?
- [ ] **84** Does the product already run? Then the page shows captures of it, not a drawn mock.
- [ ] **85** Is the last section before the footer an email sign-up? Keep it only when a mailing list is the visitor's goal.
- [ ] **3** Do three equal icon tiles stand where one stronger composition would do?
- [ ] **6b** Is the hero four things stacked on one centre line?
- [ ] **11** Does each element have at most one hover signal, on the container, and only when it is interactive?
- [ ] **29** Is there a blurred orb, halo, or coloured glow behind content?
- [ ] **38iii** Is one word in a heading set apart by colour, weight, or a highlight? Allowed once, in the hero, only when the entry names it as its signature.
- [ ] **40** Run a contrast check on each text and surface pair actually used, in every theme.
- [ ] **41** Does text on every filled button and dark panel use the paired on-colour token?
- [ ] **44b** At 1280 x 800, are headline, lede, primary action, and main visual all visible without scrolling?
- [ ] **47c** Is any styled-div imitation of a product, object, or photo pretending to be real?
- [ ] **49a** Do button labels and primary nav links stay on one line from 320 to 1920?
- [ ] **65** Is the page cream paper plus a high-contrast serif plus a clay accent without `DESIGN.md` asking for it?
- [ ] **66** Is there text that exists only to look designed (scroll cues, rotated labels, version pills, tile counters)?
- [ ] **68** Are more than five image slots empty, or four in one row?
- [ ] **73** Is any line of text covered by another element at any tested width?
- [ ] **76** Does every image load, and is every image one the project may use?
- [ ] **80** Is a drawing standing in for a photograph?
- [ ] **83** Do photographs fill more than about a third of the page below the hero?
- [ ] **F4** One filled primary button style per view?
- [ ] **F21** Heading levels consecutive?
- [ ] **F23** `lang`, `<title>`, and meta description present?
- [ ] **F26** No one-word last lines in copy at 375 and 1280?

## 7. Do not invent facts

- Numbers, quotes, ratings, customer names, and logos appear only when the user or the project supplied them. A plausible figure is still invented.
- When the page needs a fact you do not have, leave a visible, replaceable text slot (for example `[customer count]`) and list it in the report.
- When an image is missing, use a neutral placeholder with the correct aspect ratio and a `data-slot` or comment naming what goes there. Do not draw a substitute and do not hotlink stock photos.
- Forms do not claim success until a real endpoint exists.

## Appendix: hallmark gates not adopted

These numbers come from hallmark. Theme entries or other material may cite them; this skill does not check them.

- 2 (bare): split into 2a and 2b; cite the clause.
- 6a: hero sized in `vh`; the `dvh` / `svh` advice is useful but not gated here.
- 7b: a surface token holding pure white or black; `DESIGN.md` decides the palette.
- 10 (bare): split into 10a and 10b.
- 16: celebratory toasts; covered by the component state rules.
- 17: tooltip focus delay; not gated.
- 18: auto-rotating content without pause; not gated (keep the pause control from `design-system-core.md`).
- 20: the hallmark CSS stamp; this skill records decisions in `DESIGN.md` instead.
- 22: zero-chroma neutrals on a hued page; a palette choice owned by `DESIGN.md`.
- 23: accent footprint and colour posture; owned by the entry's colour rules.
- 24a, 24b: spacing tokens and off-scale spacing; covered by `design-system-core.md` section 3.
- 25: prose measure; covered by the entry's layout rules.
- 26 (bare): split into 26a and 26b.
- 28b: video without poster; not gated.
- 30 (bare): split into 30a and 30b.
- 32: repetition ledger across builds; this skill keeps one design per project.
- 38 (bare): split into 38i, 38ii, and 38iii; cite the clause.
- 38ii: an italic display system; the entry's typography decides.
- 39b: control height range; covered by the touch-target rule in `design-system-core.md`.
- 42: the default nav and footer shapes; judged under 8.
- 44a, 44c, 44d: hero centring and wide-screen fit; need a render pass this skill does not run.
- 46b: a bare figure as the hero headline; judged under 46a.
- 49b: footer link or tab wrapping; not gated.
- 55b: a single-line caps lockup under 1.02; not gated.
- 56: two sticky elements at `top: 0`; not gated.
- 59: section gap size; owned by the entry's spacing scale.
- 71, 72, 75, 77, 78, 79: render-measured spacing and size checks; need a render pass.
- 81: an empty gradient picture box; judged under 68 and 80.
- 82: counting marks instead of a number; judged under 47c.
- F1 to F26 except F4, F21, F23, F26: hallmark Finish checks not adopted.
- Retired upstream: 5, 13, 14, 21, 31, 35, 36, 43, 45, 51, 52, 57, 60, 61.
