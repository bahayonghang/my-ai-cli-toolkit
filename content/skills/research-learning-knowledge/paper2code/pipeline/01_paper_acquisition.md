# Stage 1: Paper Acquisition and Parsing

## Purpose

Fetch or read the supported paper source, extract readable paper text with
mathematical notation preserved when possible, and produce a structured markdown
representation for downstream stages.

## Input

- `PAPER_SOURCE`: one of
  - arXiv ID
  - arXiv URL
  - local PDF path
  - OpenReview forum / paper page URL
  - OpenReview direct PDF URL

## Output

- `.paper2code_work/{PAPER_KEY}/paper_text.md`
- `.paper2code_work/{PAPER_KEY}/paper_metadata.json`
- `.paper2code_work/{PAPER_KEY}/sections/`
- `.paper2code_work/{PAPER_KEY}/algorithms/`
- `.paper2code_work/{PAPER_KEY}/equations/`
- `.paper2code_work/{PAPER_KEY}/tables/`
- `.paper2code_work/{PAPER_KEY}/footnotes.md`

## Reasoning protocol

### Step 1: Normalize the input

Classify the source into exactly one source kind:

- `arxiv_id`
- `arxiv_url`
- `local_pdf`
- `openreview_page`
- `openreview_pdf`

Also record the derived `PAPER_KEY`, which becomes the subdirectory name under
`.paper2code_work/`.

If the source resolves to DOI-only input or to an unsupported URL outside
OpenReview, stop immediately with a clear error. Do not silently fall back to
generic scraping.

### Step 2: Fetch or read the paper

Run `scripts/fetch_paper.py`. The script handles:

1. arXiv metadata + PDF download + ar5iv fallback for arXiv sources
2. local PDF reading and text extraction for local files
3. OpenReview page fetch + PDF resolution + PDF extraction for OpenReview pages
4. direct PDF download + extraction for OpenReview PDF URLs

### Step 3: Verify extraction quality

Read `paper_text.md` and check:

- [ ] the title is recognizable
- [ ] the abstract or opening summary is readable
- [ ] section headings are identifiable
- [ ] equations are visible, even if represented as LaTeX-like text
- [ ] the references section or bibliography tail is present

If the source is arXiv and direct PDF extraction is garbled, use the ar5iv
fallback. For local PDF and OpenReview PDF flows, fail clearly if no readable
text can be extracted.

### Step 4: Run structure extraction

Run `scripts/extract_structure.py` on the extracted paper text. This extracts:

- section files
- algorithm boxes
- numbered equations
- tables
- footnotes

### Step 5: Verify all critical sections exist

You must find the equivalent of:

- Abstract
- Introduction
- Method / Model / Approach
- Experiments / Results
- Conclusion

Also look actively for:

- Appendix or supplementary sections
- Footnotes
- Algorithm boxes
- hyperparameter tables

### Step 6: Special handling by source type

#### arXiv sources

- use arXiv metadata in `paper_metadata.json`
- inspect the arXiv abstract page for official code links
- if version history matters, note that later arXiv versions may contain errata

#### local PDF

- infer title, authors, and year from the extracted text
- do not require network metadata before proceeding
- official code discovery is limited to repository links found in the extracted
  paper text unless later stages discover more context

#### OpenReview page

- treat the page HTML as a metadata source
- resolve the canonical PDF endpoint before parsing
- inspect the page HTML for code links and useful metadata such as title,
  authors, and description

#### OpenReview PDF

- parse the PDF directly
- if the URL includes an OpenReview paper ID, derive the matching forum URL for
  metadata bookkeeping
- do not assume page metadata is available unless it can be derived from the URL

### Step 7: Check official code links

The acquisition script stores any discovered repository links under
`paper_metadata.json -> official_code`.

Verify them before relying on them:

- does the link actually correspond to this paper?
- does it point to a real code repository rather than a placeholder?
- if multiple links exist, which one seems primary?

## Fallback protocol

### If arXiv PDF extraction fails

1. try `pdfplumber`
2. try ar5iv HTML
3. if all fail, stop with a clear extraction error

### If local PDF extraction fails

Stop with a clear error telling the user to provide a different PDF path. Do not
guess from filename-only metadata.

### If OpenReview page resolution fails

Stop with a clear source-resolution error. An OpenReview page must expose or
allow derivation of a resolvable paper PDF.

## Quality checklist before proceeding to Stage 2

- [ ] `paper_text.md` exists and is readable
- [ ] `paper_metadata.json` exists
- [ ] `sections/` exists with at least one section file
- [ ] appendix or supplementary material has been checked
- [ ] algorithm boxes have been checked
- [ ] equations are present
- [ ] the method / model section is readable
- [ ] official code links, if found, have been noted
