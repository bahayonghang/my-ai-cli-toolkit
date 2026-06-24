# Norm pack: English journal article (`--target en-journal`)

Load this when polishing an English-language journal or conference manuscript.
It tells the kernel (`ai-tells-academic.md`) how to gate the calibrated tells for
this register, and adds journal-specific norms. Goal: remove AI tells **without**
breaking accepted scholarly English.

## Register

- Formal, precise, impersonal-but-not-evasive. **No contractions** (don't, it's,
  we've), no colloquialisms ("a ton of", "basically", "honestly"), no first-person
  chattiness. First person plural ("we propose", "we observe") is fine and often
  preferred over awkward passive.
- This is why the kernel **disables** the PERSONALITY / "add voice" behavior here:
  injected opinion, slang, and asides are *out of register* for a journal.

## Hedging calibration (kernel §24)

- Hedging encodes epistemic stance; keep single-layer hedges: "suggests",
  "may indicate", "appears to", "is consistent with".
- Remove only **stacked** hedges ("may possibly potentially").
- **Add** a hedge where the draft over-claims: only assert causation when the
  design supports it; otherwise "is associated with", "correlates with".

## Passive voice, section-gated (kernel §13)

- **Methods / experimental procedure:** agentless passive is conventional and
  correct ("samples were collected", "the model was trained for 100 epochs").
  Do **not** force these to active.
- **Introduction / Discussion / Conclusion:** prefer active where it clarifies
  agency ("we observe", "we argue"). Convert hollow agentless passive that hides
  who acted.
- Never sacrifice accuracy of attribution to a blanket active-voice rule.

## IMRaD and CARS

- Respect IMRaD section roles (Introduction, Methods, Results, Discussion). Do
  not let a "fix" blur a Results statement into Discussion interpretation.
- Introduction follows the CARS move structure: establish the territory,
  establish a niche (the gap), occupy the niche (this work). Keep a genuine,
  terse gap statement; that is **not** the §28 signposting tell. Cut only empty
  "let's explore" meta-commentary.

## Tense conventions

- Established facts and definitions: present tense ("attention weights every
  token").
- Own methods and procedure: past tense ("we trained", "data were split").
- Own results: past tense ("accuracy improved by 2.4 points").
- Discussing what a figure/table shows: present tense ("Table 2 reports").
- Keep tense **consistent within a move**; AI drafts often drift tense mid-paragraph.

## Citations (kernel §5 + ghost-citation)

- Every evidence claim needs a real citation in the venue's style. Two main
  families:
  - **Author–year** (APA, Chicago author-date, Nature-style names): "Smith and
    Lee (2021) show…", "(Smith & Lee, 2021)".
  - **Numbered** (IEEE, Vancouver, many CS venues): "prior work [12] shows…".
- Do **not** paraphrase a cited sentence so aggressively that it distorts the
  source or detaches the claim from its support. Citation-bearing sentences are
  edited conservatively.
- Replace ghost citations ("studies show", "it is well established") with the
  specific reference or downgrade the claim.

## Terminology and notation consistency (kernel §11 → hard rule)

- One concept, one term, one symbol, throughout. Define on first use; never
  synonym-cycle ("the model / the network / the system" for one object).
- Keep mathematical notation consistent (same symbol for the same quantity).

## Dashes, hyphens, punctuation (kernel §14, §26)

- **Em dash `—`:** follow the venue. Some journals use it; some prefer
  parentheses or commas. Do not hard-delete; flag the AI *habit* of spaced
  ` — ` parenthetical asides and double `--`.
- **En dash `–`:** keep in numeric ranges and compounds: `pp. 10–18`,
  `1990–2000`, `dose–response`, `Bose–Einstein`.
- **Oxford (serial) comma:** follow the venue's house style; apply consistently.
- **Hyphenation:** hyphenate compound modifiers in attributive position
  ("a data-driven method"); drop in predicate position ("the method is data
  driven") unless the style guide says otherwise.

## Spelling

- US vs UK spelling: pick the venue's convention and apply it **consistently**
  ("analyze/analyse", "behavior/behaviour", "modeling/modelling"). Inconsistent
  mixing is itself a tell.

## Style granularity

- If `--style` names a specific guide (APA / IEEE / Nature / Elsevier), apply its
  citation, heading-case, dash, and comma conventions.
- Default (`--style` absent): "general formal academic" — author-year or numbered
  per what the draft already uses, sentence-case headings unless the draft is
  clearly title-case, en dash for ranges, consistent serial comma.

## What NOT to "fix" here

- Precise hedging, section-appropriate passive, dense citations, formal
  vocabulary, consistent terminology, and required field-specific jargon are
  **good** academic English. Leave them.
