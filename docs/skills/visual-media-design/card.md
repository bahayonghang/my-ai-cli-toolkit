# Card

Visual content-casting skill that turns source material into PNG outputs using one of five rendering modes.

## When to use it

- user asks to turn content into a card, poster, infographic, sketchnote, or comic
- user uses trigger words such as "铸", "cast", "做成图", "做成卡片", or similar requests
- the desired output is a visual PNG artifact rather than plain text

## Core workflow

1. collect source content from a URL, pasted text, or local file
2. choose one mode based on the requested output style
3. read `references/taste.md` plus the mode-specific instructions
4. render the selected HTML template and capture the PNG output
5. return the generated file path

## Available modes

- `-l` long reading card
- `-i` infographic
- `-m` multi-card reading cards
- `-v` visual sketchnote
- `-c` black-and-white manga comic

## Output contract

- produces PNG output rather than Markdown or Org text
- chooses file naming from the content title or core idea
- reports the generated path after rendering completes

## Main supporting assets

- `references/taste.md` for the visual quality baseline
- `references/editorial-typography.md` for the bundled editorial font contract used by `-l`, `-m`, and `-i`
- mode-specific guides such as `references/mode-long.md`
- HTML templates under `assets/`
- Playwright-based capture script referenced by the skill

## Key constraints

- the skill should follow the shared taste rules before any mode-specific rendering
- it should not fabricate data, labels, or citations just to fill the layout
- Org-mode and ASCII-only output constraints do not apply because the artifact is visual

## Notes

- arXiv sources can surface the arXiv ID in the footer for supported modes.
- `-l`, `-m`, and `-i` now use a bundled local Tsanger JinKai font for stable `file://` screenshot rendering.
- `-v` sketchnote and `-c` comic keep their dedicated font systems.
- The skill replaces plain-text summarization with a designed visual deliverable.
