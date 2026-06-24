---
name: humanizer-paper
description: >
  Register-aware academic language polisher for English journal articles and
  Chinese doctoral dissertations. Removes AI-writing tells while keeping academic
  norms: calibrates hedging instead of deleting it, preserves section-appropriate
  passive voice, enforces terminology consistency, and fixes ghost citations,
  hollow generalities, uniform sentence cadence, and templated structure. Dual
  mode, en-journal and zh-dissertation, selected by CJK ratio or asked when
  ambiguous. Use it whenever the user wants to polish, 降AI味, 润色, or norm-check
  an academic draft, paper section, abstract, or 学位论文 paragraph. Scope
  boundary: it polishes the author's own drafts for clarity and norm compliance,
  not for laundering generated text past Turnitin or 知网 AIGC detection.
category: research-learning-knowledge
tags:
  [
    academic-writing,
    humanizer,
    ai-tells,
    journal,
    dissertation,
    zh,
    en,
    polishing,
  ]
version: "3.0.0"
argument-hint: "[text-or-file] [--target en-journal|zh-dissertation] [--section abstract|intro|methods|results|discussion|conclusion] [--style STYLE] [--check-only]"
license: MIT
allowed-tools: Read, Write, Edit, Grep, Glob, AskUserQuestion, Bash(python *)
---

# Humanizer (Academic): register-aware AI-tell removal

Polish an academic draft so it reads like a careful human author **and** conforms
to its register's norms. Two modes: English journal articles (`en-journal`) and
Chinese doctoral dissertations (`zh-dissertation`).

The analysis kernel is the "Signs of AI writing" taxonomy from
[Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)
(WikiProject AI Cleanup), **re-gated** for academic register: several general-prose
defaults are backwards in a journal or dissertation, so each tell is kept,
calibrated, or disabled rather than applied blindly. The heavy content lives in
`references/`; this file is the router and the behavioral rules.

> In the `python` command below, `<skill-dir>` is this skill's base directory,
> announced when the skill loads. Substitute that literal path; it is not an
> environment variable. The bundled script self-locates, so only the path needs
> to resolve.

## 诚信边界 (behavioral hard rule)

This skill polishes **the author's own draft** for clarity and for compliance
with academic norms. It is **not** a detector-evasion tool.

- The legitimate, transferable techniques here — varying cadence, calibrating
  hedging, tightening argumentation, enforcing terminology consistency,
  protecting citations — apply only to text the author actually wrote or
  substantively authored.
- If the request is framed as "rewrite this generated text so it passes Turnitin
  / 知网 AIGC / an AI detector", **refuse that framing**. Redirect to the
  legitimate goal: improving real originality (add real data and citations,
  deepen analysis, fix norms). High AIGC rate is treated by many institutions as
  academic misconduct; do not position this skill as a way around that.

## When to use

- Polish an English journal/conference manuscript or section to remove AI tells
  while keeping formal register, hedging, and section-appropriate passive.
- Polish a Chinese 学位论文 (摘要/引言/方法/结果/讨论/结论/致谢) for AI tells **and**
  GB punctuation, terminology unification, and AIGC quantitative self-check.
- Norm-check a draft (`--check-only`) and report mechanical tells without rewriting.

## When NOT to use

- **Generic / non-academic prose** (blog posts, essays, marketing). This skill's
  defaults are tuned for academic register; for general "make it sound human" use
  an upstream generic humanizer, not this one.
- **Paper intake, reading, synthesis, or literature review** (skim, deep-read,
  card, compare, gap map, review outline, normalize a DOI/arXiv source). That is
  `paper-workbench`, not this skill. This skill edits _language_; `paper-workbench`
  analyzes _content_.
- **Implementing a paper's method into code.** Out of scope.

## Routing

### 1. Target (which norm pack)

- If `--target` is given, use it.
- Otherwise infer from the text's CJK ratio: a high count of CJK characters
  (roughly > 2% of characters, like `infer_language` in
  `paper-workbench/scripts/normalize_paper.py`) means `zh-dissertation`; otherwise
  `en-journal`.
- If the language is genuinely ambiguous (mixed-language, very short), use
  `AskUserQuestion` to pick `en-journal` vs `zh-dissertation`. Do not guess silently.

### 2. Section (which gates)

- Infer the section from headings or structure: abstract, introduction, methods,
  results, discussion, conclusion. `--section` overrides.
- Section drives the calibrated tells (most importantly passive voice: keep in
  Methods, may activate in Discussion). If undeterminable, treat as "general
  academic body".

## Core loop

1. **Classify.** Read the input. Resolve target and section (Routing above).
   Identify each AI tell using `references/ai-tells-academic.md`, applying its
   keep / calibrate / disable gate — do **not** apply general-prose defaults blindly.
2. **Load the norm pack.** Read `references/en-journal.md` or
   `references/zh-dissertation.md` for the active target. It decides per-section
   behavior and adds register-specific norms.
3. **Register-aware draft.** Rewrite to remove the tells while obeying the norm
   pack. Cover everything the original covers (same number of paragraphs/claims).
   Calibrate hedging (do not delete it), keep section-appropriate passive, unify
   terminology, fix ghost citations by supplying real `(author, year)` / `[n]` or
   lowering claim strength, replace hollow generalities with specific
   data/method/citation, and vary sentence cadence.
4. **Mechanical lint.** Run the script (below) for the quantifiable tells the model
   tends to miss (dash/quote characters, sentence-length and burstiness stats,
   "首先/综上" comma-clauses, optional terminology variants). The script is a
   copilot: it gives coordinates; it does **not** rewrite.
5. **"Still-AI" audit.** Ask: _what still reads as AI-generated here?_ List the
   remaining tells briefly (uniform cadence, residual ghost citations, templated
   paragraphs, over-stacked hedges).
6. **Final.** Revise to address the audit and the lint hits. In `zh-dissertation`,
   conform punctuation to GB and keep full-text terminology consistent; in
   `en-journal`, keep tense and citation style consistent per the norm pack.

## Mechanical check

Run the linter for quantifiable tells (planned entry; if the script is not yet
present, do the mechanical scan by hand from the same checklist):

```bash
python "<skill-dir>/scripts/polish_lint.py" \
  --target "<en-journal|zh-dissertation>" \
  --file "<path-or-omit-to-read-stdin>" \
  --json
```

The linter reports surface tells (em/en dash, curly quotes, AI high-frequency
words, Chinese "几字+逗号" short clauses), cadence stats (sentence count, mean
length, burstiness, over-long ratio with the zh > 28 字 threshold), and optional
terminology variants when a `--glossary` is supplied. It is a reporter (exit code
always 0); the rewrite stays with the model, guided by `references/`.

## Output contract

Deliver, in order:

1. **Draft rewrite** — register-correct, all covered content preserved.
2. **"Still-AI" audit** — brief bullets of remaining tells.
3. **Final rewrite** — addresses the audit and the lint hits.
4. **Change summary** — what was changed and why (and, optionally, the lint report).

For `--check-only`, skip the rewrite: return the lint report plus a short list of
the tells found, by gate, with no edited text.

## References

- `references/ai-tells-academic.md` — the re-gated 33-pattern kernel (keep /
  calibrate / disable) plus 5 new academic-specific tells, with academic before/after.
- `references/en-journal.md` — English journal norm pack (register, hedging,
  section-gated passive, IMRaD/CARS, tense, citation styles, dash/comma, spelling).
- `references/zh-dissertation.md` — Chinese dissertation norm pack (语体, 术语统一,
  GB/T 15834 标点, GB/T 15835 数字, 法定计量单位, 摘要/结论/标题/致谢, AIGC 量化特征).

## Attribution

The pattern taxonomy is from
[Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing),
maintained by WikiProject AI Cleanup. This skill (MIT) re-gates that taxonomy for
academic register and adds two norm packs and a mechanical linter.
