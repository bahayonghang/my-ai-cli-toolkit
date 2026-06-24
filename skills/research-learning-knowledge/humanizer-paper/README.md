# humanizer-paper

A register-aware **academic** language polisher for Claude Code and OpenCode. It
removes AI-writing tells from a draft **while keeping academic norms**, in two
modes: English journal articles (`en-journal`) and Chinese doctoral dissertations
(`zh-dissertation`).

This is not a generic "make it sound human" tool. The general-prose defaults of a
naive humanizer are *backwards* in academic writing — they delete legitimate
hedging, flatten section-appropriate passive voice, and synonym-cycle terminology
that a journal or 学位论文 requires to stay consistent. This skill re-gates the
analysis kernel for academic register and adds two norm packs plus a mechanical
linter.

## What it does

- **Re-gated AI-tell kernel.** The "Signs of AI writing" taxonomy is kept, but
  each tell is gated **keep / calibrate / disable** for academic register instead
  of applied blindly: hedging is *calibrated* not deleted, passive voice is
  *section-gated* (kept in Methods), em/en dashes follow venue style (en dashes
  kept in numeric ranges), and synonym cycling is *escalated* to a hard
  terminology-consistency rule.
- **Two norm packs.** `en-journal` (formal register, hedging calibration,
  section-gated passive, IMRaD/CARS, tense conventions, citation styles, dash and
  serial-comma rules, US/UK spelling) and `zh-dissertation` (学术语体, 术语/符号
  全文统一, GB/T 15834 标点, GB/T 15835 数字, 法定计量单位, 摘要/结论/标题/致谢
  规范, AIGC 量化特征自查).
- **New academic-specific tells.** Ghost citations ("studies show" / "研究表明"
  with no reference), hollow generalities (泛泛而谈), terminology drift, low
  burstiness / over-long sentences (Chinese mean > 28 字), and templated paragraph
  structure — the tells journal reviewers and Chinese AIGC detectors flag most.
- **Mechanical linter.** A bundled `scripts/polish_lint.py` reports the
  *quantifiable* tells the model tends to miss: dash/quote characters, AI
  high-frequency vocabulary, Chinese "几字+逗号" short clauses, sentence
  cadence/burstiness, over-long-sentence ratio, and optional glossary-driven
  terminology variants. It is a copilot that gives coordinates; it never rewrites,
  and its exit code is always 0.

## Integrity boundary

This skill polishes **the author's own draft** for clarity and norm compliance.
It is **not** a detector-evasion tool. The legitimate, transferable techniques
here apply only to text the author actually wrote. If a request is framed as
"rewrite this generated text so it passes Turnitin / 知网 AIGC", the skill refuses
that framing and redirects to improving real originality (add real data and
citations, deepen analysis, fix norms). Many institutions treat a high AIGC rate
as academic misconduct; this skill is not positioned as a way around that.

## Installation

### Claude Code

```bash
mkdir -p ~/.claude/skills
cp -r humanizer-paper ~/.claude/skills/humanizer-paper
```

### OpenCode

```bash
mkdir -p ~/.config/opencode/skills
cp -r humanizer-paper ~/.config/opencode/skills/humanizer-paper
```

> OpenCode also scans `~/.claude/skills/`, so a single copy into
> `~/.claude/skills/humanizer-paper/` is enough if you use both tools.

The skill is a directory: `SKILL.md` (the router and behavioral rules),
`references/` (the kernel and the two norm packs), and `scripts/polish_lint.py`
(the mechanical linter). Copy the whole folder, not just `SKILL.md`.

## Usage

Invoke the skill and paste or point at an academic draft:

```
/humanizer-paper

[paste a paper section, abstract, or 学位论文 paragraph]
```

The skill infers the target from the text's CJK ratio (a high count means
`zh-dissertation`, otherwise `en-journal`) and asks when the language is genuinely
ambiguous. You can pin it explicitly:

```
/humanizer-paper --target en-journal --section methods

[paste your Methods text]
```

Use `--check-only` to get the mechanical lint report and a list of tells without a
rewrite. To run the linter directly (its path is announced when the skill loads):

```bash
python "<skill-dir>/scripts/polish_lint.py" \
  --target zh-dissertation --file draft.md --json
```

Supply `--glossary canonical.txt` (lines of `canonical: variant1, variant2`) to
get real terminology-variant hits; without it, the linter only lists frequent
term-like tokens and honestly labels that as a non-semantic frequency heuristic.

## Structure

| Path | Role |
|------|------|
| `SKILL.md` | Router + behavioral hard rules (integrity boundary, target/section routing, core loop, output contract). |
| `references/ai-tells-academic.md` | The re-gated kernel: the 33-pattern taxonomy with keep/calibrate/disable gates and academic before/after, plus 5 new academic-specific tells. |
| `references/en-journal.md` | English journal norm pack. |
| `references/zh-dissertation.md` | Chinese dissertation norm pack. |
| `scripts/polish_lint.py` | Mechanical linter (pure stdlib, self-locating, `--target`/`--file`/`--glossary`/`--json`/`--save`). |
| `evals/evals.json` | Trigger and routing-negative cases. |
| `tests/` | Optional local `pytest` smoke (not wired into CI). |

## References

- [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) — the kernel taxonomy (re-gated here for academic register)
- [WikiProject AI Cleanup](https://en.wikipedia.org/wiki/Wikipedia:WikiProject_AI_Cleanup) — maintaining organization

## Version History

- **3.0.0** — **Scope change: generic prose → academic dual-mode.** Re-gated the
  33-pattern kernel for academic register (keep/calibrate/disable instead of
  blind application; hedging calibrated, passive section-gated, dashes by style,
  synonym cycling escalated to terminology consistency, citations supplied rather
  than deleted, conclusions structured rather than cut). Split the monolithic
  `SKILL.md` into a lean router plus `references/` (re-gated kernel + two norm
  packs: `en-journal`, `zh-dissertation`). Added 5 academic-specific tells (ghost
  citation, hollow generalities, terminology drift, low burstiness / over-long
  sentences, templated structure). Added `scripts/polish_lint.py`, a pure-stdlib
  mechanical linter for the quantifiable tells. Added an explicit integrity
  boundary (polish the author's own draft, not detector evasion). Renamed to
  `humanizer-paper`; added `category`/`tags`; removed the unsupported
  `compatibility` key. Generic non-academic prose is no longer in scope.
- **2.8.0** - Added style/cadence patterns #31-33 for manufactured punchlines, aphorism formulas, and conversational rhetorical openers; expanded #20 to catch offer-to-continue chatbot closers. 33 patterns total.
- **2.7.0** - Added pattern #30 (diff-anchored writing); made em/en dashes a hard cut rather than "overuse"; expanded #21 to cover speculative gap-filling ("maintains a low profile"). 30 patterns total.
- **2.6.0** - Cleanup pass: consolidated the duplicated workflow sections, gated the personality guidance to content where voice is wanted, removed the model-fingerprinting subsection, and condensed the worked example. No change to the 29 patterns.
- **2.5.1** - Added a passive-voice / subjectless-fragment rule, raising the total to 29 patterns
- **2.5.0** - Added patterns for persuasive framing, signposting, and fragmented headers; expanded negative parallelisms to cover tailing negations; tightened wording around em dash overuse; fixed frontmatter wording to use "filler phrases"
- **2.4.0** - Added voice calibration: match the user's personal writing style from samples
- **2.3.0** - Added pattern #25: hyphenated word pair overuse
- **2.2.0** - Added a final "obviously AI generated" audit + second-pass rewrite prompts
- **2.1.1** - Fixed pattern #18 example (curly quotes vs straight quotes)
- **2.1.0** - Added before/after examples for all 24 patterns
- **2.0.0** - Complete rewrite based on raw Wikipedia article content
- **1.0.0** - Initial release

## License

MIT
