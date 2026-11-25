# Independent review transcripts

Verdicts and issue lines below are the reviewers’ final replies. Each round used a new read-only session, the bundled web review prompt and that round’s two first screens, desktop full capture, contract and HTML. Round 1 relocated the HTML without its shared image dependencies. Rounds 2 and 3 preserved the working tree layout and named both PNG sources in the input. Session IDs and inputs are recorded in [runs.json](runs.json).

## scandinavian

### Round 1

fix

`.paper img` · Both plate images point outside the supplied page directory to missing files. Opening this copy leaves the mount empty · Include both PNGs alongside the page and update their `src` paths.

`.heading p` · The desktop introduction wraps at `32ch`, leaving “light on the water.” on a short third line despite available space · Widen it to `48ch`, within the contract’s 45–65-character target.

`h1` · The title uses `clamp(40px, 5.2vw, 72px)`, which changes its scaling at intermediate widths and fixes its limits in pixels · Use the specified `clamp(2.5rem, 5vw, 4.5rem)`.

`figcaption` · The caption inherits `normal` line height, so its line spacing depends on the fallback font · Apply the contract’s `0.875rem` size and `1.45` line height.

### Round 2

fix

Dark paper toggle · Its pressed state relies on fill alone, so the selected state can disappear in forced-colors mode · Add a visible checkmark when `aria-pressed="true"`.

Dark paper toggle · The pressed-state rule overrides the hover fill, so hovering gives no feedback in dark mode · Add a distinct opaque hover fill for the pressed state and preserve label contrast.

Print notes · “Register” labels a pixel measurement, although registration refers to how the plates align · Rename the row “Plate size”.

### Round 3

ship

## neobrutalism

### Round 1

fix

`.sheet img[src]` · Both plate images load from a design-skill directory six levels above the page. Publishing the page alone would leave the mount empty. · Ship both PNGs alongside the page and use page-relative URLs.

`:root[data-dark]` · The figure’s outer rule and shadow stay `#1C293C` against the identical dark canvas, so the print loses its hard outer edge. · Use `--text` for the figure’s outer border and shadow so they switch with the surrounding canvas.

### Round 2

fix

Print notes (`body`) · The note rows inherit 17px body text, while DESIGN.md sets `body-md` to 15px · Set the base body size to `0.9375rem` and keep the intro’s explicit display sizes.

### Round 3

fix

Masthead appearance toggle · “Dark paper” suggests the print’s cream paper will change, but the toggle darkens only the surrounding page · Rename it “Dark background” so visitors can predict its effect.
