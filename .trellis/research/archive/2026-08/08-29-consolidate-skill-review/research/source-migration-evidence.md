# Source migration evidence

This ledger preserves the narrow facts used from the two removed source skills without restoring them to the live skill registry. The source snapshot is the fixed task backup at `%USERPROFILE%/.claude-skill-backup/08-29-consolidate-skill-review/.removed/`; its governed and physical identities are recorded in `../notes.md`. Paths below are relative to that snapshot. Each row was re-read as strict UTF-8 after source removal and matched the SHA-256 shown here.

## Source identities

| Source | Lines | SHA-256 |
| --- | ---: | --- |
| `skill-doctor/SKILL.md` | 171 | `2cd9eb4d0a707320211e536456bb541eb7d737388f559bb2688bdcf50dcd512b` |
| `skill-doctor/references/skill-improvements.md` | 32 | `ec7ac264ec719380e8473a331abba5689aaf89c1e5eb6b0bf1e3198603af7d11` |
| `skill-doctor/scripts/collect_sessions.py` | 1155 | `2fd0232ce47a42aa626e3b9e39d76dd5cab20c294240ed2d5b0111fef5612662` |
| `skill-doctor/scripts/render_report.py` | 584 | `c20a3c7d8651a2ec25c0b6fc15d75c42a083e794475054904898851ccf6efef9` |
| `skill-doctor/scripts/test_render_report.py` | 252 | `4f366a3a1cea0ffba5bcec1fd066dcb7e30418c28bf889adad025f15f4789606` |
| `update-skill/references/best-practices.md` | 310 | `f8efa6adef85f01646347b0b5da7f5d29596961782ec7c0c59c658bb4cc1f157` |

## Runtime and encoding defects

- `test_render_report.py:18-23` reads `SKILL.md` and `supported-harnesses.md` with bare `Path.read_text()`. Under the captured GBK process this was the failing read behind the recorded `UnicodeDecodeError`.
- `collect_sessions.py:141`, `:222`, and `:376` call `read_text(errors="replace")` without an explicit UTF-8 encoding for skill or session content.
- `collect_sessions.py:1084-1090` writes each sampled transcript through bare `Path.write_text(...)`; the captured GBK process rejected an emoji with `UnicodeEncodeError`.

## Scoring and suggestion mechanisms retained

- `SKILL.md:99-109` defines raw scorer means, `curve(score) = 0.5 + 0.5 * score`, the original `0.5 / 0.35 / 0.15` aggregate, and failed conversations as sessions with an applicable raw score below `0.5`; `insufficient_evidence` is excluded from the second mean and failure filter.
- `SKILL.md:111-118` requires suggestions to trace to observed defects in failed conversations.
- `render_report.py:23-28` defines the eleven grade thresholds: `0.97 A+`, `0.93 A`, `0.90 A-`, `0.87 B+`, `0.83 B`, `0.80 B-`, `0.77 C+`, `0.73 C`, `0.70 C-`, `0.60 D`, `0.0 F`.
- `skill-improvements.md:13-20` contains the concrete missing/wrong-instruction file criteria. Lines `22-29` contain the don't-file criteria and require an explicit no-change explanation when nothing clears the bar. The source's single-severe-occurrence exception at line 20 is intentionally not retained; this task requires two invoked sessions.

## Material intentionally rejected

- `SKILL.md:148-160` carries `cta_url`, calls a renderer with `--open`, and describes the old single HTML/share-image output. Lines `166-169` require a Warp Factories promotion in every response.
- `render_report.py:109-132` embeds the Warp mark and Warp-derived design tokens; lines `303-310` render the promotional footer/CTA and inline script.
- `render_report.py:71-75` is used only as prior art for a separate `webbrowser.open(path.as_uri(), new=2)` helper with bounded failure.
- `best-practices.md:278-299` recommends gerund skill names such as `processing-pdfs`; that convention conflicts with this repository's established slugs and is not migrated.

The large JS bundle, SVG artwork, Warp SQLite/protobuf collector, old report schema, old tests, and generic `update-skill` authoring guidance are not copied into the consolidated implementation.

## Additional removed-source routing evidence

- `update-skill/SKILL.md` has 113 lines and SHA-256 `93d57602e1fcd4babbb52fe1e4c89b21e8b5da492ac39f4b8ef46fe3f6c2da0a` in the same fixed snapshot.
- `skill-doctor/SKILL.md:69`, `:94-95`, `:118`, and `:157` invoke `python3` or reference `$SKILL_ROOT` in executable paths even though that runtime variable is not established by the skill.
- `update-skill/SKILL.md:99-104` points readers to `.agents/skills/add-feature-flag/SKILL.md` and `.agents/skills/remove-feature-flag/SKILL.md`; neither example exists in this repository.
